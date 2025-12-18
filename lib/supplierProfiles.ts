import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function ensureSupplierProfile(userId: string, companyName?: string) {
  const existing = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (existing) {
    await prisma.supplierProfile.update({
      where: { userId },
      data: { company: companyName || existing.company, approved: true }
    });
    return existing;
  }
  return prisma.supplierProfile.create({
    data: {
      id: randomUUID(),
      userId,
      company: companyName || "Proveedor",
      approved: true
    }
  });
}
