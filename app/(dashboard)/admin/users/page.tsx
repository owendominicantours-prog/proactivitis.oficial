import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteUserAction, resetUserPreferencesAction } from "./actions";

type SearchParams = {
  q?: string;
  role?: "all" | "admin" | "supplier" | "agency" | "customer";
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const query = (params.q ?? "").trim().toLowerCase();
  const role = params.role ?? "all";

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  let filtered = users;
  if (query) {
    filtered = filtered.filter((user) =>
      [user.name, user.email, user.role].filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
    );
  }
  if (role !== "all") {
    filtered = filtered.filter((user) => user.role === role);
  }

  const byRole = {
    admin: users.filter((user) => user.role === "admin").length,
    supplier: users.filter((user) => user.role === "supplier").length,
    agency: users.filter((user) => user.role === "agency").length,
    customer: users.filter((user) => user.role === "customer").length
  };

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Usuarios</p>
        <h1 className="text-3xl font-semibold text-slate-900">Control de usuarios</h1>
        <p className="text-sm text-slate-600">Filtra por rol, revisa cuentas recientes y ejecuta acciones administrativas rapido.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{users.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p><p className="mt-2 text-3xl font-semibold text-slate-900">{byRole.admin}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-slate-500">Supplier</p><p className="mt-2 text-3xl font-semibold text-slate-900">{byRole.supplier}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-slate-500">Agency</p><p className="mt-2 text-3xl font-semibold text-slate-900">{byRole.agency}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-slate-500">Customer</p><p className="mt-2 text-3xl font-semibold text-slate-900">{byRole.customer}</p></article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col text-sm text-slate-600">
            Buscar
            <input name="q" defaultValue={params.q ?? ""} placeholder="Nombre, email o rol" className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Rol
            <select name="role" defaultValue={role} className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <option value="all">Todos</option>
              <option value="admin">Admin</option>
              <option value="supplier">Supplier</option>
              <option value="agency">Agency</option>
              <option value="customer">Customer</option>
            </select>
          </label>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Filtrar</button>
          <Link href="/admin/users" className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:border-slate-500">Limpiar</Link>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-3 py-3 text-left">Nombre</th>
                <th className="px-3 py-3 text-left">Email</th>
                <th className="px-3 py-3 text-left">Rol</th>
                <th className="px-3 py-3 text-left">Registro</th>
                <th className="px-3 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-3">{user.name ?? "Sin nombre"}</td>
                  <td className="px-3 py-3">{user.email}</td>
                  <td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{user.role}</span></td>
                  <td className="px-3 py-3">{user.createdAt.toLocaleDateString("es-DO")}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <form action={resetUserPreferencesAction} method="post" className="inline">
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-500">Reiniciar filtros</button>
                      </form>
                      <form action={deleteUserAction} method="post" className="inline">
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">Eliminar</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-sm text-slate-500">No hay usuarios para este filtro.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
