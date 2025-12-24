import { buildSitemapEntries } from "@/lib/sitemap-generator";

export default async function sitemap() {
  const { hotelEntries } = await buildSitemapEntries();
  return hotelEntries;
}
