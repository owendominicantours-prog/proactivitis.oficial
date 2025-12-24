import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { VehicleCategory } from "@prisma/client";

const VEHICLE_CATEGORIES: VehicleCategory[] = ["SEDAN", "VAN", "SUV"];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  const { originZoneId, destinationZoneId, countryCode, prices } = payload;
  if (!originZoneId || !destinationZoneId || !countryCode || !prices) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updates = VEHICLE_CATEGORIES.map((category) => {
    const rawValue = prices[category];
    if (rawValue == null || Number.isNaN(Number(rawValue))) {
      return null;
    }
    const amount = Number(rawValue);
    return prisma.transferRate.upsert({
      where: {
        originZoneId_destinationZoneId_vehicleCategory: {
          originZoneId,
          destinationZoneId,
          vehicleCategory: category
        }
      },
      create: {
        id: `${originZoneId}-${destinationZoneId}-${category}`,
        originZoneId,
        destinationZoneId,
        countryCode,
        vehicleCategory: category,
        price: amount
      },
      update: {
        price: amount,
        countryCode
      }
    });
  }).filter(Boolean);

  if (!updates.length) {
    return NextResponse.json({ error: "No values provided" }, { status: 400 });
  }

  await Promise.all(updates);
  return NextResponse.json({ success: true });
}
