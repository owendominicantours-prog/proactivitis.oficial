import Link from "next/link";
import {
  importKeywordPlannerCsvAction,
  updateKeywordPlannerStatusAction
} from "../actions";
import {
  getKeywordPlannerStore,
  getKeywordPlannerSummary,
  listKeywordPlannerOpportunities,
  type KeywordPlannerRecord,
  type KeywordPlannerStatus
} from "@/lib/keywordPlanner";

export const maxDuration = 120;

const numberFormatter = new Intl.NumberFormat("es-DO");
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const priorityStyles = {
  high: "border-emerald-200 bg-emerald-50 text-emerald-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-slate-200 bg-slate-50 text-slate-700"
};

const statusLabels: Record<KeywordPlannerStatus, string> = {
  new: "Nueva",
  pending: "Pendiente",
  in_process: "En proceso",
  draft_created: "Draft creado",
  published: "Publicada",
  duplicate: "Duplicada",
  ignored: "Ignorada"
};

const intentLabels: Record<KeywordPlannerRecord["intent"], string> = {
  transfer: "Transfer",
  tour: "Tour",
  taxi: "Taxi",
  island: "Isla / playa",
  buggy_atv: "Buggy / ATV",
  catamaran: "Catamaran",
  competitor: "Competidor",
  informational: "Informativa",
  other: "Otra"
};

const actionStatuses: KeywordPlannerStatus[] = ["pending", "in_process", "draft_created", "published", "ignored"];

const formatBid = (value?: number | null) => (typeof value === "number" ? moneyFormatter.format(value) : "-");

function StatusAction({
  keyword,
  status,
  label
}: {
  keyword: KeywordPlannerRecord;
  status: KeywordPlannerStatus;
  label: string;
}) {
  return (
    <form action={updateKeywordPlannerStatusAction}>
      <input type="hidden" name="normalizedKeyword" value={keyword.normalizedKeyword} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50">
        {label}
      </button>
    </form>
  );
}

export default async function KeywordPlannerAdminPage() {
  const [summary, store, topKeywords] = await Promise.all([
    getKeywordPlannerSummary(),
    getKeywordPlannerStore(),
    listKeywordPlannerOpportunities({ limit: 120 })
  ]);

  const latestBatches = store.batches.slice(0, 8);
  const transferKeywords = topKeywords.filter((keyword) => keyword.connectedType === "transfer").slice(0, 10);
  const tourKeywords = topKeywords.filter((keyword) => keyword.connectedType === "tour").slice(0, 10);

  return (
    <div className="space-y-8 pb-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-700">Keyword Planner</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Banco de busquedas para SEO</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Sube CSVs de Google Keyword Planner todas las veces que quieras. El sistema deduplica keywords,
              actualiza volumen/CPC/competencia y deja una cola clara para landings de tours, transfer y contenido.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/landings/seo-factory"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Gemini SEO Factory
            </Link>
            <Link
              href="/admin/landings"
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              Volver a Landings
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Keywords</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{numberFormatter.format(summary.total)}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">Alta prioridad</p>
          <p className="mt-2 text-3xl font-black text-emerald-950">{numberFormatter.format(summary.highPriority)}</p>
        </article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-sky-700">Pendientes</p>
          <p className="mt-2 text-3xl font-black text-sky-950">{numberFormatter.format(summary.pending)}</p>
        </article>
        <article className="rounded-2xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-violet-700">Lotes</p>
          <p className="mt-2 text-3xl font-black text-violet-950">{numberFormatter.format(store.batches.length)}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form action={importKeywordPlannerCsvAction} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Importar</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Subir CSVs nuevos</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Puedes subir uno o varios archivos. Si una keyword ya existe, se actualizan sus datos y queda el historial
            del lote nuevo.
          </p>
          <input
            name="keywordCsv"
            type="file"
            accept=".csv,.tsv,text/csv,text/tab-separated-values"
            multiple
            required
            className="mt-5 w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm"
          />
          <button className="mt-5 w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-black text-white hover:bg-emerald-600">
            Importar keywords
          </button>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
            <p className="font-black text-slate-900">Como se marca</p>
            <p>Transfer/taxi: landing con formulario de traslado.</p>
            <p>Tour/isla/buggy/catamaran: landing de producto o categoria.</p>
            <p>Informativa: guia que empuja a reservar.</p>
            <p>Competidor: pagina comparativa o alternativa controlada.</p>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Lectura rapida</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Oportunidades principales</h2>
            </div>
            {summary.lastBatch ? (
              <p className="text-xs font-semibold text-slate-500">
                Ultimo lote: {new Date(summary.lastBatch.importedAt).toLocaleString("es-DO")}
              </p>
            ) : null}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-black text-slate-950">Transfer listos para atacar</p>
              <div className="mt-3 space-y-2">
                {transferKeywords.length === 0 ? (
                  <p className="text-sm text-slate-500">Aun no hay keywords de transfer.</p>
                ) : (
                  transferKeywords.map((keyword) => (
                    <div key={keyword.normalizedKeyword} className="rounded-xl bg-slate-50 p-3">
                      <p className="font-bold text-slate-900">{keyword.keyword}</p>
                      <p className="text-xs text-slate-500">
                        {numberFormatter.format(keyword.avgMonthlySearches)} busquedas · {formatBid(keyword.topBidHigh)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-black text-slate-950">Tours con demanda</p>
              <div className="mt-3 space-y-2">
                {tourKeywords.length === 0 ? (
                  <p className="text-sm text-slate-500">Aun no hay keywords de tours.</p>
                ) : (
                  tourKeywords.map((keyword) => (
                    <div key={keyword.normalizedKeyword} className="rounded-xl bg-slate-50 p-3">
                      <p className="font-bold text-slate-900">{keyword.keyword}</p>
                      <p className="text-xs text-slate-500">
                        {numberFormatter.format(keyword.avgMonthlySearches)} busquedas · {intentLabels[keyword.intent]}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Cola operativa</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Keywords importadas</h2>
          </div>
          <p className="text-sm text-slate-500">
            Mostrando {numberFormatter.format(topKeywords.length)} de {numberFormatter.format(summary.total)}.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[1.6fr_120px_110px_110px_100px_1.4fr] gap-0 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500 max-xl:hidden">
            <span>Keyword</span>
            <span>Intento</span>
            <span>Prioridad</span>
            <span>Estado</span>
            <span>Volumen</span>
            <span>Accion sugerida</span>
          </div>
          <div className="divide-y divide-slate-200">
            {topKeywords.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Sube el primer CSV de Keyword Planner para crear la cola.
              </div>
            ) : (
              topKeywords.map((keyword) => (
                <article
                  key={keyword.normalizedKeyword}
                  className="grid gap-3 px-4 py-4 text-sm xl:grid-cols-[1.6fr_120px_110px_110px_100px_1.4fr] xl:items-start"
                >
                  <div>
                    <p className="font-black text-slate-950">{keyword.keyword}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      CPC alto {formatBid(keyword.topBidHigh)} · Competencia {keyword.competition ?? "-"}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {intentLabels[keyword.intent]}
                  </span>
                  <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${priorityStyles[keyword.priority]}`}>
                    {keyword.priority}
                  </span>
                  <span className="w-fit rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                    {statusLabels[keyword.status]}
                  </span>
                  <span className="font-black text-slate-950">{numberFormatter.format(keyword.avgMonthlySearches)}</span>
                  <div>
                    <p className="text-sm leading-5 text-slate-600">{keyword.suggestedAction}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {actionStatuses
                        .filter((status) => status !== keyword.status)
                        .slice(0, 4)
                        .map((status) => (
                          <StatusAction key={status} keyword={keyword} status={status} label={statusLabels[status]} />
                        ))}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Historial</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Ultimos lotes importados</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {latestBatches.length === 0 ? (
            <p className="text-sm text-slate-500">Sin lotes todavia.</p>
          ) : (
            latestBatches.map((batch) => (
              <article key={batch.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="line-clamp-1 font-black text-slate-950">{batch.fileName}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(batch.importedAt).toLocaleString("es-DO")}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <span className="rounded-xl bg-emerald-50 p-2 font-bold text-emerald-700">+{batch.created}</span>
                  <span className="rounded-xl bg-sky-50 p-2 font-bold text-sky-700">up {batch.updated}</span>
                  <span className="rounded-xl bg-amber-50 p-2 font-bold text-amber-700">dup {batch.duplicates}</span>
                </div>
                {batch.errors.length > 0 ? (
                  <p className="mt-3 line-clamp-2 text-xs text-rose-700">{batch.errors.slice(0, 2).join(" | ")}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
