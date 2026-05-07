"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  recordWorkplaceAuditLog,
  requireWorkplaceContext,
  slugifyWorkplace
} from "@/lib/workplace";

const toJson = (value: unknown) => value as Prisma.InputJsonValue;
const sanitize = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function canAccessRoom(context: Awaited<ReturnType<typeof requireWorkplaceContext>>, roomId: string) {
  if (context.isAdmin) return true;
  if (!context.employee) return false;

  const room = await prisma.workplaceChatRoom.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      departmentId: true,
      visibility: true,
      createdById: true,
      mentions: {
        where: {
          OR: [
            { employeeId: context.employee.id },
            context.employee.departmentId ? { departmentId: context.employee.departmentId } : { id: "__none__" }
          ]
        },
        select: { id: true },
        take: 1
      }
    }
  });
  if (!room) return false;
  return (
    room.visibility === "GLOBAL" ||
    room.createdById === context.employee.id ||
    room.departmentId === context.employee.departmentId ||
    room.mentions.length > 0
  );
}

async function detectDepartmentMentions(body: string) {
  const departments = await prisma.workplaceDepartment.findMany({
    where: { active: true },
    select: { id: true, name: true, slug: true }
  });
  const normalizedBody = ` ${normalizeText(body)} `;

  return departments.filter((department) => {
    const name = normalizeText(department.name).replace(/\s+/g, " ");
    const slug = slugifyWorkplace(department.slug || department.name);
    const compactName = name.replace(/\s+/g, "-");
    return (
      normalizedBody.includes(` @${slug} `) ||
      normalizedBody.includes(` @${compactName} `) ||
      normalizedBody.includes(` @${name} `)
    );
  });
}

async function detectEmployeeMentions(body: string) {
  const employees = await prisma.workplaceEmployee.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      employeeCode: true,
      jobTitle: true,
      user: { select: { name: true, email: true } },
      department: { select: { name: true, slug: true } }
    }
  });
  const normalizedBody = ` ${normalizeText(body)} `;

  return employees.filter((employee) => {
    const displayName = employee.user.name || employee.user.email || employee.employeeCode || "";
    const name = normalizeText(displayName).replace(/\s+/g, " ");
    const slug = slugifyWorkplace(displayName);
    const code = employee.employeeCode ? normalizeText(employee.employeeCode) : "";
    const compactName = name.replace(/\s+/g, "-");
    return (
      normalizedBody.includes(` @${slug} `) ||
      normalizedBody.includes(` @${compactName} `) ||
      normalizedBody.includes(` @${name} `) ||
      Boolean(code && normalizedBody.includes(` @${code} `))
    );
  });
}

export async function createWorkplaceChatRoomAction(formData: FormData) {
  const context = await requireWorkplaceContext("chat.view");
  const title = sanitize(formData.get("title"));
  const description = sanitize(formData.get("description"));
  const requestedDepartmentId = sanitize(formData.get("departmentId"));
  const requestedVisibility = sanitize(formData.get("visibility"));
  if (!title) throw new Error("La sala necesita titulo.");

  const departmentId = context.isAdmin ? requestedDepartmentId || null : context.employee?.departmentId ?? null;
  const visibility = context.isAdmin && requestedVisibility === "GLOBAL" ? "GLOBAL" : "DEPARTMENT";
  const slug = `${slugifyWorkplace(title)}-${Date.now().toString(36)}`;

  const room = await prisma.workplaceChatRoom.create({
    data: {
      title,
      slug,
      description: description || null,
      departmentId,
      visibility,
      createdById: context.employee?.id ?? null
    }
  });

  await recordWorkplaceAuditLog({
    actorUserId: context.user.id,
    employeeId: context.employee?.id ?? null,
    actionKey: "workplace.chat.room.create",
    moduleKey: "chat",
    resourceType: "chat_room",
    resourceId: room.id,
    afterData: { title, departmentId, visibility }
  });

  revalidatePath("/workplace/chat");
  redirect(`/workplace/chat?roomId=${room.id}`);
}

export async function sendWorkplaceChatMessageAction(formData: FormData) {
  const context = await requireWorkplaceContext("chat.respond");
  const roomId = sanitize(formData.get("roomId"));
  const body = sanitize(formData.get("body"));
  if (!roomId || !body) throw new Error("Faltan datos del mensaje.");
  if (!(await canAccessRoom(context, roomId))) {
    throw new Error("No tienes acceso a esta conversacion.");
  }

  const mentionedDepartments = await detectDepartmentMentions(body);
  const mentionedEmployees = await detectEmployeeMentions(body);
  const mentionPayload = mentionedDepartments.map((department) => ({
    type: "department",
    id: department.id,
    name: department.name,
    slug: department.slug
  })).concat(
    mentionedEmployees.map((employee) => ({
      type: "employee",
      id: employee.id,
      name: employee.user.name || employee.user.email || employee.employeeCode || "Empleado",
      slug: slugifyWorkplace(employee.user.name || employee.user.email || employee.employeeCode || employee.id)
    }))
  );

  const senderName = context.user.name || context.user.email || "Equipo Proactivitis";
  const senderDepartment = context.employee?.department?.name ?? (context.isAdmin ? "Administracion Proactivitis" : "Workplace");
  const senderPosition = context.employee?.jobTitle ?? (context.isAdmin ? "Super Admin" : "Equipo interno");
  const senderAvatarUrl = context.employee?.avatarUrl ?? null;

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.workplaceChatMessage.create({
      data: {
        roomId,
        employeeId: context.employee?.id ?? null,
        senderUserId: context.user.id,
        senderName,
        senderDepartment,
        senderPosition,
        senderAvatarUrl,
        body,
        mentions: mentionPayload.length ? toJson(mentionPayload) : undefined
      }
    });

    if (mentionedDepartments.length || mentionedEmployees.length) {
      await tx.workplaceChatMention.createMany({
        data: [
          ...mentionedDepartments.map((department) => ({
            roomId,
            messageId: created.id,
            departmentId: department.id,
            status: "OPEN"
          })),
          ...mentionedEmployees.map((employee) => ({
            roomId,
            messageId: created.id,
            employeeId: employee.id,
            status: "OPEN"
          }))
        ]
      });
    }

    await tx.workplaceChatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() }
    });

    return created;
  });

  await recordWorkplaceAuditLog({
    actorUserId: context.user.id,
    employeeId: context.employee?.id ?? null,
    actionKey: "workplace.chat.message.send",
    moduleKey: "chat",
    resourceType: "chat_message",
    resourceId: message.id,
    metadata: { roomId, mentions: mentionPayload.map((mention) => mention.name) }
  });

  revalidatePath("/workplace/chat");
}
