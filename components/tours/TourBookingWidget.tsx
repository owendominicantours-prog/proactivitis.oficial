"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Bus, CheckCircle2, Clock4, Globe, CreditCard, Lock } from "lucide-react";
import PaymentElementStep from "@/components/booking/PaymentElementStep";
import { TourBookingForm } from "@/components/tours/TourBookingForm";

type TimeSlotOption = {
  hour: number;
  minute: string;
  period: "AM" | "PM";
};

type TravelerGroup = {
  label: string;
  range: string;
  count: number;
  setter: Dispatch<SetStateAction<number>>;
};

type TourBookingWidgetProps = {
  tourId: string;
  basePrice: number;
  timeSlots: TimeSlotOption[];
  supplierHasStripeAccount: boolean;
  platformSharePercent: number;
  durationLabel: string;
  startTimeLabel: string;
  languageInfo: string;
};

type PaymentSession = {
  bookingId: string;
  clientSecret: string;
  amount: number;
};

export function TourBookingWidget({
  tourId,
  basePrice,
  timeSlots,
  supplierHasStripeAccount,
  platformSharePercent,
  durationLabel,
  startTimeLabel,
  languageInfo
}: TourBookingWidgetProps) {
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [youth, setYouth] = useState(0);
  const [child, setChild] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showTravelersPopover, setShowTravelersPopover] = useState(false);
  const [selectedTime, setSelectedTime] = useState(() =>
    timeSlots.length ? formatTimeOption(timeSlots[0]) : ""
  );
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const totalTravelers = adults + youth + child;

  const travelerGroups: TravelerGroup[] = [
    { label: "Adult", range: "Age 17-99", count: adults, setter: setAdults },
    { label: "Youth", range: "Age 10-16", count: youth, setter: setYouth },
    { label: "Child", range: "Age 1-9", count: child, setter: setChild }
  ];

  const infoHighlights = [
    { label: "Duración", value: durationLabel, Icon: Clock4 },
    { label: "Hora del tour", value: startTimeLabel, Icon: Bus },
    { label: "Idiomas", value: languageInfo, Icon: Globe }
  ];

  const trustStatements = [
    "Confirmación inmediata",
    "Cancelación gratuita hasta 24h antes",
    "Pago seguro encriptado"
  ];

  const handleCheckAvailability = () => {
    if (!date) return;
    setShowDetails(true);
  };

  const handleBookingSuccess = (session: { bookingId: string; clientSecret: string | null; amount: number }) => {
    if (!session.clientSecret) {
      setPaymentSession(null);
      return;
    }
    setPaymentSession({
      bookingId: session.bookingId,
      clientSecret: session.clientSecret,
      amount: session.amount
    });
  };

  const handlePopperToggle = () => {
    setShowTravelersPopover((prev) => !prev);
  };

  const handleApplyTravelers = () => {
    setShowTravelersPopover(false);
  };

  const handleIncrement = (setter: Dispatch<SetStateAction<number>>, limit = 15) => () =>
    setter((prev) => Math.min(limit, prev + 1));
  const handleDecrement = (setter: Dispatch<SetStateAction<number>>) => () =>
    setter((prev) => Math.max(0, prev - 1));

  useEffect(() => {
    if (!showTravelersPopover) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        setShowTravelersPopover(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showTravelersPopover]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="space-y-5 lg:sticky lg:top-6">
        <div className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_25px_50px_rgba(15,23,42,0.12)]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500">Precio desde</p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-4xl font-black text-slate-900">${basePrice.toFixed(0)}</span>
              <span className="text-sm text-slate-500">USD · por persona</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-[0.65rem] text-slate-500">
            {infoHighlights.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 text-center">
                <item.Icon className="h-4 w-4 text-emerald-500" />
                <span className="text-[8px] uppercase tracking-[0.35em] text-slate-400">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">Tarjetas internacionales, Apple Pay y Google Pay aceptadas.</p>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 space-y-3 text-sm text-slate-700">
            <label className="space-y-1">
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">Fecha</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
              />
            </label>
            <div className="space-y-1">
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">Travelers</span>
              <button
                ref={triggerRef}
                type="button"
                onClick={handlePopperToggle}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 shadow-inner transition hover:border-slate-300"
              >
                {`${totalTravelers} traveler${totalTravelers > 1 ? "s" : ""}`}
              </button>
            </div>
            <div className="border-t border-slate-200 pt-3 text-[0.7rem] uppercase tracking-[0.3em] text-slate-500">
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">Start time</p>
              {timeSlots.length > 1 ? (
                <select
                  value={selectedTime}
                  onChange={(event) => setSelectedTime(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                >
                  {timeSlots.map((slot) => (
                    <option key={`${slot.hour}-${slot.minute}-${slot.period}`} value={formatTimeOption(slot)}>
                      {formatTimeOption(slot)}
                    </option>
                  ))}
                </select>
              ) : timeSlots.length === 1 ? (
                <p className="mt-2 text-sm text-slate-900">{formatTimeOption(timeSlots[0])}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-900">Hora confirmada luego</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCheckAvailability}
            disabled={!date}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
              date ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-300/70 cursor-not-allowed"
            }`}
          >
            Check availability
          </button>
          <div className="space-y-2 text-[0.65rem] text-slate-600">
            {trustStatements.map((statement) => (
              <div key={statement} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{statement}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[0.65rem] text-slate-600">
            <CreditCard className="h-4 w-4 text-slate-600" />
            <span className="font-semibold text-slate-900">Tarjetas seguras</span>
            <Lock className="h-4 w-4 text-slate-600" />
            <span className="text-slate-500 uppercase tracking-[0.3em]">Secure Checkout by Stripe</span>
          </div>
        </div>

        {showTravelersPopover && (
          <div
            ref={popoverRef}
            className="absolute left-1/2 top-[340px] z-[9999] mt-2 w-[300px] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Select up to 15 travelers in total.
            </p>
            <div className="mt-3 space-y-3">
              {travelerGroups.map(({ label, range, count, setter }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <p className="text-[0.65rem] text-slate-500">{range}</p>
                  </div>
                  <div className="flex items-center gap-3 text-base font-semibold">
                    <button
                      type="button"
                      onClick={handleDecrement(setter)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-slate-400"
                    >
                      –
                    </button>
                    <span className="min-w-[24px] text-center">{count}</span>
                    <button
                      type="button"
                      onClick={handleIncrement(setter)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-slate-400"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleApplyTravelers}
              className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
            >
              Apply
            </button>
          </div>
        )}

        {showDetails && (
          <div className="space-y-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Step 2 · Traveler details
            </p>
            <TourBookingForm
              tourId={tourId}
              initialDate={date}
              initialAdults={adults}
              initialChildren={youth + child}
              hideDateAndPax
              selectedTime={selectedTime}
              onSuccess={handleBookingSuccess}
            />
            {paymentSession && (
              <div className="space-y-4">
                {!supplierHasStripeAccount && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                    <p className="font-semibold text-amber-800">Reserva garantizada por Proactivitis</p>
                    <p className="mt-1 text-[0.65rem] leading-tight">
                      Pagamos tu reserva mientras ayudamos al proveedor a terminar su configuración de Stripe.
                    </p>
                  </div>
                )}
                {platformSharePercent > 20 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                    <p className="font-semibold">Impulsa activo: {platformSharePercent}% para Proactivitis</p>
                    <p className="mt-1 text-[0.65rem] text-amber-700">
                      El proveedor recibe {100 - platformSharePercent}% mientras tu reserva está protegida.
                    </p>
                  </div>
                )}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">Step 3 · Pago seguro</p>
                  <p className="mt-1 text-xs">Confirma el pago y te llevamos directo a la página de confirmación.</p>
                </div>
                <PaymentElementStep
                  bookingId={paymentSession.bookingId}
                  clientSecret={paymentSession.clientSecret}
                  amount={paymentSession.amount}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const formatTimeOption = (slot: TimeSlotOption) => {
  const minute = slot.minute.padStart(2, "0");
  const hour = slot.hour.toString().padStart(2, "0");
  return `${hour}:${minute} ${slot.period}`;
};
