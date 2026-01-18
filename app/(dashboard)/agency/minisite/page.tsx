import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgencyMinisitePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesion para ver tu mini-sitio.</div>;
  }

  const linkCount = await prisma.agencyProLink.count({
    where: { agencyUserId: userId, active: true }
  });
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Mini-sitio</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Landing personalizada</h1>
        <p className="mt-2 text-sm text-slate-600">
          Prepara tu mini-sitio para clientes con branding y tours destacados.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">URL activa</p>
            <p className="text-sm text-slate-500">https://proactivitis.com/agency/tu-marca</p>
            <p className="mt-2 text-xs text-slate-400">Links activos: {linkCount}</p>
          </div>
          <button className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Editar portada
          </button>
        </div>
      </section>
    </div>
  );
}
