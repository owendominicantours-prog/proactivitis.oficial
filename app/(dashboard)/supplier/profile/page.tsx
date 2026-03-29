export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServerSession } from "next-auth";

import { updateSupplierProfileAction } from "@/app/(dashboard)/supplier/profile/actions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sectionHeadingClass = "text-xs font-semibold uppercase tracking-[0.3em] text-slate-500";

export default async function SupplierProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 shadow-sm">
        Accede a tu cuenta para ver o actualizar tu perfil de proveedor.
      </div>
    );
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    include: { User: true }
  });

  if (!supplier) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 shadow-sm space-y-2">
        <p>No existe un perfil de proveedor vinculado a esta cuenta.</p>
        <p>Contacta al equipo de operaciones para activarlo.</p>
      </div>
    );
  }

  const createdAtLabel = supplier.User?.createdAt
    ? new Date(supplier.User.createdAt).toLocaleDateString("es-ES")
    : "desconocido";

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className={sectionHeadingClass}>Estado del perfil</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-3xl font-semibold text-slate-900">{supplier.company || "Sin compañía registrada"}</p>
            <p className="text-sm text-slate-500">{supplier.approved ? "Perfil aprobado" : "Perfil pendiente"}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            <span className={`h-2 w-2 rounded-full ${supplier.approved ? "bg-emerald-500" : "bg-amber-500"}`} />
            {supplier.approved ? "Activo" : "Revisión"}
          </div>
          <div className="text-xs text-slate-500">Creado el {createdAtLabel}</div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Actualiza tu contacto comercial y el nombre visible de tu empresa desde esta ficha.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <p className={sectionHeadingClass}>Cuenta</p>
          <p>
            <span className="text-sm font-semibold text-slate-600">Nombre</span>
            <br />
            <span className="text-lg font-semibold text-slate-900">{supplier.User?.name ?? session.user?.name ?? "Sin nombre"}</span>
          </p>
          <p>
            <span className="text-sm font-semibold text-slate-600">Correo electrónico</span>
            <br />
            <span className="text-lg font-semibold text-slate-900">{supplier.User?.email ?? session.user?.email}</span>
          </p>
          <p>
            <span className="text-sm font-semibold text-slate-600">Rol</span>
            <br />
            <span className="text-xs uppercase tracking-[0.4em] text-slate-500">{session.user?.role ?? "SUPPLIER"}</span>
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className={sectionHeadingClass}>Datos del supplier</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>
              ID interno: <span className="font-mono text-xs text-slate-500">{supplier.id}</span>
            </p>
            <p>
              Empresa activa: <strong className="text-slate-900">{supplier.company ?? "Sin nombre"}</strong>
            </p>
            <p>
              Aprobación: <strong className="text-slate-900">{supplier.approved ? "Verificada" : "Pendiente"}</strong>
            </p>
            <p>
              Stripe Connect:{" "}
              <strong className="text-slate-900">{supplier.stripeAccountId ? "Configurado" : "Pendiente"}</strong>
            </p>
          </div>
          <div className="mt-5">
            <Link
              href="/supplier/finance"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              Ir a finanzas
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className={sectionHeadingClass}>Actualizar información</p>
        <form action={updateSupplierProfileAction} method="post" className="mt-4 space-y-4">
          <label className="block space-y-1 text-sm text-slate-600">
            Nombre de contacto
            <input
              name="name"
              defaultValue={supplier.User?.name ?? session.user?.name ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500"
            />
          </label>
          <label className="block space-y-1 text-sm text-slate-600">
            Nombre comercial
            <input
              name="company"
              defaultValue={supplier.company ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500"
            />
          </label>
          <p className="text-xs text-slate-500">
            Para cambios de aprobación, rol o datos más sensibles, contacta al equipo de operaciones.
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white hover:bg-slate-800"
          >
            Guardar cambios
          </button>
        </form>
      </section>
    </div>
  );
}
