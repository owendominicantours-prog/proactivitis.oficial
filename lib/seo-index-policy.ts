const INDEXABLE_TRANSFER_VARIANT_IDS = new Set([
  "private-airport-transfer",
  "luxury-vip-transfer",
  "round-trip-transfer",
  "family-transfer",
  "last-minute-transfer"
]);

const INDEXABLE_TOUR_MARKET_INTENT_IDS = new Set([
  "best-tour-punta-cana",
  "tour-with-hotel-pickup",
  "family-friendly-tour",
  "private-tour",
  "luxury-tour",
  "adventure-tour",
  "all-inclusive-tour",
  "safe-tour-option"
]);

export const isIndexableTransferVariant = (variantId?: string) =>
  !variantId || INDEXABLE_TRANSFER_VARIANT_IDS.has(variantId);

export const isIndexableTourMarketIntent = (intentId: string) =>
  INDEXABLE_TOUR_MARKET_INTENT_IDS.has(intentId);

export const getIndexableTransferVariantIds = () => Array.from(INDEXABLE_TRANSFER_VARIANT_IDS);
export const getIndexableTourMarketIntentIds = () => Array.from(INDEXABLE_TOUR_MARKET_INTENT_IDS);
