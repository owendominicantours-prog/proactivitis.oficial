import Link from "next/link";

import { getGoogleIndexingConfigStatus } from "@/lib/googleIndexing";
import { getGoogleIndexingAutomationStore } from "@/lib/googleIndexingAutomation";
import { checkIndexingMetadataAction, runAutomaticGoogleIndexingAction, submitIndexingUrlsAction } from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(params: SearchParams | undefined, key: string) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function StatusMessage({ params }: { params: SearchParams | undefined }) {
  const error = readParam(params, "error");
  const action = readParam(params, "action");
  const configured = readParam(params, "configured");
  const submitted = readParam(params, "submitted");
  const failed = readParam(params, "failed");
  const skipped = readParam(params, "skipped");
  const firstError = readParam(params, "firstError");
  const latestUpdate = readParam(params, "latestUpdate");
  const latestRemove = readParam(params, "latestRemove");
  const checked = readParam(params, "checked");
  const missing = readParam(params, "missing");

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-900">
        {error}
      </div>
    );
  }

  if (action === "publish") {
    const ok = configured !== "false" && Number(failed ?? 0) === 0;
    return (
      <div className={`rounded-2xl border p-4 text-sm ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
        <p className="font-black">
          Envio terminado: {submitted ?? 0} enviadas, {failed ?? 0} fallidas, {skipped ?? 0} omitidas.
        </p>
        {missing ? <p className="mt-1">Faltan variables: {missing}</p> : null}
        {firstError ? <p className="mt-1 break-words">{firstError}</p> : null}
      </div>
    );
  }

  if (action === "metadata") {
    const ok = checked === "1";
    return (
      <div className={`rounded-2xl border p-4 text-sm ${ok ? "border-sky-200 bg-sky-50 text-sky-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
        {ok ? (
          <>
            <p className="font-black">Consulta recibida por Google.</p>
            <p className="mt-1">Ultimo update: {latestUpdate || "sin registro"}</p>
            <p className="mt-1">Ultimo remove: {latestRemove || "sin registro"}</p>
          </>
        ) : (
          <>
            <p className="font-black">No se pudo consultar la URL.</p>
            {firstError ? <p className="mt-1 break-words">{firstError}</p> : null}
          </>
        )}
      </div>
    );
  }

  if (action === "auto") {
    const ok = configured !== "false" && Number(failed ?? 0) === 0;
    return (
      <div className={`rounded-2xl border p-4 text-sm ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
        <p className="font-black">
          Automatico ejecutado: {submitted ?? 0} enviadas, {failed ?? 0} fallidas, {skipped ?? 0} omitidas, {checked ?? 0} revisadas.
        </p>
        {firstError ? <p className="mt-1 break-words">{firstError}</p> : null}
      </div>
    );
  }

  return null;
}

export default async function GoogleIndexingAdminPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : undefined;
  const config = getGoogleIndexingConfigStatus();
  const automationStore = await getGoogleIndexingAutomationStore();
  const latestAutoRun = automationStore.runs[0] ?? null;

  return (
    <div className="space-y-8 pb-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-700">SEO tecnico</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950">Google Indexing API</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Herramienta interna para notificar a Google que una URL fue actualizada o eliminada. Usala con pocas URLs
              importantes, despues de publicar cambios reales.
            </p>
          </div>
          <Link
            href="/admin/seo"
            className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 hover:border-slate-500"
          >
            Volver a SEO
          </Link>
        </div>
      </header>

      <StatusMessage params={params} />

      <section className="grid gap-4 md:grid-cols-3">
        <article className={`rounded-2xl border p-5 shadow-sm ${config.ready ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Estado</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{config.ready ? "Conectable" : "Faltan claves"}</p>
          <p className="mt-2 text-sm text-slate-600">
            Fuente: <span className="font-black">{config.credentialSource}</span>
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Service account</p>
          <p className="mt-2 break-all text-sm font-semibold text-slate-900">{config.clientEmail ?? "No configurado"}</p>
          <p className="mt-2 text-sm text-slate-600">Dominios permitidos: {config.allowedHosts.join(", ")}</p>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Automatico</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Envio diario desde sitemaps limpios</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Vercel ejecuta /api/cron/google-indexing una vez al dia. El sistema rota por los sitemaps limpios, valida
              HTTP 200 y envia solo URLs sin query.
            </p>
          </div>
          <form action={runAutomaticGoogleIndexingAction}>
            <button className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">
              Probar ahora
            </button>
          </form>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Ultimo</p>
            <p className="mt-2 text-sm font-black text-slate-950">
              {latestAutoRun ? new Date(latestAutoRun.ranAt).toLocaleString("es-DO") : "Sin ejecuciones"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Limite</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{latestAutoRun?.limit ?? process.env.GOOGLE_INDEXING_DAILY_LIMIT ?? 50}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Enviadas</p>
            <p className="mt-2 text-2xl font-black text-emerald-950">{latestAutoRun?.submitted ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Omitidas</p>
            <p className="mt-2 text-2xl font-black text-amber-950">{latestAutoRun?.skipped ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">Fallidas</p>
            <p className="mt-2 text-2xl font-black text-rose-950">{latestAutoRun?.failed ?? 0}</p>
          </div>
        </div>
      </section>

      {!config.ready ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">Configuracion necesaria</p>
          <h2 className="mt-2 text-xl font-black text-amber-950">Agrega estas variables en Vercel</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {["GOOGLE_INDEXING_CLIENT_EMAIL", "GOOGLE_INDEXING_PRIVATE_KEY", "GOOGLE_INDEXING_ALLOWED_HOSTS"].map((item) => (
              <div key={item} className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-black text-slate-900">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-amber-900">
            El service account tambien debe tener acceso en Search Console a la propiedad de proactivitis.com y la API
            Web Search Indexing debe estar activada en Google Cloud.
          </p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Enviar URL</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Notificar cambios a Google</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Maximo 10 URLs por envio manual. Puedes pegar URLs completas o rutas internas como /tours/slug.
            </p>
          </div>
          <Link
            href="https://developers.google.com/search/apis/indexing-api/v3/using-api"
            target="_blank"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600 hover:border-slate-400"
          >
            Docs Google
          </Link>
        </div>

        <form action={submitIndexingUrlsAction} className="mt-6 space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr,220px]">
            <textarea
              name="urls"
              rows={8}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 shadow-inner outline-none focus:border-emerald-500"
              placeholder={"https://proactivitis.com/en/tours/tour-en-buggy-por-punta-cana\n/tours/tour-en-buggy-por-punta-cana"}
            />
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="block text-sm font-black text-slate-900">
                <span className="mb-2 block">Tipo</span>
                <select name="type" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm">
                  <option value="URL_UPDATED">URL_UPDATED</option>
                  <option value="URL_DELETED">URL_DELETED</option>
                </select>
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
              >
                Enviar a Google
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr,0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Consultar</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Estado de una URL</h2>
          <form action={checkIndexingMetadataAction} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              name="url"
              className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              placeholder="https://proactivitis.com/tours/..."
            />
            <button className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white hover:bg-sky-700">
              Consultar
            </button>
          </form>
        </article>

        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">Uso correcto</p>
          <h2 className="mt-2 text-xl font-black text-amber-950">No es una garantia de indexacion</h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Google indica que esta API esta pensada para paginas con JobPosting o BroadcastEvent. Para tours y transfers
            puede recibir la solicitud, pero la indexacion real sigue dependiendo de sitemap, enlaces internos, calidad y
            rastreo normal.
          </p>
        </article>
      </section>
    </div>
  );
}
