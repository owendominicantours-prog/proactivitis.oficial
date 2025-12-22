import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl = "https://proactivitis.com";

type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: MetadataRoute.ChangeFrequency;
  priority: number;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: SitemapEntry[] = ["", "/about", "/contact", "/tours"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8
  }));

  let tourRoutes: SitemapEntry[] = [];
  try {
    const tours = await prisma.tour.findMany({
      where: { status: "active" },
      select: { slug: true, updatedAt: true }
    });
    tourRoutes = tours.map((tour) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: tour.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7
    }));
  } catch (error) {
    console.error("Sitemap: no se pudieron cargar tours", error);
  }

  return [...staticRoutes, ...tourRoutes];
}
