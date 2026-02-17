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
  originId: string;
  originSlug: string;
  originLabel: string;
  destinations: DestinationOption[];
  title: string;
};

const UI = {
  es: {
    destination: "Destino",
    datetime: "Fecha y hora",
    passengers: "Pasajeros",
    loading: "Actualizando flota premium...",
    noRates: "No encontramos tarifas premium para esta ruta.",
    reserve: "Reservar VIP",
    oneWay: "Solo ida",
    perTrip: "por viaje",
    error: "No se pudo cargar la cotizacion premium."
  },
  en: {
    destination: "Destination",
    datetime: "Date and time",
    passengers: "Passengers",
    loading: "Updating premium fleet...",
    noRates: "No premium rates found for this route.",
    reserve: "Book VIP",
    oneWay: "One way",
    perTrip: "per trip",
    error: "Could not load premium quote."
  },
  fr: {
    destination: "Destination",
    datetime: "Date et heure",
    passengers: "Passagers",
    loading: "Mise a jour de la flotte premium...",
    noRates: "Aucun tarif premium trouve pour cette route.",
    reserve: "Reserver VIP",
    oneWay: "Aller simple",
    perTrip: "par trajet",
    error: "Impossible de charger le devis premium."
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
  originId,
  originSlug,
  originLabel,
  destinations,
  title
}: Props) {
  const copy = UI[locale] ?? UI.es;
  const now = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = now.toISOString().slice(11, 16);
  const [destinationId, setDestinationId] = useState(destinations[0]?.id ?? "");
  const [passengers, setPassengers] = useState(2);
  const [departureDate, setDepartureDate] = useState(defaultDate);
  const [departureTime, setDepartureTime] = useState(defaultTime);
  const [vehicles, setVehicles] = useState<QuoteVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destination = useMemo(
    () => destinations.find((item) => item.id === destinationId) ?? destinations[0],
    [destinationId, destinations]
  );
  const dateTime = `${departureDate}T${departureTime}`;

  useEffect(() => {
    if (!destination?.id) return;
    let canceled = false;
    setLoading(true);
    setError(null);
    fetch("/api/transfers/v2/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin_location_id: originId,
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
  }, [copy.error, destination?.id, originId, passengers]);

  return (
    <section className="space-y-5 rounded-[30px] border border-amber-200/40 bg-[#0f172a]/95 p-6 text-white shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
      <h2 className="text-2xl font-semibold text-amber-100">{title}</h2>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-xs uppercase tracking-[0.25em] text-amber-200/80">
          {copy.destination}
          <select
            value={destination?.id ?? ""}
            onChange={(event) => setDestinationId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-amber-200/30 bg-slate-900/80 px-3 py-2 text-sm text-white"
          >
            {destinations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
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

      {loading ? <p className="text-sm text-amber-100/70">{copy.loading}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {vehicles.map((vehicle) => (
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
                originSlug,
                destinationSlug: destination?.slug ?? "",
                originLabel,
                destinationLabel: destination?.name ?? "",
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
