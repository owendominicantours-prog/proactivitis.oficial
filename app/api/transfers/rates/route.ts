import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getTransferPrice } from "@/data/traslado-pricing";
import type { VehicleCategory } from "@prisma/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const originZoneId = url.searchParams.get("originZoneId");
  const destinationZoneId = url.searchParams.get("destinationZoneId");
  if (!originZoneId || !destinationZoneId) {
    return NextResponse.json({ error: "originZoneId and destinationZoneId are required" }, { status: 400 });
  }

  const rates = await prisma.transferRate.findMany({
    where: { originZoneId, destinationZoneId }
  });

  const defaultRates: Record<VehicleCategory, number> = {
    SEDAN: getTransferPrice(originZoneId, destinationZoneId, "SEDAN"),
    VAN: getTransferPrice(originZoneId, destinationZoneId, "VAN"),
    SUV: getTransferPrice(originZoneId, destinationZoneId, "SUV")
  };

  for (const rate of rates) {
    defaultRates[rate.vehicleCategory] = rate.price;
  }

  return NextResponse.json({ rates: defaultRates });
}
