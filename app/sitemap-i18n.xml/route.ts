import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import { excursionKeywordLandings } from "@/data/excursion-keyword-landings";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import { warnOnce } from "@/lib/logOnce";

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["en", "fr"] as const;
export const revalidate = 86400;

type SitemapEntry = {
  loc: string;
  priority: number;
  lastmod?: string;
};

const buildEntry = (loc: string, priority: number, lastmod?: string): SitemapEntry => ({
  loc,
  priority,
  lastmod
});

export async function GET() {
  let tours: { slug: string }[] = [];
  let hotels: { slug: string; updatedAt: Date }[] = [];
  let transferCombos: { landingSlug: string; lastMod: Date }[] = [];
  try {
    [tours, hotels, transferCombos] = await Promise.all([
      prisma.tour.findMany({
        where: { status: "published" },
        select: { slug: true }
      }),
      prisma.transferLocation.findMany({
        where: { type: "HOTEL", active: true },
        select: { slug: true, updatedAt: true }
      }),
      getDynamicTransferLandingCombos()
    ]);
  } catch (error) {
    warnOnce("sitemap-i18n-db-fallback", "[sitemap-i18n] Falling back to static entries due to DB error", error);
  }

  const manualLandings = allLandings().map((landing) => ({
    slug: landing.landingSlug,
    lastMod: new Date().toISOString()
  }));
  const landingMap = new Map<string, { slug: string; lastMod: string }>();
  [
    ...manualLandings,
    ...transferCombos.map((combo) => ({ slug: combo.landingSlug, lastMod: combo.lastMod.toISOString() }))
  ].forEach((entry) => {
    landingMap.set(entry.slug, entry);
  });

  const entries: SitemapEntry[] = [];
  const excursionEntries = excursionKeywordLandings.map((landing) => ({
    slug: landing.landingSlug,
    lastMod: new Date().toISOString()
  }));

  LOCALES.forEach((locale) => {
    entries.push(
      buildEntry(`${BASE_URL}/${locale}`, 1.0),
      buildEntry(`${BASE_URL}/${locale}/tours`, 0.9),
      buildEntry(`${BASE_URL}/${locale}/traslado`, 0.9),
      buildEntry(`${BASE_URL}/${locale}/punta-cana/premium-transfer-services`, 0.85),
      buildEntry(`${BASE_URL}/${locale}/contact`, 0.7)
    );

    tours.forEach((tour) => {
      entries.push(buildEntry(`${BASE_URL}/${locale}/tours/${tour.slug}`, 0.8));
    });

    Array.from(landingMap.values()).forEach(({ slug, lastMod }) => {
      entries.push(buildEntry(`${BASE_URL}/${locale}/transfer/${slug}`, 0.7, lastMod));
    });

    hotels.forEach(({ slug, updatedAt }) => {
      entries.push(buildEntry(`${BASE_URL}/${locale}/things-to-do/${slug}`, 0.7, updatedAt.toISOString()));
      entries.push(buildEntry(`${BASE_URL}/${locale}/hotels/${slug}`, 0.75, updatedAt.toISOString()));
    });

    excursionEntries.forEach(({ slug, lastMod }) => {
      entries.push(buildEntry(`${BASE_URL}/${locale}/excursiones/${slug}`, 0.7, lastMod));
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `
  <url>
    <loc>${entry.loc}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
