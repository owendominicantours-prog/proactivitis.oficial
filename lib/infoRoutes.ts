import { infoPages } from "@/lib/infoPages";

export type InfoLocale = "es" | "en" | "fr";

const SUPPORTED_LOCALES = new Set<InfoLocale>(["en", "fr"]);

type ParsedInfoSlug = {
  locale: InfoLocale;
  normalizedSegments: string[];
};

export function parseInfoSlug(slugSegments: string[] = []): ParsedInfoSlug {
  const segments = slugSegments.filter(Boolean);
  if (!segments.length) {
    return { locale: "es", normalizedSegments: [] };
  }
  const [first, ...rest] = segments;
  if (SUPPORTED_LOCALES.has(first as InfoLocale)) {
    return { locale: first as InfoLocale, normalizedSegments: rest };
  }
  return { locale: "es", normalizedSegments: segments };
}

export function buildInfoPath(slugSegments: string[] = []) {
  const normalized = slugSegments.filter(Boolean);
  return normalized.length ? `/${normalized.join("/")}` : "/";
}

export function findInfoPage(slugSegments: string[] = []) {
  const path = buildInfoPath(slugSegments);
  return infoPages.find((page) => page.path === path);
}

export function resolveInfoSlug(slugSegments: string[] = []) {
  return parseInfoSlug(slugSegments);
}
