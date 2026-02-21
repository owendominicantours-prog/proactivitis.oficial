ALTER TABLE "TransferReview"
  ADD COLUMN IF NOT EXISTS "transferLandingSlug" TEXT,
  ADD COLUMN IF NOT EXISTS "transferServiceLabel" TEXT;

ALTER TABLE "TransferReview"
  ALTER COLUMN "bookingId" DROP NOT NULL;

ALTER TABLE "TransferReview"
  DROP CONSTRAINT IF EXISTS "TransferReview_bookingId_fkey";

ALTER TABLE "TransferReview"
  ADD CONSTRAINT "TransferReview_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "TransferReview_transferLandingSlug_idx"
  ON "TransferReview"("transferLandingSlug");
