"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/context/LanguageProvider";
import { SITE_CONFIG } from "@/lib/site-config";

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
  const isFunjet = SITE_CONFIG.variant === "funjet";
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
  const [quote, setQuote] = useState<QuoteVehicle[]>([]);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const originRef = useRef<HTMLDivElement | null>(null);
  const destinationRef = useRef<HTMLDivElement | null>(null);

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
    const van = quote.find((vehicle) => vehicle.category === "VAN");
    return van?.id ?? quote[0]?.id ?? null;
  }, [quote]);

  const buildReserveLink = (vehicle: QuoteVehicle, price: number) => {
    if (!selectedOrigin || !selectedDestination) {
      return TRANSFER_FORM_PATH;
    }
    const params = new URLSearchParams();
    params.set("type", "transfer");
    params.set("hotelSlug", selectedDestination.slug);
    params.set("origin", selectedOrigin.slug);
    params.set("originLabel", selectedOrigin.name);
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
    return `${TRANSFER_FORM_PATH}?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div
        className={`space-y-4 p-6 shadow-lg ${
          isFunjet
            ? "rounded-[34px] border border-[#E7D2FB] bg-[linear-gradient(145deg,#ffffff_0%,#faf1ff_52%,#fff8de_100%)]"
            : "rounded-3xl border border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleTripTypeChange("one-way")}
            className={`rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] transition ${
              tripType === "one-way"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-400"
            }`}
          >
            {t("transfer.search.tripType.oneWay")}
          </button>
          <button
            type="button"
            onClick={() => handleTripTypeChange("round-trip")}
            className={`rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] transition ${
              tripType === "round-trip"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-400"
            }`}
          >
            {t("transfer.search.tripType.roundTrip")}
          </button>
          <span className={`text-xs ${isFunjet ? "text-[#6B4D82]" : "text-slate-500"}`}>
            {t("transfer.search.tripType.roundTripDiscount", {
              discount: normalizedDiscountPercent
            })}
          </span>
        </div>

        {isFunjet ? (
          <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[26px] bg-[#6A0DAD] px-5 py-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">Funjet route builder</p>
              <p className="mt-2 text-2xl font-bold">Origen, destino y horario en una sola pieza visual.</p>
            </div>
            <div className="rounded-[26px] bg-[#FFF2BF] px-5 py-5 text-[#4D0A7D]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] opacity-70">Direct booking</p>
              <p className="mt-2 text-sm font-semibold">Busca la ruta, mira las unidades y reserva sin paneles intermedios.</p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative" ref={originRef}>
            <label className={`text-xs font-semibold uppercase tracking-[0.3em] ${isFunjet ? "text-[#6A0DAD]" : "text-slate-500"}`}>
              {isFunjet ? "Pick up" : t("transfer.search.field.origin")}
            </label>
            <div className="relative">
              <input
                className={`w-full px-4 py-3 text-sm transition ${
                  isFunjet
                    ? "rounded-[22px] border border-[#E6D2FB] bg-white text-[#34114A] focus:border-[#6A0DAD]"
                    : "rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-emerald-500"
                }`}
                value={originDisplay}
                onChange={(event) => handleOriginChange(event.target.value)}
                onFocus={() => setOriginOpen(true)}
                placeholder={isFunjet ? "Airport, hotel o zona de salida" : t("transfer.search.placeholder.originExample")}
              />
              {originLoading && (
                <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                </div>
              )}
            </div>
            {originOpen && originOptions.length > 0 && !selectedOrigin && (
              <div className="absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                {originOptions.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      setSelectedOrigin(location);
                      setOriginQuery(location.name);
                      setOriginOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{location.name}</span>
                      <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        {location.zoneName ?? location.type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={destinationRef}>
            <label className={`text-xs font-semibold uppercase tracking-[0.3em] ${isFunjet ? "text-[#6A0DAD]" : "text-slate-500"}`}>
              {isFunjet ? "Drop off" : t("transfer.search.field.destination")}
            </label>
            <div className="relative">
              <input
                className={`w-full px-4 py-3 text-sm transition ${
                  isFunjet
                    ? "rounded-[22px] border border-[#E6D2FB] bg-white text-[#34114A] focus:border-[#6A0DAD]"
                    : "rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-emerald-500"
                }`}
                value={destinationDisplay}
                onChange={(event) => handleDestinationChange(event.target.value)}
                onFocus={() => setDestinationOpen(true)}
                placeholder={isFunjet ? "Hotel, villa o resort de llegada" : t("transfer.search.placeholder.destinationExample")}
              />
              {destinationLoading && (
                <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                </div>
              )}
            </div>
            {destinationOpen && destinationOptions.length > 0 && !selectedDestination && (
              <div className="absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                {destinationOptions.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      setSelectedDestination(location);
                      setDestinationQuery(location.name);
                      setDestinationOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{location.name}</span>
                      <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        {location.zoneName ?? location.type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-semibold uppercase tracking-[0.3em] ${isFunjet ? "text-[#6A0DAD]" : "text-slate-500"}`}>
              {isFunjet ? "Travelers" : t("transfer.search.field.passengers")}
            </label>
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
              className={`w-full px-4 py-3 text-sm ${
                isFunjet
                  ? "rounded-[22px] border border-[#E6D2FB] bg-white text-[#34114A]"
                  : "rounded-2xl border border-slate-200 bg-white text-slate-800"
              }`}
            />
          </div>
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

        {isRoundTrip && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {t("transfer.search.field.returnDate")}
              <input
                type="date"
                value={returnDate}
                onChange={(event) => setReturnDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              />
            </label>
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {t("transfer.search.field.returnTime")}
              <input
                type="time"
                value={returnTime}
                onChange={(event) => setReturnTime(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              />
            </label>
          </div>
        )}

        <button
          onClick={handleQuote}
            className={`w-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition ${
              isFunjet ? "rounded-[24px] bg-[#6A0DAD] hover:bg-[#58108F]" : "rounded-2xl bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {quoteLoading ? t("transfer.search.action.loading") : t("transfer.search.action.search")}
          </button>

        {quoteError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            {quoteError}
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {quote.length ? (
          quote.map((vehicle) => {
            const oneWayPrice = vehicle.price;
            const roundTripPrice = Number((vehicle.price * roundTripMultiplier).toFixed(2));
            const displayPrice = isRoundTrip ? roundTripPrice : oneWayPrice;
            const isRecommended = vehicle.id === recommendedVehicleId;
            const reserveUrl = buildReserveLink(vehicle, displayPrice);
            return (
              <article
                key={vehicle.id}
                className={`group flex h-full flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-2 ${
                  isFunjet
                    ? "rounded-[32px] border border-[#E7D2FB] bg-white shadow-[0_22px_70px_rgba(106,13,173,0.12)]"
                    : "rounded-[28px] border border-slate-100 bg-white shadow-card"
                }`}
              >
                <div className="relative">
                  <div
                    className="aspect-[4/3] w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${vehicle.imageUrl || "/transfer/sedan.png"})` }}
                    role="img"
                    aria-label={vehicle.name}
                  />
                  {isRecommended && (
                    <span className="absolute right-3 top-3 rounded-xl bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900 shadow-sm backdrop-blur">
                      {t("transfer.search.vehicle.badge.mostPopular")}
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                    <span className={`rounded-full border border-white/80 bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] shadow ${isFunjet ? "text-[#6A0DAD]" : "text-slate-500"}`}>
                      {vehicle.category}
                    </span>
                    <span className="rounded-full border border-white/80 bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500 shadow">
                      Private Transfer
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className={`text-[10px] font-medium uppercase tracking-[0.35em] ${isFunjet ? "text-[#A86AD8]" : "text-brand"}`}>
                    {selectedOrigin?.name || "Airport"} to {selectedDestination?.name || "Hotel"}
                  </p>
                  <h3 className={`text-2xl font-black leading-tight ${isFunjet ? "text-[#34114A]" : "text-slate-900"}`}>{vehicle.name}</h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {t("transfer.search.vehicle.capacityRange", {
                      min: vehicle.minPax,
                      max: vehicle.maxPax
                    })}
                  </p>

                  <ul className="grid gap-2 border-y border-slate-50 py-2 text-[11px] text-slate-500 lg:grid-cols-2">
                    {TRUST_BULLETS.slice(0, 2).map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {t(bullet)}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
                        {isRoundTrip ? t("transfer.search.vehicle.priceLabel.roundTrip") : t("transfer.search.vehicle.priceLabel.oneWay")}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-black ${isFunjet ? "text-[#6A0DAD]" : "text-brand"}`}>${displayPrice.toFixed(2)}</span>
                        <span className="text-sm font-semibold text-slate-500">USD</span>
                      </div>
                      {isRoundTrip && (
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-600">
                          {t("transfer.search.vehicle.roundTripSavings", {
                            discount: normalizedDiscountPercent
                          })}
                        </p>
                      )}
                    </div>
                    <Link
                      href={reserveUrl}
                      className={`rounded-2xl px-6 py-3 text-sm font-bold text-white transition-colors ${
                        isFunjet
                          ? "bg-[#6A0DAD] shadow-[0_16px_38px_rgba(106,13,173,0.35)] group-hover:bg-[#58108F]"
                          : "bg-brand shadow-lg shadow-brand/40 group-hover:bg-brand-light"
                      }`}
                    >
                      {t("transfer.search.action.reserve")}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
            {quoteError
              ? t("transfer.search.noVehicles.adjustRoute")
              : t("transfer.search.noVehicles.selectDetails")}
          </div>
        )}
      </div>
    </div>
  );
}
