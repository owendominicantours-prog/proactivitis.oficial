import Link from "next/link";
import { importKeywordPlannerCsvAction, updateKeywordPlannerStatusAction } from "../actions";
import {
  getKeywordPlannerStore,
  getKeywordPlannerSummary,
  type KeywordPlannerConnectedType,
  type KeywordPlannerIntent,
  type KeywordPlannerPriority,
  type KeywordPlannerRecord,
  type KeywordPlannerStatus
} from "@/lib/keywordPlanner";

export const maxDuration = 120;

type SearchParams = {
  query?: string;
  status?: KeywordPlannerStatus | "all";
  priority?: KeywordPlannerPriority | "all";
  intent?: KeywordPlannerIntent | "all";
  type?: KeywordPlannerConnectedType | "all";
  sort?: "priority" | "volume" | "bid" | "updated";
  page?: string;
};

type KeywordPlannerAdminPageProps = {
  searchParams?: Promise<SearchParams>;
};

const PAGE_SIZE = 40;

const numberFormatter = new Intl.NumberFormat("es-DO");
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const priorityStyles: Record<KeywordPlannerPriority, string> = {
  high: "border-emerald-200 bg-emerald-50 text-emerald-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-slate-200 bg-slate-50 text-slate-700"
};

const priorityLabels: Record<KeywordPlannerPriority, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja"
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

const intentLabels: Record<KeywordPlannerIntent, string> = {
  transfer: "Transfer",
  rent_car: "Rent car",
  tour: "Tour",
  taxi: "Taxi",
  island: "Isla / playa",
  buggy_atv: "Buggy / ATV",
  catamaran: "Catamaran",
  competitor: "Competidor",
  informational: "Informativa",
  other: "Otra"
};

const typeLabels: Record<KeywordPlannerConnectedType, string> = {
  transfer: "Transfer",
  rent_car: "Rent car",
  tour: "Tour",
  content: "Contenido",
  review: "Competidor"
};

const actionStatuses: KeywordPlannerStatus[] = ["pending", "in_process", "draft_created", "published", "ignored"];
const priorityWeight: Record<KeywordPlannerPriority, number> = { high: 0, medium: 1, low: 2 };

const formatBid = (value?: number | null) => (typeof value === "number" ? moneyFormatter.format(value) : "-");

const getParamValue = <T extends string>(value: T | "all" | undefined, allowed: readonly T[]) =>
  value && value !== "all" && allowed.includes(value as T) ? (value as T) : undefined;

const buildPageHref = (params: SearchParams, page: number) => {
  const query = new URLSearchParams();
  if (params.query) query.set("query", params.query);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.priority && params.priority !== "all") query.set("priority", params.priority);
  if (params.intent && params.intent !== "all") query.set("intent", params.intent);
  if (params.type && params.type !== "all") query.set("type", params.type);
  if (params.sort && params.sort !== "priority") query.set("sort", params.sort);
  query.set("page", String(page));
  return `/admin/landings/keyword-planner?${query.toString()}`;
};

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

export default async function KeywordPlannerAdminPage({ searchParams }: KeywordPlannerAdminPageProps) {
  const params = searchParams ? await searchParams : {};
  const [summary, store] = await Promise.all([getKeywordPlannerSummary(), getKeywordPlannerStore()]);

  const latestBatches = store.batches.slice(0, 8);
  const transferKeywords = store.keywords.filter((keyword) => keyword.connectedType === "transfer").slice(0, 10);
  const rentCarKeywords = store.keywords.filter((keyword) => keyword.connectedType === "rent_car").slice(0, 10);
  const tourKeywords = store.keywords.filter((keyword) => keyword.connectedType === "tour").slice(0, 10);
  const selectedStatus = getParamValue(params.status, Object.keys(statusLabels) as KeywordPlannerStatus[]);
  const selectedPriority = getParamValue(params.priority, Object.keys(priorityLabels) as KeywordPlannerPriority[]);
  const selectedIntent = getParamValue(params.intent, Object.keys(intentLabels) as KeywordPlannerIntent[]);
  const selectedType = getParamValue(params.type, Object.keys(typeLabels) as KeywordPlannerConnectedType[]);
  const normalizedQuery = (params.query ?? "").trim().toLowerCase();
  const sortMode = params.sort ?? "priority";

  const classifiedCounts: Record<KeywordPlannerConnectedType, number> = {
    transfer: store.keywords.filter((keyword) => keyword.connectedType === "transfer").length,
    rent_car: store.keywords.filter((keyword) => keyword.connectedType === "rent_car").length,
    tour: store.keywords.filter((keyword) => keyword.connectedType === "tour").length,
    content: store.keywords.filter((keyword) => keyword.connectedType === "content").length,
    review: store.keywords.filter((keyword) => keyword.connectedType === "review").length
  };
  const statusCounts = (Object.keys(statusLabels) as KeywordPlannerStatus[]).reduce(
    (acc, status) => ({
      ...acc,
      [status]: store.keywords.filter((keyword) => keyword.status === status).length
    }),
    {} as Record<KeywordPlannerStatus, number>
  );

  const filteredKeywords = store.keywords
    .filter((keyword) => (selectedStatus ? keyword.status === selectedStatus : true))
    .filter((keyword) => (selectedPriority ? keyword.priority === selectedPriority : true))
    .filter((keyword) => (selectedIntent ? keyword.intent === selectedIntent : true))
    .filter((keyword) => (selectedType ? keyword.connectedType === selectedType : true))
    .filter((keyword) =>
      normalizedQuery
        ? keyword.keyword.toLowerCase().includes(normalizedQuery) ||
          keyword.suggestedAction.toLowerCase().includes(normalizedQuery)
        : true
    )
    .sort((a, b) => {
      if (sortMode === "volume") return b.avgMonthlySearches - a.avgMonthlySearches;
      if (sortMode === "bid") return (b.topBidHigh ?? 0) - (a.topBidHigh ?? 0);
      if (sortMode === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
      return priorityDiff !== 0 ? priorityDiff : b.avgMonthlySearches - a.avgMonthlySearches;
    });

  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const totalPages = Math.max(1, Math.ceil(filteredKeywords.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginatedKeywords = filteredKeywords.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-8 pb-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-700">Keyword Planner</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Banco de busquedas para SEO</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Sube CSVs de Google Keyword Planner todas las veces que quieras. El sistema deduplica keywords,
              actualiza volumen/CPC/competencia y deja una cola clara para landings de rent car, tours, transfer y contenido.
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
            <p>Rent car: landing por vehiculo, zona, precio diario y reserva.</p>
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
          <div className="mt-5 grid gap-4 md:grid-cols-3">
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
                        {numberFormatter.format(keyword.avgMonthlySearches)} busquedas - {formatBid(keyword.topBidHigh)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-black text-slate-950">Rent car para generar</p>
              <div className="mt-3 space-y-2">
                {rentCarKeywords.length === 0 ? (
                  <p className="text-sm text-slate-500">Aun no hay keywords de rent car.</p>
                ) : (
                  rentCarKeywords.map((keyword) => (
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
            Pagina {safePage} de {totalPages} · {numberFormatter.format(filteredKeywords.length)} resultados filtrados.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {(Object.keys(typeLabels) as KeywordPlannerConnectedType[]).map((type) => (
            <Link
              key={type}
              href={buildPageHref({ ...params, type }, 1)}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{typeLabels[type]}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{numberFormatter.format(classifiedCounts[type])}</p>
            </Link>
          ))}
        </div>

        <form className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-6">
          <label className="md:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Buscar</span>
            <input
              name="query"
              defaultValue={params.query ?? ""}
              placeholder="hotel, tour, transfer..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Estado</span>
            <select
              name="status"
              defaultValue={params.status ?? "all"}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              {(Object.keys(statusLabels) as KeywordPlannerStatus[]).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]} ({statusCounts[status]})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Prioridad</span>
            <select
              name="priority"
              defaultValue={params.priority ?? "all"}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              {(Object.keys(priorityLabels) as KeywordPlannerPriority[]).map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Intencion</span>
            <select
              name="intent"
              defaultValue={params.intent ?? "all"}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              {(Object.keys(intentLabels) as KeywordPlannerIntent[]).map((intent) => (
                <option key={intent} value={intent}>
                  {intentLabels[intent]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Orden</span>
            <select
              name="sort"
              defaultValue={params.sort ?? "priority"}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="priority">Prioridad</option>
              <option value="volume">Volumen</option>
              <option value="bid">CPC alto</option>
              <option value="updated">Actualizadas</option>
            </select>
          </label>
          <input type="hidden" name="page" value="1" />
          <div className="flex items-end gap-2 md:col-span-6">
            <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-slate-800">
              Filtrar
            </button>
            <Link
              href="/admin/landings/keyword-planner"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              Limpiar
            </Link>
          </div>
        </form>

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
            {paginatedKeywords.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No hay keywords con esos filtros.</div>
            ) : (
              paginatedKeywords.map((keyword) => (
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
                    {priorityLabels[keyword.priority]}
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

        {totalPages > 1 ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={buildPageHref(params, Math.max(1, safePage - 1))}
              className={`rounded-xl border border-slate-200 px-4 py-2 text-sm font-black ${
                safePage <= 1 ? "pointer-events-none text-slate-300" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Anterior
            </Link>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: Math.min(7, totalPages) }, (_, index) => {
                const page =
                  totalPages <= 7 ? index + 1 : Math.min(Math.max(1, safePage - 3), totalPages - 6) + index;
                return (
                  <Link
                    key={page}
                    href={buildPageHref(params, page)}
                    className={`rounded-xl px-3 py-2 text-sm font-black ${
                      page === safePage
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>
            <Link
              href={buildPageHref(params, Math.min(totalPages, safePage + 1))}
              className={`rounded-xl border border-slate-200 px-4 py-2 text-sm font-black ${
                safePage >= totalPages ? "pointer-events-none text-slate-300" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Siguiente
            </Link>
          </div>
        ) : null}
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
