-- Add translation hash so translations can be tracked
ALTER TABLE "Tour"
ADD COLUMN IF NOT EXISTS "translationHash" TEXT;
