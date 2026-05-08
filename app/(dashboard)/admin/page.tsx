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

  const alerts = [
    {
      label: "Tours por revisar",
      value: stats.tourReviewQueue,
      description: "Productos esperando aprobacion o correcciones.",
      href: "/admin/tours"
    },
    {
      label: "Aliados pendientes",
      value: stats.supplierApplicationsPending,
      description: "Suplidores o agencias esperando decision.",
      href: "/admin/partner-applications"
    },
    {
      label: "Resenas pendientes",
      value: stats.pendingReviews,
      description: "Opiniones que necesitan moderacion.",
      href: "/admin/reviews"
    },
    {
      label: "Transfers incompletos",
      value: stats.transferNeedsLogistics,
      description: "Reservas futuras sin datos operativos clave.",
      href: "/admin/bookings?query=transfer"
    }
  ];

  const urgentAlerts = alerts.filter((item) => item.value > 0);

  const kpis = [
    {
      label: "Reservas del mes",
      value: stats.confirmedThisMonth.toLocaleString(),
      href: "/admin/bookings?tab=upcoming&status=CONFIRMED&status=COMPLETED",
      tone: "sky"
    },
    {
      label: "Ingreso bruto",
      value: formatCurrency(stats.grossRevenue),
      href: "/admin/finance",
      tone: "emerald"
    },
    {
      label: "Pagos pendientes",
      value: stats.paymentPending.toLocaleString(),
      href: "/admin/bookings?tab=payment",
      tone: "amber"
    },
    {
      label: "Cancelaciones",
      value: stats.cancellationsThisMonth.toLocaleString(),
      href: "/admin/bookings?status=CANCELLED",
      tone: "rose"
    }
  ];

  const commandGroups = [
    {
      label: "Operacion",
      description: "Lo que mueve reservas y clientes.",
      links: [
        { label: "Reservas", href: "/admin/bookings" },
        { label: "ProDiscovery Leads", href: "/admin/prodiscovery-opportunities" },
        { label: "Calendario", href: "/admin/calendar" },
        { label: "Alertas", href: "/admin/alerts" },
        { label: "Soporte publico", href: "/workplace/support" }
      ]
    },
    {
      label: "Productos",
      description: "Catalogo comercial y servicios.",
      links: [
        { label: "Tours", href: "/admin/tours" },
        { label: "Transfer", href: "/admin/transfers" },
        { label: "Rent a car", href: "/admin/rent-a-car" },
        { label: "Hoteles", href: "/admin/hoteles" }
      ]
    },
    {
      label: "Crecimiento",
      description: "SEO, landings y contenido.",
      links: [
        { label: "Landings", href: "/admin/landings" },
        { label: "SEO Factory", href: "/admin/landings/seo-factory" },
        { label: "Keyword Planner", href: "/admin/landings/keyword-planner" },
        { label: "Newsroom", href: "/admin/blog" }
      ]
    },
    {
      label: "Empresa",
      description: "Usuarios, roles, finanzas y aliados.",
      links: [
        { label: "Workplace", href: "/admin/workplace" },
        { label: "Suplidores", href: "/admin/suppliers" },
        { label: "Agencias", href: "/admin/agencies" },
        { label: "Finanzas", href: "/admin/finance" }
      ]
    }
  ];

  return (
    <div className="space-y-7 pb-12">
      <section className="overflow-hidden rounded-[34px] border border-white/70 bg-slate-950 text-white shadow-2xl shadow-cyan-950/10">
        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.25fr,0.75fr]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200">Panel admin</p>
            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Control operativo claro para vender, supervisar y corregir rapido.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Este panel prioriza reservas, pagos, productos, aliados y puntos de riesgo. La idea es que el equipo encuentre
              la accion correcta sin navegar una pagina infinita.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin/bookings" className="rounded-full bg-cyan-400 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-slate-950">
                Ver reservas
              </Link>
              <Link href="/admin/workplace" className="rounded-full border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-white">
                Gestionar equipo
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Estado actual</p>
            <p className="mt-4 text-3xl font-black">
              {urgentAlerts.length ? `${urgentAlerts.length} alertas activas` : "Operacion estable"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Actualizado {new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}
            </p>
            <div className="mt-5 space-y-2">
              {alerts.slice(0, 3).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm transition hover:bg-white/[0.09]"
                >
                  <span className="font-semibold text-slate-200">{item.label}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${item.value ? "bg-amber-300 text-slate-950" : "bg-emerald-400/20 text-emerald-200"}`}>
                    {item.value}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-[28px] border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl ${toneClass(card.tone)}`}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{card.value}</p>
            <p className="mt-3 text-xs font-semibold text-slate-500">Abrir modulo</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
        <article className="rounded-[32px] border border-white bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-slate-400">Reservas recientes</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Ultimas ventas confirmadas</h2>
            </div>
            <Link href="/admin/bookings" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-700 hover:border-slate-400">
              Ver todas
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
            {stats.latestBookings.length ? (
              stats.latestBookings.map((booking, index) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings?tab=all&bookingId=${encodeURIComponent(booking.id)}`}
                  className={`grid gap-3 bg-white p-4 text-sm transition hover:bg-slate-50 md:grid-cols-[1fr,auto] ${
                    index ? "border-t border-slate-100" : ""
                  }`}
                >
                  <div>
                    <p className="font-black text-slate-950">{booking.Tour?.title ?? "Producto no disponible"}</p>
                    <p className="mt-1 text-slate-600">
                      {booking.customerName} - {booking.bookingCode ?? booking.id}
                    </p>
                    <p className="mt-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                      {booking.flowType ?? "tour"} - {formatDate(booking.travelDate)}
                    </p>
                  </div>
                  <p className="text-xl font-black text-emerald-700">{formatCurrency(booking.totalAmount)}</p>
                </Link>
              ))
            ) : (
              <p className="p-6 text-sm text-slate-500">No hay reservas confirmadas recientes.</p>
            )}
          </div>
        </article>

        <article className="rounded-[32px] border border-white bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-slate-400">Mapa de trabajo</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Accesos por area</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {commandGroups.map((group) => (
              <div key={group.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="font-black text-slate-950">{group.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{group.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 hover:border-sky-300 hover:text-sky-700"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function toneClass(tone: string) {
  const classes: Record<string, string> = {
    sky: "border-sky-100 hover:border-sky-200",
    emerald: "border-emerald-100 hover:border-emerald-200",
    rose: "border-rose-100 hover:border-rose-200",
    amber: "border-amber-100 hover:border-amber-200"
  };

  return classes[tone] ?? "border-slate-100";
}
