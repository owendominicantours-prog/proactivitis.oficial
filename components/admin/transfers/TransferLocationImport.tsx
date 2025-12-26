"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type ZoneOption = {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
};

type Failure = {
  row: number;
  slug?: string;
  reason: string;
};

type PreviewEntry = {
  slug: string;
  count: number;
  matchedZone?: ZoneOption;
};

type ImportResult = {
  createdCount: number;
  updatedCount: number;
  failures: Failure[];
};

export default function TransferLocationImport({ zones }: { zones: ZoneOption[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [fallbackZoneId, setFallbackZoneId] = useState("");
  const [preview, setPreview] = useState<{
    entries: PreviewEntry[];
    missingZoneSlugRows: number;
    headerHasZoneSlug: boolean;
    totalRows: number;
  }>({
    entries: [],
    missingZoneSlugRows: 0,
    headerHasZoneSlug: true,
    totalRows: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const zonesBySlug = useMemo(() => {
    const map = new Map<string, ZoneOption>();
    zones.forEach((zone) => map.set(zone.slug.toLowerCase(), zone));
    return map;
  }, [zones]);

  const requiresFallbackZone = preview.missingZoneSlugRows > 0 || !preview.headerHasZoneSlug;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setResult(null);
    setError(null);

    if (!selectedFile) {
      setPreview((prev) => ({ ...prev, entries: [], missingZoneSlugRows: 0, headerHasZoneSlug: true, totalRows: 0 }));
      return;
    }

    const text = await selectedFile.text();
    const rows = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (rows.length <= 1) {
      setPreview((prev) => ({ ...prev, entries: [], missingZoneSlugRows: 0, headerHasZoneSlug: true, totalRows: 0 }));
      return;
    }

    const headers = rows[0].split(",").map((value) => value.trim().toLowerCase());
    const zoneSlugIndex = headers.indexOf("zoneslug");
    const missingZoneSlugRows = [];
    const slugCounts = new Map<string, number>();

    for (const row of rows.slice(1)) {
      const cells = row.split(",").map((cell) => cell.trim());
      if (zoneSlugIndex === -1) {
        missingZoneSlugRows.push(row);
        continue;
      }
      const zoneSlugValue = cells[zoneSlugIndex]?.trim().toLowerCase();
      if (!zoneSlugValue) {
        missingZoneSlugRows.push(row);
        continue;
      }
      slugCounts.set(zoneSlugValue, (slugCounts.get(zoneSlugValue) ?? 0) + 1);
    }

    const entries: PreviewEntry[] = Array.from(slugCounts.entries()).map(([slug, count]) => ({
      slug,
      count,
      matchedZone: zonesBySlug.get(slug)
    }));

    entries.sort((a, b) => b.count - a.count);

    setPreview({
      entries,
      missingZoneSlugRows: missingZoneSlugRows.length,
      headerHasZoneSlug: zoneSlugIndex !== -1,
      totalRows: rows.length - 1
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Selecciona un archivo CSV.");
      return;
    }
    if (requiresFallbackZone && !fallbackZoneId) {
      setError("Selecciona una zona por defecto para las filas sin zoneSlug.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("csvFile", file);
      if (fallbackZoneId) {
        formData.append("zoneId", fallbackZoneId);
      }

      const response = await fetch("/api/admin/transfers/import-locations", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo importar el archivo.");
      }

      const payload: ImportResult = await response.json();
      setResult(payload);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-dashed border-slate-200 p-4">
      <h3 className="text-lg font-semibold text-slate-900">Importar CSV de hotels/aeropuertos</h3>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-3">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700 md:col-span-2">
            Archivo CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
              required
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Zona por defecto
            <select
              name="zoneId"
              value={fallbackZoneId}
              onChange={(event) => setFallbackZoneId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
              required={requiresFallbackZone}
            >
              <option value="">Selecciona zona (solo si falta zoneSlug)</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} ({zone.countryCode})
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-slate-500">
          El CSV debe tener cabeceras: <code>name</code>, <code>slug</code>, <code>type</code> y puede incluir{" "}
          <code>zoneSlug</code>, <code>description</code>, <code>address</code>.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Importando..." : "Importar CSV"}
        </button>
      </form>

      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
        <p>
          Filas detectadas: <strong>{preview.totalRows}</strong>
        </p>
        {preview.entries.length ? (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">ZoneSlug encontrados</p>
            <ul className="mt-2 space-y-1 text-xs">
              {preview.entries.map((entry) => (
                <li key={entry.slug} className="flex items-center justify-between">
                  <span>
                    {entry.slug} · {entry.count} fila{entry.count > 1 ? "s" : ""}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {entry.matchedZone ? entry.matchedZone.name : "Zona no encontrada"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {!preview.headerHasZoneSlug && (
          <p className="text-xs text-rose-600">
            El CSV no incluye <code>zoneSlug</code>; se requiere elegir una zona por defecto.
          </p>
        )}
        {preview.missingZoneSlugRows > 0 && (
          <p className="text-xs text-amber-600">
            {preview.missingZoneSlugRows} fila{preview.missingZoneSlugRows > 1 ? "s" : ""} no contiene zona; se usará la zona por
            defecto seleccionada.
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      )}

      {result && (
        <div className="space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-slate-700">
          <p>
            Filas importadas: <strong>{result.createdCount + result.updatedCount}</strong> (
            {result.createdCount} creadas, {result.updatedCount} actualizadas)
          </p>
          {result.failures.length ? (
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-slate-900">Filas con errores</p>
              <ul className="space-y-1">
                {result.failures.map((failure) => (
                  <li key={`${failure.row}-${failure.reason}`} className="rounded-lg bg-white/70 p-2 shadow-sm">
                    <p className="font-semibold text-slate-900">
                      Fila #{failure.row} {failure.slug ? `(${failure.slug})` : ""}
                    </p>
                    <p className="text-rose-600">{failure.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No hubo errores en el archivo.</p>
          )}
        </div>
      )}
    </section>
  );
}
