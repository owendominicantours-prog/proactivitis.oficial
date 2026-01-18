import { prisma } from "@/lib/prisma";
import { deleteUserAction, resetUserPreferencesAction } from "./actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" },
    take: 12
  });

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Usuarios</h1>
      <p className="text-sm text-slate-500">
        Lista de usuarios, roles y fecha de registro reciente para auditoría y bloqueos.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm text-slate-600">
          <thead className="text-xs uppercase tracking-[0.3em] text-slate-500">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Registrado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-3 py-3">{user.name ?? "Sin nombre"}</td>
                <td className="px-3 py-3">{user.email}</td>
              <td className="px-3 py-3">{user.role}</td>
              <td className="px-3 py-3">{user.createdAt.toLocaleDateString("es-DO")}</td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-2">
                  <form action={resetUserPreferencesAction} method="post" className="inline">
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-50"
                    >
                      Reiniciar filtros
                    </button>
                  </form>
                  <form action={deleteUserAction} method="post" className="inline">
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-rose-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-600 transition hover:bg-rose-50"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </td>
            </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-center text-xs text-slate-400">
                  No hay usuarios registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
