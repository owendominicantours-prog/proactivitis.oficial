import { TourVariant } from "@prisma/client";
import { saveTourVariant } from "@/app/(dashboard)/admin/tour-variants/actions";

type Props = {
  variant?: TourVariant | null;
};

const parseLocaleValue = (value: unknown, locale: string) => {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  return typeof record[locale] === "string" ? (record[locale] as string) : "";
};

const parseLocaleArray = (value: unknown, locale: string) => {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  const entry = record[locale];
  return Array.isArray(entry) ? entry.join("\n") : "";
};

const parseLocaleFaqs = (value: unknown, locale: string) => {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  const entry = record[locale];
  if (!Array.isArray(entry)) return "";
  return entry
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const faq = item as Record<string, string>;
      if (!faq.q || !faq.a) return "";
      return `${faq.q} | ${faq.a}`;
    })
    .filter(Boolean)
    .join("\n");
};

export default function TourVariantForm({ variant }: Props) {
  return (
    <form action={saveTourVariant} className="space-y-8">
      <input type="hidden" name="id" value={variant?.id ?? ""} />
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm text-slate-600">
          Slug
          <input
            name="slug"
            defaultValue={variant?.slug ?? ""}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="text-sm text-slate-600">
          Tipo
          <select
            name="type"
            defaultValue={variant?.type ?? "party-boat"}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          >
            <option value="party-boat">Party Boat</option>
            <option value="santo-domingo">Santo Domingo</option>
            <option value="buggy-atv">Buggy/ATV</option>
            <option value="parasailing">Parasailing</option>
            <option value="samana-whale">Samana Whale</option>
          </select>
        </label>
        <label className="text-sm text-slate-600">
          Tour base (slug)
          <input
            name="tourSlug"
            defaultValue={variant?.tourSlug ?? ""}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm text-slate-600">
          Estado
          <select
            name="status"
            defaultValue={variant?.status ?? "DRAFT"}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          >
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
          </select>
        </label>
      </div>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Contenido por idioma</h2>
        {(["es", "en", "fr"] as const).map((locale) => (
          <div key={locale} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {locale}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                Titulo
                <input
                  name={`titles_${locale}`}
                  defaultValue={parseLocaleValue(variant?.titles, locale)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="text-sm text-slate-600">
                Subtitulo hero
                <input
                  name={`heroSubtitles_${locale}`}
                  defaultValue={parseLocaleValue(variant?.heroSubtitles, locale)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
            </div>
            <label className="mt-4 block text-sm text-slate-600">
              Meta description
              <textarea
                name={`metaDescriptions_${locale}`}
                defaultValue={parseLocaleValue(variant?.metaDescriptions, locale)}
                className="mt-2 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                Body blocks (uno por linea)
                <textarea
                  name={`bodyBlocks_${locale}`}
                  defaultValue={parseLocaleArray(variant?.bodyBlocks, locale)}
                  className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="text-sm text-slate-600">
                CTAs (uno por linea)
                <textarea
                  name={`ctas_${locale}`}
                  defaultValue={parseLocaleArray(variant?.ctas, locale)}
                  className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </label>
            </div>
            <label className="mt-4 block text-sm text-slate-600">
              FAQs (formato: Pregunta | Respuesta)
              <textarea
                name={`faqs_${locale}`}
                defaultValue={parseLocaleFaqs(variant?.faqs, locale)}
                className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </div>
        ))}
      </section>

      <button
        type="submit"
        className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white"
      >
        Guardar variante
      </button>
    </form>
  );
}
