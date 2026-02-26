import { NextResponse } from "next/server";
import { allLandings } from "@/data/transfer-landings";
import { prisma } from "@/lib/prisma";
import { PRODISCOVERY_CATEGORIES, PRODISCOVERY_DESTINATIONS } from "@/lib/prodiscovery";

export const revalidate = 21600;

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;

const withLocale = (locale: (typeof LOCALES)[number], path: string) =>
  locale === "es" ? path : `/${locale}${path}`;

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

type UrlEntry = {
  loc: string;
  lastmod: string;
  changefreq?: "daily" | "weekly";
  priority?: number;
};

export async function GET() {
  const now = new Date();
  const nowIso = now.toISOString();

  const [tours, transfers] = await Promise.all([
    prisma.tour.findMany({
      where: { status: { in: ["published", "seo_only"] } },
      select: { slug: true }
    }),
    Promise.resolve(allLandings().map((item) => item.landingSlug))
  ]);

  const entries: UrlEntry[] = [];

  for (const locale of LOCALES) {
    entries.push({
      loc: `${BASE_URL}${withLocale(locale, "/prodiscovery")}`,
      lastmod: nowIso,
      changefreq: "daily",
      priority: 0.9
    });

    for (const destination of PRODISCOVERY_DESTINATIONS) {
      for (const category of PRODISCOVERY_CATEGORIES) {
        entries.push({
          loc: `${BASE_URL}${withLocale(locale, `/prodiscovery/top/${destination}/${category}`)}`,
          lastmod: nowIso,
          changefreq: "daily",
          priority: 0.8
        });
      }
    }
  }

  for (const tour of tours) {
    for (const locale of LOCALES) {
      entries.push({
        loc: `${BASE_URL}${withLocale(locale, `/prodiscovery/tour/${tour.slug}`)}`,
        lastmod: nowIso,
        changefreq: "weekly",
        priority: 0.7
      });
    }
  }

  for (const landingSlug of transfers) {
    for (const locale of LOCALES) {
      entries.push({
        loc: `${BASE_URL}${withLocale(locale, `/prodiscovery/transfer/${landingSlug}`)}`,
        lastmod: nowIso,
        changefreq: "weekly",
        priority: 0.65
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>${entry.changefreq ? `
    <changefreq>${entry.changefreq}</changefreq>` : ""}${entry.priority ? `
    <priority>${entry.priority.toFixed(2)}</priority>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}
