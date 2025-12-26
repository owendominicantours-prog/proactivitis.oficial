import { TransferLandingPromotion, pujToHotelPromotions } from "./puj-to-hotels";

export const transferLandingPromotions = pujToHotelPromotions;

export const getPromotionByDestination = (slug: string) =>
  transferLandingPromotions.find((promotion) => promotion.destinationSlug === slug);

export const getPromotionSlugs = () => transferLandingPromotions.map((promotion) => promotion.destinationSlug);
