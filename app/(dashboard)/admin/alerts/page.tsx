import Link from "next/link";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  status?: "all" | "pending" | "conflict";
  q?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminAlertsPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const status = params.status ?? "all";
  const query = (params.q ?? "").trim().toLowerCase();

  const allAlerts = await prisma.booking.findMany({
    where: { status: { in: ["pending", "conflict"] } },
    orderBy: { updatedAt: "desc" },
    take: 120,
    include: {
      Tour: { select: { title: true, slug: true } }
    }
  });

  let alerts = allAlerts;
  if (status !== "all") {
    alerts = alerts.filter((item) => item.status === status);
  }
  if (query) {
    alerts = alerts.filter((item) =>
      [item.Tour?.title, item.status, item.id].filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
    );
  }

  const pendingCount = allAlerts.filter((item) => item.status === "pending").length;
  const conflictCount = allAlerts.filter((item) => item.status === "conflict").length;

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Alertas</p>
        <h1 className="text-3xl font-semibold text-slate-900">Centro de alertas</h1>
        <p className="text-sm text-slate-600">Reservas con riesgo operativo para atender primero desde admin.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total</p><p className="mt-2 text-3xl font-semibold text-slate-900">{allAlerts.length}</p></article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-amber-700">Pendientes</p><p className="mt-2 text-3xl font-semibold text-amber-900">{pendingCount}</p></article>
        <article className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-rose-700">Conflicto</p><p className="mt-2 text-3xl font-semibold text-rose-900">{conflictCount}</p></article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col text-sm text-slate-600">
            Buscar
            <input name="q" defaultValue={params.q ?? ""} placeholder="Tour, estado o ID" className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Estado
            <select name="status" defaultValue={status} className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="conflict">Conflicto</option>
            </select>
          </label>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Filtrar</button>
          <Link href="/admin/alerts" className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:border-slate-500">Limpiar</Link>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {alerts.map((alert) => (
            <article key={alert.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{alert.Tour?.title ?? "Tour sin titulo"}</p>
                  <p className="text-xs text-slate-500">ID reserva: {alert.id}</p>
                  <p className="text-xs text-slate-500">Fecha: {alert.travelDate.toLocaleDateString("es-DO")} | Pax: {alert.passengers}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${alert.status === "conflict" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                  {alert.status}
                </span>
              </div>
            </article>
          ))}
          {!alerts.length && <p className="text-sm text-slate-500">Sin alertas para este filtro.</p>}
        </div>
      </section>
    </div>
  );
}
