import Image from "next/image";
import Link from "next/link";
import { TourCard } from "@/components/public/TourCard";
import ContactoProveedor from "@/components/booking/ContactoProveedor";
import Eticket from "@/components/booking/Eticket";
import { ItineraryTimeline, TimelineStop } from "@/components/itinerary/ItineraryTimeline";
import { BookingConfirmationData } from "./helpers";

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
  const heroTitle = isTransfer ? "Tu traslado privado está confirmado" : "Tu aventura comienza pronto!";
  const heroSubtitle = isTransfer
    ? "Nuestro chofer te espera con tu nombre en el punto acordado. Recibirás detalles adicionales en el correo."
    : "Gracias por reservar con nosotros. Te enviamos una copia del voucher a tu bandeja y al celular.";
  const instructionsList = isTransfer
    ? [
        "El chofer te esperará en el lobby principal o en la salida de llegadas del aeropuerto.",
        "Compara tu número de vuelo con el del conductor y actualiza el dato si hay cambios.",
        "Presenta tu e-ticket y tu identificación al momento del encuentro."
      ]
    : [
        "Llega 15 minutos antes al punto de encuentro.",
        "Lleva traje de baño, protector solar y agua.",
        "Muestra tu e-ticket en el móvil o impreso.",
        "¿Dudas? Usa el botón de contacto inmediato."
      ];
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
                <p className="text-xs uppercase tracking-[0.6em] text-emerald-700">Reserva confirmada</p>
                <h1 className="text-3xl font-black text-slate-900 md:text-4xl">¡Tu aventura comienza pronto!</h1>
                <p className="text-xl font-semibold text-slate-900">{heroTitle}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.6em] text-slate-500">Número de pedido</p>
                <p className="text-3xl font-black text-slate-900">{orderCode}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Tour reservado</p>
                <p className="text-base font-semibold text-slate-700">{tour.title}</p>
                <p className="text-sm text-slate-500">{travelDateLabel}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Pasajeros</p>
                <p className="text-lg font-semibold text-slate-700">{passengerLabel}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{startTimeLabel}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="#eticket"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
              >
                Descargar mi E-Ticket
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:bg-slate-900 hover:text-white"
              >
                ¿Dudas sobre el encuentro? Chatea por WhatsApp
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {heroSubtitle} Enviamos una copia del voucher a <span className="font-semibold">{booking.customerEmail}</span>.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10 lg:space-y-14">
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Código de reserva</p>
              <p className="text-3xl font-bold text-slate-900">{booking.id}</p>
              <p className="text-sm text-slate-500 mt-2">{summary}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <InfoRow label={isTransfer ? "Servicio reservado" : "Duración"} value={isTransfer ? "Transfer privado" : tour.duration || "TBD"} />
                <InfoRow
                  label="Punto de encuentro"
                  value={isTransfer ? booking.pickup ?? "Lobby principal" : tour.meetingPoint || "No indicado"}
                />
                <InfoRow label="Total pagado" value={`$${booking.totalAmount.toFixed(0)} USD`} />
              </div>
            </div>

            <ItineraryTimeline
              stops={timelineStops}
              startDescription={tour.meetingPoint ? `Encuentro en ${tour.meetingPoint}.` : undefined}
              finishDescription={tour.meetingInstructions || undefined}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Instrucciones importantes</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                {instructionsList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Tu tour</p>
              <h3 className="text-xl font-semibold text-slate-900">{tour.title}</h3>
              {tour.heroImage && (
                <div className="relative mt-4 h-48 w-full overflow-hidden rounded-2xl bg-slate-100">
                  <Image src={tour.heroImage} alt={tour.title} fill className="object-cover" />
                </div>
              )}
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <p>Proveedor: {supplier?.name ?? "Proactivitis"}</p>
                <p>
                  Zona: {tour.departureDestination?.name ?? "Global"} ·{" "}
                  {tour.departureDestination?.country?.name ?? "Destino internacional"}
                </p>
              </div>
              <Link href="/dashboard/customer" className="block">
                <button className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700 transition">
                  Ver mis reservas
                </button>
              </Link>
            </div>

            <ContactoProveedor nombreProveedor={supplier?.name ?? "Proactivitis"} telefono="" reservaId={booking.id} />
          </aside>
        </div>

        {recommendedTours.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Otros clientes también reservaron</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {recommendedTours.map((item) => (
                <TourCard
                  key={item.id}
                  slug={item.slug}
                  title={item.title}
                  location={item.location ?? "Destino"}
                  price={item.price}
                  rating={4}
                  image={item.heroImage ?? "/fototours/fototour.jpeg"}
                />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-6 border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold text-slate-900">Tu e-ticket digital</h2>
          <p className="text-sm text-slate-500">
            Guarda este voucher en tu celular o descárgalo para mostrarlo cuando te reciban en el tour.
          </p>
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
