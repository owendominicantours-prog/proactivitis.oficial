import type { Metadata } from "next";

import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";

export const PRODISCOVERY_PLANNER_PREFIX = "planificador-grupos-";

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

const TITLE_TEMPLATE: Record<Locale, string> = {
  es: "Planificador de grupos en {city} | ProDiscovery",
  en: "Group travel planner in {city} | ProDiscovery",
  fr: "Planificateur de groupes a {city} | ProDiscovery"
};

const DESCRIPTION_TEMPLATE: Record<Locale, string> = {
  es: "Solicita una propuesta privada para grupos en {city} con guia, transporte y experiencias adaptadas a tu viaje.",
  en: "Request a private group proposal in {city} with guide, transport and experiences adapted to your trip.",
  fr: "Demandez une proposition privee pour groupes a {city} avec guide, transport et experiences adaptees a votre voyage."
};

const OG_DESCRIPTION_TEMPLATE: Record<Locale, string> = {
  es: "Propuesta privada para grupos en {city} con guia, transporte y experiencias a medida.",
  en: "Custom group travel proposal in {city} with private guide, transport and tailored experiences.",
  fr: "Proposition sur mesure pour groupes a {city} avec guide prive, transport et experiences adaptees."
};

const fillCity = (template: string, city: string) => template.replace("{city}", city);

export const titleFromPlannerSlug = (slug: string) =>
  slug
    .slice(PRODISCOVERY_PLANNER_PREFIX.length)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const isProDiscoveryPlannerSlug = (slug: string) =>
  slug.startsWith(PRODISCOVERY_PLANNER_PREFIX) && slug.length > PRODISCOVERY_PLANNER_PREFIX.length;

export function buildProDiscoveryPlannerMetadata(locale: Locale, plannerSlug: string): Metadata {
  if (!isProDiscoveryPlannerSlug(plannerSlug)) return {};

  const city = titleFromPlannerSlug(plannerSlug);
  const canonicalPath = `${localePrefix(locale)}/prodiscovery/${plannerSlug}`;
  const canonical = `${PROACTIVITIS_URL}${canonicalPath}`;
  const title = fillCity(TITLE_TEMPLATE[locale], city);
  const description = fillCity(DESCRIPTION_TEMPLATE[locale], city);
  const ogDescription = fillCity(OG_DESCRIPTION_TEMPLATE[locale], city);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        es: `/prodiscovery/${plannerSlug}`,
        en: `/en/prodiscovery/${plannerSlug}`,
        fr: `/fr/prodiscovery/${plannerSlug}`,
        "x-default": `/prodiscovery/${plannerSlug}`
      }
    },
    openGraph: {
      title,
      description: ogDescription,
      url: canonical,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription
    },
    robots: { index: true, follow: true }
  };
}
