const fs = require("fs");
const path = require("path");
const { loadEnvConfig } = require("@next/env");
const { PrismaClient } = require("@prisma/client");

const rootDir = path.resolve(__dirname, "..");
loadEnvConfig(rootDir);

const prisma = new PrismaClient();

const toLocationSummary = (location, zoneName) => ({
  id: location.id,
  name: location.name,
  slug: location.slug,
  type: location.type,
  zoneName,
  zoneId: location.zoneId
});

const toVehicle = (vehicle, price) => ({
  id: vehicle.id,
  name: vehicle.name,
  category: vehicle.category,
  minPax: vehicle.minPax,
  maxPax: vehicle.maxPax,
  imageUrl: vehicle.imageUrl,
  price
});

async function main() {
  const [routes, locations] = await Promise.all([
    prisma.transferRoute.findMany({
    where: {
      active: true,
      prices: {
        some: {
          vehicle: { active: true }
        }
      }
    },
    take: 40,
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
        where: { vehicle: { active: true } },
        include: { vehicle: true }
      },
      overrides: true
    }
    }),
    prisma.transferLocation.findMany({
      where: { active: true },
      take: 600,
      orderBy: [{ zone: { name: "asc" } }, { type: "asc" }, { name: "asc" }],
      include: { zone: true }
    })
  ]);

  const payload = routes
    .map((route) => {
      const zoneALocations = route.zoneA.locations;
      const zoneBLocations = route.zoneB.locations;
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
    .filter(Boolean);

  const outputPath = path.join(rootDir, "mobile", "src", "staticTransfers.ts");
  const locationPayload = locations.map((location) => toLocationSummary(location, location.zone?.name ?? null));
  const pricePayload = routes.map((route) => ({
    id: route.id,
    zoneAId: route.zoneAId,
    zoneBId: route.zoneBId,
    zoneAName: route.zoneA.name,
    zoneBName: route.zoneB.name,
    currency: route.prices[0]?.currency ?? "USD",
    vehicles: route.prices
      .filter((price) => price.price > 0 && price.vehicle)
      .map((price) => toVehicle(price.vehicle, price.price)),
    overrides: route.overrides.map((override) => ({
      vehicleId: override.vehicleId,
      originLocationId: override.originLocationId,
      destinationLocationId: override.destinationLocationId,
      price: override.price
    }))
  }));

  const file = `import type { LocationSummary, MobileTransferRoute } from "./api";\n\nexport const staticMobileTransferRoutes = ${JSON.stringify(
    payload,
    null,
    2
  )} satisfies MobileTransferRoute[];\n\nexport const staticMobileTransferLocations = ${JSON.stringify(
    locationPayload,
    null,
    2
  )} satisfies LocationSummary[];\n\nexport const staticMobileTransferPriceRoutes = ${JSON.stringify(
    pricePayload,
    null,
    2
  )};\n`;
  fs.writeFileSync(outputPath, file, "utf8");
  console.log(`Generated ${payload.length} transfer routes, ${locationPayload.length} locations and ${pricePayload.length} price routes in ${path.relative(rootDir, outputPath)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
