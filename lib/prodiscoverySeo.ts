import type { Metadata } from "next";
import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";
import type { ProDiscoveryCategory, ProDiscoveryDestination } from "@/lib/prodiscovery";

type DiscoveryTourSeoInput = {
  slug: string;
  locale: Locale;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
};

type DiscoveryTransferSeoInput = {
  landingSlug: string;
  locale: Locale;
  title: string;
  description?: string | null;
};

type DiscoveryTopSeoInput = {
  locale: Locale;
  destination: ProDiscoveryDestination;
  category: ProDiscoveryCategory;
};

const TITLE_SUFFIX: Record<Locale, string> = {
  es: "Opiniones y reserva | ProDiscovery",
  en: "Reviews and booking | ProDiscovery",
  fr: "Avis et reservation | ProDiscovery"
};

const TOUR_NOT_FOUND_TITLE: Record<Locale, string> = {
  es: "ProDiscovery | Tour no encontrado",
  en: "ProDiscovery | Tour not found",
  fr: "ProDiscovery | Tour introuvable"
};

const TRANSFER_NOT_FOUND_TITLE: Record<Locale, string> = {
  es: "ProDiscovery | Traslado no encontrado",
  en: "ProDiscovery | Transfer not found",
  fr: "ProDiscovery | Transfert introuvable"
};

const TOUR_DESCRIPTION_FALLBACK: Record<Locale, string> = {
  es: "Compara este tour en ProDiscovery con opiniones verificadas, contexto real y acceso directo a la reserva en Proactivitis.",
  en: "Compare this tour on ProDiscovery with verified reviews, real context and direct booking access on Proactivitis.",
  fr: "Comparez cette excursion sur ProDiscovery avec avis verifies, contexte reel et acces direct a la reservation sur Proactivitis."
};

const TOUR_DESCRIPTION_SUFFIX: Record<Locale, string> = {
  es: "Mira fotos, reseñas verificadas y reserva desde ProDiscovery.",
  en: "See photos, verified reviews and book from ProDiscovery.",
  fr: "Consultez photos, avis verifies et reservez depuis ProDiscovery."
};

const TRANSFER_DESCRIPTION_FALLBACK: Record<Locale, string> = {
  es: "Compara este traslado en ProDiscovery y reserva con precio claro, reseñas verificadas y soporte real en Proactivitis.",
  en: "Compare this transfer on ProDiscovery and book with clear pricing, verified reviews and real support on Proactivitis.",
  fr: "Comparez ce transfert sur ProDiscovery et reservez avec prix clair, avis verifies et assistance reelle sur Proactivitis."
};

const TRANSFER_DESCRIPTION_SUFFIX: Record<Locale, string> = {
  es: "Consulta opiniones, tarifa desde y reserva tu traslado desde ProDiscovery.",
  en: "See reviews, starting rate and book your transfer from ProDiscovery.",
  fr: "Consultez avis, tarif de base et reservez votre transfert depuis ProDiscovery."
};

const HOME_TITLE: Record<Locale, string> = {
  es: "ProDiscovery | Compara tours, hoteles y traslados antes de reservar",
  en: "ProDiscovery | Compare tours, hotels and transfers before booking",
  fr: "ProDiscovery | Comparez excursions, hotels et transferts avant de reserver"
};

const HOME_DESCRIPTION: Record<Locale, string> = {
  es: "Compara tours, hoteles y traslados con resenas verificadas, fotos reales, filtros inteligentes y acceso directo a la reserva en Proactivitis.",
  en: "Compare tours, hotels, and transfers with verified reviews, real photos, smart filters, and direct booking access on Proactivitis.",
  fr: "Comparez excursions, hotels et transferts avec avis verifies, vraies photos, filtres intelligents et acces direct a la reservation sur Proactivitis."
};

const CATEGORY_LABELS: Record<Locale, Record<ProDiscoveryCategory, string>> = {
  es: { tours: "tours", transfers: "traslados" },
  en: { tours: "tours", transfers: "transfers" },
  fr: { tours: "excursions", transfers: "transferts" }
};

const DESTINATION_LABELS: Record<Locale, Record<ProDiscoveryDestination, string>> = {
  es: {
    "punta-cana": "Punta Cana",
    sosua: "Sosua",
    "puerto-plata": "Puerto Plata"
  },
  en: {
    "punta-cana": "Punta Cana",
    sosua: "Sosua",
    "puerto-plata": "Puerto Plata"
  },
  fr: {
    "punta-cana": "Punta Cana",
    sosua: "Sosua",
    "puerto-plata": "Puerto Plata"
  }
};

const TOP_TITLE: Record<Locale, string> = {
  es: "Top {category} en {destination} | Opiniones y comparativa | ProDiscovery",
  en: "Best {category} in {destination} | Reviews and comparison | ProDiscovery",
  fr: "Meilleurs {category} a {destination} | Avis et comparatif | ProDiscovery"
};

const TOP_DESCRIPTION: Record<Locale, string> = {
  es: "Descubre el ranking de {category} en {destination} con resenas verificadas, reputacion, fotos y acceso directo a la reserva.",
  en: "Explore the ranking of {category} in {destination} with verified reviews, reputation signals, photos, and direct booking access.",
  fr: "Consultez le classement des {category} a {destination} avec avis verifies, reputation, photos et acces direct a la reservation."
};

const replaceTokens = (template: string, values: Record<string, string>) =>
  Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, value), template);

export const buildProDiscoveryTourNotFoundMetadata = (locale: Locale): Metadata => ({
  title: TOUR_NOT_FOUND_TITLE[locale]
});

export const buildProDiscoveryTransferNotFoundMetadata = (locale: Locale): Metadata => ({
  title: TRANSFER_NOT_FOUND_TITLE[locale]
});

export const buildProDiscoveryHomeMetadata = (locale: Locale): Metadata => {
  const canonicalPath = locale === "es" ? "/prodiscovery" : `/${locale}/prodiscovery`;
  const canonical = `${PROACTIVITIS_URL}${canonicalPath}`;
  return {
    title: HOME_TITLE[locale],
    description: HOME_DESCRIPTION[locale],
    alternates: {
      canonical,
      languages: {
        es: "/prodiscovery",
        en: "/en/prodiscovery",
        fr: "/fr/prodiscovery",
        "x-default": "/prodiscovery"
      }
    },
    openGraph: {
      title: HOME_TITLE[locale],
      description: HOME_DESCRIPTION[locale],
      url: canonical,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_TITLE[locale],
      description: HOME_DESCRIPTION[locale]
    },
    robots: { index: true, follow: true }
  };
};

export const buildProDiscoveryTopMetadata = ({
  locale,
  destination,
  category
}: DiscoveryTopSeoInput): Metadata => {
  const destinationLabel = DESTINATION_LABELS[locale][destination];
  const categoryLabel = CATEGORY_LABELS[locale][category];
  const canonicalPath =
    locale === "es"
      ? `/prodiscovery/top/${destination}/${category}`
      : `/${locale}/prodiscovery/top/${destination}/${category}`;
  const canonical = `${PROACTIVITIS_URL}${canonicalPath}`;
  const title = replaceTokens(TOP_TITLE[locale], {
    category: categoryLabel,
    destination: destinationLabel
  });
  const description = replaceTokens(TOP_DESCRIPTION[locale], {
    category: categoryLabel,
    destination: destinationLabel
  });

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        es: `/prodiscovery/top/${destination}/${category}`,
        en: `/en/prodiscovery/top/${destination}/${category}`,
        fr: `/fr/prodiscovery/top/${destination}/${category}`,
        "x-default": `/prodiscovery/top/${destination}/${category}`
      }
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
};

export const buildProDiscoveryTourMetadata = ({
  slug,
  locale,
  title,
  shortDescription,
  description
}: DiscoveryTourSeoInput): Metadata => {
  const canonicalPath = locale === "es" ? `/prodiscovery/tour/${slug}` : `/${locale}/prodiscovery/tour/${slug}`;
  const canonical = `${PROACTIVITIS_URL}${canonicalPath}`;
  const rawDescription = shortDescription?.trim() || description?.trim() || TOUR_DESCRIPTION_FALLBACK[locale];
  const normalizedDescription = rawDescription.replace(/\s+/g, " ").trim();
  const baseDescription =
    normalizedDescription.length > 118 ? `${normalizedDescription.slice(0, 118).trim()}...` : normalizedDescription;
  const finalDescription = `${baseDescription} ${TOUR_DESCRIPTION_SUFFIX[locale]}`.slice(0, 158).trim();

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

export const buildProDiscoveryTransferMetadata = ({
  landingSlug,
  locale,
  title,
  description
}: DiscoveryTransferSeoInput): Metadata => {
  const canonicalPath =
    locale === "es" ? `/prodiscovery/transfer/${landingSlug}` : `/${locale}/prodiscovery/transfer/${landingSlug}`;
  const canonical = `${PROACTIVITIS_URL}${canonicalPath}`;
  const rawDescription = description?.trim() || TRANSFER_DESCRIPTION_FALLBACK[locale];
  const normalizedDescription = rawDescription.replace(/\s+/g, " ").trim();
  const baseDescription =
    normalizedDescription.length > 112 ? `${normalizedDescription.slice(0, 112).trim()}...` : normalizedDescription;
  const finalDescription = `${baseDescription} ${TRANSFER_DESCRIPTION_SUFFIX[locale]}`.slice(0, 158).trim();

  return {
    title: `${title} | ${TITLE_SUFFIX[locale]}`,
    description: finalDescription,
    alternates: {
      canonical,
      languages: {
        es: `/prodiscovery/transfer/${landingSlug}`,
        en: `/en/prodiscovery/transfer/${landingSlug}`,
        fr: `/fr/prodiscovery/transfer/${landingSlug}`,
        "x-default": `/prodiscovery/transfer/${landingSlug}`
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
