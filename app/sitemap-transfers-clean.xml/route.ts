import { NextResponse } from "next/server";
import { allLandings } from "@/data/transfer-landings";

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

const localizedTransferPath = (locale: (typeof LOCALES)[number], slug: string) =>
  locale === "es" ? `/transfer/${slug}` : `/${locale}/transfer/${slug}`;

export async function GET() {
  const lastmod = new Date().toISOString();
  const uniqueLandings = Array.from(new Map(allLandings().map((landing) => [landing.landingSlug, landing])).values());
  const urls = uniqueLandings
    .flatMap((landing) =>
      LOCALES.map((locale) => ({
        loc: `${BASE_URL}${localizedTransferPath(locale, landing.landingSlug)}`
      }))
    )
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
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
