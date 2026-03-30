"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { markNotificationReadForRecipient } from "@/lib/notificationService";

export async function markNotificationReadAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN" || !session.user.id) {
    throw new Error("Solo admin puede gestionar estas notificaciones.");
  }

  const notificationId = formData.get("notificationId");
  if (!notificationId || typeof notificationId !== "string") {
    throw new Error("Selecciona una notificación válida.");
  }

  const notification = await markNotificationReadForRecipient(notificationId, {
    role: "ADMIN",
    userId: session.user.id
  });

  if (!notification) {
    throw new Error("La notificación no está disponible para tu cuenta.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/notifications");
  revalidatePath("/admin/crm");
}
