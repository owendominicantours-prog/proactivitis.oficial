"use server";

import Link from "next/link";
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
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tour</p>
                  <h2 className="text-xl font-semibold text-slate-900">{booking.Tour?.title ?? "Tour"}</h2>
                  <p className="text-sm text-slate-500">
                    {booking.travelDate.toLocaleDateString("es-DO")} · {booking.travelDate.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className="ml-auto rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                  {statusMessages[booking.status as BookingStatus] ?? booking.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <p>Pax: {booking.paxAdults + booking.paxChildren}</p>
                <p>Total: ${booking.totalAmount.toFixed(2)}</p>
                <p>Proveedor: {booking.Tour?.SupplierProfile?.company ?? "Por asignar"}</p>
              </div>
              <div className="mt-4 text-right">
                <Link
                  href={`/customer/reservations/${booking.id}`}
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 hover:underline"
                >
                  Ver detalle
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
