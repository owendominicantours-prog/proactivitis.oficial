"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureAgencyProfile } from "@/lib/agencyProfiles";

async function setAgencyApproval(userId: string, approved: boolean, companyName?: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      agencyApproved: approved,
      accountStatus: approved ? "APPROVED" : "REJECTED",
      statusMessage: approved
        ? "Tu cuenta de agencia ha sido aprobada."
        : "Tu cuenta de agencia fue marcada como rechazada."
    }
  });

  if (approved) {
    await ensureAgencyProfile(userId, companyName ?? "Agencia");
  } else {
    await prisma.agencyProfile.updateMany({
      where: { userId },
      data: { approved: false }
    });
  }

  await prisma.partnerApplication.updateMany({
    where: {
      userId,
      role: "AGENCY"
    },
    data: {
      status: approved ? "APPROVED" : "REJECTED"
    }
  });
}

const revalidateAgencyPaths = (referenceId: string, userId: string) => {
  revalidatePath("/admin/agencies");
  revalidatePath(`/admin/agencies/${referenceId}`);
  if (referenceId !== userId) {
    revalidatePath(`/admin/agencies/${userId}`);
  }
  revalidatePath("/admin/partner-applications");
};

export async function approveAgency(formData: FormData) {
  const userId = formData.get("userId");
  const companyName = formData.get("companyName");
  const profileId = formData.get("agencyId");

  const targetUserId =
    typeof userId === "string" && userId
      ? userId
      : typeof profileId === "string" && profileId
        ? (await prisma.agencyProfile.findUnique({ where: { id: profileId }, select: { userId: true } }))?.userId
        : null;

  if (!targetUserId) return;

  await setAgencyApproval(targetUserId, true, typeof companyName === "string" ? companyName : undefined);
  revalidateAgencyPaths(typeof profileId === "string" && profileId ? profileId : targetUserId, targetUserId);
}

export async function rejectAgency(formData: FormData) {
  const userId = formData.get("userId");
  const profileId = formData.get("agencyId");

  const targetUserId =
    typeof userId === "string" && userId
      ? userId
      : typeof profileId === "string" && profileId
        ? (await prisma.agencyProfile.findUnique({ where: { id: profileId }, select: { userId: true } }))?.userId
        : null;

  if (!targetUserId) return;

  await setAgencyApproval(targetUserId, false);
  revalidateAgencyPaths(typeof profileId === "string" && profileId ? profileId : targetUserId, targetUserId);
}
