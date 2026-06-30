import { NextResponse } from "next/server";
import { DISCOVERED_NOT_INDEXED_URLS } from "@/data/discovered-not-indexed-urls";

export const revalidate = 3600;

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const isCleanSitemapUrl = (value: string) => {
  try {
    const url = new URL(value);
    return !url.search && !url.hash;
  } catch {
    return false;
  }
};

export async function GET() {
  const now = new Date().toISOString();
  const urls = DISCOVERED_NOT_INDEXED_URLS.filter(isCleanSitemapUrl).map((url) => {
    return `
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
