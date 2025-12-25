import type { VehicleCategory, TransferRate, TransferZone } from "@prisma/client";

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
}

export async function ensureDefaultTransferConfig(countryCode: string = DEFAULT_COUNTRY_CODE) {
  await ensureTransferCountry(countryCode);
  await ensureTransferZones(countryCode);
  await ensureTransferRates(countryCode);
}

export async function getTransferConfig(countryCode: string) {
  const zones = await prisma.transferZone.findMany({
    where: { countryCode },
    orderBy: { name: "asc" }
  });
  const rates = await prisma.transferRate.findMany({
    where: { countryCode },
    include: { originZone: true, destinationZone: true }
  });
  return { zones, rates: rates as TransferRateWithZones[] };
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

async function ensureTransferZones(countryCode: string) {
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
    sky.map((zone) =>
      prisma.transferZone.upsert({
        where: { slug: zone.slug },
        create: {
          id: zone.slug,
          name: zone.name,
          slug: zone.slug,
          countryCode,
          description: zone.description,
          meta: zone.meta
        },
        update: {
          name: zone.name,
          countryCode,
          description: zone.description,
          meta: zone.meta
        }
      })
    )
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

export type { TransferRateWithZones };
