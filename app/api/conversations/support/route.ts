"use server";

import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { createNotification } from "@/lib/notificationService";

type SupportTicketBody = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as SupportTicketBody;
  const session = await getServerSession(authOptions);

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
      participants: {
        every: {
          userId: {
            in: participants
          }
        }
      }
    },
    include: {
      participants: {
        include: { User: { select: { id: true, name: true, role: true } } }
      }
    }
  });

  if (existing) {
    return NextResponse.json({ conversation: existing });
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: "SUPPORT",
      createdById: requesterId,
      updatedAt: new Date(),
      participants: {
        create: participants.map((userId) => ({ userId }))
      },
      metadata: JSON.stringify({ requesterName, requesterEmail })
    },
    include: {
      participants: {
        include: { User: { select: { id: true, name: true, role: true } } }
      }
    }
  });

  // Notificar al admin sobre el nuevo ticket
  await createNotification({
    type: "ADMIN_SYSTEM_ALERT",
    role: "ADMIN",
    title: "Nuevo ticket de soporte",
    message: `${requesterName} abrió un chat de ayuda.`,
    metadata: {
      conversationId: conversation.id,
      requesterId,
      requesterEmail
    },
    recipientUserId: admin.id
  });

  return NextResponse.json({ conversation });
}
