import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readMobileUserId, withMobileCors } from "@/lib/mobileAuth";

const LINK_PATTERN = /(https?:\/\/|www\.)/i;

const normalizeLocale = (value?: string | null) => {
  const locale = String(value ?? "").trim().toLowerCase();
  return locale === "en" || locale === "fr" ? locale : "es";
};

export function OPTIONS() {
  return withMobileCors(new NextResponse(null, { status: 204 }), "POST, OPTIONS");
}

export async function POST(request: Request) {
  try {
    const userId = readMobileUserId(request);
    if (!userId) {
      return withMobileCors(NextResponse.json({ error: "Sesion requerida." }, { status: 401 }), "POST, OPTIONS");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, accountStatus: true }
    });
    if (!user || user.accountStatus === "DELETED") {
      return withMobileCors(NextResponse.json({ error: "Sesion expirada." }, { status: 401 }), "POST, OPTIONS");
    }

    const body = (await request.json().catch(() => ({}))) as {
      bookingId?: string;
      rating?: number;
      title?: string;
      body?: string;
      locale?: string;
    };
    const bookingId = String(body.bookingId ?? "").trim();
    const rating = Number(body.rating ?? 0);
    const title = String(body.title ?? "").trim() || null;
    const reviewBody = String(body.body ?? "").trim();
    const locale = normalizeLocale(body.locale);

    if (!bookingId) {
      return withMobileCors(NextResponse.json({ error: "Reserva requerida." }, { status: 400 }), "POST, OPTIONS");
    }
    if (!reviewBody || Number.isNaN(rating) || rating < 1 || rating > 5) {
      return withMobileCors(NextResponse.json({ error: "Completa tu resena con una puntuacion de 1 a 5." }, { status: 400 }), "POST, OPTIONS");
    }
    if (LINK_PATTERN.test(reviewBody) || (title && LINK_PATTERN.test(title))) {
      return withMobileCors(NextResponse.json({ error: "No se permiten enlaces en resenas." }, { status: 400 }), "POST, OPTIONS");
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [{ userId: user.id }, { customerEmail: user.email }]
      },
      select: {
        id: true,
        flowType: true,
        userId: true,
        customerName: true,
        customerEmail: true,
        status: true,
        travelDate: true,
        hotel: true,
        pickup: true,
        originAirport: true,
        Tour: { select: { id: true, title: true } }
      }
    });

    if (!booking) {
      return withMobileCors(NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 }), "POST, OPTIONS");
    }

    const finished = booking.status === "COMPLETED" || booking.travelDate.getTime() < Date.now();
    if (!finished) {
      return withMobileCors(NextResponse.json({ error: "Podras dejar tu resena despues de completar la experiencia." }, { status: 400 }), "POST, OPTIONS");
    }

    const customerName = user.name ?? booking.customerName ?? "Cliente Proactivitis";
    const customerEmail = user.email ?? booking.customerEmail;

    if ((booking.flowType ?? "").toLowerCase() === "transfer") {
      const existing = await prisma.transferReview.findUnique({
        where: { bookingId: booking.id },
        select: { id: true }
      });
      if (existing) {
        return withMobileCors(NextResponse.json({ error: "Ya recibimos tu resena para esta reserva." }, { status: 409 }), "POST, OPTIONS");
      }

      await prisma.transferReview.create({
        data: {
          bookingId: booking.id,
          transferServiceLabel: `${booking.originAirport || "Origen"} -> ${booking.hotel || booking.pickup || "Destino"}`,
          userId: booking.userId,
          customerName,
          customerEmail,
          locale,
          rating,
          title,
          body: reviewBody,
          status: "PENDING"
        }
      });

      await prisma.transferReviewReminder.updateMany({
        where: { bookingId: booking.id, stoppedAt: null },
        data: { stoppedAt: new Date(), stopReason: "REVIEW_SUBMITTED" }
      });

      return withMobileCors(NextResponse.json({ ok: true }), "POST, OPTIONS");
    }

    if (!booking.Tour?.id) {
      return withMobileCors(NextResponse.json({ error: "Tour no encontrado." }, { status: 404 }), "POST, OPTIONS");
    }

    const existing = await prisma.tourReview.findFirst({
      where: {
        OR: [
          { bookingId: booking.id },
          { tourId: booking.Tour.id, customerEmail }
        ]
      },
      select: { id: true }
    });
    if (existing) {
      return withMobileCors(NextResponse.json({ error: "Ya recibimos tu resena para este tour." }, { status: 409 }), "POST, OPTIONS");
    }

    await prisma.tourReview.create({
      data: {
        tourId: booking.Tour.id,
        bookingId: booking.id,
        userId: booking.userId,
        customerName,
        customerEmail,
        locale,
        rating,
        title,
        body: reviewBody,
        status: "PENDING"
      }
    });

    return withMobileCors(NextResponse.json({ ok: true }), "POST, OPTIONS");
  } catch {
    return withMobileCors(NextResponse.json({ error: "No se pudo enviar tu resena." }, { status: 500 }), "POST, OPTIONS");
  }
}
