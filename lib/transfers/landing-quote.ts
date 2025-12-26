import { prisma } from "@/lib/prisma";

export type TransferLandingVehicle = {
  id: string;
  name: string;
  category: string;
  minPax: number;
  maxPax: number;
  price: number;
  imageUrl?: string | null;
};

export type TransferLandingQuote = {
  originId: string;
  originSlug: string;
  destinationId: string;
  destinationSlug: string;
  routeId: string;
  vehicles: TransferLandingVehicle[];
};

const sortZones = (a: string, b: string) => (a < b ? [a, b] : [b, a]);

const mapVehiclePrice = (route: { overrides: any[] }, vehicle: { id: string }, originId: string, destinationId: string, basePrice: number) => {
  const overrideForVehicle = route.overrides.filter((override) => override.vehicleId === vehicle.id);
  return (
    overrideForVehicle.find(
      (override) => override.originLocationId === originId && override.destinationLocationId === destinationId
    )?.price ??
    overrideForVehicle.find((override) => override.originLocationId === originId && !override.destinationLocationId)?.price ??
    overrideForVehicle.find((override) => override.destinationLocationId === destinationId && !override.originLocationId)?.price ??
    basePrice
  );
};

export async function getTransferLandingQuote({
  originSlug,
  destinationSlug,
  passengers = 2
}: {
  originSlug: string;
  destinationSlug: string;
  passengers?: number;
}): Promise<TransferLandingQuote> {
  const [origin, destination] = await Promise.all([
    prisma.transferLocation.findUnique({
      where: { slug: originSlug },
      include: { zone: true }
    }),
    prisma.transferLocation.findUnique({
      where: { slug: destinationSlug },
      include: { zone: true }
    })
  ]);

  if (!origin || !destination || !origin.zoneId || !destination.zoneId) {
    throw new Error("Origen o destino no encontrados para la landing.");
  }

  const [zoneAId, zoneBId] = sortZones(origin.zoneId, destination.zoneId);
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
    throw new Error("Ruta no disponible para esta landing.");
  }

  const vehicles: TransferLandingVehicle[] = [];
  for (const priceEntry of route.prices) {
    const vehicle = priceEntry.vehicle;
    if (!vehicle) continue;
    if (passengers < vehicle.minPax || passengers > vehicle.maxPax) {
      continue;
    }
    const price = mapVehiclePrice(route, vehicle, origin.id, destination.id, priceEntry.price);
    vehicles.push({
      id: vehicle.id,
      name: vehicle.name,
      category: vehicle.category,
      minPax: vehicle.minPax,
      maxPax: vehicle.maxPax,
      price,
      imageUrl: vehicle.imageUrl
    });
  }

  if (!vehicles.length) {
    throw new Error("No hay vehículos disponibles para la cantidad de pasajeros solicitada.");
  }

  return {
    originId: origin.id,
    originSlug: origin.slug,
    destinationId: destination.id,
    destinationSlug: destination.slug,
    routeId: route.id,
    vehicles
  };
}
