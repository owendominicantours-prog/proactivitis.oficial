import { NextResponse } from "next/server";
import { buildSitemapEntries } from "@/lib/sitemap-generator";

export const revalidate = 86400;

export async function GET() {
  const { hotelEntries } = await buildSitemapEntries();
  const urls = hotelEntries
    .map(
      (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
