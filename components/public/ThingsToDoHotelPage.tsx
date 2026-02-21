import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  BedDouble,
  Dumbbell,
  Martini,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Utensils,
  Waves,
  Wifi
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import FeaturedToursSection from "@/components/public/FeaturedToursSection";
import StructuredData from "@/components/schema/StructuredData";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import HotelGallerySlider from "@/components/public/HotelGallerySlider";
import HotelQuoteWidget from "@/components/public/HotelQuoteWidget";
import { Locale, translate } from "@/lib/translations";
import { getHotelLandingOverrides } from "@/lib/siteContent";
import { normalizeTextDeep } from "@/lib/text-format";
import { getPriceValidUntil } from "@/lib/seo";

const BASE_URL = "https://proactivitis.com";
const FALLBACK_IMAGE = "/transfer/mini van.png";

type RouteBase = "things-to-do" | "hoteles";

const DEFAULT_AMENITIES = ["Wi-Fi Gratis", "Todo Incluido", "Piscina", "Club de Ninos", "Gimnasio"];
const BAHIA_ACTIVITY_COPY: Record<
  Locale,
  {
    sectionTitle: string;
    sectionSubtitle: string;
    cards: Array<{ title: string; body: string; icon: "waves" | "utensils" | "dumbbell" | "martini" | "users" | "sparkles" }>;
    plansTitle: string;
    plans: Array<{ title: string; body: string }>;
  }
> = {
  es: {
    sectionTitle: "Que hacer en Bahia Principe y alrededor",
    sectionSubtitle:
      "Planifica dias completos sin perder tiempo: playa, gastronomia, bienestar, nightlife y excursiones premium desde el mismo hotel.",
    cards: [
      { title: "Playa y piscinas", body: "Bloques de manana en playa y tarde en piscinas tipo lago con zonas de relax y servicio cercano.", icon: "waves" },
      { title: "Gastronomia por especialidad", body: "Combina buffet + restaurantes tematicos para variar cada noche sin repetir experiencia.", icon: "utensils" },
      { title: "Wellness y deporte", body: "Rutina flexible entre gimnasio, tenis, actividades acuaticas y spa para equilibrar descanso y accion.", icon: "dumbbell" },
      { title: "Bares y ambiente nocturno", body: "Cierra el dia con bares, musica y areas de entretenimiento dentro del complejo.", icon: "martini" },
      { title: "Plan familiar real", body: "Programa para ninos y teens, mientras adultos mantienen agenda de playa, spa o tours.", icon: "users" },
      { title: "Excursiones top desde el resort", body: "Coordina Saona, catamaran, buggy y city tours con recogida y retorno al hotel.", icon: "sparkles" }
    ],
    plansTitle: "Planes recomendados (3, 5 y 7 noches)",
    plans: [
      { title: "3 noches", body: "Llegada + playa/piscina + 1 excursion corta + cena de especialidad." },
      { title: "5 noches", body: "2 dias resort + 2 excursiones (mar y aventura) + 1 noche de entretenimiento interno." },
      { title: "7 noches", body: "Semana completa con ritmo equilibrado: descanso, tours premium, gastronomia y wellness." }
    ]
  },
  en: {
    sectionTitle: "Things to do at Bahia Principe and nearby",
    sectionSubtitle:
      "Build full days without friction: beach, dining, wellness, nightlife, and premium excursions departing from your resort.",
    cards: [
      { title: "Beach and pool flow", body: "Morning beach blocks and afternoon lagoon-style pools with easy access service.", icon: "waves" },
      { title: "Specialty dining strategy", body: "Mix buffet and specialty restaurants to keep each night different.", icon: "utensils" },
      { title: "Wellness and sports", body: "Balance rest and action with gym, tennis, water activities, and spa sessions.", icon: "dumbbell" },
      { title: "Bars and night vibe", body: "Finish your day with bars, music, and in-resort nightlife options.", icon: "martini" },
      { title: "Family-first planning", body: "Kids and teen areas let adults keep their own beach, spa, or tour schedule.", icon: "users" },
      { title: "Top tours from the resort", body: "Book Saona, catamaran, buggy, and city tours with hotel pickup/return.", icon: "sparkles" }
    ],
    plansTitle: "Suggested plans (3, 5 and 7 nights)",
    plans: [
      { title: "3 nights", body: "Arrival + beach/pool + one short tour + one specialty dinner." },
      { title: "5 nights", body: "2 resort days + 2 excursions (ocean and adventure) + 1 in-resort night activity." },
      { title: "7 nights", body: "Full-week rhythm: recovery, premium tours, dining rotation, and wellness." }
    ]
  },
  fr: {
    sectionTitle: "Que faire a Bahia Principe et autour",
    sectionSubtitle:
      "Construisez des journees completes sans perte de temps: plage, gastronomie, wellness, nightlife et excursions premium depuis l hotel.",
    cards: [
      { title: "Plage et piscines", body: "Matin plage, apres-midi piscines type lagon avec zones de detente.", icon: "waves" },
      { title: "Gastronomie par specialite", body: "Combinez buffet et restaurants thematiques pour varier chaque soir.", icon: "utensils" },
      { title: "Wellness et sport", body: "Equilibrez repos et action entre gym, tennis, activites aquatiques et spa.", icon: "dumbbell" },
      { title: "Bars et ambiance de nuit", body: "Terminez la journee avec bars, musique et divertissement du resort.", icon: "martini" },
      { title: "Organisation famille", body: "Espaces enfants/ados pendant que les adultes gardent leur planning personnel.", icon: "users" },
      { title: "Excursions depuis le resort", body: "Saona, catamaran, buggy et city tour avec pickup/retour hotel.", icon: "sparkles" }
    ],
    plansTitle: "Plans recommandes (3, 5 et 7 nuits)",
    plans: [
      { title: "3 nuits", body: "Arrivee + plage/piscine + une excursion courte + un diner specialite." },
      { title: "5 nuits", body: "2 jours resort + 2 excursions (mer et aventure) + 1 soiree animation." },
      { title: "7 nuits", body: "Semaine complete: repos, tours premium, gastronomie et wellness." }
    ]
  }
};
const UI_COPY: Record<
  Locale,
  {
    hotelTag: string;
    rating: string;
    from: string;
    booking: string;
    bookingValue: string;
    map: string;
    highlights: string;
    whyBook: string;
    roomTypes: string;
    roomLabel: string;
    roomFallback: string;
    roomHint: string;
    amenities: string;
    policies: string;
    checkIn: string;
    checkOut: string;
    cancellation: string;
    groups: string;
    card1Title: string;
    card1Body: string;
    card2Title: string;
    card2Body: string;
    card3Title: string;
    card3Body: string;
  }
> = {
  es: {
    hotelTag: "Hotel en Punta Cana",
    rating: "Valoracion",
    from: "Tarifa",
    booking: "Reservacion",
    bookingValue: "Confirmacion rapida",
    map: "Ver en Mapa",
    highlights: "Lo mas destacado",
    whyBook: "Por que reservar con Proactivitis",
    roomTypes: "Tipos de Habitaciones",
    roomLabel: "Habitacion",
    roomFallback: "Junior Suite - Master Suite - Family Suite. Tarifas desde temporada disponible.",
    roomHint: "Consulta disponibilidad exacta por fecha y ocupacion.",
    amenities: "Servicios y Comodidades",
    policies: "Politicas del Hotel",
    checkIn: "Check-in",
    checkOut: "Check-out",
    cancellation: "Politica de Cancelacion",
    groups: "Informacion para Grupos",
    card1Title: "Tarifa competitiva",
    card1Body: "Negociamos disponibilidad real y opcion de paquete con traslados.",
    card2Title: "Asesoria humana",
    card2Body: "Atencion directa por WhatsApp para ajustar fechas, ninos y habitaciones.",
    card3Title: "Soporte local",
    card3Body: "Equipo en destino para coordinar cambios y extras sin friccion."
  },
  en: {
    hotelTag: "Punta Cana Hotel",
    rating: "Rating",
    from: "Rate",
    booking: "Booking",
    bookingValue: "Fast confirmation",
    map: "View on Map",
    highlights: "Highlights",
    whyBook: "Why book with Proactivitis",
    roomTypes: "Room Types",
    roomLabel: "Room",
    roomFallback: "Junior Suite - Master Suite - Family Suite. Seasonal rates available.",
    roomHint: "Ask for exact availability by date and occupancy.",
    amenities: "Amenities",
    policies: "Hotel Policies",
    checkIn: "Check-in",
    checkOut: "Check-out",
    cancellation: "Cancellation Policy",
    groups: "Group Information",
    card1Title: "Competitive rates",
    card1Body: "We secure real inventory and package options with transfers.",
    card2Title: "Human support",
    card2Body: "Direct WhatsApp assistance for dates, kids, and room setup.",
    card3Title: "Local team",
    card3Body: "On-site support for changes and add-ons without friction."
  },
  fr: {
    hotelTag: "Hotel a Punta Cana",
    rating: "Evaluation",
    from: "Tarif",
    booking: "Reservation",
    bookingValue: "Confirmation rapide",
    map: "Voir sur la carte",
    highlights: "Points forts",
    whyBook: "Pourquoi reserver avec Proactivitis",
    roomTypes: "Types de chambres",
    roomLabel: "Chambre",
    roomFallback: "Junior Suite - Master Suite - Family Suite. Tarifs saisonniers disponibles.",
    roomHint: "Demandez la disponibilite exacte selon les dates et l'occupation.",
    amenities: "Services et commodites",
    policies: "Politiques de l'hotel",
    checkIn: "Check-in",
    checkOut: "Check-out",
    cancellation: "Politique d'annulation",
    groups: "Information groupes",
    card1Title: "Tarif competitif",
    card1Body: "Nous obtenons une disponibilite reelle et des packs avec transferts.",
    card2Title: "Support humain",
    card2Body: "Assistance WhatsApp directe pour dates, enfants et chambres.",
    card3Title: "Equipe locale",
    card3Body: "Equipe sur place pour les changements et extras sans friction."
  }
};

const buildTransferSlug = (hotelSlug: string) => `punta-cana-international-airport-puj-to-${hotelSlug}`;

const getHotel = (hotelSlug: string) =>
  prisma.transferLocation.findFirst({
    where: { slug: hotelSlug, type: "HOTEL" },
    select: { name: true, slug: true, address: true, description: true, heroImage: true }
  });

const buildLocalizedPath = (hotelSlug: string, locale: Locale, routeBase: RouteBase) => {
  const localizedRoute =
    routeBase === "hoteles" ? (locale === "es" ? "hoteles" : "hotels") : "things-to-do";
  return locale === "es" ? `/${localizedRoute}/${hotelSlug}` : `/${locale}/${localizedRoute}/${hotelSlug}`;
};

const buildCanonical = (hotelSlug: string, locale: Locale, routeBase: RouteBase) =>
  `${BASE_URL}${buildLocalizedPath(hotelSlug, locale, routeBase)}`;

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as string[]) ?? [];
  } catch {
    return [];
  }
};

const resolveTourImage = (heroImage?: string | null, gallery?: string | null) => {
  if (heroImage) return heroImage;
  const parsed = parseGallery(gallery);
  return parsed[0] ?? null;
};

const pickByHash = <T,>(items: T[], seed: string) => {
  if (items.length === 0) return null;
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return items[Math.abs(hash) % items.length] ?? null;
};

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return `${BASE_URL}${FALLBACK_IMAGE}`;
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${BASE_URL}${normalized}`;
};

const buildKeywords = (hotelName: string, locale: Locale) => {
  const base =
    locale === "es"
      ? ["hotel en Punta Cana", "todo incluido", "reserva hotel"]
      : locale === "fr"
        ? ["hotel a Punta Cana", "tout compris", "meilleur prix"]
        : ["hotel in Punta Cana", "all inclusive", "best rate"];

  return Array.from(new Set([hotelName, `${hotelName} Punta Cana`, "Punta Cana", ...base, "Proactivitis"]));
};

const buildStars = (value?: string) => {
  const parsed = Number(value || 5);
  const clamped = Number.isFinite(parsed) ? Math.max(1, Math.min(5, Math.round(parsed))) : 5;
  return "\u2605".repeat(clamped);
};

const parseNumber = (value?: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getAmenityIcon = (label: string) => {
  const text = label.toLowerCase();
  if (text.includes("wifi") || text.includes("wi-fi") || text.includes("internet")) return Wifi;
  if (text.includes("all inclusive") || text.includes("todo incluido") || text.includes("bar")) return Martini;
  if (text.includes("pool") || text.includes("piscina") || text.includes("beach") || text.includes("playa")) return Waves;
  if (text.includes("kids") || text.includes("ninos") || text.includes("children") || text.includes("familia")) return Users;
  if (text.includes("gym") || text.includes("gimnasio") || text.includes("fitness")) return Dumbbell;
  if (text.includes("restaurant") || text.includes("restaurante") || text.includes("food") || text.includes("comida")) return Utensils;
  return ShieldCheck;
};

const getBahiaCardIcon = (icon: "waves" | "utensils" | "dumbbell" | "martini" | "users" | "sparkles") => {
  if (icon === "waves") return Waves;
  if (icon === "utensils") return Utensils;
  if (icon === "dumbbell") return Dumbbell;
  if (icon === "martini") return Martini;
  if (icon === "users") return Users;
  return Sparkles;
};

const categorizeAmenities = (items: string[]) => {
  const buckets: Record<string, string[]> = {
    "Resort y Confort": [],
    "Gastronomia y Bares": [],
    "Bienestar y Deporte": [],
    "Familias y Ninos": [],
    "Servicios Premium": []
  };

  for (const item of items) {
    const text = item.toLowerCase();
    if (text.includes("restaurant") || text.includes("bar") || text.includes("buffet") || text.includes("desayuno")) {
      buckets["Gastronomia y Bares"].push(item);
      continue;
    }
    if (
      text.includes("gimnas") ||
      text.includes("spa") ||
      text.includes("masaje") ||
      text.includes("tenis") ||
      text.includes("golf") ||
      text.includes("aerobic")
    ) {
      buckets["Bienestar y Deporte"].push(item);
      continue;
    }
    if (text.includes("nino") || text.includes("kids") || text.includes("teen") || text.includes("guarderia")) {
      buckets["Familias y Ninos"].push(item);
      continue;
    }
    if (
      text.includes("mayordomo") ||
      text.includes("conserje") ||
      text.includes("conferenc") ||
      text.includes("banquete") ||
      text.includes("negocio")
    ) {
      buckets["Servicios Premium"].push(item);
      continue;
    }
    buckets["Resort y Confort"].push(item);
  }

  return Object.entries(buckets).filter(([, values]) => values.length > 0);
};

const ensureSpanishMeta = (value: string, hotelName: string) => {
  const base = value.trim() || `${hotelName} Todo Incluido en Punta Cana al Mejor Precio.`;
  const required = ["Todo Incluido", "Punta Cana", "Mejor Precio"];
  const missing = required.filter((token) => !base.toLowerCase().includes(token.toLowerCase()));
  return `${base}${missing.length ? ` ${missing.join(" ")}` : ""}`.slice(0, 155);
};

export async function buildThingsToDoMetadata(
  hotelSlug: string,
  locale: Locale,
  routeBase: RouteBase = "things-to-do"
): Promise<Metadata> {
  const hotel = await getHotel(hotelSlug);
  if (!hotel) return {};
  const overrides = normalizeTextDeep(await getHotelLandingOverrides(hotelSlug, locale));

  const fallbackTitle =
    locale === "es"
      ? `${hotel.name} - Reserva en Punta Cana al Mejor Precio`
      : locale === "fr"
        ? `${hotel.name} - Reservation a Punta Cana au Meilleur Prix`
        : `${hotel.name} - Book in Punta Cana at the Best Price`;

  const fallbackDescription = translate(locale, "thingsToDo.meta.description", { hotel: hotel.name }).trim();
  const seoTitle = (overrides.seoTitle?.trim() || fallbackTitle).trim();
  const rawDescription = (overrides.seoDescription?.trim() || fallbackDescription).trim();
  const seoDescription = locale === "es" ? ensureSpanishMeta(rawDescription, hotel.name) : rawDescription;
  const canonical = buildCanonical(hotel.slug, locale, routeBase);

  const tourImages = await prisma.tour.findMany({
    where: { status: "published" },
    select: { heroImage: true, gallery: true },
    orderBy: { createdAt: "desc" },
    take: 12
  });

  const pickedTour = pickByHash(tourImages, hotel.slug);
  const tourImage = pickedTour ? resolveTourImage(pickedTour.heroImage, pickedTour.gallery) : null;
  const imageUrl = toAbsoluteUrl(overrides.heroImage?.trim() || hotel.heroImage || tourImage);

  return {
    title: `${seoTitle} | Proactivitis`,
    description: seoDescription,
    keywords: buildKeywords(hotel.name, locale),
    alternates: {
      canonical,
      languages: {
        es: buildLocalizedPath(hotel.slug, "es", routeBase),
        en: buildLocalizedPath(hotel.slug, "en", routeBase),
        fr: buildLocalizedPath(hotel.slug, "fr", routeBase)
      }
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      images: [{ url: imageUrl }]
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [imageUrl]
    }
  };
}

export async function ThingsToDoHotelPage({
  hotelSlug,
  locale,
  routeBase = "things-to-do"
}: {
  hotelSlug: string;
  locale: Locale;
  routeBase?: RouteBase;
}) {
  const hotel = await getHotel(hotelSlug);
  if (!hotel) return notFound();

  const overrides = normalizeTextDeep(await getHotelLandingOverrides(hotelSlug, locale));

  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);
  const ui = normalizeTextDeep(UI_COPY[locale] ?? UI_COPY.es);

  const transferSlug = buildTransferSlug(hotel.slug);
  const allTransferLandings = allLandings();
  const primaryTransfer =
    allTransferLandings.find((landing) => landing.hotelSlug === hotel.slug) ?? {
      landingSlug: transferSlug,
      hotelName: hotel.name,
      heroSubtitle: t("thingsToDo.transfers.fallback"),
      heroImage: "/transfer/mini van.png",
      heroImageAlt: `Transfer a ${hotel.name}`
    };

  const secondaryTransfers = allTransferLandings.filter((landing) => landing.hotelSlug !== hotel.slug).slice(0, 2);
  const transferCards = [primaryTransfer, ...secondaryTransfers];
  const transferReviewRows = await prisma.transferReview.groupBy({
    by: ["transferLandingSlug"],
    where: {
      status: "APPROVED",
      transferLandingSlug: { in: transferCards.map((item) => item.landingSlug) }
    },
    _count: { _all: true },
    _avg: { rating: true }
  });
  const transferReviewSummary = new Map(
    transferReviewRows
      .filter((row) => Boolean(row.transferLandingSlug))
      .map((row) => [
        row.transferLandingSlug as string,
        { count: row._count._all, avg: Number(row._avg.rating ?? 0) }
      ])
  );

  const heroTitle =
    overrides.heroTitle?.trim() ||
    (locale === "es"
      ? `${hotel.name} - Reserva en Punta Cana al Mejor Precio`
      : locale === "fr"
        ? `${hotel.name} - Reservation a Punta Cana au Meilleur Prix`
        : `${hotel.name} - Book in Punta Cana at the Best Price`);

  const heroSubtitle = overrides.heroSubtitle?.trim() || t("thingsToDo.subtitle", { hotel: hotel.name });
  const overviewTitle = overrides.overviewTitle?.trim() || t("thingsToDo.overview.title");

  const descriptionParagraphs = [
    overrides.description1?.trim() ||
      ((overrides as { overviewBody1?: string }).overviewBody1 ?? "").trim() ||
      hotel.description?.trim() ||
      t("thingsToDo.overview.body1", { hotel: hotel.name }),
    overrides.description2?.trim() ||
      ((overrides as { overviewBody2?: string }).overviewBody2 ?? "").trim() ||
      t("thingsToDo.overview.body2"),
    overrides.description3?.trim() || ""
  ].filter(Boolean);

  const highlights =
    overrides.highlights?.filter(Boolean) ??
    [overrides.bullet1?.trim(), overrides.bullet2?.trim(), overrides.bullet3?.trim(), overrides.bullet4?.trim()].filter(
      Boolean
    );

  const effectiveHighlights =
    highlights.length > 0
      ? highlights
      : [
          t("thingsToDo.overview.bullets.1"),
          t("thingsToDo.overview.bullets.2"),
          t("thingsToDo.overview.bullets.3"),
          t("thingsToDo.overview.bullets.4")
        ];

  const galleryImages = [overrides.heroImage?.trim() || hotel.heroImage || "", ...(overrides.galleryImages ?? [])].filter(
    Boolean
  );

  const amenities = overrides.amenities?.filter(Boolean) ?? DEFAULT_AMENITIES;
  const amenityGroups = categorizeAmenities(amenities);
  const roomTypes = (overrides.roomTypes ?? []).filter((item) => item?.name);

  const stars = buildStars(overrides.stars);
  const locationLabel = overrides.locationLabel?.trim() || hotel.address?.trim() || "Bavaro, Punta Cana";
  const mapUrl =
    overrides.mapUrl?.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name)}`;
  const priceFrom = parseNumber(overrides.priceFromUSD);
  const reviewRating = parseNumber(overrides.reviewRating);
  const reviewCount = parseNumber(overrides.reviewCount);

  const canonicalUrl = buildCanonical(hotel.slug, locale, routeBase);
  const isBahiaHotel = hotel.slug.startsWith("bahia-principe-");
  const bahiaActivityPack = BAHIA_ACTIVITY_COPY[locale] ?? BAHIA_ACTIVITY_COPY.es;
  const priceValidUntil = getPriceValidUntil();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Hotel",
        "@id": `${canonicalUrl}#hotel`,
        name: hotel.name,
        description: descriptionParagraphs[0],
        url: canonicalUrl,
        image: galleryImages.map((image) => toAbsoluteUrl(image)),
        starRating: {
          "@type": "Rating",
          ratingValue: parseNumber(overrides.stars) ?? 5,
          bestRating: 5
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: locationLabel,
          addressCountry: "DO"
        },
        amenityFeature: amenities.map((name) => ({
          "@type": "LocationFeatureSpecification",
          name,
          value: true
        })),
        aggregateRating:
          reviewRating && reviewCount
            ? {
                "@type": "AggregateRating",
                ratingValue: reviewRating,
                reviewCount
              }
            : undefined,
        makesOffer: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: priceFrom ?? undefined,
          availability: "https://schema.org/InStock",
          priceValidUntil,
          url: canonicalUrl,
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
      }
    ]
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-3 py-6 sm:px-4 md:space-y-12 md:py-10">
      <LandingViewTracker landingSlug={`${routeBase}/${hotel.slug}`} />
      <StructuredData data={schema} />

      <a
        href="#hotel-quote-widget"
        className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-white/20 bg-slate-900/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-xl backdrop-blur md:hidden"
      >
        {overrides.quoteCta?.trim() || "Consultar Disponibilidad"}
      </a>

      <section className="grid gap-4 md:gap-6 xl:grid-cols-[1.7fr,1fr]">
        <div className="space-y-4 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-5 text-white shadow-sm md:space-y-5 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              {ui.hotelTag}
            </span>
            <span className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-semibold text-amber-100">{stars}</span>
          </div>

          <h1 className="text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-5xl">{heroTitle}</h1>
          <p className="max-w-3xl text-sm text-slate-100 md:text-base">{heroSubtitle}</p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-100">{ui.rating}</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-white">
                <Star className="h-4 w-4 text-amber-300" />
                {reviewRating ? `${reviewRating}/5${reviewCount ? ` (${reviewCount})` : ""}` : "Top Rated"}
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-100">{ui.from}</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {priceFrom ? `US$${priceFrom}` : locale === "es" ? "Mejor tarifa" : locale === "fr" ? "Meilleur tarif" : "Best rate"}
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-100">{ui.booking}</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-white">
                <BadgeCheck className="h-4 w-4 text-emerald-300" />
                {ui.bookingValue}
              </p>
            </div>
          </div>

          <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm font-medium text-cyan-100 underline underline-offset-4">
            {locationLabel} - {ui.map}
          </a>
          <div className="rounded-2xl bg-white p-1.5 text-slate-900 md:p-3">
            <HotelGallerySlider images={galleryImages} hotelName={hotel.name} />
          </div>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <HotelQuoteWidget
            hotelSlug={hotel.slug}
            hotelName={hotel.name}
            locale={locale}
            ctaLabel={overrides.quoteCta?.trim() || undefined}
          />
        </aside>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold text-slate-900">{overviewTitle}</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          {descriptionParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <h3 className="mt-8 text-lg font-semibold text-slate-900">{ui.highlights}</h3>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          {effectiveHighlights.map((item) => (
            <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {isBahiaHotel ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-10">
          <h2 className="text-2xl font-semibold text-slate-900">{bahiaActivityPack.sectionTitle}</h2>
          <p className="mt-3 text-sm text-slate-600">{bahiaActivityPack.sectionSubtitle}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {bahiaActivityPack.cards.map((card) => {
              const Icon = getBahiaCardIcon(card.icon);
              return (
                <article key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Icon className="h-4 w-4 text-emerald-600" />
                    {card.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{card.body}</p>
                </article>
              );
            })}
          </div>
          <h3 className="mt-8 text-lg font-semibold text-slate-900">{bahiaActivityPack.plansTitle}</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {bahiaActivityPack.plans.map((plan) => (
              <article key={plan.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{plan.title}</p>
                <p className="mt-2 text-sm text-slate-600">{plan.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold">{ui.whyBook}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm font-semibold">{ui.card1Title}</p>
            <p className="mt-1 text-xs text-slate-200">{ui.card1Body}</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm font-semibold">{ui.card2Title}</p>
            <p className="mt-1 text-xs text-slate-200">{ui.card2Body}</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm font-semibold">{ui.card3Title}</p>
            <p className="mt-1 text-xs text-slate-200">{ui.card3Body}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold text-slate-900">{ui.roomTypes}</h2>
        {roomTypes.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roomTypes.map((room) => (
              <article key={`${room.name}-${room.image || room.priceFrom || ""}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {room.image ? <HotelGallerySlider images={[room.image]} hotelName={room.name} /> : null}
                <div className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{ui.roomLabel}</p>
                  <h3 className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                    <BedDouble className="h-4 w-4 text-slate-600" />
                    {room.name}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{room.priceFrom || "Cotizacion personalizada"}</p>
                  <p className="mt-1 text-xs text-slate-500">{ui.roomHint}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">{ui.roomFallback}</p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold text-slate-900">{ui.amenities}</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {amenityGroups.map(([groupName, groupItems]) => (
            <div key={groupName} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">{groupName}</h3>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                {groupItems.map((item) => {
                  const Icon = getAmenityIcon(item);
                  return (
                    <div key={item} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
                      <Icon className="h-4 w-4 shrink-0 text-slate-700" />
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold text-slate-900">{ui.policies}</h2>
        <div className="mt-4 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
          <p>
            <span className="font-semibold text-slate-900">{ui.checkIn}:</span> {overrides.checkInTime?.trim() || "3:00 PM"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">{ui.checkOut}:</span> {overrides.checkOutTime?.trim() || "12:00 PM"}
          </p>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{ui.cancellation}:</span>{" "}
          {overrides.cancellationPolicy?.trim() ||
            "Las condiciones pueden variar por temporada. Solicita cotizacion para confirmar reglas aplicables."}
        </p>
        <p className="mt-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{ui.groups}:</span>{" "}
          {overrides.groupPolicy?.trim() || "Precios especiales para grupos de mas de 10 personas."}
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.tours.eyebrow")}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{overrides.toursTitle?.trim() || t("thingsToDo.tours.title")}</h2>
        </div>
        <FeaturedToursSection locale={locale} />
      </section>

      <section className="space-y-4 pb-20 md:pb-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.transfers.eyebrow")}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{overrides.transfersTitle?.trim() || t("thingsToDo.transfers.title")}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {transferCards.map((landing) => (
            <Link
              key={landing.landingSlug}
              href={`/transfer/${landing.landingSlug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={landing.heroImage || "/transfer/mini van.png"}
                  alt={landing.heroImageAlt || landing.hotelName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.transfers.cardTag")}</p>
                <h3 className="text-base font-semibold text-slate-900">{landing.hotelName}</h3>
                {transferReviewSummary.has(landing.landingSlug) ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
                    ★ {transferReviewSummary.get(landing.landingSlug)!.avg.toFixed(1)} ·{" "}
                    {transferReviewSummary.get(landing.landingSlug)!.count} {locale === "fr" ? "avis" : "resenas"}
                  </p>
                ) : (
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {locale === "es" ? "Sin resenas aun" : locale === "fr" ? "Pas encore d'avis" : "No reviews yet"}
                  </p>
                )}
                <p className="text-sm text-slate-600">
                  {locale === "es" ? landing.heroSubtitle : t("thingsToDo.transfers.cardSubtitle", { hotel: landing.hotelName })}
                </p>
                <span className="mt-auto text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">{t("thingsToDo.transfers.cardCta")}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
