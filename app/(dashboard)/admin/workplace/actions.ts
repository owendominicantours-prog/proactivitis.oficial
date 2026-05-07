"use server";

import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/adminAccess";
import { prisma } from "@/lib/prisma";
import {
  ensureWorkplaceDefaults,
  parseScopeList,
  recordWorkplaceAuditLog,
  slugifyWorkplace,
  workplaceEmptyScope
} from "@/lib/workplace";

const toJson = (value: unknown) => value as Prisma.InputJsonValue;
const sanitize = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

const revalidateWorkplace = () => {
  revalidatePath("/admin/workplace");
  revalidatePath("/workplace");
};

export async function seedWorkplaceDefaultsAction() {
  const session = await requireAdminSession();
  await ensureWorkplaceDefaults();
  await recordWorkplaceAuditLog({
    actorUserId: session.user.id,
    actionKey: "workplace.seed_defaults",
    moduleKey: "security",
    metadata: { source: "admin_workplace" }
  });
  revalidateWorkplace();
}

export async function createWorkplaceDepartmentAction(formData: FormData) {
  const session = await requireAdminSession();
  const name = sanitize(formData.get("name"));
  const description = sanitize(formData.get("description"));
  if (!name) throw new Error("El departamento necesita nombre.");

  const slug = slugifyWorkplace(sanitize(formData.get("slug")) || name);
  const department = await prisma.workplaceDepartment.upsert({
    where: { slug },
    update: { name, description: description || null, active: true },
    create: { name, slug, description: description || null }
  });

  await recordWorkplaceAuditLog({
    actorUserId: session.user.id,
    actionKey: "workplace.department.upsert",
    moduleKey: "security",
    resourceType: "department",
    resourceId: department.id,
    afterData: { name, slug }
  });
  revalidateWorkplace();
}

export async function toggleWorkplaceDepartmentAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = sanitize(formData.get("departmentId"));
  const active = sanitize(formData.get("active")) === "true";
  if (!id) throw new Error("Departamento invalido.");

  const department = await prisma.workplaceDepartment.update({ where: { id }, data: { active } });
  await recordWorkplaceAuditLog({
    actorUserId: session.user.id,
    actionKey: active ? "workplace.department.enable" : "workplace.department.disable",
    moduleKey: "security",
    resourceType: "department",
    resourceId: id,
    afterData: { slug: department.slug, active }
  });
  revalidateWorkplace();
}

export async function createWorkplaceRoleAction(formData: FormData) {
  const session = await requireAdminSession();
  const name = sanitize(formData.get("name"));
  const description = sanitize(formData.get("description"));
  const departmentId = sanitize(formData.get("departmentId"));
  const level = Number(sanitize(formData.get("level")) || 10);
  const permissions = formData.getAll("permissions").map(String).filter(Boolean);
  if (!name) throw new Error("El rol necesita nombre.");
  if (!permissions.length) throw new Error("Selecciona al menos un permiso.");

  const slug = slugifyWorkplace(sanitize(formData.get("slug")) || name);
  const role = await prisma.workplaceRole.upsert({
    where: { slug },
    update: {
      name,
      description: description || null,
      departmentId: departmentId || null,
      level: Number.isFinite(level) ? level : 10,
      permissions: toJson(permissions),
      scope: toJson(workplaceEmptyScope),
      active: true
    },
    create: {
      name,
      slug,
      description: description || null,
      departmentId: departmentId || null,
      level: Number.isFinite(level) ? level : 10,
      permissions: toJson(permissions),
      scope: toJson(workplaceEmptyScope)
    }
  });

  await recordWorkplaceAuditLog({
    actorUserId: session.user.id,
    actionKey: "workplace.role.upsert",
    moduleKey: "security",
    resourceType: "role",
    resourceId: role.id,
    afterData: { name, slug, permissions }
  });
  revalidateWorkplace();
}

export async function deleteWorkplaceRoleAction(formData: FormData) {
  const session = await requireAdminSession();
  const roleId = sanitize(formData.get("roleId"));
  if (!roleId) throw new Error("Rol invalido.");

  const role = await prisma.workplaceRole.findUnique({
    where: { id: roleId },
    include: { _count: { select: { assignments: true } } }
  });
  if (!role) throw new Error("Rol no encontrado.");

  await prisma.$transaction([
    prisma.workplaceRoleAssignment.deleteMany({ where: { roleId } }),
    prisma.workplaceRole.delete({ where: { id: roleId } })
  ]);

  await recordWorkplaceAuditLog({
    actorUserId: session.user.id,
    actionKey: "workplace.role.delete",
    moduleKey: "security",
    resourceType: "role",
    resourceId: roleId,
    beforeData: {
      name: role.name,
      slug: role.slug,
      assignmentsRemoved: role._count.assignments
    }
  });
  revalidateWorkplace();
}

export async function createWorkplaceEmployeeAction(formData: FormData) {
  const session = await requireAdminSession();
  const name = sanitize(formData.get("name"));
  const email = sanitize(formData.get("email")).toLowerCase();
  const jobTitle = sanitize(formData.get("jobTitle"));
  const departmentId = sanitize(formData.get("departmentId"));
  const roleId = sanitize(formData.get("roleId"));
  const tempPassword = sanitize(formData.get("tempPassword"));

  if (!email) throw new Error("El empleado necesita email.");

  const password = tempPassword ? await bcrypt.hash(tempPassword, 10) : undefined;
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: name || undefined,
      role: "EMPLOYEE",
      accountStatus: "PENDING",
      ...(password ? { password } : {})
    },
    create: {
      name: name || email,
      email,
      role: "EMPLOYEE",
      accountStatus: "PENDING",
      password
    }
  });

  const employee = await prisma.workplaceEmployee.upsert({
    where: { userId: user.id },
    update: {
      departmentId: departmentId || null,
      jobTitle: jobTitle || null,
      status: "PENDING",
      countryScope: toJson(parseScopeList(formData.get("countryScope"))),
      cityScope: toJson(parseScopeList(formData.get("cityScope"))),
      nicheScope: toJson(parseScopeList(formData.get("nicheScope"))),
      productScope: toJson(parseScopeList(formData.get("productScope"))),
      companyScope: toJson(parseScopeList(formData.get("companyScope"))),
      moduleScope: toJson(parseScopeList(formData.get("moduleScope")))
    },
    create: {
      userId: user.id,
      departmentId: departmentId || null,
      jobTitle: jobTitle || null,
      status: "PENDING",
      employeeCode: `EMP-${Date.now().toString(36).toUpperCase()}`,
      countryScope: toJson(parseScopeList(formData.get("countryScope"))),
      cityScope: toJson(parseScopeList(formData.get("cityScope"))),
      nicheScope: toJson(parseScopeList(formData.get("nicheScope"))),
      productScope: toJson(parseScopeList(formData.get("productScope"))),
      companyScope: toJson(parseScopeList(formData.get("companyScope"))),
      moduleScope: toJson(parseScopeList(formData.get("moduleScope")))
    }
  });

  if (roleId) {
    await prisma.workplaceRoleAssignment.upsert({
      where: { employeeId_roleId: { employeeId: employee.id, roleId } },
      update: { assignedById: session.user.id },
      create: { employeeId: employee.id, roleId, assignedById: session.user.id }
    });
  }

  await recordWorkplaceAuditLog({
    actorUserId: session.user.id,
    employeeId: employee.id,
    actionKey: "workplace.employee.create",
    moduleKey: "security",
    resourceType: "employee",
    resourceId: employee.id,
    afterData: { email, jobTitle, roleId }
  });
  revalidateWorkplace();
}

export async function updateWorkplaceEmployeeStatusAction(formData: FormData) {
  const session = await requireAdminSession();
  const employeeId = sanitize(formData.get("employeeId"));
  const status = sanitize(formData.get("status"));
  if (!employeeId || !["PENDING", "APPROVED", "SUSPENDED", "REJECTED"].includes(status)) {
    throw new Error("Estado de empleado invalido.");
  }

  const employee = await prisma.workplaceEmployee.update({
    where: { id: employeeId },
    data: {
      status,
      approvedAt: status === "APPROVED" ? new Date() : null,
      approvedById: status === "APPROVED" ? session.user.id : null,
      user: {
        update: {
          accountStatus: status === "APPROVED" ? "APPROVED" : status
        }
      }
    }
  });

  await recordWorkplaceAuditLog({
    actorUserId: session.user.id,
    employeeId,
    actionKey: `workplace.employee.${status.toLowerCase()}`,
    moduleKey: "security",
    resourceType: "employee",
    resourceId: employeeId,
    afterData: { status, userId: employee.userId }
  });
  revalidateWorkplace();
}

export async function assignWorkplaceRoleAction(formData: FormData) {
  const session = await requireAdminSession();
  const employeeId = sanitize(formData.get("employeeId"));
  const roleId = sanitize(formData.get("roleId"));
  const expiresAtValue = sanitize(formData.get("expiresAt"));
  if (!employeeId || !roleId) throw new Error("Faltan datos para asignar rol.");

  const expiresAt = expiresAtValue ? new Date(expiresAtValue) : null;
  await prisma.workplaceRoleAssignment.upsert({
    where: { employeeId_roleId: { employeeId, roleId } },
    update: { assignedById: session.user.id, expiresAt },
    create: { employeeId, roleId, assignedById: session.user.id, expiresAt }
  });

  await recordWorkplaceAuditLog({
    actorUserId: session.user.id,
    employeeId,
    actionKey: "workplace.role.assign",
    moduleKey: "security",
    resourceType: "role",
    resourceId: roleId,
    metadata: { expiresAt: expiresAtValue || null }
  });
  revalidateWorkplace();
}

export async function updateWorkplaceEmployeeRolesAction(formData: FormData) {
  const session = await requireAdminSession();
  const employeeId = sanitize(formData.get("employeeId"));
  const roleIds = Array.from(new Set(formData.getAll("roleIds").map(String).filter(Boolean)));
  if (!employeeId) throw new Error("Empleado invalido.");

  const employee = await prisma.workplaceEmployee.findUnique({
    where: { id: employeeId },
    select: { id: true, userId: true }
  });
  if (!employee) throw new Error("Empleado no encontrado.");

  if (roleIds.length) {
    const existingRoles = await prisma.workplaceRole.findMany({
      where: { id: { in: roleIds } },
      select: { id: true }
    });
    const validRoleIds = new Set(existingRoles.map((role) => role.id));

    await prisma.workplaceRoleAssignment.deleteMany({
      where: { employeeId, roleId: { notIn: Array.from(validRoleIds) } }
    });

    for (const roleId of validRoleIds) {
      await prisma.workplaceRoleAssignment.upsert({
        where: { employeeId_roleId: { employeeId, roleId } },
        update: { assignedById: session.user.id, expiresAt: null },
        create: { employeeId, roleId, assignedById: session.user.id }
      });
    }
  } else {
    await prisma.workplaceRoleAssignment.deleteMany({ where: { employeeId } });
  }

  await recordWorkplaceAuditLog({
    actorUserId: session.user.id,
    employeeId,
    actionKey: "workplace.roles.sync",
    moduleKey: "security",
    resourceType: "employee",
    resourceId: employeeId,
    afterData: { roleIds }
  });
  revalidateWorkplace();
}

export async function createWorkplaceApprovalRequestAction(formData: FormData) {
  const session = await requireAdminSession();
  const title = sanitize(formData.get("title"));
  const actionKey = sanitize(formData.get("actionKey"));
  const moduleKey = sanitize(formData.get("moduleKey"));
  const employeeId = sanitize(formData.get("employeeId"));
  const description = sanitize(formData.get("description"));
  if (!title || !actionKey) throw new Error("La solicitud necesita titulo y accion.");

  await prisma.workplaceApprovalRequest.create({
    data: {
      employeeId: employeeId || null,
      requestedById: session.user.id,
      actionKey,
      moduleKey: moduleKey || null,
      title,
      description: description || null,
      payload: toJson({
        createdFrom: "admin_workplace",
        resourceType: sanitize(formData.get("resourceType")) || null,
        resourceId: sanitize(formData.get("resourceId")) || null
      })
    }
  });

  await recordWorkplaceAuditLog({
    actorUserId: session.user.id,
    employeeId: employeeId || null,
    actionKey: "workplace.approval.request",
    moduleKey: moduleKey || "security",
    metadata: { actionKey, title }
  });
  revalidateWorkplace();
}

export async function decideWorkplaceApprovalRequestAction(formData: FormData) {
  const session = await requireAdminSession();
  const requestId = sanitize(formData.get("requestId"));
  const decision = sanitize(formData.get("decision"));
  const decisionNote = sanitize(formData.get("decisionNote"));
  if (!requestId || !["APPROVED", "REJECTED"].includes(decision)) {
    throw new Error("Decision invalida.");
  }

  const request = await prisma.workplaceApprovalRequest.update({
    where: { id: requestId },
    data: {
      status: decision,
      decisionNote: decisionNote || null,
      decidedById: session.user.id,
      decidedAt: new Date()
    }
  });

  await recordWorkplaceAuditLog({
    actorUserId: session.user.id,
    employeeId: request.employeeId ?? null,
    actionKey: decision === "APPROVED" ? "workplace.approval.approve" : "workplace.approval.reject",
    moduleKey: request.moduleKey ?? "security",
    resourceType: "approval_request",
    resourceId: request.id,
    afterData: { status: decision, actionKey: request.actionKey }
  });
  revalidateWorkplace();
}
