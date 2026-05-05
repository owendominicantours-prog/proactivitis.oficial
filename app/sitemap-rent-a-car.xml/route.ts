import { NextResponse } from "next/server";
import { getRentCarOptions } from "@/data/rentCarFleet";

export const runtime = "edge";
export const revalidate = 86400;

const BASE_URL = "https://proactivitis.com";

export async function GET() {
  const lastmod = new Date().toISOString();
  const urls = [
    {
      loc: `${BASE_URL}/en/rent-a-car`,
      priority: "0.8"
    },
    ...getRentCarOptions().map((option) => ({
      loc: `${BASE_URL}${option.href}`,
      priority: option.highProfile ? "0.9" : "0.7"
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
