export const dynamic = "force-dynamic";

import Link from "next/link";
import { Prisma } from "@prisma/client";

import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import { prisma } from "@/lib/prisma";
import { requireWorkplaceContext } from "@/lib/workplace";
import {
  buildWorkplaceTourWhere,
  formatWorkplaceTourScope,
  getTourPrimaryImage,
  getTourZoneLabel,
  ScopedTourRecord,
  WorkplaceTourFilters
} from "@/lib/workplaceTours";
import { requestTourDeleteApprovalAction } from "./actions";

type SearchParams = {
  q?: string;
  status?: string;
  provider?: string;
  zone?: string;
  date?: string;
  approval?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const tourSelect = {
  id: true,
  title: true,
  slug: true,
  productId: true,
  status: true,
  price: true,
  location: true,
  category: true,
  countryId: true,
  heroImage: true,
  gallery: true,
  createdAt: true,
  SupplierProfile: { select: { id: true, company: true, userId: true } },
  country: { select: { code: true, name: true, slug: true } },
  destination: { select: { name: true, slug: true } },
  microZone: { select: { name: true, slug: true } },
  departureDestination: { select: { name: true, slug: true } }
} satisfies Prisma.TourSelect;

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);

const statusLabel: Record<string, string> = {
  published: "Activo",
  active: "Activo",
  draft: "Borrador",
  inactive: "Inactivo",
  pending_review: "Revision"
};

const statusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "published" || normalized === "active") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  if (normalized === "inactive") return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  return "border-amber-400/20 bg-amber-400/10 text-amber-100";
};

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b));

export default async function WorkplaceToursPage({ searchParams }: Props) {
  const context = await requireWorkplaceContext("tours.view");
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const filters: WorkplaceTourFilters = {
    q: params.q,
    status: params.status,
    provider: params.provider,
    zone: params.zone,
    date: params.date
  };

  const scopedWhere = buildWorkplaceTourWhere(context.scope);
  const filteredWhere = buildWorkplaceTourWhere(context.scope, filters);

  const [scopedTours, tours] = await Promise.all([
    prisma.tour.findMany({
      where: scopedWhere,
      select: tourSelect,
      orderBy: { createdAt: "desc" },
      take: 600
    }),
    prisma.tour.findMany({
      where: filteredWhere,
      select: tourSelect,
      orderBy: { createdAt: "desc" },
      take: 120
    })
  ]);

  const scoped = scopedTours as ScopedTourRecord[];
  const rows = tours as ScopedTourRecord[];
  const activeCount = scoped.filter((tour) => ["published", "active"].includes(tour.status.toLowerCase())).length;
  const inactiveCount = scoped.filter((tour) => !["published", "active"].includes(tour.status.toLowerCase())).length;
  const providers = unique(scoped.map((tour) => tour.SupplierProfile.company));
  const zones = unique(scoped.map((tour) => getTourZoneLabel(tour)));
  const canEdit = context.isAdmin || context.permissions.has("tours.edit");
  const canMedia = context.isAdmin || context.permissions.has("tours.media");

  return (
    <WorkplaceShell
      active="tours"
      employeeName={context.user.name}
      department={context.employee?.department?.name ?? "Operaciones Tours"}
      permissions={context.permissions}
      scope={context.scope}
    >
      <div className="space-y-7 pb-10">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Inicio / Tours</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Tours</h1>
            <p className="mt-2 text-sm text-slate-400">Gestiona y visualiza los tours asignados a tu area.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-slate-200">Exportar</button>
            <button className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950">Nuevo Tour</button>
          </div>
        </section>

        {params.approval === "sent" ? (
          <div className="rounded-3xl border border-amber-300/30 bg-amber-300/10 px-5 py-4 text-sm font-bold text-amber-100">
            Esta accion requiere aprobacion de un administrador. La solicitud quedo registrada.
          </div>
        ) : null}

        <section className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="font-black text-white">
              Estas viendo tours de: <span className="text-cyan-200">{formatWorkplaceTourScope(context.scope)}</span>
            </p>
            <span className="w-fit rounded-2xl border border-cyan-300/30 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
              Alcance controlado
            </span>
          </div>
        </section>

        <form action="/workplace/tours" className="grid gap-3 xl:grid-cols-[1.3fr,0.75fr,0.75fr,0.75fr,0.65fr,auto]">
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Buscar tour, proveedor o codigo..."
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
          />
          <select
            name="status"
            defaultValue={params.status ?? "all"}
            className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
          >
            <option value="all">Estado: todos</option>
            <option value="published">Activos</option>
            <option value="draft">Borradores</option>
            <option value="inactive">Inactivos</option>
            <option value="pending_review">Revision</option>
          </select>
          <select
            name="provider"
            defaultValue={params.provider ?? "all"}
            className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
          >
            <option value="all">Proveedor: todos</option>
            {providers.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
          <select
            name="zone"
            defaultValue={params.zone ?? "all"}
            className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
          >
            <option value="all">Zona: todas</option>
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
          <input
            name="date"
            type="date"
            defaultValue={params.date ?? ""}
            className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
          />
          <button className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-white hover:border-cyan-300/50">
            Filtros
          </button>
        </form>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Tours totales", scoped.length],
            ["Tours activos", activeCount],
            ["Tours inactivos", inactiveCount],
            ["Proveedores", providers.length]
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-bold text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-black text-white">{value}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Tour</th>
                  <th className="px-5 py-4">Proveedor</th>
                  <th className="px-5 py-4">Zona</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Precio desde</th>
                  <th className="px-5 py-4">Ultima actualizacion</th>
                  <th className="px-5 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.length ? (
                  rows.map((tour) => {
                    const image = getTourPrimaryImage(tour);
                    return (
                      <tr key={tour.id} className="align-middle text-slate-200">
                        <td className="px-5 py-4">
                          <div className="flex min-w-[280px] items-center gap-4">
                            <div
                              className="h-16 w-24 rounded-2xl bg-cover bg-center ring-1 ring-white/10"
                              style={{ backgroundImage: `url("${image}")` }}
                            />
                            <div>
                              <p className="font-black text-white">{tour.title}</p>
                              <p className="mt-1 text-xs text-slate-400">{tour.productId || tour.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">{tour.SupplierProfile.company}</td>
                        <td className="px-5 py-4">{getTourZoneLabel(tour)}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(tour.status)}`}>
                            {statusLabel[tour.status] ?? tour.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-black text-white">{money.format(tour.price)}</td>
                        <td className="px-5 py-4 text-slate-300">{formatDate(tour.createdAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {canEdit ? (
                              <Link
                                href={`/workplace/tours/${tour.id}`}
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-cyan-100 hover:border-cyan-300/50"
                              >
                                Editar
                              </Link>
                            ) : null}
                            {canMedia ? (
                              <Link
                                href={`/workplace/tours/${tour.id}#media`}
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-cyan-100 hover:border-cyan-300/50"
                              >
                                Fotos
                              </Link>
                            ) : null}
                            <form action={requestTourDeleteApprovalAction}>
                              <input type="hidden" name="tourId" value={tour.id} />
                              <button className="rounded-xl border border-amber-300/30 px-3 py-2 text-xs font-black text-amber-100 hover:bg-amber-300/10">
                                Solicitar baja
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                      No hay tours dentro de tu alcance o con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 text-xs text-slate-400">
            <p>Mostrando {rows.length} de {scoped.length} resultados asignados.</p>
            <p>Las acciones peligrosas pasan por aprobacion.</p>
          </div>
        </section>
      </div>
    </WorkplaceShell>
  );
}
