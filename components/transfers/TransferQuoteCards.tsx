"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type QuoteVehicle = {
  id: string;
  name: string;
  category: string;
  minPax: number;
  maxPax: number;
  price: number;
  imageUrl?: string | null;
};

type TransferQuoteCardsProps = {
  originId: string;
  destinationId: string;
  originSlug: string;
  destinationSlug: string;
  originLabel: string;
  destinationLabel: string;
  defaultDeparture: string;
  defaultPassengers?: number;
  priceFrom: number;
};

const ROUND_TRIP_DISCOUNT_PERCENT = Number(process.env.NEXT_PUBLIC_ROUND_TRIP_DISCOUNT_PERCENT ?? 5);

const formatDate = (value: string) => value;

const fetchQuote = async ({
  originId,
  destinationId,
  passengers
}: {
  originId: string;
  destinationId: string;
  passengers: number;
}) => {
  const response = await fetch("/api/transfers/v2/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin_location_id: originId,
      destination_location_id: destinationId,
      passengers
    })
  });
  if (!response.ok) {
    throw response;
  }
  const data = await response.json();
  return data as { vehicles: QuoteVehicle[] };
};

const buildCheckoutHref = ({
  vehicleId,
  price,
  passengers,
  originSlug,
  destinationSlug,
  originLabel,
  tripType,
  dateTime,
  returnDatetime
}: {
  vehicleId: string;
  price: number;
  passengers: number;
  originSlug: string;
  destinationSlug: string;
  originLabel: string;
  tripType: "one-way" | "round-trip";
  dateTime: string;
  returnDatetime?: string;
}) => {
  const params = new URLSearchParams();
  params.set("type", "transfer");
  params.set("hotelSlug", destinationSlug);
  params.set("origin", originSlug);
  params.set("originLabel", originLabel);
  params.set("originHotelName", originLabel);
  params.set("vehicleId", vehicleId);
  params.set("price", price.toFixed(2));
  params.set("passengers", String(passengers));
  params.set("adults", String(passengers));
  params.set("youth", "0");
  params.set("child", "0");
  params.set("tripType", tripType);
  params.set("dateTime", dateTime);
  const [datePart, timePart] = dateTime.split("T");
  if (datePart) {
    params.set("date", datePart);
  }
  if (timePart) {
    params.set("time", timePart);
  }
  if (returnDatetime) {
    params.set("returnDatetime", returnDatetime);
  }
  return `/checkout?${params.toString()}`;
};

export default function TransferQuoteCards({
  originId,
  destinationId,
  originSlug,
  destinationSlug,
  originLabel,
  destinationLabel,
  defaultDeparture,
  defaultPassengers = 2,
  priceFrom
}: TransferQuoteCardsProps) {
  const [passengers, setPassengers] = useState(defaultPassengers);
  const [departureDate, setDepartureDate] = useState(defaultDeparture.slice(0, 10));
  const [departureTime, setDepartureTime] = useState(defaultDeparture.slice(11, 16));
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [vehicles, setVehicles] = useState<QuoteVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const departureDatetime = useMemo(
    () => `${departureDate}T${departureTime}`,
    [departureDate, departureTime]
  );
  const returnDatetime = useMemo(
    () => (returnDate && returnTime ? `${returnDate}T${returnTime}` : undefined),
    [returnDate, returnTime]
  );

  useEffect(() => {
    let canceled = false;
    setLoading(true);
    setError(null);
    fetchQuote({ originId, destinationId, passengers })
      .then((data) => {
        if (!canceled) {
          setVehicles(data.vehicles);
        }
      })
      .catch((err) => {
        if (!canceled) {
          setError("No fue posible calcular la tarifa. Intenta nuevamente.");
          console.error(err);
        }
      })
      .finally(() => {
        if (!canceled) {
          setLoading(false);
        }
      });
    return () => {
      canceled = true;
    };
  }, [originId, destinationId, passengers]);

  const roundTripMultiplier = useMemo(
    () => 2 * (1 - ROUND_TRIP_DISCOUNT_PERCENT / 100),
    []
  );

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-500">
            Fecha y hora
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500"
              />
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500"
              />
            </div>
          </label>
          <label className="space-y-1 text-sm text-slate-500">
            Pasajeros
            <input
              type="number"
              min={1}
              max={16}
              value={passengers}
              onChange={(event) => setPassengers(Math.max(1, Math.min(16, Number(event.target.value))))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTripType("one-way")}
            className={`rounded-full px-4 py-2 ${
              tripType === "one-way" ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-700"
            }`}
          >
            Solo ida
          </button>
          <button
            type="button"
            onClick={() => setTripType("round-trip")}
            className={`rounded-full px-4 py-2 ${
              tripType === "round-trip" ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-700"
            }`}
          >
            Ida y vuelta
          </button>
          {tripType === "round-trip" && (
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500"
              />
              <input
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500"
              />
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4 rounded-[32px] border border-slate-100 bg-white/90 p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Precio desde <strong className="text-slate-900">${priceFrom.toFixed(2)}</strong> por pasajero. Datos actualizados instantáneamente.
        </p>
        {loading && <p className="text-sm text-slate-500">Actualizando tarifas...</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="grid gap-6 md:grid-cols-2">
          {vehicles.map((vehicle) => {
            const oneWayPrice = vehicle.price;
            const roundTripPrice = Number((vehicle.price * roundTripMultiplier).toFixed(2));
            const displayPrice = tripType === "round-trip" ? roundTripPrice : oneWayPrice;
            const reserveUrl = buildCheckoutHref({
              vehicleId: vehicle.id,
              price: displayPrice,
              passengers,
              originSlug,
              destinationSlug,
              originLabel,
              tripType,
              dateTime: departureDatetime,
              returnDatetime: tripType === "round-trip" ? returnDatetime : undefined
            });
            return (
              <article key={vehicle.id} className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="space-y-3">
                  {vehicle.imageUrl && (
                    <img src={vehicle.imageUrl} alt={vehicle.name} className="h-48 w-full rounded-2xl object-cover" />
                  )}
                  <h3 className="text-xl font-semibold text-slate-900">{vehicle.name}</h3>
                  <p className="text-sm text-slate-500">{vehicle.minPax}–{vehicle.maxPax} pasajeros</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${displayPrice.toFixed(2)}
                    {tripType === "round-trip" ? " total (ida y vuelta)" : " por trayecto"}
                  </p>
                  <ul className="space-y-1 text-xs text-slate-500">
                    <li>• Transfer privado y directo</li>
                    <li>• Aire acondicionado y Wi-Fi</li>
                    <li>• Chofer verificado y soporte 24/7</li>
                  </ul>
                </div>
                <Link
                  href={reserveUrl}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
                >
                  Reserve Now
                </Link>
              </article>
            );
          })}
          {!loading && !vehicles.length && (
            <p className="text-sm text-slate-500">Ajusta los pasajeros o fecha para ver tarifas disponibles.</p>
          )}
        </div>
      </div>
    </section>
  );
}
