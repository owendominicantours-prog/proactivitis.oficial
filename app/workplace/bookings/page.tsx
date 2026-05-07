export const dynamic = "force-dynamic";

import { Prisma } from "@prisma/client";
import { BadgeDollarSign, BriefcaseBusiness, CheckCircle2, Clock3, Filter, ListChecks, XCircle } from "lucide-react";

import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import { prisma } from "@/lib/prisma";
import { requireWorkplaceContext } from "@/lib/workplace";
import { buildWorkplaceBookingWhere, WorkplaceBookingFilters } from "@/lib/workplaceBookings";
import { formatScopeLine } from "@/lib/workplaceFilters";

type SearchParams = {
  q?: string;
  status?: string;
  type?: string;
  date?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const bookingSelect = {
  id: true,
  bookingCode: true,
  status: true,
  flowType: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  travelDate: true,
  startTime: true,
  paxAdults: true,
  paxChildren: true,
  passengers: true,
  pickup: true,
  hotel: true,
  originAirport: true,
  totalAmount: true,
  paymentStatus: true,
  createdAt: true,
  Tour: {
    select: {
      title: true,
      location: true,
      SupplierProfile: { select: { company: true } }
    }
  }
} satisfies Prisma.BookingSelect;

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short" });

const serviceLabel = (flowType?: string | null) => {
  if (flowType === "transfer") return "Transfer";
  if (flowType === "rent_car") return "Rent Car";
  return "Tour";
};

const statusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (["confirmed", "paid", "completed"].includes(normalized)) return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  if (["cancelled", "canceled", "failed"].includes(normalized)) return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  return "border-amber-400/20 bg-amber-400/10 text-amber-100";
};

export default async function WorkplaceBookingsPage({ searchParams }: Props) {
  const context = await requireWorkplaceContext("bookings.view");
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const filters: WorkplaceBookingFilters = {
    q: params.q,
    status: params.status,
    type: params.type,
    date: params.date
  };
  const scopedWhere = buildWorkplaceBookingWhere(context.scope);
  const filteredWhere = buildWorkplaceBookingWhere(context.scope, filters);

  const [scopedCount, confirmedCount, pendingCount, cancelledCount, rows, amount] = await Promise.all([
    prisma.booking.count({ where: scopedWhere }),
    prisma.booking.count({ where: { AND: [scopedWhere, { status: { equals: "CONFIRMED", mode: Prisma.QueryMode.insensitive } }] } }),
    prisma.booking.count({ where: { AND: [scopedWhere, { status: { in: ["PENDING", "pending"] } }] } }),
    prisma.booking.count({ where: { AND: [scopedWhere, { status: { in: ["CANCELLED", "CANCELED", "cancelled", "canceled"] } }] } }),
    prisma.booking.findMany({ where: filteredWhere, select: bookingSelect, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.booking.aggregate({ where: scopedWhere, _sum: { totalAmount: true } })
  ]);

  return (
    <WorkplaceShell
      active="bookings"
      employeeName={context.user.name}
      department={context.employee?.department?.name ?? "Operaciones"}
      permissions={context.permissions}
      scope={context.scope}
    >
      <div className="space-y-7 pb-10">
        <section>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-100">
            <BriefcaseBusiness className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-xs font-bold text-slate-400">Inicio / Reservas</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Reservas</h1>
          <p className="mt-2 text-sm text-slate-400">Reservas visibles segun tu zona, nicho, proveedor y permisos.</p>
        </section>

        <section className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-5">
          <p className="font-black text-white">Estas viendo reservas de: <span className="text-cyan-200">{formatScopeLine(context.scope)}</span></p>
        </section>

        <form action="/workplace/bookings" className="grid gap-3 xl:grid-cols-[1.4fr,0.75fr,0.75fr,0.65fr,auto]">
          <input name="q" defaultValue={params.q ?? ""} placeholder="Buscar reserva, cliente, servicio..." className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
          <select name="status" defaultValue={params.status ?? "all"} className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white">
            <option value="all">Estado: todos</option>
            <option value="CONFIRMED">Confirmadas</option>
            <option value="PENDING">Pendientes</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
          <select name="type" defaultValue={params.type ?? "all"} className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white">
            <option value="all">Tipo: todos</option>
            <option value="tour">Tours</option>
            <option value="transfer">Transfer</option>
            <option value="rent_car">Rent Car</option>
          </select>
          <input name="date" type="date" defaultValue={params.date ?? ""} className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white" />
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-white">
            <Filter className="h-4 w-4" aria-hidden />
            <span>Filtrar</span>
          </button>
        </form>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Reservas", value: scopedCount, Icon: ListChecks },
            { label: "Confirmadas", value: confirmedCount, Icon: CheckCircle2 },
            { label: "Pendientes", value: pendingCount, Icon: Clock3 },
            { label: "Canceladas", value: cancelledCount, Icon: XCircle },
            { label: "Total visible", value: money.format(amount._sum.totalAmount ?? 0), Icon: BadgeDollarSign }
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
            <table className="min-w-[1120px] w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Reserva</th>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Servicio</th>
                  <th className="px-5 py-4">Proveedor</th>
                  <th className="px-5 py-4">Fecha</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.length ? rows.map((booking) => (
                  <tr key={booking.id} className="text-slate-200">
                    <td className="px-5 py-4">
                      <p className="font-black text-white">{booking.bookingCode ?? booking.id.slice(0, 8).toUpperCase()}</p>
                      <p className="mt-1 text-xs text-slate-400">{serviceLabel(booking.flowType)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{booking.customerName}</p>
                      <p className="mt-1 text-xs text-slate-400">{booking.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{booking.Tour.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{booking.pickup || booking.hotel || booking.originAirport || booking.Tour.location}</p>
                    </td>
                    <td className="px-5 py-4">{booking.Tour.SupplierProfile.company}</td>
                    <td className="px-5 py-4">{dateFormat.format(booking.travelDate)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(booking.status)}`}>{booking.status}</span>
                    </td>
                    <td className="px-5 py-4 font-black text-white">{money.format(booking.totalAmount)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400">No hay reservas dentro de tu alcance.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </WorkplaceShell>
  );
}
