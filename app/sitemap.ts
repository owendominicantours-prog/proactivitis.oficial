import { buildSitemapEntries } from "@/lib/sitemap-generator";

export default async function sitemap() {
  const { tourEntries, hotelEntries } = await buildSitemapEntries();
  const seen = new Set<string>();
  return [...tourEntries, ...hotelEntries].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
