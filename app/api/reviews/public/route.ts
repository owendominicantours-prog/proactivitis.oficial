import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LINK_PATTERN = /(https?:\/\/|www\.)/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

type ReviewType = "tour" | "transfer";

export async function POST(request: Request) {
  const body = await request.json();
  const reviewType = String(body.reviewType ?? "").trim().toLowerCase() as ReviewType;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const rawLocale = String(body.locale ?? "").trim().toLowerCase();
  const locale = rawLocale === "en" || rawLocale === "fr" ? rawLocale : "es";

  if (reviewType !== "tour" && reviewType !== "transfer") {
    return NextResponse.json({ message: "Tipo de servicio invalido" }, { status: 400 });
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ message: "Correo invalido" }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ message: "Nombre requerido" }, { status: 400 });
  }

  if (reviewType === "tour") {
    const tourReviewsInput = Array.isArray(body.tourReviews)
      ? body.tourReviews
      : [
          {
            tourId: body.tourId,
            rating: body.rating,
            title: body.title,
            body: body.body
          }
        ];

    const tourReviews = tourReviewsInput
      .map((item: unknown) => {
        const current = (item ?? {}) as Record<string, unknown>;
        const tourId = String(current.tourId ?? "").trim();
        const rating = Number(current.rating ?? 0);
        const title = String(current.title ?? "").trim() || null;
        const reviewBody = String(current.body ?? "").trim();
        return { tourId, rating, title, body: reviewBody };
      })
      .filter((item: { tourId: string; body: string }) => Boolean(item.tourId || item.body));

    if (!tourReviews.length) {
      return NextResponse.json({ message: "Debes enviar al menos una reseña de tour" }, { status: 400 });
    }

    if (tourReviews.length > 2) {
      return NextResponse.json({ message: "Puedes enviar hasta 2 reseñas por vez" }, { status: 400 });
    }

    const uniqueTourIds = new Set<string>();
    for (const review of tourReviews) {
      if (!review.body || Number.isNaN(review.rating) || review.rating < 1 || review.rating > 5) {
        return NextResponse.json({ message: "Reseña de tour inválida" }, { status: 400 });
      }
      if (!review.tourId) {
        return NextResponse.json({ message: "Tour requerido en cada reseña" }, { status: 400 });
      }
      if (LINK_PATTERN.test(review.body) || (review.title && LINK_PATTERN.test(review.title))) {
        return NextResponse.json({ message: "No se permiten enlaces" }, { status: 400 });
      }
      if (uniqueTourIds.has(review.tourId)) {
        return NextResponse.json({ message: "No puedes repetir el mismo tour en este envío" }, { status: 400 });
      }
      uniqueTourIds.add(review.tourId);
    }

    const existingTours = await prisma.tour.findMany({
      where: { id: { in: Array.from(uniqueTourIds) } },
      select: { id: true }
    });
    if (existingTours.length !== uniqueTourIds.size) {
      return NextResponse.json({ message: "Uno de los tours seleccionados no existe" }, { status: 404 });
    }

    const existingReviews = await prisma.tourReview.findMany({
      where: { customerEmail: email, tourId: { in: Array.from(uniqueTourIds) } },
      select: { tourId: true }
    });
    const existingSet = new Set(existingReviews.map((item) => item.tourId));

    const createPayload = tourReviews
      .filter((item: { tourId: string }) => !existingSet.has(item.tourId))
      .map((item: { tourId: string; rating: number; title: string | null; body: string }) => ({
        tourId: item.tourId,
        userId: null,
        customerName: name,
        customerEmail: email,
        locale,
        rating: item.rating,
        title: item.title,
        body: item.body,
        status: "PENDING"
      }));

    if (!createPayload.length) {
      return NextResponse.json({ message: "Ya tenemos reseñas tuyas para esos tours" }, { status: 409 });
    }

    await prisma.tourReview.createMany({ data: createPayload });

    return NextResponse.json({
      ok: true,
      created: createPayload.length,
      skipped: existingSet.size
    });
  }

  const rating = Number(body.rating ?? 0);
  const title = String(body.title ?? "").trim() || null;
  const reviewBody = String(body.body ?? "").trim();

  if (!reviewBody || Number.isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Resena invalida" }, { status: 400 });
  }
  if (LINK_PATTERN.test(reviewBody) || (title && LINK_PATTERN.test(title))) {
    return NextResponse.json({ message: "No se permiten enlaces" }, { status: 400 });
  }

  const transferLandingSlug = String(body.transferLandingSlug ?? "").trim();
  const transferServiceLabel = String(body.transferServiceLabel ?? "").trim() || null;
  if (!transferLandingSlug) {
    return NextResponse.json({ message: "Ruta de transfer requerida" }, { status: 400 });
  }

  const existing = await prisma.transferReview.findFirst({
    where: { transferLandingSlug, customerEmail: email },
    select: { id: true }
  });
  if (existing) {
    return NextResponse.json({ message: "Ya tenemos una resena tuya para este transfer" }, { status: 409 });
  }

  await prisma.transferReview.create({
    data: {
      bookingId: null,
      transferLandingSlug,
      transferServiceLabel,
      userId: null,
      customerName: name,
      customerEmail: email,
      locale,
      rating,
      title,
      body: reviewBody,
      status: "PENDING"
    }
  });

  return NextResponse.json({ ok: true });
}
