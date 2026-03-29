import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAgencyDashboardMetrics } from "@/lib/dashboardStats";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

export default async function AgencyPanel() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesión para ver tu panel.</div>;
  }

  const [metrics, agencyProfile, latestBookings] = await Promise.all([
    getAgencyDashboardMetrics(userId),
    prisma.agencyProfile.findUnique({
      where: { userId },
      select: { companyName: true, commissionPercent: true }
    }),
    prisma.booking.findMany({
      where: {
        source: "AGENCY",
        OR: [{ userId }, { AgencyProLink: { agencyUserId: userId } }, { AgencyTransferLink: { agencyUserId: userId } }]
      },
      orderBy: [{ createdAt: "desc" }],
      take: 4,
      include: {
        Tour: { select: { title: true } },
        AgencyProLink: { select: { id: true } },
        AgencyTransferLink: { select: { id: true } }
      }
    })
  ]);

  if (!metrics) {
    return (
      <div className="px-6 py-10 text-center text-sm text-slate-600">
        No tenemos datos de agencia para esta cuenta. Contacta al equipo para enlazar tu perfil.
      </div>
    );
  }

  const companyName = agencyProfile?.companyName ?? session.user?.name ?? "Tu agencia";
  const commissionPercent = agencyProfile?.commissionPercent ?? 20;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Agency workspace</p>
            <h1 className="mt-3 text-3xl font-semibold">Panel comercial de {companyName}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              Supervisa reservas directas, ventas por AgencyPro, margen, comisión y próximas salidas desde un solo lugar.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Comisión directa</p>
            <p className="mt-2 text-3xl font-semibold">{commissionPercent}%</p>
            <p className="mt-1 text-slate-300">AgencyPro trabaja con margen propio, no con este porcentaje.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Reservas activas" value={String(metrics.activeBookings)} helper="Próximas operaciones confirmadas" />
        <MetricCard label="Reservas del mes" value={String(metrics.bookingsThisMonth)} helper="Actividad comercial del mes actual" />
        <MetricCard label="Comisión directa" value={formatCurrency(metrics.directCommission)} helper="Reservas hechas desde tu cuenta" />
        <MetricCard label="Margen AgencyPro" value={formatCurrency(metrics.agencyProMargin)} helper="Ganancia por links de tours y traslados" />
        <MetricCard label="Solicitudes pendientes" value={String(metrics.cancellationRequests)} helper="Cancelaciones en revisión" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Accesos rápidos</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Herramientas de trabajo</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <QuickLink href="/agency/tours" title="Vender tours" description="Reserva directa y AgencyPro para tours" />
            <QuickLink href="/agency/transfers" title="Cotizar traslados" description="Reserva directa y AgencyPro de transfer" />
            <QuickLink href="/agency/bookings" title="Ver reservas" description="Clientes, fechas, estados y logística" />
            <QuickLink href="/agency/subagents" title="Gestionar AgencyPro" description="Links activos, reservas y rendimiento" />
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Resumen rápido</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <QuickStat label="Ventas brutas" value={formatCurrency(metrics.grossSales)} />
            <QuickStat label="Ingresos agencia" value={formatCurrency(metrics.estimatedCommission)} />
            <QuickStat label="Cancelaciones" value={String(metrics.cancellationsThisMonth)} />
            <QuickStat label="Próximas salidas" value={String(metrics.upcomingBookings)} />
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Actividad reciente</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Últimas reservas</h2>
            </div>
            <Link href="/agency/bookings" className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Ver todo
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {latestBookings.length ? (
              latestBookings.map((booking) => {
                const channel = booking.AgencyTransferLink
                  ? "AgencyPro Transfer"
                  : booking.AgencyProLink
                    ? "AgencyPro Tour"
                    : "Reserva directa";
                return (
                  <div key={booking.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{booking.Tour?.title ?? "Reserva"}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {booking.customerName ?? "Cliente"} · {booking.bookingCode ?? booking.id.slice(0, 8).toUpperCase()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>{channel}</span>
                      <span>{booking.travelDate.toLocaleDateString("es-ES")}</span>
                      <span>${booking.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                Aún no tienes reservas en esta cuenta.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Lectura operativa</p>
          <div className="mt-4 space-y-3">
            <InsightCard
              title="Reserva directa"
              description="Cuando reservas desde tu cuenta, la plataforma aplica tu comisión directa."
            />
            <InsightCard
              title="AgencyPro"
              description="Cuando compartes un link comercial, tu ganancia viene del margen que agregaste al precio final."
            />
            <InsightCard
              title="Próximo paso recomendado"
              description="Usa Catálogo de tours o Traslados para seguir generando reservas con el flujo correcto."
            />
          </div>
        </article>
      </section>
    </div>
  );
}

const MetricCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </article>
);

const QuickStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
  </div>
);

const QuickLink = ({ href, title, description }: { href: string; title: string; description: string }) => (
  <Link href={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-white">
    <p className="text-sm font-semibold text-slate-900">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </Link>
);

const InsightCard = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-sm font-semibold text-slate-900">{title}</p>
    <p className="mt-1 text-sm text-slate-600">{description}</p>
  </div>
);
