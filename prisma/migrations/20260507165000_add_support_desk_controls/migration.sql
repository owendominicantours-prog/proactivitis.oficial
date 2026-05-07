-- Support Desk controls for public customer assistance.
ALTER TABLE "Conversation" ADD COLUMN "linkedBookingId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'OPEN';
ALTER TABLE "Conversation" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "Conversation" ADD COLUMN "assignedDepartmentId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "assignedEmployeeId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "escalatedAt" TIMESTAMP(3);
ALTER TABLE "Conversation" ADD COLUMN "closedAt" TIMESTAMP(3);
ALTER TABLE "Conversation" ADD COLUMN "internalNote" TEXT;

CREATE INDEX "Conversation_type_idx" ON "Conversation"("type");
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");
CREATE INDEX "Conversation_priority_idx" ON "Conversation"("priority");
CREATE INDEX "Conversation_linkedBookingId_idx" ON "Conversation"("linkedBookingId");
CREATE INDEX "Conversation_assignedDepartmentId_idx" ON "Conversation"("assignedDepartmentId");
CREATE INDEX "Conversation_assignedEmployeeId_idx" ON "Conversation"("assignedEmployeeId");
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_assignedDepartmentId_fkey" FOREIGN KEY ("assignedDepartmentId") REFERENCES "WorkplaceDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "WorkplaceEmployee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
