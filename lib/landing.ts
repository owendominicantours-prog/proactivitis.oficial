import { countryPuntaCanaLandings } from "@/data/country-punta-cana-landings";
import { keywordSalesLandings, keywordSalesLandingSlugs } from "@/data/keyword-sales-landings";

export type LandingEntry = {
  slug: string;
  title: string;
  tagline: string;
  sections: string[];
  path?: string;
  metaDescription?: string;
  country?: string;
  buyerAngle?: string;
  transferPitch?: string;
  hotelPitch?: string;
  excursionPitch?: string;
};

const baseLandings: LandingEntry[] = [
  {
    slug: "sunrise-hotel",
    title: "Sunrise Hotel Experiences",
    tagline: "Premium tours designed for your guests.",
    sections: [
      "Landing builder drag and drop.",
      "Offers with commissions and multilingual content.",
      "White-label mini site with your branding."
    ]
  },
  {
    slug: "caribbean-adventure",
    title: "Caribbean Adventure Agency",
    tagline: "Book, pay and communicate in one place.",
    sections: ["Agency portal", "CSV reports", "Integrated CRM chat"]
  },
  {
    slug: "hip-hop-party-boat",
    path: "/thingtodo/tours/hip-hop-party-boat",
    title: "Hip Hop Party Boat with Snorkeling",
    tagline: "Catamaran party with DJ, snorkeling and premium sunset in Punta Cana.",
    sections: [
      "Premium open bar with tropical snacks.",
      "Guided snorkeling in Bavaro and Cap Cana reefs.",
      "Private hotel pickup and foam party experience."
    ]
  },
  {
    slug: "things-to-do/boat-activities-dominican-republic",
    path: "/things-to-do/boat-activities-dominican-republic",
    title: "Top boat activities in Dominican Republic",
    tagline: "Saona, whale watching and party boats in one selection.",
    sections: [
      "Verified experiences with clear schedules.",
      "Options for groups, couples and celebrations.",
      "Direct booking with local support."
    ]
  }
];

const countryLandings: LandingEntry[] = countryPuntaCanaLandings.map((landing) => ({
  slug: landing.slug,
  title: landing.title,
  tagline: landing.tagline,
  sections: landing.sections,
  metaDescription: landing.metaDescription,
  country: landing.country,
  buyerAngle: landing.buyerAngle,
  transferPitch: landing.transferPitch,
  hotelPitch: landing.hotelPitch,
  excursionPitch: landing.excursionPitch
}));

export const landingPages: LandingEntry[] = [...baseLandings, ...countryLandings];

export const countryToPuntaCanaLandingSlugs = new Set(countryLandings.map((landing) => landing.slug));
export const keywordIntentSalesLandingSlugs = keywordSalesLandingSlugs;

landingPages.push(
  ...keywordSalesLandings.map((landing) => ({
    slug: landing.slug,
    title: landing.title,
    tagline: landing.tagline,
    sections: landing.sections,
    path: landing.path,
    metaDescription: landing.metaDescription,
    country: landing.country,
    buyerAngle: landing.buyerAngle,
    transferPitch: landing.transferPitch,
    hotelPitch: landing.hotelPitch,
    excursionPitch: landing.excursionPitch
  }))
);
