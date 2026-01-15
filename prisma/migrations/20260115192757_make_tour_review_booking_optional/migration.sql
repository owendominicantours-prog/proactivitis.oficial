ALTER TABLE "TourReview" DROP CONSTRAINT IF EXISTS "TourReview_bookingId_fkey";
DROP INDEX IF EXISTS "TourReview_bookingId_key";
ALTER TABLE "TourReview" ALTER COLUMN "bookingId" DROP NOT NULL;
ALTER TABLE "TourReview" ADD CONSTRAINT "TourReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
