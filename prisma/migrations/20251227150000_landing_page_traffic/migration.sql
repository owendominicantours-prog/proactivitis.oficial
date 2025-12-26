CREATE TABLE "LandingPageTraffic" (
  "slug" TEXT PRIMARY KEY,
  "visits" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);
