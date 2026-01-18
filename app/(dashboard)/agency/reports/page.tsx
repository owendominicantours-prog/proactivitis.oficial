import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

export default async function AgencyReportsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesion para ver reportes.</div>;
  }

  const [confirmed, cancelled, revenue] = await Promise.all([
    prisma.booking.count({
      where: {
        AgencyProLink: { agencyUserId: userId },
        status: { in: ["CONFIRMED", "COMPLETED"] }
      }
    }),
    prisma.booking.count({
      where: {
        AgencyProLink: { agencyUserId: userId },
        status: "CANCELLED"
      }
    }),
    prisma.booking.aggregate({
      where: {
        AgencyProLink: { agencyUserId: userId },
        status: { in: ["CONFIRMED", "COMPLETED"] }
      },
      _sum: { totalAmount: true }
    })
  ]);

  const reportCards = [
    {
      title: "Ventas confirmadas",
      detail: `${confirmed} reservas activas en tu canal.`
    },
    {
      title: "Cancelaciones",
      detail: `${cancelled} reservas canceladas en este periodo.`
    },
    {
      title: "Facturacion",
      detail: `Total generado: ${formatCurrency(revenue._sum.totalAmount ?? 0)}.`
    }
  ];
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Reportes</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Analisis comercial</h1>
        <p className="mt-2 text-sm text-slate-600">
          Descarga reportes por periodo y comparte los resultados con tu equipo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {reportCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
            <button className="mt-4 inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              Exportar
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
