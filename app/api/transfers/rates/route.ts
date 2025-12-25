import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getTransferPrice } from "@/data/traslado-pricing";
import type { VehicleCategory } from "@prisma/client";

const VEHICLE_CATEGORIES: VehicleCategory[] = ["SEDAN", "VAN", "SUV", "VIP", "BUS"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const originZoneId = url.searchParams.get("originZoneId");
  const destinationZoneId = url.searchParams.get("destinationZoneId");
  const destinationId = url.searchParams.get("destinationId");
  if (!originZoneId || !destinationZoneId) {
    return NextResponse.json({ error: "originZoneId and destinationZoneId are required" }, { status: 400 });
  }

  const rates = await prisma.transferRate.findMany({
    where: { originZoneId, destinationZoneId }
  });

  const destination = destinationId
    ? await prisma.transferDestination.findUnique({ where: { id: destinationId } })
    : null;
  const destinationOverrides = (destination?.pricingOverrides ?? {}) as Record<VehicleCategory, number>;

  const defaultRates: Record<VehicleCategory, number> = {
    SEDAN: getTransferPrice(originZoneId, destinationZoneId, "SEDAN"),
    VAN: getTransferPrice(originZoneId, destinationZoneId, "VAN"),
    SUV: getTransferPrice(originZoneId, destinationZoneId, "SUV"),
    VIP: getTransferPrice(originZoneId, destinationZoneId, "VIP"),
    BUS: getTransferPrice(originZoneId, destinationZoneId, "BUS")
  };

  for (const rate of rates) {
    defaultRates[rate.vehicleCategory] = rate.price;
  }

  for (const category of VEHICLE_CATEGORIES) {
    const override = destinationOverrides[category];
    if (override != null) {
      defaultRates[category] = override;
    }
  }

  return NextResponse.json({ rates: defaultRates });
}
