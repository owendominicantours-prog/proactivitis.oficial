import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_LOGO, PROACTIVITIS_URL, getPriceValidUntil } from "@/lib/seo";

export type HybridAudienceSlug = "families" | "adults" | "couples";
export type HybridSeason = "dry" | "summer" | "rainy";

export type HybridTransferOption = {
  id: string;
  label: string;
  vehicleName: string;
  description: string;
  price: number;
  maxPax: number;
  pax: string;
};

export type HybridTourProduct = {
  id: string | null;
  slug: string;
  title: string;
  price: number;
  shortDescription: string;
  image: string;
  category: string;
  location: string;
};

export type HybridLanding = {
  locale: "en";
  zone: (typeof HYBRID_ZONES)[number];
  audience: (typeof HYBRID_AUDIENCES)[HybridAudienceSlug];
  month: (typeof HYBRID_MONTHS)[number];
  path: string;
  canonical: string;
  title: string;
  h1: string;
  metaDescription: string;
  blogIntro: string;
  blogTips: string[];
  productSlugs: string[];
  keywords: string[];
};

export const HYBRID_AUDIENCES = {
  families: {
    slug: "families",
    label: "Families",
    searchLabel: "families travelling",
    promise: "safe pacing, clear pickup windows, roomy vehicles and family-friendly tours",
    prioritySignals: ["family", "kids", "buffet", "safe", "slow pace", "water", "cultural"],
    blockedSignals: ["party", "open bar", "alcohol", "nightclub", "booze"]
  },
  adults: {
    slug: "adults",
    label: "Adults",
    searchLabel: "adults travelling",
    promise: "private transfers, VIP upgrades, adventure, nightlife-friendly timing and flexible routing",
    prioritySignals: ["vip", "adventure", "open bar", "private", "gastronomy", "history"],
    blockedSignals: []
  },
  couples: {
    slug: "couples",
    label: "Couples",
    searchLabel: "couples travelling",
    promise: "private comfort, scenic experiences, photo stops and premium timing",
    prioritySignals: ["private", "romantic", "sunset", "vip", "gastronomy", "beach"],
    blockedSignals: []
  }
} as const;

export const HYBRID_ZONES = [
  {
    slug: "punta-cana",
    name: "Punta Cana and Bavaro",
    mapName: "Punta Cana",
    transferType: "Private van or family minibus",
    heroImage: "/fototours/fototour.jpeg",
    transferCopy:
      "Use a private airport transfer as the anchor for the trip, then add water, beach and adventure tours around the exact hotel stay.",
    productSlugs: [
      "tour-en-buggy-por-punta-cana",
      "tour-en-buggy-en-punta-cana",
      "tour-y-entrada-para-de-isla-saona-desde-punta-cana",
      "sunset-catamaran-snorkel",
      "parasailing-punta-cana"
    ],
    transferOptions: [
      {
        id: "punta-cana-private-van-roundtrip",
        label: "Airport -> hotel -> airport",
        vehicleName: "Private Van",
        description: "Round-trip private transfer for resorts in Punta Cana, Bavaro, Cap Cana and Uvero Alto.",
        price: 85,
        maxPax: 6,
        pax: "1-6"
      },
      {
        id: "punta-cana-minibus-family",
        label: "Family minibus round trip",
        vehicleName: "Private Minibus",
        description: "More luggage space and easier boarding for families or small groups.",
        price: 135,
        maxPax: 14,
        pax: "7-14"
      }
    ]
  },
  {
    slug: "santo-domingo",
    name: "Santo Domingo",
    mapName: "Santo Domingo",
    transferType: "Executive sedan or corporate van",
    heroImage: "/fototours/fotosimple.jpg",
    transferCopy:
      "Start with an executive transfer plan, then add colonial history, food routes and indoor-friendly cultural stops.",
    productSlugs: [
      "excursion-de-un-dia-a-santo-domingo-desde-punta-cana",
      "santo-domingo-city-tour",
      "los-tres-ojos-santo-domingo",
      "zona-colonial-private-tour"
    ],
    transferOptions: [
      {
        id: "santo-domingo-executive-sedan",
        label: "Executive airport transfer",
        vehicleName: "Executive Sedan",
        description: "Direct private transfer for couples, executives or short city stays.",
        price: 145,
        maxPax: 3,
        pax: "1-3"
      },
      {
        id: "santo-domingo-corporate-van",
        label: "Corporate van round trip",
        vehicleName: "Corporate Van",
        description: "Comfortable city transfer for groups with bags, meetings or event schedules.",
        price: 225,
        maxPax: 10,
        pax: "4-10"
      }
    ]
  },
  {
    slug: "bayahibe-la-romana",
    name: "Bayahibe and La Romana",
    mapName: "Bayahibe",
    transferType: "Private express transfer",
    heroImage: "/fototours/fototour.jpeg",
    transferCopy:
      "Anchor the stay with a private express transfer, then add island, diving and Saona VIP experiences from Bayahibe or La Romana.",
    productSlugs: [
      "tour-isla-saona-desde-bayhibe-la-romana",
      "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana",
      "isla-catalina-diving",
      "saona-vip-bayahibe"
    ],
    transferOptions: [
      {
        id: "bayahibe-private-express",
        label: "Private express transfer",
        vehicleName: "Private SUV",
        description: "Direct airport or hotel transfer for Bayahibe, Dominicus and La Romana.",
        price: 125,
        maxPax: 5,
        pax: "1-5"
      },
      {
        id: "la-romana-group-van",
        label: "Group van round trip",
        vehicleName: "Private Van",
        description: "Better for island tour groups carrying luggage and beach gear.",
        price: 185,
        maxPax: 12,
        pax: "6-12"
      }
    ]
  }
] as const;

export const HYBRID_MONTHS = [
  { number: 1, slug: "january", label: "January", season: "dry" as const },
  { number: 2, slug: "february", label: "February", season: "dry" as const },
  { number: 3, slug: "march", label: "March", season: "dry" as const },
  { number: 4, slug: "april", label: "April", season: "dry" as const },
  { number: 5, slug: "may", label: "May", season: "summer" as const },
  { number: 6, slug: "june", label: "June", season: "summer" as const },
  { number: 7, slug: "july", label: "July", season: "summer" as const },
  { number: 8, slug: "august", label: "August", season: "summer" as const },
  { number: 9, slug: "september", label: "September", season: "rainy" as const },
  { number: 10, slug: "october", label: "October", season: "rainy" as const },
  { number: 11, slug: "november", label: "November", season: "rainy" as const },
  { number: 12, slug: "december", label: "December", season: "dry" as const }
] as const;

export const HYBRID_SEASON_COPY: Record<HybridSeason, { climate: string; tourFilter: string; tips: string[] }> = {
  dry: {
    climate: "Dry season usually brings sunny days, pleasant temperatures around 22C to 28C and better conditions for long outdoor plans.",
    tourFilter:
      "Prioritize full-day outdoor tours, longer walking routes, beach days and historical itineraries that benefit from stable weather.",
    tips: ["Book airport pickup early in the day when possible.", "Pack sunscreen and light layers for evening rides.", "Reserve popular day trips before arrival."]
  },
  summer: {
    climate: "Summer is hot and humid, with temperatures that can reach 33C and brief tropical showers, usually later in the day.",
    tourFilter:
      "Prioritize air-conditioned transfers, water tours, catamarans, mud buggy routes, beaches and late-afternoon or night experiences.",
    tips: ["Choose vehicles with full air conditioning.", "Keep water tours and shaded stops near the top of the plan.", "Leave buffer time around afternoon showers."]
  },
  rainy: {
    climate: "Rainy season can bring higher humidity and more frequent Caribbean showers, while many activities still operate with flexible timing.",
    tourFilter:
      "Highlight flexible date changes, covered cultural stops and all-terrain adventures that are not cancelled by light rain.",
    tips: ["Choose flexible tours first.", "Keep one cultural or indoor-friendly option in the plan.", "Avoid overloading the same afternoon."]
  }
};

const ABSOLUTE_IMAGE_FALLBACK = `${PROACTIVITIS_URL}/fototours/fotosimple.jpg`;

const safeTitle = (value: string) => value.replace(/\s+/g, " ").trim();

export const parseAudienceMonth = (audienceMonth: string) => {
  const match = audienceMonth.match(/^([a-z-]+)-([a-z]+)$/);
  if (!match) return null;
  const audience = HYBRID_AUDIENCES[match[1] as HybridAudienceSlug];
  const month = HYBRID_MONTHS.find((item) => item.slug === match[2]);
  if (!audience || !month) return null;
  return { audience, month };
};

export const getHybridLandingStaticParams = () =>
  HYBRID_ZONES.flatMap((zone) =>
    (Object.keys(HYBRID_AUDIENCES) as HybridAudienceSlug[]).flatMap((audience) =>
      HYBRID_MONTHS.map((month) => ({
        zoneSlug: zone.slug,
        audienceMonth: `${audience}-${month.slug}`
      }))
    )
  );

export const getHybridLanding = (zoneSlug: string, audienceMonth: string): HybridLanding | null => {
  const zone = HYBRID_ZONES.find((item) => item.slug === zoneSlug);
  const parsed = parseAudienceMonth(audienceMonth);
  if (!zone || !parsed) return null;

  const { audience, month } = parsed;
  const season = HYBRID_SEASON_COPY[month.season];
  const path = `/en/tours/${zone.slug}/${audience.slug}-${month.slug}`;
  const title = `${audience.label} travelling to ${zone.mapName} in ${month.label}`;
  const h1 = `${title}: transfer, dates and tours in one plan`;
  const metaDescription = `Plan ${zone.mapName} in ${month.label} for ${audience.label.toLowerCase()}: private transfer, seasonal travel tips and modular tours you can add before checkout.`;
  const blogIntro = `${month.label} in ${zone.mapName} works best when the transfer is planned first. ${season.climate} For ${audience.label.toLowerCase()}, the strongest plan is ${audience.promise}.`;
  const keywords = [
    `${audience.searchLabel} to ${zone.mapName} in ${month.label}`,
    `${zone.mapName} ${month.label} private transfer`,
    `${zone.mapName} tours for ${audience.label.toLowerCase()}`,
    `${zone.mapName} travel planner ${month.label}`
  ];

  return {
    locale: "en",
    zone,
    audience,
    month,
    path,
    canonical: `${PROACTIVITIS_URL}${path}`,
    title: safeTitle(title),
    h1: safeTitle(h1),
    metaDescription,
    blogIntro,
    blogTips: [season.tourFilter, ...season.tips],
    productSlugs: [...zone.productSlugs],
    keywords
  };
};

const fallbackProductBySlug = (slug: string, zoneName: string): HybridTourProduct => {
  const title = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return {
    id: null,
    slug,
    title,
    price: 65,
    shortDescription: `Recommended ${zoneName} experience for this seasonal travel plan.`,
    image: ABSOLUTE_IMAGE_FALLBACK,
    category: "Tour",
    location: zoneName
  };
};

export const getHybridTourProducts = async (landing: HybridLanding): Promise<HybridTourProduct[]> => {
  const rows = await prisma.tour.findMany({
    where: {
      status: "published",
      slug: { in: landing.productSlugs }
    },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      shortDescription: true,
      heroImage: true,
      gallery: true,
      category: true,
      location: true
    }
  });

  const blocked = landing.audience.blockedSignals.map((item) => item.toLowerCase());
  const bySlug = new Map(
    rows.map((tour) => {
      const image = tour.heroImage?.startsWith("http")
        ? tour.heroImage
        : `${PROACTIVITIS_URL}${tour.heroImage || "/fototours/fotosimple.jpg"}`;
      const product: HybridTourProduct = {
        id: tour.id,
        slug: tour.slug,
        title: tour.title,
        price: Number(tour.price || 0),
        shortDescription: tour.shortDescription || `Recommended ${landing.zone.mapName} experience.`,
        image,
        category: tour.category || "Tour",
        location: tour.location || landing.zone.mapName
      };
      return [tour.slug, product] as const;
    })
  );

  return landing.productSlugs
    .map((slug) => bySlug.get(slug) ?? fallbackProductBySlug(slug, landing.zone.mapName))
    .filter((tour) => {
      const haystack = `${tour.title} ${tour.shortDescription} ${tour.category}`.toLowerCase();
      return !blocked.some((term) => haystack.includes(term));
    })
    .slice(0, 6);
};

export const buildHybridLandingMetadata = (landing: HybridLanding): Metadata => ({
  title: `${landing.title} | Proactivitis`,
  description: landing.metaDescription,
  keywords: landing.keywords,
  alternates: { canonical: landing.canonical },
  openGraph: {
    title: landing.h1,
    description: landing.metaDescription,
    url: landing.canonical,
    type: "article",
    siteName: "Proactivitis",
    images: [{ url: `${PROACTIVITIS_URL}${landing.zone.heroImage}`, alt: landing.title }]
  },
  twitter: {
    card: "summary_large_image",
    title: landing.h1,
    description: landing.metaDescription,
    images: [`${PROACTIVITIS_URL}${landing.zone.heroImage}`]
  }
});

const SERVICE_SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  shippingRate: {
    "@type": "MonetaryAmount",
    value: 0,
    currency: "USD"
  },
  shippingDestination: {
    "@type": "DefinedRegion",
    addressCountry: "DO"
  },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: {
      "@type": "QuantitativeValue",
      minValue: 0,
      maxValue: 1,
      unitCode: "DAY"
    },
    transitTime: {
      "@type": "QuantitativeValue",
      minValue: 0,
      maxValue: 1,
      unitCode: "DAY"
    }
  }
};

const MERCHANT_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  url: `${PROACTIVITIS_URL}/legal/refund-policy`,
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 1,
  applicableCountry: "DO",
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn"
};

export const buildHybridLandingSchema = (landing: HybridLanding, tours: HybridTourProduct[]) => {
  const priceValidUntil = getPriceValidUntil();
  const offers = [
    ...landing.zone.transferOptions.map((transfer, index) => ({
      "@type": "Offer",
      "@id": `${landing.canonical}#transfer-offer-${index + 1}`,
      name: transfer.label,
      price: transfer.price.toFixed(2),
      priceCurrency: "USD",
      priceValidUntil,
      availability: "https://schema.org/InStock",
      shippingDetails: SERVICE_SHIPPING_DETAILS,
      hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
      itemOffered: {
        "@type": "Service",
        name: transfer.vehicleName,
        serviceType: landing.zone.transferType,
        areaServed: landing.zone.mapName
      }
    })),
    ...tours.map((tour, index) => ({
      "@type": "Offer",
      "@id": `${landing.canonical}#tour-offer-${index + 1}`,
      name: tour.title,
      url: `${PROACTIVITIS_URL}/tours/${tour.slug}`,
      price: tour.price.toFixed(2),
      priceCurrency: "USD",
      priceValidUntil,
      availability: "https://schema.org/InStock",
      shippingDetails: SERVICE_SHIPPING_DETAILS,
      hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
      itemOffered: {
        "@type": "TouristTrip",
        name: tour.title,
        image: tour.image,
        touristType: tour.category,
        location: {
          "@type": "Place",
          name: tour.location
        }
      }
    }))
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": `${PROACTIVITIS_URL}#organization`,
        name: "Proactivitis",
        url: PROACTIVITIS_URL,
        logo: PROACTIVITIS_LOGO
      },
      {
        "@type": "WebPage",
        "@id": `${landing.canonical}#webpage`,
        url: landing.canonical,
        name: landing.h1,
        description: landing.metaDescription,
        inLanguage: "en",
        isPartOf: { "@id": `${PROACTIVITIS_URL}#website` },
        mainEntity: [{ "@id": `${landing.canonical}#article` }, { "@id": `${landing.canonical}#combo-catalog` }]
      },
      {
        "@type": "Article",
        "@id": `${landing.canonical}#article`,
        headline: landing.h1,
        description: landing.metaDescription,
        image: `${PROACTIVITIS_URL}${landing.zone.heroImage}`,
        author: { "@id": `${PROACTIVITIS_URL}#organization` },
        publisher: { "@id": `${PROACTIVITIS_URL}#organization` },
        about: landing.keywords,
        articleSection: "Travel planning",
        inLanguage: "en"
      },
      {
        "@type": "OfferCatalog",
        "@id": `${landing.canonical}#combo-catalog`,
        name: `${landing.title} modular trip plan`,
        itemListElement: offers
      },
      {
        "@type": "ItemList",
        "@id": `${landing.canonical}#recommended-tours`,
        name: `Recommended tours for ${landing.title}`,
        itemListElement: tours.map((tour, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${PROACTIVITIS_URL}/tours/${tour.slug}`,
          name: tour.title
        }))
      },
      {
        "@type": "FAQPage",
        "@id": `${landing.canonical}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: `What should ${landing.audience.label.toLowerCase()} book first in ${landing.zone.mapName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "Book the private transfer first, then add exact dates and recommended tours around the hotel stay."
            }
          },
          {
            "@type": "Question",
            name: `Is ${landing.month.label} a good month for ${landing.zone.mapName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: HYBRID_SEASON_COPY[landing.month.season].climate
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${landing.canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: PROACTIVITIS_URL },
          { "@type": "ListItem", position: 2, name: "Tours", item: `${PROACTIVITIS_URL}/en/tours` },
          { "@type": "ListItem", position: 3, name: landing.title, item: landing.canonical }
        ]
      }
    ]
  };
};
