export const dynamic = "force-dynamic";

import { Prisma } from "@prisma/client";

import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import { getRentCarOptions } from "@/data/rentCarFleet";
import { prisma } from "@/lib/prisma";
import { getRentCarFleetSettings } from "@/lib/rentCarSettings";
import { requireWorkplaceContext } from "@/lib/workplace";
import { buildWorkplaceBookingWhere } from "@/lib/workplaceBookings";
import { formatScopeLine, textMatchesScope } from "@/lib/workplaceFilters";
import { buildWorkplaceTourWhere } from "@/lib/workplaceTours";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function WorkplaceReportsPage() {
  const context = await requireWorkplaceContext("reports.view");
  const tourWhere = buildWorkplaceTourWhere({
    ...context.scope,
    niches: context.scope.niches.length ? context.scope.niches : ["tours"],
    modules: context.scope.modules.length ? context.scope.modules : ["tours"]
  });
  const bookingWhere = buildWorkplaceBookingWhere(context.scope);
  const settings = await getRentCarFleetSettings();
  const rentOptions = getRentCarOptions(undefined, settings).filter((option) =>
    textMatchesScope(`${option.locationName} ${option.regionId} ${option.model}`, context.scope.cities)
  );

  const [tourTotal, tourActive, bookingTotal, bookingAmount, suppliers, approvals, auditLogs] = await Promise.all([
    prisma.tour.count({ where: tourWhere }),
    prisma.tour.count({ where: { AND: [tourWhere, { status: { equals: "published", mode: Prisma.QueryMode.insensitive } }] } }),
    prisma.booking.count({ where: bookingWhere }),
    prisma.booking.aggregate({ where: bookingWhere, _sum: { totalAmount: true } }),
    prisma.supplierProfile.count({ where: { Tour: { some: tourWhere } } }),
    prisma.workplaceApprovalRequest.count({ where: { status: "PENDING" } }),
    prisma.workplaceAuditLog.findMany({
      where: context.isAdmin ? {} : { employeeId: context.employee?.id ?? "__none__" },
      orderBy: { createdAt: "desc" },
      take: 12
    })
  ]);

  return (
    <WorkplaceShell active="reports" employeeName={context.user.name} department={context.employee?.department?.name ?? "Reportes"} permissions={context.permissions} scope={context.scope}>
      <div className="space-y-7 pb-10">
        <section>
          <p className="text-xs font-bold text-slate-400">Inicio / Reportes</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Reportes</h1>
          <p className="mt-2 text-sm text-slate-400">Resumen operativo filtrado por tu alcance real.</p>
        </section>

        <section className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-5">
          <p className="font-black text-white">Alcance del reporte: <span className="text-cyan-200">{formatScopeLine(context.scope)}</span></p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Tours visibles", tourTotal],
            ["Tours activos", tourActive],
            ["Reservas visibles", bookingTotal],
            ["Ventas visibles", money.format(bookingAmount._sum.totalAmount ?? 0)],
            ["Suplidores visibles", suppliers],
            ["Rent car visible", rentOptions.length],
            ["Aprobaciones pendientes", approvals],
            ["Eventos auditados", auditLogs.length]
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-bold text-slate-400">{label}</p>
              <p className="mt-3 text-2xl font-black text-white">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Auditoria</p>
              <h2 className="mt-2 text-2xl font-black text-white">Ultimos movimientos</h2>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-black text-slate-200">
              {context.isAdmin ? "Vista admin" : "Solo tus acciones"}
            </span>
          </div>
          <div className="mt-5 divide-y divide-white/10">
            {auditLogs.length ? auditLogs.map((log) => (
              <div key={log.id} className="grid gap-2 py-4 text-sm md:grid-cols-[1fr,0.35fr,0.35fr]">
                <p className="font-black text-white">{log.actionKey}</p>
                <p className="text-slate-400">{log.moduleKey ?? "sistema"}</p>
                <p className="text-slate-400">{new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short" }).format(log.createdAt)}</p>
              </div>
            )) : (
              <p className="py-8 text-sm text-slate-400">Todavia no hay movimientos auditados.</p>
            )}
          </div>
        </section>
      </div>
    </WorkplaceShell>
  );
}
