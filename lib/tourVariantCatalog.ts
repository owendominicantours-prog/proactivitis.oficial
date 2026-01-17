import type { Locale } from "@/lib/translations";
import { PARTY_BOAT_BASE_TOUR, PARTY_BOAT_VARIANTS } from "@/data/party-boat-variants";
import { SANTO_DOMINGO_BASE_TOUR, SANTO_DOMINGO_VARIANTS } from "@/data/santo-domingo-variants";
import { BUGGY_ATV_BASE_TOUR, BUGGY_ATV_VARIANTS } from "@/data/buggy-atv-variants";
import { PARASAILING_BASE_TOUR, PARASAILING_VARIANTS } from "@/data/parasailing-variants";
import { SAMANA_WHALE_BASE_TOUR, SAMANA_WHALE_VARIANTS } from "@/data/samana-whale-variants";

export type VariantType =
  | "party-boat"
  | "santo-domingo"
  | "buggy-atv"
  | "parasailing"
  | "samana-whale";

export type VariantFaq = { q: string; a: string };

export type TourVariantContent = {
  slug: string;
  type: VariantType;
  tourSlug: string;
  titles: Record<Locale, string>;
  heroSubtitles: Record<Locale, string>;
  metaDescriptions: Record<Locale, string>;
  bodyBlocks: Record<Locale, string[]>;
  faqs: Record<Locale, VariantFaq[]>;
  ctas: Record<Locale, string[]>;
};

export type RenderableVariant = {
  slug: string;
  titles: Record<Locale, string>;
  heroSubtitles: Record<Locale, string>;
  metaDescriptions: Record<Locale, string>;
  bodyBlocks: Record<Locale, string[]>;
  faqs: Record<Locale, VariantFaq[]>;
  ctas: Record<Locale, string[]>;
};

export const STATIC_VARIANTS: TourVariantContent[] = [
  ...PARTY_BOAT_VARIANTS.map((variant) => ({
    ...variant,
    type: "party-boat" as const,
    tourSlug: PARTY_BOAT_BASE_TOUR.slug
  })),
  ...SANTO_DOMINGO_VARIANTS.map((variant) => ({
    ...variant,
    type: "santo-domingo" as const,
    tourSlug: SANTO_DOMINGO_BASE_TOUR.slug
  })),
  ...BUGGY_ATV_VARIANTS.map((variant) => ({
    ...variant,
    type: "buggy-atv" as const,
    tourSlug: BUGGY_ATV_BASE_TOUR.slug
  })),
  ...PARASAILING_VARIANTS.map((variant) => ({
    ...variant,
    type: "parasailing" as const,
    tourSlug: PARASAILING_BASE_TOUR.slug
  })),
  ...SAMANA_WHALE_VARIANTS.map((variant) => ({
    ...variant,
    type: "samana-whale" as const,
    tourSlug: SAMANA_WHALE_BASE_TOUR.slug
  }))
];

export const findStaticVariant = (slug: string) =>
  STATIC_VARIANTS.find((variant) => variant.slug === slug);
