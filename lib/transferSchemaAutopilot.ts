import { allLandings } from "@/data/transfer-landings";
import {
  buildCanonical,
  buildMarketTransferTitles,
  localizeLanding,
  resolveLanding,
  resolveLocationByAlias,
  toAbsoluteImageUrl
} from "@/components/public/TransferLandingPage";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import { normalizeTextDeep } from "@/lib/text-format";
import { getPriceValidUntil, PROACTIVITIS_LOCALBUSINESS, PROACTIVITIS_URL } from "@/lib/seo";
import { TransferLocationType } from "@prisma/client";
import type { Locale } from "@/lib/translations";
import { applyTransferSchemaOverride, getTransferSchemaOverride } from "@/lib/schemaManager";

const textByLocale = {
  es: { home: "Inicio", transfers: "Transfers" },
  en: { home: "Home", transfers: "Transfers" },
  fr: { home: "Accueil", transfers: "Transferts" }
} satisfies Record<Locale, { home: string; transfers: string }>;

export type TransferSchemaPreviewData = {
  graph: Record<string, unknown>;
  canonical: string;
  pageTitle: string;
  pageDescription: string;
  slug: string;
  locale: Locale;
};

export async function listTransferSchemaCandidateSlugs() {
  const dynamicCombos = await getDynamicTransferLandingCombos();
  return Array.from(
    new Set([
      ...allLandings().map((item) => item.landingSlug),
      ...dynamicCombos.map((item) => item.landingSlug)
    ])
  ).sort((a, b) => a.localeCompare(b));
}

export async function buildTransferSchemaPreviewData(
  slug: string,
  locale: Locale
): Promise<TransferSchemaPreviewData | null> {
  const landing = await resolveLanding(slug);
  if (!landing) return null;

  const localizedLanding = normalizeTextDeep(await localizeLanding(landing, locale));
  const [originSlugRaw, destinationSlugRaw] = landing.landingSlug.includes("-to-")
    ? landing.landingSlug.split("-to-")
    : ["puj-airport", landing.hotelSlug];

  const [originLocation, destinationLocation, override] = await Promise.all([
    resolveLocationByAlias(originSlugRaw || "puj-airport", TransferLocationType.AIRPORT),
    resolveLocationByAlias(destinationSlugRaw || landing.hotelSlug),
    getTransferSchemaOverride(landing.landingSlug, locale)
  ]);

  const originLabel = originLocation?.name ?? "Punta Cana International Airport (PUJ)";
  const destinationLabel = destinationLocation?.name ?? localizedLanding.hotelName;
  const canonical = buildCanonical(landing.landingSlug, locale);
  const marketTitles = buildMarketTransferTitles(locale, localizedLanding.hotelName, originLabel);
  const identifier = landing.landingSlug;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonical}#service`,
    identifier,
    name: marketTitles.heroTitle,
    description: localizedLanding.metaDescription,
    mainEntityOfPage: canonical,
    serviceType:
      locale === "es"
        ? `Transfer privado al hotel ${localizedLanding.hotelName}`
        : locale === "fr"
        ? `Transfert prive vers ${localizedLanding.hotelName}`
        : `Private transfer to ${localizedLanding.hotelName}`,
    provider: {
      "@type": "TravelAgency",
      name: "Proactivitis",
      url: "https://proactivitis.com",
      logo: "https://proactivitis.com/icon.png",
      sameAs: ["https://www.instagram.com/proactivitis/", "https://www.facebook.com/proactivitis"]
    },
    areaServed: [
      { "@type": "Place", name: originLabel },
      { "@type": "Place", name: destinationLabel }
    ],
    url: canonical,
    image: [toAbsoluteImageUrl(localizedLanding.heroImage)],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name:
        locale === "es"
          ? "Transfers desde Punta Cana"
          : locale === "fr"
          ? "Transferts depuis Punta Cana"
          : "Transfers from Punta Cana",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            identifier,
            name:
              locale === "es"
                ? `Transfer privado a ${localizedLanding.hotelName}`
                : locale === "fr"
                ? `Transfert prive vers ${localizedLanding.hotelName}`
                : `Private transfer to ${localizedLanding.hotelName}`
          },
          priceCurrency: "USD",
          price: localizedLanding.priceFrom,
          availability: "https://schema.org/InStock",
          priceValidUntil: getPriceValidUntil()
        }
      ]
    }
  };

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${PROACTIVITIS_URL}#organization`,
    name: "Proactivitis",
    url: "https://proactivitis.com",
    logo: "https://proactivitis.com/icon.png",
    image: [toAbsoluteImageUrl(localizedLanding.heroImage)],
    sameAs: ["https://www.instagram.com/proactivitis/", "https://www.facebook.com/proactivitis"],
    telephone: PROACTIVITIS_LOCALBUSINESS.telephone,
    email: PROACTIVITIS_LOCALBUSINESS.email,
    priceRange: "$$",
    address: PROACTIVITIS_LOCALBUSINESS.address,
    contactPoint: PROACTIVITIS_LOCALBUSINESS.contactPoint
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: canonical,
    mainEntity: localizedLanding.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    url: canonical,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: textByLocale[locale].home,
        item: "https://proactivitis.com/"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: textByLocale[locale].transfers,
        item: buildCanonical("", locale).replace(/\/$/, "")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: marketTitles.heroTitle,
        item: canonical
      }
    ]
  };

  return {
    graph: applyTransferSchemaOverride({
      businessSchema,
      serviceSchema,
      faqSchema,
      breadcrumbSchema,
      override
    }),
    canonical,
    pageTitle: localizedLanding.heroTitle,
    pageDescription: localizedLanding.metaDescription,
    slug: landing.landingSlug,
    locale
  };
}
