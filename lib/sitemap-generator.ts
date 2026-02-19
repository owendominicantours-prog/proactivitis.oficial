import { PrismaClient } from "@prisma/client";
import { countryToPuntaCanaLandingSlugs, landingPages } from "./landing";
import { excursionKeywordLandings } from "../data/excursion-keyword-landings";
import { premiumTransferMarketLandings } from "@/data/premium-transfer-market-landings";
import { allLandings } from "@/data/transfer-landings";
import { buildTransferHotelVariantSlug, TRANSFER_HOTEL_SALES_VARIANTS } from "@/data/transfer-hotel-sales-variants";
import { TRANSFER_QUESTION_SALES_LANDINGS } from "@/data/transfer-question-sales-landings";
import { warnOnce } from "@/lib/logOnce";
import { TOUR_MARKET_INTENTS, buildTourMarketVariantSlug } from "@/lib/tourMarketVariants";
import { getIndexableTourMarketIntentIds, getIndexableTransferVariantIds } from "@/lib/seo-index-policy";

declare global {
  // eslint-disable-next-line no-var
  var __proactivitisSitemapPrisma: PrismaClient | undefined;
}

const prisma =
  globalThis.__proactivitisSitemapPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn"] : []
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__proactivitisSitemapPrisma = prisma;
}

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";
const BASE_URL = "https://proactivitis.com";
const TRANSLATED_PREFIXES = [
  "/tours",
  "/thingtodo/tours",
  "/things-to-do",
  "/recogida",
  "/excursiones-seguras-punta-cana",
  "/excursiones",
  "/punta-cana"
];
const TRANSLATED_ROOTS = ["/", "/tours", "/traslado"];
const TRANSLATION_LOCALES = ["en", "fr"];
const PICKUP_BASE_PATHS = {
  es: "/excursiones-con-recogida",
  en: "/excursions-with-hotel-pickup",
  fr: "/excursions-avec-pickup-hotel"
} as const;
const MAX_TOP_HOTELS = 80;
const MAX_TOURS_PER_HOTEL = 35;
const MAX_TOTAL_COMBOS = 4000;
const INDEXABLE_TRANSFER_VARIANT_IDS = new Set(getIndexableTransferVariantIds());
const INDEXABLE_TOUR_MARKET_INTENT_IDS = new Set(getIndexableTourMarketIntentIds());

const HOTEL_TRANSFER_SALES_VARIANT_URLS = allLandings().flatMap((landing) =>
  TRANSFER_HOTEL_SALES_VARIANTS.filter((variant) => INDEXABLE_TRANSFER_VARIANT_IDS.has(variant.id)).map((variant) => ({
    url: `${BASE_URL}/transfer/${buildTransferHotelVariantSlug(landing.landingSlug, variant.id)}`,
    priority: 0.72
  }))
);
const TRANSFER_QUESTION_SALES_URLS = TRANSFER_QUESTION_SALES_LANDINGS.map((landing) => ({
  url: `${BASE_URL}/punta-cana/premium-transfer-services/questions/${landing.slug}`,
  priority: 0.76
}));

export type RouteEntry = { url: string; priority: number };

export interface TourHotelHybridLink {
  tourSlug: string;
  hotelSlug: string;
  url: string;
}

export interface SitemapEntries {
  tourEntries: RouteEntry[];
  hotelEntries: RouteEntry[];
  hybridLinks: TourHotelHybridLink[];
}

const matchesInheritance = (
  tour: { countryId: string; destinationId?: string | null; microZoneId?: string | null; category?: string | null },
  location: { countryId: string; destinationId?: string | null; microZoneId?: string | null }
) => {
  if (tour.countryId !== location.countryId) return false;

  const category = normalize(tour.category);
  if (category.includes("nacional")) return true;
  if (category.includes("punta cana") && location.destinationId) return true;
  if (tour.microZoneId && location.microZoneId && tour.microZoneId === location.microZoneId) return true;
  if (tour.destinationId && location.destinationId && tour.destinationId === location.destinationId) return true;
  if (tour.destinationId && !tour.microZoneId && location.destinationId === tour.destinationId) return true;
  return false;
};

const uniqueByUrl = (entries: RouteEntry[]) => {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
};

const buildLocalizedEntries = (entries: RouteEntry[]) => {
  const localized: RouteEntry[] = [];
  for (const entry of entries) {
    if (!entry.url.startsWith(BASE_URL)) continue;
    const path = entry.url.replace(BASE_URL, "");
    const shouldTranslate =
      TRANSLATED_ROOTS.includes(path) || TRANSLATED_PREFIXES.some((prefix) => path.startsWith(prefix));
    if (!shouldTranslate) continue;
    for (const locale of TRANSLATION_LOCALES) {
      const localizedPath = path === "/" ? `/${locale}` : `/${locale}${path}`;
      localized.push({ url: `${BASE_URL}${localizedPath}`, priority: entry.priority });
    }
  }
  return localized;
};

export async function buildSitemapEntries(): Promise<SitemapEntries> {
  try {
    const [tours, locations, bookings, countries, destinations, microZones, transferHotels] = await Promise.all([
      prisma.tour.findMany({
        where: { status: "published" },
        select: {
          id: true,
          slug: true,
          countryId: true,
          destinationId: true,
          microZoneId: true,
          category: true,
          featured: true
        }
      }),
      prisma.location.findMany({
        include: {
          microZone: { select: { id: true } },
          destination: { select: { id: true, slug: true } }
        }
      }),
      prisma.booking.groupBy({
        by: ["hotel"],
        _count: { id: true }
      }),
      prisma.country.findMany({
        select: { slug: true }
      }),
      prisma.destination.findMany({
        select: {
          slug: true,
          country: { select: { slug: true } }
        }
      }),
      prisma.microZone.findMany({
        select: {
          slug: true,
          destination: {
            select: {
              slug: true,
              country: { select: { slug: true } }
            }
          }
        }
      }),
      prisma.transferLocation.findMany({
        where: { type: "HOTEL", active: true },
        select: { slug: true }
      })
    ]);

  const trafficMap = new Map<string, number>();
  bookings.forEach((entry) => {
    const key = normalize(entry.hotel);
    if (!key) return;
    trafficMap.set(key, (trafficMap.get(key) ?? 0) + entry._count.id);
  });

  const locationRank = locations
    .map((location) => ({
      location,
      traffic: trafficMap.get(normalize(location.name)) ?? 0
    }))
    .sort((a, b) => b.traffic - a.traffic)
    .slice(0, MAX_TOP_HOTELS);

  const combos: (RouteEntry & { tourSlug: string; locationSlug: string })[] = [];
  let totalCombos = 0;

  for (const { location } of locationRank) {
    if (totalCombos >= MAX_TOTAL_COMBOS) break;

    const eligible = tours
      .filter((tour) =>
        matchesInheritance(tour, {
          countryId: location.countryId,
          destinationId: location.destinationId,
          microZoneId: location.microZoneId
        })
      )
      .sort((a, b) => Number(b.featured) - Number(a.featured))
      .slice(0, MAX_TOURS_PER_HOTEL);

    for (const tour of eligible) {
      if (totalCombos >= MAX_TOTAL_COMBOS) break;
      combos.push({
        url: `${BASE_URL}/tours/${tour.slug}/recogida/${location.slug}`,
        priority: 0.6,
        tourSlug: tour.slug,
        locationSlug: location.slug
      });
      totalCombos += 1;
    }
  }

  const trasladoHotelEntries: RouteEntry[] = locations
    .filter((location) => location.destination?.slug === "punta-cana")
    .map((location) => ({
      url: `${BASE_URL}/traslado/punta-cana/to-${location.slug}`,
      priority: 0.65
    }));

  const baseEntries: RouteEntry[] = [
    { url: `${BASE_URL}/`, priority: 1.0 },
    { url: `${BASE_URL}/tours`, priority: 0.9 },
    { url: `${BASE_URL}/traslado`, priority: 0.9 },
    { url: `${BASE_URL}/hoteles`, priority: 0.85 },
    { url: `${BASE_URL}/en/hotels`, priority: 0.85 },
    { url: `${BASE_URL}/fr/hotels`, priority: 0.85 },
    { url: `${BASE_URL}/punta-cana/tours`, priority: 0.85 },
    { url: `${BASE_URL}/punta-cana/traslado`, priority: 0.85 },
    { url: `${BASE_URL}/punta-cana/premium-transfer-services`, priority: 0.86 },
    ...premiumTransferMarketLandings.map((landing) => ({
      url: `${BASE_URL}/punta-cana/premium-transfer-services/${landing.slug}`,
      priority: 0.74
    })),
    ...TRANSFER_QUESTION_SALES_URLS,
    ...HOTEL_TRANSFER_SALES_VARIANT_URLS,
    ...tours.map((tour) => ({
      url: `${BASE_URL}/tours/${tour.slug}`,
      priority: 0.8
    })),
    ...countries.map((country) => ({
      url: `${BASE_URL}/traslado/${country.slug}`,
      priority: 0.7
    })),
    ...destinations.map((destination) => ({
      url: `${BASE_URL}/traslado/${destination.country.slug}/${destination.slug}`,
      priority: 0.65
    })),
    ...microZones.map((microZone) => ({
      url: `${BASE_URL}/traslado/${microZone.destination.country.slug}/${microZone.destination.slug}/${microZone.slug}`,
      priority: 0.6
    })),
    ...trasladoHotelEntries,
    ...combos.map(({ url, priority }) => ({ url, priority })),
    ...landingPages
      .filter((landing) => countryToPuntaCanaLandingSlugs.has(landing.slug) || Boolean(landing.path))
      .map((landing) => ({
        url: `${BASE_URL}${landing.path ?? `/landing/${landing.slug}`}`,
        priority: countryToPuntaCanaLandingSlugs.has(landing.slug) ? 0.72 : 0.7
      })),
    ...tours.flatMap((tour) =>
      TOUR_MARKET_INTENTS.filter((intent) => INDEXABLE_TOUR_MARKET_INTENT_IDS.has(intent.id)).map((intent) => ({
        url: `${BASE_URL}/thingtodo/tours/${buildTourMarketVariantSlug(tour.slug, intent.id)}`,
        priority: 0.66
      }))
    ),
    ...excursionKeywordLandings.map((landing) => ({
      url: `${BASE_URL}/excursiones/${landing.landingSlug}`,
      priority: 0.7
    }))
  ];

  const localizedEntries = buildLocalizedEntries(baseEntries);
  const tourEntries: RouteEntry[] = uniqueByUrl([...baseEntries, ...localizedEntries]);

  const recogidaEntries: RouteEntry[] = locations.map((location) => ({
    url: `${BASE_URL}/recogida/${location.slug}`,
    priority: 0.7
  }));
  const localizedRecogidaEntries = buildLocalizedEntries(recogidaEntries);

  const pickupHotelEntries: RouteEntry[] = locations
    .filter((location) => location.destination?.slug === "punta-cana")
    .map((location) => ({
      url: `${BASE_URL}${PICKUP_BASE_PATHS.es}/${location.slug}`,
      priority: 0.7
    }));
  const pickupHotelLocalizedEntries: RouteEntry[] = pickupHotelEntries.flatMap((entry) => {
    const path = entry.url.replace(BASE_URL, "");
    const slug = path.replace(PICKUP_BASE_PATHS.es, "");
    return [
      { url: `${BASE_URL}${PICKUP_BASE_PATHS.en}${slug}`, priority: entry.priority },
      { url: `${BASE_URL}${PICKUP_BASE_PATHS.fr}${slug}`, priority: entry.priority }
    ];
  });

  const hotelEntries: RouteEntry[] = uniqueByUrl([
    ...recogidaEntries,
    ...localizedRecogidaEntries,
    ...pickupHotelEntries,
    ...pickupHotelLocalizedEntries,
    ...trasladoHotelEntries,
    ...transferHotels.flatMap((hotel) => [
      { url: `${BASE_URL}/hoteles/${hotel.slug}`, priority: 0.76 },
      { url: `${BASE_URL}/en/hotels/${hotel.slug}`, priority: 0.76 },
      { url: `${BASE_URL}/fr/hotels/${hotel.slug}`, priority: 0.76 },
      { url: `${BASE_URL}/things-to-do/${hotel.slug}`, priority: 0.72 },
      { url: `${BASE_URL}/en/things-to-do/${hotel.slug}`, priority: 0.72 },
      { url: `${BASE_URL}/fr/things-to-do/${hotel.slug}`, priority: 0.72 }
    ])
  ]);

    return {
      tourEntries,
      hotelEntries,
      hybridLinks: combos.map(({ tourSlug, locationSlug, url }) => ({
        tourSlug,
        hotelSlug: locationSlug,
        url
      }))
    };
  } catch (error) {
    warnOnce("sitemap-generator-db-fallback", "[sitemap-generator] Falling back to minimal sitemap due to DB error", error);
    const baseEntries: RouteEntry[] = [
      { url: `${BASE_URL}/`, priority: 1.0 },
      { url: `${BASE_URL}/tours`, priority: 0.9 },
      { url: `${BASE_URL}/traslado`, priority: 0.9 },
      { url: `${BASE_URL}/hoteles`, priority: 0.85 },
      { url: `${BASE_URL}/en/hotels`, priority: 0.85 },
      { url: `${BASE_URL}/fr/hotels`, priority: 0.85 },
      { url: `${BASE_URL}/punta-cana/premium-transfer-services`, priority: 0.86 },
      ...premiumTransferMarketLandings.map((landing) => ({
        url: `${BASE_URL}/punta-cana/premium-transfer-services/${landing.slug}`,
        priority: 0.74
      })),
      ...TRANSFER_QUESTION_SALES_URLS,
      ...HOTEL_TRANSFER_SALES_VARIANT_URLS,
      ...landingPages
        .filter((landing) => countryToPuntaCanaLandingSlugs.has(landing.slug) || Boolean(landing.path))
        .map((landing) => ({
          url: `${BASE_URL}${landing.path ?? `/landing/${landing.slug}`}`,
          priority: countryToPuntaCanaLandingSlugs.has(landing.slug) ? 0.72 : 0.7
        })),
      ...excursionKeywordLandings.map((landing) => ({
        url: `${BASE_URL}/excursiones/${landing.landingSlug}`,
        priority: 0.7
      }))
    ];
    const tourEntries: RouteEntry[] = uniqueByUrl([...baseEntries, ...buildLocalizedEntries(baseEntries)]);
    return { tourEntries, hotelEntries: [], hybridLinks: [] };
  }
}
