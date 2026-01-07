import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://proactivitis.com";
export const revalidate = 86400;

export async function GET() {
  const hotels = await prisma.transferLocation.findMany({
    where: { type: "HOTEL", active: true },
    select: { slug: true, updatedAt: true }
  });

  const urls = hotels
    .map(({ slug, updatedAt }) => {
      const lastMod = updatedAt.toISOString();
      const entries = [
        `${BASE_URL}/things-to-do/${slug}`,
        `${BASE_URL}/en/things-to-do/${slug}`,
        `${BASE_URL}/fr/things-to-do/${slug}`
      ];
      return entries
        .map(
          (url) => `
        <url>
          <loc>${url}</loc>
          <lastmod>${lastMod}</lastmod>
          <priority>0.7</priority>
        </url>`
        )
        .join("");
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
