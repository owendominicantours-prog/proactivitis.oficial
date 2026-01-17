import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;
export const revalidate = 86400;

export async function GET() {
  const variants = await prisma.tourVariant.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true }
  });

  const urls = variants
    .map((variant) =>
      LOCALES.map((locale) => {
        const prefix = locale === "es" ? "" : `/${locale}`;
        const url = `${BASE_URL}${prefix}/thingtodo/tours/${variant.slug}`;
        return `
        <url>
          <loc>${url}</loc>
          <priority>0.7</priority>
        </url>`;
      }).join("")
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
