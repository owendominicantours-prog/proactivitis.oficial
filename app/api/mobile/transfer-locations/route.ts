import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const withCors = (response: NextResponse) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
};

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  const locations = await prisma.transferLocation.findMany({
    where: { active: true },
    take: 600,
    orderBy: [{ zone: { name: "asc" } }, { type: "asc" }, { name: "asc" }],
    include: { zone: true }
  });

  const response = NextResponse.json({
    locations: locations.map((location) => ({
      id: location.id,
      name: location.name,
      slug: location.slug,
      type: location.type,
      zoneName: location.zone?.name ?? null,
      zoneId: location.zoneId
    }))
  });

  response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
  return withCors(response);
}
