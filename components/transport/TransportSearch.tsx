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
    id: "sedan-standard",
    title: "Sedán Privado",
    type: "Economy",
    description: "Perfecto para parejas o viajes de negocios rápidos.",
    pax: 3,
    luggage: 2,
    basePrice: 35,
    image: "/transfer/sedan.png",
    features: ["Aire acondicionado potente", "Espacio para 2 maletas grandes", "Seguimiento de vuelo incluido"]
  },
  {
    id: "van-private",
    title: "Van Privada",
    type: "Family",
    description: "La opción preferida para familias y grupos de amigos.",
    pax: 8,
    luggage: 8,
    basePrice: 55,
    image: "/transfer/mini van.png",
    features: ["Ideal para hasta 8 personas", "Maletero de gran capacidad", "Silla de bebé (bajo petición)"]
  },
  {
    id: "suv-vip",
    title: "SUV Premium",
    type: "Luxury",
    description: "Viaja con el máximo confort y total discreción.",
    pax: 5,
    luggage: 5,
    basePrice: 95,
    image: "/transfer/suv.png",
    features: ["Vehículo de lujo (Suburban o similar)", "Bebidas frías incluidas", "Chofer bilingüe profesional"]
  }
];

const pricingEngine = {
  globalBase: 35.0,
  roundTripFactor: 0.9,
  vehicleMultipliers: {
    sedan_economy: 1.0,
    van_private: 1.65,
    suv_premium: 2.85
  },
  zoneMatrix: {
    PUJ_BAVARO: { m: 1.0, names: ["Punta Cana", "Bávaro", "Cap Cana", "Pueblo Bávaro"] },
    UVERO_MICHES: { m: 1.7, names: ["Uvero Alto", "Miches", "Sabana de la Mar", "Macao"] },
    ROMANA_BAYAHIBE: { m: 2.6, names: ["La Romana", "Bayahibe", "Dominicus", "LRM Airport"] },
    SANTO_DOMINGO: { m: 4.5, names: ["Distrito Nacional", "SDQ Airport", "Boca Chica", "Juan Dolio"] },
    SAMANA: { m: 8.5, names: ["Las Terrenas", "Samaná Port", "Las Galeras", "El Limón"] },
    NORTE_CIBAO: { m: 9.5, names: ["Santiago", "STI Airport", "Puerto Plata", "Cabarete", "Sosúa"] },
    SUR_PROFUNDO: { m: 12.0, names: ["Barahona", "Pedernales", "Bahía de las Águilas", "Baní"] }
  }
};

const bookingSteps = [
  { step: 1, name: "Selección de vehículo" },
  { step: 2, name: "Detalles del vuelo" },
  { step: 3, name: "Confirmación inmediata" }
];

const trustLabels = [
  "Precio Final Sin Sorpresas",
  "Conductores Profesionales",
  "Seguro de Viaje Incluido",
  "Cancelación Gratis (24h)"
];

const pickupRules = [
  {
    title: "Datos de Vuelo",
    description: "Aerolínea · Número de Vuelo · Hora de Aterrizaje",
    note: "60 min de espera gratuita"
  },
  {
    title: "Recogida en Hotel",
    description: "Hotel / Dirección · Hora de Recogida preferida",
    note: "15 min de espera en lobby · Sugerimos 4h antes del vuelo"
  }
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type ZoneKey = keyof typeof pricingEngine.zoneMatrix;

const resolveZoneKey = (hotel?: LocationOption): ZoneKey => {
  if (!hotel) return "PUJ_BAVARO";
  const name = hotel.name;
  for (const [zoneKey, zone] of Object.entries(pricingEngine.zoneMatrix)) {
    if (zone.names.some((zoneName) => zoneName.toLowerCase() === name.toLowerCase())) {
      return zoneKey as ZoneKey;
    }
    if (hotel.destinationName && zone.names.some((zoneName) => zoneName.toLowerCase() === hotel.destinationName?.toLowerCase())) {
      return zoneKey as ZoneKey;
    }
  }
  return "PUJ_BAVARO";
};

const vehicleMultiplierMap: Record<string, number> = {
  sedan_standard: pricingEngine.vehicleMultipliers.sedan_economy,
  van_private: pricingEngine.vehicleMultipliers.van_private,
  suv_vip: pricingEngine.vehicleMultipliers.suv_premium
};

const computePrice = (vehicleId: string, zoneKey: ZoneKey) => {
  const base = pricingEngine.globalBase;
  const vehicleMult = vehicleMultiplierMap[vehicleId] ?? 1.0;
  const zone = pricingEngine.zoneMatrix[zoneKey];
  const zoneMult = zone?.m ?? 1.0;
  return Math.round(base * vehicleMult * zoneMult * pricingEngine.roundTripFactor);
};

type Props = {
  hotels: LocationOption[];
};

export default function TransportSearch({ hotels }: Props) {
  const defaultHotel = hotels[0];
  const [destinationSlug, setDestinationSlug] = useState(defaultHotel?.slug ?? "hard-rock-punta-cana");
  const [destinationLabel, setDestinationLabel] = useState(
    defaultHotel?.name ?? "Hard Rock Hotel & Casino Punta Cana"
  );
  const [passengers, setPassengers] = useState(2);
  const [dateTime, setDateTime] = useState("");
  const [showResults, setShowResults] = useState(false);

  const selectedHotel = useMemo(
    () => hotels.find((hotel) => hotel.slug === destinationSlug),
    [destinationSlug, hotels]
  );

  const zoneName = selectedHotel?.destinationName ?? selectedHotel?.microZoneName ?? "Punta Cana";

  const zoneKey = resolveZoneKey(selectedHotel);
  const zoneLabel = pricingEngine.zoneMatrix[zoneKey]?.names[0] ?? "Punta Cana";
  const vehicles = useMemo(() => {
    return vehicleCatalog.map((vehicle) => ({
      ...vehicle,
      price: computePrice(vehicle.id, zoneKey)
    }));
  }, [zoneKey]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setShowResults(true);
  };

  const paymentMethods = ["Stripe", "PayPal", "Credit Card"];
  const checkoutBase = `/checkout?type=transfer&hotelId=${selectedHotel?.slug ?? destinationSlug}`;

  return (
    <div className="space-y-10">
      <div className="rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Transporte privado</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Traslados Privados Aeropuerto</h1>
        <p className="text-sm text-slate-500">
          Selecciona el vehículo ideal para tu llegada a Punta Cana.
        </p>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Zona estimada: {zoneLabel}</p>
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
          <label className="flex-1 min-w-[180px] text-sm text-slate-500">
            Fecha y Hora de Llegada
            <input
              type="datetime-local"
              value={dateTime}
              required
              onChange={(event) => setDateTime(event.target.value)}
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
            VER PRECIOS
          </button>
        </form>
      </div>
      <section className="grid gap-4 rounded-[28px] border border-slate-100 bg-white/90 p-6 shadow-sm md:grid-cols-4">
        {trustLabels.map((label) => (
          <div key={label} className="text-center text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{label}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-3 rounded-[28px] border border-slate-100 bg-white/90 p-6 shadow-sm md:grid-cols-3">
        {bookingSteps.map((step) => (
          <div key={step.step} className="text-center text-sm text-slate-600">
            <span className="text-lg font-bold text-slate-900">Paso {step.step}</span>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{step.name}</p>
          </div>
        ))}
      </section>
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
                  {vehicle.features.map((feature) => (
                    <li key={`${vehicle.id}-${feature}`}>{feature}</li>
                  ))}
                </ul>
                <Link
                  href={`${checkoutBase}&passengers=${passengers}&vehicle=${vehicle.id}`}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-indigo-500"
                >
                  SELECCIONAR Y PAGAR
                </Link>
              </article>
            ))}
          </div>
          <section className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pago seguro</p>
                <p className="text-lg font-semibold text-slate-900">Elige tu método favorito</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map((method) => (
                  <span key={method} className="rounded-full border border-slate-200 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                    {method}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Conectarás al checkout con la nota “Reserva de transporte” y nuestra tarifa cifrada. Confirmamos tu traslado en segundos.
            </p>
          </section>
          <section className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              {pickupRules.map((rule) => (
                <div key={rule.title} className="space-y-1 text-sm text-slate-600">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{rule.title}</p>
                  <p className="font-semibold text-slate-900">{rule.description}</p>
                  <p className="text-xs text-slate-500">{rule.note}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      )}
    </div>
  );
}
