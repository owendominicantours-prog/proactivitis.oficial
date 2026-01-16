import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LINK_PATTERN = /(https?:\/\/|www\.)/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tourId?: string }> }
) {
  const { tourId } = await params;
  if (!tourId) {
    return NextResponse.json({ message: "Missing tour id" }, { status: 400 });
  }

  const body = await request.json();
  const rating = Number(body.rating ?? 0);
  const title = String(body.title ?? "").trim() || null;
  const reviewBody = String(body.body ?? "").trim();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();

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

  const existing = await prisma.tourReview.findFirst({
    where: { tourId, customerEmail: email }
  });
  if (existing) {
    return NextResponse.json({ message: "Review already submitted" }, { status: 409 });
  }

  await prisma.tourReview.create({
    data: {
      tourId,
      userId: null,
      customerName: name,
      customerEmail: email,
      rating,
      title,
      body: reviewBody,
      status: "PENDING"
    }
  });

  return NextResponse.json({ ok: true });
}
