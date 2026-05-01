export const dynamic = "force-dynamic";

import Link from "next/link";

import { prisma } from "@/lib/prisma";

const CONFIRMED_STATUSES = ["CONFIRMED", "COMPLETED"];

const formatUsd = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default async function AdminReportsPage() {
  const [topTours, bookingsByTour, revenue, sourceRows, pendingOps, reviewQueue] = await Promise.all([
    prisma.tour.findMany({
      take: 8,
      orderBy: { Booking: { _count: "desc" } },
      include: {
        _count: { select: { Booking: true } },
        SupplierProfile: { select: { company: true } }
      }
    }),
    prisma.booking.groupBy({
      by: ["tourId"],
      where: { status: { in: CONFIRMED_STATUSES } },
      _count: { id: true },
      _sum: { totalAmount: true, supplierAmount: true, platformFee: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: 8
    }),
    prisma.booking.aggregate({
      _sum: { totalAmount: true, platformFee: true, supplierAmount: true, agencyFee: true },
      _count: { id: true },
      where: { status: { in: CONFIRMED_STATUSES } }
    }),
    prisma.booking.groupBy({
      by: ["source"],
      where: { status: { in: CONFIRMED_STATUSES } },
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: "desc" } }
    }),
    prisma.booking.count({
      where: { status: { in: ["PAYMENT_PENDING", "PENDING", "CANCELLATION_REQUESTED"] } }
    }),
    prisma.tour.count({
      where: { status: { in: ["under_review", "pending", "needs_changes"] } }
    })
  ]);

  const topTourIds = bookingsByTour.map((row) => row.tourId);
  const tourLookupRows = topTourIds.length
    ? await prisma.tour.findMany({
        where: { id: { in: topTourIds } },
        select: { id: true, title: true, slug: true, SupplierProfile: { select: { company: true } } }
      })
    : [];
  const tourLookup = new Map(tourLookupRows.map((tour) => [tour.id, tour]));

  return (
    <div className="space-y-8 pb-10">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(135deg,#111827,#1d4b6f)] p-6 text-white lg:grid-cols-[1.3fr,0.7fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200">Reportes</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">Lectura rápida del negocio.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200">
              Mira qué vende, qué canal trae dinero y qué puntos operativos necesitan intervención.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Pendientes operativos</p>
            <p className="mt-2 text-2xl font-semibold">{pendingOps + reviewQueue}</p>
            <p className="mt-2 text-sm text-slate-200">Reservas pendientes, cancelaciones o tours por revisar.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard label="Ingreso confirmado" value={formatUsd(revenue._sum.totalAmount ?? 0)} tone="emerald" />
        <ReportCard label="Reservas confirmadas" value={(revenue._count.id ?? 0).toLocaleString()} tone="sky" />
        <ReportCard label="Margen plataforma" value={formatUsd(revenue._sum.platformFee ?? 0)} tone="indigo" />
        <ReportCard label="Payout suplidor" value={formatUsd(revenue._sum.supplierAmount ?? 0)} tone="amber" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr,0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Top ventas</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Tours por dinero confirmado</h2>
            </div>
            <Link href="/admin/tours" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 hover:border-slate-500">
              Ver tours
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {bookingsByTour.map((row) => {
              const tour = tourLookup.get(row.tourId);
              return (
                <div key={row.tourId} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{tour?.title ?? row.tourId}</p>
                      <p className="text-xs text-slate-500">{tour?.SupplierProfile?.company ?? "Sin suplidor"}</p>
                    </div>
                    <p className="font-semibold text-emerald-700">{formatUsd(row._sum.totalAmount ?? 0)}</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {row._count.id.toLocaleString()} reservas · payout {formatUsd(row._sum.supplierAmount ?? 0)} · fee {formatUsd(row._sum.platformFee ?? 0)}
                  </p>
                </div>
              );
            })}
            {!bookingsByTour.length && <p className="text-sm text-slate-500">Sin ventas confirmadas todavía.</p>}
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Canales</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Ventas por origen</h2>
            <div className="mt-4 space-y-2">
              {sourceRows.map((row) => (
                <div key={row.source} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-slate-900">{row.source}</span>
                  <span className="text-slate-600">{formatUsd(row._sum.totalAmount ?? 0)} · {row._count.id}</span>
                </div>
              ))}
              {!sourceRows.length && <p className="text-sm text-slate-500">Sin canales registrados.</p>}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Volumen historico</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Tours con más reservas</h2>
            <div className="mt-4 space-y-2">
              {topTours.map((tour) => (
                <Link key={tour.id} href={`/admin/tours?query=${encodeURIComponent(tour.title)}`} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm hover:border-slate-300">
                  <span className="min-w-0 truncate font-semibold text-slate-900">{tour.title}</span>
                  <span className="shrink-0 text-slate-600">{tour._count.Booking.toLocaleString()}</span>
                </Link>
              ))}
              {!topTours.length && <p className="text-sm text-slate-500">Sin datos disponibles.</p>}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function ReportCard({ label, value, tone }: { label: string; value: string; tone: "emerald" | "sky" | "indigo" | "amber" }) {
  const classes = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    sky: "border-sky-200 bg-sky-50 text-sky-950",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950"
  };

  return (
    <article className={`rounded-3xl border p-5 shadow-sm ${classes[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}
