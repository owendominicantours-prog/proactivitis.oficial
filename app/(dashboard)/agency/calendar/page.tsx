import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmado",
  COMPLETED: "Completado",
  CANCELLATION_REQUESTED: "Cancelacion solicitada"
};

export default async function AgencyCalendarPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesion para ver tu agenda.</div>;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      travelDate: { gte: startOfToday },
      AgencyProLink: { agencyUserId: userId },
      status: { in: ["CONFIRMED", "COMPLETED", "CANCELLATION_REQUESTED"] }
    },
    orderBy: { travelDate: "asc" },
    take: 12,
    include: { Tour: { select: { title: true } } }
  });
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Calendario</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Agenda de operaciones</h1>
        <p className="mt-2 text-sm text-slate-600">
          Visualiza tus reservas activas, horarios y salidas del dia.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {bookings.length ? (
          bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {format(booking.travelDate, "PPP")} · {booking.startTime ?? format(booking.travelDate, "p")}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{booking.Tour?.title ?? "Tour"}</h2>
              <span className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {statusLabels[booking.status] ?? "En proceso"}
              </span>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
            No hay reservas agendadas todavia.
          </div>
        )}
      </section>
    </div>
  );
}
