CREATE TABLE "ProDiscoveryGroupOpportunity" (
  "id" TEXT NOT NULL,
  "requestCode" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'es',
  "city" TEXT NOT NULL,
  "country" TEXT,
  "arrivalDate" TIMESTAMP(3),
  "departureDate" TIMESTAMP(3),
  "groupType" TEXT NOT NULL,
  "groupSize" INTEGER NOT NULL,
  "budgetTier" TEXT NOT NULL,
  "budgetMin" DOUBLE PRECISION,
  "budgetMax" DOUBLE PRECISION,
  "interests" JSONB NOT NULL,
  "dream" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "contactPhone" TEXT,
  "companyName" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "source" TEXT NOT NULL DEFAULT 'PRODISCOVERY_PLANNER',
  "estimatedBudget" DOUBLE PRECISION,
  "acceptedBudget" DOUBLE PRECISION,
  "depositPercent" DOUBLE PRECISION NOT NULL DEFAULT 20,
  "depositAmount" DOUBLE PRECISION,
  "leaderGuideId" TEXT,
  "leaderGuideName" TEXT,
  "leaderGuideEmail" TEXT,
  "leaderCommissionPercent" DOUBLE PRECISION,
  "leaderCommissionAmount" DOUBLE PRECISION,
  "itineraryDraft" JSONB,
  "itinerarySummary" TEXT,
  "geminiStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "geminiError" TEXT,
  "emailStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "emailError" TEXT,
  "assignedToEmployeeId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProDiscoveryGroupOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProDiscoveryGroupOpportunity_requestCode_key" ON "ProDiscoveryGroupOpportunity"("requestCode");
CREATE INDEX "ProDiscoveryGroupOpportunity_status_createdAt_idx" ON "ProDiscoveryGroupOpportunity"("status", "createdAt");
CREATE INDEX "ProDiscoveryGroupOpportunity_contactEmail_idx" ON "ProDiscoveryGroupOpportunity"("contactEmail");
CREATE INDEX "ProDiscoveryGroupOpportunity_city_idx" ON "ProDiscoveryGroupOpportunity"("city");
CREATE INDEX "ProDiscoveryGroupOpportunity_leaderGuideId_idx" ON "ProDiscoveryGroupOpportunity"("leaderGuideId");
CREATE INDEX "ProDiscoveryGroupOpportunity_assignedToEmployeeId_idx" ON "ProDiscoveryGroupOpportunity"("assignedToEmployeeId");

ALTER TABLE "ProDiscoveryGroupOpportunity"
  ADD CONSTRAINT "ProDiscoveryGroupOpportunity_leaderGuideId_fkey"
  FOREIGN KEY ("leaderGuideId") REFERENCES "SupplierProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProDiscoveryGroupOpportunity"
  ADD CONSTRAINT "ProDiscoveryGroupOpportunity_assignedToEmployeeId_fkey"
  FOREIGN KEY ("assignedToEmployeeId") REFERENCES "WorkplaceEmployee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
