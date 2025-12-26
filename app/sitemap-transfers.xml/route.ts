import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://proactivitis.com";
const ZONE_SLUG = "punta-cana";
export const revalidate = 86400;

export async function GET() {
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

  const urlEntries = hotels.flatMap((hotel) => {
    const lastMod = hotel.updatedAt.toISOString();
    const forwardSlug = `punta-cana-international-airport-to-${hotel.slug}`;
    const reverseSlug = `${hotel.slug}-to-punta-cana-international-airport`;
    return [
      { slug: forwardSlug, lastMod },
      { slug: reverseSlug, lastMod }
    ];
  });

  const urls = urlEntries
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
