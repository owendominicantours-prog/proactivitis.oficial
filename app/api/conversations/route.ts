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
        take: 1,
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

  const payload = conversations.map((conv) => ({
    id: conv.id,
    type: conv.type,
    tour: conv.Booking?.Tour
      ? {
          id: conv.Booking.Tour.id,
          title: conv.Booking.Tour.title
        }
      : null,
    bookingCode: conv.Booking?.id ?? null,
    lastMessage: conv.Message[0]
      ? {
          content: conv.Message[0].content,
          createdAt: conv.Message[0].createdAt,
          sender: conv.Message[0].User
        }
      : null,
    participants: conv.ConversationParticipant.map((participant) => ({
      id: participant.User?.id ?? participant.userId,
      name: participant.User?.name ?? participant.userId,
      email: participant.User?.email ?? null,
      role: participant.User?.role ?? null
    }))
  }));

  return NextResponse.json(payload);
}
