"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notificationService";
import { BookingSourceEnum, BookingStatus, BookingStatusEnum } from "@/lib/types/booking";

const allowedStatuses = [
  BookingStatusEnum.CONFIRMED,
  BookingStatusEnum.CANCELLATION_REQUESTED,
  BookingStatusEnum.CANCELLED,
  BookingStatusEnum.COMPLETED
] as const;

type AllowedBookingStatus = (typeof allowedStatuses)[number];

const formatDateLabel = (value?: Date | null) => {
  if (!value) return "fecha desconocida";
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long"
  }).format(value);
};

const buildBookingSummary = (title: string, travelDate: Date, pax: number) =>
  `${title} - ${pax} pax - ${formatDateLabel(travelDate)}`;

const notifyModification = async (bookingId: string, status: BookingStatus) => {
  const current = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Tour: {
        include: {
          SupplierProfile: {
            include: {
              User: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!current || !current.Tour) {
    return;
  }

  const summary = buildBookingSummary(
    current.Tour.title,
    current.travelDate,
    (current.paxAdults ?? 0) + (current.paxChildren ?? 0)
  );
  const statusLabel = status.replace("_", " ").toLowerCase();

  await createNotification({
    type: "ADMIN_BOOKING_MODIFIED",
    role: "ADMIN",
    title: "Reserva actualizada",
    message: `Reserva ${summary} cambió a ${statusLabel}.`,
    bookingId,
    metadata: {
      tourId: current.Tour.id,
      status
    }
  });

  if (current.Tour.SupplierProfile?.userId) {
    await createNotification({
      type: "SUPPLIER_BOOKING_MODIFIED",
      role: "SUPPLIER",
      title: `Reserva modificada en ${current.Tour.title}`,
      message: `La reserva ${summary} ahora está en ${statusLabel}.`,
      bookingId,
      metadata: {
        tourId: current.Tour.id,
        status
      },
      recipientUserId: current.Tour.SupplierProfile.userId
    });
  }

  if (current.source === BookingSourceEnum.AGENCY && current.userId) {
    await createNotification({
      type: "AGENCY_BOOKING_MODIFIED",
      role: "AGENCY",
      title: "Reserva modificada",
      message: `Tu reserva ${summary} ahora está en ${statusLabel}.`,
      bookingId,
      metadata: {
        tourId: current.Tour.id,
        status
      },
      recipientUserId: current.userId
    });
  }

  if (current.userId) {
    await createNotification({
      type: "CUSTOMER_BOOKING_MODIFIED",
      role: "CUSTOMER",
      title: "Tu reserva fue actualizada",
      message: `La reserva ${summary} ahora está en ${statusLabel}.`,
      bookingId,
      metadata: {
        tourId: current.Tour.id,
        status
      },
      recipientUserId: current.userId
    });
  }
};

export async function updateBookingStatus(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const status = formData.get("status");

  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Booking inválido.");
  }

  if (!status || typeof status !== "string" || !allowedStatuses.includes(status as AllowedBookingStatus)) {
    throw new Error("Estado inválido.");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: status as BookingStatus
    }
  });

  await notifyModification(bookingId, status as BookingStatus);

  revalidatePath("/admin/bookings");
  revalidatePath("/supplier/bookings");
  revalidatePath("/agency/bookings");
  revalidatePath("/dashboard/customer");
}
