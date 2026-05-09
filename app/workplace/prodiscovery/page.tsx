export const dynamic = "force-dynamic";

import Link from "next/link";
import type { ReactNode } from "react";
import { Prisma } from "@prisma/client";
import { BadgeDollarSign, CheckCircle2, Clock3, Filter, Sparkles, UserRound, Users } from "lucide-react";

import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import { prisma } from "@/lib/prisma";
import {
  ADDITIONAL_SERVICE_LABELS,
  ASSISTANCE_LABELS,
  BUDGET_TIER_LABELS,
  GROUP_TYPE_LABELS,
  HOLIDAY_STYLE_LABELS,
  INTEREST_LABELS,
  LANGUAGE_LABELS,
  type ProDiscoveryItineraryDraft
} from "@/lib/prodiscoveryGroupOpportunity";
import { requireWorkplaceContext } from "@/lib/workplace";
import { updateWorkplaceProDiscoveryOpportunityAction } from "./actions";

type SearchParams = {
  q?: string;
  status?: string;
  opportunityId?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const statusOptions = ["NEW", "REVIEWING", "QUOTED", "ACCEPTED", "PAYMENT_STARTED", "WON", "LOST"];

const statusLabel: Record<string, string> = {
  NEW: "Nueva",
  REVIEWING: "En trabajo",
  QUOTED: "Propuesta lista",
  ACCEPTED: "Aceptada",
  PAYMENT_STARTED: "Pago iniciado",
  WON: "Ganada",
  LOST: "Perdida"
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const formatDate = new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short" });

const statusClass = (status: string) => {
  if (status === "WON" || status === "ACCEPTED") return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  if (status === "PAYMENT_STARTED") return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  if (status === "LOST") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  if (status === "QUOTED") return "border-sky-300/25 bg-sky-300/10 text-sky-100";
  if (status === "REVIEWING") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  return "border-white/10 bg-white/5 text-slate-200";
};

const jsonArray = (value: Prisma.JsonValue | null | undefined) =>
  Array.isArray(value) ? value.map(String).filter(Boolean) : [];

const itineraryDraft = (value: Prisma.JsonValue | null | undefined): ProDiscoveryItineraryDraft | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as unknown as ProDiscoveryItineraryDraft;
};

const labelValues = (values: string[], labels: Record<string, string>) =>
  values.map((value) => labels[value] ?? value).filter(Boolean);

export const metadata = {
  title: "ProDiscovery | Workplace"
};

export default async function WorkplaceProDiscoveryPage({ searchParams }: Props) {
  const context = await requireWorkplaceContext("prodiscovery.view");
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const q = (params.q ?? "").trim();
  const status = params.status && params.status !== "all" ? params.status : undefined;
  const canManage = context.isAdmin || context.permissions.has("prodiscovery.manage");
  const canFinance = context.isAdmin || context.permissions.has("prodiscovery.finance");

  const where: Prisma.ProDiscoveryGroupOpportunityWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { requestCode: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { city: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { country: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { contactName: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { contactEmail: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { companyName: { contains: q, mode: Prisma.QueryMode.insensitive } }
          ]
        }
      : {})
  };

  const [opportunities, suppliers, employees, counts] = await Promise.all([
    prisma.proDiscoveryGroupOpportunity.findMany({
      where,
      include: {
        assignedToEmployee: { include: { user: { select: { name: true, email: true } }, department: { select: { name: true } } } },
        leaderGuide: { include: { User: { select: { email: true, name: true } } } }
      },
      orderBy: [{ leadPriority: "desc" }, { createdAt: "desc" }],
      take: 80
    }),
    prisma.supplierProfile.findMany({
      where: { approved: true },
      include: { User: { select: { email: true, name: true } } },
      orderBy: { company: "asc" },
      take: 300
    }),
    prisma.workplaceEmployee.findMany({
      where: { status: "APPROVED" },
      include: { user: { select: { name: true, email: true } }, department: { select: { name: true } } },
      orderBy: [{ department: { name: "asc" } }, { user: { name: "asc" } }],
      take: 180
    }),
    prisma.proDiscoveryGroupOpportunity.groupBy({
      by: ["status"],
      _count: { _all: true }
    })
  ]);

  const countByStatus = new Map(counts.map((item) => [item.status, item._count._all]));
  const openCount = (countByStatus.get("NEW") ?? 0) + (countByStatus.get("REVIEWING") ?? 0);
  const quotedCount = countByStatus.get("QUOTED") ?? 0;
  const activeMoneyCount =
    (countByStatus.get("ACCEPTED") ?? 0) + (countByStatus.get("PAYMENT_STARTED") ?? 0) + (countByStatus.get("WON") ?? 0);
  const vipCount = opportunities.filter((item) => item.leadPriority === "PRIORIDAD_VIP").length;

  return (
    <WorkplaceShell
      active="prodiscovery"
      employeeName={context.user.name}
      department={context.employee?.department?.name ?? "ProDiscovery"}
      permissions={context.permissions}
      scope={context.scope}
    >
      <div className="space-y-7 pb-10">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/15 text-emerald-100">
            <Sparkles className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-xs font-bold text-slate-400">Inicio / ProDiscovery</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Oportunidades de grupos privados.</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            Solicitudes de ProDiscovery separadas de tickets normales. Desde aqui el equipo revisa el caso, prepara la
            propuesta, asigna guia lider y deja listo el deposito cuando corresponda.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Abiertas", value: openCount, Icon: Clock3 },
            { label: "Propuestas listas", value: quotedCount, Icon: CheckCircle2 },
            { label: "Con pago activo", value: activeMoneyCount, Icon: BadgeDollarSign },
            { label: "Prioridad VIP visibles", value: vipCount, Icon: Users }
          ].map(({ label, value, Icon }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-400">{label}</p>
                <Icon className="h-5 w-5 text-cyan-200" aria-hidden />
              </div>
              <p className="mt-3 text-2xl font-black text-white">{value}</p>
            </div>
          ))}
        </section>

        <form action="/workplace/prodiscovery" className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 lg:grid-cols-[1fr_220px_auto]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar codigo, destino, cliente, email o empresa..."
            className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <select name="status" defaultValue={params.status ?? "all"} className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white">
            <option value="all">Estado: todos</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {statusLabel[option] ?? option}
              </option>
            ))}
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-white">
            <Filter className="h-4 w-4" aria-hidden />
            <span>Filtrar</span>
          </button>
        </form>

        <section className="space-y-4">
          {opportunities.length ? (
            opportunities.map((opportunity) => {
              const languages = labelValues(jsonArray(opportunity.languages), LANGUAGE_LABELS);
              const assistance = labelValues(jsonArray(opportunity.assistance), ASSISTANCE_LABELS);
              const styles = labelValues(jsonArray(opportunity.holidayStyles), HOLIDAY_STYLE_LABELS);
              const additionalServices = labelValues(jsonArray(opportunity.additionalServices), ADDITIONAL_SERVICE_LABELS);
              const interests = labelValues(jsonArray(opportunity.interests), INTEREST_LABELS);
              const draft = itineraryDraft(opportunity.itineraryDraft);
              const selected = params.opportunityId === opportunity.id;
              const acceptedBudget = opportunity.acceptedBudget ?? null;
              const baseBudget = acceptedBudget ?? opportunity.estimatedBudget ?? 0;
              const deposit = acceptedBudget ? opportunity.depositAmount ?? acceptedBudget * (opportunity.depositPercent / 100) : null;
              const assigneeName =
                opportunity.assignedToEmployee?.user.name ?? opportunity.assignedToEmployee?.user.email ?? "Sin responsable";

              return (
                <article
                  key={opportunity.id}
                  className={`rounded-3xl border bg-white/[0.04] p-5 shadow-sm ${
                    selected ? "border-cyan-300/50 ring-1 ring-cyan-300/25" : "border-white/10"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-black text-white">{opportunity.city}</h2>
                        <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(opportunity.status)}`}>
                          {statusLabel[opportunity.status] ?? opportunity.status}
                        </span>
                        {opportunity.leadPriority === "PRIORIDAD_VIP" ? (
                          <span className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-1 text-xs font-black text-rose-100">
                            PRIORIDAD VIP
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        {opportunity.requestCode} - {opportunity.contactName} - {opportunity.contactEmail}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">{formatDate.format(opportunity.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">{money.format(baseBudget)}</p>
                      <p className="text-xs text-slate-400">{acceptedBudget ? "Presupuesto aceptado" : "Estimado interno"}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <InfoBox label="Grupo" value={GROUP_TYPE_LABELS[opportunity.groupType] ?? opportunity.groupType} helper={`${opportunity.groupSize} personas`} />
                    <InfoBox label="Presupuesto" value={BUDGET_TIER_LABELS[opportunity.budgetTier] ?? opportunity.budgetTier} helper={`${money.format(opportunity.budgetMin ?? 0)} - ${money.format(opportunity.budgetMax ?? 0)}`} />
                    <InfoBox label="Deposito" value={deposit ? money.format(deposit) : "Pendiente"} helper={`${opportunity.depositPercent}% cuando este listo`} />
                    <InfoBox label="Guia lider" value={opportunity.leaderGuideName ?? "Sin asignar"} helper={opportunity.leaderGuideEmail ?? "Pendiente"} />
                    <InfoBox label="Responsable" value={assigneeName} helper={opportunity.assignedToEmployee?.department?.name ?? "Workplace"} />
                  </div>

                  <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.85fr]">
                    <div className="rounded-3xl border border-white/10 bg-[#0b1728] p-4">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Solicitud del cliente</p>
                      <p className="mt-3 text-sm leading-7 text-slate-200">{opportunity.dream}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Array.from(new Set([...languages, ...assistance, ...styles, ...additionalServices, ...interests])).slice(0, 18).map((item) => (
                          <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-200">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100">Resumen para trabajar</p>
                      <p className="mt-3 text-sm leading-7 text-emerald-50">
                        {opportunity.itinerarySummary ?? draft?.summary ?? "Pendiente de preparar por el equipo."}
                      </p>
                      {draft?.days?.length ? (
                        <div className="mt-3 space-y-2">
                          {draft.days.slice(0, 2).map((day) => (
                            <div key={day.title} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                              <p className="text-sm font-black text-white">{day.title}</p>
                              <p className="mt-1 text-xs leading-5 text-emerald-50/80">{day.logistics}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {canManage ? (
                    <form action={updateWorkplaceProDiscoveryOpportunityAction} className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-[#071120] p-4 xl:grid-cols-6">
                      <input type="hidden" name="opportunityId" value={opportunity.id} />
                      <WorkplaceField label="Estado">
                        <select name="status" defaultValue={opportunity.status} className={inputClass}>
                          {statusOptions.map((option) => (
                            <option key={option} value={option}>
                              {statusLabel[option] ?? option}
                            </option>
                          ))}
                        </select>
                      </WorkplaceField>
                      <WorkplaceField label="Responsable">
                        <select name="assignedToEmployeeId" defaultValue={opportunity.assignedToEmployeeId ?? context.employee?.id ?? ""} className={inputClass}>
                          <option value="">Sin asignar</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.user.name ?? employee.user.email ?? "Empleado"}
                            </option>
                          ))}
                        </select>
                      </WorkplaceField>
                      <WorkplaceField label="Guia lider">
                        <select name="leaderGuideId" defaultValue={opportunity.leaderGuideId ?? ""} className={inputClass}>
                          <option value="">Sin asignar</option>
                          {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.company}
                            </option>
                          ))}
                        </select>
                      </WorkplaceField>
                      <WorkplaceField label="Total aceptado">
                        <input
                          name="acceptedBudget"
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={opportunity.acceptedBudget ?? ""}
                          disabled={!canFinance}
                          className={inputClass}
                          placeholder={String(Math.round(opportunity.estimatedBudget ?? 0))}
                        />
                      </WorkplaceField>
                      <WorkplaceField label="Deposito %">
                        <input name="depositPercent" type="number" min="0" max="100" step="1" defaultValue={opportunity.depositPercent} disabled={!canFinance} className={inputClass} />
                      </WorkplaceField>
                      <WorkplaceField label="Comision guia %">
                        <input
                          name="leaderCommissionPercent"
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          defaultValue={opportunity.leaderCommissionPercent ?? 10}
                          disabled={!canFinance}
                          className={inputClass}
                        />
                      </WorkplaceField>
                      <label className="xl:col-span-5">
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Resumen visible en la cuenta del cliente</span>
                        <textarea
                          name="itinerarySummary"
                          defaultValue={opportunity.itinerarySummary ?? draft?.summary ?? ""}
                          rows={3}
                          className={`${inputClass} min-h-24 resize-y leading-6`}
                        />
                      </label>
                      <button className="self-end rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200">
                        Guardar trabajo
                      </button>
                    </form>
                  ) : (
                    <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                      Tienes permiso para ver esta solicitud. Para editarla necesitas permiso de trabajo ProDiscovery.
                    </div>
                  )}
                </article>
              );
            })
          ) : (
            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <UserRound className="mx-auto h-8 w-8 text-cyan-200" aria-hidden />
              <p className="mt-3 text-sm text-slate-300">No hay solicitudes ProDiscovery con esos filtros.</p>
              <Link href="/prodiscovery" className="mt-4 inline-flex rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">
                Abrir ProDiscovery publico
              </Link>
            </article>
          )}
        </section>
      </div>
    </WorkplaceShell>
  );
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-white/10 bg-[#0b1728] px-3 py-2 text-sm font-semibold text-white outline-none ring-cyan-300/25 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

function InfoBox({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1728] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 truncate text-sm font-black text-white">{value}</p>
      {helper ? <p className="mt-1 truncate text-xs text-slate-400">{helper}</p> : null}
    </div>
  );
}

function WorkplaceField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}
