-- Create new columns for highlights and structured includes lists
ALTER TABLE "Tour"
ADD COLUMN IF NOT EXISTS "highlights" JSONB,
ADD COLUMN IF NOT EXISTS "includesList" JSONB,
ADD COLUMN IF NOT EXISTS "notIncludedList" JSONB;
