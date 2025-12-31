ALTER TABLE "TourTranslation" ADD COLUMN IF NOT EXISTS "includesList" jsonb;
ALTER TABLE "TourTranslation" ADD COLUMN IF NOT EXISTS "notIncludedList" jsonb;
ALTER TABLE "TourTranslation" ADD COLUMN IF NOT EXISTS "itineraryStops" jsonb;
ALTER TABLE "TourTranslation" ADD COLUMN IF NOT EXISTS "highlights" jsonb;
