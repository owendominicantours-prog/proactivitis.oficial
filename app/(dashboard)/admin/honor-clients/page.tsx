import HonorClientPhotoField from "@/components/admin/HonorClientPhotoField";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createHonorClientAction,
  deleteHonorClientAction,
  toggleHonorClientAction,
  updateHonorClientAction
} from "./actions";

export const metadata = {
  title: "Gestor de Clientes de Honor | Proactivitis"
};

export default async function AdminHonorClientsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const clients = await prisma.honorClient.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Cliente de Honor</p>
        <h1 className="text-3xl font-semibold text-slate-900">Gestor de Clientes de Honor</h1>
        <p className="text-sm text-slate-500">
          Crea, edita, activa u oculta clientes VIP. Los activos se publican automatico en la pagina exclusiva.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Agregar nuevo cliente</h2>
        <form action={createHonorClientAction} className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.28em] text-slate-500">Nombre completo</label>
            <input
              name="fullName"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
              placeholder="Ria Maharaj"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.28em] text-slate-500">Titulo VIP</label>
            <input
              name="vipTitle"
              required
              defaultValue="Miembro Vitalicio con 20% de Descuento"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label className="text-xs uppercase tracking-[0.28em] text-slate-500">Mensaje personalizado</label>
            <textarea
              name="message"
              required
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
              placeholder="Gracias por confiar en Proactivitis desde el inicio."
            />
          </div>
          <div className="lg:col-span-2">
            <HonorClientPhotoField />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-slate-300" />
            Activo
          </label>
          <div className="lg:col-span-2">
            <button className="rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
              Guardar cliente VIP
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Clientes guardados</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {clients.length}
          </span>
        </div>
        {clients.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Aun no hay clientes de honor registrados.
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <article key={client.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Registro</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {new Intl.DateTimeFormat("es-DO", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      }).format(client.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      client.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {client.isActive ? "Activo" : "Oculto"}
                  </span>
                </div>

                <form action={updateHonorClientAction} className="grid gap-4 lg:grid-cols-2">
                  <input type="hidden" name="id" value={client.id} />
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.28em] text-slate-500">Nombre completo</label>
                    <input
                      name="fullName"
                      required
                      defaultValue={client.fullName}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.28em] text-slate-500">Titulo VIP</label>
                    <input
                      name="vipTitle"
                      required
                      defaultValue={client.vipTitle}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-xs uppercase tracking-[0.28em] text-slate-500">Mensaje personalizado</label>
                    <textarea
                      name="message"
                      rows={3}
                      required
                      defaultValue={client.message}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <HonorClientPhotoField defaultValue={client.photoUrl} />
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={client.isActive}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Activo
                  </label>
                  <div className="lg:col-span-2">
                    <button className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-amber-200">
                      Guardar cambios
                    </button>
                  </div>
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={toggleHonorClientAction}>
                    <input type="hidden" name="id" value={client.id} />
                    <input type="hidden" name="nextActive" value={client.isActive ? "false" : "true"} />
                    <button className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                      {client.isActive ? "Ocultar" : "Activar"}
                    </button>
                  </form>
                  <form action={deleteHonorClientAction}>
                    <input type="hidden" name="id" value={client.id} />
                    <button className="rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
                      Eliminar
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
