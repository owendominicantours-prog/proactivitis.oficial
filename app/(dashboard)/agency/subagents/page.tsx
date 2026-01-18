import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgencySubagentsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesion para ver tu equipo.</div>;
  }

  const links = await prisma.agencyProLink.findMany({
    where: { agencyUserId: userId },
    orderBy: { updatedAt: "desc" },
    take: 8,
    include: { Tour: { select: { title: true } } }
  });
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Sub-agentes</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Equipo comercial</h1>
        <p className="mt-2 text-sm text-slate-600">
          Administra los accesos secundarios y monitorea sus resultados.
        </p>
      </section>

      <section className="space-y-3">
        {links.length ? (
          links.map((link) => (
            <article key={link.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{link.Tour?.title ?? "Tour"}</h2>
                  <p className="text-sm text-slate-500">Link: {link.slug}</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {link.active ? "Activo" : "Pausado"}
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
            No hay sub-agentes registrados. Crea links para asignarlos a tu equipo comercial.
          </div>
        )}
      </section>
    </div>
  );
}
