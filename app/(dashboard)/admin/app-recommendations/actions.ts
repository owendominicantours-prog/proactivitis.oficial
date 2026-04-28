"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const requireAdmin = async () => {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }
};

export async function updateAppRecommendationsAction(formData: FormData) {
  await requireAdmin();

  const selectedTourIds = formData
    .getAll("tourId")
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  await prisma.$transaction([
    prisma.tour.updateMany({
      data: {
        featured: false
      }
    }),
    selectedTourIds.length
      ? prisma.tour.updateMany({
          where: {
            id: {
              in: selectedTourIds
            }
          },
          data: {
            featured: true
          }
        })
      : prisma.tour.updateMany({
          where: {
            id: {
              in: []
            }
          },
          data: {
            featured: true
          }
        })
  ]);

  revalidatePath("/admin/app-recommendations");
  revalidatePath("/admin/tours");
  revalidatePath("/api/mobile/tours");
  redirect("/admin/app-recommendations?saved=1");
}
