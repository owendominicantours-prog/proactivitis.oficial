CREATE TABLE "HybridLandingZone" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "transferType" TEXT NOT NULL,
  "transferCopy" TEXT NOT NULL,
  "featuredTourSlugs" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HybridLandingZone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HybridLandingAudience" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "prioritySignals" JSONB NOT NULL,
  "blockedSignals" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HybridLandingAudience_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HybridLandingMonth" (
  "id" TEXT NOT NULL,
  "month" INTEGER NOT NULL,
  "slug" TEXT NOT NULL,
  "season" TEXT NOT NULL,
  "climateCopy" TEXT NOT NULL,
  "tourFilterCopy" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HybridLandingMonth_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HybridLandingRule" (
  "id" TEXT NOT NULL,
  "zoneId" TEXT NOT NULL,
  "audienceId" TEXT NOT NULL,
  "monthId" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'en',
  "title" TEXT NOT NULL,
  "metaDescription" TEXT NOT NULL,
  "blogIntro" TEXT NOT NULL,
  "blogTips" JSONB NOT NULL,
  "transferCopy" TEXT NOT NULL,
  "productSlugs" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HybridLandingRule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HybridLandingZone_slug_key" ON "HybridLandingZone"("slug");
CREATE INDEX "HybridLandingZone_active_idx" ON "HybridLandingZone"("active");
CREATE UNIQUE INDEX "HybridLandingAudience_slug_key" ON "HybridLandingAudience"("slug");
CREATE INDEX "HybridLandingAudience_active_idx" ON "HybridLandingAudience"("active");
CREATE UNIQUE INDEX "HybridLandingMonth_month_key" ON "HybridLandingMonth"("month");
CREATE UNIQUE INDEX "HybridLandingMonth_slug_key" ON "HybridLandingMonth"("slug");
CREATE INDEX "HybridLandingMonth_season_idx" ON "HybridLandingMonth"("season");
CREATE INDEX "HybridLandingMonth_active_idx" ON "HybridLandingMonth"("active");
CREATE UNIQUE INDEX "HybridLandingRule_zoneId_audienceId_monthId_locale_key" ON "HybridLandingRule"("zoneId", "audienceId", "monthId", "locale");
CREATE INDEX "HybridLandingRule_locale_active_idx" ON "HybridLandingRule"("locale", "active");

ALTER TABLE "HybridLandingRule" ADD CONSTRAINT "HybridLandingRule_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "HybridLandingZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HybridLandingRule" ADD CONSTRAINT "HybridLandingRule_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "HybridLandingAudience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HybridLandingRule" ADD CONSTRAINT "HybridLandingRule_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "HybridLandingMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
