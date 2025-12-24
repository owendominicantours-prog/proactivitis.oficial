import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const countryData = {
  name: "República Dominicana",
  slug: "dominican-republic",
  code: "RD",
  shortDescription: "Destino caribeño líder con playas de arena blanca y lujo todo incluido."
};

const destinationData = {
  name: "Punta Cana",
  slug: "punta-cana",
  shortDescription: "Zona turística premium del este de República Dominicana con sol, playa y experiencias exclusivas."
};

const microZoneToZoneIdMap: Record<string, string> = {
  "cap-cana": "PUJ_BAVARO",
  "cabeza-de-toro": "PUJ_BAVARO",
  "bavaro-cortecito": "PUJ_BAVARO",
  "arena-gorda": "PUJ_BAVARO",
  "uvero-alto": "UVERO_MICHES",
  "bavaro-majestic": "PUJ_BAVARO",
  "bavaro-ocean": "PUJ_BAVARO",
  "macao": "ROMANA_BAYAHIBE",
  "punta-cana-resort": "PUJ_BAVARO",
  "la-romana": "ROMANA_BAYAHIBE"
};

const microZoneDefinitions = [
  {
    slug: "cap-cana",
    name: "Cap Cana",
    hotels: [
      { name: "Hyatt Ziva Cap Cana", slug: "hyatt-ziva-cap-cana" },
      { name: "Hyatt Zilara Cap Cana", slug: "hyatt-zilara-cap-cana" },
      { name: "Secrets Cap Cana Resort & Spa", slug: "secrets-cap-cana" },
      { name: "Sanctuary Cap Cana", slug: "sanctuary-cap-cana" },
      { name: "TRS Cap Cana Waterfront", slug: "trs-cap-cana" }
    ]
  },
  {
    slug: "cabeza-de-toro",
    name: "Cabeza de Toro",
    hotels: [
      { name: "Dreams Flora Resort & Spa", slug: "dreams-flora" },
      { name: "Catalonia Bávaro Beach", slug: "catalonia-bavaro" },
      { name: "Catalonia Royal Bávaro", slug: "catalonia-royal-bavaro" },
      { name: "Serenade Punta Cana Beach", slug: "serenade-punta-cana" }
    ]
  },
  {
    slug: "bavaro-cortecito",
    name: "Bávaro · Cortecito",
    hotels: [
      { name: "Barceló Bávaro Palace", slug: "barcelo-bavaro-palace" },
      { name: "Barceló Bávaro Beach", slug: "barcelo-bavaro-beach" },
      { name: "Lopesan Costa Bávaro Resort", slug: "lopesan-costa-bavaro" },
      { name: "Paradisus Palma Real Golf & Spa Resort", slug: "paradisus-palma-real" },
      { name: "Paradisus Grand Cana", slug: "paradisus-grand-cana" },
      { name: "Meliá Caribe Beach Resort", slug: "melia-caribe-beach" },
      { name: "Meliá Punta Cana Beach", slug: "melia-punta-cana-beach" },
      { name: "Secrets Royal Beach Punta Cana", slug: "secrets-royal-beach" },
      { name: "Dreams Royal Beach Punta Cana", slug: "dreams-royal-beach" },
      { name: "Grand Palladium Palace Resort", slug: "grand-palladium-palace" },
      { name: "Grand Palladium Bávaro Suites", slug: "grand-palladium-bavaro" },
      { name: "Occidental Punta Cana", slug: "occidental-punta-cana" },
      { name: "Occidental Caribe", slug: "occidental-caribe" },
      { name: "TRS Turquesa Hotel", slug: "trs-turquesa" }
    ]
  },
  {
    slug: "arena-gorda",
    name: "Arena Gorda",
    hotels: [
      { name: "Hard Rock Hotel & Casino Punta Cana", slug: "hard-rock-punta-cana" },
      { name: "Iberostar Selection Bávaro Suites", slug: "iberostar-selection-bavaro" },
      { name: "Iberostar Grand Bávaro", slug: "iberostar-grand-bavaro" },
      { name: "Bahia Principe Grand Punta Cana", slug: "bahia-principe-grand-punta-cana" },
      { name: "Bahia Principe Luxury Ambar", slug: "bahia-principe-luxury-ambar" },
      { name: "Bahia Principe Luxury Esmeralda", slug: "bahia-principe-luxury-esmeralda" },
      { name: "Riu Palace Macao", slug: "riu-palace-macao" },
      { name: "Riu Palace Bávaro", slug: "riu-palace-bavaro" },
      { name: "Riu República", slug: "riu-republica" },
      { name: "Riu Bambu", slug: "riu-bambu" },
      { name: "Royalton Punta Cana", slug: "royalton-punta-cana" },
      { name: "Royalton Chic Punta Cana", slug: "royalton-chic" },
      { name: "Royalton Bávaro Resort & Spa", slug: "royalton-bavaro" }
    ]
  },
  {
    slug: "uvero-alto",
    name: "Uvero Alto",
    hotels: [
      { name: "Nickelodeon Hotels & Resorts Punta Cana", slug: "nickelodeon-punta-cana" },
      { name: "Dreams Onyx Resort & Spa", slug: "dreams-onyx" },
      { name: "Breathless Punta Cana Resort", slug: "breathless-punta-cana" },
      { name: "Excellence Punta Cana", slug: "excellence-punta-cana" },
      { name: "Excellence El Carmen", slug: "excellence-el-carmen" },
      { name: "Finest Punta Cana", slug: "finest-punta-cana" },
      { name: "Live Aqua Beach Resort Punta Cana", slug: "live-aqua-punta-cana" },
      { name: "Jewel Palm Beach Resort", slug: "jewel-palm-beach" }
    ]
  },
  {
    slug: "bavaro-majestic",
    name: "Bávaro · Majestic",
    hotels: [
      { name: "Majestic Colonial Punta Cana", slug: "majestic-colonial" },
      { name: "Majestic Elegance Punta Cana", slug: "majestic-elegance" },
      { name: "Majestic Mirage Punta Cana", slug: "majestic-mirage" }
    ]
  },
  {
    slug: "bavaro-ocean",
    name: "Bávaro · Playa Marina",
    hotels: [
      { name: "Ocean El Faro Resort", slug: "ocean-el-faro" },
      { name: "Ocean Blue & Sand", slug: "ocean-blue-sand" }
    ]
  },
  {
    slug: "macao",
    name: "Macao",
    hotels: [{ name: "Dreams Macao Beach Punta Cana", slug: "dreams-macao-beach" }]
  },
  {
    slug: "punta-cana-resort",
    name: "Punta Cana Resort Club",
    hotels: [
      { name: "The Westin Puntacana Resort & Club", slug: "the-westin-puntacana" },
      { name: "Tortuga Bay Puntacana Resort & Club", slug: "tortuga-bay-puntacana" }
    ]
  },
  {
    slug: "la-romana",
    name: "La Romana & Zona Este",
    hotels: [{ name: "Hilton La Romana (Punta Cana Area)", slug: "hilton-la-romana" }]
  }
];

async function main() {
  const country = await prisma.country.upsert({
    where: { code: countryData.code },
    update: {
      name: countryData.name,
      slug: countryData.slug,
      shortDescription: countryData.shortDescription
    },
    create: {
      id: countryData.code,
      code: countryData.code,
      name: countryData.name,
      slug: countryData.slug,
      shortDescription: countryData.shortDescription
    }
  });

  const destination = await prisma.destination.upsert({
    where: { slug: destinationData.slug },
    update: {
      name: destinationData.name,
      shortDescription: destinationData.shortDescription,
      countryId: country.id
    },
    create: {
      name: destinationData.name,
      slug: destinationData.slug,
      shortDescription: destinationData.shortDescription,
      countryId: country.id
    }
  });

  for (const microZone of microZoneDefinitions) {
    const locationGroup = await prisma.microZone.upsert({
      where: { slug: microZone.slug },
      update: {
        name: microZone.name,
        destinationId: destination.id,
        countryCode: country.code
      },
      create: {
        name: microZone.name,
        slug: microZone.slug,
        destinationId: destination.id,
        countryCode: country.code
      }
    });

    for (const hotel of microZone.hotels) {
      await prisma.location.upsert({
        where: { slug: hotel.slug },
        update: {
          name: hotel.name,
          countryId: country.code,
          destinationId: destination.id,
          microZoneId: locationGroup.id,
        },
        create: {
          name: hotel.name,
          slug: hotel.slug,
          countryId: country.code,
          destinationId: destination.id,
          microZoneId: locationGroup.id,
        }
      });
      console.log(`seeded hotel ${hotel.slug} in ${microZone.slug}`);
    }
  }
}

main()
  .catch((error) => {
    console.error("Failed to seed geography", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
