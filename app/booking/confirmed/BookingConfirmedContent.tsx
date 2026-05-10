"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { TourCard } from "@/components/public/TourCard";
import BookingEmailDispatcher from "@/components/booking/BookingEmailDispatcher";
import { ItineraryTimeline } from "@/components/itinerary/ItineraryTimeline";
import { formatDurationDisplay } from "@/lib/formatDuration";
import { BookingConfirmationData } from "./helpers";
import { useTranslation } from "../../../context/LanguageProvider";
import BookingPurchaseTracker from "@/components/analytics/BookingPurchaseTracker";
import { normalizeDisplayText } from "@/lib/text-format";

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{normalizeDisplayText(label)}</p>
    <p className="text-sm font-semibold text-slate-900">{normalizeDisplayText(value)}</p>
  </div>
);

export function BookingConfirmedContent({
  booking,
  tour,
  supplier,
  agency,
  recommendedTours,
  timelineStops,
  summary,
  travelDateLabel,
  passengerLabel,
  startTimeLabel,
  orderCode,
  flowType,
  discountPercent,
  analytics,
  eticketContent
}: BookingConfirmationData & { eticketContent?: ReactNode }) {
  const isTransfer = flowType === "transfer";
  const isRentCar = flowType === "rent_car";
  const { t } = useTranslation();
  const heroHeadline = isRentCar ? "Reserva registrada" : t("booking.confirmation.hero.headline");
  const heroBody = isRentCar
    ? "Tu solicitud de rent car quedo registrada como reserva formal."
    : isTransfer
    ? t("booking.confirmation.hero.body.transfer")
    : t("booking.confirmation.hero.body.tour");
  const heroNote = isRentCar
    ? `Enviaremos la confirmación operativa a ${booking.customerEmail}. No se cargó ninguna tarjeta; el pago se coordina después de validar disponibilidad.`
    : isTransfer
    ? t("booking.confirmation.hero.note.transfer", { email: booking.customerEmail })
    : t("booking.confirmation.hero.note.tour", { email: booking.customerEmail });
  const transferInstructionKeys = [
    "booking.confirmation.instructions.transfer.driverMeet",
    "booking.confirmation.instructions.transfer.matchFlight",
    "booking.confirmation.instructions.transfer.showVoucher"
  ] as const;
  const tourInstructionKeys = [
    "booking.confirmation.instructions.tour.arriveEarly",
    "booking.confirmation.instructions.tour.packEssentials",
    "booking.confirmation.instructions.tour.showVoucher",
    "booking.confirmation.instructions.tour.askQuestions"
  ] as const;
  const instructionKeys = isTransfer ? transferInstructionKeys : tourInstructionKeys;
  const rentCarInstructions = [
    "Nuestro equipo valida disponibilidad real del vehículo o clase similar.",
    "Recibirás instrucciones de entrega, documentos requeridos y punto exacto.",
    "No pagaste ahora; el pago se completa después de la confirmación operativa.",
    "Ten licencia de conducir vigente y documento de identidad al recoger el vehículo."
  ];
  const serviceLabel = isRentCar
    ? "Vehículo"
    : isTransfer
    ? t("booking.confirmation.labels.service")
    : t("booking.confirmation.labels.duration");
  const serviceValue = isRentCar
    ? ((booking as any).transferVehicleName ?? tour.title)
    : isTransfer
    ? t("booking.confirmation.values.transferService")
    : formatDurationDisplay(tour.duration, t("booking.confirmation.values.durationPending"));
  const pickupLabel = isRentCar ? "Entrega" : t("booking.confirmation.labels.meetingPoint");
  const pickupValue = isRentCar
    ? booking.pickup ?? "Punto por confirmar"
    : isTransfer
    ? booking.pickup ?? t("booking.confirmation.values.defaultPickup")
    : tour.meetingPoint ?? t("booking.confirmation.values.noMeetingPoint");
  const totalLabel = isRentCar ? "Total estimado" : t("booking.confirmation.labels.totalPaid");
  const totalValue = isRentCar
    ? `$${booking.totalAmount.toFixed(0)} USD - pago pendiente`
    : t("booking.confirmation.values.totalPaid", { amount: booking.totalAmount.toFixed(0) });
  const itineraryStart = tour.meetingPoint
    ? t("booking.confirmation.itinerary.start", { meetingPoint: tour.meetingPoint })
    : undefined;
  const returnDateLabel =
    booking.returnTravelDate
      ? new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date(booking.returnTravelDate))
      : null;
  const mainTraveler = booking.customerName ?? "Viajero principal pendiente";
  const originValue = booking.originAirport ?? booking.pickup ?? "Pendiente";
  const destinationValue = booking.hotel ?? pickupValue;
  const includedServices =
    typeof tour.includes === "string" && tour.includes.trim().length
      ? tour.includes.split(";").map((item: string) => item.trim()).filter(Boolean).slice(0, 5).join(", ")
      : "Coordinación del servicio, soporte y confirmación";
  return (
    <div className="bg-slate-50 min-h-screen">
      <BookingPurchaseTracker
        transactionId={analytics.transactionId}
        value={analytics.value}
        currency={analytics.currency}
        coupon={analytics.coupon}
        items={analytics.items}
      />
      <BookingEmailDispatcher bookingId={booking.id} />
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm">
            <div className="flex items-center gap-4 text-emerald-600">
              <span className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-emerald-200 bg-emerald-50 text-3xl font-black">
                ✓
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.6em] text-emerald-700">{t("booking.confirmation.statusLabel")}</p>
                <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{heroHeadline}</h1>
                <p className="text-xl font-semibold text-slate-900">{heroBody}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.6em] text-slate-500">Número de pedido</p>
                <p className="text-3xl font-black text-slate-900">{orderCode}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{t("booking.confirmation.labels.bookedTour")}</p>
                <p className="text-base font-semibold text-slate-700">{tour.title}</p>
                <p className="text-sm text-slate-500">{travelDateLabel}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{t("booking.confirmation.labels.passengers")}</p>
                <p className="text-lg font-semibold text-slate-700">{passengerLabel}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{startTimeLabel}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="#eticket"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
              >
                {t("booking.confirmation.buttons.downloadEticket")}
              </a>
              <Link
                href={`/dashboard/customer/reservas/${booking.id}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:bg-slate-900 hover:text-white"
              >
                Abrir panel
              </Link>
              {!isTransfer && !isRentCar ? (
                <Link
                  href={`/tours/${tour.slug}#reviews`}
                  className="inline-flex items-center justify-center rounded-full border border-indigo-200 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 transition hover:bg-indigo-50"
                >
                  {t("booking.confirmation.buttons.leaveReview")}
                </Link>
              ) : null}
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {heroNote}
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10 lg:space-y-14">
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("booking.confirmation.labels.orderCode")}</p>
              <p className="text-3xl font-bold text-slate-900">{booking.id}</p>
              <p className="text-sm text-slate-500 mt-2">{summary}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <InfoRow label={serviceLabel} value={serviceValue} />
                <InfoRow label={pickupLabel} value={pickupValue} />
                <InfoRow label={totalLabel} value={totalValue} />
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resumen operativo</p>
                <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoRow label="Pasajero principal" value={mainTraveler} />
                  <InfoRow label="Fecha de ida" value={travelDateLabel} />
                  <InfoRow label="Fecha de regreso" value={returnDateLabel ?? "No aplica"} />
                  <InfoRow label="Origen / destino" value={`${originValue} / ${destinationValue}`} />
                  <InfoRow label="Agencia" value={agency?.name ?? "Reserva directa"} />
                  <InfoRow label="Códigos internos" value={`${orderCode} · ${booking.id.slice(0, 8).toUpperCase()}`} />
                  <InfoRow label="Servicios incluidos" value={includedServices} />
                </div>
              </div>
              {isTransfer && booking.tripType === "round-trip" && (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Regreso confirmado</p>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <InfoRow label="Fecha de regreso" value={returnDateLabel ?? "Pendiente"} />
                    <InfoRow label="Hora de regreso" value={booking.returnStartTime ?? "Pendiente"} />
                  </div>
                </div>
              )}
              {agency && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reserva gestionada por agencia</p>
                  <div className="mt-3 grid gap-4 md:grid-cols-3">
                    <InfoRow label="Agencia" value={agency.name} />
                    <InfoRow label="Teléfono" value={agency.phone ?? "No registrado"} />
                    <InfoRow label="Contacto" value={agency.contactName ?? "Sin contacto"} />
                  </div>
                </div>
              )}
            </div>

            <ItineraryTimeline
              stops={timelineStops}
              startDescription={itineraryStart}
              finishDescription={tour.meetingInstructions || undefined}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">{t("booking.confirmation.section.instructions")}</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                {isRentCar
                  ? rentCarInstructions.map((item) => <li key={item}>{item}</li>)
                  : instructionKeys.map((key) => <li key={key}>{t(key)}</li>)}
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">{t("booking.confirmation.section.yourTour")}</p>
              <h3 className="text-xl font-semibold text-slate-900">{tour.title}</h3>
              {tour.heroImage && (
                <div className="relative mt-4 h-48 w-full overflow-hidden rounded-2xl bg-slate-100">
                  <Image src={tour.heroImage} alt={tour.title} fill className="object-cover" />
                </div>
              )}
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <p>
                  {t("booking.confirmation.labels.provider")}: {supplier?.name ?? t("booking.confirmation.values.providerFallback")}
                </p>
                <p>
                  {t("booking.confirmation.labels.zone")}: {tour.departureDestination?.name ?? t("booking.confirmation.values.destinationFallback")} - {tour.departureDestination?.country?.name ?? t("booking.confirmation.values.countryFallback")}
                </p>
                {agency && <p>Agencia: {agency.name}</p>}
              </div>
              <Link href="/dashboard/customer" className="block">
                <button className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700 transition">
                  {t("booking.confirmation.buttons.viewBookings")}
                </button>
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Soporte web</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Gestiona cambios desde tu cuenta</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Para pagos, cancelaciones, e-ticket o cambios operativos, usa el panel del cliente. Todo queda registrado en la plataforma.
              </p>
              <Link
                href={`/dashboard/customer/reservas/${booking.id}`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Abrir reserva
              </Link>
            </div>
          </aside>
        </div>

        {recommendedTours.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t("booking.confirmation.section.recommended")}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {recommendedTours.map((item) => (
                <TourCard
                  key={item.id}
                  slug={item.slug}
                  title={item.title}
                  location={item.location ?? t("booking.confirmation.values.destinationFallback")}
                  price={item.price}
                  discountPercent={discountPercent}
                  rating={4}
                  image={item.heroImage ?? "/fototours/fototour.jpeg"}
                />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-6 border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">{t("booking.confirmation.section.eticket")}</h2>
          <p className="text-sm text-slate-500">{t("booking.confirmation.eticket.copy")}</p>
          {eticketContent}
        </section>
      </main>
    </div>
  );
}
