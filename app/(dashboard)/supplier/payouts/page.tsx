import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

const resolveSupplierAmount = (total: number, sharePercent: number | null, stored?: number | null) => {
  if (typeof stored === "number") return stored;
  const share = typeof sharePercent === "number" ? sharePercent : 20;
  return total * (1 - share / 100);
};

export default async function SupplierPayoutsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Accede con tu cuenta para ver pagos.</div>;
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    include: { Tour: { select: { id: true } } }
  });
  if (!supplier) {
    return (
      <div className="py-10 text-center text-sm text-slate-600">
        No encontramos un perfil de supplier asociado a tu cuenta.
      </div>
    );
  }

  const tourIds = supplier.Tour.map((tour) => tour.id);
  const bookings = await prisma.booking.findMany({
    where: {
      tourId: { in: tourIds },
      status: { in: ["CONFIRMED", "COMPLETED"] }
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
    include: {
      Tour: { select: { title: true, platformSharePercent: true } }
    }
  });
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Pagos</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Pagos a proveedores</h1>
        <p className="mt-2 text-sm text-slate-600">
          Controla tus desembolsos, estados y fechas estimadas en un solo lugar.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Reserva</th>
              <th className="px-5 py-3">Tour</th>
              <th className="px-5 py-3">Monto</th>
              <th className="px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length ? (
              bookings.map((booking) => {
                const amount = resolveSupplierAmount(
                  booking.totalAmount,
                  booking.Tour?.platformSharePercent ?? null,
                  booking.supplierAmount
                );
                const statusLabel =
                  booking.paymentStatus === "paid"
                    ? "Pagado"
                    : booking.status === "COMPLETED"
                      ? "Listo"
                      : "Pendiente";
                return (
                  <tr key={booking.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-semibold text-slate-900">{booking.bookingCode ?? booking.id}</td>
                    <td className="px-5 py-4">{booking.Tour?.title ?? "Tour"}</td>
                    <td className="px-5 py-4">{formatCurrency(amount)}</td>
                    <td className="px-5 py-4">{statusLabel}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-sm text-slate-500">
                  No hay pagos registrados todavia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
