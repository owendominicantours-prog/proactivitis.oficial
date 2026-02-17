import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LINK_PATTERN = /(https?:\/\/|www\.)/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export async function POST(request: Request) {
  const body = await request.json();
  const bookingId = String(body.bookingId ?? "").trim();
  const rating = Number(body.rating ?? 0);
  const title = String(body.title ?? "").trim() || null;
  const reviewBody = String(body.body ?? "").trim();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const rawLocale = String(body.locale ?? "").trim().toLowerCase();
  const locale = rawLocale === "en" || rawLocale === "fr" ? rawLocale : "es";

  if (!bookingId) {
    return NextResponse.json({ message: "Missing booking id" }, { status: 400 });
  }

  if (!reviewBody || Number.isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Invalid review data" }, { status: 400 });
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ message: "Email required" }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ message: "Name required" }, { status: 400 });
  }

  if (LINK_PATTERN.test(reviewBody) || (title && LINK_PATTERN.test(title))) {
    return NextResponse.json({ message: "Links are not allowed" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, flowType: true, customerEmail: true, customerName: true, userId: true }
  });
  if (!booking) {
    return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  }

  if ((booking.flowType ?? "").toLowerCase() !== "transfer") {
    return NextResponse.json({ message: "Booking is not a transfer" }, { status: 400 });
  }

  if (booking.customerEmail.trim().toLowerCase() !== email) {
    return NextResponse.json({ message: "Email does not match booking" }, { status: 403 });
  }

  const existing = await prisma.transferReview.findUnique({
    where: { bookingId: booking.id },
    select: { id: true }
  });
  if (existing) {
    return NextResponse.json({ message: "Review already submitted" }, { status: 409 });
  }

  await prisma.transferReview.create({
    data: {
      bookingId: booking.id,
      userId: booking.userId,
      customerName: name || booking.customerName,
      customerEmail: email,
      locale,
      rating,
      title,
      body: reviewBody,
      status: "PENDING"
    }
  });

  await prisma.transferReviewReminder.updateMany({
    where: { bookingId: booking.id, stoppedAt: null },
    data: {
      stoppedAt: new Date(),
      stopReason: "REVIEW_SUBMITTED"
    }
  });

  return NextResponse.json({ ok: true });
}
