import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const toJson = (value: unknown) => value as Prisma.InputJsonValue;

export const workplaceModules = [
  { key: "tours", label: "Tours" },
  { key: "rent_car", label: "Rent Car" },
  { key: "hotels", label: "Hoteles" },
  { key: "transfers", label: "Transfer" },
  { key: "suppliers", label: "Suplidores" },
  { key: "agencies", label: "Agencias" },
  { key: "bookings", label: "Reservas" },
  { key: "finance", label: "Finanzas" },
  { key: "refunds", label: "Reembolsos" },
  { key: "chat", label: "Chat" },
  { key: "reports", label: "Reportes" },
  { key: "security", label: "Seguridad" }
] as const;

export const workplacePermissions = [
  { key: "tours.view", module: "tours", label: "Ver tours" },
  { key: "tours.edit", module: "tours", label: "Editar tours" },
  { key: "tours.media", module: "tours", label: "Subir o borrar fotos" },
  { key: "tours.price", module: "tours", label: "Modificar precios criticos", sensitive: true },
  { key: "tours.delete", module: "tours", label: "Eliminar tour", sensitive: true },
  { key: "rent_car.view", module: "rent_car", label: "Ver rent car" },
  { key: "rent_car.edit", module: "rent_car", label: "Editar vehiculos" },
  { key: "rent_car.price", module: "rent_car", label: "Cambiar precios rent car", sensitive: true },
  { key: "hotels.view", module: "hotels", label: "Ver hoteles" },
  { key: "hotels.edit", module: "hotels", label: "Editar hoteles" },
  { key: "transfers.view", module: "transfers", label: "Ver traslados" },
  { key: "transfers.edit", module: "transfers", label: "Editar rutas y tarifas" },
  { key: "bookings.view", module: "bookings", label: "Ver reservas" },
  { key: "bookings.edit", module: "bookings", label: "Editar reservas" },
  { key: "bookings.delete", module: "bookings", label: "Eliminar reservas", sensitive: true },
  { key: "suppliers.view", module: "suppliers", label: "Ver suplidores" },
  { key: "suppliers.support", module: "suppliers", label: "Soporte a suplidores" },
  { key: "suppliers.disable", module: "suppliers", label: "Desactivar suplidor", sensitive: true },
  { key: "agencies.view", module: "agencies", label: "Ver agencias" },
  { key: "agencies.support", module: "agencies", label: "Soporte a agencias" },
  { key: "finance.view", module: "finance", label: "Ver finanzas" },
  { key: "finance.commission", module: "finance", label: "Cambiar comisiones", sensitive: true },
  { key: "refunds.manage", module: "refunds", label: "Gestionar reembolsos", sensitive: true },
  { key: "chat.respond", module: "chat", label: "Responder chat" },
  { key: "reports.view", module: "reports", label: "Ver reportes" },
  { key: "security.audit", module: "security", label: "Ver auditoria" },
  { key: "security.approve", module: "security", label: "Aprobar acciones sensibles", sensitive: true },
  { key: "workplace.manage", module: "security", label: "Administrar Workplace", sensitive: true }
] as const;

export const sensitiveWorkplaceActions = workplacePermissions.filter(
  (permission) => "sensitive" in permission && permission.sensitive
);

const defaultDepartments = [
  ["Operaciones", "operaciones", "Coordina reservas, productos y calidad operativa."],
  ["Contabilidad", "contabilidad", "Control de pagos, comisiones y reportes financieros."],
  ["Soporte", "soporte", "Atencion a clientes, suplidores y agencias."],
  ["Calidad", "calidad", "Revision de productos, fotos, resenas y experiencia."],
  ["Tours", "tours", "Operacion y crecimiento de experiencias."],
  ["Rent Car", "rent-car", "Gestion de flota, reservas y precios de rent car."],
  ["Hoteles", "hoteles", "Operacion de hoteles, apartamentos y casas vacacionales."],
  ["Seguridad", "seguridad", "Auditoria, aprobaciones y control de accesos."]
] as const;

const defaultRoles = [
  {
    name: "Director Regional",
    slug: "director-regional",
    departmentSlug: "operaciones",
    level: 80,
    permissions: ["bookings.view", "bookings.edit", "tours.view", "rent_car.view", "hotels.view", "reports.view", "security.audit"]
  },
  {
    name: "Manager Pais",
    slug: "manager-pais",
    departmentSlug: "operaciones",
    level: 60,
    permissions: ["bookings.view", "bookings.edit", "suppliers.view", "agencies.view", "reports.view"]
  },
  {
    name: "Supervisor Soporte",
    slug: "supervisor-soporte",
    departmentSlug: "soporte",
    level: 45,
    permissions: ["bookings.view", "chat.respond", "suppliers.support", "agencies.support"]
  },
  {
    name: "Editor Tours",
    slug: "editor-tours",
    departmentSlug: "tours",
    level: 30,
    permissions: ["tours.view", "tours.edit", "tours.media"]
  },
  {
    name: "Operador Rent Car",
    slug: "operador-rent-car",
    departmentSlug: "rent-car",
    level: 30,
    permissions: ["rent_car.view", "rent_car.edit", "bookings.view"]
  },
  {
    name: "Auditor Seguridad",
    slug: "auditor-seguridad",
    departmentSlug: "seguridad",
    level: 70,
    permissions: ["security.audit", "security.approve", "workplace.manage"]
  }
] as const;

export function parseScopeList(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split(/[,\n]/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 80);
}

export function slugifyWorkplace(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function ensureWorkplaceDefaults() {
  for (const [name, slug, description] of defaultDepartments) {
    await prisma.workplaceDepartment.upsert({
      where: { slug },
      update: {},
      create: { name, slug, description }
    });
  }

  for (const role of defaultRoles) {
    const department = await prisma.workplaceDepartment.findUnique({ where: { slug: role.departmentSlug } });
    await prisma.workplaceRole.upsert({
      where: { slug: role.slug },
      update: {},
      create: {
        name: role.name,
        slug: role.slug,
        departmentId: department?.id,
        level: role.level,
        permissions: toJson(role.permissions),
        scope: toJson({ countries: [], cities: [], niches: [], products: [], companies: [], modules: [] })
      }
    });
  }
}

export async function recordWorkplaceAuditLog(input: {
  actorUserId?: string | null;
  employeeId?: string | null;
  actionKey: string;
  moduleKey?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
}) {
  await prisma.workplaceAuditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      employeeId: input.employeeId ?? null,
      actionKey: input.actionKey,
      moduleKey: input.moduleKey ?? null,
      resourceType: input.resourceType ?? null,
      resourceId: input.resourceId ?? null,
      metadata: input.metadata ? toJson(input.metadata) : undefined,
      beforeData: input.beforeData ? toJson(input.beforeData) : undefined,
      afterData: input.afterData ? toJson(input.afterData) : undefined
    }
  });
}

export async function userHasWorkplacePermission(userId: string, permissionKey: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "ADMIN") return true;

  const employee = await prisma.workplaceEmployee.findUnique({
    where: { userId },
    include: { roles: { include: { role: true } } }
  });
  if (!employee || employee.status !== "APPROVED") return false;
  if (employee.accessExpiresAt && employee.accessExpiresAt < new Date()) return false;

  const permissions = new Set<string>();
  for (const assignment of employee.roles) {
    if (assignment.expiresAt && assignment.expiresAt < new Date()) continue;
    if (!assignment.role.active || !Array.isArray(assignment.role.permissions)) continue;
    for (const permission of assignment.role.permissions) {
      if (typeof permission === "string") permissions.add(permission);
    }
  }

  if (Array.isArray(employee.permissionOverrides)) {
    for (const permission of employee.permissionOverrides) {
      if (typeof permission === "string") permissions.add(permission);
    }
  }

  return permissions.has("*") || permissions.has(permissionKey);
}

export async function getWorkplaceContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true }
  });
  if (!user) return null;

  if (user.role === "ADMIN") {
    return {
      user,
      employee: null,
      permissions: new Set(workplacePermissions.map((permission) => permission.key)),
      scope: workplaceEmptyScope,
      isAdmin: true
    };
  }

  const employee = await prisma.workplaceEmployee.findUnique({
    where: { userId: user.id },
    include: {
      department: true,
      roles: { include: { role: true } }
    }
  });
  if (!employee || employee.status !== "APPROVED") {
    return { user, employee, permissions: new Set<string>(), scope: workplaceEmptyScope, isAdmin: false };
  }

  const permissions = new Set<string>();
  for (const assignment of employee.roles) {
    if (assignment.expiresAt && assignment.expiresAt < new Date()) continue;
    if (!assignment.role.active || !Array.isArray(assignment.role.permissions)) continue;
    for (const permission of assignment.role.permissions) {
      if (typeof permission === "string") permissions.add(permission);
    }
  }
  if (Array.isArray(employee.permissionOverrides)) {
    for (const permission of employee.permissionOverrides) {
      if (typeof permission === "string") permissions.add(permission);
    }
  }

  return {
    user,
    employee,
    permissions,
    scope: {
      countries: Array.isArray(employee.countryScope) ? employee.countryScope.map(String) : [],
      cities: Array.isArray(employee.cityScope) ? employee.cityScope.map(String) : [],
      niches: Array.isArray(employee.nicheScope) ? employee.nicheScope.map(String) : [],
      products: Array.isArray(employee.productScope) ? employee.productScope.map(String) : [],
      companies: Array.isArray(employee.companyScope) ? employee.companyScope.map(String) : [],
      modules: Array.isArray(employee.moduleScope) ? employee.moduleScope.map(String) : []
    },
    isAdmin: false
  };
}

export async function requireWorkplaceContext(permissionKey?: string) {
  const context = await getWorkplaceContext();
  if (!context?.user) {
    redirect("/auth/login?callbackUrl=/workplace");
  }
  if (!context.isAdmin && context.employee?.status !== "APPROVED") {
    redirect("/workplace");
  }
  if (permissionKey && !context.isAdmin && !context.permissions.has(permissionKey)) {
    redirect("/workplace");
  }
  return context;
}

export const workplaceEmptyScope = {
  countries: [],
  cities: [],
  niches: [],
  products: [],
  companies: [],
  modules: []
};
