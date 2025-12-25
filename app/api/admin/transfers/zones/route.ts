import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type ZonePayload = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  countryCode: string;
  microzones?: string[];
  featuredHotels?: string[];
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

  const { id, name, slug, description, countryCode, microzones, featuredHotels } = payload as ZonePayload;
  if (!name || !slug || !countryCode) {
    return NextResponse.json({ error: "Missing required zone fields" }, { status: 400 });
  }

  const meta = {
    microzones: Array.isArray(microzones) ? microzones.filter(Boolean) : [],
    featuredHotels: Array.isArray(featuredHotels) ? featuredHotels.filter(Boolean) : []
  };

  try {
    if (id) {
      await prisma.transferZone.update({
        where: { id },
        data: {
          name,
          slug,
          description: description ?? null,
          countryCode,
          meta
        }
      });
    } else {
      await prisma.transferZone.create({
        data: {
          id: slug,
          name,
          slug,
          description: description ?? null,
          countryCode,
          meta
        }
      });
    }
  } catch (error) {
    console.error("Failed to save transfer zone", error);
    return NextResponse.json({ error: "No se pudo guardar la zona" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
