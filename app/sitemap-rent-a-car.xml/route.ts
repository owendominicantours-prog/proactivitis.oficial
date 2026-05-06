import { NextResponse } from "next/server";
import { getRentCarOptionPath, getRentCarOptions, getRentCarRootPath, type RentCarLocale } from "@/data/rentCarFleet";
import { getRentCarFleetSettings } from "@/lib/rentCarSettings";

export const revalidate = 86400;

const BASE_URL = "https://proactivitis.com";

export async function GET() {
  const lastmod = new Date().toISOString();
  const locales: RentCarLocale[] = ["es", "en", "fr"];
  const settings = await getRentCarFleetSettings();
  const urls = [
    ...locales.map((locale) => ({
      loc: `${BASE_URL}${getRentCarRootPath(locale)}`,
      priority: "0.8"
    })),
    ...locales.flatMap((locale) =>
      getRentCarOptions(undefined, settings).map((option) => ({
        loc: `${BASE_URL}${getRentCarOptionPath(option.locationId, option.categorySlug, locale)}`,
        priority: option.highProfile ? "0.9" : "0.7"
      }))
    )
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
