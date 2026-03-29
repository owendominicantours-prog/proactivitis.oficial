"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgencyTransferProBuilder } from "@/components/agency/AgencyTransferProBuilder";

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

type AgencyTransferWorkspaceProps = {
  commissionPercent: number;
  companyName: string;
  stats: {
    activeLocations: number;
    activeVehicles: number;
    activeRoutes: number;
  };
};

type ViewMode = "cards" | "list";

const LOCATION_DEBOUNCE_MS = 350;
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

const TRANSFER_TOUR_TITLE = process.env.NEXT_PUBLIC_TRANSFER_TITLE ?? "Transfer privado Proactivitis";
const TRANSFER_TOUR_IMAGE = process.env.NEXT_PUBLIC_TRANSFER_IMAGE ?? "/transfer/sedan.png";
const TRANSFER_TOUR_ID = process.env.NEXT_PUBLIC_TRANSFER_TOUR_ID ?? "";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

const formatLocationMeta = (location: LocationSummary) => location.zoneName ?? location.type;

export function AgencyTransferWorkspace({
  commissionPercent,
  companyName,
  stats
}: AgencyTransferWorkspaceProps) {
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
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [quote, setQuote] = useState<QuoteVehicle[]>([]);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [categoryFilter, setCategoryFilter] = useState("");

  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const originRef = useRef<HTMLDivElement | null>(null);
  const destinationRef = useRef<HTMLDivElement | null>(null);

  const isRoundTrip = tripType === "round-trip";
  const roundTripMultiplier = isRoundTrip
    ? 2 * (1 - ROUND_TRIP_DISCOUNT_PERCENT / 100)
    : 1;

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

  useEffect(() => closeOnClickOutside(), [closeOnClickOutside]);

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
      setQuoteError("Selecciona origen y destino para cotizar.");
      return;
    }

    if (!departureDate || !departureTime) {
      setQuoteError("Indica fecha y hora de salida.");
      return;
    }

    if (isRoundTrip && (!returnDate || !returnTime)) {
      setQuoteError("Completa la fecha y hora de regreso para un viaje ida y vuelta.");
      return;
    }

    setQuoteLoading(true);
    setQuoteError(null);

    try {
      const response = await fetch("/api/transfers/v2/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_location_id: selectedOrigin.id,
          destination_location_id: selectedDestination.id,
          passengers: normalizedPassengers,
          trip_type: tripType,
          return_datetime: isRoundTrip ? `${returnDate}T${returnTime}` : undefined
        })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No pudimos cotizar esta ruta ahora mismo.");
      }

      const data = await response.json();
      setQuote(data.vehicles ?? []);
    } catch (error) {
      setQuote([]);
      setQuoteError(error instanceof Error ? error.message : "No pudimos cotizar esta ruta ahora mismo.");
    } finally {
      setQuoteLoading(false);
    }
  };

  const departureDatetime = useMemo(
    () => (departureDate && departureTime ? `${departureDate}T${departureTime}` : ""),
    [departureDate, departureTime]
  );
  const returnDatetime = useMemo(
    () => (returnDate && returnTime ? `${returnDate}T${returnTime}` : ""),
    [returnDate, returnTime]
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(quote.map((vehicle) => vehicle.category))).sort(),
    [quote]
  );

  const filteredQuote = useMemo(() => {
    if (!categoryFilter) return quote;
    return quote.filter((vehicle) => vehicle.category === categoryFilter);
  }, [categoryFilter, quote]);

  const totals = useMemo(() => {
    return filteredQuote.reduce(
      (acc, vehicle) => {
        const publicPrice = Number((vehicle.price * roundTripMultiplier).toFixed(2));
        const netPrice = Number((publicPrice * (1 - commissionPercent / 100)).toFixed(2));
        acc.publicGross += publicPrice;
        acc.netGross += netPrice;
        return acc;
      },
      { publicGross: 0, netGross: 0 }
    );
  }, [commissionPercent, filteredQuote, roundTripMultiplier]);

  const buildReserveLink = (vehicle: QuoteVehicle, publicPrice: number, netPrice: number) => {
    if (!selectedOrigin || !selectedDestination) return "/checkout?type=transfer";

    const params = new URLSearchParams();
    params.set("type", "transfer");
    params.set("tourTitle", TRANSFER_TOUR_TITLE);
    params.set("tourImage", TRANSFER_TOUR_IMAGE);
    if (TRANSFER_TOUR_ID) {
      params.set("tourId", TRANSFER_TOUR_ID);
    }
    params.set("hotelSlug", selectedDestination.slug);
    params.set("origin", selectedOrigin.slug);
    params.set("originLabel", selectedOrigin.name);
    params.set("originHotelName", selectedDestination.name);
    params.set("vehicleId", vehicle.id);
    params.set("vehicleName", vehicle.name);
    params.set("vehicleCategory", vehicle.category);
    params.set("adults", String(passengers));
    params.set("youth", "0");
    params.set("child", "0");
    params.set("tourPrice", (publicPrice / Math.max(1, passengers)).toFixed(2));
    params.set("totalPrice", publicPrice.toFixed(2));
    params.set("displayTourPrice", (netPrice / Math.max(1, passengers)).toFixed(2));
    params.set("displayTotalPrice", netPrice.toFixed(2));
    params.set("agencyDirectPercent", commissionPercent.toString());
    params.set("pricingMode", "direct-agency");
    params.set("tripType", tripType);
    params.set("date", departureDate);
    params.set("time", departureTime);
    params.set("dateTime", departureDatetime);
    if (returnDatetime) {
      params.set("returnDatetime", returnDatetime);
    }
    return `/checkout?${params.toString()}`;
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Comision directa" value={`${commissionPercent}%`} helper="Solo aplica cuando la agencia reserva directo." />
        <StatCard label="Puntos activos" value={String(stats.activeLocations)} helper="Origenes y destinos listos para cotizar." />
        <StatCard label="Vehiculos" value={String(stats.activeVehicles)} helper="Flota activa para rutas privadas." />
        <StatCard label="Rutas activas" value={String(stats.activeRoutes)} helper="Base operativa lista para la agencia." />
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Herramienta de traslados</p>
            <h1 className="mt-3 text-3xl font-semibold">Cotiza y vende traslados directos para {companyName}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              Busca rutas, calcula el neto real de la agencia y abre el checkout correcto sin mezclar precios publicos.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Modelo activo</p>
            <p className="mt-2 text-lg font-semibold">Reserva directa de agencia</p>
            <p className="mt-1 text-slate-300">La agencia paga el precio neto luego de su comision configurada.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1.2fr,1.2fr,0.6fr]">
          <div className="relative space-y-2" ref={originRef}>
            <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Origen</label>
            <div className="relative">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                value={selectedOrigin?.name ?? originQuery}
                onChange={(event) => handleOriginChange(event.target.value)}
                onFocus={() => setOriginOpen(true)}
                placeholder="Ej. Punta Cana Airport"
              />
              {originLoading ? <span className="absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-sky-500 animate-pulse" /> : null}
            </div>

            {originOpen && originOptions.length > 0 && !selectedOrigin ? (
              <div className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                {originOptions.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      setSelectedOrigin(location);
                      setOriginQuery(location.name);
                      setOriginOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm transition hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-900">{location.name}</span>
                      <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{formatLocationMeta(location)}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative space-y-2" ref={destinationRef}>
            <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Destino</label>
            <div className="relative">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                value={selectedDestination?.name ?? destinationQuery}
                onChange={(event) => handleDestinationChange(event.target.value)}
                onFocus={() => setDestinationOpen(true)}
                placeholder="Ej. Hard Rock Hotel Punta Cana"
              />
              {destinationLoading ? <span className="absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-sky-500 animate-pulse" /> : null}
            </div>

            {destinationOpen && destinationOptions.length > 0 && !selectedDestination ? (
              <div className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                {destinationOptions.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      setSelectedDestination(location);
                      setDestinationQuery(location.name);
                      setDestinationOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm transition hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-900">{location.name}</span>
                      <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{formatLocationMeta(location)}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Pasajeros</label>
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setTripType("one-way");
              setReturnDate("");
              setReturnTime("");
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
              tripType === "one-way" ? "bg-sky-600 text-white" : "border border-slate-200 text-slate-600"
            }`}
          >
            Solo ida
          </button>
          <button
            type="button"
            onClick={() => setTripType("round-trip")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
              tripType === "round-trip" ? "bg-sky-600 text-white" : "border border-slate-200 text-slate-600"
            }`}
          >
            Ida y vuelta
          </button>
          <span className="text-xs text-slate-500">Ida y vuelta aplica descuento automatico del {ROUND_TRIP_DISCOUNT_PERCENT}%.</span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Fecha de salida">
            <input
              type="date"
              value={departureDate}
              onChange={(event) => setDepartureDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </Field>
          <Field label="Hora de salida">
            <input
              type="time"
              value={departureTime}
              onChange={(event) => setDepartureTime(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </Field>
          {isRoundTrip ? (
            <>
              <Field label="Fecha de regreso">
                <input
                  type="date"
                  value={returnDate}
                  onChange={(event) => setReturnDate(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </Field>
              <Field label="Hora de regreso">
                <input
                  type="time"
                  value={returnTime}
                  onChange={(event) => setReturnTime(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </Field>
            </>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>Cliente final no ve comision.</span>
            <span>Agencia paga tarifa neta.</span>
            <span>Checkout directo con sesion de agencia.</span>
          </div>
          <button
            type="button"
            onClick={handleQuote}
            className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            {quoteLoading ? "Cotizando..." : "Buscar tarifas"}
          </button>
        </div>

        {quoteError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{quoteError}</div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>{filteredQuote.length} opciones visibles</span>
            <span>Publico agregado: {formatMoney(totals.publicGross)}</span>
            <span>Neto agencia agregado: {formatMoney(totals.netGross)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="">Todas las categorias</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === "cards" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {filteredQuote.length ? (
          filteredQuote.map((vehicle) => {
            const publicPrice = Number((vehicle.price * roundTripMultiplier).toFixed(2));
            const netPrice = Number((publicPrice * (1 - commissionPercent / 100)).toFixed(2));
            const commissionValue = Number((publicPrice - netPrice).toFixed(2));
            const reserveUrl = buildReserveLink(vehicle, publicPrice, netPrice);

            return (
              <article
                key={vehicle.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div
                  className={`gap-4 ${
                    viewMode === "cards"
                      ? "grid xl:grid-cols-[220px,1.35fr,0.85fr,0.9fr] xl:items-center"
                      : "grid lg:grid-cols-[180px,1.5fr,0.9fr,0.85fr] lg:items-center"
                  }`}
                >
                  <div className={`overflow-hidden rounded-2xl bg-slate-100 ${viewMode === "list" ? "hidden lg:block" : ""}`}>
                    <div
                      className="h-40 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${vehicle.imageUrl || "/transfer/sedan.png"})` }}
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">Traslado listo para vender</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900">{vehicle.name}</h2>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                      <Tag>{selectedOrigin?.name ?? "Origen"}</Tag>
                      <Tag>{selectedDestination?.name ?? "Destino"}</Tag>
                      <Tag>{vehicle.category}</Tag>
                      <Tag>{isRoundTrip ? "Ida y vuelta" : "Solo ida"}</Tag>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-600 xl:grid-cols-2">
                      <span>Capacidad {vehicle.minPax}-{vehicle.maxPax} pax</span>
                      <span>Salida {departureDate || "Pendiente"} {departureTime || ""}</span>
                      {isRoundTrip ? <span>Regreso {returnDate || "Pendiente"} {returnTime || ""}</span> : null}
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <InfoLine label="Precio publico" value={formatMoney(publicPrice)} emphasis="indigo" />
                    <InfoLine label="Pago agencia" value={formatMoney(netPrice)} emphasis="slate" />
                    <InfoLine label="Comision directa" value={`${commissionPercent}% / ${formatMoney(commissionValue)}`} emphasis="emerald" />
                  </div>

                  <div className="space-y-3">
                    <Link
                      href={reserveUrl}
                      className="flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
                    >
                      Vender y crear reserva
                    </Link>
                    <AgencyTransferProBuilder
                      originLocationId={selectedOrigin?.id ?? ""}
                      destinationLocationId={selectedDestination?.id ?? ""}
                      originLabel={selectedOrigin?.name ?? "Origen"}
                      destinationLabel={selectedDestination?.name ?? "Destino"}
                      vehicleId={vehicle.id}
                      vehicleName={vehicle.name}
                      passengers={passengers}
                      tripType={tripType}
                      basePrice={publicPrice}
                    />
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs leading-relaxed text-slate-500">
                      El checkout mostrara el neto de agencia y guardara la reserva como venta directa desde cuenta de agencia.
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
              {quoteLoading ? "Buscando tarifas..." : "No hay tarifas para mostrar todavia."}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Completa la ruta, fecha y pasajeros para ver opciones de traslados listas para vender.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

const StatCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="space-y-2">
    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</span>
    {children}
  </label>
);

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{children}</span>
);

const InfoLine = ({
  label,
  value,
  emphasis
}: {
  label: string;
  value: string;
  emphasis: "indigo" | "slate" | "emerald";
}) => {
  const valueClass =
    emphasis === "indigo"
      ? "text-indigo-600"
      : emphasis === "emerald"
        ? "text-emerald-600"
        : "text-slate-900";

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className={`text-base font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
};
