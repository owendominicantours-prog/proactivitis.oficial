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

export default async function AgencyReportsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesión para ver reportes.</div>;
  }

  const bookings = await prisma.booking.findMany({
    where: buildAgencyBookingWhere(userId),
    select: {
      id: true,
      status: true,
      totalAmount: true,
      agencyFee: true,
      agencyMarkupAmount: true,
      agencyProLinkId: true,
      agencyTransferLinkId: true
    }
  });

  const confirmed = bookings.filter((booking) => ["CONFIRMED", "COMPLETED"].includes(booking.status)).length;
  const cancelled = bookings.filter((booking) => booking.status === "CANCELLED").length;
  const directCount = bookings.filter((booking) => !booking.agencyProLinkId && !booking.agencyTransferLinkId).length;
  const agencyProCount = bookings.filter((booking) => Boolean(booking.agencyProLinkId || booking.agencyTransferLinkId)).length;
  const revenue = bookings
    .filter((booking) => ["CONFIRMED", "COMPLETED"].includes(booking.status))
    .reduce((sum, booking) => sum + booking.totalAmount, 0);
  const agencyIncome = bookings
    .filter((booking) => ["CONFIRMED", "COMPLETED"].includes(booking.status))
    .reduce((sum, booking) => sum + (booking.agencyMarkupAmount ?? booking.agencyFee ?? 0), 0);

  const reportCards = [
    { title: "Ventas confirmadas", detail: `${confirmed} reservas cerradas con éxito.` },
    { title: "Cancelaciones", detail: `${cancelled} reservas canceladas.` },
    { title: "Ventas directas", detail: `${directCount} reservas hechas desde la cuenta de agencia.` },
    { title: "Ventas AgencyPro", detail: `${agencyProCount} reservas generadas por links comerciales.` },
    { title: "Facturación", detail: `Total vendido: ${formatCurrency(revenue)}.` },
    { title: "Ingreso agencia", detail: `Comisión + margen: ${formatCurrency(agencyIncome)}.` }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Reportes</p>
        <h1 className="mt-3 text-3xl font-semibold">Análisis comercial</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200">
          Lectura consolidada de tus reservas directas y de tus ventas por AgencyPro.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((card) => (
          <article key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
