import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LINK_PATTERN = /(https?:\/\/|www\.)/i;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tourId?: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { tourId } = await params;
  if (!tourId) {
    return NextResponse.json({ message: "Missing tour id" }, { status: 400 });
  }

  const body = await request.json();
  const rating = Number(body.rating ?? 0);
  const title = String(body.title ?? "").trim() || null;
  const reviewBody = String(body.body ?? "").trim();

  if (!reviewBody || Number.isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Invalid review data" }, { status: 400 });
  }

  if (LINK_PATTERN.test(reviewBody) || (title && LINK_PATTERN.test(title))) {
    return NextResponse.json({ message: "Links are not allowed" }, { status: 400 });
  }

  const sessionUser = session.user as { id?: string; name?: string; email?: string } | null;
  const booking = await prisma.booking.findFirst({
    where: {
      tourId,
      status: "CONFIRMED",
      OR: [
        sessionUser?.id ? { userId: sessionUser.id } : undefined,
        sessionUser?.email ? { customerEmail: sessionUser.email } : undefined
      ].filter(Boolean) as Record<string, string>[]
    },
    orderBy: { createdAt: "desc" }
  });

  if (!booking) {
    return NextResponse.json({ message: "Booking required" }, { status: 403 });
  }

  const existing = await prisma.tourReview.findUnique({
    where: { bookingId: booking.id }
  });
  if (existing) {
    return NextResponse.json({ message: "Review already submitted" }, { status: 409 });
  }

  await prisma.tourReview.create({
    data: {
      tourId,
      bookingId: booking.id,
      userId: sessionUser?.id ?? null,
      customerName: sessionUser?.name ?? booking.customerName,
      customerEmail: sessionUser?.email ?? booking.customerEmail,
      rating,
      title,
      body: reviewBody,
      status: "PENDING"
    }
  });

  return NextResponse.json({ ok: true });
}
