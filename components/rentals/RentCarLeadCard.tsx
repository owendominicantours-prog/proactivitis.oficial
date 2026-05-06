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

const money = (value: number) => value.toFixed(value % 1 ? 2 : 0);

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
  const taxesAndSupport = Math.max(0, Math.round(estimatedTotal * 0.08));
  const missingRequired = !pickupDate || !returnDate || !pickupPlace.trim() || !dropoffPlace.trim() || !driverName.trim() || !phone.trim();

  const labels =
    locale === "es"
      ? {
          perDay: "por dia",
          benefitsTitle: "Beneficios al reservar este auto",
          cancel: "Cancelacion gratuita",
          payPickup: "Paga al recoger o cuando confirmemos",
          noCard: "Reserva formal sin pago adelantado",
          priceDetails: "Detalles del precio",
          rental: "Renta de auto",
          taxes: "Impuestos, cargos y soporte local",
          total: "Total estimado",
          payNow: "A pagar ahora",
          dueLater: "A pagar despues de confirmar",
          reserveTitle: "Completa tu reserva",
          pickup: "Entrega",
          pickupAirport: "Aeropuerto",
          pickupAddress: "Hotel o direccion",
          pickupDate: "Fecha entrega",
          returnPlace: "Devolucion",
          returnDate: "Fecha devolucion",
          time: "Hora",
          flight: "Numero de vuelo",
          flightHint: "Solo si llegas por aeropuerto",
          driver: "Nombre del conductor",
          phone: "WhatsApp",
          missing: "Completa fechas, conductor y WhatsApp para enviar la reserva.",
          cta: "Enviar reserva formal",
          google: "Continuar con Google",
          note: "No se cobra nada en este paso. Confirmamos disponibilidad, clase y punto de entrega antes del pago."
        }
      : locale === "fr"
        ? {
            perDay: "par jour",
            benefitsTitle: "Avantages de cette reservation",
            cancel: "Annulation gratuite",
            payPickup: "Paiement apres confirmation",
            noCard: "Reservation formelle sans paiement initial",
            priceDetails: "Details du prix",
            rental: "Location voiture",
            taxes: "Taxes, frais et support local",
            total: "Total estime",
            payNow: "A payer maintenant",
            dueLater: "A payer apres confirmation",
            reserveTitle: "Completez votre reservation",
            pickup: "Prise en charge",
            pickupAirport: "Aeroport",
            pickupAddress: "Hotel ou adresse",
            pickupDate: "Date prise",
            returnPlace: "Retour",
            returnDate: "Date retour",
            time: "Heure",
            flight: "Numero de vol",
            flightHint: "Seulement si arrivee aeroport",
            driver: "Nom du conducteur",
            phone: "WhatsApp",
            missing: "Completez les dates, conducteur et WhatsApp pour envoyer la reservation.",
            cta: "Envoyer la reservation",
            google: "Continuer avec Google",
            note: "Aucun paiement a cette etape. Nous confirmons disponibilite, classe et lieu avant paiement."
          }
        : {
            perDay: "per day",
            benefitsTitle: "Benefits when booking this car",
            cancel: "Free cancellation",
            payPickup: "Pay at pickup or after confirmation",
            noCard: "Formal reservation with no upfront payment",
            priceDetails: "Price details",
            rental: "Car rental",
            taxes: "Taxes, fees and local support",
            total: "Estimated total",
            payNow: "Pay now",
            dueLater: "Due after confirmation",
            reserveTitle: "Complete your reservation",
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
            missing: "Complete dates, driver and WhatsApp to send the reservation.",
            cta: "Send formal reservation",
            google: "Continue with Google",
            note: "Nothing is charged in this step. We confirm availability, class and delivery point before payment."
          };

  const reserve = () => {
    setTouched(true);
    if (missingRequired) return;

    const message = [
      `Rent a car formal reservation: ${option.model}`,
      `Zone: ${option.locationName}`,
      `Daily price: $${money(option.price)} ${option.currency}`,
      `Estimated days: ${rentalDays}`,
      `Estimated total: $${money(estimatedTotal)} ${option.currency}`,
      `Pay now: $0.00`,
      `Pickup: ${pickupPlace} - ${pickupDate} ${pickupTime}`,
      `Return: ${dropoffPlace} - ${returnDate} ${returnTime}`,
      pickupIsAirport && flightNumber ? `Flight: ${flightNumber}` : null,
      `Driver: ${driverName}`,
      `Phone: ${phone}`
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/18293939757?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-950 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.18em] text-slate-500";

  return (
    <aside
      id="rentcar-booking"
      className={
        compact
          ? "rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/40"
          : "rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60"
      }
    >
      <div className="border-b border-slate-100 pb-4">
        <p className="text-sm font-bold text-slate-600">{String(copy.from)}</p>
        <p className="text-4xl font-black tracking-tight text-slate-950">
          ${money(option.price)} <span className="text-sm font-black text-slate-600">{labels.perDay}</span>
        </p>
        <div className="mt-3 space-y-2 text-sm font-bold text-emerald-700">
          <p>{labels.cancel}</p>
          <p>{labels.payPickup}</p>
          <p>{labels.noCard}</p>
        </div>
      </div>

      <div className="border-b border-slate-100 py-4">
        <p className="text-sm font-black text-slate-950">{labels.benefitsTitle}</p>
        <p className="mt-2 text-sm font-bold text-slate-700">✓ Online check-in</p>
        <p className="mt-1 text-sm font-bold text-slate-700">✓ Proactivitis VIP support</p>
      </div>

      <div className="border-b border-slate-100 py-4">
        <p className="text-base font-black text-slate-950">{labels.priceDetails}</p>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <div className="flex justify-between gap-3">
            <span>{labels.rental} x {rentalDays} {String(copy.day)}{rentalDays === 1 ? "" : "s"}</span>
            <strong>${money(estimatedTotal)}</strong>
          </div>
          <div className="flex justify-between gap-3">
            <span>{labels.taxes}</span>
            <strong>{taxesAndSupport ? "Incl." : "$0"}</strong>
          </div>
          <div className="flex justify-between gap-3 border-t border-slate-100 pt-3 text-base text-slate-950">
            <span className="font-black">{labels.total}</span>
            <strong>${money(estimatedTotal)}</strong>
          </div>
          <div className="flex justify-between gap-3 text-emerald-700">
            <span className="font-bold">{labels.payNow}</span>
            <strong>$0.00</strong>
          </div>
          <div className="flex justify-between gap-3">
            <span>{labels.dueLater}</span>
            <strong>${money(estimatedTotal)}</strong>
          </div>
        </div>
      </div>

      <div className="py-4">
        <p className="text-base font-black text-slate-950">{labels.reserveTitle}</p>
        <div className="mt-3 grid gap-3">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setPickupPlace(`${option.airportLabel} Airport`)}
              className={`rounded-lg px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${
                pickupIsAirport ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white"
              }`}
            >
              {labels.pickupAirport}
            </button>
            <button
              type="button"
              onClick={() => setPickupPlace(option.locationName)}
              className={`rounded-lg px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${
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
          <div className="grid grid-cols-[1fr_105px] gap-2">
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
          <div className="grid grid-cols-[1fr_105px] gap-2">
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
              <input className={fieldClass} placeholder={labels.flightHint} value={flightNumber} onChange={(event) => setFlightNumber(event.target.value)} />
            </div>
          ) : null}
          <div>
            <label className={labelClass}>{labels.driver}</label>
            <input className={fieldClass} value={driverName} onChange={(event) => setDriverName(event.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{labels.phone}</label>
            <input className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
        </div>

        {touched && missingRequired ? (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{labels.missing}</p>
        ) : null}

        <button
          type="button"
          onClick={reserve}
          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-sky-600 px-4 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700"
        >
          {labels.cta}
        </button>

        <p className="mt-3 text-xs font-bold leading-5 text-slate-500">{labels.note}</p>

        <div className="mt-3">
          <GoogleAuthButton
            label={labels.google}
            callbackUrl={localizedHref}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
          />
        </div>
      </div>
    </aside>
  );
}
