import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyDiscordTransferQuoteRequested } from "@/lib/discordNotifications";

type QuoteVehicle = {
  id: string;
  name: string;
  category: string;
  minPax: number;
  maxPax: number;
  price: number;
  imageUrl?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const originId = payload?.origin_location_id;
    const destinationId = payload?.destination_location_id;
    const passengers = Number(payload?.passengers ?? 1);

    if (!originId || !destinationId || originId === destinationId) {
      return NextResponse.json({ error: "Debes enviar origen y destino distintos." }, { status: 400 });
    }
    if (Number.isNaN(passengers) || passengers <= 0) {
      return NextResponse.json({ error: "Indica la cantidad de pasajeros." }, { status: 400 });
    }

    const [origin, destination] = await Promise.all([
      prisma.transferLocation.findUnique({ where: { id: originId }, include: { zone: true } }),
      prisma.transferLocation.findUnique({ where: { id: destinationId }, include: { zone: true } })
    ]);

    if (!origin || !destination || !origin.zoneId || !destination.zoneId) {
      return NextResponse.json({ error: "Origen o destino no encontrados." }, { status: 404 });
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
      return NextResponse.json({ error: "No encontramos una ruta disponible para ese par." }, { status: 404 });
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
      return NextResponse.json(
        { error: "No hay vehiculos disponibles para ese numero de pasajeros." },
        { status: 404 }
      );
    }

    void notifyDiscordTransferQuoteRequested({
      originName: origin.name,
      destinationName: destination.name,
      passengers,
      vehiclesCount: vehicles.length
    }).catch((error) => {
      console.warn("No se pudo enviar notificacion Discord de cotizacion traslado", error);
    });

    return NextResponse.json({
      routeId: route.id,
      currency: "USD",
      vehicles
    });
  } catch (error) {
    console.error("Quote error", error);
    return NextResponse.json({ error: "No se pudo calcular la tarifa." }, { status: 500 });
  }
}
