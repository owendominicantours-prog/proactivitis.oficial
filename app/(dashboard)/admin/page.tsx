export const dynamic = "force-dynamic";

import Link from "next/link";

import { getAdminDashboardMetrics } from "@/lib/dashboardStats";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);

export default async function AdminDashboard() {
  const stats = await getAdminDashboardMetrics();

  const kpiCards = [
    {
      label: "Reservas del mes",
      value: stats.confirmedThisMonth.toLocaleString(),
      href: "/admin/bookings?tab=upcoming&status=CONFIRMED&status=COMPLETED",
      tone: "indigo"
    },
    {
      label: "Ingreso bruto",
      value: formatCurrency(stats.grossRevenue),
      href: "/admin/finance",
      tone: "emerald"
    },
    {
      label: "Cancelaciones",
      value: stats.cancellationsThisMonth.toLocaleString(),
      href: "/admin/bookings?status=CANCELLED",
      tone: "rose"
    },
    {
      label: "Pagos pendientes",
      value: stats.paymentPending.toLocaleString(),
      href: "/admin/bookings?tab=payment",
      tone: "amber"
    }
  ] as const;

  const operationCards = [
    {
      label: "Tours por revisar",
      value: stats.tourReviewQueue,
      description: "Productos esperando aprobación o correcciones.",
      href: "/admin/tours",
      urgent: stats.tourReviewQueue > 0
    },
    {
      label: "Solicitudes de aliados",
      value: stats.supplierApplicationsPending,
      description: "Suplidores o agencias esperando decisión.",
      href: "/admin/partner-applications",
      urgent: stats.supplierApplicationsPending > 0
    },
    {
      label: "Reseñas pendientes",
      value: stats.pendingReviews,
      description: "Opiniones que necesitan moderación antes de publicarse.",
      href: "/admin/reviews",
      urgent: stats.pendingReviews > 0
    },
    {
      label: "Transfers incompletos",
      value: stats.transferNeedsLogistics,
      description: "Reservas futuras sin datos operativos clave.",
      href: "/admin/bookings?query=transfer",
      urgent: stats.transferNeedsLogistics > 0
    }
  ];

  const alerts = operationCards.filter((card) => card.urgent);

  return (
    <div className="space-y-8 pb-10">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(135deg,#0f172a,#1e293b)] p-6 text-white lg:grid-cols-[1.4fr,0.8fr] lg:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200">
              Centro de control
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight lg:text-4xl">
              Operación, ventas y calidad en una sola vista.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200">
              Prioriza reservas, pagos, tours en revisión y datos que pueden afectar la experiencia del cliente.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">
              Estado actual
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {alerts.length ? `${alerts.length} punto(s) requieren atención` : "Sin alertas críticas"}
            </p>
            <p className="mt-2 text-sm text-slate-200">
              Actualizado {new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <Link key={card.label} href={card.href} className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClass(card.tone)}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] opacity-75">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {operationCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              card.urgent ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{card.label}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${card.urgent ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                {card.value.toLocaleString()}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr,0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                Reservas recientes
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Últimas ventas confirmadas</h2>
            </div>
            <Link href="/admin/bookings" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 hover:border-slate-500">
              Ver reservas
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {stats.latestBookings.length ? (
              stats.latestBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings?tab=all&bookingId=${encodeURIComponent(booking.id)}`}
                  className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm transition hover:border-slate-300 md:grid-cols-[1fr,auto]"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{booking.Tour?.title ?? "Producto no disponible"}</p>
                    <p className="mt-1 text-slate-600">
                      {booking.customerName} · {booking.bookingCode ?? booking.id}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                      {booking.flowType ?? "tour"} · {formatDate(booking.travelDate)}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-emerald-700">{formatCurrency(booking.totalAmount)}</p>
                </Link>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                No hay reservas confirmadas recientes.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
            Prioridad del equipo
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Qué revisar primero</h2>
          <div className="mt-5 space-y-3">
            {alerts.length ? (
              alerts.map((alert) => (
                <Link key={alert.label} href={alert.href} className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm hover:bg-amber-100">
                  <p className="font-semibold text-amber-900">{alert.label}</p>
                  <p className="mt-1 text-amber-800">{alert.description}</p>
                </Link>
              ))
            ) : (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                El panel no muestra puntos urgentes. Mantén el monitoreo de reservas y pagos.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function toneClass(tone: "indigo" | "emerald" | "rose" | "amber") {
  const classes = {
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950"
  };

  return classes[tone];
}
