import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const countrySlugs = [
  "argentina",
  "brasil",
  "chile",
  "colombia",
  "costa-rica",
  "dominican-republic",
  "ecuador",
  "guatemala",
  "mexico",
  "panama",
  "peru",
  "puerto-rico",
  "spain",
  "united-states",
  "canada",
  "france",
  "italy",
  "portugal",
  "netherlands",
  "germany",
  "japan",
  "australia",
  "united-kingdom"
];

const destinationsByCountry: Record<string, { name: string; slug: string; shortDescription: string }[]> = {
  "mexico": [
    { name: "Cancún y Los Cayos", slug: "cancun", shortDescription: "Playas cristalinas y vida nocturna" },
    { name: "Ciudad de México", slug: "ciudad-de-mexico", shortDescription: "Histórica, cultural y gourmet" },
    { name: "Puebla y Cholula", slug: "puebla-cholula", shortDescription: "Colonial y espiritual" }
  ],
  "peru": [
    { name: "Machu Picchu y Valle Sagrado", slug: "machu-picchu", shortDescription: "El imperio inca y sus ruinas" },
    { name: "Cusco urbano", slug: "cusco", shortDescription: "Capital andina con mercados y gastronomía" },
    { name: "Arequipa y Colca", slug: "arequipa-colca", shortDescription: "Volcanes, cañones y arquitectura blanca" }
  ],
  "dominican-republic": [
    { name: "Punta Cana", slug: "punta-cana", shortDescription: "Resorts, kitesurf y festivos" },
    { name: "Santo Domingo Colonial", slug: "santo-domingo", shortDescription: "Historia caribeña y cultura viva" },
    { name: "Samaná y Bahía de las Águilas", slug: "samana-bahia", shortDescription: "Avistamiento de ballenas y playas virgenes" }
  ],
  "colombia": [
    { name: "Cartagena y el Caribe", slug: "cartagena", shortDescription: "Murallas coloniales y palenques" },
    { name: "Medellín moderno", slug: "medellin", shortDescription: "Innovación, clima eterno y cultura" },
    { name: "Eje cafetero", slug: "eje-cafetero", shortDescription: "Montaña, fincas y café premium" }
  ],
  "brazil": [
    { name: "Río de Janeiro", slug: "rio-de-janeiro", shortDescription: "Carnaval, playas y montaña" },
    { name: "Amazonas", slug: "amazonas", shortDescription: "Selva profunda y comunidades riberas" },
    { name: "Salvador de Bahía", slug: "salvador", shortDescription: "Africanidad, cocina y arquitectura" }
  ],
  "argentina": [
    { name: "Buenos Aires y tango", slug: "buenos-aires", shortDescription: "Clásico y cosmopolita" },
    { name: "Patagonia - Bariloche", slug: "bariloche", shortDescription: "Lagos, montañas y esquí" },
    { name: "Mendoza y viñedos", slug: "mendoza", shortDescription: "Malbecs y cordón montañoso" }
  ],
  "chile": [
    { name: "Santiago y Valparaíso", slug: "santiago-valparaiso", shortDescription: "Capital, arte callejero y costa" },
    { name: "San Pedro de Atacama", slug: "atacama", shortDescription: "Desierto más árido del mundo" },
    { name: "Patagonia chilena", slug: "patagonia-chilena", shortDescription: "Torres del Paine y glaciares" }
  ],
  "costa-rica": [
    { name: "Arenal y Monteverde", slug: "arenal-monteverde", shortDescription: "Bosques nubosos y aventura" },
    { name: "Manuel Antonio", slug: "manuel-antonio", shortDescription: "Playas y parque nacional" }
  ],
  "ecuador": [
    { name: "Quito y los andes", slug: "quito", shortDescription: "Centro histórico con volcanes" },
    { name: "Galápagos", slug: "galapagos", shortDescription: "Naturaleza única y vida silvestre" }
  ],
  "guatemala": [
    { name: "Antigua Guatemala", slug: "antigua", shortDescription: "Colonial y festivo" },
    { name: "Lago de Atitlán", slug: "atitlan", shortDescription: "Lagos rodeado de volcanes" }
  ],
  "panama": [
    { name: "Canal de Panamá y Casco Viejo", slug: "canal-casco-viejo", shortDescription: "Ingeniería moderna y barrios restaurados" },
    { name: "Bocas del Toro", slug: "bocas", shortDescription: "Archipiélago caribeño y snorkel" }
  ],
  "puerto-rico": [
    { name: "Viejo San Juan", slug: "viejo-san-juan", shortDescription: "Calles adoquinadas y fortalezas" },
    { name: "El Yunque", slug: "el-yunque", shortDescription: "Bosque tropical y cascadas" }
  ],
  "spain": [
    { name: "Barcelona y Gaudí", slug: "barcelona", shortDescription: "Arte moderno y playa" },
    { name: "Madrid centro", slug: "madrid", shortDescription: "Museos y gastronomía" }
  ],
  "portugal": [
    { name: "Lisboa y Sintra", slug: "lisboa-sintra", shortDescription: "Colinas, tranvías y castillos" },
    { name: "Algarve", slug: "algarve", shortDescription: "Costa dorada y calas" }
  ],
  "france": [
    { name: "París y Sena", slug: "paris", shortDescription: "Ciudad luz, museos y gastronomía" },
    { name: "Costa Azul", slug: "costa-azul", shortDescription: "Cannes, Mónaco y playas mediterráneas" }
  ],
  "italy": [
    { name: "Roma y Vaticano", slug: "roma", shortDescription: "Historia eterna, plazas y museos" },
    { name: "Toscana y Florencia", slug: "toscana", shortDescription: "Viñas, colinas y arte renacentista" }
  ],
  "netherlands": [
    { name: "Ámsterdam y canales", slug: "amsterdam", shortDescription: "Bicicleta, arte y diseño" }
  ],
  "germany": [
    { name: "Berlín y Baviera", slug: "berlin", shortDescription: "Historia moderna y castillos" }
  ],
  "united-kingdom": [
    { name: "Londres", slug: "londres", shortDescription: "Museos, teatro y barrios icónicos" },
    { name: "Escocia y Highlands", slug: "higlands", shortDescription: "Castillos, lagos y destilerías" }
  ],
  "united-states": [
    { name: "Nueva York", slug: "estados-unidos-nueva-york", shortDescription: "Ciudad que nunca duerme y cultura pop" },
    { name: "Parques Nacionales de Utah", slug: "utah-parks", shortDescription: "Arcos, cañones y rutas 4x4" }
  ]
};

async function seed() {
  for (const countrySlug of countrySlugs) {
    const country = await prisma.country.findUnique({ where: { slug: countrySlug } });
    if (!country) {
      console.warn(`Country with slug ${countrySlug} not found; skipping destinations.`);
      continue;
    }
    const places = destinationsByCountry[countrySlug] ?? [];
    for (const place of places) {
      await prisma.destination.upsert({
        where: { slug: place.slug },
        update: {
          name: place.name,
          shortDescription: place.shortDescription,
          countryId: country.id
        },
        create: {
          ...place,
          countryId: country.id
        }
      });
    }
  }
  console.log("Country destinations seeded.");
}

seed()
  .catch((error) => {
    console.error("Destination seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
