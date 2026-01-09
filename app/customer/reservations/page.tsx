"use server";

import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/types/booking";
import Eticket from "@/components/booking/Eticket";

const statusMessages: Partial<Record<BookingStatus, string>> = {
  CONFIRMED: "Tu reserva está confirmada.",
  CANCELLATION_REQUESTED: "Estamos revisando tu cancelación.",
  CANCELLED: "La reserva fue cancelada.",
  COMPLETED: "Tu experiencia ya fue completada."
};

export default async function CustomerPublicReservationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Debes iniciar sesión</p>
          <p className="mt-2 text-sm text-slate-600">Accede para ver tus reservas recientes.</p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ customerEmail: session.user.email }, { userId: session.user.id ?? undefined }]
    },
    include: {
      Tour: {
        include: {
          SupplierProfile: true
        }
      }
    },
    orderBy: { travelDate: "asc" }
  });

  const whatsappBase = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/18093949877?text=Hola%20Proactivitis";
  const buildWhatsappLink = (message: string) => {
    const hasQuery = whatsappBase.includes("?");
    const hasText = whatsappBase.includes("text=");
    if (hasText) {
      return `${whatsappBase}%0A${encodeURIComponent(message)}`;
    }
    return `${whatsappBase}${hasQuery ? "&" : "?"}text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Mis reservas</h1>
          <p className="text-sm text-slate-500">Gestión rápida de tus tours confirmados.</p>
        </header>
        <section className="space-y-4">
          {bookings.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              Aún no tienes reservas. Explora los tours disponibles y únete a una experiencia.
            </div>
          )}
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                  {booking.Tour?.heroImage ? (
                    <Image
                      src={booking.Tour.heroImage}
                      alt={booking.Tour?.title ?? "Tour"}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase text-slate-400">
                      Tour
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reserva</p>
                  <h2 className="text-xl font-semibold text-slate-900">{booking.Tour?.title ?? "Tour"}</h2>
                  <p className="text-sm text-slate-500">
                    {booking.travelDate.toLocaleDateString("es-DO")} {booking.startTime ? `- ${booking.startTime}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                    <p>Pax: {booking.paxAdults + booking.paxChildren}</p>
                    <p>Total: ${booking.totalAmount.toFixed(2)}</p>
                    <p>Pickup: {booking.hotel ?? booking.pickup ?? "Por confirmar"}</p>
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                  {statusMessages[booking.status as BookingStatus] ?? booking.status}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                <a
                  href={buildWhatsappLink(
                    `Hola, necesito ayuda con la reserva ${booking.bookingCode ?? booking.id}.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-200 px-3 py-2 text-slate-600"
                >
                  Enviar mensaje
                </a>
                <a
                  href={buildWhatsappLink(
                    `Quiero cambiar el punto de encuentro de la reserva ${booking.bookingCode ?? booking.id}.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-emerald-200 px-3 py-2 text-emerald-700"
                >
                  Cambiar pickup
                </a>
                <a
                  href={buildWhatsappLink(
                    `Quiero solicitar la cancelacion de la reserva ${booking.bookingCode ?? booking.id}.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-rose-200 px-3 py-2 text-rose-700"
                >
                  Cancelar
                </a>
                <Link
                  href={`/tours/${booking.Tour?.slug ?? ""}`}
                  className="rounded-full border border-slate-200 px-3 py-2 text-slate-600"
                >
                  Ver tour
                </Link>
              </div>

              <div className="mt-6">
                <Eticket
                  variant="compact"
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
                    id: booking.Tour?.id ?? "",
                    slug: booking.Tour?.slug ?? "",
                    title: booking.Tour?.title ?? "Tour",
                    heroImage: booking.Tour?.heroImage,
                    meetingPoint: booking.Tour?.meetingPoint,
                    meetingInstructions: booking.Tour?.meetingInstructions,
                    duration: booking.Tour?.duration
                  }}
                  supplierName={booking.Tour?.SupplierProfile?.company ?? booking.Tour?.SupplierProfile?.userId ?? undefined}
                />
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
