import { prisma } from "@/lib/prisma";

type SearchParams = {
  q?: string;
  status?: "all" | "approved" | "pending";
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminSuppliersPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const query = (params.q ?? "").trim().toLowerCase();
  const status = params.status ?? "all";

  const suppliers = await prisma.supplierProfile.findMany({
    include: {
      Tour: { select: { id: true } },
      User: { select: { name: true, email: true } }
    },
    orderBy: { company: "asc" }
  });

  let filtered = suppliers;
  if (query) {
    filtered = filtered.filter((supplier) =>
      [supplier.company, supplier.User?.name, supplier.User?.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }
  if (status !== "all") {
    const mustBeApproved = status === "approved";
    filtered = filtered.filter((supplier) => supplier.approved === mustBeApproved);
  }

  const approvedCount = suppliers.filter((supplier) => supplier.approved).length;
  const pendingCount = suppliers.length - approvedCount;
  const totalTours = suppliers.reduce((acc, supplier) => acc + supplier.Tour.length, 0);

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Suplidores</p>
        <h1 className="text-3xl font-semibold text-slate-900">Panel de suplidores</h1>
        <p className="text-sm text-slate-600">Vista moderna para control de aprobacion, volumen de tours y operacion.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{suppliers.length}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Aprobados</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-900">{approvedCount}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Pendientes</p>
          <p className="mt-2 text-3xl font-semibold text-amber-900">{pendingCount}</p>
        </article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Tours publicados</p>
          <p className="mt-2 text-3xl font-semibold text-sky-900">{totalTours.toLocaleString()}</p>
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
              <option value="all">Todos</option>
              <option value="approved">Aprobados</option>
              <option value="pending">Pendientes</option>
            </select>
          </label>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Filtrar
          </button>
          <a href="/admin/suppliers" className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:border-slate-500">
            Limpiar
          </a>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Listado ({filtered.length})</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((supplier) => (
            <article key={supplier.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{supplier.company}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{supplier.User?.name ?? supplier.User?.email}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${supplier.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {supplier.approved ? "Aprobado" : "Pendiente"}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">Tours: {supplier.Tour.length.toLocaleString()}</p>
            </article>
          ))}
          {!filtered.length && <p className="text-sm text-slate-500">No hay suplidores para este filtro.</p>}
        </div>
      </section>
    </div>
  );
}
