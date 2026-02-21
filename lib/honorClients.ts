import { prisma } from "@/lib/prisma";

export async function getActiveHonorClients() {
  return prisma.honorClient.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: "desc" }]
  });
}
