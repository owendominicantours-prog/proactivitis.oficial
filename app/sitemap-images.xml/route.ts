import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";

export const revalidate = 86400;

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${PROACTIVITIS_URL}${normalized}`;
};

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as string[]) ?? [];
  } catch {
    return [];
  }
};

export async function GET() {
  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    select: { slug: true, heroImage: true, gallery: true }
  });

  const urls = tours
    .flatMap((tour) => {
      const hero = toAbsoluteUrl(tour.heroImage);
      const gallery = parseGallery(tour.gallery)
        .map((item) => toAbsoluteUrl(item))
        .filter(Boolean);
      const images = [hero, ...gallery].filter(Boolean).slice(0, 5);
      if (!images.length) return [];
      const imageTags = images
        .map(
          (imageUrl) => `
      <image:image>
        <image:loc>${imageUrl}</image:loc>
      </image:image>`
        )
        .join("");
      const basePath = `/tours/${tour.slug}`;
      return ["", "/en", "/fr"].map((prefix) => ({
        loc: `${PROACTIVITIS_URL}${prefix}${basePath}`,
        imageTags
      }));
    })
    .map(
      (entry) => `
    <url>
      <loc>${entry.loc}</loc>${entry.imageTags}
    </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
