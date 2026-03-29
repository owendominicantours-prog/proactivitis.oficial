import Link from "next/link";
import { format } from "date-fns";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getSupplierDashboardMetrics } from "@/lib/dashboardStats";

export const dynamic = "force-dynamic";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

export default async function SupplierPanel() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Accede con tu cuenta para ver tu panel.</div>;
  }

  const metrics = await getSupplierDashboardMetrics(userId);
  if (!metrics) {
    return (
      <div className="px-6 py-10 text-center text-sm text-slate-600">
        No encontramos un perfil de supplier asociado a tu cuenta. Contacta con el equipo para activarlo.
      </div>
    );
  }

  const quickActions = [
    { label: "Revisar reservas", href: "/supplier/bookings", helper: "Coordina servicios y cambios operativos." },
    { label: "Gestionar tours", href: "/supplier/tours", helper: "Actualiza experiencias, fotos y publicación." },
    { label: "Ver finanzas", href: "/supplier/finance", helper: "Conecta Stripe y revisa payouts." },
    { label: "Crear oferta", href: "/supplier/offers", helper: "Activa descuentos para vender más." }
  ];

  const alerts = [
    metrics.cancellationRequests > 0
      ? {
          title: "Solicitudes de cancelación abiertas",
          detail: `${metrics.cancellationRequests} reserva(s) requieren revisión desde supplier.`
        }
      : null,
    metrics.draftTours > 0
      ? {
          title: "Tours pendientes de publicación",
          detail: `${metrics.draftTours} experiencia(s) todavía no están publicadas o siguen en borrador.`
        }
      : null,
    !metrics.approved
      ? {
          title: "Perfil pendiente",
          detail: "Tu cuenta supplier aún está en revisión. Algunas funciones pueden estar limitadas."
        }
      : null
  ].filter(Boolean) as Array<{ title: string; detail: string }>;

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-200">Workspace supplier</p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{metrics.company || "Panel de proveedor"}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              Controla reservas, experiencias, ingresos y próximos servicios desde una vista más útil para operación diaria.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">Próximo servicio</p>
            <p className="mt-2 text-lg font-semibold">
              {metrics.latestUpcomingBooking?.customerName ?? "Sin salidas programadas"}
            </p>
            <p className="mt-1 text-slate-300">
              {metrics.latestUpcomingBooking
                ? `${metrics.latestUpcomingBooking.bookingCode} · ${format(metrics.latestUpcomingBooking.travelDate, "PPP")}`
                : "Todavía no hay una reserva próxima"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Próximas salidas" value={String(metrics.upcomingBookings)} helper="Reservas futuras activas" />
        <MetricCard label="Pax hoy" value={String(metrics.paxToday)} helper="Pasajeros programados para hoy" />
        <MetricCard label="Tours publicados" value={String(metrics.publishedTours)} helper="Experiencias visibles al público" />
        <MetricCard label="Ingresos del mes" value={formatCurrency(metrics.supplierRevenueThisMonth)} helper="Estimado confirmado para supplier" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Resumen comercial</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Estado actual del supplier</h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${metrics.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {metrics.approved ? "Activo" : "En revisión"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MiniStat label="Ventas brutas del mes" value={formatCurrency(metrics.grossSalesThisMonth)} />
            <MiniStat label="Ofertas activas" value={String(metrics.activeOffers)} />
            <MiniStat label="Cancelaciones del mes" value={String(metrics.cancellationsThisMonth)} />
            <MiniStat label="Tours en borrador" value={String(metrics.draftTours)} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-sky-300 hover:bg-sky-50"
              >
                <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.helper}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Actualización</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{format(new Date(), "PPPp")}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Este panel ya trabaja con datos reales de tours, reservas, ofertas e ingresos del supplier.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Atención requerida</p>
            <div className="mt-4 space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-950">{alert.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{alert.detail}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <p className="text-sm font-semibold text-emerald-800">Sin alertas críticas</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-700">
                    Tu operación supplier se ve estable. Puedes concentrarte en reservas, publicación y ventas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const MetricCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </article>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
  </div>
);
