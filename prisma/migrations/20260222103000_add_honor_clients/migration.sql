CREATE TABLE IF NOT EXISTS "HonorClient" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "vipTitle" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "photoUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "HonorClient_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "HonorClient_isActive_idx"
  ON "HonorClient"("isActive");

CREATE INDEX IF NOT EXISTS "HonorClient_createdAt_idx"
  ON "HonorClient"("createdAt");
