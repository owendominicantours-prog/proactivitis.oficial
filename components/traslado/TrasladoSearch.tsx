"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  DEFAULT_ZONE_ID,
  getTransferPrice,
  resolveZoneId,
  trasladoPricing,
  VehicleCategory
} from "@/data/traslado-pricing";

export type LocationOption = {
  name: string;
  slug: string;
  destinationName?: string | null;
  microZoneName?: string | null;
};

const airportOptions = [
  { code: "PUJ", label: "Aeropuerto de Punta Cana (PUJ)" },
  { code: "SDQ", label: "Aeropuerto Internacional Las Américas (SDQ)" },
  { code: "POP", label: "Aeropuerto Internacional Gregorio Luperón (POP)" },
  { code: "LRM", label: "Aeropuerto Internacional La Romana (LRM)" }
];

const vehicleCatalog = [
  {
    id: "sedan-standard",
    title: "Sedán Privado",
    type: "Economy",
    description: "Perfecto para parejas o viajes de negocios ligeros.",
    pax: 3,
    luggage: 2,
    image: "/transfer/sedan.png",
    features: ["Aire acondicionado potente", "Espacio para 2 maletas grandes", "Seguimiento del vuelo incluido"]
  },
  {
    id: "van-private",
    title: "Van Privada",
    type: "Family",
    description: "Ideal para familias o grupos de amigos con equipaje.",
    pax: 8,
    luggage: 8,
    image: "/transfer/mini van.png",
    features: ["Maletero amplio", "Puerta corredera", "Silla de bebé bajo petición"]
  },
  {
    id: "suv-vip",
    title: "SUV Premium",
    type: "Luxury",
    description: "Viaja con estilo y discreción con chofer bilingüe.",
    pax: 5,
    luggage: 5,
    image: "/transfer/suv.png",
    features: ["Asientos de cuero", "Bebidas frías incluidas", "Chofer bilingüe profesional"]
  }
];
type VehicleOption = (typeof vehicleCatalog)[number] & { price: number };

const transferTourId = process.env.NEXT_PUBLIC_TRANSFER_TOUR_ID;
const transferTourTitle = process.env.NEXT_PUBLIC_TRANSFER_TITLE ?? "Transfer privado Proactivitis";
const transferTourImage = process.env.NEXT_PUBLIC_TRANSFER_IMAGE ?? "/transfer/sedan.png";

const bookingSteps = [
  { step: 1, name: "Selección de vehículo" },
  { step: 2, name: "Detalles del vuelo" },
  { step: 3, name: "Confirmación inmediata" }
];

const trustLabels = [
  "Precio final sin sorpresas",
  "Conductores profesionales",
  "Seguro de viaje incluido",
  "Cancelación gratis (24h)"
];

const pickupRules = [
  {
    title: "Datos de vuelo",
    description: "Aerolínea · Número de vuelo · Hora estimada de aterrizaje",
    note: "60 min de espera gratuita en el aeropuerto"
  },
  {
    title: "Recogida en hotel",
    description: "Hotel/dirección · Hora preferida de recogida",
    note: "15 min de espera en lobby · Recomendamos 4h antes de la salida"
  }
];

const airportZoneMapping: Record<string, string> = {
  PUJ: "PUJ_BAVARO",
  SDQ: "SANTO_DOMINGO",
  POP: "NORTE_CIBAO",
  LRM: "ROMANA_BAYAHIBE"
};

const vehicleCategoryMap: Record<string, VehicleCategory> = {
  "sedan-standard": "SEDAN",
  "van-private": "VAN",
  "suv-vip": "SUV"
};

type Props = {
  hotels: LocationOption[];
};

export default function TrasladoSearch({ hotels }: Props) {
  const defaultHotel = hotels[0];
  const defaultAirport = airportOptions[0];
  const [destinationSlug, setDestinationSlug] = useState(defaultHotel?.slug ?? "hard-rock-punta-cana");
  const [destinationLabel, setDestinationLabel] = useState(
    defaultHotel?.name ?? "Hard Rock Hotel & Casino Punta Cana"
  );
  const [originLabel, setOriginLabel] = useState(defaultAirport.label);
  const [originCode, setOriginCode] = useState(defaultAirport.code);
  const [passengers, setPassengers] = useState(2);
  const [dateTime, setDateTime] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedHotel = useMemo(
    () => hotels.find((hotel) => hotel.slug === destinationSlug),
    [destinationSlug, hotels]
  );

  const destinationZoneId = resolveZoneId(selectedHotel);
  const zoneEntry = trasladoPricing.nodes.find((node) => node.id === destinationZoneId);
  const zoneLabel = zoneEntry?.name ?? "Punta Cana / República Dominicana";
  const originZoneId = airportZoneMapping[originCode] ?? DEFAULT_ZONE_ID;
  const vehicles = useMemo<VehicleOption[]>(
    () =>
      vehicleCatalog.map((vehicle) => {
        const category = vehicleCategoryMap[vehicle.id] ?? "SEDAN";
        const price = getTransferPrice(originZoneId, destinationZoneId, category);
        return { ...vehicle, price };
      }),
    [destinationZoneId, originZoneId]
  );

  const dateValue = dateTime ? dateTime.split("T")[0] : "";
  const timeValue = dateTime ? dateTime.split("T")[1] : "";
  const baseTransferParams = useMemo(() => {
    if (!dateValue || !timeValue || !selectedHotel) return null;
    const payload: Record<string, string> = {
      type: "transfer",
      date: dateValue,
      time: timeValue,
      adults: String(passengers),
      youth: "0",
      child: "0",
      hotelSlug: selectedHotel.slug,
      originHotelName: selectedHotel.name,
      origin: originCode
    };
    if (transferTourId) {
      payload.tourId = transferTourId;
    }
    if (transferTourImage) {
      payload.tourImage = transferTourImage;
    }
    return payload;
  }, [dateValue, timeValue, passengers, selectedHotel, originCode]);

  const buildCheckoutHref = (vehicle: VehicleOption) => {
    if (!baseTransferParams) return "/checkout?type=transfer";
    const params = new URLSearchParams(baseTransferParams);
    const vehicleTitle = `${transferTourTitle} · ${vehicle.title}`;
    params.set("tourTitle", vehicleTitle);
    params.set("tourImage", vehicle.image);
    params.set("tourPrice", vehicle.price.toFixed(2));
    params.set("vehicleId", vehicle.id);
    params.set("passengers", String(passengers));
    if (!transferTourId) {
      params.delete("tourId");
    }
    return `/checkout?${params.toString()}`;
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedHotel) {
      setErrorMessage("Selecciona un hotel válido");
      return;
    }
    if (!dateTime) {
      setErrorMessage("Indica la fecha y hora de llegada");
      return;
    }
    setErrorMessage(null);
    setShowResults(true);
    setFormCollapsed(true);
  };

  const summaryDate =
    dateTime &&
    new Date(dateTime).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

  const paymentMethods = ["Stripe", "PayPal", "Credit Card"];

  const resetSearchForm = () => {
    setFormCollapsed(false);
  };

  return (
    <div className="space-y-8">
      {formCollapsed && showResults && (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-6 text-slate-900 shadow">
          <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">Reserva lista</p>
              <p className="text-lg font-semibold">
                {originLabel} → {selectedHotel?.name ?? "tu hotel"}
              </p>
              <p className="text-sm text-slate-600">
                {summaryDate ?? "Fecha pendiente"} · {passengers} pasajero{passengers > 1 ? "s" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={resetSearchForm}
              className="rounded-full border border-emerald-300 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              Modificar
            </button>
          </div>
        </div>
      )}
      <div className={`rounded-[32px] border ${formCollapsed ? "border-transparent" : "border-slate-200"} bg-white/90 p-6 shadow-xl`}>
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Traslado privado</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Traslados privados desde el aeropuerto
        </h1>
        <p className="text-sm text-slate-500">Confirma tu traslado premium con chofer bilingüe y cancelación flexible.</p>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Zona estimada: {zoneLabel}</p>
        {!formCollapsed && (
          <form className="mt-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end" onSubmit={handleSearch}>
            <label className="flex-1 min-w-[180px] text-sm text-slate-500">
              Origen
              <input
                list="airports"
                value={originLabel}
                onChange={(event) => {
                  const value = event.target.value;
                  setOriginLabel(value);
                  const match = airportOptions.find((option) => option.label.toLowerCase() === value.toLowerCase());
                  if (match) {
                    setOriginCode(match.code);
                  }
                }}
                placeholder="Selecciona el aeropuerto"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <datalist id="airports">
                {airportOptions.map((airport) => (
                  <option key={airport.code} value={airport.label} />
                ))}
              </datalist>
            </label>
            <label className="flex-1 min-w-[180px] text-sm text-slate-500">
              Destino
              <input
                list="hotels"
                value={destinationLabel}
                onChange={(event) => {
                  const value = event.target.value;
                  setDestinationLabel(value);
                  const matched = hotels.find((hotel) => hotel.name.toLowerCase() === value.toLowerCase());
                  if (matched) {
                    setDestinationSlug(matched.slug);
                  }
                }}
                placeholder="Escribe tu hotel"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none"
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
              Fecha y hora de llegada
              <input
                type="datetime-local"
                value={dateTime}
                required
                onChange={(event) => setDateTime(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none"
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
              className="md:ml-auto rounded-2xl bg-emerald-600 px-8 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
            >
              VER PRECIOS
            </button>
          </form>
        )}
        {errorMessage && !formCollapsed && (
          <p className="mt-4 text-sm font-semibold text-rose-600">{errorMessage}</p>
        )}
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
                  <p className="text-3xl font-black text-indigo-600">${vehicle.price.toFixed(2)}</p>
                </div>
                <ul className="mt-4 space-y-1 text-xs text-slate-500">
                  {vehicle.features.map((feature) => (
                    <li key={`${vehicle.id}-${feature}`}>{feature}</li>
                  ))}
                </ul>
                <Link
                  href={buildCheckoutHref(vehicle)}
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
              Conectarás al checkout con la nota «Reserva de traslado» y nuestra tarifa cifrada.
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
