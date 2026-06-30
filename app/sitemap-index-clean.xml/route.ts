import { NextResponse } from "next/server";

export const revalidate = 86400;

const BASE_URL = "https://proactivitis.com";

const SITEMAPS = [
  "/sitemap-core-clean.xml",
  "/sitemap-tours-clean.xml",
  "/sitemap-transfers-clean.xml",
  "/sitemap-hotels-clean.xml",
  "/sitemap-blog.xml",
  "/sitemap-rent-a-car.xml"
] as const;

export async function GET() {
  const lastmod = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAPS.map(
  (path) => `  <sitemap>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
).join("\n")}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}
