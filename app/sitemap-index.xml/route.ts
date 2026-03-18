import { NextResponse } from "next/server";

export const revalidate = 86400;

const BASE_URL = "https://proactivitis.com";

const SITEMAPS = [
  "/sitemap.xml",
  "/sitemap-hotels.xml",
  "/sitemap-transfers.xml",
  "/sitemap-tour-variants.xml",
  "/sitemap-things-to-do.xml",
  "/sitemap-party-boat.xml",
  "/sitemap-santo-domingo.xml",
  "/sitemap-samana-whale.xml",
  "/sitemap-buggy-atv.xml",
  "/sitemap-parasailing.xml",
  "/sitemap-safety-guides.xml",
  "/sitemap-i18n.xml",
  "/sitemap-images.xml",
  "/sitemap-seo-only-tours.xml",
  "/sitemap-transfer-seo-only.xml",
  "/sitemap-urgent-discovered.xml"
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
    headers: { "Content-Type": "application/xml" }
  });
}
