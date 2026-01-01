"use client";

import { useEffect, useState } from "react";

const LOCALES = [
  { label: "English", value: "en" },
  { label: "Français", value: "fr" }
] as const;

type Locale = (typeof LOCALES)[number]["value"];

type PreviewData = {
  title?: string | null;
  subtitle?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  highlights: string[];
  includesList: string[];
  notIncludedList: string[];
  itineraryStops: string[];
  locale: Locale;
};

type Props = {
  tourId?: string;
  refreshKey: number;
};

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
    Las traducciones aparecerán aquí después de que guardes y aceptes los términos del tour.
  </div>
);

const SectionItem = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{title}</p>
    <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm">
      {children}
    </div>
  </div>
);

export function TranslationPreview({ tourId, refreshKey }: Props) {
  const [locale, setLocale] = useState<Locale>("en");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTranslation = async () => {
    if (!tourId) {
      setPreview(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/translation/preview/${tourId}?locale=${locale}`);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setPreview(null);
        setError(data?.message ?? "Todavía no se ha generado la traducción.");
        return;
      }
      const data: PreviewData = await response.json();
      setPreview(data);
    } catch (err) {
      setError("No se pudo obtener la traducción. Intenta nuevamente.");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId, locale, refreshKey]);

  const renderList = (items: string[]) =>
    items.length ? (
      <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-slate-500 italic">No hay datos traducidos todavía.</p>
    );

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Vista previa de traducción</h3>
          <p className="text-xs text-slate-500">Verifica cómo quedará el tour en inglés o francés.</p>
        </div>
        <div className="flex gap-2">
          {LOCALES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLocale(option.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                locale === option.value
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {loading && <p className="text-xs text-slate-500">Cargando traducción…</p>}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>
        )}
        {!loading && !preview && !error && <EmptyState />}
        {preview && (
          <>
            <SectionItem title="Título">
              <p className="text-sm font-semibold text-slate-900">{preview.title ?? "Sin título"}</p>
            </SectionItem>
            <SectionItem title="Descripción corta">
              <p className="text-sm text-slate-700">{preview.shortDescription ?? "Sin descripción"}</p>
            </SectionItem>
            <SectionItem title="Includes">
              {renderList(preview.includesList)}
            </SectionItem>
            <SectionItem title="Excludes">
              {renderList(preview.notIncludedList)}
            </SectionItem>
            <SectionItem title="Highlights">
              {renderList(preview.highlights)}
            </SectionItem>
          </>
        )}
      </div>
    </section>
  );
}
