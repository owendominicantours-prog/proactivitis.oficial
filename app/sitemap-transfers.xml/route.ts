import { NextResponse } from "next/server";
import { transferLandings } from "@/data/transfer-landings";

const BASE_URL = "https://proactivitis.com";

export async function GET() {
  const urlEntries = transferLandings.flatMap((landing) => [
    landing.landingSlug,
    landing.reverseSlug
  ]);
  const urls = urlEntries
    .map((slug) => {
      const lastMod = new Date().toISOString();
      return `
        <url>
          <loc>${BASE_URL}/transfer/${slug}</loc>
          <lastmod>${lastMod}</lastmod>
          <priority>0.8</priority>
        </url>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
