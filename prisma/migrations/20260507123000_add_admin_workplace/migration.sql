-- Admin Workplace: empleados internos, roles dinamicos, permisos, aprobaciones y auditoria.
CREATE TABLE "WorkplaceDepartment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkplaceDepartment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkplaceRole" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 10,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "permissions" JSONB NOT NULL,
    "scope" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkplaceRole_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkplaceEmployee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT,
    "employeeCode" TEXT,
    "jobTitle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "countryScope" JSONB,
    "cityScope" JSONB,
    "nicheScope" JSONB,
    "productScope" JSONB,
    "companyScope" JSONB,
    "moduleScope" JSONB,
    "permissionOverrides" JSONB,
    "accessExpiresAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkplaceEmployee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkplaceRoleAssignment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedById" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkplaceRoleAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkplaceApprovalRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT,
    "requestedById" TEXT,
    "actionKey" TEXT NOT NULL,
    "moduleKey" TEXT,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "payload" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decisionNote" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkplaceApprovalRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkplaceAuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "employeeId" TEXT,
    "actionKey" TEXT NOT NULL,
    "moduleKey" TEXT,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "device" TEXT,
    "metadata" JSONB,
    "beforeData" JSONB,
    "afterData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkplaceAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkplaceDepartment_slug_key" ON "WorkplaceDepartment"("slug");
CREATE INDEX "WorkplaceDepartment_active_idx" ON "WorkplaceDepartment"("active");
CREATE UNIQUE INDEX "WorkplaceRole_slug_key" ON "WorkplaceRole"("slug");
CREATE INDEX "WorkplaceRole_departmentId_idx" ON "WorkplaceRole"("departmentId");
CREATE INDEX "WorkplaceRole_active_idx" ON "WorkplaceRole"("active");
CREATE UNIQUE INDEX "WorkplaceEmployee_userId_key" ON "WorkplaceEmployee"("userId");
CREATE UNIQUE INDEX "WorkplaceEmployee_employeeCode_key" ON "WorkplaceEmployee"("employeeCode");
CREATE INDEX "WorkplaceEmployee_status_idx" ON "WorkplaceEmployee"("status");
CREATE INDEX "WorkplaceEmployee_departmentId_idx" ON "WorkplaceEmployee"("departmentId");
CREATE UNIQUE INDEX "WorkplaceRoleAssignment_employeeId_roleId_key" ON "WorkplaceRoleAssignment"("employeeId", "roleId");
CREATE INDEX "WorkplaceRoleAssignment_roleId_idx" ON "WorkplaceRoleAssignment"("roleId");
CREATE INDEX "WorkplaceRoleAssignment_expiresAt_idx" ON "WorkplaceRoleAssignment"("expiresAt");
CREATE INDEX "WorkplaceApprovalRequest_status_idx" ON "WorkplaceApprovalRequest"("status");
CREATE INDEX "WorkplaceApprovalRequest_employeeId_idx" ON "WorkplaceApprovalRequest"("employeeId");
CREATE INDEX "WorkplaceApprovalRequest_actionKey_idx" ON "WorkplaceApprovalRequest"("actionKey");
CREATE INDEX "WorkplaceApprovalRequest_moduleKey_idx" ON "WorkplaceApprovalRequest"("moduleKey");
CREATE INDEX "WorkplaceAuditLog_actorUserId_idx" ON "WorkplaceAuditLog"("actorUserId");
CREATE INDEX "WorkplaceAuditLog_employeeId_idx" ON "WorkplaceAuditLog"("employeeId");
CREATE INDEX "WorkplaceAuditLog_actionKey_idx" ON "WorkplaceAuditLog"("actionKey");
CREATE INDEX "WorkplaceAuditLog_moduleKey_idx" ON "WorkplaceAuditLog"("moduleKey");
CREATE INDEX "WorkplaceAuditLog_createdAt_idx" ON "WorkplaceAuditLog"("createdAt");

ALTER TABLE "WorkplaceRole" ADD CONSTRAINT "WorkplaceRole_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "WorkplaceDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkplaceEmployee" ADD CONSTRAINT "WorkplaceEmployee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkplaceEmployee" ADD CONSTRAINT "WorkplaceEmployee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "WorkplaceDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkplaceRoleAssignment" ADD CONSTRAINT "WorkplaceRoleAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "WorkplaceEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkplaceRoleAssignment" ADD CONSTRAINT "WorkplaceRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "WorkplaceRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkplaceApprovalRequest" ADD CONSTRAINT "WorkplaceApprovalRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "WorkplaceEmployee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkplaceAuditLog" ADD CONSTRAINT "WorkplaceAuditLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "WorkplaceEmployee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
