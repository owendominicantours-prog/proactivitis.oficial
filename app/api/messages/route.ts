import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const conversationId = body.conversationId as string | undefined;
  const content = (body.content as string | undefined)?.trim();
  if (!conversationId || !content) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      ConversationParticipant: true
    }
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversacion no encontrada" }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const isParticipant = conversation.ConversationParticipant.some((item) => item.userId === session.user.id);

  if (!isParticipant && !isAdmin) {
    return NextResponse.json({ error: "No eres parte de esta conversacion" }, { status: 403 });
  }

  if (!isParticipant && isAdmin) {
    await prisma.conversationParticipant.create({
      data: {
        conversationId,
        userId: session.user.id
      }
    });
  }

  const message = await prisma.message.create({
    data: {
      id: randomUUID(),
      conversationId,
      senderId: session.user.id,
      senderRole: session.user.role ?? "CUSTOMER",
      content
    }
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  return NextResponse.json({ message });
}
