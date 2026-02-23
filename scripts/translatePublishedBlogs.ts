import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";
import { translateText } from "../lib/translationService";

const prisma = new PrismaClient();
const TARGET_LOCALES = ["en", "fr"] as const;

const hash = (input: string) => createHash("sha256").update(input, "utf8").digest("hex");

const sourceHashForPost = (post: { title: string; excerpt: string | null; contentHtml: string }) =>
  hash([post.title, post.excerpt ?? "", post.contentHtml].join("||"));

async function translatePost(post: { id: string; title: string; excerpt: string | null; contentHtml: string }) {
  const sourceHash = sourceHashForPost(post);
  let updated = 0;

  for (const locale of TARGET_LOCALES) {
    const existing = await prisma.blogPostTranslation.findUnique({
      where: { blogPostId_locale: { blogPostId: post.id, locale } },
      select: { sourceHash: true, status: true }
    });

    if (existing?.sourceHash === sourceHash && existing.status === "COMPLETED") {
      continue;
    }

    const [title, excerpt, contentHtml] = await Promise.all([
      translateText(post.title, locale),
      post.excerpt ? translateText(post.excerpt, locale) : Promise.resolve(""),
      translateText(post.contentHtml, locale)
    ]);

    await prisma.blogPostTranslation.upsert({
      where: { blogPostId_locale: { blogPostId: post.id, locale } },
      update: {
        title,
        excerpt: excerpt || null,
        contentHtml,
        status: "COMPLETED",
        sourceHash
      },
      create: {
        blogPostId: post.id,
        locale,
        title,
        excerpt: excerpt || null,
        contentHtml,
        status: "COMPLETED",
        sourceHash
      }
    });
    updated += 1;
  }

  return updated;
}

async function main() {
  const sinceHoursArg = process.argv.find((arg) => arg.startsWith("--sinceHours="));
  const sinceHours = sinceHoursArg ? Number(sinceHoursArg.split("=")[1]) : null;

  const where = {
    status: "PUBLISHED" as const,
    ...(sinceHours && Number.isFinite(sinceHours)
      ? { createdAt: { gte: new Date(Date.now() - sinceHours * 60 * 60 * 1000) } }
      : {})
  };

  const posts = await prisma.blogPost.findMany({
    where,
    select: { id: true, title: true, excerpt: true, contentHtml: true, slug: true },
    orderBy: { createdAt: "desc" }
  });

  let touched = 0;
  let updatedTranslations = 0;

  for (const post of posts) {
    const changed = await translatePost(post);
    if (changed > 0) {
      touched += 1;
      updatedTranslations += changed;
    }
  }

  console.log(
    JSON.stringify(
      {
        postsChecked: posts.length,
        postsTouched: touched,
        updatedTranslations
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

