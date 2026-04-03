import Link from "next/link";
import { format } from "date-fns";
import { getSearchConsoleOverview } from "@/lib/googleSearchConsole";

export const dynamic = "force-dynamic";

const formatNumber = (value: number) => value.toLocaleString("en-US");
const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
const formatPosition = (value: number) => value.toFixed(1);

function formatPropertyLabel(siteUrl: string | null) {
  if (!siteUrl) return "No configurada";
  return siteUrl.replace(/^sc-domain:/, "");
}

export default async function AdminSeoPage() {
  const overview = await getSearchConsoleOverview(28);

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">SEO</p>
        <h1 className="text-3xl font-semibold text-slate-900">Search Console</h1>
        <p className="text-sm text-slate-600">
          Lectura directa desde Google. Sin guardar datos masivos en Neon y sin llenar la base de ruido.
        </p>
        <div className="pt-2">
          <Link
            href="/admin/seo/schema"
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Abrir Schema Manager
          </Link>
        </div>
      </header>

      {!overview.configured ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Configuración pendiente</p>
          <h2 className="mt-2 text-xl font-semibold text-amber-950">Falta conectar Search Console</h2>
          <p className="mt-2 max-w-3xl text-sm text-amber-900">
            Agrega estas variables en Vercel o en tu entorno local y da acceso de propietario o usuario completo del
            property al service account.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              "GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL",
              "GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY",
              "GOOGLE_SEARCH_CONSOLE_SITE_URL"
            ].map((item) => (
              <div key={item} className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-slate-900">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link
              href="https://search.google.com/search-console"
              target="_blank"
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 font-semibold text-white"
            >
              Abrir Search Console
            </Link>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-600">
              Property sugerida: <span className="ml-2 font-semibold text-slate-900">sc-domain:proactivitis.com</span>
            </span>
          </div>
        </section>
      ) : null}

      {overview.error ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-700">Error</p>
          <h2 className="mt-2 text-xl font-semibold text-rose-950">Google respondió con un problema</h2>
          <p className="mt-2 text-sm text-rose-900">{overview.error}</p>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Property</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{formatPropertyLabel(overview.siteUrl)}</p>
          <p className="mt-2 text-sm text-slate-500">
            {format(new Date(overview.startDate), "dd/MM/yyyy")} - {format(new Date(overview.endDate), "dd/MM/yyyy")}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Clicks</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{formatNumber(overview.summary?.clicks ?? 0)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Impresiones</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{formatNumber(overview.summary?.impressions ?? 0)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">CTR / posición</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatPercent(overview.summary?.ctr ?? 0)} <span className="text-slate-400">·</span>{" "}
            {formatPosition(overview.summary?.position ?? 0)}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Secciones con más peso</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Top 250 URLs</span>
          </div>
          <div className="mt-4 space-y-3">
            {overview.sections.length ? (
              overview.sections.slice(0, 8).map((row) => (
                <div key={row.label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{row.label}</p>
                    <p className="text-sm text-slate-500">{formatPercent(row.ctr)}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatNumber(row.impressions)} impresiones · {formatNumber(row.clicks)} clicks · pos.{" "}
                    {formatPosition(row.position)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Cuando Google responda, aquí verás el peso por tipo de página.</p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Quick wins</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">CTR bajo + posición viva</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.25em] text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Página</th>
                  <th className="pb-3 pr-4">Impresiones</th>
                  <th className="pb-3 pr-4">Clicks</th>
                  <th className="pb-3 pr-4">CTR</th>
                  <th className="pb-3">Posición</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview.opportunities.length ? (
                  overview.opportunities.map((row) => (
                    <tr key={row.page}>
                      <td className="py-3 pr-4 font-medium text-slate-900">{row.path}</td>
                      <td className="py-3 pr-4 text-slate-600">{formatNumber(row.impressions)}</td>
                      <td className="py-3 pr-4 text-slate-600">{formatNumber(row.clicks)}</td>
                      <td className="py-3 pr-4 text-slate-600">{formatPercent(row.ctr)}</td>
                      <td className="py-3 text-slate-600">{formatPosition(row.position)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No hay oportunidades claras todavía o Google no devolvió suficientes páginas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Top páginas</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.25em] text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Página</th>
                  <th className="pb-3 pr-4">Clicks</th>
                  <th className="pb-3 pr-4">CTR</th>
                  <th className="pb-3">Posición</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview.topPages.length ? (
                  overview.topPages.map((row) => (
                    <tr key={row.page}>
                      <td className="py-3 pr-4 font-medium text-slate-900">{row.path}</td>
                      <td className="py-3 pr-4 text-slate-600">{formatNumber(row.clicks)}</td>
                      <td className="py-3 pr-4 text-slate-600">{formatPercent(row.ctr)}</td>
                      <td className="py-3 text-slate-600">{formatPosition(row.position)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Sin datos todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Top queries</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.25em] text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Query</th>
                  <th className="pb-3 pr-4">Clicks</th>
                  <th className="pb-3 pr-4">CTR</th>
                  <th className="pb-3">Posición</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview.topQueries.length ? (
                  overview.topQueries.map((row) => (
                    <tr key={row.query}>
                      <td className="py-3 pr-4 font-medium text-slate-900">{row.query}</td>
                      <td className="py-3 pr-4 text-slate-600">{formatNumber(row.clicks)}</td>
                      <td className="py-3 pr-4 text-slate-600">{formatPercent(row.ctr)}</td>
                      <td className="py-3 text-slate-600">{formatPosition(row.position)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Sin datos todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
