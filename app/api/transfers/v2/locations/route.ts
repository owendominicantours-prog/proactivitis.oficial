import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const withCors = (response: NextResponse) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
};

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

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

  const response = NextResponse.json({
    locations: locations.map((location) => ({
      id: location.id,
      name: location.name,
      slug: location.slug,
      type: location.type,
      zoneName: location.zone?.name ?? null
    }))
  });

  response.headers.set(
    "Cache-Control",
    query
      ? "public, s-maxage=120, stale-while-revalidate=600"
      : "public, s-maxage=600, stale-while-revalidate=3600"
  );
  return withCors(response);
}
