"use server";

import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { createNotification } from "@/lib/notificationService";
import { sendEmail } from "@/lib/email";
import { buildSupportChatOpenedAdminEmail, buildSupportChatReplyAdminEmail } from "@/lib/supportChatEmail";

type SupportTicketBody = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as SupportTicketBody;
  const session = await getServerSession(authOptions);
  const incomingMessage = body.message?.trim() ?? "";

  let requesterId = session?.user?.id;
  let requesterName = body.name ?? session?.user?.name ?? "Cliente";
  let requesterEmail = body.email ?? session?.user?.email ?? null;

  if (!requesterId) {
    if (!requesterEmail) {
      return NextResponse.json({ error: "Debe indicar email para crear ticket" }, { status: 400 });
    }
    const guest = await prisma.user.upsert({
      where: { email: requesterEmail },
      update: {
        name: requesterName
      },
        create: {
          name: requesterName,
          email: requesterEmail,
          password: randomUUID(),
          role: "CUSTOMER"
        }
    });
    requesterId = guest.id;
  }

  if (!requesterId) {
    return NextResponse.json({ error: "No se pudo resolver el solicitante" }, { status: 500 });
  }

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });

  if (!admin) {
    return NextResponse.json({ error: "No hay admin disponible" }, { status: 500 });
  }

  const participants = Array.from(new Set([requesterId, admin.id]));

  const existing = await prisma.conversation.findFirst({
    where: {
      type: "SUPPORT",
      ConversationParticipant: {
        every: {
          userId: {
            in: participants
          }
        }
      }
    },
    include: {
      ConversationParticipant: {
        include: { User: { select: { id: true, name: true, role: true } } }
      }
    }
  });

  if (existing) {
    if (incomingMessage) {
      await prisma.message.create({
        data: {
          id: randomUUID(),
          conversationId: existing.id,
          senderId: requesterId,
          senderRole: session?.user?.role ?? "CUSTOMER",
          content: incomingMessage
        }
      });

      await createNotification({
        type: "ADMIN_SYSTEM_ALERT",
        role: "ADMIN",
        title: "Nuevo mensaje de soporte",
        message: `${requesterName} abrió un nuevo mensaje en el chat de ayuda.`,
        metadata: {
          conversationId: existing.id,
          requesterId,
          requesterEmail,
          referenceUrl: "/admin/chat"
        },
        recipientUserId: admin.id
      });

      if (admin.email) {
        await sendEmail({
          to: admin.email,
          subject: `Nuevo mensaje de soporte de ${requesterName}`,
          html: buildSupportChatReplyAdminEmail({
            requesterName,
            requesterEmail: requesterEmail ?? "Sin email",
            message: incomingMessage,
            conversationUrl: `${request.nextUrl.origin}/admin/chat`
          })
        });
      }
    }

    return NextResponse.json({ conversation: existing });
  }

  const createdConversation = await prisma.conversation.create({
    data: {
      id: randomUUID(),
      type: "SUPPORT",
      createdById: requesterId,
      updatedAt: new Date(),
    }
  });

  await prisma.conversationParticipant.createMany({
    data: participants.map((userId) => ({
      conversationId: createdConversation.id,
      userId
    }))
  });

  const conversation = await prisma.conversation.findUnique({
    where: { id: createdConversation.id },
    include: {
      ConversationParticipant: {
        include: { User: { select: { id: true, name: true, role: true } } }
      }
    }
  });

  if (!conversation) {
    return NextResponse.json({ error: "No se pudo crear la conversación" }, { status: 500 });
  }

  if (incomingMessage) {
    await prisma.message.create({
      data: {
        id: randomUUID(),
        conversationId: conversation.id,
        senderId: requesterId,
        senderRole: session?.user?.role ?? "CUSTOMER",
        content: incomingMessage
      }
    });
  }

  // Notificar al admin sobre el nuevo ticket
  await createNotification({
    type: "ADMIN_SYSTEM_ALERT",
    role: "ADMIN",
    title: "Nuevo ticket de soporte",
    message: `${requesterName} abrió un chat de ayuda.`,
    metadata: {
      conversationId: conversation.id,
      requesterId,
      requesterEmail,
      referenceUrl: "/admin/chat"
    },
    recipientUserId: admin.id
  });

  if (admin.email) {
    await sendEmail({
      to: admin.email,
      subject: `Nuevo chat de soporte de ${requesterName}`,
      html: buildSupportChatOpenedAdminEmail({
        requesterName,
        requesterEmail: requesterEmail ?? "Sin email",
        message: incomingMessage || "El cliente abrio el chat sin mensaje inicial.",
        conversationUrl: `${request.nextUrl.origin}/admin/chat`
      })
    });
  }

  return NextResponse.json({ conversation });
}
