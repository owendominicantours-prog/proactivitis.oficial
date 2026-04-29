import { TOUR_MARKET_INTENTS } from "@/lib/tourMarketVariants";

const INDEXABLE_TRANSFER_VARIANT_IDS = new Set([
  "private-airport-transfer",
  "luxury-vip-transfer",
  "round-trip-transfer",
  "family-transfer",
  "last-minute-transfer",
  "suv-transfer",
  "executive-transfer",
  "group-transfer",
  "hotel-concierge-transfer",
  "direct-nonstop-transfer"
]);

const INDEXABLE_TOUR_MARKET_INTENT_IDS = new Set(TOUR_MARKET_INTENTS.map((intent) => intent.id));

export const isIndexableTransferVariant = (variantId?: string) =>
  !variantId || INDEXABLE_TRANSFER_VARIANT_IDS.has(variantId);

export const isIndexableTourMarketIntent = (intentId: string) =>
  INDEXABLE_TOUR_MARKET_INTENT_IDS.has(intentId);

export const getIndexableTransferVariantIds = () => Array.from(INDEXABLE_TRANSFER_VARIANT_IDS);
export const getIndexableTourMarketIntentIds = () => Array.from(INDEXABLE_TOUR_MARKET_INTENT_IDS);
