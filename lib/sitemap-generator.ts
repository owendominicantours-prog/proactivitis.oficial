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

export async function buildSitemapEntries() {
  const [tours, locations, bookings] = await Promise.all([
    prisma.tour.findMany({
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
        destination: { select: { id: true } }
      }
    }),
    prisma.booking.groupBy({
      by: ["hotel"],
      _count: { id: true }
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

  const combos: { url: string; priority: number }[] = [];
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
        priority: 0.6
      });
      totalCombos += 1;
    }
  }

  const routeEntries: { url: string; priority: number }[] = [
    { url: `${BASE_URL}/`, priority: 1.0 },
    { url: `${BASE_URL}/tours`, priority: 0.9 },
    ...tours.map((tour) => ({
      url: `${BASE_URL}/tours/${tour.slug}`,
      priority: 0.8
    })),
    ...locations.map((location) => ({
      url: `${BASE_URL}/recogida/${location.slug}`,
      priority: 0.7
    })),
    ...combos
  ];

  return routeEntries;
}
