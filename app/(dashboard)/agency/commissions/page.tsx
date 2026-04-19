import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAgencyBookingWhere } from "@/lib/agencyMetrics";

export const dynamic = "force-dynamic";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

export default async function AgencyCommissionsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesión para ver comisiones.</div>;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      ...buildAgencyBookingWhere(userId),
      status: { in: ["CONFIRMED", "COMPLETED"] }
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 20,
    include: {
      Tour: { select: { title: true } },
      AgencyProLink: { select: { id: true } },
      AgencyTransferLink: { select: { id: true } }
    }
  });

  const totalDirectCommission = bookings.reduce((sum, booking) => {
    const isDirect = !booking.agencyProLinkId && !booking.agencyTransferLinkId;
    return isDirect ? sum + (booking.agencyFee ?? 0) : sum;
  }, 0);
  const totalAgencyProMargin = bookings.reduce((sum, booking) => {
    const isAgencyPro = Boolean(booking.agencyProLinkId || booking.agencyTransferLinkId);
    return isAgencyPro ? sum + (booking.agencyMarkupAmount ?? 0) : sum;
  }, 0);
  const totalAgencyRevenue = totalDirectCommission + totalAgencyProMargin;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Ingresos</p>
        <h1 className="mt-3 text-3xl font-semibold">Comisiones y márgenes</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200">
          Aquí se combinan las reservas directas de agencia y las ventas por AgencyPro, para que veas tu ingreso real.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Comisión directa" value={formatCurrency(totalDirectCommission)} helper="Reservas hechas desde tu cuenta" />
        <StatCard label="Margen AgencyPro" value={formatCurrency(totalAgencyProMargin)} helper="Tours y traslados vendidos por link" />
        <StatCard label="Ingreso total" value={formatCurrency(totalAgencyRevenue)} helper="Comisión + margen comercial" />
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Reserva</th>
              <th className="px-5 py-3">Producto</th>
              <th className="px-5 py-3">Canal</th>
              <th className="px-5 py-3">Venta</th>
              <th className="px-5 py-3">Ingreso agencia</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length ? (
              bookings.map((booking) => {
                const channelLabel = booking.agencyTransferLinkId
                  ? "AgencyPro Transfer"
                  : booking.agencyProLinkId
                    ? "AgencyPro Tour"
                    : "Reserva directa";
                const agencyRevenue = booking.agencyMarkupAmount ?? booking.agencyFee ?? 0;
                return (
                  <tr key={booking.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-semibold text-slate-900">{booking.bookingCode ?? booking.id}</td>
                    <td className="px-5 py-4">{booking.Tour?.title ?? "Reserva"}</td>
                    <td className="px-5 py-4">{channelLabel}</td>
                    <td className="px-5 py-4">{formatCurrency(booking.totalAmount)}</td>
                    <td className="px-5 py-4">{formatCurrency(agencyRevenue)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-500">
                  No hay ingresos registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {bookings.length ? (
            bookings.map((booking) => {
              const channelLabel = booking.agencyTransferLinkId
                ? "AgencyPro Transfer"
                : booking.agencyProLinkId
                  ? "AgencyPro Tour"
                  : "Reserva directa";
              const agencyRevenue = booking.agencyMarkupAmount ?? booking.agencyFee ?? 0;

              return (
                <article key={booking.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Reserva</p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-900">{booking.bookingCode ?? booking.id}</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p><span className="font-semibold text-slate-900">Producto:</span> {booking.Tour?.title ?? "Reserva"}</p>
                    <p><span className="font-semibold text-slate-900">Canal:</span> {channelLabel}</p>
                    <p><span className="font-semibold text-slate-900">Venta:</span> {formatCurrency(booking.totalAmount)}</p>
                    <p><span className="font-semibold text-slate-900">Ingreso agencia:</span> {formatCurrency(agencyRevenue)}</p>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
              No hay ingresos registrados todavía.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const StatCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </article>
);
