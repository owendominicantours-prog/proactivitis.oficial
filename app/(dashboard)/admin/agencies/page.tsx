import Link from "next/link";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  q?: string;
  status?: "all" | "approved" | "pending";
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminAgenciesPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const query = (params.q ?? "").trim().toLowerCase();
  const status = params.status ?? "all";

  const agencies = await prisma.agencyProfile.findMany({
    include: {
      User: true
    },
    orderBy: { companyName: "asc" }
  });

  let filtered = agencies;
  if (query) {
    filtered = filtered.filter((agency) =>
      [agency.companyName, agency.User?.name, agency.User?.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }
  if (status !== "all") {
    const mustBeApproved = status === "approved";
    filtered = filtered.filter((agency) => agency.approved === mustBeApproved);
  }

  const approvedCount = agencies.filter((agency) => agency.approved).length;
  const pendingCount = agencies.length - approvedCount;
  const withOwnerCount = agencies.filter((agency) => Boolean(agency.User?.email)).length;

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Agencias</p>
        <h1 className="text-3xl font-semibold text-slate-900">Panel de agencias</h1>
        <p className="text-sm text-slate-600">Gestiona estado, rendimiento y acceso de cada agencia desde una sola vista.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{agencies.length}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Aprobadas</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-900">{approvedCount}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Sin aprobar</p>
          <p className="mt-2 text-3xl font-semibold text-amber-900">{pendingCount}</p>
        </article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Con propietario</p>
          <p className="mt-2 text-3xl font-semibold text-sky-900">{withOwnerCount.toLocaleString()}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col text-sm text-slate-600">
            Buscar
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Empresa, nombre o email"
              className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Estado
            <select
              name="status"
              defaultValue={status}
              className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              <option value="approved">Verificadas</option>
              <option value="pending">Pendientes</option>
            </select>
          </label>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Filtrar
          </button>
          <Link href="/admin/agencies" className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:border-slate-500">
            Limpiar
          </Link>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Listado ({filtered.length})</h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((agency) => (
            <article key={agency.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{agency.companyName}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{agency.User?.name ?? agency.User?.email}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${agency.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {agency.approved ? "Aprobada" : "Pendiente"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Email: {agency.User?.email ?? "Sin email"}</span>
                <Link href={`/admin/agencies/${agency.id}`} className="font-semibold text-sky-700 hover:underline">
                  Abrir detalle
                </Link>
              </div>
            </article>
          ))}
          {!filtered.length && <p className="text-sm text-slate-500">No hay agencias para este filtro.</p>}
        </div>
      </section>
    </div>
  );
}
