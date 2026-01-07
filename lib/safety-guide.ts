import type { Locale } from "@/lib/translations";

export const SAFETY_GUIDE_BASE_PATH = "excursiones-seguras-punta-cana";
export const SAFETY_GUIDE_SLUG_SUFFIX = "-protocolos-seguridad";
export const SAFETY_GUIDE_BASE_URL = "https://proactivitis.com";

export const normalizeSafetyGuideSlug = (value: string) =>
  value.endsWith(SAFETY_GUIDE_SLUG_SUFFIX)
    ? value.slice(0, -SAFETY_GUIDE_SLUG_SUFFIX.length)
    : value;

export const buildSafetyGuideUrl = (locale: Locale, slug: string) => {
  const localePrefix = locale === "es" ? "" : `/${locale}`;
  return `${SAFETY_GUIDE_BASE_URL}${localePrefix}/${SAFETY_GUIDE_BASE_PATH}/${slug}${SAFETY_GUIDE_SLUG_SUFFIX}`;
};
