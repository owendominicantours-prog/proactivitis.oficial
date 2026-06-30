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

const localizedTourPath = (locale: (typeof LOCALES)[number], slug: string) =>
  locale === "es" ? `/tours/${slug}` : `/${locale}/tours/${slug}`;

export async function GET() {
  const tours = await prisma.tour.findMany({
    where: {
      status: "published",
      NOT: [{ slug: { contains: "transfer-privado" } }]
    },
    select: { slug: true, createdAt: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 500
  });

  const urls = tours
    .flatMap((tour) =>
      LOCALES.map((locale) => ({
        loc: `${BASE_URL}${localizedTourPath(locale, tour.slug)}`,
        lastmod: tour.createdAt.toISOString()
      }))
    )
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.82</priority>
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
