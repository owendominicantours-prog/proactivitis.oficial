export const dynamic = "force-dynamic";

import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupplierDashboardMetrics } from "@/lib/dashboardStats";

const kpiCards = [
  { label: "Próximas salidas", key: "upcomingBookings", icon: "M6 3h6a2 2 0 0 1 2 2v5H6V3z" },
  { label: "Pax hoy", key: "paxToday", icon: "M4 9h1.5v7H4V9zM8 5H9.5v11H8V5z" },
  { label: "Cancelaciones este mes", key: "cancellationsThisMonth", icon: "M12 14c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4z" },
  { label: "Solicitudes pendientes", key: "cancellationRequests", icon: "M6 12h4v3H6z" }
] as const;

const alerts = [
  { title: "Tours sin fotos suficientes", detail: "Sube al menos 7 imágenes para cada experiencia." },
  { title: "Reservas pendientes", detail: "Hay 3 solicitudes que esperan confirmación." },
  { title: "Oferta destacada", detail: "Navidad expira en 2 días. Revisa los precios." }
];

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

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

  const getValue = (key: typeof kpiCards[number]["key"]) => metrics[key].toLocaleString();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Panel proveedor</p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Operaciones al día</h2>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                {metrics.upcomingBookings > 5 ? "Flujo alto" : "Controlado"}
              </span>
            </div>
            <p className="text-base text-slate-500">Resumen rápido de reservas, ingresos y alertas.</p>
          </div>
          <div className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600">
            {format(new Date(), "PPP")}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-4">
        {kpiCards.map((card) => (
          <article key={card.label} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
              <svg className="h-5 w-5 text-slate-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d={card.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{card.label}</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-indigo-600 md:text-4xl">{getValue(card.key)}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">Última hora</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Actualizado</p>
          <p className="mt-1 text-base text-slate-700">Última sync: {format(new Date(), "PPPp")}</p>
          <p className="mt-2 text-sm text-slate-500">Bases de datos sincronizadas con las reservas más recientes.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Ingresos aproximados</p>
          <p className="mt-2 text-4xl font-semibold text-indigo-600">{formatCurrency(metrics.upcomingBookings * 90)}</p>
          <p className="text-sm text-slate-500">Estimado mensual con comisiones aplicadas.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Alertas</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {alerts.map((alert) => (
              <li key={alert.title} className="flex items-start gap-3 rounded-xl border border-slate-100 px-4 py-3">
                <span className="text-lg text-slate-400">•</span>
                <div>
                  <p className="font-semibold text-slate-900">{alert.title}</p>
                  <p className="text-xs text-slate-500">{alert.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
