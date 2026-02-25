import { prisma } from "@/lib/prisma";

type SearchParams = {
  q?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminLogsPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const query = (params.q ?? "").trim().toLowerCase();

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 300
  });

  const rows = query
    ? notifications.filter((note) =>
        [note.title, note.body, note.caseNumber]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      )
    : notifications;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = notifications.filter((note) => note.createdAt >= today).length;

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Logs</p>
        <h1 className="text-3xl font-semibold text-slate-900">Bitacora operativa</h1>
        <p className="text-sm text-slate-600">Eventos internos para auditar notificaciones, errores y casos de soporte.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-slate-500">Registros</p><p className="mt-2 text-3xl font-semibold text-slate-900">{notifications.length}</p></article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-sky-700">Hoy</p><p className="mt-2 text-3xl font-semibold text-sky-900">{todayCount}</p></article>
        <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-indigo-700">Filtrados</p><p className="mt-2 text-3xl font-semibold text-indigo-900">{rows.length}</p></article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col text-sm text-slate-600 md:col-span-2">
            Buscar en logs
            <input name="q" defaultValue={params.q ?? ""} placeholder="Titulo, cuerpo o case" className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
          </label>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Filtrar</button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {rows.map((note) => (
            <article key={note.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{note.title}</p>
                  <p className="text-xs text-slate-600">{note.body}</p>
                </div>
                <p className="text-xs text-slate-500">{note.createdAt.toLocaleString("es-DO")}</p>
              </div>
              <p className="mt-2 text-xs text-slate-500">Case: {note.caseNumber ?? "N/A"}</p>
            </article>
          ))}
          {!rows.length && <p className="text-sm text-slate-500">No hay logs para este filtro.</p>}
        </div>
      </section>
    </div>
  );
}
