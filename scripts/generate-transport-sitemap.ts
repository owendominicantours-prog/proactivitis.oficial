import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient();

async function main() {
  const hotels = await prisma.location.findMany({
    where: { countryId: "RD" },
    select: { slug: true }
  });

  const urls = hotels.map((hotel) => `  <url>
    <loc>https://proactivitis.com/transporte/punta-cana/to-${hotel.slug}</loc>
    <priority>0.65</priority>
  </url>`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  writeFileSync("public/sitemap-hotels.xml", xml, "utf8");
  console.log(`Generated transporte sitemap for ${hotels.length} hotels`);
}

main()
  .catch((error) => {
    console.error("Failed to generate transport sitemap", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
