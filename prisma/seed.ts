import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hotels: Array<{ name: string; slug: string }> = [
  { name: "Hard Rock Hotel & Casino Punta Cana", slug: "hard-rock-punta-cana" },
  { name: "Majestic Colonial Punta Cana", slug: "majestic-colonial" },
  { name: "Majestic Elegance Punta Cana", slug: "majestic-elegance" },
  { name: "Majestic Mirage Punta Cana", slug: "majestic-mirage" },
  { name: "Hyatt Ziva Cap Cana", slug: "hyatt-ziva-cap-cana" },
  { name: "Hyatt Zilara Cap Cana", slug: "hyatt-zilara-cap-cana" },
  { name: "Barceló Bávaro Palace", slug: "barcelo-bavaro-palace" },
  { name: "Barceló Bávaro Beach", slug: "barcelo-bavaro-beach" },
  { name: "Iberostar Selection Bávaro Suites", slug: "iberostar-selection-bavaro" },
  { name: "Iberostar Grand Bávaro", slug: "iberostar-grand-bavaro" },
  { name: "Riu Palace Macao", slug: "riu-palace-macao" },
  { name: "Riu Palace Bavaro", slug: "riu-palace-bavaro" },
  { name: "Riu Republica", slug: "riu-republica" },
  { name: "Riu Bambu", slug: "riu-bambu" },
  { name: "Lopesan Costa Bávaro Resort", slug: "lopesan-costa-bavaro" },
  { name: "Paradisus Palma Real Golf & Spa Resort", slug: "paradisus-palma-real" },
  { name: "Paradisus Grand Cana", slug: "paradisus-grand-cana" },
  { name: "Meliá Caribe Beach Resort", slug: "melia-caribe-beach" },
  { name: "Meliá Punta Cana Beach", slug: "melia-punta-cana-beach" },
  { name: "Excellence Punta Cana", slug: "excellence-punta-cana" },
  { name: "Excellence El Carmen", slug: "excellence-el-carmen" },
  { name: "Finest Punta Cana", slug: "finest-punta-cana" },
  { name: "Secrets Cap Cana Resort & Spa", slug: "secrets-cap-cana" },
  { name: "Secrets Royal Beach Punta Cana", slug: "secrets-royal-beach" },
  { name: "Dreams Royal Beach Punta Cana", slug: "dreams-royal-beach" },
  { name: "Dreams Onyx Resort & Spa", slug: "dreams-onyx" },
  { name: "Dreams Flora Resort & Spa", slug: "dreams-flora" },
  { name: "Breathless Punta Cana Resort", slug: "breathless-punta-cana" },
  { name: "Live Aqua Beach Resort Punta Cana", slug: "live-aqua-punta-cana" },
  { name: "Nickelodeon Hotels & Resorts Punta Cana", slug: "nickelodeon-punta-cana" },
  { name: "Royalton Bavaro Resort & Spa", slug: "royalton-bavaro" },
  { name: "Royalton Punta Cana", slug: "royalton-punta-cana" },
  { name: "Royalton Chic Punta Cana", slug: "royalton-chic" },
  { name: "Grand Palladium Palace Resort", slug: "grand-palladium-palace" },
  { name: "Grand Palladium Bavaro Suites", slug: "grand-palladium-bavaro" },
  { name: "TRS Turquesa Hotel", slug: "trs-turquesa" },
  { name: "TRS Cap Cana Waterfront", slug: "trs-cap-cana" },
  { name: "Sanctuary Cap Cana", slug: "sanctuary-cap-cana" },
  { name: "Ocean El Faro Resort", slug: "ocean-el-faro" },
  { name: "Ocean Blue & Sand", slug: "ocean-blue-sand" },
  { name: "Occidental Punta Cana", slug: "occidental-punta-cana" },
  { name: "Occidental Caribe", slug: "occidental-caribe" },
  { name: "Catalonia Bávaro Beach", slug: "catalonia-bavaro" },
  { name: "Catalonia Royal Bávaro", slug: "catalonia-royal-bavaro" },
  { name: "Bahia Principe Grand Punta Cana", slug: "bahia-principe-grand-punta-cana" },
  { name: "Bahia Principe Luxury Ambar", slug: "bahia-principe-luxury-ambar" },
  { name: "Bahia Principe Luxury Esmeralda", slug: "bahia-principe-luxury-esmeralda" },
  { name: "Jewel Palm Beach Resort", slug: "jewel-palm-beach" },
  { name: "Serenade Punta Cana Beach", slug: "serenade-punta-cana" },
  { name: "Hilton La Romana (Punta Cana Area)", slug: "hilton-la-romana" }
];

async function main() {
  for (const hotel of hotels) {
    await prisma.location.upsert({
      where: { slug: hotel.slug },
      update: { name: hotel.name },
      create: { name: hotel.name, slug: hotel.slug }
    });
    console.log(`seeded location: ${hotel.slug}`);
  }
}

main()
  .catch((error) => {
    console.error("Failed to seed locations", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
