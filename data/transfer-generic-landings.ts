export type GenericTransferLanding = {
  landingSlug: string;
  keyword: string;
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
  "punta cana airport transfer",
  "punta cana airport transfers",
  "puj airport transfer",
  "puj airport transfers",
  "airport transfer punta cana",
  "private transfer punta cana",
  "private airport transfer punta cana",
  "punta cana private transfer",
  "punta cana shuttle",
  "punta cana airport shuttle",
  "puj airport shuttle",
  "shuttle from punta cana airport",
  "punta cana transportation",
  "airport transportation punta cana",
  "punta cana taxi service",
  "punta cana private taxi",
  "punta cana airport taxi",
  "taxi from puj to hotel",
  "puj to hotel transfer",
  "puj airport to hotel transfer",
  "best airport transfer punta cana",
  "reliable airport transfer punta cana",
  "safe airport transfer punta cana",
  "affordable airport transfer punta cana",
  "cheap airport transfer punta cana",
  "luxury airport transfer punta cana",
  "vip airport transfer punta cana",
  "suv transfer punta cana",
  "van transfer punta cana",
  "minivan airport transfer punta cana",
  "group transfer punta cana",
  "punta cana airport transfer for 6",
  "punta cana airport transfer for 8",
  "punta cana airport transfer for 10",
  "punta cana airport transfer for 12",
  "family airport transfer punta cana",
  "punta cana airport transfer with car seat",
  "punta cana airport transfer with child seat",
  "punta cana airport transfer with baby seat",
  "punta cana airport transfer round trip",
  "round trip transfer punta cana",
  "return transfer punta cana airport",
  "hotel to punta cana airport transfer",
  "punta cana hotel to airport transportation",
  "punta cana airport to bavaro transfer",
  "punta cana airport to bavaro shuttle",
  "punta cana airport to cap cana transfer",
  "punta cana airport to cap cana shuttle",
  "punta cana airport to uvero alto transfer",
  "punta cana airport to uvero alto shuttle",
  "punta cana airport to macao transfer",
  "punta cana airport to macao shuttle",
  "punta cana airport to bayahibe transfer",
  "punta cana airport to bayahibe shuttle",
  "punta cana airport to la romana transfer",
  "punta cana airport to santo domingo transfer",
  "puj to santo domingo transfer",
  "puj to bayahibe private transfer",
  "puj to la romana private transfer",
  "puj to bavaro private transfer",
  "puj to cap cana private transfer",
  "puj to uvero alto private transfer",
  "private shuttle punta cana",
  "private shuttle from puj",
  "punta cana airport transfer price",
  "punta cana airport transfer cost",
  "how much is a transfer from punta cana airport",
  "taxi cost punta cana airport to bavaro",
  "taxi cost punta cana airport to cap cana",
  "punta cana airport transfer booking",
  "book airport transfer punta cana",
  "reserve airport transfer punta cana",
  "airport pickup punta cana",
  "private airport pickup punta cana",
  "punta cana airport pickup service",
  "airport drop off punta cana",
  "punta cana hotel transfer service",
  "punta cana hotel shuttle service",
  "punta cana transfer service",
  "punta cana chauffeur service",
  "private driver punta cana",
  "punta cana private driver service",
  "private driver from punta cana airport",
  "punta cana airport transfer with flight tracking",
  "punta cana airport transfer with meet and greet",
  "punta cana airport transfer bilingual driver",
  "late night airport transfer punta cana",
  "early morning airport transfer punta cana",
  "24/7 airport transfer punta cana",
  "airport transfer punta cana english speaking driver",
  "airport transfer punta cana cash payment",
  "airport transfer punta cana credit card",
  "airport transfer punta cana whatsapp booking",
  "punta cana airport transfer whatsapp",
  "punta cana airport transfer no hidden fees",
  "punta cana airport transfer fixed price",
  "private transfer punta cana best price",
  "airport transfer punta cana door to door",
  "airport transfer punta cana direct service",
  "punta cana airport transportation service"
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildTitle = (keyword: string, locale: "es" | "en" | "fr") => {
  if (locale === "en") return keyword;
  if (locale === "fr") return `Transferts a Punta Cana: ${keyword}`;
  return `Traslados en Punta Cana: ${keyword}`;
};

const buildDescription = (keyword: string, locale: "es" | "en" | "fr") => {
  if (locale === "en") {
    return `Plan your ${keyword} with verified drivers, flight tracking, and 24/7 support.`;
  }
  if (locale === "fr") {
    return `Planifiez ${keyword} avec chauffeurs verifies, suivi de vol et support 24/7.`;
  }
  return `Reserva ${keyword} con chofer bilingue, seguimiento de vuelo y soporte 24/7.`;
};

const buildSeoTitle = (keyword: string, locale: "es" | "en" | "fr") => {
  if (locale === "en") return `${keyword} | Proactivitis`;
  if (locale === "fr") return `Transferts Punta Cana | ${keyword} | Proactivitis`;
  return `Traslados Punta Cana | ${keyword} | Proactivitis`;
};

const buildMetaDescription = (keyword: string, locale: "es" | "en" | "fr") => {
  if (locale === "en") {
    return `Book ${keyword} with bilingual drivers, flight tracking, and 24/7 support on Proactivitis.`;
  }
  if (locale === "fr") {
    return `Reservez ${keyword} avec chauffeur bilingue, suivi de vol et support 24/7 chez Proactivitis.`;
  }
  return `Reserva ${keyword} con chofer bilingue, seguimiento de vuelo y soporte 24/7 en Proactivitis.`;
};

export const genericTransferLandings: GenericTransferLanding[] = rawKeywords.map((keyword) => {
  const slug = slugify(keyword);
  return {
    landingSlug: slug,
    keyword,
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
    keywords: [keyword, "punta cana airport transfer", "punta cana airport shuttle", "punta cana private transfer", "puj airport transfer", "punta cana transportation", "punta cana transfer service"]
  };
});

export const findGenericTransferLandingBySlug = (slug: string) =>
  genericTransferLandings.find((landing) => landing.landingSlug === slug);
