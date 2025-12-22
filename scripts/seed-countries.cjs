const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const countries = [
  { name: "Argentina", slug: "argentina", shortDescription: "Experiencias vibrantes en Sudamérica", code: "AR" },
  { name: "Brasil", slug: "brasil", shortDescription: "Playas, selva y cultura inigualable", code: "BR" },
  { name: "Chile", slug: "chile", shortDescription: "Desiertos, montañas y vinos del sur", code: "CL" },
  { name: "Colombia", slug: "colombia", shortDescription: "Ciudades coloridas y aventura tropical", code: "CO" },
  { name: "Costa Rica", slug: "costa-rica", shortDescription: "Ecoturismo, selvas y playas del Pacífico", code: "CR" },
  { name: "Dominican Republic", slug: "dominican-republic", shortDescription: "Playas caribeñas y cultura alegre", code: "DR" },
  { name: "Ecuador", slug: "ecuador", shortDescription: "Volcanes, Andes y biodiversidad", code: "EC" },
  { name: "Guatemala", slug: "guatemala", shortDescription: "Historia maya y alta montaña", code: "GT" },
  { name: "México", slug: "mexico", shortDescription: "Gastronomía, ruinas y litoral diverso", code: "MX" },
  { name: "Panama", slug: "panama", shortDescription: "Canal, selva y cosmopolitismo", code: "PA" },
  { name: "Peru", slug: "peru", shortDescription: "Machu Picchu y gastronomía de altura", code: "PE" },
  { name: "Puerto Rico", slug: "puerto-rico", shortDescription: "Isla caribeña con sabor boricua", code: "PR" },
  { name: "Spain", slug: "spain", shortDescription: "Historia mediterránea y fiestas", code: "ES" },
  { name: "United States", slug: "united-states", shortDescription: "Ciudades icónicas y parques naturales", code: "US" },
  { name: "Canada", slug: "canada", shortDescription: "Paisajes montañosos y vida urbana", code: "CA" },
  { name: "France", slug: "france", shortDescription: "Arte, vino y gastronomía", code: "FR" },
  { name: "Italy", slug: "italy", shortDescription: "Historia, paisajes y sabores", code: "IT" },
  { name: "Portugal", slug: "portugal", shortDescription: "Costas atlánticas y ciudades históricas", code: "PT" },
  { name: "Netherlands", slug: "netherlands", shortDescription: "Ciclismo, canales y arquitectura", code: "NL" },
  { name: "Germany", slug: "germany", shortDescription: "Castillos, ciudades modernas y cerveza", code: "DE" },
  { name: "Japan", slug: "japan", shortDescription: "Tecnología, templos y cultura milenaria", code: "JP" },
  { name: "Australia", slug: "australia", shortDescription: "Playas, desiertos y biodiversidad única", code: "AU" },
  { name: "United Kingdom", slug: "united-kingdom", shortDescription: "Historia, museos y paisajes británicos", code: "GB" }
];

async function seed() {
  for (const country of countries) {
    await prisma.country.upsert({
      where: { slug: country.slug },
      update: { name: country.name, shortDescription: country.shortDescription, code: country.code },
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
