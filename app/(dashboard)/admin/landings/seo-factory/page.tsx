import Link from "next/link";
import {
  draftGeminiSeoLandingAction,
  generateGeminiGlobalTourFactoryBatchAction,
  generateGeminiSeoFactoryBatchAction,
  publishGeminiSeoLandingAction,
  rejectGeminiSeoLandingAction,
  saveGeminiGlobalTourFactorySettingsAction,
  saveGeminiSeoFactorySettingsAction
} from "../actions";
import { getGeminiSeoFactoryConfig, getGeminiSeoPublicPath, listGeminiSeoLandings } from "@/lib/geminiSeoFactory";
import {
  getGeminiGlobalTourFactoryConfig,
  getGeminiGlobalToursGeneratedTodayCount,
  listRecentGeminiGlobalTourDrafts
} from "@/lib/geminiGlobalTourFactory";

export const maxDuration = 300;

const statusStyles = {
  published: "bg-emerald-100 text-emerald-800 border-emerald-200",
  draft: "bg-amber-100 text-amber-800 border-amber-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200"
};

export default async function GeminiSeoFactoryAdminPage() {
  const [config, landings, globalConfig, globalGeneratedToday, globalDrafts] = await Promise.all([
    getGeminiSeoFactoryConfig(),
    listGeminiSeoLandings(),
    getGeminiGlobalTourFactoryConfig(),
    getGeminiGlobalToursGeneratedTodayCount(),
    listRecentGeminiGlobalTourDrafts(8)
  ]);
  const published = landings.filter((item) => item.status === "published").length;
  const drafts = landings.filter((item) => item.status === "draft").length;
  const rejected = landings.filter((item) => item.status === "rejected").length;
  const rentCarLandings = landings.filter((item) => item.type === "rent_car").length;

  return (
    <div className="space-y-8 pb-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-sky-700">Gemini SEO Factory</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Landings con Gemini + Google Search</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Genera paginas de rent car, tours y transfer con productos reales, schema con miniatura, traducciones ES/EN/FR
              y publicacion manual al inicio. Cuando actives publicacion automatica, solo se publican las que pasen validacion.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/landings/keyword-planner"
              className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600"
            >
              Keyword Planner
            </Link>
            <Link
              href="/admin/landings"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Volver a Landings
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{landings.length}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">Publicadas</p>
          <p className="mt-2 text-3xl font-black text-emerald-950">{published}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-700">Draft</p>
          <p className="mt-2 text-3xl font-black text-amber-950">{drafts}</p>
        </article>
        <article className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-rose-700">Rechazadas</p>
          <p className="mt-2 text-3xl font-black text-rose-950">{rejected}</p>
        </article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-sky-700">Rent car</p>
          <p className="mt-2 text-3xl font-black text-sky-950">{rentCarLandings}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form action={saveGeminiSeoFactorySettingsAction} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Control</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Interruptores principales</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <span>
                <span className="block font-black text-slate-950">Generacion diaria</span>
                <span className="text-sm text-slate-500">Permite que el cron genere paginas.</span>
              </span>
              <input name="enabled" type="checkbox" defaultChecked={config.enabled} className="h-5 w-5" />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <span>
                <span className="block font-black text-slate-950">Publicacion automatica</span>
                <span className="text-sm text-slate-500">Publica solo si pasa validacion.</span>
              </span>
              <input name="autoPublish" type="checkbox" defaultChecked={config.autoPublish} className="h-5 w-5" />
            </label>
            <label className="rounded-2xl border border-slate-200 p-4">
              <span className="block text-sm font-black text-slate-950">Limite diario</span>
              <input
                name="dailyLimit"
                type="number"
                min={1}
                max={2880}
                defaultValue={config.dailyLimit}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="rounded-2xl border border-slate-200 p-4">
                <span className="block text-sm font-black text-slate-950">Tours</span>
                <input
                  name="tourDailyLimit"
                  type="number"
                  min={0}
                  max={2880}
                  defaultValue={config.tourDailyLimit}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="rounded-2xl border border-slate-200 p-4">
                <span className="block text-sm font-black text-slate-950">Transfer</span>
                <input
                  name="transferDailyLimit"
                  type="number"
                  min={0}
                  max={2880}
                  defaultValue={config.transferDailyLimit}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="rounded-2xl border border-slate-200 p-4">
                <span className="block text-sm font-black text-slate-950">Rent car</span>
                <input
                  name="rentCarDailyLimit"
                  type="number"
                  min={0}
                  max={2880}
                  defaultValue={config.rentCarDailyLimit}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
          </div>
          <button className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">
            Guardar configuracion
          </button>
        </form>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-300">Manual</p>
            <h2 className="mt-2 text-2xl font-black">Generar ahora</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              El cron automatico genera 2 landings de rent car cada 60 minutos. Al principio puedes revisar y publicar manualmente.
            </p>
          </div>
          <form action={generateGeminiSeoFactoryBatchAction} className="space-y-3">
            <input type="hidden" name="limit" value="3" />
            <button className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-slate-100">
              Generar prueba manual
            </button>
          </form>
          <form action={generateGeminiSeoFactoryBatchAction} className="space-y-3">
            <input type="hidden" name="limit" value="20" />
            <button className="w-full rounded-2xl border border-white/30 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
              Generar 20 manual
            </button>
          </form>
          {config.lastResult ? (
            <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/80">
              <p>Ultimo lote: {config.lastRunAt ? new Date(config.lastRunAt).toLocaleString("es-DO") : "sin fecha"}</p>
              <p>
                {config.lastResult.generated} generadas, {config.lastResult.published} publicadas,{" "}
                {config.lastResult.drafted} draft.
              </p>
              {config.lastResult.errors.length > 0 ? (
                <div className="mt-3 rounded-xl border border-rose-300/30 bg-rose-500/10 p-3 text-xs leading-5 text-rose-100">
                  <p className="font-black">Errores del ultimo lote</p>
                  <ul className="mt-2 space-y-1">
                    {config.lastResult.errors.slice(0, 3).map((error) => (
                      <li key={error}>{error.slice(0, 260)}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form action={saveGeminiGlobalTourFactorySettingsAction} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Tours globales</p>
          <h2 className="mt-2 text-2xl font-black text-emerald-950">Tours globales en modo manual</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-900/70">
            El cron automatico de tours globales queda pausado para priorizar rent car. Puedes generar borradores manualmente
            cuando necesites nuevos productos.
          </p>
          <div className="mt-5 space-y-3">
            <label className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-white p-4">
              <span>
                <span className="block font-black text-slate-950">Generacion automatica</span>
                <span className="text-sm text-slate-500">Solo aplica si vuelves a activar el cron en Vercel.</span>
              </span>
              <input name="globalEnabled" type="checkbox" defaultChecked={globalConfig.enabled} className="h-5 w-5" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-2xl border border-emerald-200 bg-white p-4">
                <span className="block text-sm font-black text-slate-950">Por lote</span>
                <input
                  name="globalBatchSize"
                  type="number"
                  min={1}
                  max={2}
                  defaultValue={globalConfig.batchSize}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="rounded-2xl border border-emerald-200 bg-white p-4">
                <span className="block text-sm font-black text-slate-950">Limite diario</span>
                <input
                  name="globalDailyLimit"
                  type="number"
                  min={1}
                  max={192}
                  defaultValue={globalConfig.dailyLimit}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-2xl border border-emerald-200 bg-white p-4">
                <span className="block text-sm font-black text-slate-950">Margen USD</span>
                <input
                  name="globalMarkupPerPerson"
                  type="number"
                  min={0}
                  max={500}
                  defaultValue={globalConfig.markupPerPerson}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="rounded-2xl border border-emerald-200 bg-white p-4">
                <span className="block text-sm font-black text-slate-950">Anticipacion</span>
                <input
                  name="globalMinLeadHours"
                  type="number"
                  min={12}
                  max={168}
                  defaultValue={globalConfig.minLeadHours}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-black text-white hover:bg-emerald-600">
              Guardar global
            </button>
          </div>
          {globalConfig.lastResult ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-4 text-sm text-slate-700">
              <p>Ultimo lote: {globalConfig.lastRunAt ? new Date(globalConfig.lastRunAt).toLocaleString("es-DO") : "sin fecha"}</p>
              <p>
                {globalConfig.lastResult.generated} generados, {globalConfig.lastResult.drafted} draft.
              </p>
              {globalConfig.lastResult.errors.length > 0 ? (
                <p className="mt-2 text-xs text-rose-700">{globalConfig.lastResult.errors.slice(0, 2).join(" | ")}</p>
              ) : null}
            </div>
          ) : null}
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Borradores globales</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {globalGeneratedToday} creados hoy
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Meta actual: {globalConfig.dailyLimit} por dia, siempre en estado draft.
              </p>
            </div>
            <form action={generateGeminiGlobalTourFactoryBatchAction}>
              <input type="hidden" name="limit" value="2" />
              <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">
                Generar 2 ahora
              </button>
            </form>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {globalDrafts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 md:col-span-2">
                Todavia no hay tours globales generados.
              </div>
            ) : (
              globalDrafts.map((tour) => (
                <Link
                  key={tour.id}
                  href={`/admin/tours?search=${encodeURIComponent(tour.slug)}`}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">{tour.status}</p>
                      <h3 className="mt-2 line-clamp-2 text-base font-black text-slate-950">{tour.title}</h3>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                      ${Math.round(tour.price)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {[tour.country?.name, tour.destination?.name, tour.microZone?.name].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">{tour.category ?? "Sin categoria"}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Revision manual</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Paginas generadas</h2>
          </div>
          <p className="text-sm text-slate-500">Las publicadas entran a sitemap-seo-factory.xml.</p>
        </div>
        <div className="mt-6 space-y-4">
          {landings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Aun no hay landings de Gemini SEO Factory.
            </div>
          ) : (
            landings.map((landing) => {
              const statusClass = statusStyles[landing.status];
              return (
                <article key={landing.slug} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}>
                          {landing.status}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
                          {landing.type}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">Score {landing.validation.score}</span>
                      </div>
                      <h3 className="mt-3 text-xl font-black text-slate-950">{landing.locales.es.h1}</h3>
                      <p className="mt-1 text-sm text-slate-500">{landing.intent.label} - {landing.product.title}</p>
                      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{landing.locales.es.metaDescription}</p>
                      {landing.validation.issues.length > 0 ? (
                        <p className="mt-2 text-xs text-amber-700">{landing.validation.issues.slice(0, 2).join(" | ")}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Link
                        href={`${getGeminiSeoPublicPath(landing.type, landing.slug, "es")}?preview=1`}
                        target="_blank"
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Preview
                      </Link>
                      <Link
                        href={getGeminiSeoPublicPath(landing.type, landing.slug, "es")}
                        target="_blank"
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Publica
                      </Link>
                      <form action={publishGeminiSeoLandingAction}>
                        <input type="hidden" name="slug" value={landing.slug} />
                        <button className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500">
                          Publicar
                        </button>
                      </form>
                      <form action={draftGeminiSeoLandingAction}>
                        <input type="hidden" name="slug" value={landing.slug} />
                        <button className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-400">
                          Draft
                        </button>
                      </form>
                      <form action={rejectGeminiSeoLandingAction}>
                        <input type="hidden" name="slug" value={landing.slug} />
                        <button className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500">
                          Rechazar
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
