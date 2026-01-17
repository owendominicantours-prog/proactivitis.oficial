CREATE TABLE "TourVariant" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "tourSlug" TEXT NOT NULL,
  "titles" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "heroSubtitles" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "metaDescriptions" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "bodyBlocks" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "faqs" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "ctas" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TourVariant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TourVariant_slug_key" ON "TourVariant"("slug");
CREATE INDEX "TourVariant_type_idx" ON "TourVariant"("type");
CREATE INDEX "TourVariant_status_idx" ON "TourVariant"("status");
