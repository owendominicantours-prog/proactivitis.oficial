import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { warnOnce } from "@/lib/logOnce";

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;
export const revalidate = 86400;

type TourRow = {
  slug: string;
  updatedAt: Date;
};

export async function GET() {
  let tours: TourRow[] = [];
  try {
    tours = await prisma.tour.findMany({
      where: { status: "seo_only" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" }
    });
  } catch (error) {
    warnOnce("sitemap-seo-only-tours-db-fallback", "[sitemap-seo-only-tours] Falling back to empty sitemap due to DB error", error);
  }

  const entries = tours.flatMap((tour) =>
    LOCALES.map((locale) => {
      const prefix = locale === "es" ? "" : `/${locale}`;
      return {
        loc: `${BASE_URL}${prefix}/tours/${tour.slug}`,
        lastmod: tour.updatedAt.toISOString()
      };
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <priority>0.78</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}

