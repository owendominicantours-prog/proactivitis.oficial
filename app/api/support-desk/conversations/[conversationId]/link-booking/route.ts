import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  canAccessSupportConversation,
  formatSupportBooking,
  getSupportDeskContext,
  supportBookingSelect
} from "@/lib/supportDesk";
import { buildWorkplaceBookingWhere } from "@/lib/workplaceBookings";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const supportContext = await getSupportDeskContext();
  if (!supportContext) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { conversationId } = await context.params;
  if (!(await canAccessSupportConversation(supportContext, conversationId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const bookingId = String(body.bookingId ?? "").trim();
  if (!bookingId) return NextResponse.json({ error: "bookingId requerido" }, { status: 400 });

  const booking = await prisma.booking.findFirst({
    where: {
      AND: [
        { id: bookingId },
        buildWorkplaceBookingWhere(supportContext.scope)
      ]
    },
    select: supportBookingSelect
  });
  if (!booking) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });

  await prisma.$transaction([
    prisma.conversation.update({
      where: { id: conversationId },
      data: { linkedBookingId: booking.id, updatedAt: new Date() }
    }),
    prisma.message.create({
      data: {
        id: randomUUID(),
        conversationId,
        senderId: supportContext.user.id,
        senderRole: "SYSTEM",
        content: `[[SUPPORT_BOOKING_LINK]]${JSON.stringify({
          bookingId: booking.id,
          bookingCode: booking.bookingCode ?? booking.id,
          service: booking.Tour?.title ?? "Servicio Proactivitis"
        })}`
      }
    })
  ]);

  return NextResponse.json({ booking: formatSupportBooking(booking) });
}
