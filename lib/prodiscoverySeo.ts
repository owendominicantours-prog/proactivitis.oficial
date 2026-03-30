import type { Metadata } from "next";
import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";

type DiscoveryTourSeoInput = {
  slug: string;
  locale: Locale;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
};

const TITLE_SUFFIX: Record<Locale, string> = {
  es: "Opiniones, fotos y reserva | ProDiscovery",
  en: "Reviews, photos and booking | ProDiscovery",
  fr: "Avis, photos et reservation | ProDiscovery"
};

const NOT_FOUND_TITLE: Record<Locale, string> = {
  es: "ProDiscovery | Tour no encontrado",
  en: "ProDiscovery | Tour not found",
  fr: "ProDiscovery | Tour introuvable"
};

const DESCRIPTION_FALLBACK: Record<Locale, string> = {
  es: "Compara este tour en ProDiscovery con fotos, opiniones verificadas y acceso directo a la reserva en Proactivitis.",
  en: "Compare this tour on ProDiscovery with verified reviews, photos and direct booking access on Proactivitis.",
  fr: "Comparez cette excursion sur ProDiscovery avec avis verifies, photos et acces direct a la reservation sur Proactivitis."
};

const DESCRIPTION_SUFFIX: Record<Locale, string> = {
  es: "Mira fotos, reseñas verificadas y reserva desde ProDiscovery.",
  en: "See photos, verified reviews and book from ProDiscovery.",
  fr: "Consultez photos, avis verifies et reservez depuis ProDiscovery."
};

export const buildProDiscoveryTourNotFoundMetadata = (locale: Locale): Metadata => ({
  title: NOT_FOUND_TITLE[locale]
});

export const buildProDiscoveryTourMetadata = ({
  slug,
  locale,
  title,
  shortDescription,
  description
}: DiscoveryTourSeoInput): Metadata => {
  const canonicalPath = locale === "es" ? `/prodiscovery/tour/${slug}` : `/${locale}/prodiscovery/tour/${slug}`;
  const canonical = `${PROACTIVITIS_URL}${canonicalPath}`;
  const rawDescription = shortDescription?.trim() || description?.trim() || DESCRIPTION_FALLBACK[locale];
  const normalizedDescription = rawDescription.replace(/\s+/g, " ").trim();
  const baseDescription =
    normalizedDescription.length > 118 ? `${normalizedDescription.slice(0, 118).trim()}...` : normalizedDescription;
  const finalDescription = `${baseDescription} ${DESCRIPTION_SUFFIX[locale]}`.slice(0, 158).trim();

  return {
    title: `${title} | ${TITLE_SUFFIX[locale]}`,
    description: finalDescription,
    alternates: {
      canonical,
      languages: {
        es: `/prodiscovery/tour/${slug}`,
        en: `/en/prodiscovery/tour/${slug}`,
        fr: `/fr/prodiscovery/tour/${slug}`,
        "x-default": `/prodiscovery/tour/${slug}`
      }
    },
    openGraph: {
      title: `${title} | ProDiscovery`,
      description: finalDescription,
      url: canonical,
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ProDiscovery`,
      description: finalDescription
    }
  };
};
