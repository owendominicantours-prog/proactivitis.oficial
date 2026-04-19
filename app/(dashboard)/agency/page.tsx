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
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesion para ver tu panel.</div>;
  }

  const [metrics, agencyProfile, application, latestBookings, tourLinkCount, transferLinkCount, savedPayment] =
    await Promise.all([
      getAgencyDashboardMetrics(userId),
      prisma.agencyProfile.findUnique({
        where: { userId },
        select: { companyName: true, commissionPercent: true, approved: true }
      }),
      prisma.partnerApplication.findFirst({
        where: { userId, role: "AGENCY" },
        orderBy: { updatedAt: "desc" },
        select: { status: true, updatedAt: true }
      }),
      prisma.booking.findMany({
        where: {
          source: "AGENCY",
          OR: [{ userId }, { AgencyProLink: { agencyUserId: userId } }, { AgencyTransferLink: { agencyUserId: userId } }]
        },
        orderBy: [{ createdAt: "desc" }],
        take: 5,
        include: {
          Tour: { select: { title: true } },
          AgencyProLink: { select: { id: true } },
          AgencyTransferLink: { select: { id: true } }
        }
      }),
      prisma.agencyProLink.count({
        where: { agencyUserId: userId, active: true }
      }),
      prisma.agencyTransferLink.count({
        where: { agencyUserId: userId, active: true }
      }),
      prisma.customerPayment.findUnique({
        where: { userId },
        select: { id: true }
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
  const approved = Boolean(session.user?.agencyApproved || agencyProfile?.approved || application?.status === "APPROVED");
  const activeCommercialLinks = tourLinkCount + transferLinkCount;
  const recentDirectBookings = latestBookings.filter((booking) => !booking.AgencyProLink && !booking.AgencyTransferLink).length;
  const recentAgencyProBookings = latestBookings.filter((booking) => Boolean(booking.AgencyProLink || booking.AgencyTransferLink)).length;

  const onboardingSteps = [
    {
      label: "Cuenta aprobada",
      done: approved,
      helper: approved ? "Tu acceso comercial esta listo." : "Falta aprobacion comercial para operar sin friccion."
    },
    {
      label: "Metodo de pago guardado",
      done: Boolean(savedPayment),
      helper: savedPayment ? "Tu agencia puede reservar mas rapido." : "Guarda una tarjeta para acelerar reservas directas."
    },
    {
      label: "Primer link AgencyPro",
      done: activeCommercialLinks > 0,
      helper: activeCommercialLinks > 0 ? "Ya tienes enlaces activos para compartir." : "Crea un link para tours o traslados."
    },
    {
      label: "Primera venta registrada",
      done: metrics.bookingsThisMonth > 0 || metrics.activeBookings > 0,
      helper:
        metrics.bookingsThisMonth > 0 || metrics.activeBookings > 0
          ? "Tu pipeline ya tiene actividad real."
          : "Cierra la primera venta y activa la operacion completa."
    }
  ];

  const completionPercent = Math.round((onboardingSteps.filter((step) => step.done).length / onboardingSteps.length) * 100);

  const channelCards = [
    {
      title: "Reserva directa",
      value: formatCurrency(metrics.directCommission),
      helper: `${commissionPercent}% de comision sobre ventas gestionadas por tu cuenta.`,
      href: "/agency/tours"
    },
    {
      title: "Margen AgencyPro",
      value: formatCurrency(metrics.agencyProMargin),
      helper: `${activeCommercialLinks} links activos entre tours y traslados con tu propio precio.`,
      href: "/agency/subagents"
    },
    {
      title: "Inventario listo para vender",
      value: `${tourLinkCount} tours / ${transferLinkCount} traslados`,
      helper: "Canales preparados para captar ventas por link y por operacion directa.",
      href: "/agency/transfers"
    }
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-[linear-gradient(135deg,#052e2b,#0f172a_45%,#172554_100%)] px-6 py-7 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.34em] text-emerald-100">
                AgencyPro Workspace
              </span>
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-200">
                {approved ? "Cuenta aprobada" : "Onboarding en progreso"}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold md:text-5xl">Vende, opera y escala {companyName} desde un solo panel</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
              AgencyPro centraliza reserva directa, links con markup propio, traslados, reservas activas, control comercial
              y seguimiento operativo. La idea es simple: menos caos manual y mas trazabilidad real para tu agencia.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/agency/tours"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Empezar a vender tours
              </Link>
              <Link
                href="/agency/subagents"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Gestionar links AgencyPro
              </Link>
            </div>
          </div>

          <div className="grid min-w-[290px] gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-100">Comision directa</p>
              <p className="mt-2 text-3xl font-semibold">{commissionPercent}%</p>
              <p className="mt-1 text-slate-300">AgencyPro usa margen propio en links; este porcentaje aplica a reserva directa.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 px-5 py-4 text-sm text-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Nivel de activacion</p>
              <p className="mt-2 text-3xl font-semibold">{completionPercent}%</p>
              <p className="mt-1 text-slate-300">Checklist de onboarding comercial completado.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Reservas activas" value={String(metrics.activeBookings)} helper="Proximas operaciones confirmadas" />
        <MetricCard label="Reservas del mes" value={String(metrics.bookingsThisMonth)} helper="Actividad comercial del mes actual" />
        <MetricCard label="Comision directa" value={formatCurrency(metrics.directCommission)} helper="Reservas hechas desde tu cuenta" />
        <MetricCard label="Margen AgencyPro" value={formatCurrency(metrics.agencyProMargin)} helper="Ganancia por links de tours y traslados" />
        <MetricCard label="Links activos" value={String(activeCommercialLinks)} helper="Tours y traslados listos para compartir" />
        <MetricCard label="Solicitudes pendientes" value={String(metrics.cancellationRequests)} helper="Cancelaciones en revision" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr,0.92fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Onboarding comercial</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Checklist para poner AgencyPro a producir</h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
              {completionPercent}% completo
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {onboardingSteps.map((step) => (
              <div key={step.label} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{step.helper}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${
                    step.done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {step.done ? "Listo" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <QuickLink href="/agency/tours" title="Vender tours" description="Reserva directa y links AgencyPro desde el mismo catalogo." />
            <QuickLink href="/agency/transfers" title="Cotizar traslados" description="Workspace con rutas, ida/vuelta, vehiculos y netos." />
            <QuickLink href="/agency/bookings" title="Ver reservas" description="Clientes, fechas, estados y detalle operativo." />
            <QuickLink href="/agency/subagents" title="Gestionar AgencyPro" description="Links activos, reservas y rendimiento por canal." />
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Resumen ejecutivo</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <QuickStat label="Ventas brutas" value={formatCurrency(metrics.grossSales)} />
            <QuickStat label="Ingreso agencia" value={formatCurrency(metrics.estimatedCommission)} />
            <QuickStat label="Cancelaciones" value={String(metrics.cancellationsThisMonth)} />
            <QuickStat label="Proximas salidas" value={String(metrics.upcomingBookings)} />
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#ecfeff,#f0fdf4)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Estado del sistema</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              AgencyPro ya puede operar con reserva directa y venta por link en paralelo.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Lo importante es que el panel te deja distinguir de donde viene cada venta y como ganas dinero en cada flujo.
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Canales comerciales</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Como se mueve tu agencia hoy</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {channelCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{card.title}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.helper}</p>
                <Link href={card.href} className="mt-4 inline-flex text-sm font-semibold text-sky-700">
                  Abrir modulo
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <QuickStat label="Reservas directas recientes" value={String(recentDirectBookings)} />
            <QuickStat label="Ventas AgencyPro recientes" value={String(recentAgencyProBookings)} />
            <QuickStat label="Cuenta" value={approved ? "Operativa" : "Pendiente"} />
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Lectura enterprise</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Senales de producto serio</h2>
          <div className="mt-4 space-y-3">
            <InsightCard
              title="Gobierno comercial"
              description="Tu agencia puede trabajar con dos modelos claros: comision directa o markup propio por link. Eso evita mezclar ingresos y mejora el control financiero."
            />
            <InsightCard
              title="Trazabilidad operativa"
              description="Cada reserva queda identificada por canal, codigo y monto. Ese nivel de detalle es una senal fuerte de producto profesional."
            />
            <InsightCard
              title="Escalabilidad real"
              description="Catalogo, traslados, bookings, calendario y links viven dentro del mismo workspace. No dependes de procesos sueltos por WhatsApp."
            />
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Actividad reciente</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Ultimas reservas</h2>
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
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{booking.Tour?.title ?? "Reserva"}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {booking.customerName ?? "Cliente"} · {booking.bookingCode ?? booking.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">
                        {channel}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                      <span>Fecha: {booking.travelDate.toLocaleDateString("es-ES")}</span>
                      <span>Total: {formatCurrency(booking.totalAmount)}</span>
                      <span>Estado: {booking.status}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                Aun no tienes reservas en esta cuenta.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Siguiente movimiento</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Donde apretar para crecer</h2>
          <div className="mt-4 space-y-3">
            <InsightCard
              title="Si vendes directo"
              description="Empuja el catalogo de tours y deja lista la tarjeta de la agencia para reservar mas rapido."
            />
            <InsightCard
              title="Si vendes por link"
              description="Crea mas links AgencyPro para rutas con mejor margen y comparte por WhatsApp, email o redes."
            />
            <InsightCard
              title="Si operas traslados"
              description="Usa el workspace de transfers para estandarizar quotes y evitar precios manuales inconsistentes."
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
  <Link href={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
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
