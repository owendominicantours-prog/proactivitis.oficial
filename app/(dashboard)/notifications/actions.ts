"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { buildBookingDetailRoute } from "@/lib/bookingRoutes";
import {
  markNotificationReadForRecipient,
  parseNotificationMetadata
} from "@/lib/notificationService";
import { NotificationRole } from "@/lib/types/notificationTypes";

const buildNotificationCenterRoute = (role?: string | null) => {
  const normalizedRole = (role ?? "").toUpperCase();
  if (normalizedRole === "ADMIN") return "/admin/notifications";
  if (normalizedRole === "SUPPLIER") return "/supplier/notifications";
  if (normalizedRole === "AGENCY") return "/agency/notifications";
  if (normalizedRole === "CUSTOMER") return "/customer";
  return "/";
};

export async function markNotificationReadAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Debes iniciar sesión para gestionar notificaciones.");
  }

  const notificationId = formData.get("notificationId");
  if (!notificationId || typeof notificationId !== "string") {
    throw new Error("Selecciona una notificación válida.");
  }

  const notification = await markNotificationReadForRecipient(notificationId, {
    role: session.user.role as NotificationRole | undefined,
    userId: session.user.id
  });

  if (!notification) {
    throw new Error("No tienes acceso a esta notificación.");
  }

  const redirectTo = formData.get("redirectTo");
  if (
    redirectTo &&
    typeof redirectTo === "string" &&
    redirectTo.trim() &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
  ) {
    redirect(redirectTo);
  }

  const metadata = parseNotificationMetadata(notification.metadata);
  const fallback = buildNotificationCenterRoute(session.user.role);
  const bookingRoute = buildBookingDetailRoute({
    bookingId: metadata.bookingId ?? notification.bookingId ?? null,
    metadataRole: metadata.role ?? notification.role,
    fallback
  });

  redirect(bookingRoute);
}
