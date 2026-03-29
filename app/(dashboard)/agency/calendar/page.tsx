import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildBookingPresentation } from "@/lib/bookingPresentation";
import { buildAgencyBookingWhere } from "@/lib/agencyMetrics";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmado",
  COMPLETED: "Completado",
  CANCELLATION_REQUESTED: "Cancelación solicitada"
};

export default async function AgencyCalendarPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesión para ver tu agenda.</div>;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      ...buildAgencyBookingWhere(userId),
      travelDate: { gte: startOfToday },
      status: { in: ["CONFIRMED", "COMPLETED", "CANCELLATION_REQUESTED"] }
    },
    orderBy: { travelDate: "asc" },
    take: 16,
    include: { Tour: { select: { title: true, duration: true, language: true, includes: true, meetingPoint: true } } }
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Calendario</p>
        <h1 className="mt-3 text-3xl font-semibold">Agenda de operaciones</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-200">
          Próximas salidas de tours, traslados directos y ventas por AgencyPro en un mismo calendario operativo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bookings.length ? (
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
            const channelLabel = booking.agencyTransferLinkId
              ? "AgencyPro Transfer"
              : booking.agencyProLinkId
                ? "AgencyPro Tour"
                : "Reserva directa";
            return (
              <article key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {format(booking.travelDate, "PPP")} · {booking.startTime ?? format(booking.travelDate, "p")}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{booking.Tour?.title ?? "Reserva"}</h2>
                <p className="mt-2 text-sm text-slate-600">{presentation.routeValue}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{booking.flowType === "transfer" ? "Traslado" : "Actividad"}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{channelLabel}</span>
                </div>
                <span className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {statusLabels[booking.status] ?? "En proceso"}
                </span>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
            No hay reservas agendadas todavía.
          </div>
        )}
      </section>
    </div>
  );
}
