import Link from "next/link";
import { Prisma } from "@prisma/client";
import { updateProDiscoveryOpportunityAction } from "./actions";

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

type SearchParams = {
  q?: string;
  status?: string;
  opportunityId?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const statusOptions = ["NEW", "REVIEWING", "QUOTED", "ACCEPTED", "WON", "LOST"];

const statusLabel: Record<string, string> = {
  NEW: "Nueva",
  REVIEWING: "Revision",
  QUOTED: "Cotizada",
  ACCEPTED: "Aceptada",
  WON: "Ganada",
  LOST: "Perdida"
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);

const statusClass = (status: string) => {
  if (status === "WON" || status === "ACCEPTED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "LOST") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "QUOTED") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "REVIEWING") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
};

const jsonArray = (value: Prisma.JsonValue | null | undefined) =>
  Array.isArray(value) ? value.map(String).filter(Boolean) : [];

const itineraryDraft = (value: Prisma.JsonValue | null | undefined): ProDiscoveryItineraryDraft | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as unknown as ProDiscoveryItineraryDraft;
};

export default async function ProDiscoveryOpportunitiesPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const q = (params.q ?? "").trim();
  const status = params.status && params.status !== "all" ? params.status : undefined;

  const where: Prisma.ProDiscoveryGroupOpportunityWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { requestCode: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { contactName: { contains: q, mode: "insensitive" } },
            { contactEmail: { contains: q, mode: "insensitive" } },
            { companyName: { contains: q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [opportunities, suppliers, counts] = await Promise.all([
    prisma.proDiscoveryGroupOpportunity.findMany({
      where,
      include: {
        leaderGuide: { include: { User: { select: { email: true, name: true } } } }
      },
      orderBy: { createdAt: "desc" },
      take: 80
    }),
    prisma.supplierProfile.findMany({
      where: { approved: true },
      include: { User: { select: { email: true, name: true } } },
      orderBy: { company: "asc" },
      take: 300
    }),
    prisma.proDiscoveryGroupOpportunity.groupBy({
      by: ["status"],
      _count: { _all: true }
    })
  ]);

  const countByStatus = new Map(counts.map((item) => [item.status, item._count._all]));
  const openCount = (countByStatus.get("NEW") ?? 0) + (countByStatus.get("REVIEWING") ?? 0);
  const quotedCount = countByStatus.get("QUOTED") ?? 0;
  const wonCount = (countByStatus.get("ACCEPTED") ?? 0) + (countByStatus.get("WON") ?? 0);

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">ProDiscovery</p>
        <h1 className="text-3xl font-semibold text-slate-900">Oportunidades de grupo</h1>
        <p className="text-sm text-slate-600">
          Solicitudes de viajes privados, guias lideres, depositos y servicios custom separados de ventas de tickets.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Abiertas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{openCount}</p>
        </article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Cotizadas</p>
          <p className="mt-2 text-3xl font-semibold text-sky-900">{quotedCount}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Aceptadas</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-900">{wonCount}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <label className="flex flex-col text-sm text-slate-600">
            Buscar oportunidad
            <input
              name="q"
              defaultValue={q}
              placeholder="Codigo, ciudad, cliente, email o empresa"
              className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Estado
            <select name="status" defaultValue={params.status ?? "all"} className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <option value="all">Todos</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {statusLabel[option] ?? option}
                </option>
              ))}
            </select>
          </label>
          <button className="self-end rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Filtrar
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {opportunities.length ? (
          opportunities.map((opportunity) => {
            const interests = jsonArray(opportunity.interests).map((item) => INTEREST_LABELS[item] ?? item);
            const languages = jsonArray(opportunity.languages).map((item) => LANGUAGE_LABELS[item] ?? item);
            const assistance = jsonArray(opportunity.assistance).map((item) => ASSISTANCE_LABELS[item] ?? item);
            const styles = jsonArray(opportunity.holidayStyles).map((item) => HOLIDAY_STYLE_LABELS[item] ?? item);
            const additionalServices = jsonArray(opportunity.additionalServices).map((item) => ADDITIONAL_SERVICE_LABELS[item] ?? item);
            const draft = itineraryDraft(opportunity.itineraryDraft);
            const selected = params.opportunityId === opportunity.id;
            const acceptedBudget = opportunity.acceptedBudget ?? opportunity.estimatedBudget ?? 0;

            return (
              <article
                key={opportunity.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${selected ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-900">{opportunity.city}</h2>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(opportunity.status)}`}>
                        {statusLabel[opportunity.status] ?? opportunity.status}
                      </span>
                      {opportunity.leadPriority === "PRIORIDAD_VIP" ? (
                        <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                          PRIORIDAD VIP
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {opportunity.requestCode} - {opportunity.contactName} - {opportunity.contactEmail}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">{formatDate(opportunity.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-slate-900">{money.format(acceptedBudget)}</p>
                    <p className="text-xs text-slate-500">Presupuesto base</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Grupo</p>
                    <p className="font-semibold text-slate-800">{GROUP_TYPE_LABELS[opportunity.groupType] ?? opportunity.groupType}</p>
                    <p>{opportunity.groupSize} personas</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Presupuesto</p>
                    <p className="font-semibold text-slate-800">{BUDGET_TIER_LABELS[opportunity.budgetTier] ?? opportunity.budgetTier}</p>
                    <p>{money.format(opportunity.budgetMin ?? 0)} - {money.format(opportunity.budgetMax ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deposito</p>
                    <p className="font-semibold text-slate-800">{opportunity.depositPercent}%</p>
                    <p>{money.format(opportunity.depositAmount ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Guia lider</p>
                    <p className="font-semibold text-slate-800">{opportunity.leaderGuideName ?? "Sin asignar"}</p>
                    <p>{money.format(opportunity.leaderCommissionAmount ?? 0)} comision</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Idiomas guia</p>
                    <p className="font-semibold text-slate-800">{languages.join(", ") || "Por confirmar"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Horarios</p>
                    <p className="font-semibold text-slate-800">
                      {opportunity.flexibleTiming
                        ? "No esta seguro"
                        : `${opportunity.preferredStartTime ?? "Inicio"} - ${opportunity.preferredEndTime ?? "Fin"}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Asistencia</p>
                    <p className="font-semibold text-slate-800">{assistance.join(", ") || "Por confirmar"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Extras</p>
                    <p className="font-semibold text-slate-800">{additionalServices.join(", ") || "Sin extras"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sueno del cliente</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{opportunity.dream}</p>
                  {interests.length || styles.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.from(new Set([...styles, ...interests])).map((item) => (
                        <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {draft ? (
                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Borrador inicial</p>
                    <p className="mt-2 text-sm leading-7 text-emerald-950">{draft.summary}</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {draft.days.slice(0, 2).map((day) => (
                        <div key={day.title} className="rounded-xl border border-emerald-100 bg-white p-3 text-sm">
                          <p className="font-semibold text-slate-900">{day.title}</p>
                          <p className="mt-1 text-slate-600">{day.logistics}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <form action={updateProDiscoveryOpportunityAction} className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-6">
                  <input type="hidden" name="opportunityId" value={opportunity.id} />
                  <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Estado
                    <select name="status" defaultValue={opportunity.status} className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-800">
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {statusLabel[option] ?? option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Total aceptado
                    <input
                      name="acceptedBudget"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={opportunity.acceptedBudget ?? ""}
                      placeholder={String(Math.round(opportunity.estimatedBudget ?? 0))}
                      className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-800"
                    />
                  </label>
                  <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Deposito %
                    <input
                      name="depositPercent"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      defaultValue={opportunity.depositPercent}
                      className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-800"
                    />
                  </label>
                  <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Guia lider
                    <select name="leaderGuideId" defaultValue={opportunity.leaderGuideId ?? ""} className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-800">
                      <option value="">Sin asignar</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.company}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Comision %
                    <input
                      name="leaderCommissionPercent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      defaultValue={opportunity.leaderCommissionPercent ?? 10}
                      className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-800"
                    />
                  </label>
                  <button className="self-end rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                    Guardar
                  </button>
                </form>
              </article>
            );
          })
        ) : (
          <article className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">No hay oportunidades con esos filtros.</p>
            <Link href="/prodiscovery" className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Abrir ProDiscovery
            </Link>
          </article>
        )}
      </section>
    </div>
  );
}
