"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const updateAgencyApproval = async (formData: FormData, approved: boolean) => {
  const id = formData.get("agencyId");
  if (!id || typeof id !== "string") return;
  await prisma.agencyProfile.update({
    where: { id },
    data: { approved }
  });
  revalidatePath(`/admin/agencies/${id}`);
};

export async function approveAgency(formData: FormData) {
  await updateAgencyApproval(formData, true);
}

export async function rejectAgency(formData: FormData) {
  await updateAgencyApproval(formData, false);
}
