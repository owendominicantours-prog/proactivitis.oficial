import { buildSitemapEntries } from "@/lib/sitemap-generator";

export default async function sitemap() {
  return buildSitemapEntries();
}
