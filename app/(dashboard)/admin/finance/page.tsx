export const dynamic = "force-dynamic";

import Link from "next/link";

import { prisma } from "@/lib/prisma";

type SearchParams = {
  startDate?: string;
  endDate?: string;
  status?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const FINANCE_STATUSES = ["CONFIRMED", "COMPLETED", "PAYMENT_PENDING", "PENDING", "CANCELLED"] as const;
const REVENUE_STATUSES = ["CONFIRMED", "COMPLETED"];

const formatUsd = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatDateInput = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

const parseDate = (value?: string, fallback?: Date) => {
  if (!value) return fallback ?? null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? fallback ?? null : parsed;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const statusLabel: Record<string, string> = {
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  PAYMENT_PENDING: "Pago pendiente",
  PENDING: "Pendiente",
  CANCELLED: "Cancelada"
};

export default async function AdminFinancePage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const today = new Date();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const startDate = parseDate(params.startDate, monthStart) ?? monthStart;
  const endDate = parseDate(params.endDate, today) ?? today;
  const endExclusive = addDays(endDate, 1);
  const status = params.status && FINANCE_STATUSES.includes(params.status as (typeof FINANCE_STATUSES)[number])
    ? params.status
    : "all";

  const baseWhere = {
    createdAt: {
      gte: startDate,
      lt: endExclusive
    },
    ...(status !== "all" ? { status } : {})
  };

  const revenueWhere = {
    ...baseWhere,
    status: {
      in: REVENUE_STATUSES
    }
  };

  const [aggregates, bookings, paymentIssues, supplierRows, statusRows] = await Promise.all([
    prisma.booking.aggregate({
      where: revenueWhere,
      _sum: {
        totalAmount: true,
        platformFee: true,
        supplierAmount: true,
        agencyFee: true,
        agencyMarkupAmount: true
      },
      _count: {
        _all: true
      }
    }),
    prisma.booking.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        Tour: {
          select: {
            title: true,
            SupplierProfile: {
              select: {
                company: true
              }
            }
          }
        },
        AgencyProLink: {
          select: {
            AgencyUser: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        AgencyTransferLink: {
          select: {
            AgencyUser: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    }),
    prisma.booking.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endExclusive
        },
        OR: [
          { status: { in: ["PAYMENT_PENDING", "PENDING"] } },
          { paymentStatus: { in: ["requires_payment_method", "requires_action", "canceled"] } }
        ]
      }
    }),
    prisma.booking.groupBy({
      by: ["tourId"],
      where: revenueWhere,
      _sum: {
        totalAmount: true,
        supplierAmount: true,
        platformFee: true
      },
      _count: {
        _all: true
      },
      orderBy: {
        _sum: {
          totalAmount: "desc"
        }
      },
      take: 10
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: {
        _all: true
      }
    })
  ]);

  const supplierTourIds = supplierRows.map((row) => row.tourId);
  const supplierTours = supplierTourIds.length
    ? await prisma.tour.findMany({
        where: { id: { in: supplierTourIds } },
        select: {
          id: true,
          title: true,
          SupplierProfile: {
            select: {
              company: true
            }
          }
        }
      })
    : [];
  const tourLookup = new Map(supplierTours.map((tour) => [tour.id, tour]));

  const exportHref = `/api/admin/finance/export?startDate=${formatDateInput(startDate)}&endDate=${formatDateInput(endDate)}&status=${encodeURIComponent(status)}`;

  const aggregateSums = aggregates._sum ?? {};
  const platformFee = aggregateSums.platformFee ?? 0;
  const supplierAmount = aggregateSums.supplierAmount ?? 0;
  const agencyFee = aggregateSums.agencyFee ?? 0;
  const agencyMarkupAmount = aggregateSums.agencyMarkupAmount ?? 0;
  const totalRevenue = aggregateSums.totalAmount ?? 0;
  const proactivitisMargin = platformFee + agencyFee + agencyMarkupAmount;

  return (
    <div className="space-y-8 pb-10">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(135deg,#061728,#123453)] p-6 text-white lg:grid-cols-[1.3fr,0.7fr] lg:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200">Finanzas</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">Control real de ventas, comisiones y payouts.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200">
              Revisa dinero confirmado, reservas con pago pendiente y montos que corresponden a suplidores, agencias y Proactivitis.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Periodo</p>
            <p className="mt-2 text-2xl font-semibold">{formatDateInput(startDate)} - {formatDateInput(endDate)}</p>
            <Link href={exportHref} className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-900">
              Exportar CSV
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[1fr,1fr,1fr,auto,auto]">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Desde</span>
            <input
              name="startDate"
              type="date"
              defaultValue={formatDateInput(startDate)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Hasta</span>
            <input
              name="endDate"
              type="date"
              defaultValue={formatDateInput(endDate)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Estado</span>
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400"
            >
              <option value="all">Todos</option>
              {FINANCE_STATUSES.map((item) => (
                <option key={item} value={item}>{statusLabel[item]}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Filtrar
            </button>
          </div>
          <div className="flex items-end">
            <Link href="/admin/finance" className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-500">
              Limpiar
            </Link>
          </div>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <FinanceCard label="Ventas confirmadas" value={formatUsd(totalRevenue)} tone="emerald" />
        <FinanceCard label="Margen Proactivitis" value={formatUsd(proactivitisMargin)} tone="sky" />
        <FinanceCard label="Payout suplidores" value={formatUsd(supplierAmount)} tone="indigo" />
        <FinanceCard label="Comisión agencia" value={formatUsd(agencyFee + agencyMarkupAmount)} tone="amber" />
        <FinanceCard label="Pagos a revisar" value={paymentIssues.toLocaleString()} tone="rose" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Reservas recientes</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Dinero por reserva</h2>
            </div>
            <span className="text-sm text-slate-500">{bookings.length} visibles</span>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Reserva</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Payout</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-slate-100">
                    <td className="px-3 py-3">
                      <Link href={`/admin/bookings?tab=all&bookingId=${encodeURIComponent(booking.id)}`} className="font-semibold text-slate-900 hover:underline">
                        {booking.bookingCode ?? booking.id.slice(0, 8)}
                      </Link>
                      <p className="text-xs text-slate-500">{booking.Tour?.title ?? "Producto no disponible"}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{booking.customerName}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {statusLabel[booking.status] ?? booking.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-slate-900">{formatUsd(booking.totalAmount)}</td>
                    <td className="px-3 py-3 text-right text-slate-600">{formatUsd(booking.supplierAmount ?? 0)}</td>
                  </tr>
                ))}
                {!bookings.length && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-500">No hay reservas para este filtro.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Payout por suplidor</p>
            <div className="mt-4 space-y-3">
              {supplierRows.map((row) => {
                const tour = tourLookup.get(row.tourId);
                return (
                  <div key={row.tourId} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{tour?.SupplierProfile?.company ?? "Suplidor sin nombre"}</p>
                        <p className="text-xs text-slate-500">{tour?.title ?? row.tourId}</p>
                      </div>
                      <p className="font-semibold text-emerald-700">{formatUsd(row._sum?.supplierAmount ?? 0)}</p>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {(row._count?._all ?? 0).toLocaleString()} reservas · ventas {formatUsd(row._sum?.totalAmount ?? 0)} · fee {formatUsd(row._sum?.platformFee ?? 0)}
                    </p>
                  </div>
                );
              })}
              {!supplierRows.length && <p className="text-sm text-slate-500">No hay ventas confirmadas en este periodo.</p>}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Distribución por estado</p>
            <div className="mt-4 space-y-2">
              {statusRows.map((row) => (
                <div key={row.status} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-slate-800">{statusLabel[row.status] ?? row.status}</span>
                  <span className="text-slate-600">{(row._count?._all ?? 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function FinanceCard({ label, value, tone }: { label: string; value: string; tone: "emerald" | "sky" | "indigo" | "amber" | "rose" }) {
  const classes = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    sky: "border-sky-200 bg-sky-50 text-sky-950",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950"
  };

  return (
    <article className={`rounded-3xl border p-5 shadow-sm ${classes[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}
