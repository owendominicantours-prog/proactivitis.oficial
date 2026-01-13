import type { Metadata } from "next";
import { buildBlogMetadata, renderBlogList } from "@/components/blog/BlogShared";

export async function generateMetadata(): Promise<Metadata> {
  return buildBlogMetadata("en");
}

export default async function NewsPageEn() {
  return renderBlogList("en");
}
