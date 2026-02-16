import { NextResponse } from "next/server";
import { allLandings } from "@/data/transfer-landings";
import { genericTransferLandings } from "@/data/transfer-generic-landings";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import { warnOnce } from "@/lib/logOnce";

const BASE_URL = "https://proactivitis.com";
const ZONE_SLUG = "punta-cana";
export const revalidate = 86400;

export async function GET() {
  let combos: { landingSlug: string; lastMod: Date }[] = [];
  try {
    combos = await getDynamicTransferLandingCombos();
  } catch (error) {
    warnOnce("sitemap-transfers-db-fallback", "[sitemap-transfers] Falling back to static transfer landings due to DB error", error);
  }
  const manualLandings = allLandings().map((landing) => ({
    slug: landing.landingSlug,
    lastMod: new Date().toISOString()
  }));
  const genericLandings = genericTransferLandings.map((landing) => ({
    slug: landing.landingSlug,
    lastMod: new Date().toISOString()
  }));
  const landingMap = new Map<string, { slug: string; lastMod: string }>();
  [
    ...manualLandings,
    ...genericLandings,
    ...combos.map((combo) => ({ slug: combo.landingSlug, lastMod: combo.lastMod.toISOString() }))
  ].forEach((entry) => {
    landingMap.set(entry.slug, entry);
  });

  const urls = Array.from(landingMap.values())
    .map(({ slug, lastMod }) => {
      return `
        <url>
          <loc>${BASE_URL}/transfer/${slug}</loc>
          <lastmod>${lastMod}</lastmod>
          <priority>0.8</priority>
        </url>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
