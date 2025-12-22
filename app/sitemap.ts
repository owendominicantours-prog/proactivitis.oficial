import { NextRequest } from "next/server";

const baseUrl = "https://proactivitis.com";

const routes = [
  { path: "/", priority: 1, changefreq: "daily" },
  { path: "/tours", priority: 0.9, changefreq: "daily" },
  { path: "/destinations", priority: 0.8, changefreq: "weekly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" }
];

const buildUrlEntry = (path: string, changefreq: string, priority: number) => `
  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

export async function GET(request: NextRequest) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => buildUrlEntry(route.path, route.changefreq, route.priority))
  .join("")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, s-maxage=86400"
    }
  });
}
