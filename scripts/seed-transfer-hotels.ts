import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const directory = {
  ZONA_PC_BAVARO: [
    "Riu Republica",
    "Riu Palace Bavaro",
    "Riu Bambu",
    "Riu Naiboa",
    "Iberostar Grand Bávaro",
    "Iberostar Selection Bávaro",
    "Iberostar Dominicana",
    "Bahia Principe Luxury Ambar",
    "Bahia Principe Grand Aquamarine",
    "Bahia Principe Fantasia",
    "Grand Palladium Palace",
    "Grand Palladium Bavaro",
    "TRS Turquesa Hotel",
    "Punta Cana Princess",
    "Caribe Deluxe Princess",
    "Tropical Deluxe Princess",
    "Occidental Punta Cana",
    "Occidental Caribe",
    "Barceló Bávaro Palace",
    "Barceló Bávaro Beach",
    "Lopesan Costa Bávaro",
    "Melia Caribe Beach",
    "Melia Punta Cana Beach",
    "Paradisus Palma Real",
    "Secrets Royal Beach",
    "Dreams Royal Beach",
    "Falcon's Resort by Melia",
    "Vista Sol Punta Cana",
    "VIK Arena Blanca",
    "Ocean Blue & Sand",
    "Majestic Colonial",
    "Majestic Elegance",
    "Majestic Mirage",
    "Royalton Punta Cana",
    "Royalton Chic",
    "Royalton Splash",
    "Jewel Punta Cana",
    "Jewel Palm Beach",
    "Be Live Collection Punta Cana",
    "Serenade Punta Cana",
    "Radisson Blu Punta Cana",
    "Live Aqua Beach Resort",
    "Catalonia Royal Bavaro",
    "Catalonia Punta Cana",
    "Westin Puntacana",
    "Tortuga Bay",
    "Hyatt Ziva Cap Cana",
    "Hyatt Zilara Cap Cana",
    "Secrets Cap Cana",
    "Margaritaville Island Reserve"
  ],
  ZONA_UVERO_ALTO_MICHES: [
    "Hard Rock Hotel & Casino PC",
    "Nickelodeon Hotels & Resorts",
    "Dreams Macao Beach",
    "Excellence El Carmen",
    "Excellence Punta Cana",
    "Finest Punta Cana",
    "Breathless Punta Cana",
    "Dreams Onyx",
    "Live Aqua Miches",
    "Temptation Miches",
    "Club Med Michès Playa Esmeralda"
  ],
  ZONA_ROMANA_BAYAHIBE: [
    "Casa de Campo Resort & Villas",
    "Hilton La Romana Adult",
    "Hilton La Romana Family",
    "Dreams Dominicus La Romana",
    "Iberostar Selection Hacienda Dominicus",
    "Viva Maya by Wyndham",
    "Viva Palace by Wyndham",
    "Catalonia Royal La Romana",
    "Catalonia Gran Dominicus",
    "Be Live Collection Canoa",
    "Bahia Principe Luxury Bouganville"
  ],
  ZONA_SANTO_DOMINGO: [
    "Renaissance Santo Domingo Jaragua",
    "JW Marriott Santo Domingo",
    "InterContinental Real SD",
    "Sheraton Santo Domingo",
    "El Embajador, a Royal Hideaway",
    "Catalonia Santo Domingo",
    "Hodelpa Nicolás de Ovando",
    "Billini Hotel",
    "Emotions by Hodelpa Juan Dolio",
    "Coral Costa Caribe Juan Dolio"
  ],
  ZONA_SAMANA: [
    "Bahia Principe Luxury Cayo Levantado",
    "Bahia Principe Grand El Portillo",
    "Viva V Samaná",
    "Sublime Samana Hotel",
    "The Bannister Hotel",
    "Grand Paradise Samaná"
  ],
  ZONA_PUERTO_PLATA_STI: [
    "Senator Puerto Plata",
    "Iberostar Costa Dorada",
    "Be Live Collection Marien",
    "BlueBay Villas Doradas",
    "Villas Gaivota Cabarete",
    "Hodelpa Gran Almirante Santiago"
  ]
};

const extraDirectory = {
  ZONA_PC_BAVARO_EXTRA: [
    "Serenade All Caribbean",
    "Grand El Cortecito",
    "Vista Sol Punta Cana Beach",
    "Carabela Beach Resort",
    "Ifa Villas Bavaro",
    "Garden Suites by Melia",
    "The Reserve at Paradisus",
    "Luxury Bahia Principe Esmeralda",
    "Punta Cana Seven Beaches",
    "Art Villa Dominicana",
    "Hotel Cortecito Inn",
    "Loto del Este",
    "Las Terrazas Condos",
    "Stanza Mare",
    "Bavaro Green",
    "Playa Turquesa Ocean Club",
    "Sol Caribe",
    "Flor del Mar",
    "Costa Love Aparta Hotel",
    "Aventura Village",
    "Vilas de Bavaro",
    "GARDEN CITY",
    "Coral Village",
    "Capistrano",
    "Residencial Nautilus"
  ],
  ZONA_ROMANA_BAYAHIBE_EXTRA: [
    "Hotel Bayahibe",
    "Villa Igneri",
    "Apartahotel Villa Baya",
    "Bayahibe Village",
    "Alba Chiara",
    "Hotel El Eden",
    "Los Flamencos Apart Hotel",
    "Cadaques Caribe",
    "Residencial Saona",
    "Hotel Vecchia Caserma",
    "Rivera del Rio"
  ],
  ZONA_SANTO_DOMINGO_EXTRA: [
    "Real InterContinental Santo Domingo",
    "Winston Churchill Tower",
    "Silver Sun Gallery",
    "Radisson Santo Domingo",
    "Boutique Hotel Palacio",
    "Antiguo Hotel Europa",
    "Casas del XVI",
    "Hostal Nicolas de Ovando",
    "Napolitano Hotel",
    "W&P Santo Domingo",
    "Holiday Inn Santo Domingo",
    "Courtyard by Marriott SD"
  ],
  ZONA_SAMANA_EXTRA: [
    "Grand Bahia Principe El Portillo",
    "Bahia Principe Grand Cayacoa",
    "Bahia Principe Grand Samana",
    "The Bannister Hotel & Yacht Club",
    "Xeliter Vista Mare",
    "Colibri Boutique Hotel",
    "Hotel Casa Coson",
    "Hotel La Tortuga",
    "Mahona Boutique Hotel",
    "Takuma Boutik Hotel"
  ],
  ZONA_NORTE_EXTRA: [
    "Lifestyle Tropical Island",
    "The Reef Marina",
    "Velero Beach Resort",
    "Kite Beach Inn",
    "Natura Cabana",
    "Millennium Resort",
    "Ultravioleta Boutique",
    "Agualina Kite Resort",
    "Villa Taina"
  ],
  ZONA_MICHES_SABANA_EXTRA: [
    "Sunrise Miches Beach Resort",
    "Temptation Grand Miches",
    "Club Med Michès",
    "Hotel Sabana de la Mar",
    "Paraíso Caño Hondo"
  ]
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function main() {
  let created = 0;
  for (const hotelNames of Object.values({ ...directory, ...extraDirectory })) {
    for (const name of hotelNames) {
      const slug = slugify(name);
      await prisma.location.upsert({
        where: { slug },
        update: {
          name,
          countryId: "RD"
        },
        create: {
          name,
          slug,
          countryId: "RD"
        }
      });
      created++;
    }
  }
  console.log(`Processed ${created} hoteles de traslado.`); 
}

main()
  .catch((error) => {
    console.error("seed-transfer-hotels failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
