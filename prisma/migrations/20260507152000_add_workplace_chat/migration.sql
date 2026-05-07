-- Workplace corporate chat: department rooms, mentions, sender identity snapshots and employee avatars.
ALTER TABLE "WorkplaceEmployee" ADD COLUMN "avatarUrl" TEXT;

CREATE TABLE "WorkplaceChatRoom" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'DEPARTMENT',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkplaceChatRoom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkplaceChatMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "employeeId" TEXT,
    "senderUserId" TEXT,
    "senderName" TEXT,
    "senderDepartment" TEXT,
    "senderPosition" TEXT,
    "senderAvatarUrl" TEXT,
    "body" TEXT NOT NULL,
    "mentions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkplaceChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkplaceChatMention" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "messageId" TEXT,
    "departmentId" TEXT,
    "employeeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkplaceChatMention_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkplaceChatRoom_slug_key" ON "WorkplaceChatRoom"("slug");
CREATE INDEX "WorkplaceChatRoom_departmentId_idx" ON "WorkplaceChatRoom"("departmentId");
CREATE INDEX "WorkplaceChatRoom_visibility_idx" ON "WorkplaceChatRoom"("visibility");
CREATE INDEX "WorkplaceChatRoom_status_idx" ON "WorkplaceChatRoom"("status");
CREATE INDEX "WorkplaceChatRoom_createdAt_idx" ON "WorkplaceChatRoom"("createdAt");
CREATE INDEX "WorkplaceChatMessage_roomId_createdAt_idx" ON "WorkplaceChatMessage"("roomId", "createdAt");
CREATE INDEX "WorkplaceChatMessage_employeeId_idx" ON "WorkplaceChatMessage"("employeeId");
CREATE INDEX "WorkplaceChatMessage_senderUserId_idx" ON "WorkplaceChatMessage"("senderUserId");
CREATE INDEX "WorkplaceChatMention_departmentId_status_idx" ON "WorkplaceChatMention"("departmentId", "status");
CREATE INDEX "WorkplaceChatMention_employeeId_status_idx" ON "WorkplaceChatMention"("employeeId", "status");
CREATE INDEX "WorkplaceChatMention_roomId_idx" ON "WorkplaceChatMention"("roomId");
CREATE INDEX "WorkplaceChatMention_messageId_idx" ON "WorkplaceChatMention"("messageId");

ALTER TABLE "WorkplaceChatRoom" ADD CONSTRAINT "WorkplaceChatRoom_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "WorkplaceDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkplaceChatRoom" ADD CONSTRAINT "WorkplaceChatRoom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "WorkplaceEmployee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkplaceChatMessage" ADD CONSTRAINT "WorkplaceChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "WorkplaceChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkplaceChatMessage" ADD CONSTRAINT "WorkplaceChatMessage_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "WorkplaceEmployee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkplaceChatMention" ADD CONSTRAINT "WorkplaceChatMention_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "WorkplaceChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkplaceChatMention" ADD CONSTRAINT "WorkplaceChatMention_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "WorkplaceChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkplaceChatMention" ADD CONSTRAINT "WorkplaceChatMention_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "WorkplaceDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkplaceChatMention" ADD CONSTRAINT "WorkplaceChatMention_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "WorkplaceEmployee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "WorkplaceRole"
SET "permissions" = "permissions" || '["chat.view"]'::jsonb
WHERE "permissions" ? 'chat.respond'
  AND NOT "permissions" ? 'chat.view';
