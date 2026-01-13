import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildBlogPostMetadata, renderBlogDetail } from "@/components/blog/BlogShared";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildBlogPostMetadata(slug, "en");
}

export default async function BlogDetailPageEn({ params }: PageProps) {
  const { slug } = await params;
  const page = await renderBlogDetail(slug, "en");
  if (!page) notFound();
  return page;
}
