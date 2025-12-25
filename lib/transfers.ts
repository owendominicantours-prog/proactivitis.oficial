import type {
  VehicleCategory,
  TransferRate,
  TransferZone,
  TransferDestination,
  TransferPoint
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { trasladoPricing } from "@/data/traslado-pricing";

const DEFAULT_COUNTRY_CODE = "RD";

type TransferRateWithZones = TransferRate & {
  originZone: TransferZone;
  destinationZone: TransferZone;
};

const TRANSFER_COUNTRY_DEFAULTS: Record<
  string,
  {
    name: string;
    slug: string;
  }
> = {
  RD: {
    name: "República Dominicana",
    slug: "dominican-republic"
  }
};

async function ensureTransferPoints() {
  const map = new Map<string, TransferPoint>();
  for (const point of DEFAULT_TRANSFER_POINTS) {
    const record = await prisma.transferPoint.upsert({
      where: { code: point.code },
      update: {
        name: point.name,
        slug: point.slug,
        description: point.name,
        type: point.type
      },
      create: {
        name: point.name,
        code: point.code,
        slug: point.slug,
        description: point.name,
        type: point.type
      }
    });
    map.set(point.code, record);
  }
  return map;
}

async function ensureTransferCountry(countryCode: string) {
  const defaults = TRANSFER_COUNTRY_DEFAULTS[countryCode] ?? {
    name: countryCode,
    slug: countryCode.toLowerCase()
  };

  const existing = await prisma.country.findUnique({
    where: { code: countryCode }
  });
  if (existing) {
    return existing;
  }

  const slugConflict = await prisma.country.findFirst({
    where: { slug: defaults.slug }
  });
  const slug = slugConflict ? `${defaults.slug}-${countryCode.toLowerCase()}` : defaults.slug;

  return prisma.country.create({
    data: {
      id: countryCode,
      code: countryCode,
      name: defaults.name,
      slug
    }
  });
};

const DEFAULT_TRANSFER_POINTS = [
  { code: "PUJ", name: "Aeropuerto Punta Cana (PUJ)", slug: "airport-puj", type: "airport" },
  { code: "SDQ", name: "Aeropuerto Las Américas (SDQ)", slug: "airport-sdq", type: "airport" },
  { code: "POP", name: "Aeropuerto Gregorio Luperón (POP)", slug: "airport-pop", type: "airport" },
  { code: "LRM", name: "Aeropuerto La Romana (LRM)", slug: "airport-lrm", type: "airport" }
];

const ZONE_POINT_MAP: Record<string, string> = {
  PUJ_BAVARO: "PUJ",
  UVERO_MICHES: "PUJ",
  ROMANA_BAYAHIBE: "PUJ",
  SANTO_DOMINGO: "SDQ",
  SAMANA: "SDQ",
  NORTE_CIBAO: "POP",
  SUR_PROFUNDO: "LRM"
};

type TransferConfig = {
  zones: TransferZone[];
  rates: TransferRateWithZones[];
  points: TransferPoint[];
  destinations: TransferDestination[];
};

export async function ensureDefaultTransferConfig(countryCode: string = DEFAULT_COUNTRY_CODE) {
  await ensureTransferCountry(countryCode);
  const pointMap = await ensureTransferPoints();
  await ensureTransferZones(countryCode, pointMap);
  await ensureTransferRates(countryCode);
}

export async function getTransferConfig(countryCode: string): Promise<TransferConfig> {
  const zones = await prisma.transferZone.findMany({
    where: { countryCode },
    orderBy: { name: "asc" }
  });
  const rates = await prisma.transferRate.findMany({
    where: { countryCode },
    include: { originZone: true, destinationZone: true }
  });
  const points = await prisma.transferPoint.findMany({
    orderBy: { name: "asc" }
  });
  const destinations = await prisma.transferDestination.findMany({
    where: {
      zone: {
        countryCode
      }
    },
    orderBy: { name: "asc" }
  });
  return { zones, rates: rates as TransferRateWithZones[], points, destinations };
}

export async function getTransferCountryList() {
  const grouped = await prisma.transferZone.groupBy({ by: ["countryCode"] });
  if (!grouped.length) {
    return [];
  }
  const codes = grouped.map((entry) => entry.countryCode);
  return prisma.country.findMany({
    where: { code: { in: codes } },
    orderBy: { name: "asc" },
    select: { code: true, name: true }
  });
}

async function ensureTransferZones(countryCode: string, pointMap: Map<string, TransferPoint>) {
  const sky = trasladoPricing.nodes.map((node) => ({
    slug: node.id,
    name: node.name,
    description: node.name,
    meta: {
      microzones: node.microzones,
      featuredHotels: node.featured_hotels
    }
  }));

  await Promise.all(
    sky.map((zone) => {
      const zonePointCode = ZONE_POINT_MAP[zone.slug];
      const originId = zonePointCode ? pointMap.get(zonePointCode)?.id ?? null : null;
      return prisma.transferZone.upsert({
        where: { slug: zone.slug },
        create: {
          id: zone.slug,
          name: zone.name,
          slug: zone.slug,
          countryCode,
          description: zone.description,
          meta: zone.meta,
          originId
        },
        update: {
          name: zone.name,
          countryCode,
          description: zone.description,
          meta: zone.meta,
          originId
        }
      });
    })
  );
}

async function ensureTransferRates(countryCode: string) {
  const zones = await prisma.transferZone.findMany({
    where: { countryCode }
  });
  const zoneMap = new Map(zones.map((zone) => [zone.slug, zone]));

  const upserts = [];
  for (const node of trasladoPricing.nodes) {
    const origin = zoneMap.get(node.id);
    if (!origin) continue;
    for (const [destinationSlug, pricing] of Object.entries(node.transfers)) {
      const destination = zoneMap.get(destinationSlug);
      if (!destination) continue;
      for (const [categoryKey, value] of Object.entries(pricing) as [
        VehicleCategory,
        number
      ][]) {
        upserts.push(
          prisma.transferRate.upsert({
            where: {
              originZoneId_destinationZoneId_vehicleCategory: {
                originZoneId: origin.id,
                destinationZoneId: destination.id,
                vehicleCategory: categoryKey
              }
            },
            create: {
              id: `${origin.slug}-${destination.slug}-${categoryKey}`,
              originZoneId: origin.id,
              destinationZoneId: destination.id,
              countryCode,
              vehicleCategory: categoryKey,
              price: value
            },
            update: {
              price: value,
              countryCode
            }
          })
        );
      }
    }
  }

  if (upserts.length) {
    await Promise.all(upserts);
  }
}

export type { TransferRateWithZones, TransferConfig };
