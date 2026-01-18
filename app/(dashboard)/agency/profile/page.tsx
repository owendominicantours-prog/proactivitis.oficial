import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgencyProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesion para ver tu perfil.</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { AgencyProfile: true }
  });
  const profile = user?.AgencyProfile;
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Perfil</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Datos de la agencia</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ajusta tu informacion comercial, contactos y preferencias de pago.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Contacto principal</h2>
          <p className="mt-2 text-sm text-slate-500">Nombre: {user?.name ?? "Sin nombre"}</p>
          <p className="text-sm text-slate-500">Correo: {user?.email ?? "Sin correo"}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Facturacion</h2>
          <p className="mt-2 text-sm text-slate-500">
            Empresa: {profile?.companyName ?? "Sin empresa"}
          </p>
          <p className="text-sm text-slate-500">
            Estado: {profile?.approved ? "Aprobada" : "Pendiente de aprobacion"}
          </p>
        </article>
      </section>
    </div>
  );
}
