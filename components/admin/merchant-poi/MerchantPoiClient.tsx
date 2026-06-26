"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, MapPin, RefreshCw, Save, Search, Trash2 } from "lucide-react";

import { DynamicImage } from "@/components/shared/DynamicImage";
import type { TourPoiAdminRow, TourPoiRecord } from "@/lib/tourPoi";

type MerchantPoiClientProps = {
  rows: TourPoiAdminRow[];
  readyCount: number;
  eligibleCount: number;
  feedUrl: string;
};

type PoiDraft = {
  googlePlaceId: string;
  placeName: string;
  latitude: string;
  longitude: string;
  notes: string;
};

type SaveState = {
  id: string;
  status: "saving" | "saved" | "error";
  message?: string;
};

const filters = [
  { key: "missing", label: "Pendientes" },
  { key: "ready", label: "Listos" },
  { key: "all", label: "Todos" }
] as const;

type FilterKey = (typeof filters)[number]["key"];

const emptyDraft: PoiDraft = {
  googlePlaceId: "",
  placeName: "",
  latitude: "",
  longitude: "",
  notes: ""
};

const draftFromPoi = (poi: TourPoiRecord | null): PoiDraft => ({
  googlePlaceId: poi?.googlePlaceId ?? "",
  placeName: poi?.placeName ?? "",
  latitude: typeof poi?.latitude === "number" ? String(poi.latitude) : "",
  longitude: typeof poi?.longitude === "number" ? String(poi.longitude) : "",
  notes: poi?.notes ?? ""
});

const createDrafts = (rows: TourPoiAdminRow[]) =>
  rows.reduce<Record<string, PoiDraft>>((drafts, row) => {
    drafts[row.id] = draftFromPoi(row.poi);
    return drafts;
  }, {});

export function MerchantPoiClient({ rows, feedUrl }: MerchantPoiClientProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("missing");
  const [drafts, setDrafts] = useState<Record<string, PoiDraft>>(() => createDrafts(rows));
  const [savedPoi, setSavedPoi] = useState<Record<string, TourPoiRecord | null>>({});
  const [saveState, setSaveState] = useState<SaveState | null>(null);

  const currentRows = useMemo(
    () =>
      rows.map((row) => {
        const poi = (Object.prototype.hasOwnProperty.call(savedPoi, row.id) ? savedPoi[row.id] : row.poi) ?? null;
        return {
          ...row,
          poi,
          poiReady: Boolean(poi?.googlePlaceId)
        };
    }),
    [rows, savedPoi]
  );
  const currentEligibleCount = currentRows.filter((row) => row.eligible).length;
  const currentReadyCount = currentRows.filter((row) => row.eligible && row.poiReady).length;

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return currentRows
      .filter((row) => {
        if (filter === "ready") return row.poiReady;
        if (filter === "missing") return row.eligible && !row.poiReady;
        return true;
      })
      .filter((row) => {
        if (!normalizedQuery) return true;
        const draft = drafts[row.id] ?? emptyDraft;
        return [row.title, row.offerId, row.location, row.category, draft.googlePlaceId, draft.placeName]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      });
  }, [currentRows, drafts, filter, query]);

  const updateDraft = (tourId: string, field: keyof PoiDraft, value: string) => {
    setDrafts((current) => ({
      ...current,
      [tourId]: {
        ...(current[tourId] ?? emptyDraft),
        [field]: value
      }
    }));
  };

  const savePoi = async (row: TourPoiAdminRow, clear = false) => {
    const draft = clear ? emptyDraft : drafts[row.id] ?? emptyDraft;
    setSaveState({ id: row.id, status: "saving" });

    try {
      const response = await fetch("/api/admin/merchant-poi", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tourId: row.id,
          googlePlaceId: draft.googlePlaceId,
          placeName: draft.placeName,
          latitude: draft.latitude,
          longitude: draft.longitude,
          notes: draft.notes
        })
      });
      const data = (await response.json()) as { poi?: TourPoiRecord | null; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar.");
      }

      setSavedPoi((current) => ({ ...current, [row.id]: data.poi ?? null }));
      setDrafts((current) => ({ ...current, [row.id]: draftFromPoi(data.poi ?? null) }));
      setSaveState({ id: row.id, status: "saved", message: clear ? "POI borrado" : "Guardado" });
    } catch (error) {
      setSaveState({
        id: row.id,
        status: "error",
        message: error instanceof Error ? error.message : "No se pudo guardar."
      });
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Tours elegibles" value={currentEligibleCount} />
        <Metric label="Con Place ID" value={currentReadyCount} />
        <Metric label="Pendientes" value={Math.max(currentEligibleCount - currentReadyCount, 0)} />
        <Metric label="En pantalla" value={visibleRows.length} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Feed JSON</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Tours para Google</h2>
            <p className="mt-2 break-all text-sm font-semibold text-slate-600">{feedUrl}</p>
          </div>
          <a
            href="/merchant-center/tours.json"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir feed
          </a>
        </div>
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

          <label className="flex min-w-[260px] items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
            <Search className="mr-2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar tour o Place ID"
              className="w-full bg-transparent text-sm text-slate-800 outline-none"
            />
          </label>
        </div>

        <div className="mt-5 space-y-3">
          {visibleRows.map((row) => {
            const draft = drafts[row.id] ?? emptyDraft;
            const status = saveState?.id === row.id ? saveState : null;
            const mapsQuery = encodeURIComponent(`${row.title} ${row.location}`);

            return (
              <article key={row.id} className="rounded-xl border border-slate-200 p-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_minmax(360px,1.25fr)] xl:items-start">
                  <div className="flex min-w-0 gap-3">
                    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <DynamicImage src={row.imageLink} alt={row.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {row.poiReady ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Listo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                            <AlertTriangle className="h-3 w-3" />
                            Pendiente
                          </span>
                        )}
                        {!row.eligible ? (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
                            Revisar producto
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 truncate text-base font-black text-slate-950">{row.title}</h3>
                      <p className="mt-1 truncate text-sm text-slate-500">{row.location}</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {row.currencyCode} {row.price.toFixed(2)}
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900"
                      >
                        <MapPin className="h-4 w-4" />
                        Buscar en Maps
                      </a>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Field
                      label="Google Place ID"
                      value={draft.googlePlaceId}
                      onChange={(value) => updateDraft(row.id, "googlePlaceId", value)}
                      placeholder="ChIJ..."
                    />
                    <Field
                      label="Nombre del lugar"
                      value={draft.placeName}
                      onChange={(value) => updateDraft(row.id, "placeName", value)}
                      placeholder={row.location || row.title}
                    />
                    <Field
                      label="Latitud"
                      value={draft.latitude}
                      onChange={(value) => updateDraft(row.id, "latitude", value)}
                      placeholder="18.735693"
                    />
                    <Field
                      label="Longitud"
                      value={draft.longitude}
                      onChange={(value) => updateDraft(row.id, "longitude", value)}
                      placeholder="-70.162651"
                    />
                    <div className="md:col-span-2">
                      <Field
                        label="Notas internas"
                        value={draft.notes}
                        onChange={(value) => updateDraft(row.id, "notes", value)}
                        placeholder="Punto de salida, muelle, hotel o zona"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                      <button
                        type="button"
                        onClick={() => savePoi(row)}
                        disabled={status?.status === "saving"}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {status?.status === "saving" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => savePoi(row, true)}
                        disabled={status?.status === "saving" || !row.poiReady}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Borrar
                      </button>
                      {status?.message ? (
                        <span
                          className={`text-sm font-semibold ${
                            status.status === "error" ? "text-rose-700" : "text-emerald-700"
                          }`}
                        >
                          {status.message}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {!visibleRows.length ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No hay tours para este filtro.
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

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      />
    </label>
  );
}
