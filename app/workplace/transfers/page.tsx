export const dynamic = "force-dynamic";

import { Prisma } from "@prisma/client";
import { Car, CircleCheck, CircleOff, Filter, MapPin, MapPinned, Plane } from "lucide-react";

import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import { prisma } from "@/lib/prisma";
import { requireWorkplaceContext } from "@/lib/workplace";
import {
  containsInsensitive,
  formatScopeLine,
  isDominicanRepublicScope,
  isGlobalScope,
  uniqueScopeItems
} from "@/lib/workplaceFilters";

type SearchParams = {
  q?: string;
  status?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const routeSelect = {
  id: true,
  active: true,
  countryCode: true,
  updatedAt: true,
  zoneA: { select: { name: true, slug: true } },
  zoneB: { select: { name: true, slug: true } },
  prices: { select: { price: true, currency: true, vehicle: { select: { name: true, category: true, minPax: true, maxPax: true } } }, take: 5 }
} satisfies Prisma.TransferRouteSelect;

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short" });

function buildRouteWhere(scope: { countries: string[]; cities: string[] }, params: SearchParams) {
  const and: Prisma.TransferRouteWhereInput[] = [];
  const countries = uniqueScopeItems(scope.countries);
  if (!isGlobalScope(countries)) {
    and.push({
      OR: countries.flatMap((country) =>
        isDominicanRepublicScope(country)
          ? [{ countryCode: { equals: "RD", mode: Prisma.QueryMode.insensitive } }]
          : [{ countryCode: { equals: country.toUpperCase(), mode: Prisma.QueryMode.insensitive } }]
      )
    });
  }
  const cities = uniqueScopeItems(scope.cities);
  if (!isGlobalScope(cities)) {
    and.push({
      OR: cities.flatMap((city) => [
        { zoneA: { is: { name: containsInsensitive(city) } } },
        { zoneB: { is: { name: containsInsensitive(city) } } }
      ])
    });
  }
  if (params.q) {
    const q = params.q.trim();
    and.push({
      OR: [
        { zoneA: { is: { name: containsInsensitive(q) } } },
        { zoneB: { is: { name: containsInsensitive(q) } } },
        { prices: { some: { vehicle: { is: { name: containsInsensitive(q) } } } } }
      ]
    });
  }
  if (params.status === "active") and.push({ active: true });
  if (params.status === "inactive") and.push({ active: false });
  return and.length ? ({ AND: and } satisfies Prisma.TransferRouteWhereInput) : {};
}

export default async function WorkplaceTransfersPage({ searchParams }: Props) {
  const context = await requireWorkplaceContext("transfers.view");
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const where = buildRouteWhere(context.scope, params);
  const [routes, total, active, zones, locations, vehicles] = await Promise.all([
    prisma.transferRoute.findMany({ where, select: routeSelect, orderBy: { updatedAt: "desc" }, take: 140 }),
    prisma.transferRoute.count({ where }),
    prisma.transferRoute.count({ where: { AND: [where, { active: true }] } }),
    prisma.transferZoneV2.count(),
    prisma.transferLocation.count(),
    prisma.transferVehicle.count({ where: { active: true } })
  ]);

  return (
    <WorkplaceShell active="transfers" employeeName={context.user.name} department={context.employee?.department?.name ?? "Transfer"} permissions={context.permissions} scope={context.scope}>
      <div className="space-y-7 pb-10">
        <section>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-300/15 text-blue-100">
            <Plane className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-xs font-bold text-slate-400">Inicio / Transfer</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Transfer</h1>
          <p className="mt-2 text-sm text-slate-400">Rutas, zonas y precios visibles segun tu mercado asignado.</p>
        </section>

        <section className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-5">
          <p className="font-black text-white">Estas viendo rutas de: <span className="text-cyan-200">{formatScopeLine(context.scope)}</span></p>
        </section>

        <form action="/workplace/transfers" className="grid gap-3 md:grid-cols-[1fr,0.4fr,auto]">
          <input name="q" defaultValue={params.q ?? ""} placeholder="Buscar zona, ruta o vehiculo..." className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
          <select name="status" defaultValue={params.status ?? "all"} className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white">
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-white">
            <Filter className="h-4 w-4" aria-hidden />
            <span>Filtrar</span>
          </button>
        </form>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Rutas", value: total, Icon: MapPinned },
            { label: "Activas", value: active, Icon: CircleCheck },
            { label: "Zonas", value: zones, Icon: MapPin },
            { label: "Ubicaciones", value: locations, Icon: CircleOff },
            { label: "Vehiculos", value: vehicles, Icon: Car }
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

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Ruta</th>
                  <th className="px-5 py-4">Pais</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Precios</th>
                  <th className="px-5 py-4">Actualizacion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {routes.length ? routes.map((route) => (
                  <tr key={route.id} className="text-slate-200">
                    <td className="px-5 py-4 font-black text-white">{route.zoneA.name} {"->"} {route.zoneB.name}</td>
                    <td className="px-5 py-4">{route.countryCode}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${route.active ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-rose-400/20 bg-rose-400/10 text-rose-200"}`}>
                        {route.active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {route.prices.map((price) => (
                          <span key={`${route.id}-${price.vehicle.name}`} className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-200">
                            {price.vehicle.name}: {money.format(price.price)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">{dateFormat.format(route.updatedAt)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No hay rutas dentro de tu alcance.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </WorkplaceShell>
  );
}
