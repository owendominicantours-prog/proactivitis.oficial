import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import type { TransferLandingData } from "@/data/transfer-landings";
import { findGenericTransferLandingBySlug } from "@/data/transfer-generic-landings";
import TransferQuoteCards from "@/components/transfers/TransferQuoteCards";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import StructuredData from "@/components/schema/StructuredData";
import { translateEntries, translateText } from "@/lib/translationService";
import { Locale, translate } from "@/lib/translations";
import { TransferLocationType } from "@prisma/client";
import { findDynamicLandingBySlug, getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import PublicTransferPage from "@/components/public/PublicTransferPage";
import { normalizeTextDeep } from "@/lib/text-format";

const DEFAULT_AIRPORT_SLUG = "puj-airport";
const DEFAULT_AIRPORT_NAME = "Punta Cana International Airport (PUJ)";
const BASE_URL = "https://proactivitis.com";
const FALLBACK_PRICE = 44;
const FALLBACK_HERO_IMAGES = ["/transfer/mini van.png", "/transfer/sedan.png", "/transfer/suv.png"];
const DEFAULT_ORIGIN_LABELS: Record<Locale, string> = {
  es: "Aeropuerto de Punta Cana (PUJ)",
  en: "Punta Cana Airport (PUJ)",
  fr: "Aeroport de Punta Cana (PUJ)"
};

const pickHeroImage = (slug: string) => {
  const hash = slug.split("").reduce((value, char) => value + char.charCodeAt(0), 0);
  return FALLBACK_HERO_IMAGES[Math.abs(hash) % FALLBACK_HERO_IMAGES.length];
};

const buildFallbackLanding = ({
  originName,
  originSlug,
  destinationName,
  destinationSlug
}: {
  originName: string;
  originSlug: string;
  destinationName: string;
  destinationSlug: string;
}): TransferLandingData => {
  const landingSlug = `${originSlug}-to-${destinationSlug}`;
  return {
    landingSlug,
    reverseSlug: `${destinationSlug}-to-${originSlug}`,
    hotelSlug: destinationSlug,
    hotelName: destinationName,
    heroTitle: `Transfer privado ${originName} a ${destinationName}`,
    heroSubtitle: `Traslado privado con chofer bilingue y Wi-Fi directo a ${destinationName}.`,
    heroTagline: `Servicio flexible y seguro desde ${originName}`,
    heroImage: pickHeroImage(destinationSlug),
    heroImageAlt: `Transfer desde ${originName} a ${destinationName}`,
    priceFrom: FALLBACK_PRICE,
    priceDetails: ["Confirmacion instantanea", "Espera gratuita de 60 minutos", "Wi-Fi incluido"],
    longCopy: [
      `${originName} conecta con ${destinationName} sin esperas ni sorpresas.`,
      `El chofer bilingue te espera con cartel, maneja la ruta mas rapida y cuida tu equipaje.`,
      `El precio incluye 60 minutos de cortesia, asistencia 24/7 y soporte local durante el traslado.`
    ],
    trustBadges: ["Servicio privado garantizado", "Chofer bilingue | Wi-Fi a bordo", "Cancelacion flexible 24h"],
    faq: [
      {
        question: "Que pasa si mi vuelo se retrasa?",
        answer: "Monitoreamos tu vuelo y esperamos hasta 60 minutos sin costo adicional."
      },
      {
        question: "Puedo pedir un vehiculo mas grande?",
        answer: "Si, puedes solicitar una van o minibus y ajustamos la tarifa."
      },
      {
        question: "Hay algo extra que necesite saber?",
        answer: "Mantenemos comunicacion continua por WhatsApp y confirmamos el pickup antes de tu llegada."
      }
    ],
    seoTitle: `Transfer privado ${originName} a ${destinationName} | Proactivitis`,
    metaDescription: `Servicio premium desde ${originName} hasta ${destinationName} con chofer bilingue y confirmacion inmediata.`,
    keywords: [
      `${originName} ${destinationName} transfer`,
      `${destinationName} transfer privado`,
      `transfer ${destinationName}`
    ],
    canonical: `${BASE_URL}/transfer/${landingSlug}`
  };
};

const resolveLanding = async (landingSlug: string): Promise<TransferLandingData | null> => {
  const manual = allLandings().find((landing) => landing.landingSlug === landingSlug);
  if (manual) return manual;

  const dynamic = await findDynamicLandingBySlug(landingSlug);
  if (dynamic) {
    return buildFallbackLanding({
      originName: dynamic.origin.name,
      originSlug: dynamic.origin.slug,
      destinationName: dynamic.destination.name,
      destinationSlug: dynamic.destination.slug
    });
  }

  if (!landingSlug.includes("-to-")) {
    return null;
  }

  const [originSlug, destinationSlug] = landingSlug.split("-to-");
  const [origin, destination] = await Promise.all([
    prisma.transferLocation.findUnique({ where: { slug: originSlug } }),
    prisma.transferLocation.findUnique({ where: { slug: destinationSlug } })
  ]);
  const resolvedOrigin =
    origin ??
    (await prisma.transferLocation.findFirst({
      where: {
        type: TransferLocationType.AIRPORT,
        OR: [
          { slug: { contains: originSlug } },
          { slug: { contains: "punta-cana-international-airport" } },
          { slug: { contains: "punta-cana" } }
        ]
      }
    }));
  if (!resolvedOrigin || !destination) {
    return null;
  }

  return buildFallbackLanding({
    originName: resolvedOrigin.name,
    originSlug: resolvedOrigin.slug,
    destinationName: destination.name,
    destinationSlug: destination.slug
  });
};

const localizeLanding = async (landing: TransferLandingData, locale: Locale) => {
  if (locale === "es") return landing;
  const target = locale;
  const [heroTitle, heroSubtitle, heroTagline, heroImageAlt, seoTitle, metaDescription] = await Promise.all([
    translateText(landing.heroTitle, target),
    translateText(landing.heroSubtitle, target),
    translateText(landing.heroTagline, target),
    translateText(landing.heroImageAlt, target),
    translateText(landing.seoTitle, target),
    translateText(landing.metaDescription, target)
  ]);
  const [priceDetails, longCopy, trustBadges, keywords] = await Promise.all([
    translateEntries(landing.priceDetails, target),
    translateEntries(landing.longCopy, target),
    translateEntries(landing.trustBadges, target),
    translateEntries(landing.keywords, target)
  ]);
  const faq = await Promise.all(
    landing.faq.map(async (item) => ({
      question: await translateText(item.question, target),
      answer: await translateText(item.answer, target)
    }))
  );
  return {
    ...landing,
    heroTitle,
    heroSubtitle,
    heroTagline,
    heroImageAlt,
    seoTitle,
    metaDescription,
    priceDetails,
    longCopy,
    trustBadges,
    keywords,
    faq
  };
};

const buildCanonical = (slug: string, locale: Locale) =>
  locale === "es" ? `${BASE_URL}/transfer/${slug}` : `${BASE_URL}/${locale}/transfer/${slug}`;

const MIN_META_DESCRIPTION = 140;

const buildMetaSuffix = (locale: Locale, hotelName?: string) => {
  if (locale === "en") {
    return hotelName
      ? `Book your private transfer to ${hotelName} with flight tracking, bilingual driver, and 24/7 support.`
      : "Book private transfers with flight tracking, bilingual drivers, and 24/7 support.";
  }
  if (locale === "fr") {
    return hotelName
      ? `Reservez votre transfert prive vers ${hotelName} avec suivi de vol, chauffeur bilingue et support 24/7.`
      : "Reservez des transferts prives avec suivi de vol, chauffeurs bilingues et support 24/7.";
  }
  return hotelName
    ? `Reserva tu traslado privado a ${hotelName} con seguimiento de vuelo, chofer bilingue y soporte 24/7.`
    : "Reserva traslados privados con seguimiento de vuelo, chofer bilingue y soporte 24/7.";
};

const ensureMetaDescription = (description: string, locale: Locale, hotelName?: string) => {
  const base = description.trim();
  if (base.length >= MIN_META_DESCRIPTION) return base;
  return `${base} ${buildMetaSuffix(locale, hotelName)}`.trim();
};

const buildMarketTransferTitles = (
  locale: Locale,
  hotelName: string,
  originName?: string
): { heroTitle: string; seoTitle: string } => {
  const origin = originName?.trim() || DEFAULT_ORIGIN_LABELS[locale] || DEFAULT_ORIGIN_LABELS.es;
  if (locale === "en") {
    return {
      heroTitle: `${origin} to ${hotelName} Private Transfer`,
      seoTitle: `${hotelName} Private Transfer from Punta Cana Airport (PUJ)`
    };
  }
  if (locale === "fr") {
    return {
      heroTitle: `Transfert prive ${origin} vers ${hotelName}`,
      seoTitle: `${hotelName} transfert prive depuis l'aeroport de Punta Cana (PUJ)`
    };
  }
  return {
    heroTitle: `Traslado privado ${origin} a ${hotelName}`,
    seoTitle: `${hotelName}: traslado privado desde el aeropuerto de Punta Cana (PUJ)`
  };
};

export async function buildTransferMetadata(landingSlug: string, locale: Locale): Promise<Metadata> {
  const generic = findGenericTransferLandingBySlug(landingSlug);
  if (generic) {
    const canonical = buildCanonical(generic.landingSlug, locale);
    const seoTitle = generic.seoTitle[locale];
    const seoDescription = ensureMetaDescription(generic.metaDescription[locale], locale);
    const imageUrl = encodeURI(`${BASE_URL}/transfer/sedan.png`);
    return {
      title: seoTitle,
      description: seoDescription,
      robots: {
        index: true,
        follow: true
      },
      alternates: {
        canonical,
        languages: {
          es: `/transfer/${generic.landingSlug}`,
          en: `/en/transfer/${generic.landingSlug}`,
          fr: `/fr/transfer/${generic.landingSlug}`,
          "x-default": `/transfer/${generic.landingSlug}`
        }
      },
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: canonical,
        siteName: "Proactivitis",
        type: "website",
        locale: locale === "es" ? "es_DO" : locale === "fr" ? "fr_FR" : "en_US",
        images: [
          {
            url: imageUrl,
            alt: "Transfer Punta Cana"
          }
        ]
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDescription,
        images: [imageUrl]
      },
      keywords: generic.keywords
    };
  }

  const landing = await resolveLanding(landingSlug);
  if (!landing) return {};
  const localized = await localizeLanding(landing, locale);
  const canonical = buildCanonical(landing.landingSlug, locale);
  const marketTitles = buildMarketTransferTitles(locale, landing.hotelName);
  const seoTitle = `${marketTitles.seoTitle} | Proactivitis`;
  const rawDescription = ensureMetaDescription(localized.metaDescription, locale, landing.hotelName);
  const seoDescription = rawDescription.endsWith(".") ? rawDescription : `${rawDescription}.`;
  const imageUrl = encodeURI(`${BASE_URL}${localized.heroImage}`);
  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical,
      languages: {
        es: `/transfer/${landing.landingSlug}`,
        en: `/en/transfer/${landing.landingSlug}`,
        fr: `/fr/transfer/${landing.landingSlug}`,
        "x-default": `/transfer/${landing.landingSlug}`
      }
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      locale: locale === "es" ? "es_DO" : locale === "fr" ? "fr_FR" : "en_US",
      images: [
        {
          url: imageUrl,
          alt: localized.heroImageAlt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [imageUrl]
    },
    keywords: localized.keywords
  };
}

const formatDateTime = (date: Date) => {
  const iso = date.toISOString();
  return iso.slice(0, 16);
};

export async function TransferLandingPage({
  landingSlug,
  locale
}: {
  landingSlug: string;
  locale: Locale;
}) {
  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);

  const generic = findGenericTransferLandingBySlug(landingSlug);
  if (generic) {
    return (
      <PublicTransferPage
        locale={locale}
        heroTitleOverride={generic.titles[locale]}
        heroDescriptionOverride={generic.descriptions[locale]}
      />
    );
  }

  const landing = await resolveLanding(landingSlug);
  if (!landing) return notFound();
  const localizedLanding = normalizeTextDeep(await localizeLanding(landing, locale));

  const originSlug = landing.landingSlug.includes("-to-") ? landing.landingSlug.split("-to-")[0] : DEFAULT_AIRPORT_SLUG;
  const [originLocation, destinationLocation] = await Promise.all([
    prisma.transferLocation.findUnique({ where: { slug: originSlug } }),
    prisma.transferLocation.findUnique({ where: { slug: landing.hotelSlug } })
  ]);
  if (!originLocation || !destinationLocation) {
    return notFound();
  }
  const marketTitles = buildMarketTransferTitles(
    locale,
    localizedLanding.hotelName,
    originLocation.name ?? DEFAULT_AIRPORT_NAME
  );

  const defaultDeparture = formatDateTime(new Date(Date.now() + 2 * 60 * 60 * 1000));

  const otherLandings = allLandings()
    .filter((item) => item.landingSlug !== landing.landingSlug)
    .slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: t("transferLanding.schema.serviceType", { hotel: localizedLanding.hotelName }),
    provider: {
      "@type": "TravelAgency",
      name: "Proactivitis",
      url: BASE_URL,
      logo: `${BASE_URL}/icon.png`,
      sameAs: ["https://www.instagram.com/proactivitis/", "https://www.facebook.com/proactivitis"]
    },
    areaServed: {
      "@type": "Place",
      name: t("transferLanding.schema.area")
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: t("transferLanding.schema.catalogName"),
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: t("transferLanding.schema.offerName", { hotel: localizedLanding.hotelName })
          },
          priceCurrency: "USD",
          price: localizedLanding.priceFrom
        }
      ]
    }
  };

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Proactivitis",
    url: BASE_URL,
    logo: `${BASE_URL}/icon.png`,
    sameAs: ["https://www.instagram.com/proactivitis/", "https://www.facebook.com/proactivitis"]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("transferLanding.breadcrumb.home"),
        item: `${BASE_URL}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("transferLanding.breadcrumb.transfers"),
        item: buildCanonical("", locale).replace(/\/$/, "")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: marketTitles.heroTitle,
        item: buildCanonical(landing.landingSlug, locale)
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: localizedLanding.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <main className="bg-white">
      <LandingViewTracker landingSlug={landing.landingSlug} />
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.5em] text-emerald-600">{t("transferLanding.hero.label")}</p>
            <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{marketTitles.heroTitle}</h1>
            <p className="text-lg text-slate-600">{localizedLanding.heroSubtitle}</p>
            <p className="text-sm text-slate-500">{localizedLanding.heroTagline}</p>
          </div>
          <div className="relative h-96 w-full overflow-hidden rounded-[32px] border border-white/40 shadow-xl">
            <Image
              src={localizedLanding.heroImage}
              alt={localizedLanding.heroImageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-slate-500">
          {t("transferLanding.route.label")} {originLocation.name ?? DEFAULT_AIRPORT_NAME} {"->"}{" "}
          {localizedLanding.hotelName}
        </p>
        <TransferQuoteCards
          originId={originLocation.id}
          destinationId={destinationLocation.id}
          originSlug={originLocation.slug}
          destinationSlug={destinationLocation.slug}
          originLabel={originLocation.name ?? DEFAULT_AIRPORT_NAME}
          destinationLabel={destinationLocation.name ?? localizedLanding.hotelName}
          defaultDeparture={defaultDeparture}
          priceFrom={localizedLanding.priceFrom}
          locale={locale}
        />
      </section>
      <section className="mx-auto max-w-6xl space-y-5 px-4 py-12">
        {localizedLanding.longCopy.map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-slate-600">
            {paragraph}
          </p>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {t("transferLanding.longform.eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {t("transferLanding.longform.title", { hotel: localizedLanding.hotelName })}
          </h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>{t("transferLanding.longform.body1", { hotel: localizedLanding.hotelName })}</p>
            <p>{t("transferLanding.longform.body2", { hotel: localizedLanding.hotelName })}</p>
            <p>{t("transferLanding.longform.body3")}</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{t("transferLanding.faq.eyebrow")}</p>
          <h2 className="text-2xl font-bold text-slate-900">{t("transferLanding.faq.title")}</h2>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {localizedLanding.faq.map((item) => (
            <article key={item.question} className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{item.question}</p>
              <p className="mt-2 font-semibold text-slate-900">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{t("transferLanding.other.title")}</p>
          <div className="flex flex-wrap gap-3">
            {otherLandings.map((item) => (
              <Link
                key={item.landingSlug}
                href={locale === "es" ? `/transfer/${item.landingSlug}` : `/${locale}/transfer/${item.landingSlug}`}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600"
              >
                {item.hotelName}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {otherLandings.map((item) => (
            <Link
              key={`reverse-${item.reverseSlug}`}
              href={locale === "es" ? `/transfer/${item.reverseSlug}` : `/${locale}/transfer/${item.reverseSlug}`}
              className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 underline"
            >
              {t("transferLanding.backLink", { hotel: item.hotelName })}
            </Link>
          ))}
        </div>
      </section>
      <section className="sr-only">
        <StructuredData data={businessSchema} />
        <StructuredData data={schema} />
        <StructuredData data={faqSchema} />
        <StructuredData data={breadcrumbSchema} />
      </section>
    </main>
  );
}

export async function generateTransferStaticParams() {
  const combos = await getDynamicTransferLandingCombos();
  const slugs = new Set<string>();
  const dynamicParams: { landingSlug: string }[] = [];
  combos.forEach((combo) => {
    const paths = [combo.landingSlug, ...combo.aliasSlugs];
    paths.forEach((slug) => {
      if (!slugs.has(slug)) {
        slugs.add(slug);
        dynamicParams.push({ landingSlug: slug });
      }
    });
  });
  const manualParams = allLandings()
    .filter((landing) => !slugs.has(landing.landingSlug))
    .map((landing) => ({ landingSlug: landing.landingSlug }));
  return [...dynamicParams, ...manualParams];
}
