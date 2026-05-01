"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdminSession } from "@/lib/adminAccess";
import { prisma } from "@/lib/prisma";
import { requiresCancellationRequest } from "@/lib/bookings";
import { createNotification } from "@/lib/notificationService";
import { BookingStatus, BookingStatusEnum, BookingSourceEnum } from "@/lib/types/booking";

const revalidate = () => {
  revalidatePath("/admin/bookings");
  revalidatePath("/supplier/bookings");
  revalidatePath("/agency/bookings");
  revalidatePath("/dashboard/customer");
};

const formatDateLabel = (value?: Date | null) => {
  if (!value) return "fecha desconocida";
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long"
  }).format(value);
};

const buildBookingSummary = (title: string, travelDate: Date, pax: number) =>
  `${title} - ${pax} pax - ${formatDateLabel(travelDate)}`;

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "admin";
    case "SUPPLIER":
      return "supplier";
    case "AGENCY":
      return "agencia";
    default:
      return role.toLowerCase();
  }
};

const notifyCancellation = async (bookingId: string, role: string, reason?: string) => {
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

  const tourTitle = current.Tour.title;
  const summary = buildBookingSummary(
    tourTitle,
    current.travelDate,
    (current.paxAdults ?? 0) + (current.paxChildren ?? 0)
  );
  const reasonLabel = reason ? ` - Motivo: ${reason}` : "";

  await createNotification({
    type: "ADMIN_BOOKING_CANCELLED",
    role: "ADMIN",
    title: "Reserva cancelada",
    message: `Reserva ${summary} cancelada por ${getRoleLabel(role)}${reasonLabel}.`,
    bookingId,
    metadata: {
      tourId: current.Tour.id,
      reason
    }
  });

  if (current.Tour.SupplierProfile?.userId) {
    await createNotification({
      type: "SUPPLIER_BOOKING_CANCELLED",
      role: "SUPPLIER",
      title: `Reserva cancelada en ${tourTitle}`,
      message: `La reserva ${summary} fue cancelada${reason ? ` (motivo: ${reason})` : ""}.`,
      bookingId,
      metadata: {
        tourId: current.Tour.id
      },
      recipientUserId: current.Tour.SupplierProfile.userId
    });
  }

  if ((current.source === BookingSourceEnum.AGENCY || role === "AGENCY") && current.userId) {
    await createNotification({
      type: "AGENCY_BOOKING_CANCELLED",
      role: "AGENCY",
      title: "Reserva cancelada",
      message: `Tu reserva ${summary} fue cancelada${reason ? ` (motivo: ${reason})` : ""}.`,
      bookingId,
      metadata: {
        tourId: current.Tour.id
      },
      recipientUserId: current.userId
    });
  }

  if (current.userId) {
    await createNotification({
      type: "CUSTOMER_BOOKING_CANCELLED",
      role: "CUSTOMER",
      title: "Tu reserva fue cancelada",
      message: `La reserva ${summary} fue cancelada${reason ? ` (motivo: ${reason})` : ""}.`,
      bookingId,
      metadata: {
        tourId: current.Tour.id,
        reason
      },
      recipientUserId: current.userId
    });
  }
};

const updateCancellation = async (bookingId: string, status: BookingStatus, role: string, reason?: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new Error("Reserva no encontrada.");
  }

  const payload: Record<string, unknown> = {
    status,
    cancellationByRole: role,
    cancellationAt: new Date()
  };

  if (reason) {
    payload.cancellationReason = reason;
  } else {
    payload.cancellationReason = booking.cancellationReason ?? null;
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: payload
  });

  if (status === BookingStatusEnum.CANCELLED) {
    await notifyCancellation(bookingId, role, reason ?? booking.cancellationReason ?? undefined);
  }

  revalidate();
};

const requireSupplierBookingAccess = async (bookingId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "SUPPLIER") {
    throw new Error("No autorizado.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Tour: {
        select: {
          SupplierProfile: {
            select: {
              userId: true
            }
          }
        }
      }
    }
  });

  if (!booking) {
    throw new Error("Reserva no encontrada.");
  }
  if (booking.Tour?.SupplierProfile?.userId !== session.user.id) {
    throw new Error("No tienes permiso para gestionar esta reserva.");
  }
  return booking;
};

const requireAgencyBookingAccess = async (bookingId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "AGENCY") {
    throw new Error("No autorizado.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      AgencyProLink: {
        select: {
          agencyUserId: true
        }
      },
      AgencyTransferLink: {
        select: {
          agencyUserId: true
        }
      }
    }
  });

  if (!booking) {
    throw new Error("Reserva no encontrada.");
  }

  const ownsBooking =
    booking.userId === session.user.id ||
    booking.AgencyProLink?.agencyUserId === session.user.id ||
    booking.AgencyTransferLink?.agencyUserId === session.user.id;

  if (!ownsBooking) {
    throw new Error("No tienes permiso para gestionar esta reserva.");
  }

  return booking;
};

export async function adminCancelBooking(formData: FormData) {
  await requireAdminSession();
  const bookingId = formData.get("bookingId");
  const reason = formData.get("reason");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Selecciona una reserva válida.");
  }
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    throw new Error("Escribe un motivo para cancelar.");
  }
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLED, "ADMIN", reason.trim());
}

export async function adminApproveCancellation(formData: FormData) {
  await requireAdminSession();
  const bookingId = formData.get("bookingId");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva inválida.");
  }
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLED, "ADMIN");
}

export async function supplierCancelBooking(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const reason = formData.get("reason");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva inválida.");
  }
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    throw new Error("Escribe un motivo para cancelar.");
  }
  const booking = await requireSupplierBookingAccess(bookingId);
  if (requiresCancellationRequest(booking.travelDate)) {
    throw new Error("Esta reserva requiere aprobación del admin.");
  }
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLED, "SUPPLIER", reason.trim());
}

export async function supplierRequestCancellation(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const reason = formData.get("reason");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva inválida.");
  }
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    throw new Error("Describe el motivo de tu solicitud.");
  }
  await requireSupplierBookingAccess(bookingId);
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLATION_REQUESTED, "SUPPLIER", reason.trim());
}

export async function agencyCancelBooking(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const reason = formData.get("reason");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva inválida.");
  }
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    throw new Error("Escribe un motivo para cancelar.");
  }
  const booking = await requireAgencyBookingAccess(bookingId);
  if (requiresCancellationRequest(booking.travelDate)) {
    throw new Error("Esta reserva requiere aprobación del admin.");
  }
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLED, "AGENCY", reason.trim());
}

export async function agencyRequestCancellation(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const reason = formData.get("reason");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva inválida.");
  }
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    throw new Error("Describe el motivo de tu solicitud.");
  }
  await requireAgencyBookingAccess(bookingId);
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLATION_REQUESTED, "AGENCY", reason.trim());
}
