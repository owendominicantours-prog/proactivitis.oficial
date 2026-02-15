import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  SAFETY_GUIDE_SLUG_SUFFIX,
  SAFETY_GUIDE_BASE_PATH,
  SAFETY_GUIDE_BASE_URL
} from "@/lib/safety-guide";

const LOCALES = ["es", "en", "fr"] as const;
export const revalidate = 86400;

export async function GET() {
  let hotels: { slug: string; updatedAt: Date }[] = [];
  try {
    hotels = await prisma.transferLocation.findMany({
      where: { type: "HOTEL", active: true },
      select: { slug: true, updatedAt: true }
    });
  } catch (error) {
    console.warn("[sitemap-safety-guides] Falling back to empty sitemap due to DB error", error);
  }

  const urls = hotels
    .map(({ slug, updatedAt }) => {
      const lastMod = updatedAt.toISOString();
      return LOCALES.map((locale) => {
        const prefix = locale === "es" ? "" : `/${locale}`;
        const url = `${SAFETY_GUIDE_BASE_URL}${prefix}/${SAFETY_GUIDE_BASE_PATH}/${slug}${SAFETY_GUIDE_SLUG_SUFFIX}`;
        return `
        <url>
          <loc>${url}</loc>
          <lastmod>${lastMod}</lastmod>
          <priority>0.7</priority>
        </url>`;
      }).join("");
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
