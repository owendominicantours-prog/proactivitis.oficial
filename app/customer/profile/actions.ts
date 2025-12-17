"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function ensureCustomerPayment(userId: string, values: { method?: string; brand?: string; last4?: string }) {
  await prisma.customerPayment.upsert({
    where: { userId },
    update: {
      method: values.method ?? undefined,
      brand: values.brand ?? undefined,
      last4: values.last4 ?? undefined
    },
    create: {
      userId,
      method: values.method ?? "",
      brand: values.brand ?? "",
      last4: values.last4 ?? ""
    }
  });
}

export async function updateCustomerPaymentAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("No autorizado.");
  }
  const method = (formData.get("method") as string | null)?.trim() ?? "";
  const brand = (formData.get("brand") as string | null)?.trim() ?? "";
  const last4 = (formData.get("last4") as string | null)?.trim() ?? "";
  if (last4 && !/^[0-9]{4}$/.test(last4)) {
    throw new Error("Los últimos 4 dígitos deben ser numéricos.");
  }
  await ensureCustomerPayment(session.user.id, { method, brand, last4 });
}
