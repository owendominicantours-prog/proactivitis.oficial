import { runDailySeoCleanup, getSeoCleanupStore } from "@/lib/seoCleanup";

export const maxDuration = 300;

async function runSeoCleanupAction() {
  "use server";
  await runDailySeoCleanup(10);
}

export default async function SeoCleanupAdminPage() {
  const store = await getSeoCleanupStore();
  const latestRun = store.runs[0] ?? null;
  const cleanedToday = store.cleanedUrls.filter((item) => item.detectedAt.startsWith(new Date().toISOString().slice(0, 10)));

  return (
    <div className="space-y-8 pb-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-700">SEO Cleanup</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Limpieza diaria de URLs rotas</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Revisa sitemaps, detecta URLs que responden 404/410, limpia hasta 10 por dia y vuelve a enviar sitemaps a Search Console.
            </p>
          </div>
          <form action={runSeoCleanupAction}>
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">
              Ejecutar ahora
            </button>
          </form>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">URLs limpiadas</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{store.cleanedUrls.length}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">Hoy</p>
          <p className="mt-2 text-3xl font-black text-emerald-950">{cleanedToday.length}/10</p>
        </article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-sky-700">Ultimo chequeo</p>
          <p className="mt-2 text-3xl font-black text-sky-950">{latestRun?.checked ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-700">Errores</p>
          <p className="mt-2 text-3xl font-black text-amber-950">{latestRun?.errors.length ?? 0}</p>
        </article>
      </section>

      {latestRun ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Ultimo lote</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{new Date(latestRun.ranAt).toLocaleString("es-DO")}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {latestRun.checked} URLs revisadas, {latestRun.cleaned} limpiadas.
          </p>
          {latestRun.errors.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
              {latestRun.errors.slice(0, 8).map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Historial</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">URLs marcadas para limpieza</h2>
          </div>
          <p className="text-sm text-slate-500">Maximo 10 nuevas por dia.</p>
        </div>
        <div className="mt-6 space-y-3">
          {store.cleanedUrls.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Aun no se han detectado URLs rotas.
            </div>
          ) : (
            store.cleanedUrls.slice(0, 80).map((item) => (
              <article key={`${item.path}-${item.detectedAt}`} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800">
                        HTTP {item.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                        {item.action}
                      </span>
                    </div>
                    <p className="mt-3 break-all text-sm font-black text-slate-950">{item.path}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{new Date(item.detectedAt).toLocaleString("es-DO")}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
