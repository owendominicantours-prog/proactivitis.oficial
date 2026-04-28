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
  zoneName
});

async function main() {
  const routes = await prisma.transferRoute.findMany({
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
      }
    }
  });

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
  const file = `import type { MobileTransferRoute } from "./api";\n\nexport const staticMobileTransferRoutes = ${JSON.stringify(
    payload,
    null,
    2
  )} satisfies MobileTransferRoute[];\n`;
  fs.writeFileSync(outputPath, file, "utf8");
  console.log(`Generated ${payload.length} transfer routes in ${path.relative(rootDir, outputPath)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
