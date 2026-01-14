"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const requireAdmin = async () => {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
};

export const approveTourReview = async (reviewId: string) => {
  await requireAdmin();
  await prisma.tourReview.update({
    where: { id: reviewId },
    data: { status: "APPROVED", approvedAt: new Date() }
  });
};

export const rejectTourReview = async (reviewId: string) => {
  await requireAdmin();
  await prisma.tourReview.update({
    where: { id: reviewId },
    data: { status: "REJECTED" }
  });
};
