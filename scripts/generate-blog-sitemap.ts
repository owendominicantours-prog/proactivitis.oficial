import fs from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://proactivitis.com";
const LOCALES = ["es", "en", "fr"] as const;

const toAbsolute = (urlPath: string) => `${BASE_URL.replace(/\/+$/, "")}${urlPath}`;

async function main() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" }
  });

  const urls: Array<{ loc: string; lastmod: string }> = [];
  for (const post of posts) {
    for (const locale of LOCALES) {
      const loc =
        locale === "es"
          ? toAbsolute(`/news/${post.slug}`)
          : toAbsolute(`/${locale}/news/${post.slug}`);
      urls.push({ loc, lastmod: post.updatedAt.toISOString() });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  const outPath = path.join(process.cwd(), "public", "sitemap-blog.xml");
  await fs.writeFile(outPath, xml, "utf8");

  console.log(
    JSON.stringify(
      {
        generated: outPath,
        posts: posts.length,
        urls: urls.length
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

