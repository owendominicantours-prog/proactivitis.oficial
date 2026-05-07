"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { recordWorkplaceAuditLog, requireWorkplaceContext } from "@/lib/workplace";

const sanitize = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

export async function updateWorkplaceProfileAction(formData: FormData) {
  const context = await requireWorkplaceContext();
  if (!context.employee) {
    return;
  }

  const avatarUrl = sanitize(formData.get("avatarUrl"));
  await prisma.workplaceEmployee.update({
    where: { id: context.employee.id },
    data: { avatarUrl: avatarUrl || null }
  });

  await recordWorkplaceAuditLog({
    actorUserId: context.user.id,
    employeeId: context.employee.id,
    actionKey: "workplace.profile.update",
    moduleKey: "chat",
    resourceType: "employee",
    resourceId: context.employee.id,
    afterData: { avatarUrl: Boolean(avatarUrl) }
  });

  revalidatePath("/workplace/profile");
  revalidatePath("/workplace/chat");
}
