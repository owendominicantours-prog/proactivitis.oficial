"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitized } from "@/lib/supplierTours";

const PROFILE_LIMITS = {
  company: 100,
  name: 80
};

function cleanProfileText(value: FormDataEntryValue | null, limit: number) {
  return sanitized(value).slice(0, limit);
}

export async function updateSupplierProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Es necesario iniciar sesión para actualizar el perfil.");
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!supplier) {
    throw new Error("No se encontró un perfil de proveedor asociado.");
  }

  const updatedCompany = cleanProfileText(formData.get("company"), PROFILE_LIMITS.company);
  const updatedName = cleanProfileText(formData.get("name"), PROFILE_LIMITS.name);

  if (updatedCompany && updatedCompany.length < 2) {
    throw new Error("El nombre comercial debe tener al menos 2 caracteres.");
  }
  if (updatedName && updatedName.length < 2) {
    throw new Error("El nombre de contacto debe tener al menos 2 caracteres.");
  }

  await prisma.$transaction(async (tx) => {
    if (updatedCompany) {
      await tx.supplierProfile.update({
        where: { id: supplier.id },
        data: { company: updatedCompany }
      });
    }
    if (updatedName) {
      await tx.user.update({
        where: { id: userId },
        data: { name: updatedName }
      });
    }
  });

  revalidatePath("/supplier/profile");
  revalidatePath("/supplier");
}
