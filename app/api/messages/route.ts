import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { createNotification } from "@/lib/notificationService";
import { sendEmail } from "@/lib/email";
import { buildSupportChatReplyAdminEmail } from "@/lib/supportChatEmail";

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
      ConversationParticipant: {
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      }
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

  if (conversation.type === "SUPPORT" && (session.user.role ?? "CUSTOMER") === "CUSTOMER") {
    const senderParticipant = conversation.ConversationParticipant.find((item) => item.userId === session.user.id);
    const requesterName = senderParticipant?.User?.name ?? session.user.name ?? "Cliente";
    const requesterEmail = senderParticipant?.User?.email ?? session.user.email ?? "Sin email";
    const adminParticipants = conversation.ConversationParticipant.filter((item) => item.User?.role === "ADMIN");

    await Promise.all(
      adminParticipants.map(async (adminParticipant) => {
        await createNotification({
          type: "ADMIN_SYSTEM_ALERT",
          role: "ADMIN",
          title: "Nuevo mensaje de soporte",
          message: `${requesterName} envio un nuevo mensaje en el chat de ayuda.`,
          metadata: {
            conversationId,
            requesterId: session.user.id,
            requesterEmail,
            referenceUrl: "/admin/chat"
          },
          recipientUserId: adminParticipant.userId
        });

        if (adminParticipant.User?.email) {
          await sendEmail({
            to: adminParticipant.User.email,
            subject: `Nuevo mensaje de soporte de ${requesterName}`,
            html: buildSupportChatReplyAdminEmail({
              requesterName,
              requesterEmail,
              message: content,
              conversationUrl: `${request.nextUrl.origin}/admin/chat`
            })
          });
        }
      })
    );
  }

  return NextResponse.json({ message });
}
