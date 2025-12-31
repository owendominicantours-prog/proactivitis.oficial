-- Create table for tour translations to store localized content
DO $$
BEGIN
  CREATE TYPE "TourTranslationStatus" AS ENUM ('PENDING', 'TRANSLATED', 'NEEDS_REVIEW');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "TourTranslation" (
  "id" TEXT PRIMARY KEY,
  "tourId" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "title" TEXT,
  "subtitle" TEXT,
  "shortDescription" TEXT,
  "description" TEXT,
  "status" "TourTranslationStatus" NOT NULL DEFAULT 'PENDING',
  "sourceHash" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "TourTranslation_tourId_locale_key" UNIQUE ("tourId", "locale"),
  CONSTRAINT "TourTranslation_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE
);
