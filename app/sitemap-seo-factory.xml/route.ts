import { NextResponse } from "next/server";
import { listPublishedGeminiSeoLandings } from "@/lib/geminiSeoFactory";

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;

export const revalidate = 3600;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const absoluteImage = (value?: string | null) => {
  if (!value) return `${BASE_URL}/transfer/sedan.png`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

export async function GET() {
  const landings = await listPublishedGeminiSeoLandings();
  const entries = landings.flatMap((landing) =>
    LOCALES.map((locale) => {
      const prefix = locale === "es" ? "" : `/${locale}`;
      const content = landing.locales[locale] ?? landing.locales.es;
      return {
        loc: `${BASE_URL}${prefix}/seo/${landing.slug}`,
        lastmod: landing.publishedAt ?? landing.generatedAt,
        image: absoluteImage(content.image || landing.product.image),
        imageTitle: content.imageAlt || content.h1
      };
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${escapeXml(new Date(entry.lastmod).toISOString())}</lastmod>
    <priority>0.78</priority>
    <image:image>
      <image:loc>${escapeXml(entry.image)}</image:loc>
      <image:title>${escapeXml(entry.imageTitle)}</image:title>
    </image:image>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
