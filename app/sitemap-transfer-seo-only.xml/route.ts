import { NextResponse } from "next/server";
import { genericTransferLandings } from "@/data/transfer-generic-landings";

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;
export const revalidate = 86400;

export async function GET() {
  const lastmod = new Date().toISOString();
  const entries = genericTransferLandings.flatMap((landing) =>
    LOCALES.map((locale) => {
      const prefix = locale === "es" ? "" : `/${locale}`;
      return {
        loc: `${BASE_URL}${prefix}/transfer/${landing.landingSlug}`,
        lastmod
      };
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <priority>0.76</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}

