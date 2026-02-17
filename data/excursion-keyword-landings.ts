export type ExcursionKeywordLanding = {
  keyword: string;
  landingSlug: string;
  focus:
    | "general"
    | "saona"
    | "catalina"
    | "snorkeling"
    | "buggy"
    | "horseback"
    | "parasailing"
    | "watersports"
    | "partyboat"
    | "samana"
    | "cultural";
  titles: {
    es: string;
    en: string;
    fr: string;
  };
  descriptions: {
    es: string;
    en: string;
    fr: string;
  };
  seoTitle: {
    es: string;
    en: string;
    fr: string;
  };
  metaDescription: {
    es: string;
    en: string;
    fr: string;
  };
  keywords: string[];
};

const rawKeywords = [
  "punta cana tours",
  "punta cana excursions",
  "best tours in punta cana",
  "best excursions in punta cana",
  "top rated tours punta cana",
  "things to do in punta cana",
  "punta cana day trips",
  "punta cana private tours",
  "punta cana small group tours",
  "punta cana adventure tours",
  "punta cana family tours",
  "punta cana couples tours",
  "punta cana luxury tours",
  "punta cana tours with pickup",
  "punta cana excursions with hotel pickup",
  "punta cana tours all inclusive resorts",
  "punta cana tours from hotel",
  "punta cana tours from bavaro",
  "punta cana tours from cap cana",
  "punta cana tours from uvero alto",
  "saona island tour punta cana",
  "saona island excursion punta cana",
  "saona island day trip",
  "isla saona tour punta cana",
  "saona island tour with speedboat",
  "saona island catamaran tour",
  "saona island full day tour punta cana",
  "saona island private tour",
  "saona island tour price",
  "saona island tour from bavaro",
  "catalina island tour punta cana",
  "isla catalina tour punta cana",
  "catalina snorkeling tour punta cana",
  "snorkeling punta cana tour",
  "best snorkeling tour punta cana",
  "punta cana snorkeling excursion",
  "coral reef snorkeling punta cana",
  "scuba diving punta cana excursion",
  "diving tours punta cana",
  "snorkeling catamaran punta cana",
  "buggy tour punta cana",
  "buggy punta cana excursion",
  "buggy adventure punta cana",
  "atv tour punta cana",
  "atv punta cana adventure",
  "dune buggy punta cana",
  "buggy tour with cave punta cana",
  "punta cana buggy tour with pickup",
  "best buggy tour punta cana",
  "buggy and cave tour punta cana",
  "horseback riding punta cana",
  "horse riding punta cana excursion",
  "punta cana horseback riding tour",
  "horseback riding on the beach punta cana",
  "horse tour punta cana with pickup",
  "best horseback riding punta cana",
  "horseback riding for beginners punta cana",
  "horseback riding family tour punta cana",
  "private horseback riding punta cana",
  "horse and buggy combo punta cana",
  "parasailing punta cana",
  "parasailing tour punta cana",
  "best parasailing punta cana",
  "punta cana parasailing price",
  "jetski punta cana excursion",
  "jet ski tour punta cana",
  "banana boat punta cana",
  "water sports punta cana excursions",
  "punta cana speedboat tour",
  "speedboat and snorkeling punta cana",
  "party boat punta cana",
  "party boat excursion punta cana",
  "catamaran tour punta cana",
  "booze cruise punta cana",
  "punta cana party boat with snorkeling",
  "party boat with pickup punta cana",
  "private party boat punta cana",
  "punta cana sunset catamaran",
  "punta cana catamaran snorkeling tour",
  "best party boat punta cana",
  "samana tour from punta cana",
  "samana day trip from punta cana",
  "samana excursion punta cana",
  "whale watching samana from punta cana",
  "punta cana to samana whale watching",
  "el limon waterfall tour samana",
  "cayo levantado tour samana",
  "isla bacardi samana tour",
  "samana waterfall and whale watching tour",
  "best samana tour from punta cana",
  "santo domingo tour from punta cana",
  "santo domingo day trip punta cana",
  "cultural tour punta cana",
  "punta cana city tour",
  "higuey basilica tour from punta cana",
  "punta cana countryside tour",
  "river tour punta cana",
  "local market tour punta cana",
  "punta cana eco tour",
  "punta cana hidden gems tour"
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const inferFocus = (keyword: string): ExcursionKeywordLanding["focus"] => {
  const value = keyword.toLowerCase();
  if (value.includes("saona")) return "saona";
  if (value.includes("catalina")) return "catalina";
  if (value.includes("snorkel") || value.includes("scuba") || value.includes("diving") || value.includes("reef")) {
    return "snorkeling";
  }
  if (value.includes("buggy") || value.includes("atv") || value.includes("dune")) return "buggy";
  if (value.includes("horse")) return "horseback";
  if (value.includes("parasailing")) return "parasailing";
  if (value.includes("jetski") || value.includes("jet ski") || value.includes("banana") || value.includes("water sports") || value.includes("speedboat")) {
    return "watersports";
  }
  if (value.includes("party boat") || value.includes("booze cruise") || value.includes("catamaran") || value.includes("sunset")) {
    return "partyboat";
  }
  if (value.includes("samana") || value.includes("whale") || value.includes("el limon") || value.includes("cayo levantado") || value.includes("bacardi")) {
    return "samana";
  }
  if (value.includes("santo domingo") || value.includes("cultural") || value.includes("city") || value.includes("higuey") || value.includes("basilica") || value.includes("countryside") || value.includes("river") || value.includes("market") || value.includes("eco") || value.includes("hidden gems")) {
    return "cultural";
  }
  return "general";
};

const buildTitle = (keyword: string, locale: "es" | "en" | "fr") => {
  if (locale === "en") return keyword;
  if (locale === "fr") return `Excursions Punta Cana: ${keyword}`;
  return `Excursiones Punta Cana: ${keyword}`;
};

const buildDescription = (keyword: string, locale: "es" | "en" | "fr") => {
  if (locale === "en") {
    return `Discover ${keyword} with curated tours, verified operators, and hotel pickup.`;
  }
  if (locale === "fr") {
    return `Decouvrez ${keyword} avec des tours verifies, operateurs locaux et prise en charge hotel.`;
  }
  return `Explora ${keyword} con tours verificados, operadores locales y recogida en hotel.`;
};

const buildSeoTitle = (keyword: string, locale: "es" | "en" | "fr") => {
  if (locale === "en") return `${keyword} | Punta Cana Tours | Proactivitis`;
  if (locale === "fr") return `${keyword} | Excursions Punta Cana | Proactivitis`;
  return `${keyword} | Tours en Punta Cana | Proactivitis`;
};

const buildMetaDescription = (keyword: string, locale: "es" | "en" | "fr") => {
  if (locale === "en") {
    return `Book ${keyword} with Proactivitis. Verified guides, transparent pricing, and hotel pickup.`;
  }
  if (locale === "fr") {
    return `Reserve ${keyword} avec Proactivitis. Guides verifies, prix clairs et prise en charge hotel.`;
  }
  return `Reserva ${keyword} con Proactivitis. Guias verificados, precios claros y recogida en hotel.`;
};

export const excursionKeywordLandings: ExcursionKeywordLanding[] = rawKeywords.map((keyword) => {
  const slug = slugify(keyword);
  const focus = inferFocus(keyword);
  return {
    keyword,
    landingSlug: slug,
    focus,
    titles: {
      es: buildTitle(keyword, "es"),
      en: buildTitle(keyword, "en"),
      fr: buildTitle(keyword, "fr")
    },
    descriptions: {
      es: buildDescription(keyword, "es"),
      en: buildDescription(keyword, "en"),
      fr: buildDescription(keyword, "fr")
    },
    seoTitle: {
      es: buildSeoTitle(keyword, "es"),
      en: buildSeoTitle(keyword, "en"),
      fr: buildSeoTitle(keyword, "fr")
    },
    metaDescription: {
      es: buildMetaDescription(keyword, "es"),
      en: buildMetaDescription(keyword, "en"),
      fr: buildMetaDescription(keyword, "fr")
    },
    keywords: [keyword, "punta cana tours", "punta cana excursions", "things to do punta cana", "excursiones punta cana", "tours con recogida en hotel"]
  };
});

export const findExcursionKeywordLandingBySlug = (slug: string) =>
  excursionKeywordLandings.find((landing) => landing.landingSlug === slug);
