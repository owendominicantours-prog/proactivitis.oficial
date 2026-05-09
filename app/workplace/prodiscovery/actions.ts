"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { calculateGroupOpportunityAccounting } from "@/lib/prodiscoveryGroupOpportunity";
import { recordWorkplaceAuditLog, requireWorkplaceContext } from "@/lib/workplace";

const allowedStatuses = new Set(["NEW", "REVIEWING", "QUOTED", "ACCEPTED", "PAYMENT_STARTED", "WON", "LOST"]);

const readString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const readNumber = (formData: FormData, key: string) => {
  const value = readString(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export async function updateWorkplaceProDiscoveryOpportunityAction(formData: FormData) {
  const context = await requireWorkplaceContext("prodiscovery.manage");
  const canFinance = context.isAdmin || context.permissions.has("prodiscovery.finance");

  const id = readString(formData, "opportunityId");
  if (!id) throw new Error("Falta la solicitud ProDiscovery.");

  const opportunity = await prisma.proDiscoveryGroupOpportunity.findUnique({ where: { id } });
  if (!opportunity) throw new Error("Solicitud ProDiscovery no encontrada.");

  const requestedStatus = readString(formData, "status");
  const status = allowedStatuses.has(requestedStatus) ? requestedStatus : opportunity.status;
  const acceptedBudget = canFinance ? readNumber(formData, "acceptedBudget") : opportunity.acceptedBudget;
  const depositPercent = canFinance ? readNumber(formData, "depositPercent") ?? opportunity.depositPercent : opportunity.depositPercent;
  const leaderCommissionPercent = canFinance
    ? readNumber(formData, "leaderCommissionPercent") ?? opportunity.leaderCommissionPercent ?? 10
    : opportunity.leaderCommissionPercent;
  const leaderGuideId = readString(formData, "leaderGuideId") || null;
  const assignedToEmployeeId = readString(formData, "assignedToEmployeeId") || null;
  const itinerarySummary = readString(formData, "itinerarySummary") || opportunity.itinerarySummary;

  const accounting = calculateGroupOpportunityAccounting({
    groupSize: opportunity.groupSize,
    budgetTier: opportunity.budgetTier,
    acceptedBudget: acceptedBudget ?? opportunity.acceptedBudget ?? opportunity.estimatedBudget,
    depositPercent,
    leaderCommissionPercent
  });

  const guide = leaderGuideId
    ? await prisma.supplierProfile.findUnique({
        where: { id: leaderGuideId },
        include: { User: { select: { email: true } } }
      })
    : null;

  const beforeData = {
    status: opportunity.status,
    acceptedBudget: opportunity.acceptedBudget,
    depositPercent: opportunity.depositPercent,
    depositAmount: opportunity.depositAmount,
    leaderGuideId: opportunity.leaderGuideId,
    assignedToEmployeeId: opportunity.assignedToEmployeeId
  };

  const updated = await prisma.proDiscoveryGroupOpportunity.update({
    where: { id },
    data: {
      status,
      acceptedBudget,
      depositPercent,
      depositAmount: canFinance ? accounting.depositAmount : opportunity.depositAmount,
      leaderGuideId,
      leaderGuideName: guide?.company ?? null,
      leaderGuideEmail: guide?.User.email ?? null,
      leaderCommissionPercent,
      leaderCommissionAmount: canFinance ? accounting.leaderCommissionAmount : opportunity.leaderCommissionAmount,
      assignedToEmployeeId,
      itinerarySummary
    }
  });

  await recordWorkplaceAuditLog({
    actorUserId: context.user.id,
    employeeId: context.employee?.id ?? null,
    actionKey: "prodiscovery.update",
    moduleKey: "prodiscovery",
    resourceType: "ProDiscoveryGroupOpportunity",
    resourceId: id,
    beforeData,
    afterData: {
      status: updated.status,
      acceptedBudget: updated.acceptedBudget,
      depositPercent: updated.depositPercent,
      depositAmount: updated.depositAmount,
      leaderGuideId: updated.leaderGuideId,
      assignedToEmployeeId: updated.assignedToEmployeeId
    }
  });

  revalidatePath("/workplace/prodiscovery");
  revalidatePath("/dashboard/customer");
  revalidatePath("/admin/prodiscovery-opportunities");
}
