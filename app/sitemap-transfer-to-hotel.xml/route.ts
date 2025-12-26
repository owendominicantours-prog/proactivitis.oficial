import { NextResponse } from "next/server";
import { transferLandingPromotions } from "@/data/promotions";

const BASE_URL = "https://proactivitis.com";

export async function GET() {
  const urls = transferLandingPromotions.map((promotion) => {
    const lastMod = new Date().toISOString();
    const url = `${BASE_URL}/transfers/puj-to-hotel/${promotion.destinationSlug}`;
    return `
      <url>
        <loc>${url}</loc>
        <lastmod>${lastMod}</lastmod>
        <priority>0.75</priority>
      </url>
    `;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}
