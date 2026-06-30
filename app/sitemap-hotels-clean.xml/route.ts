import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 86400;

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const localizedHotelPath = (locale: (typeof LOCALES)[number], slug: string) =>
  locale === "es" ? `/hoteles/${slug}` : `/${locale}/hotels/${slug}`;

export async function GET() {
  const hotels = await prisma.transferLocation.findMany({
    where: { type: "HOTEL", active: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 500
  });

  const urls = hotels
    .flatMap((hotel) =>
      LOCALES.map((locale) => ({
        loc: `${BASE_URL}${localizedHotelPath(locale, hotel.slug)}`,
        lastmod: hotel.updatedAt.toISOString()
      }))
    )
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.74</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}
