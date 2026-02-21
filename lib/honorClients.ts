import { prisma } from "@/lib/prisma";

export async function getActiveHonorClients() {
  try {
    return await prisma.honorClient.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "desc" }]
    });
  } catch (error: any) {
    if (error?.code === "P2021") {
      console.warn("[honor-clients] Missing HonorClient table. Returning empty list.");
      return [];
    }
    throw error;
  }
}
