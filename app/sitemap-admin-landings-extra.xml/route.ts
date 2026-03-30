import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { landingPages, countryToPuntaCanaLandingSlugs } from "@/lib/landing";
import { TOUR_MARKET_INTENTS, buildTourMarketVariantSlug } from "@/lib/tourMarketVariants";
import { getIndexableTourMarketIntentIds } from "@/lib/seo-index-policy";
import { warnOnce } from "@/lib/logOnce";

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;
const INDEXABLE_TOUR_MARKET_INTENT_IDS = new Set(getIndexableTourMarketIntentIds());

export const revalidate = 86400;

export async function GET() {
  let publishedTours: { slug: string; createdAt: Date }[] = [];

  try {
    publishedTours = await prisma.tour.findMany({
      where: { status: "published" },
      select: { slug: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    warnOnce(
      "sitemap-admin-landings-extra-db-fallback",
      "[sitemap-admin-landings-extra] Falling back to static entries due to DB error",
      error
    );
  }

  const tourLandingEntries = landingPages
    .filter((landing) => !landing.path && !countryToPuntaCanaLandingSlugs.has(landing.slug))
    .map((landing) => ({
      loc: `${BASE_URL}/landing/${landing.slug}`,
      lastmod: new Date().toISOString(),
      priority: 0.68
    }));

  const extraTourMarketEntries = publishedTours.flatMap((tour) =>
    TOUR_MARKET_INTENTS.filter((intent) => !INDEXABLE_TOUR_MARKET_INTENT_IDS.has(intent.id)).flatMap((intent) =>
      LOCALES.map((locale) => {
        const prefix = locale === "es" ? "" : `/${locale}`;
        return {
          loc: `${BASE_URL}${prefix}/thingtodo/tours/${buildTourMarketVariantSlug(tour.slug, intent.id)}`,
          lastmod: tour.createdAt.toISOString(),
          priority: 0.64
        };
      })
    )
  );

  const entries = [...tourLandingEntries, ...extraTourMarketEntries];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
