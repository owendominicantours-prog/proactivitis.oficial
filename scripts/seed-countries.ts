import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const countries = [
  { name: "Argentina", slug: "argentina", shortDescription: "Experiencias vibrantes en Sudamérica" },
  { name: "Brasil", slug: "brasil", shortDescription: "Playas, selva y cultura inigualable" },
  { name: "Chile", slug: "chile", shortDescription: "Desiertos, montañas y vinos del sur" },
  { name: "Colombia", slug: "colombia", shortDescription: "Ciudades coloridas y aventura tropical" },
  { name: "Costa Rica", slug: "costa-rica", shortDescription: "Ecoturismo, selvas y playas del Pacífico" },
  { name: "Dominican Republic", slug: "dominican-republic", shortDescription: "Playas caribeñas y cultura alegre" },
  { name: "Ecuador", slug: "ecuador", shortDescription: "Volcanes, Andes y biodiversidad" },
  { name: "Guatemala", slug: "guatemala", shortDescription: "Historia maya y alta montaña" },
  { name: "México", slug: "mexico", shortDescription: "Gastronomía, ruinas y litoral diverso" },
  { name: "Panama", slug: "panama", shortDescription: "Canal, selva y cosmopolitismo" },
  { name: "Peru", slug: "peru", shortDescription: "Machu Picchu y gastronomía de altura" },
  { name: "Puerto Rico", slug: "puerto-rico", shortDescription: "Isla caribeña con sabor boricua" },
  { name: "Spain", slug: "spain", shortDescription: "Historia mediterránea y fiestas" },
  { name: "United States", slug: "united-states", shortDescription: "Ciudades icónicas y parques naturales" },
  { name: "Canada", slug: "canada", shortDescription: "Paisajes montañosos y vida urbana" },
  { name: "France", slug: "france", shortDescription: "Arte, vino y gastronomía" },
  { name: "Italy", slug: "italy", shortDescription: "Historia, paisajes y sabores" },
  { name: "Portugal", slug: "portugal", shortDescription: "Costas atlánticas y ciudades históricas" },
  { name: "Netherlands", slug: "netherlands", shortDescription: "Ciclismo, canales y arquitectura" },
  { name: "Germany", slug: "germany", shortDescription: "Castillos, ciudades modernas y cerveza" },
  { name: "Japan", slug: "japan", shortDescription: "Tecnología, templos y cultura milenaria" },
  { name: "Australia", slug: "australia", shortDescription: "Playas, desiertos y biodiversidad única" },
  { name: "United Kingdom", slug: "united-kingdom", shortDescription: "Historia, museos y paisajes británicos" }
];

async function seed() {
  for (const country of countries) {
    await prisma.country.upsert({
      where: { slug: country.slug },
      update: { name: country.name, shortDescription: country.shortDescription },
      create: country
    });
  }
  console.log(`Seeded ${countries.length} countries`);
}

seed()
  .catch((error) => {
    console.error("Country seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
