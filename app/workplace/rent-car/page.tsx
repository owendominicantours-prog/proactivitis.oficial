export const dynamic = "force-dynamic";

import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import { getRentCarOptions, getRentCarSpecBadges } from "@/data/rentCarFleet";
import { prisma } from "@/lib/prisma";
import { getRentCarFleetSettings } from "@/lib/rentCarSettings";
import { requireWorkplaceContext } from "@/lib/workplace";
import { buildWorkplaceBookingWhere } from "@/lib/workplaceBookings";
import { formatScopeLine, isGlobalScope, textMatchesScope } from "@/lib/workplaceFilters";
import { BadgeDollarSign, BriefcaseBusiness, Car, Filter, MapPin } from "lucide-react";

type SearchParams = {
  q?: string;
  location?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short" });

const scopeAllowsOption = (
  option: { locationName: string; regionId: string; airportLabel: string; model: string; categoryLabel: string },
  scope: { cities: string[]; countries: string[]; products: string[] }
) => {
  const locationText = `${option.locationName} ${option.regionId} ${option.airportLabel}`;
  const cityOk = textMatchesScope(locationText, scope.cities);
  const productOk = isGlobalScope(scope.products) || textMatchesScope(`${option.model} ${option.categoryLabel}`, scope.products);
  return cityOk && productOk;
};

export default async function WorkplaceRentCarPage({ searchParams }: Props) {
  const context = await requireWorkplaceContext("rent_car.view");
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const settings = await getRentCarFleetSettings();
  const allOptions = getRentCarOptions(undefined, settings);
  const scopedOptions = allOptions.filter((option) => scopeAllowsOption(option, context.scope));
  const q = params.q?.trim().toLowerCase() ?? "";
  const rows = scopedOptions.filter((option) => {
    const byLocation = !params.location || params.location === "all" || option.locationId === params.location;
    const byQ = !q || `${option.model} ${option.displayName} ${option.locationName} ${option.categoryLabel}`.toLowerCase().includes(q);
    return byLocation && byQ;
  });
  const bookingWhere = buildWorkplaceBookingWhere(context.scope, { type: "rent_car" });
  const rentBookings = await prisma.booking.findMany({
    where: bookingWhere,
    select: {
      id: true,
      bookingCode: true,
      customerName: true,
      travelDate: true,
      hotel: true,
      pickup: true,
      totalAmount: true,
      status: true,
      pickupNotes: true
    },
    orderBy: { createdAt: "desc" },
    take: 12
  });
  const locationOptions = Array.from(new Map(scopedOptions.map((option) => [option.locationId, option.locationName])).entries());

  return (
    <WorkplaceShell active="rent_car" employeeName={context.user.name} department={context.employee?.department?.name ?? "Rent Car"} permissions={context.permissions} scope={context.scope}>
      <div className="space-y-7 pb-10">
        <section>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100">
            <Car className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-xs font-bold text-slate-400">Inicio / Rent Car</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Rent Car</h1>
          <p className="mt-2 text-sm text-slate-400">Flota, ubicaciones y reservas formales dentro de tu alcance.</p>
        </section>

        <section className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-5">
          <p className="font-black text-white">Estas viendo rent car de: <span className="text-cyan-200">{formatScopeLine(context.scope)}</span></p>
        </section>

        <form action="/workplace/rent-car" className="grid gap-3 md:grid-cols-[1fr,0.45fr,auto]">
          <input name="q" defaultValue={params.q ?? ""} placeholder="Buscar vehiculo, zona o categoria..." className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
          <select name="location" defaultValue={params.location ?? "all"} className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white">
            <option value="all">Todas las zonas</option>
            {locationOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-white">
            <Filter className="h-4 w-4" aria-hidden />
            <span>Filtrar</span>
          </button>
        </form>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Vehiculos visibles", value: rows.length, Icon: Car },
            { label: "Zonas", value: locationOptions.length, Icon: MapPin },
            { label: "Reservas rent car", value: rentBookings.length, Icon: BriefcaseBusiness },
            { label: "Precio inicial", value: rows.length ? money.format(Math.min(...rows.map((row) => row.price))) : "$0", Icon: BadgeDollarSign }
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

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {rows.slice(0, 24).map((option) => (
            <article key={`${option.locationId}-${option.categorySlug}`} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
              <div className="flex h-44 items-center justify-center bg-[#f5f5f2] p-4">
                <img src={option.image} alt={option.model} className="h-full w-full object-contain" />
              </div>
              <div className="p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">{option.locationName}</p>
                <h2 className="mt-2 text-xl font-black text-white">{option.model}</h2>
                <p className="mt-1 text-sm text-slate-400">{option.categoryLabel} - {option.displayName}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {getRentCarSpecBadges(option, "es").slice(0, 5).map((badge) => (
                    <span key={badge} className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-200">{badge}</span>
                  ))}
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-3xl font-black text-emerald-300">{money.format(option.price)}<span className="text-xs text-slate-400">/dia</span></p>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-100">2024/2025</span>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-xl font-black text-white">Ultimas reservas de rent car</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Reserva</th>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Entrega</th>
                  <th className="px-5 py-4">Fecha</th>
                  <th className="px-5 py-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rentBookings.length ? rentBookings.map((booking) => (
                  <tr key={booking.id} className="text-slate-200">
                    <td className="px-5 py-4 font-black text-white">{booking.bookingCode ?? booking.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-4">{booking.customerName}</td>
                    <td className="px-5 py-4">{booking.pickup || booking.hotel || "Pendiente"}</td>
                    <td className="px-5 py-4">{dateFormat.format(booking.travelDate)}</td>
                    <td className="px-5 py-4 font-black text-white">{money.format(booking.totalAmount)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No hay reservas de rent car dentro de tu alcance.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </WorkplaceShell>
  );
}
