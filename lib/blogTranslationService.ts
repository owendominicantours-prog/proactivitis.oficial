import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translationService";

const BLOG_LOCALES = ["en", "fr"] as const;

const buildHash = (input: string) =>
  createHash("sha256").update(input, "utf8").digest("hex");

const buildBlogSourceHash = (post: { title: string; excerpt?: string | null; contentHtml: string }) =>
  buildHash([post.title, post.excerpt ?? "", post.contentHtml].join("||"));

export async function translateBlogPost(postId: string, locale: (typeof BLOG_LOCALES)[number]) {
  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) return;

  const sourceHash = buildBlogSourceHash(post);
  const existing = await prisma.blogPostTranslation.findUnique({
    where: { blogPostId_locale: { blogPostId: postId, locale } }
  });

  if (existing?.sourceHash === sourceHash && existing.status === "COMPLETED") {
    return;
  }

  const [translatedTitle, translatedExcerpt, translatedHtml] = await Promise.all([
    translateText(post.title, locale),
    post.excerpt ? translateText(post.excerpt, locale) : Promise.resolve(""),
    translateText(post.contentHtml, locale)
  ]);

  await prisma.blogPostTranslation.upsert({
    where: { blogPostId_locale: { blogPostId: postId, locale } },
    update: {
      title: translatedTitle,
      excerpt: translatedExcerpt || null,
      contentHtml: translatedHtml,
      status: "COMPLETED",
      sourceHash
    },
    create: {
      blogPostId: postId,
      locale,
      title: translatedTitle,
      excerpt: translatedExcerpt || null,
      contentHtml: translatedHtml,
      status: "COMPLETED",
      sourceHash
    }
  });
}

export async function translateBlogPostAllLocales(postId: string) {
  for (const locale of BLOG_LOCALES) {
    await translateBlogPost(postId, locale);
  }
}
