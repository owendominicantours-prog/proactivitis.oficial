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
  const bookingId = body.bookingId as string | undefined;
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId requerido" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tour: {
        include: {
          supplier: {
            include: {
              user: true
            }
          }
        }
      },
      user: true
    }
  });

  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const customerId = booking.userId;
  const supplierUserId = booking.tour?.supplier?.userId;
  if (!supplierUserId) {
    return NextResponse.json({ error: "Proveedor sin cuenta" }, { status: 500 });
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      type: "RESERVATION",
      reservationId: booking.id
    }
  });

  if (existing) {
    return NextResponse.json({ conversation: existing });
  }

  const participants = Array.from(new Set([customerId, supplierUserId]));

  const conversation = await prisma.conversation.create({
    data: {
      type: "RESERVATION",
      reservationId: booking.id,
      createdById: session.user.id,
      participants: {
        create: participants.map((userId) => ({
          userId
        }))
      }
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, role: true } } }
      }
    }
  });

  return NextResponse.json({ conversation });
}
