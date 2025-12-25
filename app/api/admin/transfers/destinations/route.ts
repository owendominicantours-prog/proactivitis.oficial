import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { VehicleCategory } from "@prisma/client";

const VEHICLE_CATEGORIES: VehicleCategory[] = ["SEDAN", "VAN", "SUV", "VIP", "BUS"];

type DestinationPayload = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
  zoneId: string;
  originId?: string;
  pricingOverrides?: Record<VehicleCategory, number>;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  const {
    id,
    name,
    slug,
    description,
    heroImage,
    zoneId,
    originId,
    pricingOverrides
  } = payload as DestinationPayload;

  if (!name || !slug || !zoneId) {
    return NextResponse.json({ error: "Missing required destination fields" }, { status: 400 });
  }

  const sanitizedOverrides: Record<VehicleCategory, number> = {};
  for (const category of VEHICLE_CATEGORIES) {
    const value = pricingOverrides?.[category];
    if (value != null && !Number.isNaN(Number(value))) {
      sanitizedOverrides[category] = Number(value);
    }
  }

  const overridesValue = Object.keys(sanitizedOverrides).length ? sanitizedOverrides : null;

  try {
    if (id) {
      await prisma.transferDestination.update({
        where: { id },
        data: {
          name,
          slug,
          description: description ?? null,
          heroImage: heroImage ?? null,
          zoneId,
          originId: originId ?? null,
          pricingOverrides: overridesValue
        }
      });
    } else {
      await prisma.transferDestination.create({
        data: {
          name,
          slug,
          description: description ?? null,
          heroImage: heroImage ?? null,
          zoneId,
          originId: originId ?? null,
          pricingOverrides: overridesValue
        }
      });
    }
  } catch (error) {
    console.error("Failed to save transfer destination", error);
    return NextResponse.json({ error: "No se pudo guardar el hotel" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
