export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PanelShell } from "@/components/dashboard/PanelShell";
import {
  agencyCancelBooking,
  agencyRequestCancellation
} from "@/lib/actions/bookingCancellation";
import { formatTimeUntil, requiresCancellationRequest } from "@/lib/bookings";
import { buildBookingPresentation } from "@/lib/bookingPresentation";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import type { BookingStatus } from "@/lib/types/booking";

export default async function AgencyBookingsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesiÃ³n para ver tus reservas.</div>;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      source: "AGENCY",
      OR: [{ userId }, { AgencyProLink: { agencyUserId: userId } }]
    },
    include: {
      Tour: true,
      AgencyProLink: true
    },
    orderBy: { createdAt: "desc" }
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const bookingsThisMonth = bookings.filter((booking) => booking.createdAt >= monthStart);
  const totalCommission = bookingsThisMonth.reduce((sum, booking) => {
    return sum + (booking.agencyMarkupAmount ?? 0);
  }, 0);

  return (
    <PanelShell roleLabel="Agency" title="Reservas" navItems={[{ label: "Reservas", href: "/agency/bookings" }]}>
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reservas de agencia</h1>
          <p className="text-sm text-slate-500">Reservas gestionadas desde tu cuenta o mediante tus enlaces comerciales.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reservas este mes</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{bookingsThisMonth.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Markup estimado</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">${totalCommission.toFixed(2)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reservas totales</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{bookings.length}</p>
          </article>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              AÃºn no tienes reservas registradas en esta cuenta de agencia.
            </div>
          ) : (
            bookings.map((booking) => {
              const bookingTripType = (booking as any).tripType as string | null | undefined;
              const bookingReturnTravelDate = (booking as any).returnTravelDate as Date | null | undefined;
              const bookingReturnStartTime = (booking as any).returnStartTime as string | null | undefined;
              const presentation = buildBookingPresentation({
                flowType: booking.flowType,
                tripType: bookingTripType,
                originAirport: booking.originAirport,
                flightNumber: booking.flightNumber,
                hotel: booking.hotel,
                pickup: booking.pickup,
                pickupNotes: booking.pickupNotes,
                returnTravelDate: bookingReturnTravelDate,
                returnStartTime: bookingReturnStartTime,
                startTime: booking.startTime,
                travelDateValue: booking.travelDate,
                tourIncludes: booking.Tour?.includes,
                language: booking.Tour?.language,
                duration: booking.Tour?.duration,
                meetingPoint: booking.Tour?.meetingPoint
              });
              const returnDateLabel = bookingReturnTravelDate
                ? bookingReturnTravelDate.toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })
                : null;
              const needsRequest = requiresCancellationRequest(booking.travelDate);
              const channelLabel = booking.AgencyProLink ? "Link comercial" : "Cuenta de agencia";

              return (
                <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{booking.bookingCode ?? booking.id.slice(0, 8).toUpperCase()}</p>
                      <h2 className="text-xl font-semibold text-slate-900">{booking.Tour?.title ?? "Tour no disponible"}</h2>
                      <p className="text-sm text-slate-500">
                        {booking.travelDate.toLocaleDateString("es-ES")} Â· {booking.startTime ?? "Hora pendiente"} Â· {booking.paxAdults + booking.paxChildren} pax
                      </p>
                    </div>
                    <BookingStatusBadge status={booking.status as BookingStatus} />
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resumen operativo</p>
                    <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pasajero principal</p>
                        <p className="text-sm font-semibold text-slate-900">{booking.customerName ?? "Pendiente"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Fecha de ida</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {booking.travelDate.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Fecha de regreso</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {returnDateLabel ?? "No aplica"}
                          {bookingReturnStartTime ? ` Â· ${bookingReturnStartTime}` : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{presentation.routeLabel}</p>
                        <p className="text-sm font-semibold text-slate-900">{presentation.routeValue}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Canal</p>
                        <p className="text-sm font-semibold text-slate-900">{channelLabel}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">CÃ³digos internos</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {(booking.bookingCode ?? booking.id)} Â· {booking.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{presentation.notesLabel}</p>
                        <p className="text-sm font-semibold text-slate-900">{presentation.notesValue}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <article className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Cliente</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{booking.customerName}</p>
                      <p className="text-xs text-slate-500">{booking.customerEmail}</p>
                      {booking.customerPhone && <p className="text-xs text-slate-500">{booking.customerPhone}</p>}
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Finanzas</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">${booking.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Markup: ${(booking.agencyMarkupAmount ?? 0).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Creada: {booking.createdAt.toLocaleString("es-ES")}</p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{presentation.logisticsLabel}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {presentation.logisticsValue || "Operación pendiente"}
                      </p>
                      {booking.transferVehicleName && (
                        <p className="text-xs text-slate-500">
                          Vehículo: {booking.transferVehicleName}
                          {booking.transferVehicleCategory ? ` · ${booking.transferVehicleCategory}` : ""}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">Vuelo: {booking.flightNumber ?? "Pendiente"}</p>
                      <p className="text-xs text-slate-500">{formatTimeUntil(booking.travelDate)}</p>
                    </article>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <details className="space-y-2 text-xs text-slate-500">
                      <summary className="cursor-pointer rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
                        {needsRequest ? "Solicitar cancelaciÃ³n" : "Cancelar reserva"}
                      </summary>
                      <form
                        action={needsRequest ? agencyRequestCancellation : agencyCancelBooking}
                        method="post"
                        className="mt-2 w-72 space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
                      >
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500">
                          Motivo de cancelaciÃ³n
                          <textarea
                            name="reason"
                            required
                            rows={3}
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700"
                          />
                        </label>
                        <button
                          type="submit"
                          className="w-full rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
                        >
                          {needsRequest ? "Enviar solicitud" : "Cancelar ahora"}
                        </button>
                      </form>
                    </details>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </PanelShell>
  );
}

