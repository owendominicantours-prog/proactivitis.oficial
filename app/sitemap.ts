import { buildSitemapEntries } from "@/lib/sitemap-generator";

const BASE_URL = "https://proactivitis.com";

const STATIC_POLICY_ENTRIES = [
  "/",
  "/contact",
  "/legal/terms",
  "/legal/privacy",
  "/legal/refund-policy",
  "/legal/shipping-policy",
  "/legal/cookies",
  "/legal/information",
  "/account-deletion",
  "/merchant-center/products.tsv",
  "/merchant-center/tours.json"
].map((path) => ({
  url: `${BASE_URL}${path}`,
  priority: path === "/" ? 1 : path.startsWith("/legal") ? 0.55 : 0.7
}));

export default async function sitemap() {
  const { tourEntries, hotelEntries } = await buildSitemapEntries();
  const seen = new Set<string>();
  return [...STATIC_POLICY_ENTRIES, ...tourEntries, ...hotelEntries].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
