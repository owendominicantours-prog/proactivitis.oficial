import { NextResponse } from "next/server";

import {
  NUEVA_GENERACION_BASE_URL,
  NUEVA_GENERACION_INTENT_PATH,
  NUEVA_GENERACION_INTENTS,
  NUEVA_GENERACION_PATH,
  getNuevaGeneracionTours
} from "@/lib/nuevaGeneracionTours";
import { warnOnce } from "@/lib/logOnce";

export const revalidate = 86400;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  let tours: { slug: string }[] = [];
  try {
    tours = await getNuevaGeneracionTours();
  } catch (error) {
    warnOnce("sitemap-experiencias-db-fallback", "[sitemap-experiencias] Falling back to index only", error);
  }

  const lastmod = new Date().toISOString();
  const urls = [
    { loc: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}`, priority: "0.70" },
    ...NUEVA_GENERACION_INTENTS.map((intent) => ({
      loc: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_INTENT_PATH}/${intent.slug}`,
      priority: "0.80"
    })),
    ...tours.map((tour) => ({
      loc: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}/${tour.slug}`,
      priority: "0.86"
    })),
    ...tours.flatMap((tour) =>
      NUEVA_GENERACION_INTENTS.map((intent) => ({
        loc: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}/${tour.slug}/${intent.slug}`,
        priority: "0.88"
      }))
    )
  ];

  const xml = urls
    .map(
      ({ loc, priority }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("\n");

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xml}
</urlset>`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800"
    }
  });
}
