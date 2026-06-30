import { NextResponse } from "next/server";

export const revalidate = 86400;

const BASE_URL = "https://proactivitis.com";

const CORE_PATHS = [
  { path: "/", priority: 1 },
  { path: "/en", priority: 0.94 },
  { path: "/fr", priority: 0.94 },
  { path: "/tours", priority: 0.92 },
  { path: "/en/tours", priority: 0.88 },
  { path: "/fr/tours", priority: 0.88 },
  { path: "/traslado", priority: 0.92 },
  { path: "/en/traslado", priority: 0.88 },
  { path: "/fr/traslado", priority: 0.88 },
  { path: "/hoteles", priority: 0.86 },
  { path: "/en/hotels", priority: 0.84 },
  { path: "/fr/hotels", priority: 0.84 },
  { path: "/punta-cana/tours", priority: 0.86 },
  { path: "/en/punta-cana/tours", priority: 0.82 },
  { path: "/fr/punta-cana/tours", priority: 0.82 },
  { path: "/punta-cana/traslado", priority: 0.86 },
  { path: "/en/punta-cana/traslado", priority: 0.82 },
  { path: "/fr/punta-cana/traslado", priority: 0.82 },
  { path: "/prodiscovery", priority: 0.74 },
  { path: "/en/prodiscovery", priority: 0.72 },
  { path: "/fr/prodiscovery", priority: 0.72 },
  { path: "/contact", priority: 0.68 },
  { path: "/legal/terms", priority: 0.52 },
  { path: "/legal/privacy", priority: 0.52 },
  { path: "/legal/refund-policy", priority: 0.56 },
  { path: "/legal/shipping-policy", priority: 0.52 },
  { path: "/legal/cookies", priority: 0.5 },
  { path: "/legal/information", priority: 0.5 },
  { path: "/merchant-center/products.tsv", priority: 0.5 },
  { path: "/merchant-center/tours.json", priority: 0.5 }
] as const;

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export async function GET() {
  const lastmod = new Date().toISOString();
  const urls = CORE_PATHS.map(
    (entry) => `  <url>
    <loc>${escapeXml(`${BASE_URL}${entry.path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${entry.priority.toFixed(2)}</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}
