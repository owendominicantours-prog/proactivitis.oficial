import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

type Variant = {
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  priceUsd: number;
  keywords: string[];
};

type Pack = {
  baseSlug: string;
  locationOverride?: string;
  variants: Variant[];
};

const PACKS: Pack[] = [
  {
    baseSlug: "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana",
    locationOverride: "Higuey · Punta Cana",
    variants: [
      {
        slug: "higuey-cultural-safari-and-local-town-tour",
        title: "Higuey Cultural Safari and Local Town Tour",
        subtitle: "Countryside, local culture and city highlights",
        shortDescription: "Cultural safari format with local-town stops and guided logistics from Punta Cana.",
        priceUsd: 55,
        keywords: ["higuey", "cultural safari", "punta cana day trip"]
      },
      {
        slug: "higuey-basilica-and-dominican-countryside-safari",
        title: "Higuey Basilica and Dominican Countryside Safari",
        subtitle: "Historic basilica, sugarcane zones and village route",
        shortDescription: "Dominican countryside day including Higuey Basilica and local culture stops.",
        priceUsd: 59,
        keywords: ["basilica de higuey", "dominican countryside", "safari tour"]
      },
      {
        slug: "higuey-city-and-country-experience-from-punta-cana",
        title: "Higuey City and Country Experience from Punta Cana",
        subtitle: "Urban and rural contrast in one guided excursion",
        shortDescription: "Day experience mixing city landmarks and countryside life from Punta Cana.",
        priceUsd: 65,
        keywords: ["higuey city", "country experience", "from punta cana"]
      },
      {
        slug: "dominican-culture-and-higuey-market-safari",
        title: "Dominican Culture and Higuey Market Safari",
        subtitle: "Authentic local market and community insight",
        shortDescription: "Cultural route centered on Dominican daily life and Higuey market atmosphere.",
        priceUsd: 60,
        keywords: ["higuey market", "dominican culture", "local experience"]
      },
      {
        slug: "higuey-and-anamuya-cultural-adventure",
        title: "Higuey and Anamuya Cultural Adventure",
        subtitle: "Rural immersion with traditional Dominican touchpoints",
        shortDescription: "Cultural adventure with countryside segments and guided community interactions.",
        priceUsd: 62,
        keywords: ["anamuya", "higuey", "cultural adventure"]
      },
      {
        slug: "higuey-dominican-heritage-day-tour",
        title: "Higuey Dominican Heritage Day Tour",
        subtitle: "A full-day route through regional heritage spots",
        shortDescription: "Heritage-focused itinerary connecting key cultural locations near Punta Cana.",
        priceUsd: 58,
        keywords: ["dominican heritage", "higuey day tour", "culture"]
      },
      {
        slug: "higuey-cultural-tour-with-local-lunch",
        title: "Higuey Cultural Tour with Local Lunch",
        subtitle: "Traditional food stop and cultural discovery",
        shortDescription: "Cultural tour profile with local lunch stop and organized transfer blocks.",
        priceUsd: 69,
        keywords: ["local lunch", "higuey cultural tour", "day trip"]
      },
      {
        slug: "higuey-countryside-heritage-and-community-tour",
        title: "Higuey Countryside Heritage and Community Tour",
        subtitle: "Community-led perspective on Dominican traditions",
        shortDescription: "Countryside and community approach for travelers looking for authentic context.",
        priceUsd: 57,
        keywords: ["community tour", "countryside heritage", "higuey"]
      },
      {
        slug: "higuey-culture-and-history-guided-excursion",
        title: "Higuey Culture and History Guided Excursion",
        subtitle: "Guided narrative across key historic points",
        shortDescription: "History-oriented Higuey route with clear logistics and guided storytelling.",
        priceUsd: 56,
        keywords: ["history", "guided excursion", "higuey"]
      },
      {
        slug: "higuey-basilica-local-life-and-safari-route",
        title: "Higuey Basilica, Local Life and Safari Route",
        subtitle: "Faith landmark plus real Dominican lifestyle stops",
        shortDescription: "Balanced itinerary between iconic sites and local-life immersion.",
        priceUsd: 61,
        keywords: ["basilica", "local life", "safari route"]
      }
    ]
  },
  {
    baseSlug: "tour-en-buggy-en-punta-cana",
    locationOverride: "Macao · Punta Cana",
    variants: [
      {
        slug: "punta-cana-buggy-adventure-macao-beach-and-cave",
        title: "Punta Cana Buggy Adventure: Macao Beach and Cave",
        subtitle: "Off-road route with cave swim and beach segment",
        shortDescription: "Buggy adventure including Macao area, cave stop and guided off-road path.",
        priceUsd: 48,
        keywords: ["buggy punta cana", "macao beach", "cave"]
      },
      {
        slug: "half-day-buggy-tour-in-punta-cana",
        title: "Half-Day Buggy Tour in Punta Cana",
        subtitle: "Fast-paced off-road format for shorter schedules",
        shortDescription: "Half-day buggy operation with transport and key stopovers near Punta Cana.",
        priceUsd: 42,
        keywords: ["half-day buggy", "punta cana", "off-road"]
      },
      {
        slug: "punta-cana-atv-and-buggy-off-road-experience",
        title: "Punta Cana ATV and Buggy Off-Road Experience",
        subtitle: "Rural tracks and adventure-focused route design",
        shortDescription: "ATV and buggy style adventure with controlled route and operator support.",
        priceUsd: 55,
        keywords: ["atv", "buggy", "off-road experience"]
      },
      {
        slug: "macao-buggy-tour-with-dominican-ranch-stop",
        title: "Macao Buggy Tour with Dominican Ranch Stop",
        subtitle: "Terrain route with local ranch checkpoint",
        shortDescription: "Macao buggy itinerary with ranch stop and countryside route timing.",
        priceUsd: 45,
        keywords: ["macao buggy", "dominican ranch", "punta cana"]
      },
      {
        slug: "punta-cana-double-buggy-adventure-with-cave-swim",
        title: "Punta Cana Double Buggy Adventure with Cave Swim",
        subtitle: "Shared buggy option with cave stop included",
        shortDescription: "Double buggy option with cave swim and guided transfers from hotel zones.",
        priceUsd: 50,
        keywords: ["double buggy", "cave swim", "adventure"]
      },
      {
        slug: "punta-cana-single-buggy-adventure-tour",
        title: "Punta Cana Single Buggy Adventure Tour",
        subtitle: "Solo-driver off-road route with key checkpoints",
        shortDescription: "Single buggy layout for independent driving style and structured stop sequence.",
        priceUsd: 65,
        keywords: ["single buggy", "punta cana", "tour"]
      },
      {
        slug: "buggy-and-local-tasting-tour-punta-cana",
        title: "Buggy and Local Tasting Tour Punta Cana",
        subtitle: "Off-road action plus local product tasting",
        shortDescription: "Buggy route combined with local tasting stop in a managed half-day schedule.",
        priceUsd: 47,
        keywords: ["local tasting", "buggy tour", "punta cana"]
      },
      {
        slug: "macao-dunes-buggy-and-beach-day",
        title: "Macao Dunes Buggy and Beach Day",
        subtitle: "Dune-style tracks and beach checkpoint route",
        shortDescription: "Macao dunes profile with beach segment and operator-led off-road controls.",
        priceUsd: 46,
        keywords: ["macao dunes", "beach day", "buggy"]
      },
      {
        slug: "punta-cana-buggy-cave-and-countryside-tour",
        title: "Punta Cana Buggy, Cave and Countryside Tour",
        subtitle: "Mixed-terrain operation with cave and rural route",
        shortDescription: "Countryside buggy profile with cave stop and clear operator logistics.",
        priceUsd: 49,
        keywords: ["countryside", "cave", "buggy punta cana"]
      },
      {
        slug: "extreme-buggy-route-punta-cana",
        title: "Extreme Buggy Route Punta Cana",
        subtitle: "High-adrenaline route with off-road intensity",
        shortDescription: "Adventure-heavy buggy route from Punta Cana for clients seeking stronger terrain action.",
        priceUsd: 58,
        keywords: ["extreme buggy", "off-road", "punta cana"]
      }
    ]
  },
  {
    baseSlug: "sunset-catamaran-snorkel",
    locationOverride: "Bavaro Beach · Punta Cana",
    variants: [
      {
        slug: "bavaro-party-boat-with-snorkeling-and-open-bar",
        title: "Bavaro Party Boat with Snorkeling and Open Bar",
        subtitle: "Bavaro Beach marine party route with snorkel stop",
        shortDescription: "Party boat format with open bar and snorkeling segment near Bavaro Beach.",
        priceUsd: 65,
        keywords: ["party boat punta cana", "bavaro beach", "open bar"]
      },
      {
        slug: "punta-cana-catamaran-party-cruise-bavaro",
        title: "Punta Cana Catamaran Party Cruise - Bavaro",
        subtitle: "Catamaran social cruise with beachline views",
        shortDescription: "Bavaro catamaran party cruise with natural pool and onboard entertainment.",
        priceUsd: 70,
        keywords: ["catamaran party", "bavaro", "punta cana"]
      },
      {
        slug: "bavaro-beach-party-boat-day-experience",
        title: "Bavaro Beach Party Boat Day Experience",
        subtitle: "Daytime party navigation along Bavaro coastline",
        shortDescription: "Beach-party day route with marine activities and organized pickup timing.",
        priceUsd: 68,
        keywords: ["bavaro beach", "party boat day", "marine experience"]
      },
      {
        slug: "snorkel-and-party-catamaran-punta-cana",
        title: "Snorkel and Party Catamaran Punta Cana",
        subtitle: "Snorkel segment plus party session onboard",
        shortDescription: "Catamaran profile that blends snorkeling and social boat atmosphere.",
        priceUsd: 72,
        keywords: ["snorkel", "party catamaran", "punta cana"]
      },
      {
        slug: "party-boat-punta-cana-with-natural-pool-stop",
        title: "Party Boat Punta Cana with Natural Pool Stop",
        subtitle: "Floating-party format with shallow-water break",
        shortDescription: "Party boat route including natural pool stop and managed open-bar timing.",
        priceUsd: 69,
        keywords: ["party boat", "natural pool", "punta cana"]
      },
      {
        slug: "bavaro-catamaran-open-bar-and-snorkeling",
        title: "Bavaro Catamaran Open Bar and Snorkeling",
        subtitle: "Open-bar catamaran with reef snorkeling window",
        shortDescription: "Bavaro catamaran operation with open bar and reef snorkeling stop.",
        priceUsd: 74,
        keywords: ["bavaro catamaran", "open bar", "snorkeling"]
      },
      {
        slug: "punta-cana-party-boat-for-groups",
        title: "Punta Cana Party Boat for Groups",
        subtitle: "Group-ready party format with coastal route",
        shortDescription: "Group-oriented party boat route in Punta Cana with guided boarding logistics.",
        priceUsd: 76,
        keywords: ["groups", "party boat punta cana", "coastal route"]
      },
      {
        slug: "bavaro-beach-catamaran-party-and-snorkel",
        title: "Bavaro Beach Catamaran Party and Snorkel",
        subtitle: "Bavaro marine mix of party and snorkeling",
        shortDescription: "Catamaran package for Bavaro Beach with snorkeling and party activity blocks.",
        priceUsd: 67,
        keywords: ["bavaro beach", "catamaran party", "snorkel"]
      },
      {
        slug: "punta-cana-adults-party-boat-cruise",
        title: "Punta Cana Adults Party Boat Cruise",
        subtitle: "Adults-focused party atmosphere on the water",
        shortDescription: "Adults social cruise in Punta Cana with curated onboard entertainment flow.",
        priceUsd: 79,
        keywords: ["adults party boat", "punta cana", "cruise"]
      },
      {
        slug: "sunset-style-party-catamaran-bavaro",
        title: "Sunset-Style Party Catamaran Bavaro",
        subtitle: "Late-afternoon marine party profile in Bavaro",
        shortDescription: "Sunset-style party catamaran with Bavaro routing and managed open-bar service.",
        priceUsd: 82,
        keywords: ["sunset catamaran", "bavaro", "party boat"]
      }
    ]
  }
];

const makeDescription = (title: string, subtitle: string, sourceDescription: string, keywords: string[]) => {
  const cleanSource = sourceDescription.replace(/\s+/g, " ").trim();
  const lead =
    `${title}. ${subtitle}. Esta variante SEO mantiene la operacion del producto base y ajusta el enfoque para busquedas como ${keywords.join(", ")}.`;
  const body =
    " Incluye coordinacion operativa y reserva directa para clientes que llegan desde Google y buscan disponibilidad real con precio claro.";
  return `${lead}${body} ${cleanSource}`.slice(0, 3200);
};

async function createPack(pack: Pack) {
  const source = await prisma.tour.findFirst({
    where: { slug: pack.baseSlug, status: "published" },
    include: { options: true }
  });
  if (!source) {
    return { baseSlug: pack.baseSlug, created: 0, skipped: pack.variants.length, missingSource: true };
  }

  let created = 0;
  let skipped = 0;

  for (const variant of pack.variants) {
    const exists = await prisma.tour.findUnique({ where: { slug: variant.slug }, select: { id: true } });
    if (exists) {
      skipped += 1;
      continue;
    }

    const createdTour = await prisma.tour.create({
      data: {
        id: randomUUID(),
        title: variant.title,
        slug: variant.slug,
        productId: randomUUID(),
        price: variant.priceUsd,
        priceChild: source.priceChild,
        priceYouth: source.priceYouth,
        duration: source.duration,
        description: makeDescription(variant.title, variant.subtitle, source.description, variant.keywords),
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
        location: pack.locationOverride ?? source.location,
        supplierId: source.supplierId,
        featured: false,
        status: "seo_only",
        adminNote: `SEO_ONLY_VARIANT based_on:${source.slug} source:viator_like`,
        gallery: source.gallery,
        heroImage: source.heroImage,
        departureDestinationId: source.departureDestinationId ?? undefined,
        platformSharePercent: source.platformSharePercent,
        countryId: source.countryId,
        destinationId: source.destinationId ?? undefined,
        microZoneId: source.microZoneId ?? undefined
      }
    });

    if (source.options.length) {
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

  return { baseSlug: pack.baseSlug, created, skipped, missingSource: false };
}

async function main() {
  const results = [];
  for (const pack of PACKS) {
    const result = await createPack(pack);
    results.push(result);
  }

  const totalCreated = results.reduce((sum, item) => sum + item.created, 0);
  const totalSkipped = results.reduce((sum, item) => sum + item.skipped, 0);
  console.log(JSON.stringify({ packs: results, totalCreated, totalSkipped }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

