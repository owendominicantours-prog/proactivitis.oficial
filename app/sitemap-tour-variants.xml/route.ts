import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { warnOnce } from "@/lib/logOnce";
import { TOUR_MARKET_INTENTS, buildTourMarketVariantSlug } from "@/lib/tourMarketVariants";

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;
export const revalidate = 86400;

export async function GET() {
  let variants: { slug: string }[] = [];
  let tourSlugs: { slug: string }[] = [];
  try {
    const [dbVariants, tours] = await Promise.all([
      prisma.tourVariant.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true }
      }),
      prisma.tour.findMany({
        where: { status: "published" },
        select: { slug: true }
      })
    ]);
    variants = dbVariants;
    tourSlugs = tours;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2021" || error.code === "P2022")
    ) {
      variants = [];
    } else {
      warnOnce("sitemap-tour-variants-db-fallback", "[sitemap-tour-variants] Falling back to empty sitemap due to DB error", error);
      variants = [];
      tourSlugs = [];
    }
  }

  const marketVariantSlugs = tourSlugs.flatMap((tour) =>
    TOUR_MARKET_INTENTS.map((intent) => ({
      slug: buildTourMarketVariantSlug(tour.slug, intent.id)
    }))
  );

  const allVariantSlugs = [...variants, ...marketVariantSlugs];

  const urls = allVariantSlugs
    .map((variant) =>
      LOCALES.map((locale) => {
        const prefix = locale === "es" ? "" : `/${locale}`;
        const url = `${BASE_URL}${prefix}/thingtodo/tours/${variant.slug}`;
        return `
        <url>
          <loc>${url}</loc>
          <priority>0.7</priority>
        </url>`;
      }).join("")
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
