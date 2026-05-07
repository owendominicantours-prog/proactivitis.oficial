"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { recordWorkplaceAuditLog, requireWorkplaceContext } from "@/lib/workplace";

const toJson = (value: unknown) => value as Prisma.InputJsonValue;
const sanitize = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

export async function requestSupplierDisableApprovalAction(formData: FormData) {
  const supplierId = sanitize(formData.get("supplierId"));
  if (!supplierId) throw new Error("Suplidor invalido.");
  const context = await requireWorkplaceContext("suppliers.view");
  const supplier = await prisma.supplierProfile.findUnique({
    where: { id: supplierId },
    select: { id: true, company: true, userId: true }
  });
  if (!supplier) throw new Error("Suplidor no encontrado.");

  const existing = await prisma.workplaceApprovalRequest.findFirst({
    where: {
      employeeId: context.employee?.id ?? undefined,
      actionKey: "suppliers.disable",
      resourceType: "supplier",
      resourceId: supplier.id,
      status: "PENDING"
    },
    select: { id: true }
  });

  if (!existing) {
    await prisma.workplaceApprovalRequest.create({
      data: {
        employeeId: context.employee?.id ?? null,
        requestedById: context.user.id,
        actionKey: "suppliers.disable",
        moduleKey: "suppliers",
        resourceType: "supplier",
        resourceId: supplier.id,
        title: `Desactivar suplidor: ${supplier.company}`,
        description: "Esta accion requiere aprobacion de un administrador.",
        payload: toJson({ supplierId: supplier.id, company: supplier.company })
      }
    });
  }

  await recordWorkplaceAuditLog({
    actorUserId: context.user.id,
    employeeId: context.employee?.id ?? null,
    actionKey: "workplace.supplier.disable_requested",
    moduleKey: "suppliers",
    resourceType: "supplier",
    resourceId: supplier.id,
    metadata: { company: supplier.company }
  });

  revalidatePath("/workplace/suppliers");
  redirect("/workplace/suppliers?approval=sent");
}
