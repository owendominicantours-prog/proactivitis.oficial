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
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
  }

  const isParticipant = conversation.ConversationParticipant.some((item) => item.userId === session.user.id);
  if (!isParticipant) {
    return NextResponse.json({ error: "No eres parte de esta conversación" }, { status: 403 });
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

  return NextResponse.json({ message });
}
