"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteUserAction(formData: FormData) {
  const id = formData.get("userId");
  if (!id || typeof id !== "string") {
    throw new Error("Falta el identificador del usuario.");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.supplierProfile.deleteMany({ where: { userId: id } });
    await tx.agencyProfile.deleteMany({ where: { userId: id } });
    await tx.partnerApplication.deleteMany({ where: { userId: id } });
    await tx.notification.deleteMany({ where: { metadata: { contains: `"userId":"${id}"` } } });
    await tx.user.delete({ where: { id } });
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/partner-applications");
  revalidatePath("/dashboard/supplier");
  revalidatePath("/dashboard/agency");
}

export async function resetUserPreferencesAction(formData: FormData) {
  const id = formData.get("userId");
  if (!id || typeof id !== "string") {
    throw new Error("Falta el identificador del usuario.");
  }

  await prisma.customerPreference.deleteMany({ where: { userId: id } });

  revalidatePath("/admin/users");
  revalidatePath("/customer");
  revalidatePath("/customer/preferences");
}
