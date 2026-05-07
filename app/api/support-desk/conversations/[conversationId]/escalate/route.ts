import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  canAccessSupportConversation,
  getSupportDeskContext
} from "@/lib/supportDesk";
import { slugifyWorkplace } from "@/lib/workplace";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const supportContext = await getSupportDeskContext();
  if (!supportContext) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { conversationId } = await context.params;
  if (!(await canAccessSupportConversation(supportContext, conversationId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const departmentId = String(body.departmentId ?? "").trim();
  const note = String(body.note ?? "").trim();
  const priority = String(body.priority ?? "HIGH").trim().toUpperCase();
  if (!departmentId) return NextResponse.json({ error: "departmentId requerido" }, { status: 400 });

  const [department, conversation] = await Promise.all([
    prisma.workplaceDepartment.findUnique({ where: { id: departmentId }, select: { id: true, name: true, slug: true } }),
    prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        Booking: { select: { id: true, bookingCode: true, Tour: { select: { title: true } } } },
        Message: { orderBy: { createdAt: "desc" }, take: 1 }
      }
    })
  ]);

  if (!department || !conversation) {
    return NextResponse.json({ error: "Datos no encontrados" }, { status: 404 });
  }

  const roomSlug = `escalacion-asistencia-${conversation.id}`;
  const senderName = supportContext.user.name || supportContext.user.email || "Equipo Proactivitis";
  const senderDepartment = supportContext.employee?.department?.name ?? (supportContext.isAdmin ? "Administracion Proactivitis" : "Asistencia");
  const senderPosition = supportContext.employee?.jobTitle ?? (supportContext.isAdmin ? "Super Admin" : "Agente de asistencia");
  const senderAvatarUrl = supportContext.employee?.avatarUrl ?? null;
  const service = conversation.Booking?.Tour?.title ?? "Soporte publico";
  const bookingCode = conversation.Booking?.bookingCode ?? conversation.linkedBookingId ?? "sin codigo vinculado";

  const result = await prisma.$transaction(async (tx) => {
    const room = await tx.workplaceChatRoom.upsert({
      where: { slug: roomSlug },
      update: {
        departmentId: department.id,
        status: "OPEN",
        updatedAt: new Date()
      },
      create: {
        title: `Escalacion asistencia ${bookingCode}`,
        slug: roomSlug,
        description: `Caso de cliente escalado desde asistencia publica para ${department.name}.`,
        departmentId: department.id,
        visibility: "DEPARTMENT",
        createdById: supportContext.employee?.id ?? null
      }
    });

    const internalMessage = await tx.workplaceChatMessage.create({
      data: {
        roomId: room.id,
        employeeId: supportContext.employee?.id ?? null,
        senderUserId: supportContext.user.id,
        senderName,
        senderDepartment,
        senderPosition,
        senderAvatarUrl,
        body: [
          `@${slugifyWorkplace(department.slug || department.name)} necesitamos apoyo tecnico en una conversacion de cliente.`,
          `Conversacion: /workplace/support?conversationId=${conversation.id}`,
          `Servicio: ${service}`,
          `Reserva: ${bookingCode}`,
          note ? `Nota del agente: ${note}` : null
        ].filter(Boolean).join("\n"),
        mentions: [{ type: "department", id: department.id, name: department.name, slug: department.slug }]
      }
    });

    await tx.workplaceChatMention.create({
      data: {
        roomId: room.id,
        messageId: internalMessage.id,
        departmentId: department.id,
        status: "OPEN"
      }
    });

    await tx.conversation.update({
      where: { id: conversation.id },
      data: {
        status: "ESCALATED",
        priority,
        assignedDepartmentId: department.id,
        escalatedAt: new Date(),
        internalNote: note || conversation.internalNote,
        updatedAt: new Date()
      }
    });

    await tx.message.create({
      data: {
        id: randomUUID(),
        conversationId: conversation.id,
        senderId: supportContext.user.id,
        senderRole: "SYSTEM",
        content: `[[SUPPORT_ESCALATION]]${JSON.stringify({ department: department.name, priority, note })}`
      }
    });

    return room;
  });

  return NextResponse.json({ ok: true, roomId: result.id });
}
