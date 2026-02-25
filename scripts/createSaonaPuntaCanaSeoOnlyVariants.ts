import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

type SeoVariant = {
  slugSuffix: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  keywords: string[];
  priceUsd: number;
};

const SAONA_VARIANTS: SeoVariant[] = [
  {
    slugSuffix: "saona-island-tour-with-lunch-and-pickup",
    title: "Saona Island Tour with Lunch and Pickup",
    subtitle: "Catamaran or speedboat day with hotel transfer included",
    shortDescription: "Full-day Saona option from Punta Cana with lunch, transfer and guided island logistics.",
    keywords: ["saona island tour", "lunch included", "hotel pickup"],
    priceUsd: 95
  },
  {
    slugSuffix: "saona-island-tour-in-punta-cana-with-lunch-included",
    title: "Saona Island Tour in Punta Cana with Lunch Included",
    subtitle: "Beach day, natural pool and island transfer in one booking",
    shortDescription: "Saona experience from Punta Cana with lunch and island operations already coordinated.",
    keywords: ["saona from punta cana", "natural pool", "dominican lunch"],
    priceUsd: 82
  },
  {
    slugSuffix: "saona-island-from-punta-cana-with-transportation-and-lunch-included",
    title: "Saona Island from Punta Cana with Transportation and Lunch Included",
    subtitle: "Roundtrip transfer with beach time and guided schedule",
    shortDescription: "Complete Saona route with transportation and lunch included from Punta Cana hotels.",
    keywords: ["transportation included", "saona day trip", "punta cana hotels"],
    priceUsd: 78
  },
  {
    slugSuffix: "saona-island-from-punta-cana",
    title: "Saona Island From Punta Cana",
    subtitle: "Classic full-day island excursion with tropical stops",
    shortDescription: "Classic Saona format from Punta Cana with natural pool stop and island beach program.",
    keywords: ["saona island from punta cana", "full day", "caribbean"],
    priceUsd: 75
  },
  {
    slugSuffix: "saona-island-full-day-catamaran-tour-small-group",
    title: "Saona Island: Full-day Catamaran Tour - Small Group",
    subtitle: "Smaller-group sailing format with beach and snorkeling time",
    shortDescription: "Small-group Saona catamaran day from Punta Cana with curated pacing and local support.",
    keywords: ["small group", "catamaran", "saona island"],
    priceUsd: 165
  },
  {
    slugSuffix: "saona-catamaran-cruise-with-lunch-and-natural-swimming-pool",
    title: "Saona Catamaran Cruise with Lunch and Natural Swimming Pool",
    subtitle: "Catamaran cruise plus stop at natural pool area",
    shortDescription: "Saona cruise option featuring natural pool stop and lunch in a structured full-day itinerary.",
    keywords: ["catamaran cruise", "natural swimming pool", "lunch"],
    priceUsd: 75
  },
  {
    slugSuffix: "full-day-tour-to-saona-island-sailing-with-lunch-and-beverages",
    title: "Full-Day Tour to Saona Island Sailing with Lunch and Beverages",
    subtitle: "All-day sailing route with island program and onboard drinks",
    shortDescription: "Sailing-focused Saona day from Punta Cana with lunch and beverage service included.",
    keywords: ["full day saona", "sailing", "beverages"],
    priceUsd: 82
  },
  {
    slugSuffix: "saona-island-small-group-tour-with-natural-pool-lunch-drinks",
    title: "Saona Island Small-Group Tour with Natural Pool, Lunch & Drinks",
    subtitle: "Small-group operation with natural pool and island beach window",
    shortDescription: "Saona small-group plan from Punta Cana including lunch, drinks and natural pool stop.",
    keywords: ["small-group tour", "natural pool", "drinks"],
    priceUsd: 139
  },
  {
    slugSuffix: "saona-private-tour-with-own-guide-and-transport-from-punta-cana",
    title: "Saona Private Tour with Own Guide and Transport from Punta Cana",
    subtitle: "Private logistics and dedicated guide for custom pacing",
    shortDescription: "Private Saona format from Punta Cana with dedicated guide and transport handling.",
    keywords: ["private saona", "private guide", "punta cana transport"],
    priceUsd: 165
  },
  {
    slugSuffix: "saona-island-sailing-tour-all-inclusive",
    title: "Saona Island Sailing Tour - All Inclusive",
    subtitle: "All-inclusive sailing profile for relaxed island day",
    shortDescription: "All-inclusive Saona sailing alternative with clear operations and island-time balance.",
    keywords: ["all inclusive", "sailing tour", "saona island"],
    priceUsd: 72
  },
  {
    slugSuffix: "saona-island-altos-de-chavon-day-trip-with-lunch-and-open-bar",
    title: "From Punta Cana: Saona Island & Altos de Chavon Day Trip with Lunch and Open Bar",
    subtitle: "Combined route with cultural stop and island segment",
    shortDescription: "Combo day trip combining Altos de Chavon and Saona with lunch and open bar included.",
    keywords: ["altos de chavon", "open bar", "combo tour"],
    priceUsd: 88
  },
  {
    slugSuffix: "saona-island-excursion-from-punta-cana",
    title: "Saona Island Excursion From Punta Cana",
    subtitle: "Popular excursion profile with natural pool and beach stay",
    shortDescription: "Saona excursion structure from Punta Cana with guided timing and transfer coordination.",
    keywords: ["saona excursion", "from punta cana", "island beach"],
    priceUsd: 82
  },
  {
    slugSuffix: "saona-island-day-trip-speedboat-and-catamaran",
    title: "Saona Island Day Trip by Speedboat and Catamaran",
    subtitle: "Dual-transport format for balanced adventure and relaxation",
    shortDescription: "Day trip to Saona mixing speedboat and catamaran segments with full logistics support.",
    keywords: ["speedboat", "catamaran", "saona day trip"],
    priceUsd: 75
  },
  {
    slugSuffix: "saona-island-beach-and-natural-pool-experience",
    title: "Saona Island Beach and Natural Pool Experience",
    subtitle: "Beach-first schedule with starfish-area natural pool stop",
    shortDescription: "Beach and natural pool Saona route from Punta Cana with organized transfer windows.",
    keywords: ["beach experience", "natural pool", "starfish area"],
    priceUsd: 78
  },
  {
    slugSuffix: "saona-island-premium-day-experience",
    title: "Saona Island Premium Day Experience",
    subtitle: "Premium operations format with curated island timing",
    shortDescription: "Premium day format to Saona from Punta Cana with efficient transitions and support team.",
    keywords: ["premium saona", "day experience", "punta cana"],
    priceUsd: 139
  },
  {
    slugSuffix: "saona-island-with-open-bar-and-buffet-lunch",
    title: "Saona Island with Open Bar and Buffet Lunch",
    subtitle: "Island program with buffet stop and open bar service",
    shortDescription: "Saona route with buffet lunch and open bar integrated into a full-day plan.",
    keywords: ["open bar", "buffet lunch", "saona island"],
    priceUsd: 82
  },
  {
    slugSuffix: "saona-island-relax-and-snorkel-day-trip",
    title: "Saona Island Relax and Snorkel Day Trip",
    subtitle: "Snorkel-friendly plan with relaxed beach window",
    shortDescription: "Relaxed Saona itinerary with snorkel moments and clear pacing from Punta Cana.",
    keywords: ["snorkel saona", "relax day trip", "island"],
    priceUsd: 75
  },
  {
    slugSuffix: "saona-island-tropical-escape-from-punta-cana",
    title: "Saona Island Tropical Escape from Punta Cana",
    subtitle: "High-demand tropical route for full-day Caribbean escape",
    shortDescription: "Tropical escape format from Punta Cana to Saona with logistics and beach plan included.",
    keywords: ["tropical escape", "caribbean", "punta cana"],
    priceUsd: 75
  },
  {
    slugSuffix: "saona-island-catuano-and-natural-pool-tour",
    title: "Saona Island, Catuano and Natural Pool Tour",
    subtitle: "Marine route with Catuano area and natural pool stop",
    shortDescription: "Saona itinerary including Catuano sector and natural pool timing in one reservation.",
    keywords: ["catuano", "natural pool", "saona tour"],
    priceUsd: 139
  },
  {
    slugSuffix: "saona-island-with-dominican-lunch-and-drinks",
    title: "Saona Island with Dominican Lunch and Drinks",
    subtitle: "Cultural lunch profile and beverage service included",
    shortDescription: "Saona day from Punta Cana with Dominican-style lunch and beverage plan integrated.",
    keywords: ["dominican lunch", "drinks included", "saona"],
    priceUsd: 95
  },
  {
    slugSuffix: "saona-island-ultimate-day-from-punta-cana",
    title: "Saona Island Ultimate Day from Punta Cana",
    subtitle: "Complete island schedule with transport and beach program",
    shortDescription: "Ultimate Saona day structure from Punta Cana with complete operations pre-arranged.",
    keywords: ["ultimate day", "saona island", "punta cana"],
    priceUsd: 82
  },
  {
    slugSuffix: "saona-island-group-day-tour",
    title: "Saona Island Group Day Tour",
    subtitle: "Shared group operation with full logistics support",
    shortDescription: "Group day tour to Saona with structured schedule, transfer and island support staff.",
    keywords: ["group day tour", "shared", "saona"],
    priceUsd: 64
  },
  {
    slugSuffix: "saona-island-vip-private-option",
    title: "Saona Island VIP Private Option",
    subtitle: "Private-style flow for travelers seeking more flexibility",
    shortDescription: "VIP private-style Saona option from Punta Cana with tighter service control.",
    keywords: ["vip private", "saona island", "premium"],
    priceUsd: 165
  },
  {
    slugSuffix: "saona-island-family-friendly-day-trip",
    title: "Saona Island Family-Friendly Day Trip",
    subtitle: "Family-oriented schedule with predictable pace and support",
    shortDescription: "Family-compatible Saona route from Punta Cana with simple logistics and beach timing.",
    keywords: ["family friendly", "day trip", "saona"],
    priceUsd: 64
  },
  {
    slugSuffix: "saona-island-full-day-caribbean-cruise",
    title: "Saona Island Full-Day Caribbean Cruise",
    subtitle: "Cruise-style day route with beach and natural pool windows",
    shortDescription: "Caribbean cruise profile to Saona with full-day operation from Punta Cana.",
    keywords: ["caribbean cruise", "full day", "saona island"],
    priceUsd: 75
  },
  {
    slugSuffix: "saona-island-beach-party-catamaran-experience",
    title: "Saona Island Beach Party Catamaran Experience",
    subtitle: "Catamaran social format with island party atmosphere",
    shortDescription: "Catamaran-style Saona day designed for beach energy and organized day flow.",
    keywords: ["beach party", "catamaran", "saona"],
    priceUsd: 72
  },
  {
    slugSuffix: "saona-island-speedboat-adventure",
    title: "Saona Island Speedboat Adventure",
    subtitle: "Fast-transfer style for more effective island time",
    shortDescription: "Speedboat-oriented Saona operation from Punta Cana with optimized travel blocks.",
    keywords: ["speedboat adventure", "saona island", "optimized time"],
    priceUsd: 75
  },
  {
    slugSuffix: "saona-island-and-palmilla-natural-pool-day-trip",
    title: "Saona Island and Palmilla Natural Pool Day Trip",
    subtitle: "Palmilla shallow-water stop plus Saona beach segment",
    shortDescription: "Saona day plan including Palmilla natural pool and guided transition points.",
    keywords: ["palmilla", "natural pool", "day trip"],
    priceUsd: 75
  },
  {
    slugSuffix: "saona-island-best-value-day-tour",
    title: "Saona Island Best Value Day Tour",
    subtitle: "Value-focused full-day route with complete operations",
    shortDescription: "Best-value Saona layout from Punta Cana with transfer, lunch and beach time managed.",
    keywords: ["best value", "saona day tour", "punta cana"],
    priceUsd: 64
  },
  {
    slugSuffix: "saona-island-dream-beaches-excursion",
    title: "Saona Island Dream Beaches Excursion",
    subtitle: "White-sand island profile with all-day tropical pacing",
    shortDescription: "Dream-beaches Saona profile from Punta Cana with organized full-day execution.",
    keywords: ["dream beaches", "white sand", "saona"],
    priceUsd: 75
  }
];

const makeSeoDescription = (title: string, subtitle: string, sourceDescription: string, keywords: string[]) => {
  const cleanSource = sourceDescription.replace(/\s+/g, " ").trim();
  const lead =
    `${title}. ${subtitle}. Esta variante SEO mantiene el mismo precio y operacion del producto base desde Punta Cana, ` +
    `con enfoque en busquedas como ${keywords.join(", ")}.`;
  const body =
    " Incluye coordinacion de traslados, secuencia de salida al area de Bayahibe y tiempos de playa en Isla Saona " +
    "con una estructura clara para reservar online de forma directa.";
  return `${lead}${body} ${cleanSource}`.slice(0, 3200);
};

async function main() {
  const source = await prisma.tour.findFirst({
    where: {
      status: "published",
      slug: "tour-y-entrada-para-de-isla-saona-desde-punta-cana"
    },
    include: {
      options: true
    }
  });

  if (!source) {
    throw new Error("No se encontro el tour base 'tour-y-entrada-para-de-isla-saona-desde-punta-cana'.");
  }

  let created = 0;
  let skipped = 0;

  for (const variant of SAONA_VARIANTS) {
    const slug = `saona-${variant.slugSuffix}`;
    const exists = await prisma.tour.findUnique({ where: { slug }, select: { id: true } });
    if (exists) {
      skipped += 1;
      continue;
    }

    const createdTour = await prisma.tour.create({
      data: {
        id: randomUUID(),
        title: variant.title,
        slug,
        productId: randomUUID(),
        price: variant.priceUsd,
        priceChild: source.priceChild,
        priceYouth: source.priceYouth,
        duration: source.duration,
        description: makeSeoDescription(variant.title, variant.subtitle, source.description, variant.keywords),
        subtitle: variant.subtitle,
        shortDescription: variant.shortDescription,
        category: source.category,
        physicalLevel: source.physicalLevel,
        minAge: source.minAge,
        accessibility: source.accessibility,
        confirmationType: source.confirmationType,
        timeOptions: source.timeOptions,
        operatingDays: source.operatingDays,
        blackoutDates: source.blackoutDates,
        capacity: source.capacity,
        meetingPoint: source.meetingPoint,
        meetingInstructions: source.meetingInstructions,
        pickup: source.pickup,
        requirements: source.requirements,
        cancellationPolicy: source.cancellationPolicy,
        terms: source.terms,
        highlights: source.highlights ?? undefined,
        language: source.language,
        includes: source.includes,
        includesList: source.includesList ?? undefined,
        notIncludedList: source.notIncludedList ?? undefined,
        location: source.location,
        supplierId: source.supplierId,
        featured: false,
        status: "seo_only",
        adminNote: `SEO_ONLY_VARIANT based_on:${source.slug}`,
        gallery: source.gallery,
        heroImage: source.heroImage,
        departureDestinationId: source.departureDestinationId ?? undefined,
        platformSharePercent: source.platformSharePercent,
        countryId: source.countryId,
        destinationId: source.destinationId ?? undefined,
        microZoneId: source.microZoneId ?? undefined
      }
    });

    if (source.options.length > 0) {
      await prisma.tourOption.createMany({
        data: source.options.map((option) => ({
          id: randomUUID(),
          tourId: createdTour.id,
          name: option.name,
          type: option.type,
          description: option.description,
          pricePerPerson: option.pricePerPerson,
          basePrice: option.basePrice,
          baseCapacity: option.baseCapacity,
          extraPricePerPerson: option.extraPricePerPerson,
          pickupTimes: option.pickupTimes ?? undefined,
          isDefault: option.isDefault,
          active: option.active,
          sortOrder: option.sortOrder
        }))
      });
    }

    created += 1;
  }

  console.log(
    JSON.stringify(
      {
        sourceSlug: source.slug,
        sourcePrice: source.price,
        requested: SAONA_VARIANTS.length,
        created,
        skipped,
        status: "seo_only",
        sampleUrl: "https://proactivitis.com/tours/saona-saona-island-tour-with-lunch-and-pickup"
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
