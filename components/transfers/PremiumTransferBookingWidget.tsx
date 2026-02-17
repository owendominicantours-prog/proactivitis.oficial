"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  locations: DestinationOption[];
  title: string;
  cadillacImage?: string;
  suburbanImage?: string;
};

const UI = {
  es: {
    origin: "Origen",
    destination: "Destino",
    originPlaceholder: "Escribe origen (hotel o aeropuerto)",
    destinationPlaceholder: "Escribe destino (hotel o aeropuerto)",
    datetime: "Fecha y hora",
    passengers: "Pasajeros",
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
  locations,
  title,
  cadillacImage,
  suburbanImage
}: Props) {
  const copy = UI[locale] ?? UI.es;
  const now = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = now.toISOString().slice(11, 16);
  const [originInput, setOriginInput] = useState(locations[0]?.name ?? "");
  const [destinationInput, setDestinationInput] = useState(locations[1]?.name ?? locations[0]?.name ?? "");
  const [passengers, setPassengers] = useState(2);
  const [departureDate, setDepartureDate] = useState(defaultDate);
  const [departureTime, setDepartureTime] = useState(defaultTime);
  const [vehicles, setVehicles] = useState<QuoteVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOriginList, setShowOriginList] = useState(false);
  const [showDestinationList, setShowDestinationList] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"cadillac" | "suburban" | null>(null);

  const resolveLocation = (raw: string) => {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return null;
    return (
      locations.find((item) => item.name.trim().toLowerCase() === normalized) ??
      locations.find((item) => item.slug.trim().toLowerCase() === normalized) ??
      locations.find((item) => item.name.toLowerCase().startsWith(normalized)) ??
      null
    );
  };

  const origin = useMemo(() => resolveLocation(originInput), [originInput, locations]);
  const destination = useMemo(() => resolveLocation(destinationInput), [destinationInput, locations]);
  const originSuggestions = useMemo(() => {
    const q = originInput.trim().toLowerCase();
    if (!q) return locations.slice(0, 8);
    return locations
      .filter((item) => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q))
      .slice(0, 8);
  }, [originInput, locations]);
  const destinationSuggestions = useMemo(() => {
    const q = destinationInput.trim().toLowerCase();
    if (!q) return locations.slice(0, 8);
    return locations
      .filter((item) => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q))
      .slice(0, 8);
  }, [destinationInput, locations]);
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

  useEffect(() => {
    if (!validRoute || !origin?.id || !destination?.id) {
      setVehicles([]);
      return;
    }
    let canceled = false;
    setLoading(true);
    setError(null);
    fetch("/api/transfers/v2/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin_location_id: origin.id,
        destination_location_id: destination.id,
        passengers
      })
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("quote_error");
        const data = (await response.json()) as { vehicles?: QuoteVehicle[] };
        const allVehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
        const filtered = allVehicles.filter(isPremiumVehicle).sort(premiumSort);
        if (!canceled) setVehicles(filtered.length ? filtered : allVehicles.sort(premiumSort));
      })
      .catch(() => {
        if (!canceled) setError(copy.error);
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, [copy.error, destination?.id, origin?.id, passengers, validRoute]);

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

      <div className="grid gap-3 md:grid-cols-4">
        <label className="relative text-xs uppercase tracking-[0.25em] text-amber-200/80">
          {copy.origin}
          <input
            autoComplete="off"
            name="premium_origin"
            value={originInput}
            onChange={(event) => setOriginInput(event.target.value)}
            onFocus={() => setShowOriginList(true)}
            onBlur={() => setTimeout(() => setShowOriginList(false), 120)}
            placeholder={copy.originPlaceholder}
            className="mt-2 w-full rounded-xl border border-amber-200/30 bg-slate-900/80 px-3 py-2 text-sm text-white"
          />
          {showOriginList && originSuggestions.length > 0 ? (
            <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-amber-200/30 bg-slate-950/95 shadow-xl">
              {originSuggestions.map((item) => (
                <button
                  key={`origin-${item.id}`}
                  type="button"
                  onMouseDown={() => {
                    setOriginInput(item.name);
                    setShowOriginList(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-xs normal-case tracking-normal text-slate-100 hover:bg-slate-800"
                >
                  {item.name}
                </button>
              ))}
            </div>
          ) : null}
        </label>
        <label className="relative text-xs uppercase tracking-[0.25em] text-amber-200/80">
          {copy.destination}
          <input
            autoComplete="off"
            name="premium_destination"
            value={destinationInput}
            onChange={(event) => setDestinationInput(event.target.value)}
            onFocus={() => setShowDestinationList(true)}
            onBlur={() => setTimeout(() => setShowDestinationList(false), 120)}
            placeholder={copy.destinationPlaceholder}
            className="mt-2 w-full rounded-xl border border-amber-200/30 bg-slate-900/80 px-3 py-2 text-sm text-white"
          />
          {showDestinationList && destinationSuggestions.length > 0 ? (
            <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-amber-200/30 bg-slate-950/95 shadow-xl">
              {destinationSuggestions.map((item) => (
                <button
                  key={`destination-${item.id}`}
                  type="button"
                  onMouseDown={() => {
                    setDestinationInput(item.name);
                    setShowDestinationList(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-xs normal-case tracking-normal text-slate-100 hover:bg-slate-800"
                >
                  {item.name}
                </button>
              ))}
            </div>
          ) : null}
        </label>
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
            onChange={(event) =>
              setPassengers(Math.max(1, Math.min(16, Number(event.target.value || 1))))
            }
            className="mt-2 w-full rounded-xl border border-amber-200/30 bg-slate-900/80 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>
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

      {!loading && vehicles.length === 0 ? <p className="text-sm text-slate-300">{copy.noRates}</p> : null}
    </section>
  );
}
