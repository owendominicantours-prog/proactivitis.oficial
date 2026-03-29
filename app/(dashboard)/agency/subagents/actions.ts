"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteAgencyProLink(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "AGENCY") {
    throw new Error("No autorizado.");
  }

  const linkId = formData.get("linkId");
  if (!linkId || typeof linkId !== "string") {
    throw new Error("Falta el enlace.");
  }

  await prisma.agencyProLink.deleteMany({
    where: {
      id: linkId,
      agencyUserId: session.user.id
    }
  });

  revalidatePath("/agency/subagents");
  revalidatePath("/agency/tours");
}

export async function deleteAgencyTransferLink(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "AGENCY") {
    throw new Error("No autorizado.");
  }

  const linkId = formData.get("linkId");
  if (!linkId || typeof linkId !== "string") {
    throw new Error("Falta el enlace.");
  }

  await prisma.agencyTransferLink.deleteMany({
    where: {
      id: linkId,
      agencyUserId: session.user.id
    }
  });

  revalidatePath("/agency/subagents");
  revalidatePath("/agency/transfers");
}
