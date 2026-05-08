"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAccess";
import { calculateGroupOpportunityAccounting } from "@/lib/prodiscoveryGroupOpportunity";

const readString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const readNumber = (formData: FormData, key: string) => {
  const value = Number(readString(formData, key));
  return Number.isFinite(value) && value >= 0 ? value : null;
};

export async function updateProDiscoveryOpportunityAction(formData: FormData) {
  await requireAdminSession();

  const id = readString(formData, "opportunityId");
  if (!id) throw new Error("Falta la oportunidad.");

  const opportunity = await prisma.proDiscoveryGroupOpportunity.findUnique({ where: { id } });
  if (!opportunity) throw new Error("Oportunidad no encontrada.");

  const status = readString(formData, "status") || opportunity.status;
  const acceptedBudget = readNumber(formData, "acceptedBudget");
  const depositPercent = readNumber(formData, "depositPercent") ?? opportunity.depositPercent;
  const leaderCommissionPercent =
    readNumber(formData, "leaderCommissionPercent") ?? opportunity.leaderCommissionPercent ?? 10;
  const leaderGuideId = readString(formData, "leaderGuideId") || null;
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
        include: { User: { select: { name: true, email: true } } }
      })
    : null;

  await prisma.proDiscoveryGroupOpportunity.update({
    where: { id },
    data: {
      status,
      acceptedBudget,
      depositPercent,
      depositAmount: accounting.depositAmount,
      leaderGuideId,
      leaderGuideName: guide?.company ?? null,
      leaderGuideEmail: guide?.User.email ?? null,
      leaderCommissionPercent,
      leaderCommissionAmount: accounting.leaderCommissionAmount
    }
  });

  revalidatePath("/admin/prodiscovery-opportunities");
}
