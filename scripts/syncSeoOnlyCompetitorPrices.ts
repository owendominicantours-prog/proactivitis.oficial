import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SANTO_DOMINGO_PRICE_BY_SLUG: Record<string, number> = {
  "santo-domingo-alcazar-colon-catedral": 80,
  "santo-domingo-city-tour-completo-capital-rd": 75,
  "santo-domingo-city-tour-santo-domingo-desde-punta-cana": 85,
  "santo-domingo-cultura-y-gastronomia-local": 85,
  "santo-domingo-escapada-cultural-desde-punta-cana": 75,
  "santo-domingo-excursion-cultural-sin-estres": 55,
  "santo-domingo-historia-colonial-completa": 80,
  "santo-domingo-malecon-y-centro-historico": 80,
  "santo-domingo-patrimonio-y-arquitectura": 80,
  "santo-domingo-primer-viaje-a-santo-domingo": 55,
  "santo-domingo-ruta-educativa-familiar": 75,
  "santo-domingo-rutas-fotograficas-santo-domingo": 85,
  "santo-domingo-santo-domingo-colonial-unesco": 80,
  "santo-domingo-santo-domingo-con-entradas": 94,
  "santo-domingo-santo-domingo-con-paradas-clave": 55,
  "santo-domingo-santo-domingo-cultural-premium": 85,
  "santo-domingo-santo-domingo-esencial": 55,
  "santo-domingo-santo-domingo-familias": 75,
  "santo-domingo-santo-domingo-grupos": 55,
  "santo-domingo-santo-domingo-historia-viva": 80,
  "santo-domingo-santo-domingo-imperdible": 55,
  "santo-domingo-santo-domingo-panoramico": 85,
  "santo-domingo-santo-domingo-premium-cultural": 91,
  "santo-domingo-tour-dia-historia-y-ciudad": 80,
  "santo-domingo-tour-para-parejas": 85,
  "santo-domingo-tour-unesco-con-guia": 80,
  "santo-domingo-tour-vip-dia-completo": 100,
  "santo-domingo-tour-zona-colonial": 80,
  "santo-domingo-tres-ojos-experiencia-cultural": 94,
  "santo-domingo-tres-ojos-y-zona-colonial": 75
};

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

  let santoUpdated = 0;
  for (const [slug, price] of Object.entries(SANTO_DOMINGO_PRICE_BY_SLUG)) {
    const result = await prisma.tour.updateMany({
      where: { slug, status: "seo_only" },
      data: { price }
    });
    santoUpdated += result.count;
  }

  console.log(
    JSON.stringify(
      {
        santoDomingoMappedSlugs: Object.keys(SANTO_DOMINGO_PRICE_BY_SLUG).length,
        santoDomingoUpdated: santoUpdated,
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
