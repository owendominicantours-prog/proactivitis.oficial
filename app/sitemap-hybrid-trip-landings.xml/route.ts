import { NextResponse } from "next/server";
import { getHybridLanding, getHybridLandingStaticParams } from "@/lib/hybridTripLandings";

export const revalidate = 86400;

export async function GET() {
  const lastmod = new Date().toISOString();
  const entries = getHybridLandingStaticParams()
    .map((params) => getHybridLanding(params.zoneSlug, params.audienceMonth))
    .filter((landing): landing is NonNullable<typeof landing> => Boolean(landing));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (landing) => `  <url>
    <loc>${landing.canonical}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.78</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
