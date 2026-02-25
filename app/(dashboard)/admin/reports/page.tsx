import { prisma } from "@/lib/prisma";

const formatUsd = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default async function AdminReportsPage() {
  const [topTours, bookingsByTour, monthRevenue] = await Promise.all([
    prisma.tour.findMany({
      take: 8,
      orderBy: { Booking: { _count: "desc" } },
      include: { _count: { select: { Booking: true } } }
    }),
    prisma.booking.groupBy({
      by: ["tourId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8
    }),
    prisma.booking.aggregate({
      _sum: { totalAmount: true },
      where: { status: "confirmed" }
    })
  ]);

  const totalBookings = bookingsByTour.reduce((acc, row) => acc + row._count.id, 0);

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Reportes</p>
        <h1 className="text-3xl font-semibold text-slate-900">Analitica operativa</h1>
        <p className="text-sm text-slate-600">Resumen de rendimiento de tours, volumen y facturacion confirmada.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tours analizados</p><p className="mt-2 text-3xl font-semibold text-slate-900">{topTours.length}</p></article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-sky-700">Reservas top</p><p className="mt-2 text-3xl font-semibold text-sky-900">{totalBookings.toLocaleString()}</p></article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Ingreso confirmado</p><p className="mt-2 text-3xl font-semibold text-emerald-900">{formatUsd(monthRevenue._sum.totalAmount ?? 0)}</p></article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Top tours</h2>
          <div className="mt-4 space-y-2">
            {topTours.map((tour) => (
              <div key={tour.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-700">{tour.title}</span>
                <span className="font-semibold text-slate-900">{tour._count.Booking.toLocaleString()} reservas</span>
              </div>
            ))}
            {!topTours.length && <p className="text-sm text-slate-500">Sin datos disponibles.</p>}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Reservas por tour ID</h2>
          <div className="mt-4 space-y-2">
            {bookingsByTour.map((row) => (
              <div key={row.tourId} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-700">Tour {row.tourId}</span>
                <span className="font-semibold text-slate-900">{row._count.id.toLocaleString()}</span>
              </div>
            ))}
            {!bookingsByTour.length && <p className="text-sm text-slate-500">Sin datos disponibles.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}
