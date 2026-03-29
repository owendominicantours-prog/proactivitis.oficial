import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "https://proactivitis.com";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export type CreateAgencyTransferLinkInput = {
  agencyUserId: string;
  originLocationId: string;
  destinationLocationId: string;
  vehicleId: string;
  passengers: number;
  tripType: "one-way" | "round-trip";
  price: number;
  basePrice: number;
  note?: string | null;
};

export async function createAgencyTransferLinkRecord(input: CreateAgencyTransferLinkInput) {
  const [origin, destination, vehicle] = await Promise.all([
    prisma.transferLocation.findUnique({
      where: { id: input.originLocationId },
      include: { zone: true }
    }),
    prisma.transferLocation.findUnique({
      where: { id: input.destinationLocationId },
      include: { zone: true }
    }),
    prisma.transferVehicle.findUnique({
      where: { id: input.vehicleId },
      select: { id: true, name: true }
    })
  ]);

  if (!origin || !destination || !vehicle) {
    throw new Error("No se pudo validar la ruta o el vehiculo del traslado.");
  }

  const [zoneAId, zoneBId] = [origin.zoneId, destination.zoneId].sort((a, b) => a.localeCompare(b));
  const route = await prisma.transferRoute.findFirst({
    where: {
      OR: [{ zoneAId, zoneBId }, { zoneAId: zoneBId, zoneBId: zoneAId }]
    },
    include: {
      prices: { include: { vehicle: true } },
      overrides: true
    }
  });

  if (!route || !route.prices.length) {
    throw new Error("No encontramos una ruta disponible para este traslado.");
  }

  const routePrice = route.prices.find((entry) => entry.vehicleId === input.vehicleId);
  if (!routePrice) {
    throw new Error("No encontramos una tarifa base para este vehiculo.");
  }

  const overrideForVehicle = route.overrides.filter((override) => override.vehicleId === input.vehicleId);
  const oneWayBasePrice =
    overrideForVehicle.find(
      (override) => override.originLocationId === origin.id && override.destinationLocationId === destination.id
    )?.price ??
    overrideForVehicle.find((override) => override.originLocationId === origin.id && !override.destinationLocationId)
      ?.price ??
    overrideForVehicle.find(
      (override) => override.destinationLocationId === destination.id && !override.originLocationId
    )?.price ??
    routePrice.price;

  const roundTripMultiplier =
    input.tripType === "round-trip"
      ? 2 * (1 - Number(process.env.NEXT_PUBLIC_ROUND_TRIP_DISCOUNT_PERCENT ?? 5) / 100)
      : 1;
  const basePrice = Number((oneWayBasePrice * roundTripMultiplier).toFixed(2));
  if (input.price < basePrice) {
    throw new Error("El precio AgencyPro debe ser igual o mayor al precio base.");
  }

  const markup = input.price - basePrice;
  const slug = `${slugify(`${origin.name}-${destination.name}-${vehicle.name}`)}-${input.agencyUserId.slice(0, 6)}-${randomUUID().split("-")[0]}`;

  const link = await prisma.agencyTransferLink.create({
    data: {
      slug,
      agencyUserId: input.agencyUserId,
      originLocationId: origin.id,
      destinationLocationId: destination.id,
      vehicleId: vehicle.id,
      passengers: input.passengers,
      tripType: input.tripType,
      price: input.price,
      basePrice,
      markup,
      note: input.note?.trim() ?? null
    }
  });

  return {
    slug: link.slug,
    url: `${APP_BASE_URL}/agency-transfer/${link.slug}`
  };
}

export async function findAgencyTransferLinkBySlug(slug: string) {
  return prisma.agencyTransferLink.findUnique({
    where: { slug },
    include: {
      AgencyUser: {
        include: {
          AgencyProfile: true
        }
      },
      originLocation: true,
      destinationLocation: true,
      vehicle: true
    }
  });
}
