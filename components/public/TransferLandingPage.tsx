import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import type { TransferLandingData } from "@/data/transfer-landings";
import { findGenericTransferLandingBySlug } from "@/data/transfer-generic-landings";
import {
  applyTransferHotelSalesVariant,
  buildTransferHotelVariantSlug,
  findTransferHotelSalesVariant,
  parseTransferHotelVariantSlug,
  TRANSFER_HOTEL_SALES_VARIANTS
} from "@/data/transfer-hotel-sales-variants";
import TransferQuoteCards from "@/components/transfers/TransferQuoteCards";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import StructuredData from "@/components/schema/StructuredData";
import { translateEntries, translateText } from "@/lib/translationService";
import { Locale, translate } from "@/lib/translations";
import { TransferLocationType } from "@prisma/client";
import { findDynamicLandingBySlug, getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import PublicTransferPage from "@/components/public/PublicTransferPage";
import { ensureLeadingCapital, normalizeTextDeep } from "@/lib/text-format";
import { getPriceValidUntil } from "@/lib/seo";
import { isIndexableTransferVariant } from "@/lib/seo-index-policy";

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

const normalizeLoose = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ã©/g, "e")
    .replace(/Ã¡/g, "a")
    .replace(/Ã­/g, "i")
    .replace(/Ã³/g, "o")
    .replace(/Ãº/g, "u")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

const slugTokens = (value: string) => normalizeLoose(value).split("-").filter((token) => token.length > 2);

const looksLikeAirportSlug = (value: string) => {
  const normalized = normalizeLoose(value);
  return (
    normalized.includes("airport") ||
    normalized.includes("aeropuerto") ||
    normalized.includes("puj") ||
    normalized.includes("las-americas") ||
    normalized.includes("aeropuerto-internacional")
  );
};

const buildSlugAliases = (value: string) => {
  const normalized = normalizeLoose(value);
  const aliases = new Set<string>([value, normalized]);
  aliases.add(normalized.replace("punta-cana-international-airport", "puj-airport"));
  aliases.add(normalized.replace("punta-cana-airport", "puj-airport"));
  aliases.add(normalized.replace("aeropuerto-las-americas", "aeropuerto-internacional-las-americas"));
  aliases.add(normalized.replace("aeropuerto-las-americas", "las-americas-airport"));
  aliases.add(normalized.replace("aeropuerto-internacional-las-americas", "aeropuerto-las-americas"));
  return Array.from(aliases).filter(Boolean);
};

type TransferLocationLite = {
  slug: string;
  name: string;
  type: TransferLocationType;
  zoneId: string;
};

const scoreLocationMatch = (target: string, location: TransferLocationLite) => {
  const targetTokens = slugTokens(target);
  const haystack = `${normalizeLoose(location.slug)} ${normalizeLoose(location.name)}`;
  return targetTokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
};

const findBestLocation = (target: string, locations: TransferLocationLite[]) => {
  if (locations.length === 0) return null;
  let best: TransferLocationLite | null = null;
  let bestScore = -1;
  for (const candidate of locations) {
    const score = scoreLocationMatch(target, candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return bestScore <= 0 ? null : best;
};

const resolveLocationByAlias = async (
  rawSlug: string,
  expectedType?: TransferLocationType
): Promise<TransferLocationLite | null> => {
  const aliases = buildSlugAliases(rawSlug);
  for (const alias of aliases) {
    const exact = await prisma.transferLocation.findUnique({
      where: { slug: alias },
      select: { slug: true, name: true, type: true, zoneId: true }
    });
    if (exact && (!expectedType || exact.type === expectedType)) {
      return exact;
    }
  }

  if (expectedType || looksLikeAirportSlug(rawSlug)) {
    const airports = await prisma.transferLocation.findMany({
      where: { type: TransferLocationType.AIRPORT, active: true },
      select: { slug: true, name: true, type: true, zoneId: true }
    });
    const bestAirport = findBestLocation(rawSlug, airports);
    if (bestAirport) return bestAirport;
  }

  const expectedWhere = expectedType ? { type: expectedType, active: true } : { active: true };
  const generic = await prisma.transferLocation.findMany({
    where: expectedWhere,
    select: { slug: true, name: true, type: true, zoneId: true },
    take: 2500
  });
  return findBestLocation(rawSlug, generic);
};

const pickHeroImage = (slug: string) => {
  const hash = slug.split("").reduce((value, char) => value + char.charCodeAt(0), 0);
  return FALLBACK_HERO_IMAGES[Math.abs(hash) % FALLBACK_HERO_IMAGES.length];
};

const humanizeSlug = (value: string) =>
  normalizeLoose(value)
    .split("-")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");

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

const resolveBaseLanding = async (landingSlug: string): Promise<TransferLandingData | null> => {
  const normalizedLandingSlug = normalizeLoose(landingSlug);
  const normalizedLandingSlugAlias = normalizedLandingSlug
    .replace("punta-cana-international-airport-puj-to-", "punta-cana-international-airport-to-")
    .replace("-to-punta-cana-international-airport-puj", "-to-punta-cana-international-airport");
  const manual = allLandings().find(
    (landing) =>
      landing.landingSlug === landingSlug ||
      landing.reverseSlug === landingSlug ||
      normalizeLoose(landing.landingSlug) === normalizedLandingSlug ||
      normalizeLoose(landing.landingSlug) === normalizedLandingSlugAlias ||
      normalizeLoose(landing.reverseSlug) === normalizedLandingSlug
      || normalizeLoose(landing.reverseSlug) === normalizedLandingSlugAlias
  );
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
  const [originGuess, destinationGuess] = await Promise.all([
    resolveLocationByAlias(
      originSlug,
      looksLikeAirportSlug(originSlug) ? TransferLocationType.AIRPORT : undefined
    ),
    resolveLocationByAlias(
      destinationSlug,
      looksLikeAirportSlug(destinationSlug) ? TransferLocationType.AIRPORT : undefined
    )
  ]);

  let resolvedOrigin = originGuess;
  let resolvedDestination = destinationGuess;

  if (resolvedOrigin && resolvedDestination) {
    if (
      resolvedOrigin.type !== TransferLocationType.AIRPORT &&
      resolvedDestination.type === TransferLocationType.AIRPORT
    ) {
      const swappedOrigin = resolvedDestination;
      resolvedDestination = resolvedOrigin;
      resolvedOrigin = swappedOrigin;
    }
  }

  if (
    !resolvedOrigin ||
    !resolvedDestination ||
    resolvedOrigin.type !== TransferLocationType.AIRPORT ||
    resolvedDestination.type === TransferLocationType.AIRPORT
  ) {
    const [leftSlug, rightSlug] = landingSlug.split("-to-");
    if (!leftSlug || !rightSlug) return null;
    const leftIsAirport = looksLikeAirportSlug(leftSlug);
    const rightIsAirport = looksLikeAirportSlug(rightSlug);
    if (!leftIsAirport && !rightIsAirport) return null;
    const originSlugFallback = normalizeLoose(leftIsAirport ? leftSlug : rightSlug) || DEFAULT_AIRPORT_SLUG;
    const destinationSlugFallback = normalizeLoose(leftIsAirport ? rightSlug : leftSlug);
    if (!destinationSlugFallback) return null;
    return buildFallbackLanding({
      originName: DEFAULT_AIRPORT_NAME,
      originSlug: originSlugFallback,
      destinationName: humanizeSlug(destinationSlugFallback),
      destinationSlug: destinationSlugFallback
    });
  }

  return buildFallbackLanding({
    originName: resolvedOrigin.name,
    originSlug: resolvedOrigin.slug,
    destinationName: resolvedDestination.name,
    destinationSlug: resolvedDestination.slug
  });
};

const resolveLanding = async (landingSlug: string): Promise<TransferLandingData | null> => {
  const parsed = parseTransferHotelVariantSlug(landingSlug);
  const baseLanding = await resolveBaseLanding(parsed.baseSlug);
  if (!baseLanding) return null;
  const variant = findTransferHotelSalesVariant(parsed.variantId);
  if (!variant) return baseLanding;
  return applyTransferHotelSalesVariant(baseLanding, variant);
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

const parseGalleryImages = (value?: string | null): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item)).filter(Boolean);
  } catch {
    return [];
  }
};

const resolveTourCardImage = (heroImage?: string | null, gallery?: string | null) => {
  if (heroImage) return heroImage;
  return parseGalleryImages(gallery)[0] ?? "/transfer/sedan.png";
};

const formatTourDuration = (value?: string | null, locale: Locale = "es") => {
  if (!value) {
    return locale === "fr" ? "Duree variable" : locale === "en" ? "Flexible duration" : "Duracion variable";
  }
  const trimmed = value.trim();
  if (!trimmed.startsWith("{")) return trimmed;
  try {
    const parsed = JSON.parse(trimmed) as { value?: string; unit?: string };
    const durationValue = parsed?.value ? String(parsed.value).trim() : "";
    const unitRaw = parsed?.unit ? String(parsed.unit).trim().toLowerCase() : "";
    if (!durationValue || !unitRaw) return trimmed;
    if (unitRaw.includes("hora") || unitRaw.includes("hour") || unitRaw.includes("heure")) {
      if (locale === "fr") return `${durationValue} heure${durationValue === "1" ? "" : "s"}`;
      if (locale === "en") return `${durationValue} hour${durationValue === "1" ? "" : "s"}`;
      return `${durationValue} hora${durationValue === "1" ? "" : "s"}`;
    }
    if (unitRaw.includes("min")) return `${durationValue} min`;
    if (unitRaw.includes("dia") || unitRaw.includes("day") || unitRaw.includes("jour")) {
      if (locale === "fr") return `${durationValue} jour${durationValue === "1" ? "" : "s"}`;
      if (locale === "en") return `${durationValue} day${durationValue === "1" ? "" : "s"}`;
      return `${durationValue} dia${durationValue === "1" ? "" : "s"}`;
    }
    return `${durationValue} ${parsed.unit ?? ""}`.trim();
  } catch {
    return trimmed;
  }
};

export async function buildTransferMetadata(landingSlug: string, locale: Locale): Promise<Metadata> {
  const parsedSlug = parseTransferHotelVariantSlug(landingSlug);
  const canIndexVariant = isIndexableTransferVariant(parsedSlug.variantId);
  const generic = findGenericTransferLandingBySlug(landingSlug);
  if (generic) {
    const canonical = buildCanonical(generic.landingSlug, locale);
    const seoTitle = ensureLeadingCapital(generic.seoTitle[locale]);
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
  const canonicalTargetSlug = canIndexVariant ? landing.landingSlug : parsedSlug.baseSlug;
  const canonical = buildCanonical(canonicalTargetSlug, locale);
  const marketTitles = buildMarketTransferTitles(locale, landing.hotelName);
  const seoTitle = ensureLeadingCapital(`${marketTitles.seoTitle} | Proactivitis`);
  const rawDescription = ensureMetaDescription(localized.metaDescription, locale, landing.hotelName);
  const seoDescription = rawDescription.endsWith(".") ? rawDescription : `${rawDescription}.`;
  const imageUrl = encodeURI(`${BASE_URL}${localized.heroImage}`);
  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical,
      languages: {
        es: `/transfer/${canonicalTargetSlug}`,
        en: `/en/transfer/${canonicalTargetSlug}`,
        fr: `/fr/transfer/${canonicalTargetSlug}`,
        "x-default": `/transfer/${canonicalTargetSlug}`
      }
    },
    robots: {
      index: canIndexVariant,
      follow: true
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

const SALES_CARDS = {
  es: [
    {
      title: "Recepcion VIP en aeropuerto",
      body: "Tu chofer te espera con cartel, monitoreo de vuelo y salida prioritaria sin filas innecesarias."
    },
    {
      title: "Tarifa clara sin sorpresas",
      body: "Precio final confirmado antes de pagar, con equipaje y asistencia incluidos en el servicio."
    },
    {
      title: "Ideal para familias y grupos",
      body: "Opciones privadas con espacio real para maletas, ninos y viaje comodo hasta el hotel."
    }
  ],
  en: [
    {
      title: "VIP airport meet & greet",
      body: "Your chauffeur waits with a sign, tracks your flight, and gets you out fast without unnecessary lines."
    },
    {
      title: "Clear pricing, no surprises",
      body: "Final price is confirmed before payment, including luggage handling and on-trip assistance."
    },
    {
      title: "Perfect for families and groups",
      body: "Private options with real luggage room and comfortable seating all the way to your resort."
    }
  ],
  fr: [
    {
      title: "Accueil VIP a l aeroport",
      body: "Votre chauffeur vous attend avec pancarte, suivi de vol et sortie rapide sans attente inutile."
    },
    {
      title: "Tarif clair sans surprise",
      body: "Prix final confirme avant paiement, avec bagages et assistance inclus."
    },
    {
      title: "Ideal familles et groupes",
      body: "Options privees avec vrai espace bagages et trajet confortable jusqu a l hotel."
    }
  ]
} as const;

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
  const originLabel = originLocation?.name ?? DEFAULT_AIRPORT_NAME;
  const destinationLabel = destinationLocation?.name ?? localizedLanding.hotelName;
  const canQuote = Boolean(originLocation?.id && destinationLocation?.id);
  const marketTitles = buildMarketTransferTitles(
    locale,
    localizedLanding.hotelName,
    originLabel
  );
  const activeSalesVariant = findTransferHotelSalesVariant(parseTransferHotelVariantSlug(landingSlug).variantId);
  const toursHubHref = locale === "es" ? "/tours" : `/${locale}/tours`;
  const puntaCanaToursHref = locale === "es" ? "/punta-cana/tours" : `/${locale}/punta-cana/tours`;
  const hotelThingsToDoHref =
    locale === "es" ? `/things-to-do/${landing.hotelSlug}` : `/${locale}/things-to-do/${landing.hotelSlug}`;

  const defaultDeparture = formatDateTime(new Date(Date.now() + 2 * 60 * 60 * 1000));
  const salesCards = SALES_CARDS[locale] ?? SALES_CARDS.es;

  const otherLandings = allLandings()
    .filter((item) => item.landingSlug !== landing.landingSlug)
    .slice(0, 3);
  const priceValidUntil = getPriceValidUntil();
  const hotelLocation = await prisma.location.findUnique({
    where: { slug: landing.hotelSlug },
    select: {
      countryId: true,
      destinationId: true,
      microZoneId: true
    }
  });

  const countryId = hotelLocation?.countryId ?? "RD";
  const recommendedTours = await prisma.tour.findMany({
    where: {
      status: "published",
      slug: { not: "transfer-privado-proactivitis" },
      OR: [
        ...(hotelLocation?.microZoneId ? [{ countryId, microZoneId: hotelLocation.microZoneId }] : []),
        ...(hotelLocation?.destinationId ? [{ countryId, destinationId: hotelLocation.destinationId }] : []),
        { countryId }
      ]
    },
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      duration: true,
      price: true,
      heroImage: true,
      gallery: true,
      featured: true,
      translations: {
        where: { locale },
        select: {
          title: true,
          shortDescription: true
        }
      }
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 6
  });
  const approvedTransferReviews = await prisma.transferReview.findMany({
    where: {
      status: "APPROVED",
      transferLandingSlug: landing.landingSlug
    },
    orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
    take: 6
  });

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
          price: localizedLanding.priceFrom,
          availability: "https://schema.org/InStock",
          priceValidUntil,
          shippingDetails: {
            "@type": "OfferShippingDetails",
            doesNotShip: true,
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "DO"
            }
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
            applicableCountry: "DO"
          }
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
      <section id="transfer-quote-cards" className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-slate-500">
          {t("transferLanding.route.label")} {originLabel} {"->"} {destinationLabel}
        </p>
        {canQuote ? (
          <TransferQuoteCards
            originId={originLocation!.id}
            destinationId={destinationLocation!.id}
            originSlug={originLocation!.slug}
            destinationSlug={destinationLocation!.slug}
            originLabel={originLabel}
            destinationLabel={destinationLabel}
            defaultDeparture={defaultDeparture}
            priceFrom={localizedLanding.priceFrom}
            locale={locale}
          />
        ) : (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {locale === "es"
              ? "Estamos actualizando esta ruta para cotizacion automatica. Puedes cotizar ahora mismo en el formulario general de traslados."
              : locale === "fr"
              ? "Nous mettons a jour cette route pour un devis automatique. Vous pouvez demander un devis immediat via le formulaire general."
              : "We are updating this route for automatic pricing. You can still request an instant quote from the general transfer form."}
            <div className="mt-3">
              <Link
                href={locale === "es" ? "/traslado" : `/${locale}/traslado`}
                className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-slate-700"
              >
                {locale === "es" ? "Cotizar traslado" : locale === "fr" ? "Demander un devis" : "Get transfer quote"}
              </Link>
            </div>
          </div>
        )}
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="grid gap-4 md:grid-cols-3">
          {salesCards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
                {locale === "es" ? "Beneficio" : locale === "fr" ? "Avantage" : "Benefit"}
              </p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
              <Link
                href="#transfer-quote-cards"
                className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 hover:text-emerald-800"
              >
                {locale === "es" ? "Cotizar ahora" : locale === "fr" ? "Demander un devis" : "Get a quote"}
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl space-y-5 px-4 py-12">
        {localizedLanding.longCopy.map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-slate-600">
            {paragraph}
          </p>
        ))}
      </section>
      {recommendedTours.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {locale === "es" ? "Tours recomendados" : locale === "fr" ? "Tours recommandes" : "Recommended tours"}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {locale === "es"
                ? `Combina tu traslado a ${localizedLanding.hotelName} con estas excursiones`
                : locale === "fr"
                ? `Combinez votre transfert vers ${localizedLanding.hotelName} avec ces excursions`
                : `Pair your transfer to ${localizedLanding.hotelName} with these tours`}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendedTours.map((tour) => {
                const tourHref = locale === "es" ? `/tours/${tour.slug}` : `/${locale}/tours/${tour.slug}`;
                return (
                  <article key={tour.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="relative h-40">
                      <Image
                        src={resolveTourCardImage(tour.heroImage, tour.gallery)}
                        alt={tour.translations?.[0]?.title ?? tour.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <h3 className="line-clamp-2 text-base font-bold text-slate-900">
                        {tour.translations?.[0]?.title ?? tour.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-slate-600">
                        {tour.translations?.[0]?.shortDescription || tour.shortDescription || localizedLanding.heroSubtitle}
                      </p>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        {locale === "es" ? "Duracion" : locale === "fr" ? "Duree" : "Duration"}:{" "}
                        {formatTourDuration(tour.duration, locale)}
                      </p>
                      <p className="text-sm font-semibold text-emerald-700">
                        {locale === "es" ? "Desde" : locale === "fr" ? "A partir de" : "From"} USD {Math.round(tour.price)}
                      </p>
                      <Link
                        href={tourHref}
                        className="inline-flex rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 transition hover:bg-emerald-50"
                      >
                        {locale === "es" ? "Ver tour" : locale === "fr" ? "Voir le tour" : "View tour"}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
      {approvedTransferReviews.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {locale === "es" ? "Resenas verificadas" : locale === "fr" ? "Avis verifies" : "Verified reviews"}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {locale === "es"
                ? "Lo que dicen los clientes de este transfer"
                : locale === "fr"
                ? "Ce que disent les clients de ce transfert"
                : "What clients say about this transfer"}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedTransferReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{review.customerName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-amber-600">
                    {"★".repeat(Math.max(1, Math.min(5, review.rating)))} {review.rating}/5
                  </p>
                  {review.title ? <p className="mt-2 text-sm font-semibold text-slate-700">{review.title}</p> : null}
                  <p className="mt-2 text-sm text-slate-600">{review.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {activeSalesVariant ? `${activeSalesVariant.badge} + Tours` : t("transferLanding.other.title")}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {locale === "es"
              ? `Completa tu viaje en ${localizedLanding.hotelName} con tours`
              : locale === "fr"
              ? `Completez votre voyage a ${localizedLanding.hotelName} avec des tours`
              : `Complete your trip in ${localizedLanding.hotelName} with tours`}
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            {locale === "es"
              ? "Ademas del traslado privado, puedes vender actividades con recogida desde el hotel para aumentar conversion y ticket promedio."
              : locale === "fr"
              ? "En plus du transfert prive, vous pouvez vendre des activites avec pickup hotel pour augmenter conversion et revenu."
              : "Besides private transfer, you can sell hotel-pickup tours to increase conversion and average order value."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={hotelThingsToDoHref}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-800 hover:border-emerald-500 hover:text-emerald-700"
            >
              {locale === "es" ? "Ver tours desde este hotel" : locale === "fr" ? "Voir tours depuis cet hotel" : "See tours from this hotel"}
            </Link>
            <Link
              href={puntaCanaToursHref}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-800 hover:border-emerald-500 hover:text-emerald-700"
            >
              {locale === "es" ? "Tours Punta Cana" : locale === "fr" ? "Tours Punta Cana" : "Punta Cana Tours"}
            </Link>
            <Link
              href={toursHubHref}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-800 hover:border-emerald-500 hover:text-emerald-700"
            >
              {locale === "es" ? "Todas las excursiones" : locale === "fr" ? "Toutes les excursions" : "All excursions"}
            </Link>
          </div>
        </div>
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
  const variantParams = allLandings().flatMap((landing) =>
    TRANSFER_HOTEL_SALES_VARIANTS.map((variant) => ({
      landingSlug: buildTransferHotelVariantSlug(landing.landingSlug, variant.id)
    }))
  );
  return [...dynamicParams, ...manualParams, ...variantParams];
}
