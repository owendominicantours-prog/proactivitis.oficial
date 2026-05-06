"use client";

import { useMemo, useState } from "react";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import {
  getRentCarCopy,
  getRentCarOptionPath,
  type RentCarLocale,
  type RentCarOption
} from "@/data/rentCarFleet";

type RentCarLeadCardProps = {
  option: RentCarOption;
  compact?: boolean;
  locale?: RentCarLocale;
};

export default function RentCarLeadCard({ option, compact = false, locale = "en" }: RentCarLeadCardProps) {
  const copy = getRentCarCopy(locale);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("10:00");
  const [pickupPlace, setPickupPlace] = useState(option.locationName);
  const [dropoffPlace, setDropoffPlace] = useState(option.locationName);
  const [flightNumber, setFlightNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const localizedHref = getRentCarOptionPath(option.locationId, option.categorySlug, locale);
  const pickupIsAirport = /airport|aeropuerto|aeroport/i.test(pickupPlace) || pickupPlace.toUpperCase().includes(option.airportLabel);

  const rentalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 1;
    const start = new Date(`${pickupDate}T${pickupTime || "00:00"}`).getTime();
    const end = new Date(`${returnDate}T${returnTime || "00:00"}`).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 1;
    return Math.max(1, Math.ceil((end - start) / 86400000));
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  const estimatedTotal = option.price * rentalDays;
  const missingRequired = !pickupDate || !returnDate || !pickupPlace.trim() || !dropoffPlace.trim() || !driverName.trim() || !phone.trim();

  const reserve = () => {
    setTouched(true);
    if (missingRequired) return;

    const message = [
      `Rent a car request: ${option.model}`,
      `Zone: ${option.locationName}`,
      `Price: $${option.price} ${option.currency}/day`,
      `Estimated days: ${rentalDays}`,
      `Estimated total: $${estimatedTotal.toFixed(estimatedTotal % 1 ? 2 : 0)} ${option.currency}`,
      `Pickup: ${pickupPlace} - ${pickupDate} ${pickupTime}`,
      `Return: ${dropoffPlace} - ${returnDate} ${returnTime}`,
      pickupIsAirport && flightNumber ? `Flight: ${flightNumber}` : null,
      `Driver: ${driverName}`,
      `Phone: ${phone}`
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/18293939757?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const fieldClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";
  const labelClass = "text-[11px] font-black uppercase tracking-[0.2em] text-slate-500";
  const labels =
    locale === "es"
      ? {
          pickup: "Recogida",
          pickupAirport: "Aeropuerto",
          pickupAddress: "Hotel o direccion",
          pickupDate: "Fecha recogida",
          returnPlace: "Devolucion",
          returnDate: "Fecha devolucion",
          time: "Hora",
          flight: "Numero de vuelo",
          flightHint: "Solo si llegas por aeropuerto",
          driver: "Nombre del conductor",
          phone: "WhatsApp",
          total: "Total estimado",
          missing: "Completa fecha de recogida, devolucion, conductor y WhatsApp para reservar.",
          cta: "Reservar este vehiculo",
          google: "Continuar con Google",
          trust1: "Modelo 2024/2025 o categoria similar confirmada.",
          trust2: "Soporte VIP Proactivitis antes y durante la recogida.",
          trust3: "Precio final por dia, limpio y confirmado antes de pagar."
        }
      : locale === "fr"
        ? {
            pickup: "Prise en charge",
            pickupAirport: "Aeroport",
            pickupAddress: "Hotel ou adresse",
            pickupDate: "Date prise",
            returnPlace: "Retour",
            returnDate: "Date retour",
            time: "Heure",
            flight: "Numero de vol",
            flightHint: "Seulement si vous arrivez par aeroport",
            driver: "Nom du conducteur",
            phone: "WhatsApp",
            total: "Total estime",
            missing: "Completez les dates, le conducteur et WhatsApp pour reserver.",
            cta: "Reserver ce vehicule",
            google: "Continuer avec Google",
            trust1: "Modele 2024/2025 ou categorie similaire confirmee.",
            trust2: "Support VIP Proactivitis avant et pendant la prise en charge.",
            trust3: "Prix final par jour, clair et confirme avant paiement."
          }
        : {
            pickup: "Pickup",
            pickupAirport: "Airport",
            pickupAddress: "Hotel or address",
            pickupDate: "Pickup date",
            returnPlace: "Return",
            returnDate: "Return date",
            time: "Time",
            flight: "Flight number",
            flightHint: "Only if arriving by airport",
            driver: "Driver name",
            phone: "WhatsApp phone",
            total: "Estimated total",
            missing: "Complete pickup date, return date, driver name and WhatsApp phone to reserve.",
            cta: "Reserve this car",
            google: "Continue with Google",
            trust1: "Model 2024/2025 or confirmed similar class.",
            trust2: "Proactivitis VIP Support before and during pickup.",
            trust3: "Clean final daily price confirmed before payment."
          };

  return (
    <aside
      id="rentcar-booking"
      className={
        compact
          ? "rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/40"
          : "rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-red-600">{copy.highDemand}</p>
          <p className="mt-1 text-sm font-bold text-slate-600">{String(copy.from)}</p>
          <p className="text-4xl font-black tracking-tight text-emerald-700">
            ${option.price.toFixed(option.price % 1 ? 2 : 0)}
            <span className="text-base font-black text-slate-600"> / {String(copy.day)}</span>
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
          2024/2025
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setPickupPlace(`${option.airportLabel} Airport`)}
            className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
              pickupIsAirport ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white"
            }`}
          >
            {labels.pickupAirport}
          </button>
          <button
            type="button"
            onClick={() => setPickupPlace(option.locationName)}
            className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
              !pickupIsAirport ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white"
            }`}
          >
            {labels.pickupAddress}
          </button>
        </div>
        <div>
          <label className={labelClass}>{labels.pickup}</label>
          <input className={fieldClass} value={pickupPlace} onChange={(event) => setPickupPlace(event.target.value)} />
        </div>
        <div className="grid grid-cols-[1fr_118px] gap-2">
          <div>
            <label className={labelClass}>{labels.pickupDate}</label>
            <input type="date" className={fieldClass} value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{labels.time}</label>
            <input type="time" className={fieldClass} value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>{labels.returnPlace}</label>
          <input className={fieldClass} value={dropoffPlace} onChange={(event) => setDropoffPlace(event.target.value)} />
        </div>
        <div className="grid grid-cols-[1fr_118px] gap-2">
          <div>
            <label className={labelClass}>{labels.returnDate}</label>
            <input type="date" className={fieldClass} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{labels.time}</label>
            <input type="time" className={fieldClass} value={returnTime} onChange={(event) => setReturnTime(event.target.value)} />
          </div>
        </div>
        {pickupIsAirport ? (
          <div>
            <label className={labelClass}>{labels.flight}</label>
            <input
              className={fieldClass}
              placeholder={labels.flightHint}
              value={flightNumber}
              onChange={(event) => setFlightNumber(event.target.value)}
            />
          </div>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <label className={labelClass}>{labels.driver}</label>
            <input className={fieldClass} value={driverName} onChange={(event) => setDriverName(event.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{labels.phone}</label>
            <input className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-emerald-600 p-4 text-white">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-100">{labels.total}</p>
            <p className="mt-1 text-2xl font-black">${estimatedTotal.toFixed(estimatedTotal % 1 ? 2 : 0)}</p>
          </div>
          <p className="text-right text-xs font-bold text-emerald-50">{rentalDays} {copy.day}{rentalDays === 1 ? "" : "s"}</p>
        </div>
      </div>

      {touched && missingRequired ? (
        <p className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700">
          {labels.missing}
        </p>
      ) : null}

      <button
        type="button"
        onClick={reserve}
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700"
      >
        {labels.cta}
      </button>

      <div className="mt-3">
        <GoogleAuthButton
          label={labels.google}
          callbackUrl={localizedHref}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
        />
      </div>

      <div className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-800">
          {labels.trust1}
        </p>
        <p className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sky-800">
          {labels.trust2}
        </p>
        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
          {labels.trust3}
        </p>
      </div>
    </aside>
  );
}
