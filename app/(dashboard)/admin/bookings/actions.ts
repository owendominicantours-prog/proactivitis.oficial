"use server";

import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notificationService";

const sanitize = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function addAdminBookingNote(formData: FormData) {
  const bookingId = sanitize(formData.get("bookingId"));
  const note = sanitize(formData.get("note"));
  const author = sanitize(formData.get("author")) || "Admin";

  if (!bookingId) {
    throw new Error("Reserva inválida.");
  }
  if (!note) {
    throw new Error("La nota no puede estar vacía.");
  }

  await createNotification({
    type: "ADMIN_BOOKING_NOTE",
    role: "ADMIN",
    title: "Nota interna",
    message: note,
    metadata: {
      bookingId,
      author
    }
  });

  revalidatePath("/admin/bookings");
}
