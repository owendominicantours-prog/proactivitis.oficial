import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/site-config";

export const revalidate = 86400;

const FUNJET_TOUR_SLUGS = [
  "tour-en-buggy-en-punta-cana",
  "excursion-en-buggy-y-atv-en-punta-cana",
  "tour-isla-saona-desde-bayhibe-la-romana",
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana",
  "sunset-catamaran-snorkel",
  "parasailing-punta-cana",
  "cayo-levantado-luxury-beach-day",
  "excursion-de-un-dia-a-santo-domingo-desde-punta-cana",
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana",
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana",
  "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana",
  "private-buggy-tour-cenote-swim-dominican-lunch",
  "party-boat-sosua",
  "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua",
  "coco-bongo-punta-cana-show-disco-skip-the-line",
  "coco-bongo-punta-cana",
  "scape-park-punta-cana",
  "scape-park-full-admission-punta-cana",
  "scape-park-sunshine-cruise-punta-cana",
  "scape-park-buggies-punta-cana",
  "juanillo-vip-scape-park-punta-cana"
] as const;

const STATIC_PATHS = [
  "",
  "/en",
  "/fr",
  "/tours",
  "/en/tours",
  "/fr/tours",
  "/traslado",
  "/en/traslado",
  "/fr/traslado",
  "/punta-cana/tours",
  "/en/punta-cana/tours",
  "/fr/punta-cana/tours",
  "/punta-cana/traslado",
  "/en/punta-cana/traslado",
  "/fr/punta-cana/traslado",
  "/punta-cana/premium-transfer-services",
  "/en/punta-cana/premium-transfer-services",
  "/fr/punta-cana/premium-transfer-services"
] as const;

const buildEntries = () => {
  const baseUrl = SITE_CONFIG.url;
  const lastmod = new Date().toISOString();

  const staticEntries = STATIC_PATHS.map((path) => ({
    loc: `${baseUrl}${path}`,
    lastmod,
    changefreq: path === "" ? "daily" : "weekly",
    priority: path === "" ? "1.0" : "0.8"
  }));

  const localizedTourEntries = FUNJET_TOUR_SLUGS.flatMap((slug) => [
    { loc: `${baseUrl}/tours/${slug}`, lastmod, changefreq: "weekly", priority: "0.9" },
    { loc: `${baseUrl}/en/tours/${slug}`, lastmod, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/fr/tours/${slug}`, lastmod, changefreq: "weekly", priority: "0.8" }
  ]);

  return [...staticEntries, ...localizedTourEntries];
};

export async function GET() {
  if (SITE_CONFIG.variant !== "funjet") {
    return new NextResponse("Not found", { status: 404 });
  }

  const entries = buildEntries();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" }
  });
}
