"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type LocationOption = {
  name: string;
  slug: string;
  destinationName?: string | null;
  microZoneName?: string | null;
};

const vehicleCatalog = [
  {
    id: "sedan",
    title: "Economy · Sedán",
    description: "Ideal para parejas o familias pequeñas. Máximo 3 maletas.",
    pax: 3,
    luggage: 3,
    basePrice: 75,
    image: "/cars/sedan.png"
  },
  {
    id: "van",
    title: "Van Estándar",
    description: "Perfecto para grupos. Hasta 8 pasajeros cómodamente.",
    pax: 8,
    luggage: 6,
    basePrice: 120,
    image: "/cars/van.png"
  },
  {
    id: "suv",
    title: "SUV Premium",
    description: "Viaja con estilo. Chevrolet Suburban o similar.",
    pax: 6,
    luggage: 5,
    basePrice: 160,
    image: "/cars/suv.png"
  }
];

const zoneModifiers: Record<string, number> = {
  "Cap Cana": 1.3,
  "Bávaro": 1.1,
  "Punta Cana": 1.0,
  "Punta Cana Resort": 1.05,
  "Uvero Alto": 1.25
};

const buildPrice = (base: number, zone?: string | null) => {
  const multiplier = zone ? zoneModifiers[zone] ?? 1.0 : 1.0;
  return Math.round(base * multiplier);
};

const featureHighlights = [
  "✅ Meet & Greet incluido con tu nombre",
  "✅ 60 min de espera gratuita",
  "✅ Cancelación sin costo hasta 24h antes",
  "✅ Precio final sin peajes ocultos"
];

type Props = {
  hotels: LocationOption[];
};

export default function TransportSearch({ hotels }: Props) {
  const defaultHotel = hotels[0];
  const [destinationSlug, setDestinationSlug] = useState(defaultHotel?.slug ?? "hard-rock-punta-cana");
  const [destinationLabel, setDestinationLabel] = useState(defaultHotel?.name ?? "Hard Rock Hotel & Casino Punta Cana");
  const [passengers, setPassengers] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [showResults, setShowResults] = useState(false);

  const selectedHotel = useMemo(
    () => hotels.find((hotel) => hotel.slug === destinationSlug),
    [destinationSlug, hotels]
  );

  const zoneName = selectedHotel?.destinationName ?? selectedHotel?.microZoneName ?? "Punta Cana";

  const vehicles = useMemo(() => {
    return vehicleCatalog.map((vehicle) => ({
      ...vehicle,
      price: buildPrice(vehicle.basePrice, zoneName)
    }));
  }, [zoneName]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setShowResults(true);
  };

  return (
    <div className="space-y-10">
      <div className="rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Transporte privado</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Reserva desde Aeropuerto hasta tu hotel</h1>
        <p className="text-sm text-slate-500">
          Llena los datos y elige tu vehículo en tres clics. Nos encargamos de coordinar la recogida en el lobby.
        </p>
        <form className="mt-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end" onSubmit={handleSearch}>
          <label className="flex-1 min-w-[180px] text-sm text-slate-500">
            Origen
            <input
              readOnly
              value="Aeropuerto de Punta Cana (PUJ)"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <label className="flex-1 min-w-[180px] text-sm text-slate-500">
            Destino
            <input
              list="hotels"
              value={destinationLabel}
              onChange={(event) => {
                const value = event.target.value;
                setDestinationLabel(value);
                const matched = hotels.find(
                  (hotel) => hotel.name.toLowerCase() === value.toLowerCase()
                );
                if (matched) {
                  setDestinationSlug(matched.slug);
                }
              }}
              placeholder="Escribe tu hotel"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
            <datalist id="hotels">
              {hotels.map((hotel) => (
                <option key={hotel.slug} value={hotel.name}>
                  {hotel.name}
                </option>
              ))}
            </datalist>
          </label>
          <label className="flex-1 min-w-[140px] text-sm text-slate-500">
            Fecha
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <label className="flex-1 min-w-[140px] text-sm text-slate-500">
            Hora
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <div className="flex flex-1 min-w-[140px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base">
            <span className="text-sm text-slate-600">Pasajeros</span>
            <div className="flex items-center gap-2 text-slate-900">
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-lg font-semibold"
                onClick={() => setPassengers((value) => Math.max(1, value - 1))}
              >
                -
              </button>
              <span>{passengers}</span>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-lg font-semibold"
                onClick={() => setPassengers((value) => Math.min(12, value + 1))}
              >
                +
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="md:ml-auto rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Ver precios
          </button>
        </form>
      </div>
      {showResults && (
        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Opciones disponibles</p>
            <h2 className="text-2xl font-bold text-slate-900">
              Lleva a tu grupo de {passengers} pax a {selectedHotel?.name ?? "tu hotel"}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {vehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className="flex h-full flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
              >
                <img src={vehicle.image} alt={vehicle.title} className="h-32 w-full rounded-2xl object-cover" />
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">{vehicle.title}</h3>
                  <p className="text-sm text-slate-500">{vehicle.description}</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {vehicle.pax} pax · {vehicle.luggage} maletas
                  </p>
                  <p className="text-3xl font-black text-indigo-600">${vehicle.price}</p>
                </div>
                <ul className="mt-4 space-y-1 text-xs text-slate-500">
                  {featureHighlights.map((feature) => (
                    <li key={`${vehicle.id}-${feature}`}>{feature}</li>
                  ))}
                </ul>
                <Link
                  href={`/checkout?transport=true&destination=${destinationSlug}&passengers=${passengers}&vehicle=${vehicle.id}`}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-indigo-500"
                >
                  Seleccionar
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
