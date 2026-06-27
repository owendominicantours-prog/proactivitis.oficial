import { NextResponse } from "next/server";

import { buildSitemapEntries } from "@/lib/sitemap-generator";

export const revalidate = 86400;

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const { hybridLinks } = await buildSitemapEntries();
  const lastmod = new Date().toISOString();
  const urls = hybridLinks
    .flatMap((link) =>
      LOCALES.map((locale) => {
        const path = `/tours/${link.tourSlug}/recogida/${link.hotelSlug}`;
        return locale === "es" ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
      })
    )
    .map(
      (loc) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.72</priority>
  </url>`
    )
    .join("\n");

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800"
    }
  });
}
