import { NextResponse } from "next/server";
import { GOLDEN_TOUR_INTENTS, buildGoldenTourPageSlug } from "@/lib/goldenTourPages";
import { prisma } from "@/lib/prisma";
import { warnOnce } from "@/lib/logOnce";

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;
export const revalidate = 86400;

export async function GET() {
  let tours: { slug: string }[] = [];
  try {
    tours = await prisma.tour.findMany({
      where: { status: { in: ["published", "seo_only"] } },
      select: { slug: true },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    warnOnce("sitemap-golden-tour-pages-db-fallback", "[sitemap-golden-tour-pages] Falling back to empty sitemap", error);
  }

  const lastmod = new Date().toISOString();
  const urls = tours
    .flatMap((tour) =>
      GOLDEN_TOUR_INTENTS.flatMap((intent) =>
        LOCALES.map((locale) => {
          const prefix = locale === "es" ? "" : `/${locale}`;
          return `${BASE_URL}${prefix}/punta-cana/tours/${buildGoldenTourPageSlug(tour.slug, intent.slug)}`;
        })
      )
    )
    .map(
      (loc) => `
        <url>
          <loc>${loc}</loc>
          <lastmod>${lastmod}</lastmod>
          <priority>0.72</priority>
        </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
