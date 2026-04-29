import { NextResponse } from "next/server";
import { allLandings } from "@/data/transfer-landings";
import {
  GOLDEN_TRANSFER_INTENTS,
  buildGoldenTransferPageSlug
} from "@/lib/goldenTransferPages";

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;
export const revalidate = 86400;

export async function GET() {
  const lastmod = new Date().toISOString();
  const urls = allLandings()
    .flatMap((landing) =>
      GOLDEN_TRANSFER_INTENTS.flatMap((intent) =>
        LOCALES.map((locale) => {
          const prefix = locale === "es" ? "" : `/${locale}`;
          return `${BASE_URL}${prefix}/punta-cana/transfer/${buildGoldenTransferPageSlug(landing.landingSlug, intent.slug)}`;
        })
      )
    )
    .map(
      (loc) => `
        <url>
          <loc>${loc}</loc>
          <lastmod>${lastmod}</lastmod>
          <priority>0.76</priority>
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
