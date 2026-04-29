import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicTourDetailPage, { type TourDetailSearchParams } from "@/components/public/PublicTourDetailPage";
import type { Locale } from "@/lib/translations";

const BASE_URL = "https://proactivitis.com";

const SOSUA_ALIASES: Record<string, { tourSlug: string; title: string; description: string }> = {
  "private-boat-hire-sosua": {
    tourSlug: "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua",
    title: "Private boat hire Sosua | Proactivitis",
    description:
      "Reserva barco privado en Sosua con experiencia personalizada, soporte local y coordinacion directa con Proactivitis."
  },
  "sosua-snorkeling-and-party-boat": {
    tourSlug: "party-boat-sosua",
    title: "Sosua snorkeling and party boat | Proactivitis",
    description:
      "Reserva party boat en Sosua con snorkeling, ambiente caribeno, soporte local y detalles claros antes de pagar."
  }
};

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

export const resolveSosuaPartyBoatAlias = (slug: string) => SOSUA_ALIASES[slug] ?? null;

export const buildSosuaPartyBoatAliasMetadata = (slug: string, locale: Locale): Metadata => {
  const alias = resolveSosuaPartyBoatAlias(slug);
  if (!alias) {
    return {
      title: locale === "fr" ? "Tour Sosua introuvable" : locale === "en" ? "Sosua tour not found" : "Tour Sosua no encontrado"
    };
  }
  const canonicalPath = `${localePrefix(locale)}/sosua/party-boat/${slug}`;
  return {
    title: alias.title,
    description: alias.description,
    alternates: {
      canonical: `${BASE_URL}${canonicalPath}`,
      languages: {
        es: `/sosua/party-boat/${slug}`,
        en: `/en/sosua/party-boat/${slug}`,
        fr: `/fr/sosua/party-boat/${slug}`,
        "x-default": `/sosua/party-boat/${slug}`
      }
    },
    robots: { index: true, follow: true }
  };
};

export default function SosuaPartyBoatAliasPage({
  slug,
  locale,
  searchParams
}: {
  slug: string;
  locale: Locale;
  searchParams?: Promise<TourDetailSearchParams>;
}) {
  const alias = resolveSosuaPartyBoatAlias(slug);
  if (!alias) return notFound();
  return <PublicTourDetailPage params={Promise.resolve({ slug: alias.tourSlug })} searchParams={searchParams} locale={locale} />;
}
