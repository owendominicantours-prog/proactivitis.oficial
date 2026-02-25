import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SANTO_DOMINGO_SEO_PRICE = 55;

const SAONA_PRICE_BY_SLUG: Record<string, number> = {
  "saona-saona-island-tour-with-lunch-and-pickup": 95,
  "saona-saona-island-tour-in-punta-cana-with-lunch-included": 82,
  "saona-saona-island-from-punta-cana-with-transportation-and-lunch-included": 78,
  "saona-saona-island-from-punta-cana": 75,
  "saona-saona-island-full-day-catamaran-tour-small-group": 165,
  "saona-saona-catamaran-cruise-with-lunch-and-natural-swimming-pool": 75,
  "saona-full-day-tour-to-saona-island-sailing-with-lunch-and-beverages": 82,
  "saona-saona-island-small-group-tour-with-natural-pool-lunch-drinks": 139,
  "saona-saona-private-tour-with-own-guide-and-transport-from-punta-cana": 165,
  "saona-saona-island-sailing-tour-all-inclusive": 72,
  "saona-saona-island-altos-de-chavon-day-trip-with-lunch-and-open-bar": 88,
  "saona-saona-island-excursion-from-punta-cana": 82,
  "saona-saona-island-day-trip-speedboat-and-catamaran": 75,
  "saona-saona-island-beach-and-natural-pool-experience": 78,
  "saona-saona-island-premium-day-experience": 139,
  "saona-saona-island-with-open-bar-and-buffet-lunch": 82,
  "saona-saona-island-relax-and-snorkel-day-trip": 75,
  "saona-saona-island-tropical-escape-from-punta-cana": 75,
  "saona-saona-island-catuano-and-natural-pool-tour": 139,
  "saona-saona-island-with-dominican-lunch-and-drinks": 95,
  "saona-saona-island-ultimate-day-from-punta-cana": 82,
  "saona-saona-island-group-day-tour": 64,
  "saona-saona-island-vip-private-option": 165,
  "saona-saona-island-family-friendly-day-trip": 64,
  "saona-saona-island-full-day-caribbean-cruise": 75,
  "saona-saona-island-beach-party-catamaran-experience": 72,
  "saona-saona-island-speedboat-adventure": 75,
  "saona-saona-island-and-palmilla-natural-pool-day-trip": 75,
  "saona-saona-island-best-value-day-tour": 64,
  "saona-saona-island-dream-beaches-excursion": 75
};

async function main() {
  const saonaSlugs = Object.keys(SAONA_PRICE_BY_SLUG);

  let saonaUpdated = 0;
  for (const slug of saonaSlugs) {
    const result = await prisma.tour.updateMany({
      where: {
        slug,
        status: "seo_only"
      },
      data: { price: SAONA_PRICE_BY_SLUG[slug] }
    });
    saonaUpdated += result.count;
  }

  const santoResult = await prisma.tour.updateMany({
    where: {
      status: "seo_only",
      slug: {
        startsWith: "santo-domingo-"
      }
    },
    data: { price: SANTO_DOMINGO_SEO_PRICE }
  });

  console.log(
    JSON.stringify(
      {
        santoDomingoUpdated: santoResult.count,
        santoDomingoPrice: SANTO_DOMINGO_SEO_PRICE,
        saonaMappedSlugs: saonaSlugs.length,
        saonaUpdated
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

