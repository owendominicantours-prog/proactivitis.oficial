import { format } from "date-fns";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmado",
  COMPLETED: "Completado",
  CANCELLATION_REQUESTED: "Cancelación solicitada"
};

export default async function SupplierCalendarPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Accede con tu cuenta para ver tu calendario.</div>;
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    include: { Tour: { select: { id: true } } }
  });

  if (!supplier) {
    return (
      <div className="py-10 text-center text-sm text-slate-600">
        No encontramos un perfil de supplier asociado a tu cuenta.
      </div>
    );
  }

  const tourIds = supplier.Tour.map((tour) => tour.id);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      tourId: { in: tourIds },
      travelDate: { gte: startOfToday },
      status: { in: ["CONFIRMED", "COMPLETED", "CANCELLATION_REQUESTED"] }
    },
    orderBy: [{ travelDate: "asc" }, { startTime: "asc" }],
    take: 18,
    include: {
      Tour: { select: { title: true, slug: true, location: true } },
      TourOption: { select: { name: true } }
    }
  });

  const grouped = bookings.reduce<Record<string, typeof bookings>>((acc, booking) => {
    const key = format(booking.travelDate, "yyyy-MM-dd");
    acc[key] = acc[key] ?? [];
    acc[key].push(booking);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-200">Agenda supplier</p>
            <h1 className="mt-3 text-3xl font-semibold">Calendario de salidas</h1>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              Revisa tus próximas operaciones, identifica horarios críticos y detecta qué servicios requieren coordinación.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">Próximos servicios</p>
            <p className="mt-2 text-2xl font-semibold">{bookings.length}</p>
            <p className="mt-1 text-slate-300">Reservas futuras dentro de la agenda mostrada.</p>
          </div>
        </div>
      </section>

      {bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No hay salidas programadas todavía.</p>
          <p className="mt-2 text-sm text-slate-500">Cuando entren nuevas reservas confirmadas, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([dateKey, dayBookings]) => (
            <section key={dateKey} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Jornada</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {format(new Date(`${dateKey}T00:00:00`), "PPP")}
                  </h2>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                  {dayBookings.length} salida(s)
                </span>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {dayBookings.map((booking) => (
                  <article key={booking.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                          {booking.startTime ?? format(booking.travelDate, "p")} · {booking.bookingCode ?? booking.id}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950">{booking.Tour?.title ?? "Tour"}</h3>
                        <p className="mt-2 text-sm text-slate-600">
                          {booking.customerName ?? "Cliente"} · {booking.paxAdults + booking.paxChildren} pax
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700">
                        {statusLabels[booking.status] ?? booking.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <MiniInfo label="Ubicación" value={booking.Tour?.location ?? "Pendiente"} />
                      <MiniInfo label="Opción" value={booking.TourOption?.name ?? "General"} />
                      <MiniInfo label="Pickup" value={booking.hotel ?? booking.pickup ?? "Pendiente"} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

const MiniInfo = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
