import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

const BASE_URL = "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;
const NEWS_PUBLICATION_NAME = "Proactivitis News";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const localizedNewsUrl = (locale: (typeof LOCALES)[number], slug: string) =>
  locale === "es" ? `${BASE_URL}/news/${slug}` : `${BASE_URL}/${locale}/news/${slug}`;

const isRecentForGoogleNews = (publishedAt: string) => {
  const publishedTime = new Date(publishedAt).getTime();
  if (!Number.isFinite(publishedTime)) return false;
  return Date.now() - publishedTime <= 48 * 60 * 60 * 1000;
};

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { not: null } },
    select: {
      slug: true,
      title: true,
      publishedAt: true,
      updatedAt: true,
      translations: {
        where: { locale: { in: ["en", "fr"] } },
        select: { locale: true, title: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  const urls = posts.flatMap((post) =>
    LOCALES.map((locale) => {
      const translatedTitle = post.translations.find((translation) => translation.locale === locale)?.title;
      const title = translatedTitle || post.title;
      const publishedAt = new Date(post.publishedAt as Date).toISOString();
      const lastmod = new Date(post.updatedAt).toISOString();
        const loc = localizedNewsUrl(locale, post.slug);
        const newsBlock = isRecentForGoogleNews(publishedAt)
          ? `
    <news:news>
      <news:publication>
        <news:name>${NEWS_PUBLICATION_NAME}</news:name>
        <news:language>${locale}</news:language>
      </news:publication>
      <news:publication_date>${publishedAt}</news:publication_date>
      <news:title>${escapeXml(title)}</news:title>
    </news:news>`
          : "";

        return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>${newsBlock}
  </url>`;
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}
