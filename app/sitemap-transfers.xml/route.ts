import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";

const BASE_URL = "https://proactivitis.com";
const ZONE_SLUG = "punta-cana";
export const revalidate = 86400;

export async function GET() {
  const manualLandings = allLandings().map((landing) => ({
    slug: landing.landingSlug,
    lastMod: new Date().toISOString()
  }));

  const hotels = await prisma.transferLocation.findMany({
    where: {
      type: "HOTEL",
      active: true,
      zone: {
        slug: ZONE_SLUG
      }
    },
    select: {
      slug: true,
      updatedAt: true
    }
  });

  const dynamicLandings = hotels.map((hotel) => ({
    slug: `punta-cana-international-airport-to-${hotel.slug}`,
    lastMod: hotel.updatedAt.toISOString()
  }));

  const landingMap = new Map<string, { slug: string; lastMod: string }>();
  [...manualLandings, ...dynamicLandings].forEach((entry) => {
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
