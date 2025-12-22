import { NextResponse } from "next/server";

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://proactivitis.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://proactivitis.com/tours</loc>
    <priority>0.8</priority>
  </url>
</urlset>`;

export async function GET() {
  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate"
    }
  });
}
