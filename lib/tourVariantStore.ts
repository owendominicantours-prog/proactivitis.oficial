import type { Locale } from "@/lib/translations";
import type { TourVariantContent, VariantFaq, VariantType } from "@/lib/tourVariantCatalog";
import { prisma } from "@/lib/prisma";

type LocaleMap<T> = Record<Locale, T>;

const LOCALES: Locale[] = ["es", "en", "fr"];

const normalizeLocaleMap = <T>(value: unknown, fallback: T): LocaleMap<T> => {
  const base = (typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {}) || {};
  return LOCALES.reduce((acc, locale) => {
    const entry = base[locale];
    acc[locale] = (entry as T) ?? fallback;
    return acc;
  }, {} as LocaleMap<T>);
};

const normalizeLocaleArrayMap = (value: unknown, fallback: string[]): LocaleMap<string[]> => {
  const base = (typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {}) || {};
  return LOCALES.reduce((acc, locale) => {
    const entry = base[locale];
    acc[locale] = Array.isArray(entry) ? (entry as string[]) : fallback;
    return acc;
  }, {} as LocaleMap<string[]>);
};

const normalizeFaqMap = (value: unknown, fallback: VariantFaq[]): LocaleMap<VariantFaq[]> => {
  const base = (typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {}) || {};
  return LOCALES.reduce((acc, locale) => {
    const entry = base[locale];
    acc[locale] = Array.isArray(entry) ? (entry as VariantFaq[]) : fallback;
    return acc;
  }, {} as LocaleMap<VariantFaq[]>);
};

const DEFAULT_TEXT = {
  es: "",
  en: "",
  fr: ""
};

export const mapDbVariant = (row: {
  slug: string;
  type: string;
  tourSlug: string;
  titles: unknown;
  heroSubtitles: unknown;
  metaDescriptions: unknown;
  bodyBlocks: unknown;
  faqs: unknown;
  ctas: unknown;
}): TourVariantContent => ({
  slug: row.slug,
  type: row.type as VariantType,
  tourSlug: row.tourSlug,
  titles: normalizeLocaleMap(row.titles, DEFAULT_TEXT.es),
  heroSubtitles: normalizeLocaleMap(row.heroSubtitles, DEFAULT_TEXT.es),
  metaDescriptions: normalizeLocaleMap(row.metaDescriptions, DEFAULT_TEXT.es),
  bodyBlocks: normalizeLocaleArrayMap(row.bodyBlocks, []),
  faqs: normalizeFaqMap(row.faqs, []),
  ctas: normalizeLocaleArrayMap(row.ctas, [])
});

export const getPublishedVariantBySlug = async (slug: string) => {
  try {
    const row = await prisma.tourVariant.findFirst({
      where: { slug, status: "PUBLISHED" }
    });
    return row ? mapDbVariant(row) : null;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code &&
      ["P2021", "P2022"].includes((error as { code?: string }).code ?? "")
    ) {
      return null;
    }
    throw error;
  }
};

export const getVariantForEdit = async (id: string) => {
  return prisma.tourVariant.findUnique({ where: { id } });
};
