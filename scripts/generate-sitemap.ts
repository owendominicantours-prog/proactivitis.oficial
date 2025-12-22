import { buildSitemapEntries } from "@/lib/sitemap-generator";
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
  const entries = await buildSitemapEntries();
  const xml = await buildXml(entries);
  const target = path.join(process.cwd(), "public", "sitemap.xml");
  await writeFile(target, xml, "utf8");
  console.log(`Updated sitemap with ${entries.length} entries`);
}

main()
  .catch((error) => {
    console.error("Sitemap generation failed", error);
    process.exit(1);
  })
