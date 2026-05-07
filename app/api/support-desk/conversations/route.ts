import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  buildSupportConversationWhere,
  formatSupportBooking,
  getSupportDeskContext,
  supportBookingSelect
} from "@/lib/supportDesk";
import { parseVisitorContext } from "@/lib/visitorChatContext";

const VISITOR_ACTIVE_WINDOW_MS = 3 * 60 * 1000;

export async function GET(request: NextRequest) {
  const context = await getSupportDeskContext();
  if (!context) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type");
  const status = request.nextUrl.searchParams.get("status");
  const where = buildSupportConversationWhere(context, type);
  const conversations = await prisma.conversation.findMany({
    where: {
      AND: [
        where,
        status && status !== "all" ? { status: status.toUpperCase() } : {}
      ]
    },
    include: {
      assignedDepartment: { select: { id: true, name: true, slug: true } },
      assignedEmployee: { select: { id: true, jobTitle: true, avatarUrl: true, user: { select: { name: true, email: true } } } },
      Booking: { select: supportBookingSelect },
      Message: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { User: { select: { id: true, name: true, email: true, role: true } } }
      },
      ConversationParticipant: {
        include: { User: { select: { id: true, name: true, email: true, role: true } } }
      }
    },
    orderBy: { updatedAt: "desc" },
    take: 120
  });

  const linkedIds = Array.from(new Set(conversations.map((item) => item.linkedBookingId).filter(Boolean) as string[]));
  const linkedBookings = linkedIds.length
    ? await prisma.booking.findMany({
        where: { id: { in: linkedIds } },
        select: supportBookingSelect
      })
    : [];
  const linkedMap = new Map(linkedBookings.map((booking) => [booking.id, formatSupportBooking(booking)]));

  const payload = conversations.map((conversation) => {
    const nonSystem = conversation.Message.find((item) => item.senderRole !== "SYSTEM") ?? null;
    const latestContextMsg = conversation.Message.find((item) => item.senderRole === "SYSTEM");
    const visitorContext = latestContextMsg ? parseVisitorContext(latestContextMsg.content) : null;
    const lastVisitorActivity =
      conversation.Message.find((item) => item.senderRole === "VISITOR")?.createdAt ??
      (visitorContext?.at ? new Date(visitorContext.at) : null);
    const visitorActive = lastVisitorActivity
      ? Date.now() - new Date(lastVisitorActivity).getTime() <= VISITOR_ACTIVE_WINDOW_MS
      : false;
    const booking = conversation.Booking
      ? formatSupportBooking(conversation.Booking)
      : conversation.linkedBookingId
        ? linkedMap.get(conversation.linkedBookingId) ?? null
        : null;

    return {
      id: conversation.id,
      type: conversation.type,
      status: conversation.status,
      priority: conversation.priority,
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt,
      assignedDepartment: conversation.assignedDepartment,
      assignedEmployee: conversation.assignedEmployee
        ? {
            id: conversation.assignedEmployee.id,
            name: conversation.assignedEmployee.user.name,
            email: conversation.assignedEmployee.user.email,
            jobTitle: conversation.assignedEmployee.jobTitle,
            avatarUrl: conversation.assignedEmployee.avatarUrl
          }
        : null,
      booking,
      visitorContext,
      visitorPresence:
        conversation.type === "VISITOR_CHAT"
          ? {
              active: visitorActive,
              lastSeenAt: lastVisitorActivity ? new Date(lastVisitorActivity).toISOString() : null
            }
          : null,
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
      pendingForMe: nonSystem ? nonSystem.senderId !== context.user.id : false,
      participants: conversation.ConversationParticipant.map((participant) => ({
        id: participant.User?.id ?? participant.userId,
        name: participant.User?.name ?? participant.userId,
        email: participant.User?.email ?? null,
        role: participant.User?.role ?? null
      }))
    };
  });

  return NextResponse.json({ conversations: payload });
}
