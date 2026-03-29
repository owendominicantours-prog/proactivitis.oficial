import { prisma } from "@/lib/prisma";

export async function ensureAgencyProfile(userId: string, companyName: string) {
  const cleanCompany = companyName?.trim() || "Agencia";
  return prisma.agencyProfile.upsert({
    where: { userId },
    create: {
      id: userId,
      userId,
      companyName: cleanCompany,
      approved: true,
      commissionPercent: 20
    },
    update: {
      companyName: cleanCompany,
      approved: true
    }
  });
}
