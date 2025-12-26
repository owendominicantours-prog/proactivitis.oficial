import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim();

  const where = query
    ? {
        active: true,
        OR: [
          { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { slug: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { zone: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } }
        ]
      }
    : { active: true };

  const locations = await prisma.transferLocation.findMany({
    where,
    take: 40,
    orderBy: { name: "asc" },
    include: { zone: true }
  });

  return NextResponse.json({
    locations: locations.map((location) => ({
      id: location.id,
      name: location.name,
      slug: location.slug,
      type: location.type,
      zoneName: location.zone?.name ?? null
    }))
  });
}
