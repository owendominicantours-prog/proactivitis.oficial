"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

const revalidateReviewViews = async (tourId: string) => {
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { slug: true }
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/admin/tours");
  if (tour?.slug) {
    revalidatePath(`/tours/${tour.slug}`);
  }
};

export async function approveTourReview(formData: FormData) {
  const reviewId = formData.get("reviewId");
  if (!reviewId || typeof reviewId !== "string") return;

  const updated = await prisma.tourReview.update({
    where: { id: reviewId },
    data: {
      status: "APPROVED",
      approvedAt: new Date()
    },
    select: { tourId: true }
  });

  await revalidateReviewViews(updated.tourId);
}

export async function rejectTourReview(formData: FormData) {
  const reviewId = formData.get("reviewId");
  if (!reviewId || typeof reviewId !== "string") return;

  const updated = await prisma.tourReview.update({
    where: { id: reviewId },
    data: {
      status: "REJECTED"
    },
    select: { tourId: true }
  });

  await revalidateReviewViews(updated.tourId);
}
