import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildBlogPostMetadata, renderBlogDetail } from "@/components/blog/BlogShared";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildBlogPostMetadata(slug, "fr");
}

export default async function BlogDetailPageFr({ params }: PageProps) {
  const { slug } = await params;
  const page = await renderBlogDetail(slug, "fr");
  if (!page) notFound();
  return page;
}
