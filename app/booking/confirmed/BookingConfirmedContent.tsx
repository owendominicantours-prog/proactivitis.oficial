import Image from "next/image";
import Link from "next/link";
import { TourCard } from "@/components/public/TourCard";
import ContactoProveedor from "@/components/booking/ContactoProveedor";
import Eticket from "@/components/booking/Eticket";
import { ItineraryTimeline } from "@/components/itinerary/ItineraryTimeline";
import { BookingConfirmationData } from "./helpers";
import { useTranslation } from "@/context/LanguageProvider";

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

export function BookingConfirmedContent({
  booking,
  tour,
  supplier,
  recommendedTours,
  timelineStops,
  whatsappLink,
  summary,
  travelDateLabel,
  passengerLabel,
  startTimeLabel,
  orderCode,
  flowType
}: BookingConfirmationData) {
  const isTransfer = flowType === "transfer";
  const { t } = useTranslation();
  const heroHeadline = t("booking.confirmation.hero.headline");
  const heroBody = isTransfer
    ? t("booking.confirmation.hero.body.transfer")
    : t("booking.confirmation.hero.body.tour");
  const heroNote = isTransfer
    ? t("booking.confirmation.hero.note.transfer", { email: booking.customerEmail })
    : t("booking.confirmation.hero.note.tour", { email: booking.customerEmail });
  const transferInstructionKeys = [
    "booking.confirmation.instructions.transfer.driverMeet",
    "booking.confirmation.instructions.transfer.matchFlight",
    "booking.confirmation.instructions.transfer.showVoucher"
  ];
  const tourInstructionKeys = [
    "booking.confirmation.instructions.tour.arriveEarly",
    "booking.confirmation.instructions.tour.packEssentials",
    "booking.confirmation.instructions.tour.showVoucher",
    "booking.confirmation.instructions.tour.askQuestions"
  ];
  const instructionKeys = isTransfer ? transferInstructionKeys : tourInstructionKeys;
  const serviceLabel = isTransfer
    ? t("booking.confirmation.labels.service")
    : t("booking.confirmation.labels.duration");
  const serviceValue = isTransfer
    ? t("booking.confirmation.values.transferService")
    : tour.duration || t("booking.confirmation.values.durationPending");
  const pickupLabel = t("booking.confirmation.labels.meetingPoint");
  const pickupValue = isTransfer
    ? booking.pickup ?? t("booking.confirmation.values.defaultPickup")
    : tour.meetingPoint ?? t("booking.confirmation.values.noMeetingPoint");
  const totalLabel = t("booking.confirmation.labels.totalPaid");
  const totalValue = t("booking.confirmation.values.totalPaid", { amount: booking.totalAmount.toFixed(0) });
  const itineraryStart = tour.meetingPoint
    ? t("booking.confirmation.itinerary.start", { meetingPoint: tour.meetingPoint })
    : undefined;
  return (
    <div className="bg-slate-50 min-h-screen">
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
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:bg-slate-900 hover:text-white"
              >
                {t("booking.confirmation.buttons.whatsapp")}
              </a>
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
            </div>

            <ItineraryTimeline
              stops={timelineStops}
              startDescription={itineraryStart}
              finishDescription={tour.meetingInstructions || undefined}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">{t("booking.confirmation.section.instructions")}</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                {instructionKeys.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
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
              </div>
              <Link href="/dashboard/customer" className="block">
                <button className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700 transition">
                  {t("booking.confirmation.buttons.viewBookings")}
                </button>
              </Link>
            </div>

            <ContactoProveedor nombreProveedor={supplier?.name ?? "Proactivitis"} telefono="" reservaId={booking.id} />
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
          <Eticket
            booking={{
              id: booking.id,
              travelDate: booking.travelDate,
              startTime: booking.startTime,
              totalAmount: booking.totalAmount,
              paxAdults: booking.paxAdults,
              paxChildren: booking.paxChildren,
              customerName: booking.customerName,
              customerEmail: booking.customerEmail,
              pickupNotes: booking.pickupNotes,
              hotel: booking.hotel
            }}
            tour={{
              id: tour.id,
              slug: tour.slug,
              title: tour.title,
              heroImage: tour.heroImage,
              meetingPoint: tour.meetingPoint,
              meetingInstructions: tour.meetingInstructions,
              duration: tour.duration
            }}
            supplierName={supplier?.name}
            orderCode={orderCode}
          />
        </section>
      </main>
    </div>
  );
}
