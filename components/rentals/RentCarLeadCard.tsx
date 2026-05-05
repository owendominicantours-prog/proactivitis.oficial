"use client";

import { useMemo, useState } from "react";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import type { RentCarOption } from "@/data/rentCarFleet";

type RentCarLeadCardProps = {
  option: RentCarOption;
  compact?: boolean;
};

export default function RentCarLeadCard({ option, compact = false }: RentCarLeadCardProps) {
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("10:00");
  const [pickupPlace, setPickupPlace] = useState(`${option.airportLabel} Airport`);
  const [dropoffPlace, setDropoffPlace] = useState(option.locationName);
  const [flightNumber, setFlightNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

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
      flightNumber ? `Flight: ${flightNumber}` : "Flight: not provided",
      `Driver: ${driverName}`,
      `Phone: ${phone}`
    ].join("\n");

    window.open(`https://wa.me/18293939757?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const fieldClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white";
  const labelClass = "text-[11px] font-black uppercase tracking-[0.2em] text-slate-500";

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
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-red-600">High demand</p>
          <p className="mt-1 text-sm font-bold text-slate-600">From</p>
          <p className="text-4xl font-black tracking-tight text-slate-950">
            ${option.price.toFixed(option.price % 1 ? 2 : 0)}
            <span className="text-base font-black text-slate-600"> / day</span>
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
          2024/2025
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <label className={labelClass}>Pickup location</label>
          <input className={fieldClass} value={pickupPlace} onChange={(event) => setPickupPlace(event.target.value)} />
        </div>
        <div className="grid grid-cols-[1fr_118px] gap-2">
          <div>
            <label className={labelClass}>Pickup date</label>
            <input type="date" className={fieldClass} value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Time</label>
            <input type="time" className={fieldClass} value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Return location</label>
          <input className={fieldClass} value={dropoffPlace} onChange={(event) => setDropoffPlace(event.target.value)} />
        </div>
        <div className="grid grid-cols-[1fr_118px] gap-2">
          <div>
            <label className={labelClass}>Return date</label>
            <input type="date" className={fieldClass} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Time</label>
            <input type="time" className={fieldClass} value={returnTime} onChange={(event) => setReturnTime(event.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Flight number</label>
          <input
            className={fieldClass}
            placeholder="Optional, helps us track delays"
            value={flightNumber}
            onChange={(event) => setFlightNumber(event.target.value)}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <label className={labelClass}>Driver name</label>
            <input className={fieldClass} value={driverName} onChange={(event) => setDriverName(event.target.value)} />
          </div>
          <div>
            <label className={labelClass}>WhatsApp phone</label>
            <input className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Estimated total</p>
            <p className="mt-1 text-2xl font-black">${estimatedTotal.toFixed(estimatedTotal % 1 ? 2 : 0)}</p>
          </div>
          <p className="text-right text-xs font-bold text-slate-300">{rentalDays} day{rentalDays === 1 ? "" : "s"}</p>
        </div>
      </div>

      {touched && missingRequired ? (
        <p className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700">
          Complete pickup date, return date, driver name and WhatsApp phone to reserve.
        </p>
      ) : null}

      <button
        type="button"
        onClick={reserve}
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-sky-700"
      >
        Reserve this car
      </button>

      <div className="mt-3">
        <GoogleAuthButton
          label="Continue with Google"
          callbackUrl={option.href}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
        />
      </div>

      <div className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-800">
          Model 2024/2025 or confirmed similar class.
        </p>
        <p className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sky-800">
          Proactivitis VIP Support before and during pickup.
        </p>
        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
          Google News Approved Publisher trust layer.
        </p>
      </div>
    </aside>
  );
}
