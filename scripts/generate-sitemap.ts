import { buildSitemapEntries } from "../lib/sitemap-generator";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n';
const XML_URLSET = "http://www.sitemaps.org/schemas/sitemap/0.9";

async function buildXml(entries: { url: string; priority: number }[]) {
  const lines = entries.map(
    (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
  );
  return `${XML_HEADER}<urlset xmlns="${XML_URLSET}">${lines.join("")}\n</urlset>\n`;
}

async function main() {
  const { tourEntries, hotelEntries } = await buildSitemapEntries();
  const tourXml = await buildXml(tourEntries);
  const hotelXml = await buildXml(hotelEntries);
  const tourTarget = path.join(process.cwd(), "public", "sitemap.xml");
  const hotelTarget = path.join(process.cwd(), "public", "sitemap-hotels.xml");
  await Promise.all([
    writeFile(tourTarget, tourXml, "utf8"),
    writeFile(hotelTarget, hotelXml, "utf8")
  ]);
  console.log(
    `Updated sitemap with ${tourEntries.length} tour entries and ${hotelEntries.length} hotel entries`
  );
}

main()
  .catch((error) => {
    console.error("Sitemap generation failed", error);
    process.exit(1);
  })
