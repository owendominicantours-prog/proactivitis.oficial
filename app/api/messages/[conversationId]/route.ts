import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      ConversationParticipant: true,
      Message: {
        orderBy: { createdAt: "asc" },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversacion no encontrada" }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const isParticipant = conversation.ConversationParticipant.some((item) => item.userId === session.user.id);
  if (!isParticipant && !isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json({ messages: conversation.Message });
}
