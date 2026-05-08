ALTER TABLE "ProDiscoveryGroupOpportunity"
  ADD COLUMN "languages" JSONB,
  ADD COLUMN "assistance" JSONB,
  ADD COLUMN "holidayStyles" JSONB,
  ADD COLUMN "additionalServices" JSONB,
  ADD COLUMN "flexibleTiming" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "preferredStartTime" TEXT,
  ADD COLUMN "preferredEndTime" TEXT,
  ADD COLUMN "leadPriority" TEXT NOT NULL DEFAULT 'NORMAL';

CREATE INDEX "ProDiscoveryGroupOpportunity_leadPriority_idx" ON "ProDiscoveryGroupOpportunity"("leadPriority");
