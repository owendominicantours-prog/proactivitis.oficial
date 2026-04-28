import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type QuoteVehicle = {
  id: string;
  name: string;
  category: string;
  minPax: number;
  maxPax: number;
  price: number;
  imageUrl?: string | null;
};

const ZONE_ROUTE_FALLBACKS: Record<string, string[]> = {
  bayahibe: ["la-romana"]
};

const withCors = (response: NextResponse) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
};

const json = (body: unknown, init?: ResponseInit) => withCors(NextResponse.json(body, init));

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

async function findRouteWithFallback(originZoneId: string, destinationZoneId: string, originZoneSlug?: string, destinationZoneSlug?: string) {
  const exactZoneIds = [originZoneId, destinationZoneId].sort((a, b) => a.localeCompare(b));
  const exactRoute = await prisma.transferRoute.findFirst({
    where: {
      OR: [{ zoneAId: exactZoneIds[0], zoneBId: exactZoneIds[1] }, { zoneAId: exactZoneIds[1], zoneBId: exactZoneIds[0] }]
    },
    include: {
      prices: { include: { vehicle: true } },
      overrides: true
    }
  });

  if (exactRoute?.prices?.length) return exactRoute;

  const originFallbackSlugs = [originZoneSlug, ...(originZoneSlug ? ZONE_ROUTE_FALLBACKS[originZoneSlug] ?? [] : [])].filter(Boolean) as string[];
  const destinationFallbackSlugs = [destinationZoneSlug, ...(destinationZoneSlug ? ZONE_ROUTE_FALLBACKS[destinationZoneSlug] ?? [] : [])].filter(Boolean) as string[];

  if (originFallbackSlugs.length === 0 || destinationFallbackSlugs.length === 0) {
    return null;
  }

  const candidateZones = await prisma.transferZoneV2.findMany({
    where: {
      slug: {
        in: Array.from(new Set([...originFallbackSlugs, ...destinationFallbackSlugs]))
      }
    },
    select: { id: true, slug: true }
  });
  const zoneIdBySlug = new Map(candidateZones.map((zone) => [zone.slug, zone.id]));

  for (const originSlugCandidate of originFallbackSlugs) {
    for (const destinationSlugCandidate of destinationFallbackSlugs) {
      const candidateOriginId =
        originSlugCandidate === originZoneSlug ? originZoneId : zoneIdBySlug.get(originSlugCandidate);
      const candidateDestinationId =
        destinationSlugCandidate === destinationZoneSlug ? destinationZoneId : zoneIdBySlug.get(destinationSlugCandidate);

      if (!candidateOriginId || !candidateDestinationId || candidateOriginId === candidateDestinationId) {
        continue;
      }

      const pair = [candidateOriginId, candidateDestinationId].sort((a, b) => a.localeCompare(b));
      const route = await prisma.transferRoute.findFirst({
        where: {
          OR: [{ zoneAId: pair[0], zoneBId: pair[1] }, { zoneAId: pair[1], zoneBId: pair[0] }]
        },
        include: {
          prices: { include: { vehicle: true } },
          overrides: true
        }
      });
      if (route?.prices?.length) return route;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const originId = payload?.origin_location_id;
    const destinationId = payload?.destination_location_id;
    const passengers = Number(payload?.passengers ?? 1);

    if (!originId || !destinationId || originId === destinationId) {
      return json({ error: "Debes enviar origen y destino distintos." }, { status: 400 });
    }
    if (Number.isNaN(passengers) || passengers <= 0) {
      return json({ error: "Indica la cantidad de pasajeros." }, { status: 400 });
    }

    const [origin, destination] = await Promise.all([
      prisma.transferLocation.findUnique({ where: { id: originId }, include: { zone: true } }),
      prisma.transferLocation.findUnique({ where: { id: destinationId }, include: { zone: true } })
    ]);

    if (!origin || !destination || !origin.zoneId || !destination.zoneId) {
      return json({ error: "Origen o destino no encontrados." }, { status: 404 });
    }

    const route =
      (await findRouteWithFallback(
        origin.zoneId,
        destination.zoneId,
        origin.zone?.slug ?? undefined,
        destination.zone?.slug ?? undefined
      ));

    if (!route || !route.prices.length) {
      return json({ error: "No encontramos una ruta disponible para ese par." }, { status: 404 });
    }

    const vehicles: QuoteVehicle[] = [];
    for (const priceEntry of route.prices) {
      const vehicle = priceEntry.vehicle;
      if (!vehicle) continue;
      const overrideForVehicle = route.overrides.filter((override) => override.vehicleId === vehicle.id);
      const finalPrice =
        overrideForVehicle.find(
          (override) => override.originLocationId === origin.id && override.destinationLocationId === destination.id
        )?.price ??
        overrideForVehicle.find((override) => override.originLocationId === origin.id && !override.destinationLocationId)
          ?.price ??
        overrideForVehicle.find(
          (override) => override.destinationLocationId === destination.id && !override.originLocationId
        )?.price ??
        priceEntry.price;

      if (passengers < vehicle.minPax || passengers > vehicle.maxPax) {
        continue;
      }

      vehicles.push({
        id: vehicle.id,
        name: vehicle.name,
        category: vehicle.category,
        minPax: vehicle.minPax,
        maxPax: vehicle.maxPax,
        price: finalPrice,
        imageUrl: vehicle.imageUrl
      });
    }

    if (!vehicles.length) {
      return json(
        { error: "No hay vehiculos disponibles para ese numero de pasajeros." },
        { status: 404 }
      );
    }

    return json({
      routeId: route.id,
      currency: "USD",
      vehicles
    });
  } catch (error) {
    console.error("Quote error", error);
    return json({ error: "No se pudo calcular la tarifa." }, { status: 500 });
  }
}

