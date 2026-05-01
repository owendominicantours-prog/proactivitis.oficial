"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/adminAccess";
import { prisma } from "@/lib/prisma";

const requireAdmin = async () => {
  await requireAdminSession("Unauthorized");
};

const refreshReviews = () => {
  revalidatePath("/admin/reviews");
  revalidatePath("/tours");
  revalidatePath("/transfer");
};

export const approveTourReview = async (reviewId: string) => {
  await requireAdmin();
  await prisma.tourReview.update({
    where: { id: reviewId },
    data: { status: "APPROVED", approvedAt: new Date() }
  });
  refreshReviews();
};

export const rejectTourReview = async (reviewId: string) => {
  await requireAdmin();
  await prisma.tourReview.update({
    where: { id: reviewId },
    data: { status: "REJECTED" }
  });
  refreshReviews();
};

export const deleteTourReview = async (reviewId: string) => {
  await requireAdmin();
  await prisma.tourReview.delete({
    where: { id: reviewId }
  });
  refreshReviews();
};

export const approveTransferReview = async (reviewId: string) => {
  await requireAdmin();
  await prisma.transferReview.update({
    where: { id: reviewId },
    data: { status: "APPROVED", approvedAt: new Date() }
  });
  refreshReviews();
};

export const rejectTransferReview = async (reviewId: string) => {
  await requireAdmin();
  await prisma.transferReview.update({
    where: { id: reviewId },
    data: { status: "REJECTED" }
  });
  refreshReviews();
};

export const deleteTransferReview = async (reviewId: string) => {
  await requireAdmin();
  await prisma.transferReview.delete({
    where: { id: reviewId }
  });
  refreshReviews();
};
