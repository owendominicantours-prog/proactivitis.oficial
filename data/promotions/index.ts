import { TransferLandingPromotion, pujToHotelPromotions } from "./puj-to-hotels";

export const transferLandingPromotions = pujToHotelPromotions;

export const getPromotionByDestination = (slug: string) =>
  transferLandingPromotions.find((promotion) => promotion.destinationSlug === slug);

export const getPromotionSlugs = () => transferLandingPromotions.map((promotion) => promotion.destinationSlug);

export const getPromotionByLandingSlug = (landingSlug: string) =>
  transferLandingPromotions.find((promotion) => promotion.landingSlug === landingSlug);

export const getLandingSlugs = () => transferLandingPromotions.map((promotion) => promotion.landingSlug);
