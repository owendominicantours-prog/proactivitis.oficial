import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgencyPromocodesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesion para ver promocodes.</div>;
  }

  const links = await prisma.agencyProLink.findMany({
    where: { agencyUserId: userId },
    orderBy: { updatedAt: "desc" },
    take: 9
  });
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Promocodes</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Codigos de descuento</h1>
        <p className="mt-2 text-sm text-slate-600">
          Crea descuentos especiales para grupos y campañas puntuales.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {links.length ? (
          links.map((link) => (
            <article key={link.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{link.slug}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                {link.markup ? `${link.markup}%` : "Link"}
              </h2>
              <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                {link.active ? "Activo" : "Pausado"}
              </span>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
            No hay promocodes activos. Crea un link comercial para comenzar.
          </div>
        )}
      </section>
    </div>
  );
}
