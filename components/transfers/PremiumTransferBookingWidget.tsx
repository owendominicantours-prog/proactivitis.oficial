"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/translations";
import { getSiteDateTimeInputValue } from "@/lib/site-date";

type DestinationOption = {
  id: string;
  slug: string;
  name: string;
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

type Props = {
  locale: Locale;
  origins: DestinationOption[];
  destinations: DestinationOption[];
  title: string;
  cadillacImage?: string;
  suburbanImage?: string;
  preferredDestinationHint?: string;
};

const ROUND_TRIP_DISCOUNT_PERCENT = Number(process.env.NEXT_PUBLIC_ROUND_TRIP_DISCOUNT_PERCENT ?? 5);

const UI = {
  es: {
    kicker: "Cotizacion premium",
    intro:
      "Configura tu ruta, fecha y tipo de servicio para obtener una tarifa real con flota premium y checkout listo.",
    origin: "Origen",
    destination: "Destino",
    datetime: "Fecha de llegada",
    returnDatetime: "Fecha de regreso",
    passengers: "Pasajeros",
    routeTitle: "Ruta",
    tripTitle: "Servicio",
    fleetTitle: "Flota premium",
    summaryTitle: "Resumen de cotizacion",
    oneWay: "Solo ida",
    roundTrip: "Ida y vuelta",
    quoteNow: "Cotizar ahora",
    updating: "Consultando tarifa premium...",
    routePreview: "Ruta seleccionada",
    emptyOrigin: "Selecciona un origen",
    emptyDestination: "Selecciona un destino",
    noRates: "No encontramos tarifas premium para esta configuracion.",
    reserve: "Reservar ahora",
    selectedVehicle: "Flota preferida",
    allFleet: "Ver todas",
    filterCadillac: "Cadillac Escalade",
    filterSuburban: "Chevrolet Suburban",
    dateLabel: "Ida",
    timeLabel: "Hora",
    passengersHelp: "Capacidad final segun vehiculo disponible.",
    error: "No se pudo cargar la cotizacion premium.",
    selectValidPoints: "Selecciona origen y destino validos de la lista.",
    returnRequired: "Agrega fecha y hora de regreso para cotizar ida y vuelta.",
    noSelection: "Sin preferencia",
    quoteHint: "Precios sujetos a disponibilidad real de flota premium.",
    itinerary: "Itinerario",
    paymentText: "Confirmacion online inmediata",
    perTrip: "por trayecto",
    totalRoundTrip: "total ida y vuelta",
    privateTransfer: "Transfer privado premium",
    support: "Soporte por WhatsApp",
    liveTracking: "Seguimiento de vuelo",
    passengerRange: "Capacidad",
    estimatedFor: "Estimado para",
    reserveVehicle: "Reservar esta unidad"
  },
  en: {
    kicker: "Premium quote",
    intro:
      "Set your route, schedule, and service type to get a real premium quote with ready-to-book checkout.",
    origin: "Origin",
    destination: "Destination",
    datetime: "Arrival date",
    returnDatetime: "Return date",
    passengers: "Passengers",
    routeTitle: "Route",
    tripTitle: "Service",
    fleetTitle: "Premium fleet",
    summaryTitle: "Quote summary",
    oneWay: "One way",
    roundTrip: "Round trip",
    quoteNow: "Get quote",
    updating: "Checking premium pricing...",
    routePreview: "Selected route",
    emptyOrigin: "Select an origin",
    emptyDestination: "Select a destination",
    noRates: "No premium rates found for this setup.",
    reserve: "Book now",
    selectedVehicle: "Preferred fleet",
    allFleet: "Show all",
    filterCadillac: "Cadillac Escalade",
    filterSuburban: "Chevrolet Suburban",
    dateLabel: "Departure",
    timeLabel: "Time",
    passengersHelp: "Final capacity depends on available vehicle.",
    error: "Could not load premium quote.",
    selectValidPoints: "Select valid origin and destination from the list.",
    returnRequired: "Add return date and time to quote a round trip.",
    noSelection: "No preference",
    quoteHint: "Rates are subject to real premium fleet availability.",
    itinerary: "Itinerary",
    paymentText: "Instant online confirmation",
    perTrip: "per trip",
    totalRoundTrip: "round-trip total",
    privateTransfer: "Private premium transfer",
    support: "WhatsApp support",
    liveTracking: "Flight tracking",
    passengerRange: "Capacity",
    estimatedFor: "Estimate for",
    reserveVehicle: "Reserve this vehicle"
  },
  fr: {
    kicker: "Devis premium",
    intro:
      "Configurez votre trajet, horaire et type de service pour obtenir un vrai devis premium avec reservation prete.",
    origin: "Origine",
    destination: "Destination",
    datetime: "Date d arrivee",
    returnDatetime: "Date de retour",
    passengers: "Passagers",
    routeTitle: "Trajet",
    tripTitle: "Service",
    fleetTitle: "Flotte premium",
    summaryTitle: "Resume du devis",
    oneWay: "Aller simple",
    roundTrip: "Aller-retour",
    quoteNow: "Obtenir un devis",
    updating: "Verification des tarifs premium...",
    routePreview: "Trajet selectionne",
    emptyOrigin: "Selectionnez une origine",
    emptyDestination: "Selectionnez une destination",
    noRates: "Aucun tarif premium trouve pour cette configuration.",
    reserve: "Reserver",
    selectedVehicle: "Flotte preferee",
    allFleet: "Voir tout",
    filterCadillac: "Cadillac Escalade",
    filterSuburban: "Chevrolet Suburban",
    dateLabel: "Depart",
    timeLabel: "Heure",
    passengersHelp: "Capacite finale selon le vehicule disponible.",
    error: "Impossible de charger le devis premium.",
    selectValidPoints: "Selectionnez une origine et une destination valides.",
    returnRequired: "Ajoutez la date et l heure de retour pour un aller-retour.",
    noSelection: "Sans preference",
    quoteHint: "Tarifs soumis a la disponibilite reelle de la flotte premium.",
    itinerary: "Itineraire",
    paymentText: "Confirmation en ligne immediate",
    perTrip: "par trajet",
    totalRoundTrip: "total aller-retour",
    privateTransfer: "Transfert prive premium",
    support: "Support WhatsApp",
    liveTracking: "Suivi de vol",
    passengerRange: "Capacite",
    estimatedFor: "Estimation pour",
    reserveVehicle: "Reserver ce vehicule"
  }
} as const;

const transferTourId = process.env.NEXT_PUBLIC_TRANSFER_TOUR_ID;
const transferTourTitle = process.env.NEXT_PUBLIC_TRANSFER_TITLE ?? "Premium Transfer Service";
const transferTourImage = process.env.NEXT_PUBLIC_TRANSFER_IMAGE ?? "/transfer/suv.png";

const buildCheckoutHref = ({
  vehicleId,
  vehicleName,
  vehicleCategory,
  price,
  passengers,
  originSlug,
  destinationSlug,
  originLabel,
  destinationLabel,
  tripType,
  dateTime,
  returnDatetime
}: {
  vehicleId: string;
  vehicleName: string;
  vehicleCategory: string;
  price: number;
  passengers: number;
  originSlug: string;
  destinationSlug: string;
  originLabel: string;
  destinationLabel: string;
  tripType: "one-way" | "round-trip";
  dateTime: string;
  returnDatetime?: string;
}) => {
  const params = new URLSearchParams();
  params.set("type", "transfer");
  params.set("hotelSlug", destinationSlug);
  params.set("origin", originSlug);
  params.set("originLabel", originLabel);
  params.set("originHotelName", destinationLabel);
  if (transferTourId) params.set("tourId", transferTourId);
  params.set("tourTitle", transferTourTitle);
  params.set("tourImage", transferTourImage);
  params.set("vehicleId", vehicleId);
  params.set("vehicleName", vehicleName);
  params.set("vehicleCategory", vehicleCategory);
  params.set("price", price.toFixed(2));
  params.set("passengers", String(passengers));
  params.set("adults", String(passengers));
  params.set("youth", "0");
  params.set("child", "0");
  params.set("tripType", tripType);
  params.set("dateTime", dateTime);
  params.set("totalPrice", price.toFixed(2));
  params.set("tourPrice", (price / Math.max(1, passengers)).toFixed(2));
  const [datePart, timePart] = dateTime.split("T");
  if (datePart) params.set("date", datePart);
  if (timePart) params.set("time", timePart);
  if (returnDatetime) params.set("returnDatetime", returnDatetime);
  return `/checkout?${params.toString()}`;
};

const isPremiumVehicle = (vehicle: QuoteVehicle) => {
  const name = vehicle.name.toLowerCase();
  return (
    vehicle.category === "SUV" ||
    vehicle.category === "VIP" ||
    name.includes("cadillac") ||
    name.includes("suburban") ||
    name.includes("escalade")
  );
};

const premiumSort = (a: QuoteVehicle, b: QuoteVehicle) => {
  const score = (vehicle: QuoteVehicle) => {
    const name = vehicle.name.toLowerCase();
    if (name.includes("cadillac") || name.includes("escalade")) return 0;
    if (name.includes("suburban")) return 1;
    if (vehicle.category === "VIP") return 2;
    if (vehicle.category === "SUV") return 3;
    return 9;
  };
  return score(a) - score(b);
};

const getFleetImage = (
  vehicle: QuoteVehicle,
  cadillacImage?: string,
  suburbanImage?: string
) => {
  const name = vehicle.name.toLowerCase();
  if (name.includes("cadillac") || name.includes("escalade")) return cadillacImage ?? vehicle.imageUrl ?? "/transfer/suv.png";
  if (name.includes("suburban")) return suburbanImage ?? vehicle.imageUrl ?? "/transfer/suv.png";
  return vehicle.imageUrl ?? cadillacImage ?? suburbanImage ?? "/transfer/suv.png";
};

export default function PremiumTransferBookingWidget({
  locale,
  origins,
  destinations,
  title,
  cadillacImage,
  suburbanImage,
  preferredDestinationHint
}: Props) {
  const copy = UI[locale] ?? UI.es;
  const defaultDateTime = getSiteDateTimeInputValue(new Date(Date.now() + 2 * 60 * 60 * 1000));
  const defaultDate = defaultDateTime.slice(0, 10);
  const defaultTime = defaultDateTime.slice(11, 16);

  const preferredDestination =
    destinations.find((item) => preferredDestinationHint && item.slug.includes(preferredDestinationHint)) ??
    destinations[0] ??
    null;

  const [originId, setOriginId] = useState(origins[0]?.id ?? "");
  const [destinationId, setDestinationId] = useState(preferredDestination?.id ?? destinations[0]?.id ?? "");
  const [passengers, setPassengers] = useState(2);
  const [departureDate, setDepartureDate] = useState(defaultDate);
  const [departureTime, setDepartureTime] = useState(defaultTime);
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [vehicles, setVehicles] = useState<QuoteVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasQuoted, setHasQuoted] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"cadillac" | "suburban" | null>(null);

  const origin = useMemo(() => origins.find((item) => item.id === originId) ?? null, [originId, origins]);
  const destination = useMemo(
    () => destinations.find((item) => item.id === destinationId) ?? null,
    [destinationId, destinations]
  );

  const validRoute = Boolean(origin?.id && destination?.id && origin.id !== destination.id);
  const validRoundTrip = tripType === "one-way" || Boolean(returnDate && returnTime);
  const departureDateTime = `${departureDate}T${departureTime}`;
  const returnDateTime = returnDate && returnTime ? `${returnDate}T${returnTime}` : undefined;

  const routeSummary = useMemo(() => {
    if (!origin || !destination) return null;
    return `${origin.name} -> ${destination.name}`;
  }, [destination, origin]);

  const filteredVehicles = useMemo(() => {
    const base = [...vehicles].sort(premiumSort);
    if (!selectedModel) return base;
    return base.filter((vehicle) => {
      const name = vehicle.name.toLowerCase();
      return selectedModel === "cadillac"
        ? name.includes("cadillac") || name.includes("escalade")
        : name.includes("suburban");
    });
  }, [selectedModel, vehicles]);

  const quoteMinPrice = useMemo(() => {
    if (!filteredVehicles.length) return null;
    return Math.min(
      ...filteredVehicles.map((vehicle) =>
        tripType === "round-trip"
          ? Number((vehicle.price * 2 * (1 - ROUND_TRIP_DISCOUNT_PERCENT / 100)).toFixed(2))
          : vehicle.price
      )
    );
  }, [filteredVehicles, tripType]);

  const fetchQuote = async () => {
    if (!validRoute || !origin?.id || !destination?.id) {
      setVehicles([]);
      return;
    }
    if (!validRoundTrip) {
      setError(copy.returnRequired);
      return;
    }

    setHasQuoted(true);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/transfers/v2/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_location_id: origin.id,
          destination_location_id: destination.id,
          passengers
        })
      });
      if (!response.ok) throw new Error("quote_error");
      const data = (await response.json()) as { vehicles?: QuoteVehicle[] };
      const allVehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
      const premiumVehicles = allVehicles.filter(isPremiumVehicle).sort(premiumSort);
      setVehicles(premiumVehicles.length ? premiumVehicles : allVehicles.sort(premiumSort));
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-white/15 bg-[linear-gradient(145deg,#06101c,#0f172a_52%,#162236)] p-5 text-white shadow-[0_35px_90px_rgba(2,6,23,0.48)] md:p-7">
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-100">
              {copy.kicker}
            </p>
            <div>
              <h2 className="text-3xl font-black leading-tight text-white md:text-4xl">{title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">{copy.intro}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">{copy.routeTitle}</p>
              <div className="mt-4 grid gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {copy.origin}
                  <select
                    value={originId}
                    onChange={(event) => setOriginId(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                  >
                    {!origins.length ? <option value="">{copy.emptyOrigin}</option> : null}
                    {origins.map((item) => (
                      <option key={`origin-${item.id}`} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {copy.destination}
                  <select
                    value={destinationId}
                    onChange={(event) => setDestinationId(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                  >
                    {!destinations.length ? <option value="">{copy.emptyDestination}</option> : null}
                    {destinations.map((item) => (
                      <option key={`destination-${item.id}`} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>

            <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">{copy.tripTitle}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTripType("one-way")}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition ${
                    tripType === "one-way" ? "bg-cyan-300 text-slate-950" : "border border-white/15 text-white"
                  }`}
                >
                  {copy.oneWay}
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("round-trip")}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition ${
                    tripType === "round-trip" ? "bg-cyan-300 text-slate-950" : "border border-white/15 text-white"
                  }`}
                >
                  {copy.roundTrip}
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {copy.datetime}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(event) => setDepartureDate(event.target.value)}
                      className="rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                    />
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(event) => setDepartureTime(event.target.value)}
                      className="rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>
                </label>

                {tripType === "round-trip" ? (
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    {copy.returnDatetime}
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(event) => setReturnDate(event.target.value)}
                        className="rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                      />
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(event) => setReturnTime(event.target.value)}
                        className="rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                      />
                    </div>
                  </label>
                ) : null}

                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {copy.passengers}
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={passengers}
                    onChange={(event) => setPassengers(Math.max(1, Math.min(16, Number(event.target.value || 1))))}
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                  />
                  <span className="mt-2 block text-[11px] normal-case tracking-normal text-slate-400">{copy.passengersHelp}</span>
                </label>
              </div>
            </article>
          </div>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">{copy.fleetTitle}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {copy.selectedVehicle}:{" "}
                  <span className="font-semibold text-white">
                    {selectedModel === "cadillac"
                      ? copy.filterCadillac
                      : selectedModel === "suburban"
                      ? copy.filterSuburban
                      : copy.noSelection}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModel(null)}
                className="rounded-full border border-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/5"
              >
                {copy.allFleet}
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: "cadillac" as const,
                  label: copy.filterCadillac,
                  image: cadillacImage ?? "/transfer/suv.png"
                },
                {
                  id: "suburban" as const,
                  label: copy.filterSuburban,
                  image: suburbanImage ?? "/transfer/suv.png"
                }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedModel(item.id)}
                  className={`overflow-hidden rounded-[24px] border text-left transition ${
                    selectedModel === item.id
                      ? "border-cyan-300 bg-cyan-300/10"
                      : "border-white/10 bg-slate-950/55 hover:border-white/25"
                  }`}
                >
                  <div className="relative h-28">
                    <Image src={item.image} alt={item.label} fill className="object-cover" sizes="(max-width: 768px) 100vw, 30vw" />
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">{item.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <article className="rounded-[30px] border border-cyan-300/20 bg-[linear-gradient(160deg,rgba(34,211,238,0.14),rgba(15,23,42,0.86))] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">{copy.summaryTitle}</p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-slate-400">{copy.routePreview}</p>
                <p className="mt-1 font-semibold text-white">{routeSummary ?? copy.selectValidPoints}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100">{copy.tripTitle}</p>
                  <p className="mt-2 font-semibold text-white">{tripType === "round-trip" ? copy.roundTrip : copy.oneWay}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100">{copy.estimatedFor}</p>
                  <p className="mt-2 font-semibold text-white">
                    {passengers} {copy.passengers.toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100">{copy.itinerary}</p>
                <p className="mt-2 text-sm text-slate-200">
                  {departureDate} {departureTime}
                  {tripType === "round-trip" && returnDateTime ? ` / ${returnDate} ${returnTime}` : ""}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100">{copy.privateTransfer}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  <li>{copy.liveTracking}</li>
                  <li>{copy.support}</li>
                  <li>{copy.paymentText}</li>
                </ul>
              </div>
              {quoteMinPrice ? (
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100">
                    {tripType === "round-trip" ? copy.totalRoundTrip : copy.perTrip}
                  </p>
                  <p className="mt-2 text-4xl font-black text-white">${quoteMinPrice.toFixed(2)}</p>
                </div>
              ) : null}
              <button
                type="button"
                onClick={fetchQuote}
                disabled={!validRoute || !validRoundTrip || loading}
                className="w-full rounded-full bg-cyan-300 px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {copy.quoteNow}
              </button>
              <p className="text-xs leading-6 text-slate-300">{copy.quoteHint}</p>
            </div>
          </article>

          {!validRoute ? <p className="text-sm text-amber-100/80">{copy.selectValidPoints}</p> : null}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {loading ? <p className="text-sm text-cyan-100/80">{copy.updating}</p> : null}
        </aside>
      </div>

      <div className="mt-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {validRoute &&
            filteredVehicles.map((vehicle) => {
              const displayPrice =
                tripType === "round-trip"
                  ? Number((vehicle.price * 2 * (1 - ROUND_TRIP_DISCOUNT_PERCENT / 100)).toFixed(2))
                  : vehicle.price;

              const reserveHref = origin && destination
                ? buildCheckoutHref({
                    vehicleId: vehicle.id,
                    vehicleName: vehicle.name,
                    vehicleCategory: vehicle.category,
                    price: displayPrice,
                    passengers,
                    originSlug: origin.slug,
                    destinationSlug: destination.slug,
                    originLabel: origin.name,
                    destinationLabel: destination.name,
                    tripType,
                    dateTime: departureDateTime,
                    returnDatetime: tripType === "round-trip" ? returnDateTime : undefined
                  })
                : "#";

              return (
                <article
                  key={vehicle.id}
                  className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(2,6,23,0.28))]"
                >
                  <div className="relative h-52">
                    <Image
                      src={getFleetImage(vehicle, cadillacImage, suburbanImage)}
                      alt={vehicle.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">{copy.privateTransfer}</p>
                        <h3 className="mt-2 text-2xl font-black text-white">{vehicle.name}</h3>
                      </div>
                      <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white">
                        {vehicle.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100">{copy.passengerRange}</p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {vehicle.minPax}-{vehicle.maxPax} pax
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100">{copy.tripTitle}</p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {tripType === "round-trip" ? copy.roundTrip : copy.oneWay}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100">{copy.passengers}</p>
                        <p className="mt-2 text-sm font-semibold text-white">{passengers}</p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                          {tripType === "round-trip" ? copy.totalRoundTrip : copy.perTrip}
                        </p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-4xl font-black text-white">${displayPrice.toFixed(2)}</span>
                          <span className="text-sm font-semibold text-slate-400">USD</span>
                        </div>
                      </div>

                      <Link
                        href={reserveHref}
                        className="rounded-2xl bg-cyan-300 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-200"
                      >
                        {copy.reserveVehicle}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>

        {hasQuoted && !loading && filteredVehicles.length === 0 ? (
          <p className="mt-6 text-sm text-slate-300">{copy.noRates}</p>
        ) : null}
      </div>
    </section>
  );
}
