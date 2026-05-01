"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAccess";
import { revalidatePath } from "next/cache";

export async function deleteUserAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = formData.get("userId");
  if (!id || typeof id !== "string") {
    throw new Error("Falta el identificador del usuario.");
  }
  if (id === session.user.id) {
    throw new Error("No puedes eliminar tu propia cuenta admin.");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error("Usuario no encontrado.");
  }
  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new Error("No puedes eliminar el último admin.");
    }
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
  await requireAdminSession();
  const id = formData.get("userId");
  if (!id || typeof id !== "string") {
    throw new Error("Falta el identificador del usuario.");
  }

  await prisma.customerPreference.deleteMany({ where: { userId: id } });

  revalidatePath("/admin/users");
  revalidatePath("/customer");
  revalidatePath("/customer/preferences");
}
