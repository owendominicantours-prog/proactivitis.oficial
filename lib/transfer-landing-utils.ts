import { prisma } from "@/lib/prisma";
import { TransferLocationType } from "@prisma/client";

export type DynamicTransferLanding = {
  landingSlug: string;
  originSlug: string;
  originName: string;
  destinationSlug: string;
  destinationName: string;
  lastMod: Date;
  originZoneId: string;
  destinationZoneId: string;
  aliasSlugs: string[];
};

type LocationSummary = {
  slug: string;
  name: string;
  zoneId: string;
  updatedAt: Date;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");

const groupByZone = (locations: LocationSummary[]) => {
  const map = new Map<string, LocationSummary[]>();
  locations.forEach((location) => {
    const list = map.get(location.zoneId);
    if (list) {
      list.push(location);
    } else {
      map.set(location.zoneId, [location]);
    }
  });
  return map;
};

export async function getDynamicTransferLandingCombos(): Promise<DynamicTransferLanding[]> {
  const [airports, hotels, routes] = await Promise.all([
    prisma.transferLocation.findMany({
      where: {
        type: TransferLocationType.AIRPORT,
        active: true
      },
      select: {
        slug: true,
        name: true,
        zoneId: true,
        updatedAt: true
      }
    }),
    prisma.transferLocation.findMany({
      where: {
        type: TransferLocationType.HOTEL,
        active: true
      },
      select: {
        slug: true,
        name: true,
        zoneId: true,
        updatedAt: true
      }
    }),
    prisma.transferRoute.findMany({
      where: {
        active: true
      },
      select: {
        zoneAId: true,
        zoneBId: true
      }
    })
  ]);

  const airportsByZone = groupByZone(airports);
  const hotelsByZone = groupByZone(hotels);
  const combos = new Map<string, DynamicTransferLanding>();

  const iterateRoute = (originZoneId: string, destinationZoneId: string) => {
    const originLocations = airportsByZone.get(originZoneId);
    const destinationLocations = hotelsByZone.get(destinationZoneId);
    if (!originLocations || !destinationLocations) {
      return;
    }
    for (const origin of originLocations) {
      for (const destination of destinationLocations) {
        const canonicalOriginNameSlug = slugify(origin.name);
        const canonicalDestinationNameSlug = slugify(destination.name);
        const canonicalSlug = `${canonicalOriginNameSlug}-to-${canonicalDestinationNameSlug}`;
        const aliasSet = new Set<string>([
          `${origin.slug}-to-${destination.slug}`,
          `${origin.slug}-to-${canonicalDestinationNameSlug}`,
          `${canonicalOriginNameSlug}-to-${destination.slug}`
        ]);
        aliasSet.delete(canonicalSlug);
        if (!combos.has(canonicalSlug)) {
          combos.set(canonicalSlug, {
            landingSlug: canonicalSlug,
            originSlug: origin.slug,
            originName: origin.name,
            destinationSlug: destination.slug,
            destinationName: destination.name,
            lastMod: destination.updatedAt,
            originZoneId: origin.zoneId,
            destinationZoneId: destination.zoneId,
            aliasSlugs: Array.from(aliasSet)
          });
        }
      }
    }
  };

  routes.forEach((route) => {
    iterateRoute(route.zoneAId, route.zoneBId);
    iterateRoute(route.zoneBId, route.zoneAId);
  });

  return Array.from(combos.values());
}

export async function findDynamicLandingBySlug(slug: string) {
  const combos = await getDynamicTransferLandingCombos();
  const normalized = normalizeSlug(slug);
  const matches = (candidate: string) => candidate === slug || normalizeSlug(candidate) === normalized;
  const landing = combos.find(
    (combo) =>
      matches(combo.landingSlug) ||
      combo.aliasSlugs.some(matches) ||
      combo.aliasSlugs.some((alias) => matches(alias))
  );
  if (!landing) {
    return null;
  }

  const [origin, destination] = await Promise.all([
    prisma.transferLocation.findUnique({
      where: {
        slug: landing.originSlug
      },
      select: {
        slug: true,
        name: true,
        zoneId: true
      }
    }),
    prisma.transferLocation.findUnique({
      where: {
        slug: landing.destinationSlug
      },
      select: {
        slug: true,
        name: true,
        zoneId: true
      }
    })
  ]);

  if (!origin || !destination) {
    return null;
  }

  return { origin, destination, landing };
}
