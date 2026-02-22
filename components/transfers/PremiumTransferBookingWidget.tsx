"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/translations";

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

const UI = {
  es: {
    origin: "Origen",
    destination: "Destino",
    originPlaceholder: "Escribe origen (hotel o aeropuerto)",
    destinationPlaceholder: "Escribe destino (hotel o aeropuerto)",
    datetime: "Fecha y hora",
    passengers: "Pasajeros",
    step1: "Paso 1: Ruta",
    step2: "Paso 2: Fecha y pasajeros",
    quoteNow: "Cotizar Ahora",
    routePreview: "Ruta seleccionada",
    emptyOrigin: "Selecciona un origen",
    emptyDestination: "Selecciona un destino",
    loading: "Actualizando flota premium...",
    noRates: "No encontramos tarifas premium para esta ruta.",
    reserve: "Reservar VIP",
    vehicleFilterLabel: "Seleccion de vehiculo",
    filterCadillac: "Cadillac Escalade",
    filterSuburban: "Chevrolet Suburban",
    selectedVehicle: "Vehiculo seleccionado",
    oneWay: "Solo ida",
    perTrip: "por viaje",
    error: "No se pudo cargar la cotizacion premium.",
    selectValidPoints: "Selecciona origen y destino validos de la lista."
  },
  en: {
    origin: "Origin",
    destination: "Destination",
    originPlaceholder: "Type origin (hotel or airport)",
    destinationPlaceholder: "Type destination (hotel or airport)",
    datetime: "Date and time",
    passengers: "Passengers",
    step1: "Step 1: Route",
    step2: "Step 2: Date and passengers",
    quoteNow: "Get Quote",
    routePreview: "Selected route",
    emptyOrigin: "Select an origin",
    emptyDestination: "Select a destination",
    loading: "Updating premium fleet...",
    noRates: "No premium rates found for this route.",
    reserve: "Book VIP",
    vehicleFilterLabel: "Vehicle selection",
    filterCadillac: "Cadillac Escalade",
    filterSuburban: "Chevrolet Suburban",
    selectedVehicle: "Selected vehicle",
    oneWay: "One way",
    perTrip: "per trip",
    error: "Could not load premium quote.",
    selectValidPoints: "Select valid origin and destination from the list."
  },
  fr: {
    origin: "Origine",
    destination: "Destination",
    originPlaceholder: "Ecrivez origine (hotel ou aeroport)",
    destinationPlaceholder: "Ecrivez destination (hotel ou aeroport)",
    datetime: "Date et heure",
    passengers: "Passagers",
    step1: "Etape 1 : Itineraire",
    step2: "Etape 2 : Date et passagers",
    quoteNow: "Obtenir un devis",
    routePreview: "Itineraire selectionne",
    emptyOrigin: "Selectionnez une origine",
    emptyDestination: "Selectionnez une destination",
    loading: "Mise a jour de la flotte premium...",
    noRates: "Aucun tarif premium trouve pour cette route.",
    reserve: "Reserver VIP",
    vehicleFilterLabel: "Selection de vehicule",
    filterCadillac: "Cadillac Escalade",
    filterSuburban: "Chevrolet Suburban",
    selectedVehicle: "Vehicule selectionne",
    oneWay: "Aller simple",
    perTrip: "par trajet",
    error: "Impossible de charger le devis premium.",
    selectValidPoints: "Selectionnez une origine et destination valides dans la liste."
  }
} as const;

const transferTourId = process.env.NEXT_PUBLIC_TRANSFER_TOUR_ID;
const transferTourTitle = process.env.NEXT_PUBLIC_TRANSFER_TITLE ?? "Premium Transfer Service";
const transferTourImage = process.env.NEXT_PUBLIC_TRANSFER_IMAGE ?? "/transfer/suv.png";

const buildCheckoutHref = ({
  vehicleId,
  price,
  passengers,
  originSlug,
  destinationSlug,
  originLabel,
  destinationLabel,
  dateTime
}: {
  vehicleId: string;
  price: number;
  passengers: number;
  originSlug: string;
  destinationSlug: string;
  originLabel: string;
  destinationLabel: string;
  dateTime: string;
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
  params.set("price", price.toFixed(2));
  params.set("passengers", String(passengers));
  params.set("adults", String(passengers));
  params.set("youth", "0");
  params.set("child", "0");
  params.set("tripType", "one-way");
  params.set("dateTime", dateTime);
  params.set("totalPrice", price.toFixed(2));
  params.set("tourPrice", (price / Math.max(1, passengers)).toFixed(2));
  const [datePart, timePart] = dateTime.split("T");
  if (datePart) params.set("date", datePart);
  if (timePart) params.set("time", timePart);
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
  const now = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = now.toISOString().slice(11, 16);
  const preferredDestination =
    destinations.find((item) => {
      if (!preferredDestinationHint) return false;
      return item.slug.includes(preferredDestinationHint);
    }) ?? destinations[0] ?? null;
  const [originId, setOriginId] = useState(origins[0]?.id ?? "");
  const [destinationId, setDestinationId] = useState(preferredDestination?.id ?? destinations[0]?.id ?? "");
  const [passengers, setPassengers] = useState(2);
  const [departureDate, setDepartureDate] = useState(defaultDate);
  const [departureTime, setDepartureTime] = useState(defaultTime);
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
  const dateTime = `${departureDate}T${departureTime}`;

  const selectedVehicleMeta = useMemo(() => {
    if (selectedModel === "cadillac") {
      return {
        label: copy.filterCadillac,
        image: cadillacImage ?? "/transfer/suv.png"
      };
    }
    if (selectedModel === "suburban") {
      return {
        label: copy.filterSuburban,
        image: suburbanImage ?? "/transfer/suv.png"
      };
    }
    return null;
  }, [cadillacImage, copy.filterCadillac, copy.filterSuburban, selectedModel, suburbanImage]);

  const fetchQuote = async () => {
    if (!validRoute || !origin?.id || !destination?.id) {
      setVehicles([]);
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
      const filtered = allVehicles.filter(isPremiumVehicle).sort(premiumSort);
      setVehicles(filtered.length ? filtered : allVehicles.sort(premiumSort));
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-5 rounded-[30px] border border-amber-200/40 bg-[#0f172a]/95 p-6 text-white shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
      <h2 className="text-2xl font-semibold text-amber-100">{title}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setSelectedModel("cadillac");
          }}
          className={`overflow-hidden rounded-2xl border text-left transition ${
            selectedModel === "cadillac"
              ? "border-amber-200 bg-amber-200/10"
              : "border-amber-200/30 bg-slate-900/70 hover:border-amber-200/60"
          }`}
        >
          <div className="relative h-20 w-full">
            <img src={cadillacImage ?? "/transfer/suv.png"} alt="Cadillac Escalade" className="h-full w-full object-cover" />
          </div>
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
            Cadillac Escalade
          </div>
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedModel("suburban");
          }}
          className={`overflow-hidden rounded-2xl border text-left transition ${
            selectedModel === "suburban"
              ? "border-amber-200 bg-amber-200/10"
              : "border-amber-200/30 bg-slate-900/70 hover:border-amber-200/60"
          }`}
        >
          <div className="relative h-20 w-full">
            <img src={suburbanImage ?? "/transfer/suv.png"} alt="Chevrolet Suburban" className="h-full w-full object-cover" />
          </div>
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
            Chevrolet Suburban
          </div>
        </button>
      </div>

      <div className="rounded-2xl border border-amber-200/20 bg-slate-900/60 p-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/80">{copy.step1}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-xs uppercase tracking-[0.25em] text-amber-200/80">
            {copy.origin}
            <select
              value={originId}
              onChange={(event) => setOriginId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-amber-200/30 bg-slate-900/80 px-3 py-2 text-sm text-white"
            >
              {!origins.length ? <option value="">{copy.emptyOrigin}</option> : null}
              {origins.map((item) => (
                <option key={`origin-${item.id}`} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs uppercase tracking-[0.25em] text-amber-200/80">
            {copy.destination}
            <select
              value={destinationId}
              onChange={(event) => setDestinationId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-amber-200/30 bg-slate-900/80 px-3 py-2 text-sm text-white"
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
      </div>

      <div className="rounded-2xl border border-amber-200/20 bg-slate-900/60 p-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/80">{copy.step2}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="text-xs uppercase tracking-[0.25em] text-amber-200/80">
            {copy.datetime}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                type="date"
                value={departureDate}
                onChange={(event) => setDepartureDate(event.target.value)}
                className="rounded-xl border border-amber-200/30 bg-slate-900/80 px-3 py-2 text-sm text-white"
              />
              <input
                type="time"
                value={departureTime}
                onChange={(event) => setDepartureTime(event.target.value)}
                className="rounded-xl border border-amber-200/30 bg-slate-900/80 px-3 py-2 text-sm text-white"
              />
            </div>
          </label>
          <label className="text-xs uppercase tracking-[0.25em] text-amber-200/80">
            {copy.passengers}
            <input
              type="number"
              min={1}
              max={16}
              value={passengers}
              onChange={(event) => setPassengers(Math.max(1, Math.min(16, Number(event.target.value || 1))))}
              className="mt-2 w-full rounded-xl border border-amber-200/30 bg-slate-900/80 px-3 py-2 text-sm text-white"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchQuote}
              disabled={!validRoute || loading}
              className="w-full rounded-full bg-amber-300 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copy.quoteNow}
            </button>
          </div>
        </div>
      </div>

      {origin && destination ? (
        <p className="text-sm text-amber-100/90">
          {copy.routePreview}: <span className="font-semibold">{origin.name}</span> {"->"}{" "}
          <span className="font-semibold">{destination.name}</span>
        </p>
      ) : null}
      {!validRoute ? <p className="text-sm text-amber-100/80">{copy.selectValidPoints}</p> : null}
      {selectedVehicleMeta ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200/25 bg-slate-900/70 px-3 py-2">
          <img src={selectedVehicleMeta.image} alt={selectedVehicleMeta.label} className="h-10 w-14 rounded-md object-cover" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200/80">{copy.selectedVehicle}</p>
            <p className="text-sm font-semibold text-white">{selectedVehicleMeta.label}</p>
          </div>
        </div>
      ) : null}
      {loading ? <p className="text-sm text-amber-100/70">{copy.loading}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {validRoute && origin && destination &&
          vehicles.map((vehicle) => (
          <article
            key={vehicle.id}
            className="rounded-2xl border border-amber-200/30 bg-gradient-to-b from-slate-900/80 to-slate-800/80 p-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{copy.oneWay}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{vehicle.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">
              {vehicle.minPax}-{vehicle.maxPax} pax
            </p>
            <p className="mt-3 text-3xl font-bold text-amber-200">
              ${vehicle.price.toFixed(2)} <span className="text-xs font-semibold uppercase tracking-[0.2em]">{copy.perTrip}</span>
            </p>
            <Link
              href={buildCheckoutHref({
                vehicleId: vehicle.id,
                price: vehicle.price,
                passengers,
                originSlug: origin.slug,
                destinationSlug: destination.slug,
                originLabel: origin.name,
                destinationLabel: destination.name,
                dateTime
              })}
              className="mt-4 inline-flex rounded-full bg-amber-300 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-900 transition hover:bg-amber-200"
            >
              {copy.reserve}
            </Link>
          </article>
        ))}
      </div>

      {hasQuoted && !loading && vehicles.length === 0 ? <p className="text-sm text-slate-300">{copy.noRates}</p> : null}
    </section>
  );
}
