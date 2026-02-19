export type CountryToPuntaCanaLanding = {
  country: string;
  slug: string;
  title: string;
  tagline: string;
  metaDescription: string;
  buyerAngle: string;
  transferPitch: string;
  hotelPitch: string;
  excursionPitch: string;
  sections: string[];
};

type CountrySeed = {
  country: string;
  hook: string;
  transfer: string;
  hotel: string;
  excursion: string;
};

const toSlug = (country: string) =>
  country
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const COUNTRY_SEEDS: CountrySeed[] = [
  {
    country: "Panama",
    hook: "Fast Caribbean access with short travel windows and high-value family packages.",
    transfer: "Private airport pickup with bilingual driver and flexible waiting time.",
    hotel: "Resorts in Bavaro, Cap Cana, and Uvero Alto based on travel style and budget.",
    excursion: "Saona, catamaran party, ATV, and city experiences with local support."
  },
  {
    country: "Mexico",
    hook: "High-volume leisure demand focused on all-inclusive experiences and premium upgrades.",
    transfer: "VIP and private transfers from PUJ with real-time WhatsApp assistance.",
    hotel: "Resort options for couples, families, and celebration groups.",
    excursion: "Ocean, adventure, and nightlife excursions bundled by interest."
  },
  {
    country: "United States",
    hook: "Top market for Punta Cana with strong demand for trust, speed, and clear pricing.",
    transfer: "Door-to-door airport transfer with flight monitoring and 24/7 support.",
    hotel: "Best-fit resort selection from value all-inclusive to luxury beachfront stays.",
    excursion: "Top-rated excursions with instant booking support and flexible plans."
  },
  {
    country: "Canada",
    hook: "Seasonal escape demand focused on weather, comfort, and efficient planning.",
    transfer: "Reliable private transfer options for solo, couples, and family groups.",
    hotel: "All-inclusive resort recommendations by area and traveler profile.",
    excursion: "Balanced packages with beach days, tours, and premium add-ons."
  },
  {
    country: "Colombia",
    hook: "Growing outbound market with strong preference for bundled vacation services.",
    transfer: "Airport transfer coordination with clear communication before arrival.",
    hotel: "Resort choices with strong value-to-quality ratio and curated highlights.",
    excursion: "Adventure, party boat, and island tours with local concierge support."
  },
  {
    country: "Argentina",
    hook: "Long-stay travelers looking for complete itinerary support and high service quality.",
    transfer: "Secure private transfer from airport to hotel with multilingual attention.",
    hotel: "Resorts with premium dining, adults-only zones, and family options.",
    excursion: "Multi-day excursion planning with sea, culture, and entertainment."
  },
  {
    country: "Brazil",
    hook: "High-intent travelers seeking premium resort experiences and custom planning.",
    transfer: "Executive transfer options for airport arrivals and hotel mobility.",
    hotel: "Luxury and upscale all-inclusive options with curated comparisons.",
    excursion: "Signature tours combining ocean, nature, and social experiences."
  },
  {
    country: "Chile",
    hook: "Experience-driven buyers who compare quality, logistics, and response speed.",
    transfer: "On-time private transfer with support team available before and after landing.",
    hotel: "Resort recommendations by location, room category, and traveler type.",
    excursion: "Verified excursions with itinerary guidance and booking follow-up."
  },
  {
    country: "Peru",
    hook: "Vacation buyers focused on complete service from airport to excursions.",
    transfer: "Pre-arrival transfer confirmation and seamless hotel drop-off.",
    hotel: "All-inclusive and premium resort selection for every travel profile.",
    excursion: "Excursion bundles for families, couples, and celebration trips."
  },
  {
    country: "Ecuador",
    hook: "High-value travelers prioritizing smooth logistics and local support.",
    transfer: "Private transfer with transparent rates and easy coordination.",
    hotel: "Resort options with clear positioning by area and travel purpose.",
    excursion: "Top excursions with organized scheduling and support in destination."
  },
  {
    country: "Costa Rica",
    hook: "Travelers that value reliability, clear planning, and premium service layers.",
    transfer: "Airport transportation with driver tracking and direct WhatsApp line.",
    hotel: "Carefully selected resorts across Punta Cana's most demanded areas.",
    excursion: "Excursions optimized by duration, comfort, and experience quality."
  },
  {
    country: "Guatemala",
    hook: "Growing outbound segment seeking all-in-one trip planning support.",
    transfer: "Private and shared transfer options with clear communication flows.",
    hotel: "Resorts filtered by budget, amenities, and group needs.",
    excursion: "Complete excursion catalog with support from booking to operation day."
  },
  {
    country: "El Salvador",
    hook: "Price-conscious buyers who still expect strong service and trust.",
    transfer: "Efficient airport transfer with transparent quote and no surprises.",
    hotel: "Competitive resort packages with real inventory guidance.",
    excursion: "Best-selling tours and optional add-ons for full vacation planning."
  },
  {
    country: "Honduras",
    hook: "Leisure travelers looking for easy booking and concierge-style help.",
    transfer: "From airport to hotel with flexible pickup and active support.",
    hotel: "All-inclusive resort recommendations by style and location.",
    excursion: "Ocean and adventure tours with practical route planning."
  },
  {
    country: "Nicaragua",
    hook: "Emerging segment with high need for confidence and itinerary assistance.",
    transfer: "Reliable transfer service with operation monitoring and support.",
    hotel: "Resort shortlist tailored to traveler goals and expected comfort.",
    excursion: "Excursion scheduling with strong local execution and guidance."
  },
  {
    country: "Uruguay",
    hook: "Premium-leaning travelers with high expectations on service standards.",
    transfer: "Premium and private airport transfer options with direct support.",
    hotel: "Upscale all-inclusive and boutique-style recommendations in Punta Cana.",
    excursion: "Selective excursion curation focused on quality over volume."
  },
  {
    country: "Paraguay",
    hook: "Family and group travelers seeking full-service vacation coordination.",
    transfer: "Airport transfer arranged with clear travel-day communication.",
    hotel: "Resorts with strong family amenities and value-focused pricing.",
    excursion: "High-demand excursions with simple booking process and follow-up."
  },
  {
    country: "Bolivia",
    hook: "Travelers comparing complete package value across destination providers.",
    transfer: "Private transfer routes optimized for arrival comfort and speed.",
    hotel: "Resort options segmented by budget, location, and experience level.",
    excursion: "Tour portfolio designed for easy bundling with hotel stays."
  },
  {
    country: "Venezuela",
    hook: "Vacation demand centered on trusted operators and clear end-to-end support.",
    transfer: "Airport mobility with responsive support and route reliability.",
    hotel: "High-value all-inclusive resorts with practical comparison points.",
    excursion: "Top excursion picks with local coordination and support."
  },
  {
    country: "Spain",
    hook: "High-intent European market that values destination expertise and speed.",
    transfer: "Airport transfer with operational precision and multilingual service.",
    hotel: "Resorts selected for quality, location, and traveler profile fit.",
    excursion: "Balanced excursion mix from sea tours to cultural experiences."
  },
  {
    country: "United Kingdom",
    hook: "Travelers looking for trusted planning and complete holiday logistics.",
    transfer: "Secure transfer solutions with punctual pickup and route clarity.",
    hotel: "All-inclusive and premium stay options with practical decision support.",
    excursion: "Curated excursions with clear timing and service expectations."
  },
  {
    country: "France",
    hook: "Experience-focused market expecting quality curation and strong communication.",
    transfer: "Airport transfer coverage with dedicated support and live coordination.",
    hotel: "Hotel and resort options adapted to family, couple, and group travel.",
    excursion: "Excursion recommendations based on value, comfort, and uniqueness."
  },
  {
    country: "Germany",
    hook: "Detail-oriented buyers who expect clear information and reliable operations.",
    transfer: "Structured transfer service with transparent process from booking to drop-off.",
    hotel: "Resort curation by amenities, area performance, and travel objectives.",
    excursion: "Operationally strong tours with practical pre-arrival guidance."
  },
  {
    country: "Italy",
    hook: "Travelers seeking lifestyle experiences, resort quality, and easy booking support.",
    transfer: "Airport transfer managed with proactive communication and assistance.",
    hotel: "Resorts with strong food, leisure, and comfort standards.",
    excursion: "Signature Punta Cana excursions for sea, social, and adventure travelers."
  },
  {
    country: "Portugal",
    hook: "Buyers prioritizing end-to-end organization and destination expertise.",
    transfer: "Private transfer setup with straightforward confirmation flow.",
    hotel: "Resort options with clear positioning for family and premium travel.",
    excursion: "Excursion set designed for easy cross-sell with hotel packages."
  },
  {
    country: "Netherlands",
    hook: "Planning-driven travelers comparing service quality and booking confidence.",
    transfer: "Airport transfer with operational stability and responsive support.",
    hotel: "Resort recommendations by location intelligence and guest profile.",
    excursion: "Well-ranked excursions with structured itinerary guidance."
  },
  {
    country: "Belgium",
    hook: "Travelers valuing quality assurance, timing clarity, and personal assistance.",
    transfer: "Transfer execution from PUJ with real support on travel day.",
    hotel: "Resorts filtered by value, comfort, and destination fit.",
    excursion: "Curated excursions with direct booking and service continuity."
  },
  {
    country: "Switzerland",
    hook: "High-standard travelers requiring premium quality and operational precision.",
    transfer: "Premium transfer options with personalized arrival coordination.",
    hotel: "Luxury-oriented resort curation with clear quality signals.",
    excursion: "Premium excursion alternatives with comfort-first planning."
  },
  {
    country: "Austria",
    hook: "Travelers focused on seamless planning and trustworthy local operators.",
    transfer: "Airport transfer options with clear timing and route support.",
    hotel: "Resort recommendation based on amenities and travel goals.",
    excursion: "Top-selling tours selected for quality and operational consistency."
  },
  {
    country: "Sweden",
    hook: "Market with strong preference for clarity, reliability, and digital convenience.",
    transfer: "Easy transfer booking with on-ground support and tracking.",
    hotel: "Resort shortlist based on quality, area, and traveler preferences.",
    excursion: "Excursion packages with optimized schedule and support."
  },
  {
    country: "Norway",
    hook: "Long-haul travelers expecting efficient planning and quality control.",
    transfer: "Airport transfer operations built for smooth arrivals and quick response.",
    hotel: "Resort recommendations with practical quality and location criteria.",
    excursion: "Carefully selected tours to maximize vacation value in fewer days."
  },
  {
    country: "Denmark",
    hook: "Travelers who compare service detail and expect transparent operations.",
    transfer: "Private transfer with clear process, support, and punctual execution.",
    hotel: "All-inclusive and premium resorts matched to trip purpose.",
    excursion: "Top Punta Cana excursion combinations with local coordination."
  },
  {
    country: "Finland",
    hook: "Seasonal holiday buyers requiring confidence and smooth execution.",
    transfer: "Airport transfer with clear communication before arrival.",
    hotel: "Resort options tuned for comfort, amenities, and traveler type.",
    excursion: "Excursion choices organized for easy planning and fulfillment."
  },
  {
    country: "Ireland",
    hook: "High-opportunity market for complete travel packages and local support.",
    transfer: "Trusted transfer with active support from arrival to drop-off.",
    hotel: "Resort recommendations by area, category, and vacation style.",
    excursion: "Excursion lineup focused on high satisfaction and easy logistics."
  },
  {
    country: "Poland",
    hook: "Growing long-haul segment seeking quality guidance and transparent value.",
    transfer: "Airport transfer service with strong coordination and support.",
    hotel: "Resort curation for budget-smart and premium-minded travelers.",
    excursion: "Popular excursions with structured info and easy booking flow."
  },
  {
    country: "Czech Republic",
    hook: "Travelers looking for trusted advisors and efficient destination execution.",
    transfer: "Private transfer operations aligned to flight arrival logic.",
    hotel: "Resort options by zone, amenities, and expected experience level.",
    excursion: "Excursions selected for quality score and practical scheduling."
  },
  {
    country: "Romania",
    hook: "Price-aware travelers with growing demand for complete vacation support.",
    transfer: "Transfer solutions from airport to resort with local assistance.",
    hotel: "Resorts compared by value, location, and service quality.",
    excursion: "Top tours presented with clear expectations and quick booking."
  },
  {
    country: "Puerto Rico",
    hook: "Caribbean market with high intent for fast booking and short planning cycles.",
    transfer: "Rapid airport transfer setup with direct communication channels.",
    hotel: "Best-value and premium Punta Cana resorts with practical guidance.",
    excursion: "High-demand excursions ready to bundle with hotel and transfer."
  },
  {
    country: "Dominican Republic",
    hook: "Domestic and diaspora demand for curated Punta Cana vacation planning.",
    transfer: "Reliable transfer options with on-time operation and support.",
    hotel: "Resort options for family breaks, celebrations, and premium stays.",
    excursion: "Excursion planning optimized for mixed groups and short trips."
  }
];

export const countryPuntaCanaLandings: CountryToPuntaCanaLanding[] = COUNTRY_SEEDS.map((seed) => {
  const countrySlug = toSlug(seed.country);
  const slug = `${countrySlug}-to-punta-cana-excursions`;
  const title = `${seed.country} to Punta Cana Excursions, Transfers and Resorts`;
  return {
    country: seed.country,
    slug,
    title,
    tagline: `Sell-ready travel plan for ${seed.country} visitors: excursions, hotel stays, and airport transfers in one flow.`,
    metaDescription: `${seed.country} to Punta Cana excursion, transfer and resort planning with local support, fast response, and complete vacation coordination.`,
    buyerAngle: seed.hook,
    transferPitch: seed.transfer,
    hotelPitch: seed.hotel,
    excursionPitch: seed.excursion,
    sections: [
      `${seed.country} travelers can book transfer + hotel + excursions in one strategy.`,
      `Execution model: pre-arrival coordination, on-ground support, and conversion-first service.`,
      `Commercial focus: increase trust, simplify booking, and maximize Punta Cana trip value.`
    ]
  };
});

