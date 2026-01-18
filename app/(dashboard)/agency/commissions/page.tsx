import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

const resolveCommission = (total: number, agencyFee?: number | null, markup?: number | null) => {
  if (typeof agencyFee === "number") return agencyFee;
  if (typeof markup === "number") return markup;
  return total * 0.2;
};

export default async function AgencyCommissionsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesion para ver comisiones.</div>;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      AgencyProLink: { agencyUserId: userId },
      status: { in: ["CONFIRMED", "COMPLETED"] }
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
    include: { Tour: { select: { title: true } } }
  });
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Comisiones</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Ingresos por ventas</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sigue el estado de tus comisiones y los pagos confirmados.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Reserva</th>
              <th className="px-5 py-3">Tour</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Comision</th>
              <th className="px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length ? (
              bookings.map((booking) => {
                const commission = resolveCommission(
                  booking.totalAmount,
                  booking.agencyFee,
                  booking.agencyMarkupAmount
                );
                const statusLabel = booking.paymentStatus === "paid" ? "Pagado" : "Pendiente";
                return (
                  <tr key={booking.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-semibold text-slate-900">{booking.bookingCode ?? booking.id}</td>
                    <td className="px-5 py-4">{booking.Tour?.title ?? "Tour"}</td>
                    <td className="px-5 py-4">{formatCurrency(booking.totalAmount)}</td>
                    <td className="px-5 py-4">{formatCurrency(commission)}</td>
                    <td className="px-5 py-4">{statusLabel}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-500">
                  No hay comisiones registradas todavia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
