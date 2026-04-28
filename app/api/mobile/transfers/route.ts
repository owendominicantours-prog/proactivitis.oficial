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

const toLocationSummary = (location: {
  id: string;
  name: string;
  slug: string;
  type: string;
  zone?: { name: string } | null;
}, zoneName?: string) => ({
  id: location.id,
  name: location.name,
  slug: location.slug,
  type: location.type,
  zoneName: zoneName ?? location.zone?.name ?? null
});

export async function GET() {
  const routes = await prisma.transferRoute.findMany({
    where: {
      active: true,
      prices: {
        some: {
          vehicle: { active: true }
        }
      }
    },
    take: 30,
    orderBy: { updatedAt: "desc" },
    include: {
      zoneA: {
        include: {
          locations: {
            where: { active: true },
            orderBy: [{ type: "asc" }, { name: "asc" }],
            take: 20
          }
        }
      },
      zoneB: {
        include: {
          locations: {
            where: { active: true },
            orderBy: [{ type: "asc" }, { name: "asc" }],
            take: 20
          }
        }
      },
      prices: {
        where: {
          vehicle: { active: true }
        },
        include: { vehicle: true }
      }
    }
  });

  const mobileRoutes = routes
    .map((route) => {
      const zoneALocations = route.zoneA.locations.map((location) => ({ ...location, zone: route.zoneA }));
      const zoneBLocations = route.zoneB.locations.map((location) => ({ ...location, zone: route.zoneB }));
      const zoneAAirport = zoneALocations.find((location) => location.type === "AIRPORT");
      const zoneBAirport = zoneBLocations.find((location) => location.type === "AIRPORT");
      const zoneAHotel = zoneALocations.find((location) => location.type === "HOTEL") ?? zoneALocations[0];
      const zoneBHotel = zoneBLocations.find((location) => location.type === "HOTEL") ?? zoneBLocations[0];

      let origin;
      let destination;
      let originZoneName = route.zoneA.name;
      let destinationZoneName = route.zoneB.name;

      if (zoneAAirport && zoneBHotel) {
        origin = zoneAAirport;
        destination = zoneBHotel;
      } else if (zoneBAirport && zoneAHotel) {
        origin = zoneBAirport;
        destination = zoneAHotel;
        originZoneName = route.zoneB.name;
        destinationZoneName = route.zoneA.name;
      } else {
        origin = zoneALocations[0];
        destination = zoneBHotel ?? zoneBLocations[0];
      }

      const priceFrom = Math.min(...route.prices.map((price) => price.price).filter((price) => price > 0));

      if (!origin || !destination || origin.id === destination.id || !Number.isFinite(priceFrom)) return null;

      return {
        id: route.id,
        origin: toLocationSummary(origin, originZoneName),
        destination: toLocationSummary(destination, destinationZoneName),
        priceFrom,
        currency: route.prices[0]?.currency ?? "USD",
        zoneLabel: `${route.zoneA.name} - ${route.zoneB.name}`
      };
    })
    .filter((route): route is NonNullable<typeof route> => Boolean(route));

  const response = NextResponse.json({ routes: mobileRoutes });
  response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
  return withCors(response);
}
