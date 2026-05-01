"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/adminAccess";
import { createNotification } from "@/lib/notificationService";
import { prisma } from "@/lib/prisma";

const sanitize = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function addAdminBookingNote(formData: FormData) {
  await requireAdminSession();

  const bookingId = sanitize(formData.get("bookingId"));
  const note = sanitize(formData.get("note")).slice(0, 800);
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

const parseOptionalDate = (value: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export async function updateAdminTransferLogistics(formData: FormData) {
  await requireAdminSession();

  const bookingId = sanitize(formData.get("bookingId"));
  const pickup = sanitize(formData.get("pickup"));
  const hotel = sanitize(formData.get("hotel"));
  const originAirport = sanitize(formData.get("originAirport"));
  const flightNumber = sanitize(formData.get("flightNumber"));
  const pickupNotes = sanitize(formData.get("pickupNotes"));
  const startTime = sanitize(formData.get("startTime"));
  const returnTravelDate = parseOptionalDate(sanitize(formData.get("returnTravelDate")));
  const returnStartTime = sanitize(formData.get("returnStartTime"));

  if (!bookingId) {
    throw new Error("Reserva inválida.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      bookingCode: true,
      flowType: true,
      tripType: true
    }
  });

  if (!booking || booking.flowType !== "transfer") {
    throw new Error("Solo se puede editar logística de reservas de traslado.");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      pickup: pickup || null,
      hotel: hotel || null,
      originAirport: originAirport || null,
      flightNumber: flightNumber || null,
      pickupNotes: pickupNotes || null,
      startTime: startTime || null,
      returnTravelDate: booking.tripType === "round-trip" ? returnTravelDate : null,
      returnStartTime: booking.tripType === "round-trip" ? returnStartTime || null : null
    }
  });

  await createNotification({
    type: "ADMIN_BOOKING_MODIFIED",
    role: "ADMIN",
    title: "Logística actualizada",
    message: `Se actualizó la logística de la reserva ${booking.bookingCode ?? booking.id}.`,
    metadata: {
      bookingId,
      status: "CONFIRMED",
      author: "Admin",
      scope: "transfer-logistics"
    }
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/supplier/bookings");
  revalidatePath("/agency/bookings");
  revalidatePath("/dashboard/customer");
}
