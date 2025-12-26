import { PrismaClient, TransferLocationType, VehicleCategory } from "@prisma/client";

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
  await seedTransferV2();
}

async function seedTransferV2() {
  const dominicanCountry = await prisma.country.upsert({
    where: { code: "DR" },
    update: {
      name: "Dominican Republic",
      slug: "dominican-republic",
      shortDescription: "Playas caribeñas, cultura y transferencias premium."
    },
    create: {
      id: "DR",
      code: "DR",
      name: "Dominican Republic",
      slug: "dominican-republic",
      shortDescription: "Playas caribeñas, cultura y transferencias premium."
    }
  });

  const zoneDefinitions = [
    {
      slug: "punta-cana",
      name: "Punta Cana",
      description: "Zona este, playas y resorts todo incluido."
    },
    {
      slug: "santo-domingo",
      name: "Santo Domingo",
      description: "Capital con acceso rápido a negocios y cultura."
    }
  ];

  const zoneMap: Record<string, { id: string }> = {};

  for (const zoneDef of zoneDefinitions) {
    zoneMap[zoneDef.slug] = await prisma.transferZoneV2.upsert({
      where: { slug: zoneDef.slug },
      update: {
        name: zoneDef.name,
        description: zoneDef.description,
        countryCode: dominicanCountry.code,
        active: true
      },
      create: {
        name: zoneDef.name,
        slug: zoneDef.slug,
        description: zoneDef.description,
        countryCode: dominicanCountry.code
      }
    });
  }

  const locationDefinitions = [
    {
      slug: "puj-airport",
      name: "Aeropuerto Internacional de Punta Cana (PUJ)",
      type: TransferLocationType.AIRPORT,
      zoneSlug: "punta-cana",
      description: "Principal puerta de entrada al este del país.",
      address: "Carretera Aeropuerto, Punta Cana"
    },
    {
      slug: "sdq-airport",
      name: "Aeropuerto Internacional de Las Américas (SDQ)",
      type: TransferLocationType.AIRPORT,
      zoneSlug: "santo-domingo",
      description: "Entrada principal a la capital.",
      address: "Av. Luperón, Santo Domingo"
    },
    {
      slug: "hard-rock-punta-cana",
      name: "Hard Rock Hotel & Casino Punta Cana",
      type: TransferLocationType.HOTEL,
      zoneSlug: "punta-cana",
      description: "Resort temático con casinos y escenarios.",
      address: "Carretera Arena Gorda"
    },
    {
      slug: "barcelo-bavaro-palace",
      name: "Barceló Bávaro Palace",
      type: TransferLocationType.HOTEL,
      zoneSlug: "punta-cana",
      description: "Complejo premium frente al océano.",
      address: "Resort Bávaro"
    },
    {
      slug: "riu-palace-bavaro",
      name: "Riu Palace Bavaro",
      type: TransferLocationType.HOTEL,
      zoneSlug: "punta-cana",
      description: "Todo incluido con entretenimiento nocturno.",
      address: "Bávaro, Punta Cana"
    },
    {
      slug: "grand-palladium-bavaro",
      name: "Grand Palladium Bávaro Suites",
      type: TransferLocationType.HOTEL,
      zoneSlug: "punta-cana",
      description: "Suites frente al mar y actividades familiares.",
      address: "Playa Bávaro"
    },
    {
      slug: "excellence-punta-cana",
      name: "Excellence Punta Cana",
      type: TransferLocationType.HOTEL,
      zoneSlug: "punta-cana",
      description: "Adults only con villas y spa.",
      address: "Uvero Alto, Punta Cana"
    },
    {
      slug: "sheraton-santo-domingo",
      name: "Sheraton Santo Domingo",
      type: TransferLocationType.HOTEL,
      zoneSlug: "santo-domingo",
      description: "Hotel corporativo frente al Malecón.",
      address: "Av. George Washington"
    },
    {
      slug: "jw-marriott-santo-domingo",
      name: "JW Marriott Santo Domingo",
      type: TransferLocationType.HOTEL,
      zoneSlug: "santo-domingo",
      description: "Lujo en el centro histórico.",
      address: "Av. George Washington 900"
    },
    {
      slug: "intercontinental-real-santo-domingo",
      name: "InterContinental Real Santo Domingo",
      type: TransferLocationType.HOTEL,
      zoneSlug: "santo-domingo",
      description: "Otra opción premium con salas para eventos.",
      address: "Av. República de Colombia"
    },
    {
      slug: "el-embajador-santo-domingo",
      name: "Hotel El Embajador",
      type: TransferLocationType.HOTEL,
      zoneSlug: "santo-domingo",
      description: "Clásica propiedad cinco estrellas cerca de la embajada.",
      address: "Av. República de Colombia 115"
    },
    {
      slug: "hodelpa-nacional",
      name: "Hodelpa Nicolás de Ovando",
      type: TransferLocationType.HOTEL,
      zoneSlug: "santo-domingo",
      description: "Boutique histórica en la Zona Colonial.",
      address: "C. Las Damas 3"
    }
  ];

  const locationMap: Record<string, { id: string }> = {};

  for (const location of locationDefinitions) {
    locationMap[location.slug] = await prisma.transferLocation.upsert({
      where: { slug: location.slug },
      update: {
        name: location.name,
        type: location.type,
        description: location.description,
        address: location.address,
        zoneId: zoneMap[location.zoneSlug].id,
        countryCode: ecuadorCountry.code,
        active: true
      },
      create: {
        name: location.name,
        slug: location.slug,
        type: location.type,
        description: location.description,
        address: location.address,
        zoneId: zoneMap[location.zoneSlug].id,
        countryCode: ecuadorCountry.code
      }
    });
  }

  const vehicleDefinitions = [
    { slug: "sedan", name: "Sedan clásico", minPax: 1, maxPax: 3, category: VehicleCategory.SEDAN },
    { slug: "suv", name: "SUV premium", minPax: 1, maxPax: 4, category: VehicleCategory.SUV },
    { slug: "van", name: "Van estándar", minPax: 1, maxPax: 8, category: VehicleCategory.VAN },
    { slug: "minibus", name: "MiniBus", minPax: 5, maxPax: 14, category: VehicleCategory.BUS }
  ];

  const vehicleMap: Record<string, { id: string }> = {};

  for (const vehicle of vehicleDefinitions) {
    vehicleMap[vehicle.slug] = await prisma.transferVehicle.upsert({
      where: { slug: vehicle.slug },
      update: {
        name: vehicle.name,
        minPax: vehicle.minPax,
        maxPax: vehicle.maxPax,
        category: vehicle.category,
        active: true
      },
      create: {
        name: vehicle.name,
        slug: vehicle.slug,
        minPax: vehicle.minPax,
        maxPax: vehicle.maxPax,
        category: vehicle.category
      }
    });
  }

  const routeZoneSlugs = ["punta-cana", "santo-domingo"];
  const sortedZoneIds = routeZoneSlugs
    .map((slug) => zoneMap[slug].id)
    .sort((a, b) => (a < b ? -1 : 1));

  const route = await prisma.transferRoute.upsert({
    where: {
      zoneAId_zoneBId: {
        zoneAId: sortedZoneIds[0],
        zoneBId: sortedZoneIds[1]
      }
    },
    update: { active: true, countryCode: ecuadorCountry.code },
    create: {
      zoneAId: sortedZoneIds[0],
      zoneBId: sortedZoneIds[1],
      countryCode: ecuadorCountry.code
    }
  });

  const pricingMatrix = [
    { vehicleSlug: "sedan", price: 150 },
    { vehicleSlug: "suv", price: 190 },
    { vehicleSlug: "van", price: 230 },
    { vehicleSlug: "minibus", price: 320 }
  ];

  for (const pricing of pricingMatrix) {
    const vehicle = vehicleMap[pricing.vehicleSlug];
    await prisma.transferRoutePrice.upsert({
      where: {
        routeId_vehicleId: {
          routeId: route.id,
          vehicleId: vehicle.id
        }
      },
      update: { price: pricing.price },
      create: {
        routeId: route.id,
        vehicleId: vehicle.id,
        price: pricing.price
      }
    });
  }

  const overrideMatrix = [
    {
      vehicleSlug: "van",
      price: 260,
      originSlug: "hard-rock-punta-cana",
      destinationSlug: undefined,
      notes: "Calles secundarias en Punta Cana que aumentan el tiempo."
    },
    {
      vehicleSlug: "minibus",
      price: 380,
      originSlug: "riu-palace-bavaro",
      destinationSlug: "sheraton-santo-domingo",
      notes: "Grupos grandes con llegada directa a Sheraton."
    },
    {
      vehicleSlug: "sedan",
      price: 180,
      originSlug: undefined,
      destinationSlug: "intercontinental-real-santo-domingo",
      notes: "Servicio VIP con llegada a InterContinental."
    }
  ];

  for (const override of overrideMatrix) {
    const vehicle = vehicleMap[override.vehicleSlug];
    const originLocationId = override.originSlug ? locationMap[override.originSlug].id : undefined;
    const destinationLocationId = override.destinationSlug
      ? locationMap[override.destinationSlug].id
      : undefined;
    const existingOverride = await prisma.transferRoutePriceOverride.findFirst({
      where: {
        routeId: route.id,
        vehicleId: vehicle.id,
        originLocationId,
        destinationLocationId
      }
    });

    const overrideData = {
      routeId: route.id,
      vehicleId: vehicle.id,
      originLocationId,
      destinationLocationId,
      price: override.price,
      notes: override.notes
    };

    if (existingOverride) {
      await prisma.transferRoutePriceOverride.update({
        where: { id: existingOverride.id },
        data: overrideData
      });
    } else {
      await prisma.transferRoutePriceOverride.create({ data: overrideData });
    }
  }

  console.log("Seeded transfer V2 fixtures for Dominican Republic");
}

main()
  .catch((error) => {
    console.error("Failed to seed geography", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
