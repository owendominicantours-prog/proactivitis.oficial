"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/context/LanguageProvider";

const DEFAULT_ROUND_TRIP_DISCOUNT = 5;
const ROUND_TRIP_DISCOUNT_PERCENT = (() => {
  const value = Number(
    process.env.NEXT_PUBLIC_ROUND_TRIP_DISCOUNT_PERCENT ??
      process.env.ROUND_TRIP_DISCOUNT_PERCENT ??
      DEFAULT_ROUND_TRIP_DISCOUNT
  );
  if (Number.isNaN(value)) return DEFAULT_ROUND_TRIP_DISCOUNT;
  return Math.min(100, Math.max(0, value));
})();

const LOCATION_DEBOUNCE_MS = 350;
const TRANSFER_FORM_PATH = "/checkout";
const TRUST_BULLETS = [
  "transfer.search.trust.finalPrice",
  "transfer.search.trust.professionalDrivers",
  "transfer.search.trust.insuranceIncluded",
  "transfer.search.trust.freeCancellation"
] as const;

type LocationSummary = {
  id: string;
  name: string;
  slug: string;
  type: string;
  zoneName: string | null;
};

type QuoteVehicle = {
  id: string;
  name: string;
  category: string;
  minPax: number;
  maxPax: number;
  price: number;
  imageUrl?: string | null;
};

export default function TrasladoSearchV2() {
  const { t } = useTranslation();
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [originOptions, setOriginOptions] = useState<LocationSummary[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<LocationSummary[]>([]);
  const [originLoading, setOriginLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<LocationSummary | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<LocationSummary | null>(null);
  const [passengers, setPassengers] = useState(2);
  const [passengersInput, setPassengersInput] = useState("2");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [returnFlightNumber, setReturnFlightNumber] = useState("");
  const [quote, setQuote] = useState<QuoteVehicle[]>([]);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const originRef = useRef<HTMLDivElement | null>(null);
  const destinationRef = useRef<HTMLDivElement | null>(null);
  const quoteRef = useRef<HTMLElement | null>(null);
  const searchPanelRef = useRef<HTMLDivElement | null>(null);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [exitModalDismissed, setExitModalDismissed] = useState(false);
  const [pendingExitHref, setPendingExitHref] = useState<string | null>(null);

  const isRoundTrip = tripType === "round-trip";
  const roundTripMultiplier = isRoundTrip
    ? 2 * (1 - ROUND_TRIP_DISCOUNT_PERCENT / 100)
    : 1;
  const normalizedDiscountPercent = Math.round(ROUND_TRIP_DISCOUNT_PERCENT);

  const handleTripTypeChange = (type: "one-way" | "round-trip") => {
    setTripType(type);
    if (type === "one-way") {
      setReturnDate("");
      setReturnTime("");
      setReturnFlightNumber("");
    }
  };

  const fetchLocations = useCallback(async (query: string, setter: (items: LocationSummary[]) => void) => {
    if (!query.trim()) {
      setter([]);
      return;
    }
    try {
      const response = await fetch(`/api/transfers/v2/locations?query=${encodeURIComponent(query.trim())}`);
      if (!response.ok) {
        setter([]);
        return;
      }
      const data = await response.json();
      setter(data.locations ?? []);
    } catch {
      setter([]);
    }
  }, []);

  const scheduleLocationFetch = useCallback(
    (
      value: string,
      setter: (items: LocationSummary[]) => void,
      setLoading: (value: boolean) => void,
      setOpen: (value: boolean) => void,
      timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
    ) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (!value.trim()) {
        setter([]);
        setLoading(false);
        setOpen(false);
        return;
      }
      setLoading(true);
      setOpen(true);
      timeoutRef.current = setTimeout(async () => {
        await fetchLocations(value, setter);
        setLoading(false);
      }, LOCATION_DEBOUNCE_MS);
    },
    [fetchLocations]
  );

  const closeOnClickOutside = useCallback(() => {
    const handleClick = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setOriginOpen(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setDestinationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    return closeOnClickOutside();
  }, [closeOnClickOutside]);

  const handleOriginChange = (value: string) => {
    setOriginQuery(value);
    setSelectedOrigin(null);
    scheduleLocationFetch(value, setOriginOptions, setOriginLoading, setOriginOpen, originTimeoutRef);
  };

  const handleDestinationChange = (value: string) => {
    setDestinationQuery(value);
    setSelectedDestination(null);
    scheduleLocationFetch(
      value,
      setDestinationOptions,
      setDestinationLoading,
      setDestinationOpen,
      destinationTimeoutRef
    );
  };

  const handleQuote = async () => {
    const normalizedPassengers = Math.max(1, Number(passengersInput || passengers));
    if (normalizedPassengers !== passengers) {
      setPassengers(normalizedPassengers);
    }
    setPassengersInput(String(normalizedPassengers));

    if (!selectedOrigin || !selectedDestination) {
      setQuoteError(t("transfer.search.error.originDestination"));
      return;
    }
    if (isRoundTrip && (!returnDate || !returnTime)) {
      setQuoteError(t("transfer.search.error.roundTripDate"));
      return;
    }
    setQuoteLoading(true);
    setQuoteError(null);
    const payload: Record<string, unknown> = {
      origin_location_id: selectedOrigin.id,
      destination_location_id: selectedDestination.id,
      passengers: normalizedPassengers,
      trip_type: tripType
    };
    if (returnDate && returnTime) {
      payload.return_datetime = `${returnDate}T${returnTime}`;
    }
    try {
      const response = await fetch("/api/transfers/v2/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? t("transfer.search.error.quoteFailed"));
      }
      const data = await response.json();
      setQuote(data.vehicles ?? []);
      setExitModalDismissed(false);
      setPendingExitHref(null);
    } catch (error) {
      setQuote([]);
      const fallbackMessage =
        error instanceof Error ? error.message : t("transfer.search.error.unknown");
      setQuoteError(fallbackMessage);
    } finally {
      setQuoteLoading(false);
    }
  };

  const originDisplay = useMemo(() => selectedOrigin?.name ?? originQuery, [selectedOrigin, originQuery]);
  const destinationDisplay = useMemo(
    () => selectedDestination?.name ?? destinationQuery,
    [selectedDestination, destinationQuery]
  );

  const parseDatetimeParam = (date: string, time: string) => (date && time ? `${date}T${time}` : undefined);
  const departureDatetime = useMemo(() => parseDatetimeParam(departureDate, departureTime), [
    departureDate,
    departureTime
  ]);
  const returnDatetime = useMemo(() => parseDatetimeParam(returnDate, returnTime), [returnDate, returnTime]);

  const recommendedVehicleId = useMemo(() => {
    const sortedByPrice = [...quote].sort((a, b) => a.price - b.price);
    return sortedByPrice[0]?.id ?? null;
  }, [quote]);

  useEffect(() => {
    if (!quote.length) {
      setSelectedVehicleId(null);
      return;
    }
    if (!selectedVehicleId || !quote.some((vehicle) => vehicle.id === selectedVehicleId)) {
      setSelectedVehicleId(recommendedVehicleId);
    }
  }, [quote, recommendedVehicleId, selectedVehicleId]);

  useEffect(() => {
    if (quote.length) {
      quoteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [quote.length]);

  const getDisplayPrice = useCallback(
    (vehicle: QuoteVehicle) => Number((vehicle.price * roundTripMultiplier).toFixed(2)),
    [roundTripMultiplier]
  );

  const selectedVehicle = useMemo(
    () => quote.find((vehicle) => vehicle.id === selectedVehicleId) ?? quote[0] ?? null,
    [quote, selectedVehicleId]
  );

  const selectedVehiclePrice = selectedVehicle ? getDisplayPrice(selectedVehicle) : null;

  const buildReserveLink = (vehicle: QuoteVehicle, price: number) => {
    if (!selectedOrigin || !selectedDestination) {
      return TRANSFER_FORM_PATH;
    }
    const params = new URLSearchParams();
    params.set("type", "transfer");
    params.set("hotelSlug", selectedDestination.slug);
    params.set("origin", selectedOrigin.slug);
    params.set("originLabel", selectedOrigin.name);
    params.set("originHotelName", selectedDestination.name);
    params.set("tourTitle", `Transfer privado Proactivitis - ${vehicle.name}`);
    params.set("tourImage", vehicle.imageUrl || "/transfer/sedan.png");
    params.set("vehicleId", vehicle.id);
    params.set("vehicleName", vehicle.name);
    params.set("vehicleCategory", vehicle.category);
    params.set("tourPrice", (price / Math.max(1, passengers)).toFixed(2));
    params.set("totalPrice", price.toFixed(2));
    params.set("adults", String(passengers));
    params.set("youth", "0");
    params.set("child", "0");
    if (tripType === "round-trip") {
      params.set("tripType", "round-trip");
      params.set("trip", "round_trip");
    } else {
      params.set("tripType", "one-way");
    }
    if (departureDate) {
      params.set("date", departureDate);
    }
    if (departureTime) {
      params.set("time", departureTime);
    }
    if (departureDatetime) {
      params.set("dateTime", departureDatetime);
    }
    if (returnDatetime) {
      params.set("returnDatetime", returnDatetime);
    }
    if (returnFlightNumber.trim()) {
      params.set("returnFlightNumber", returnFlightNumber.trim().toUpperCase());
      params.set("specialRequirements", `Vuelo de regreso: ${returnFlightNumber.trim().toUpperCase()}`);
    }
    return `${TRANSFER_FORM_PATH}?${params.toString()}`;
  };

  const canContinue =
    Boolean(selectedVehicle && selectedVehiclePrice != null) &&
    (!isRoundTrip || Boolean(returnDate && returnTime));
  const selectedReserveUrl =
    selectedVehicle && selectedVehiclePrice != null
      ? buildReserveLink(selectedVehicle, selectedVehiclePrice)
      : TRANSFER_FORM_PATH;
  const shouldProtectExit = Boolean(quote.length && selectedVehicle && !exitModalDismissed);

  useEffect(() => {
    if (!shouldProtectExit || exitModalOpen) return;
    const handleExitIntent = (event: MouseEvent) => {
      if (event.clientY <= 0 && !event.relatedTarget) {
        setExitModalOpen(true);
      }
    };
    document.addEventListener("mouseout", handleExitIntent);
    return () => document.removeEventListener("mouseout", handleExitIntent);
  }, [exitModalOpen, shouldProtectExit]);

  useEffect(() => {
    if (!shouldProtectExit) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldProtectExit]);

  useEffect(() => {
    if (!shouldProtectExit) return;
    const handleDocumentClick = (event: MouseEvent) => {
      if (exitModalOpen || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.includes("/checkout")) return;
      if (anchor.target && anchor.target !== "_self") return;
      event.preventDefault();
      event.stopPropagation();
      setPendingExitHref(anchor.href);
      setExitModalOpen(true);
    };
    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [exitModalOpen, shouldProtectExit]);

  const handleContinueReservation = () => {
    setExitModalDismissed(true);
    setPendingExitHref(null);
    setExitModalOpen(false);
    if (canContinue) {
      window.location.href = selectedReserveUrl;
      return;
    }
    quoteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleEditReservation = () => {
    setExitModalDismissed(true);
    setPendingExitHref(null);
    setExitModalOpen(false);
    searchPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleLeavePage = () => {
    setExitModalDismissed(true);
    setExitModalOpen(false);
    const href = pendingExitHref;
    setPendingExitHref(null);
    if (href) {
      window.location.href = href;
    }
  };

  return (
    <div className="space-y-8">
      <div ref={searchPanelRef} className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-2xl">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_380px]">
          <div className="space-y-5 p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleTripTypeChange("one-way")}
                className={`rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] transition ${
                  tripType === "one-way"
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {t("transfer.search.tripType.oneWay")}
              </button>
              <button
                type="button"
                onClick={() => handleTripTypeChange("round-trip")}
                className={`rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] transition ${
                  tripType === "round-trip"
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {t("transfer.search.tripType.roundTrip")}
              </button>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                {t("transfer.search.tripType.roundTripDiscount", {
                  discount: normalizedDiscountPercent
                })}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_150px]">
              <div className="relative" ref={originRef}>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {t("transfer.search.field.origin")}
                </label>
                <div className="relative mt-2">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition focus:border-emerald-500 focus:bg-white focus:outline-none"
                    value={originDisplay}
                    onChange={(event) => handleOriginChange(event.target.value)}
                    onFocus={() => setOriginOpen(true)}
                    placeholder={t("transfer.search.placeholder.originExample")}
                  />
                  {originLoading && (
                    <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center">
                      <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                    </div>
                  )}
                </div>
                {originOpen && originOptions.length > 0 && !selectedOrigin && (
                  <div className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                    {originOptions.map((location) => (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() => {
                          setSelectedOrigin(location);
                          setOriginQuery(location.name);
                          setOriginOpen(false);
                        }}
                        className="w-full border-b border-slate-100 px-4 py-2.5 text-left transition last:border-0 hover:bg-sky-50/70"
                      >
                        <div className="space-y-0.5">
                          <span className="block text-sm font-semibold leading-5 text-slate-950">{location.name}</span>
                          <span className="block text-xs leading-4 text-slate-500">
                            {location.zoneName ?? location.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={destinationRef}>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {t("transfer.search.field.destination")}
                </label>
                <div className="relative mt-2">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition focus:border-emerald-500 focus:bg-white focus:outline-none"
                    value={destinationDisplay}
                    onChange={(event) => handleDestinationChange(event.target.value)}
                    onFocus={() => setDestinationOpen(true)}
                    placeholder={t("transfer.search.placeholder.destinationExample")}
                  />
                  {destinationLoading && (
                    <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center">
                      <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                    </div>
                  )}
                </div>
                {destinationOpen && destinationOptions.length > 0 && !selectedDestination && (
                  <div className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                    {destinationOptions.map((location) => (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() => {
                          setSelectedDestination(location);
                          setDestinationQuery(location.name);
                          setDestinationOpen(false);
                        }}
                        className="w-full border-b border-slate-100 px-4 py-2.5 text-left transition last:border-0 hover:bg-sky-50/70"
                      >
                        <div className="space-y-0.5">
                          <span className="block text-sm font-semibold leading-5 text-slate-950">{location.name}</span>
                          <span className="block text-xs leading-4 text-slate-500">
                            {location.zoneName ?? location.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {t("transfer.search.field.passengers")}
                <input
                  type="number"
                  min={1}
                  value={passengersInput}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "") {
                      setPassengersInput("");
                      return;
                    }
                    if (!/^\d+$/.test(value)) return;
                    setPassengersInput(value);
                    setPassengers(Math.max(1, Number(value)));
                  }}
                  onBlur={() => {
                    const normalizedPassengers = Math.max(1, Number(passengersInput || passengers));
                    setPassengers(normalizedPassengers);
                    setPassengersInput(String(normalizedPassengers));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {t("transfer.search.field.pickupDate")}
                <input
                  type="date"
                  value={departureDate}
                  onChange={(event) => setDepartureDate(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {t("transfer.search.field.pickupTime")}
                <input
                  type="time"
                  value={departureTime}
                  onChange={(event) => setDepartureTime(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                />
              </label>
            </div>

            {isRoundTrip && !quote.length && (
              <div className="rounded-[26px] border border-amber-200 bg-amber-50/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-700">
                      {t("transfer.search.return.title")}
                    </p>
                    <p className="text-sm text-amber-900">{t("transfer.search.return.body")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTripTypeChange("one-way")}
                    className="rounded-full border border-amber-300 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800"
                  >
                    {t("transfer.search.return.remove")}
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    {t("transfer.search.field.returnDate")}
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(event) => setReturnDate(event.target.value)}
                      className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    {t("transfer.search.field.returnTime")}
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(event) => setReturnTime(event.target.value)}
                      className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm"
                    />
                  </label>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleQuote}
              className="w-full rounded-2xl bg-slate-950 px-4 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
            >
              {quoteLoading ? t("transfer.search.action.loading") : t("transfer.search.action.search")}
            </button>

            {quoteError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
                {quoteError}
              </div>
            )}
          </div>

          <aside className="border-t border-slate-100 bg-slate-50 p-5 lg:border-l lg:border-t-0 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              {t("transfer.search.summary.title")}
            </p>
            <div className="mt-5 space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative space-y-4 pl-6">
                  <span className="absolute bottom-4 left-[7px] top-4 w-px bg-slate-200" />
                  <div className="relative">
                    <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-slate-950" />
                    <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                      {t("transfer.search.field.origin")}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {(selectedOrigin?.name ?? originQuery) || t("transfer.search.placeholder.originExample")}
                    </p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-amber-400" />
                    <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                      {t("transfer.search.field.destination")}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {(selectedDestination?.name ?? destinationQuery) || t("transfer.search.placeholder.destinationExample")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                    {t("transfer.search.summary.trip")}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {isRoundTrip ? t("transfer.search.tripType.roundTrip") : t("transfer.search.tripType.oneWay")}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                    {t("transfer.search.field.passengers")}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{passengers}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-[24px] border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                {TRUST_BULLETS.map((bullet) => (
                  <p key={bullet} className="flex items-center gap-2 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    {t(bullet)}
                  </p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <section ref={quoteRef} className="space-y-6">
        {quote.length ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                      {t("transfer.search.routePreview")}
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">
                      {selectedOrigin?.name} {" -> "} {selectedDestination?.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {departureDate || t("transfer.search.status.pendingDate")}
                      {departureTime ? `, ${departureTime}` : ""} {" - "} {passengers}{" "}
                      {t("transfer.search.field.passengers").toLowerCase()}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700">
                    {t("transfer.search.priceIncludes")}
                  </div>
                </div>
              </div>

              {!isRoundTrip && (
                <div className="rounded-[30px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                        {t("transfer.search.returnUpsell.title")}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-amber-950">
                        {t("transfer.search.returnUpsell.body")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTripTypeChange("round-trip")}
                      className="rounded-2xl border border-amber-300 bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-900 shadow-sm transition hover:bg-amber-100"
                    >
                      {t("transfer.search.returnUpsell.action")}
                    </button>
                  </div>
                </div>
              )}

              {isRoundTrip && (
                <div className="rounded-[30px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
                    <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-800">
                      {t("transfer.search.field.returnDate")}
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(event) => setReturnDate(event.target.value)}
                        className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900"
                      />
                    </label>
                    <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-800">
                      {t("transfer.search.field.returnTime")}
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(event) => setReturnTime(event.target.value)}
                        className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900"
                      />
                    </label>
                    <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-800">
                      {t("transfer.search.return.flight")}
                      <input
                        type="text"
                        value={returnFlightNumber}
                        onChange={(event) => setReturnFlightNumber(event.target.value.toUpperCase())}
                        placeholder="AA123"
                        className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleTripTypeChange("one-way")}
                      className="rounded-2xl border border-amber-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-amber-900 transition hover:bg-amber-100"
                    >
                      {t("transfer.search.return.remove")}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {quote.map((vehicle) => {
                  const displayPrice = getDisplayPrice(vehicle);
                  const isRecommended = vehicle.id === recommendedVehicleId;
                  const isSelected = vehicle.id === selectedVehicle?.id;
                  return (
                    <article
                      key={vehicle.id}
                      className={`grid gap-4 rounded-[30px] border bg-white p-4 shadow-sm transition md:grid-cols-[180px_1fr_auto] md:items-center ${
                        isSelected
                          ? "border-slate-950 ring-2 ring-slate-950/10"
                          : "border-slate-200 hover:border-slate-400 hover:shadow-lg"
                      }`}
                    >
                      <div
                        className="aspect-[16/10] rounded-[22px] border border-slate-100 bg-white bg-contain bg-center bg-no-repeat md:aspect-[4/3]"
                        style={{ backgroundImage: `url(${vehicle.imageUrl || "/transfer/sedan.png"})` }}
                        role="img"
                        aria-label={vehicle.name}
                      />
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-2xl font-black leading-tight text-slate-950">{vehicle.name}</h3>
                          {isRecommended && (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                              {t("transfer.search.vehicle.badge.mostPopular")}
                            </span>
                          )}
                          {isSelected && (
                            <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                              {t("transfer.search.vehicle.selected")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-600">
                          {t("transfer.search.vehicle.capacityRange", {
                            min: vehicle.minPax,
                            max: vehicle.maxPax
                          })}
                        </p>
                        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
                          <span className="rounded-full bg-slate-100 px-3 py-1">{vehicle.category}</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            {t("transfer.search.doorToDoor")}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            {t("transfer.search.flightTracking")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 md:block md:text-right">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                            {isRoundTrip
                              ? t("transfer.search.vehicle.priceLabel.roundTrip")
                              : t("transfer.search.vehicle.priceLabel.oneWay")}
                          </p>
                          <div className="flex items-baseline gap-1 md:justify-end">
                            <span className="text-3xl font-black text-emerald-700">
                              ${displayPrice.toFixed(2)}
                            </span>
                            <span className="text-sm font-semibold text-slate-500">USD</span>
                          </div>
                          {isRoundTrip && (
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                              {t("transfer.search.vehicle.roundTripSavings", {
                                discount: normalizedDiscountPercent
                              })}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedVehicleId(vehicle.id)}
                          className={`mt-0 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] transition md:mt-3 ${
                            isSelected
                              ? "bg-slate-950 text-white"
                              : "border border-slate-300 bg-white text-slate-900 hover:border-slate-950"
                          }`}
                        >
                          {isSelected ? t("transfer.search.vehicle.selected") : t("transfer.search.chooseVehicle")}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                  {t("transfer.search.summary.title")}
                </p>
                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <p className="text-slate-500">{t("transfer.search.summary.route")}</p>
                    <p className="font-bold text-slate-950">
                      {selectedOrigin?.name} {" -> "} {selectedDestination?.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                        {t("transfer.search.summary.trip")}
                      </p>
                      <p className="font-semibold text-slate-900">
                        {isRoundTrip ? t("transfer.search.tripType.roundTrip") : t("transfer.search.tripType.oneWay")}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                        {t("transfer.search.field.passengers")}
                      </p>
                      <p className="font-semibold text-slate-900">{passengers}</p>
                    </div>
                  </div>
                  {selectedVehicle && (
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                        {t("transfer.search.summary.vehicle")}
                      </p>
                      <p className="mt-1 font-bold text-slate-950">{selectedVehicle.name}</p>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                        {t("transfer.search.summary.total")}
                      </p>
                      <p className="text-3xl font-black text-emerald-700">
                        {selectedVehiclePrice != null ? `$${selectedVehiclePrice.toFixed(2)}` : "--"}
                      </p>
                    </div>
                    {isRoundTrip && (!returnDate || !returnTime) && (
                      <p className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                        {t("transfer.search.return.missing")}
                      </p>
                    )}
                  </div>
                  {canContinue ? (
                    <Link
                      href={selectedReserveUrl}
                      className="flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold uppercase tracking-[0.25em] text-white transition hover:bg-slate-800"
                    >
                      {t("transfer.search.summary.continue")}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-2xl bg-slate-200 px-5 py-4 text-sm font-bold uppercase tracking-[0.25em] text-slate-500"
                    >
                      {t("transfer.search.summary.continue")}
                    </button>
                  )}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
            {quoteError
              ? t("transfer.search.noVehicles.adjustRoute")
              : t("transfer.search.noVehicles.selectDetails")}
          </div>
        )}
      </section>
      {exitModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-exit-title"
        >
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
            <h3 id="transfer-exit-title" className="text-xl font-black text-slate-950">
              {t("transfer.search.exit.title")}
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              {t("transfer.search.exit.body")}
            </p>

            <div className="mt-5 grid gap-3 text-left text-sm text-slate-700 sm:grid-cols-2">
              {[
                "transfer.search.exit.benefit.licensed",
                "transfer.search.exit.benefit.cancellation",
                "transfer.search.exit.benefit.price",
                "transfer.search.exit.benefit.support"
              ].map((key) => (
                <p key={key} className="flex items-center gap-2 font-semibold">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                  {t(key as Parameters<typeof t>[0])}
                </p>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">{t("transfer.search.exit.warning")}</p>
              <p className="mt-1 text-xs">{t("transfer.search.exit.secureToday")}</p>
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={handleContinueReservation}
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                {t("transfer.search.exit.continue")}
              </button>
              <button
                type="button"
                onClick={handleEditReservation}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {t("transfer.search.exit.edit")}
              </button>
              <button
                type="button"
                onClick={handleLeavePage}
                className="text-sm font-semibold text-slate-400 transition hover:text-slate-600"
              >
                {t("transfer.search.exit.leave")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
