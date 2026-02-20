import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { parseVisitorContext } from "@/lib/visitorChatContext";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const typeFilter = request.nextUrl.searchParams.get("type")?.toUpperCase();
  const isAdmin = session.user.role === "ADMIN";
  const filterClause = {
    ...(isAdmin
      ? {}
      : {
          ConversationParticipant: {
            some: {
              userId: session.user.id
            }
          }
        }),
    ...(typeFilter ? { type: typeFilter } : {})
  };

  const conversations = await prisma.conversation.findMany({
    where: filterClause,
    include: {
      Message: {
        orderBy: {
          createdAt: "desc"
        },
        take: 20,
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
      },
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
      },
      Booking: {
        select: {
          id: true,
          travelDate: true,
          Tour: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  const payload = conversations.map((conv) => {
    const nonSystem = conv.Message.find((item) => item.senderRole !== "SYSTEM") ?? null;
    const latestContextMsg = conv.Message.find((item) => item.senderRole === "SYSTEM");
    const visitorContext = latestContextMsg ? parseVisitorContext(latestContextMsg.content) : null;

    return {
      id: conv.id,
      type: conv.type,
      tour: conv.Booking?.Tour
        ? {
            id: conv.Booking.Tour.id,
            title: conv.Booking.Tour.title
          }
        : null,
      bookingCode: conv.Booking?.id ?? null,
      lastMessage: nonSystem
        ? {
            id: nonSystem.id,
            content: nonSystem.content,
            createdAt: nonSystem.createdAt,
            sender: nonSystem.User,
            senderId: nonSystem.senderId,
            senderRole: nonSystem.senderRole
          }
        : null,
      pendingForMe: nonSystem ? nonSystem.senderId !== session.user.id : false,
      visitorContext,
      participants: conv.ConversationParticipant.map((participant) => ({
        id: participant.User?.id ?? participant.userId,
        name: participant.User?.name ?? participant.userId,
        email: participant.User?.email ?? null,
        role: participant.User?.role ?? null
      }))
    };
  });

  return NextResponse.json(payload);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type")?.toUpperCase();
  if (!type) {
    return NextResponse.json({ error: "Debes indicar type" }, { status: 400 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { type },
    select: { id: true }
  });
  const ids = conversations.map((item) => item.id);

  if (!ids.length) {
    return NextResponse.json({ ok: true, deleted: 0 });
  }

  await prisma.$transaction([
    prisma.message.deleteMany({ where: { conversationId: { in: ids } } }),
    prisma.conversationParticipant.deleteMany({ where: { conversationId: { in: ids } } }),
    prisma.conversation.deleteMany({ where: { id: { in: ids } } })
  ]);

  return NextResponse.json({ ok: true, deleted: ids.length });
}
