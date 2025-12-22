import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __proactivitisPrisma: PrismaClient | undefined;
}

const prisma =
  globalThis.__proactivitisPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn"] : []
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__proactivitisPrisma = prisma;
}

const BASE_URL = "https://proactivitis.com";

export default async function sitemap() {
  const [tours, locations] = await Promise.all([
    prisma.tour.findMany({ select: { slug: true } }),
    prisma.location.findMany({ select: { slug: true } })
  ]);

  const tourRoutes = tours.map((tour) => ({
    url: `${BASE_URL}/tours/${tour.slug}`,
    priority: 0.8
  }));

  const locationRoutes = locations.map((location) => ({
    url: `${BASE_URL}/recogida/${location.slug}`,
    priority: 0.7
  }));

  return [
    { url: `${BASE_URL}/`, priority: 1.0 },
    { url: `${BASE_URL}/tours`, priority: 0.9 },
    ...tourRoutes,
    ...locationRoutes
  ];
}
