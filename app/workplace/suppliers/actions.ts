"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { recordWorkplaceAuditLog, requireWorkplaceContext } from "@/lib/workplace";
import { containsInsensitive, isGlobalScope, uniqueScopeItems } from "@/lib/workplaceFilters";
import { buildWorkplaceTourWhere } from "@/lib/workplaceTours";

const toJson = (value: unknown) => value as Prisma.InputJsonValue;
const sanitize = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

export async function requestSupplierDisableApprovalAction(formData: FormData) {
  const supplierId = sanitize(formData.get("supplierId"));
  if (!supplierId) throw new Error("Suplidor invalido.");
  const context = await requireWorkplaceContext("suppliers.view");

  const and: Prisma.SupplierProfileWhereInput[] = [{ id: supplierId }];
  if (!context.isAdmin) {
    const companyTerms = uniqueScopeItems(context.scope.companies);
    if (!isGlobalScope(companyTerms)) {
      and.push({ OR: companyTerms.map((term) => ({ company: containsInsensitive(term) })) });
    }
    and.push({
      Tour: {
        some: buildWorkplaceTourWhere({
          ...context.scope,
          niches: context.scope.niches.length ? context.scope.niches : ["tours"],
          modules: context.scope.modules.length ? context.scope.modules : ["tours"]
        })
      }
    });
  }

  const supplier = await prisma.supplierProfile.findFirst({
    where: { AND: and },
    select: { id: true, company: true, userId: true }
  });
  if (!supplier) throw new Error("Suplidor no encontrado o fuera de tu alcance.");

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
