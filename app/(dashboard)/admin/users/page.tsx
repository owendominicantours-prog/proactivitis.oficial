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

const roleStyles: Record<string, string> = {
  admin: "bg-slate-900 text-white",
  supplier: "bg-emerald-100 text-emerald-800",
  agency: "bg-sky-100 text-sky-800",
  customer: "bg-amber-100 text-amber-800"
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
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Usuarios</p>
            <h1 className="mt-3 text-3xl font-semibold">Control de usuarios</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              Filtra por rol, revisa cuentas recientes y ejecuta acciones administrativas desde una vista útil en desktop y móvil.
            </p>
          </div>
          <Link
            href="/admin/settings"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Abrir ajustes
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total", value: users.length },
          { label: "Admin", value: byRole.admin },
          { label: "Supplier", value: byRole.supplier },
          { label: "Agency", value: byRole.agency },
          { label: "Customer", value: byRole.customer }
        ].map((item) => (
          <article key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr,1fr,auto,auto]">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Buscar</span>
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Nombre, email o rol"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Rol</span>
            <select
              name="role"
              defaultValue={role}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="all">Todos</option>
              <option value="admin">Admin</option>
              <option value="supplier">Supplier</option>
              <option value="agency">Agency</option>
              <option value="customer">Customer</option>
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Filtrar
            </button>
          </div>
          <div className="flex items-end">
            <Link href="/admin/users" className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500">
              Limpiar
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Registro</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-4">{user.name ?? "Sin nombre"}</td>
                  <td className="px-4 py-4">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleStyles[user.role] ?? "bg-slate-100 text-slate-700"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">{user.createdAt.toLocaleDateString("es-DO")}</td>
                  <td className="px-4 py-4">
                    <UserActions userId={user.id} />
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                    No hay usuarios para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 lg:hidden">
          {filtered.length ? (
            filtered.map((user) => (
              <article key={user.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-900">{user.name ?? "Sin nombre"}</p>
                    <p className="break-all text-sm text-slate-600">{user.email}</p>
                  </div>
                  <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${roleStyles[user.role] ?? "bg-slate-100 text-slate-700"}`}>
                    {user.role}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Registro: {user.createdAt.toLocaleDateString("es-DO")}
                </p>
                <div className="mt-4">
                  <UserActions userId={user.id} stacked />
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
              No hay usuarios para este filtro.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function UserActions({ userId, stacked = false }: { userId: string; stacked?: boolean }) {
  return (
    <div className={`flex ${stacked ? "flex-col" : "flex-wrap"} gap-2`}>
      <form action={resetUserPreferencesAction} method="post" className={stacked ? "w-full" : "inline"}>
        <input type="hidden" name="userId" value={userId} />
        <button type="submit" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500">
          Reiniciar filtros
        </button>
      </form>
      <form action={deleteUserAction} method="post" className={stacked ? "w-full" : "inline"}>
        <input type="hidden" name="userId" value={userId} />
        <button type="submit" className="w-full rounded-xl border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">
          Eliminar
        </button>
      </form>
    </div>
  );
}
