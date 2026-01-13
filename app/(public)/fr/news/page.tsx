import type { Metadata } from "next";
import { buildBlogMetadata, renderBlogList } from "@/components/blog/BlogShared";

export async function generateMetadata(): Promise<Metadata> {
  return buildBlogMetadata("fr");
}

export default async function NewsPageFr() {
  return renderBlogList("fr");
}
