import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGeminiSeoPublicPath, listPublishedGeminiSeoLandings } from "@/lib/geminiSeoFactory";

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

  const [plannerDestinations, tours, geminiLandings] = await Promise.all([
    prisma.destination.findMany({
      where: {
        country: {
          code: { in: ["RD", "DO"] }
        }
      },
      select: { slug: true },
      take: 1000
    }),
    prisma.tour.findMany({
      where: {
        status: { in: ["published", "seo_only"] },
        OR: [
          { countryId: { in: ["RD", "DO"] } },
          { country: { slug: { in: ["republica-dominicana", "dominican-republic", "dominican-republic-rd"] } } }
        ]
      },
      select: { slug: true, createdAt: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 300
    }),
    listPublishedGeminiSeoLandings()
  ]);

  const entries: UrlEntry[] = [];

  for (const locale of LOCALES) {
    entries.push({
      loc: `${BASE_URL}${withLocale(locale, "/prodiscovery")}`,
      lastmod: nowIso,
      changefreq: "daily",
      priority: 0.9
    });

    for (const nichePath of [
      "/prodiscovery/republica-dominicana",
      "/prodiscovery/grupos-corporativos",
      "/prodiscovery/bodas-y-celebraciones",
      "/prodiscovery/familias-y-amigos"
    ]) {
      entries.push({
        loc: `${BASE_URL}${withLocale(locale, nichePath)}`,
        lastmod: nowIso,
        changefreq: "weekly",
        priority: 0.82
      });
    }

  }

  const plannerSlugs = Array.from(
    new Set([
      ...plannerDestinations.map((destination) => destination.slug),
      "punta-cana",
      "santo-domingo",
      "bayahibe",
      "la-romana",
      "puerto-plata",
      "samana",
      "sosua"
    ])
  );

  for (const slug of plannerSlugs) {
    for (const locale of LOCALES) {
      entries.push({
        loc: `${BASE_URL}${withLocale(locale, `/prodiscovery/planificador-grupos-${slug}`)}`,
        lastmod: nowIso,
        changefreq: "weekly",
        priority: 0.75
      });
    }
  }

  for (const tour of tours) {
    for (const locale of LOCALES) {
      entries.push({
        loc: `${BASE_URL}${withLocale(locale, `/prodiscovery/tour/${tour.slug}`)}`,
        lastmod: tour.createdAt.toISOString(),
        changefreq: "weekly",
        priority: 0.78
      });
    }
  }

  for (const landing of geminiLandings.filter((item) => item.type !== "rent_car")) {
    for (const locale of LOCALES) {
      entries.push({
        loc: `${BASE_URL}${getGeminiSeoPublicPath(landing.type, landing.slug, locale)}`,
        lastmod: landing.publishedAt ?? landing.generatedAt,
        changefreq: "weekly",
        priority: 0.76
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
