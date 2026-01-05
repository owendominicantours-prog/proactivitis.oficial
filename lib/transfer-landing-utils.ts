import { prisma } from "@/lib/prisma";
import { TransferLocationType } from "@prisma/client";

export type DynamicTransferLanding = {
  landingSlug: string;
  originSlug: string;
  originName: string;
  destinationSlug: string;
  destinationName: string;
  lastMod: Date;
};

type LocationSummary = {
  slug: string;
  name: string;
  zoneId: string;
  updatedAt: Date;
};

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
        const landingSlug = `${origin.slug}-to-${destination.slug}`;
        if (!combos.has(landingSlug)) {
          combos.set(landingSlug, {
            landingSlug,
            originSlug: origin.slug,
            originName: origin.name,
            destinationSlug: destination.slug,
            destinationName: destination.name,
            lastMod: destination.updatedAt
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
  const parts = slug.split("-to-");
  if (parts.length !== 2) {
    return null;
  }
  const [originSlug, destinationSlug] = parts;
  const [origin, destination] = await Promise.all([
    prisma.transferLocation.findFirst({
      where: {
        slug: originSlug,
        type: TransferLocationType.AIRPORT,
        active: true
      },
      select: {
        slug: true,
        name: true,
        zoneId: true
      }
    }),
    prisma.transferLocation.findFirst({
      where: {
        slug: destinationSlug,
        type: TransferLocationType.HOTEL,
        active: true
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
  const route = await prisma.transferRoute.findFirst({
    where: {
      active: true,
      OR: [
        { zoneAId: origin.zoneId, zoneBId: destination.zoneId },
        { zoneAId: destination.zoneId, zoneBId: origin.zoneId }
      ]
    }
  });
  if (!route) {
    return null;
  }
  return { origin, destination };
}
