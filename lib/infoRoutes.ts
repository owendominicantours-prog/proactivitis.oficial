import { infoPages, type InfoPage } from "@/lib/infoPages";

const SUPPORTED_LOCALES = new Set(["en", "fr"]);

export function normalizeInfoSlug(slugSegments: string[] = []) {
  if (!slugSegments.length) return [];
  const first = slugSegments[0];
  if (SUPPORTED_LOCALES.has(first)) {
    return slugSegments.slice(1);
  }
  return slugSegments;
}

export function findInfoPage(slugSegments: string[] = []): InfoPage | undefined {
  const normalizedSegments = normalizeInfoSlug(slugSegments);
  const path = "/" + normalizedSegments.filter(Boolean).join("/");
  return infoPages.find((page) => page.path === path);
}
