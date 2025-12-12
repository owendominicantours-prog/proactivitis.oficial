import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const typeFilter = request.nextUrl.searchParams.get("type")?.toUpperCase();
  const filterClause = {
    participants: {
      some: {
        userId: session.user.id
      }
    },
    ...(typeFilter ? { type: typeFilter } : {})
  };

  const conversations = await prisma.conversation.findMany({
    where: filterClause,
    include: {
      messages: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      },
      participants: {
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
      booking: {
        select: {
          bookingCode: true,
          travelDate: true,
          tour: {
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

  const payload = conversations.map((conv) => ({
    id: conv.id,
    type: conv.type,
    tour: conv.booking?.tour
      ? {
          id: conv.booking.tour.id,
          title: conv.booking.tour.title
        }
      : null,
    bookingCode: conv.booking?.bookingCode ?? null,
    lastMessage: conv.messages[0]
      ? {
          content: conv.messages[0].content,
          createdAt: conv.messages[0].createdAt,
          sender: conv.messages[0].sender
        }
      : null,
    participants: conv.participants.map((participant) => ({
      id: participant.User?.id ?? participant.userId,
      name: participant.User?.name ?? participant.userId,
      email: participant.User?.email ?? null,
      role: participant.User?.role ?? null
    }))
  }));

  return NextResponse.json(payload);
}
