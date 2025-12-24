import { PrismaClient } from "@prisma/client";

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
const MAX_TOP_HOTELS = 80;
const MAX_TOURS_PER_HOTEL = 35;
const MAX_TOTAL_COMBOS = 4000;

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

export async function buildSitemapEntries(): Promise<SitemapEntries> {
  const [tours, locations, bookings, countries, destinations, microZones] = await Promise.all([
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

  const tourEntries: RouteEntry[] = uniqueByUrl([
    { url: `${BASE_URL}/`, priority: 1.0 },
    { url: `${BASE_URL}/tours`, priority: 0.9 },
    { url: `${BASE_URL}/traslado`, priority: 0.9 },
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
    ...combos.map(({ url, priority }) => ({ url, priority }))
  ]);

  const hotelEntries: RouteEntry[] = uniqueByUrl([
    ...locations.map((location) => ({
      url: `${BASE_URL}/recogida/${location.slug}`,
      priority: 0.7
    })),
    ...trasladoHotelEntries
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
}
