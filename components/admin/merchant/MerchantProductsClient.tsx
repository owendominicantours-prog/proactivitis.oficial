"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Eye, RefreshCw, Search, Send, Square, SquareCheck } from "lucide-react";

import { DynamicImage } from "@/components/shared/DynamicImage";
import type {
  MerchantConfigStatus,
  MerchantProductSummary,
  MerchantSyncItemResult
} from "@/lib/merchantCenter";

type MerchantProductsClientProps = {
  config: MerchantConfigStatus;
  products: MerchantProductSummary[];
  totalPublished: number;
  totalTours: number;
  eligibleCount: number;
};

type ApiPreviewResponse = {
  mode: "preview";
  products: MerchantProductSummary[];
  skipped: MerchantProductSummary[];
  total: number;
  eligible: number;
};

type ApiSyncResponse = {
  mode: "sync";
  synced: number;
  failed: number;
  skipped: MerchantProductSummary[];
  results: MerchantSyncItemResult[];
};

type ApiErrorResponse = {
  error?: string;
  missing?: string[];
  skipped?: MerchantProductSummary[];
};

type FilterKey = "all" | "eligible" | "warnings";

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "eligible", label: "Listos" },
  { key: "warnings", label: "Alertas" },
  { key: "all", label: "Todos" }
];

export function MerchantProductsClient({
  config,
  products,
  totalPublished,
  totalTours,
  eligibleCount
}: MerchantProductsClientProps) {
  const eligibleIds = useMemo(() => products.filter((product) => product.eligible).map((product) => product.id), [products]);
  const [selectedIds, setSelectedIds] = useState<string[]>(eligibleIds);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("eligible");
  const [loadingMode, setLoadingMode] = useState<"preview" | "sync" | null>(null);
  const [preview, setPreview] = useState<ApiPreviewResponse | null>(null);
  const [syncResult, setSyncResult] = useState<ApiSyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products
      .filter((product) => {
        if (filter === "eligible") return product.eligible;
        if (filter === "warnings") return !product.eligible || product.warnings.length > 0;
        return true;
      })
      .filter((product) => {
        if (!normalizedQuery) return true;
        return [product.title, product.offerId, product.category, product.location, product.supplier]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      });
  }, [filter, products, query]);

  const visibleEligibleIds = filteredProducts.filter((product) => product.eligible).map((product) => product.id);
  const selectedCount = selectedIds.length;
  const canSync = config.ready && selectedCount > 0 && loadingMode == null;
  const canPreview = selectedCount > 0 && loadingMode == null;

  const toggleProduct = (product: MerchantProductSummary) => {
    if (!product.eligible) return;
    setSelectedIds((current) =>
      current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id]
    );
  };

  const selectVisible = () => {
    setSelectedIds((current) => Array.from(new Set([...current, ...visibleEligibleIds])));
  };

  const clearSelection = () => setSelectedIds([]);

  const runRequest = async (mode: "preview" | "sync") => {
    setLoadingMode(mode);
    setError(null);
    if (mode === "preview") setPreview(null);
    if (mode === "sync") setSyncResult(null);

    try {
      const response = await fetch("/api/admin/merchant-products/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, productIds: selectedIds })
      });
      const data = (await response.json()) as ApiPreviewResponse | ApiSyncResponse | ApiErrorResponse;

      if (!response.ok) {
        const apiError = data as ApiErrorResponse;
        const missing = apiError.missing?.length ? ` (${apiError.missing.join(", ")})` : "";
        throw new Error(`${apiError.error ?? "No se pudo completar la solicitud."}${missing}`);
      }

      if (mode === "preview") {
        setPreview(data as ApiPreviewResponse);
      } else {
        setSyncResult(data as ApiSyncResponse);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Error desconocido.");
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Tours totales" value={totalTours} />
        <Metric label="Publicados" value={totalPublished} />
        <Metric label="Listos API" value={eligibleCount} />
        <Metric label="Seleccionados" value={selectedCount} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Merchant API</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Add products using API</h2>
            <p className="mt-2 text-sm text-slate-500">
              {config.ready
                ? `Cuenta ${config.accountId} lista con ${config.authMode}.`
                : "Configuracion incompleta para envio real."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => runRequest("preview")}
              disabled={!canPreview}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMode === "preview" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Preview
            </button>
            <button
              type="button"
              onClick={() => runRequest("sync")}
              disabled={!canSync}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMode === "sync" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar a merchants
            </button>
          </div>
        </div>

        {!config.ready ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-bold">Faltan variables</p>
                <p className="mt-1">{config.missing.join(", ")}</p>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        {syncResult ? <SyncResultPanel result={syncResult} /> : null}
        {preview ? <PreviewPanel preview={preview} /> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.22em] transition ${
                  filter === item.key
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex min-w-[260px] items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
              <Search className="mr-2 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar producto"
                className="w-full bg-transparent text-sm text-slate-800 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={selectVisible}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              Seleccionar
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <div className="grid min-w-[900px] grid-cols-[72px_minmax(280px,1.8fr)_160px_160px_120px_110px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <span>Sync</span>
            <span>Producto</span>
            <span>Categoria</span>
            <span>Destino</span>
            <span>Precio</span>
            <span>Estado</span>
          </div>

          <div className="max-h-[680px] min-w-[900px] divide-y divide-slate-100 overflow-y-auto">
            {filteredProducts.map((product) => {
              const selected = selectedSet.has(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product)}
                  disabled={!product.eligible}
                  className="grid w-full grid-cols-[72px_minmax(280px,1.8fr)_160px_160px_120px_110px] items-center gap-0 px-4 py-4 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-white"
                >
                  <span className="text-slate-700">
                    {selected ? <SquareCheck className="h-5 w-5 text-sky-600" /> : <Square className="h-5 w-5 text-slate-300" />}
                  </span>
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <DynamicImage src={product.imageLink} alt={product.title} className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-950">{product.title}</span>
                      <span className="mt-1 block truncate text-xs text-slate-500">{product.offerId}</span>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sky-700">
                        <ExternalLink className="h-3 w-3" />
                        {product.link.replace(/^https?:\/\//, "")}
                      </span>
                    </span>
                  </span>
                  <span className="truncate px-3 text-sm text-slate-600">{product.category}</span>
                  <span className="truncate px-3 text-sm text-slate-600">{product.location}</span>
                  <span className="px-3 text-sm font-bold text-slate-900">
                    {product.currencyCode} {product.price.toFixed(2)}
                  </span>
                  <span className="px-3">
                    {product.eligible ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Listo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                        <AlertTriangle className="h-3 w-3" />
                        Revisar
                      </span>
                    )}
                    {product.warnings.length ? (
                      <span className="mt-1 block text-xs text-slate-500">{product.warnings.join(" ")}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {!filteredProducts.length ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No hay productos para este filtro.
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value.toLocaleString("es-DO")}</p>
    </article>
  );
}

function SyncResultPanel({ result }: { result: ApiSyncResponse }) {
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-700">
          Enviados {result.synced}
        </span>
        <span className="rounded-full bg-rose-100 px-3 py-1 font-bold text-rose-700">Fallidos {result.failed}</span>
        <span className="rounded-full bg-slate-200 px-3 py-1 font-bold text-slate-700">
          Omitidos {result.skipped.length}
        </span>
      </div>

      <div className="mt-4 max-h-72 divide-y divide-slate-200 overflow-y-auto rounded-lg bg-white">
        {result.results.map((item) => (
          <div key={`${item.id}-${item.offerId}`} className="p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-slate-900">{item.title}</p>
              <span
                className={`rounded-full px-2 py-1 text-xs font-bold ${
                  item.status === "synced" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {item.status === "synced" ? "Synced" : "Failed"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{item.merchantProductName || item.error || item.offerId}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewPanel({ preview }: { preview: ApiPreviewResponse }) {
  const sample = preview.products.slice(0, 5).map((product) => product.input);

  return (
    <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-sky-100 px-3 py-1 font-bold text-sky-700">Preview {preview.eligible}</span>
        <span className="rounded-full bg-slate-200 px-3 py-1 font-bold text-slate-700">
          Omitidos {preview.skipped.length}
        </span>
      </div>
      <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
        {JSON.stringify(sample, null, 2)}
      </pre>
    </div>
  );
}
