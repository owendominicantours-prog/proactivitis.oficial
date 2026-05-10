"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notificationService";
import { BookingStatusEnum } from "@/lib/types/booking";

const changeRequestLabels: Record<string, string> = {
  RESCHEDULE: "Cambio de fecha u hora",
  PARTICIPANTS: "Cambio de participantes",
  TRAVELER_INFO: "Datos del viajero",
  ACCESSIBILITY: "Necesidad especial o accesibilidad",
  DIETARY: "Requisito alimentario",
  GENERAL: "Solicitud general"
};

const blockedStatuses = new Set<string>([BookingStatusEnum.CANCELLED, BookingStatusEnum.COMPLETED]);

const revalidateCustomerBooking = (bookingId: string) => {
  revalidatePath("/dashboard/customer");
  revalidatePath(`/dashboard/customer/reservas/${bookingId}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/supplier/bookings");
};

const requireCustomerBookingAccess = async (bookingId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id && !session?.user?.email) {
    throw new Error("Debes iniciar sesion para gestionar esta reserva.");
  }

  const booking = await prisma.booking.findUnique({
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

  if (!booking || !booking.Tour) {
    throw new Error("Reserva no encontrada.");
  }

  const ownsBooking =
    (session.user.id && booking.userId === session.user.id) ||
    (session.user.email && booking.customerEmail.toLowerCase() === session.user.email.toLowerCase());

  if (!ownsBooking) {
    throw new Error("No tienes permiso para gestionar esta reserva.");
  }

  if (blockedStatuses.has(booking.status)) {
    throw new Error("Esta reserva no permite cambios desde el panel.");
  }

  return booking;
};

const notifyChange = async ({
  booking,
  title,
  message,
  customerMessage
}: {
  booking: Awaited<ReturnType<typeof requireCustomerBookingAccess>>;
  title: string;
  message: string;
  customerMessage: string;
}) => {
  const bookingId = booking.id;
  await createNotification({
    type: "ADMIN_BOOKING_MODIFIED",
    role: "ADMIN",
    title,
    message,
    bookingId,
    metadata: {
      bookingId,
      tourId: booking.Tour.id,
      referenceUrl: `/admin/bookings?bookingId=${bookingId}`
    }
  });

  if (booking.Tour.SupplierProfile?.userId) {
    await createNotification({
      type: "SUPPLIER_BOOKING_MODIFIED",
      role: "SUPPLIER",
      title,
      message,
      bookingId,
      metadata: {
        bookingId,
        tourId: booking.Tour.id,
        referenceUrl: `/supplier/bookings?bookingId=${bookingId}`
      },
      recipientUserId: booking.Tour.SupplierProfile.userId
    });
  }

  await createNotification({
    type: "CUSTOMER_BOOKING_MODIFIED",
    role: "CUSTOMER",
    title: "Solicitud recibida",
    message: customerMessage,
    bookingId,
    metadata: {
      bookingId,
      tourId: booking.Tour.id,
      referenceUrl: `/dashboard/customer/reservas/${bookingId}`
    },
    recipientUserId: booking.userId
  });
};

export async function customerUpdatePickup(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const pickup = formData.get("pickup");
  const hotel = formData.get("hotel");
  const pickupNotes = formData.get("pickupNotes");

  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva invalida.");
  }

  const nextPickup = typeof pickup === "string" ? pickup.trim() : "";
  const nextHotel = typeof hotel === "string" ? hotel.trim() : "";
  const nextNotes = typeof pickupNotes === "string" ? pickupNotes.trim() : "";

  if (!nextPickup && !nextHotel) {
    throw new Error("Agrega pickup, hotel o punto de encuentro.");
  }

  const booking = await requireCustomerBookingAccess(bookingId);
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      pickup: nextPickup || booking.pickup,
      hotel: nextHotel || booking.hotel,
      pickupNotes: nextNotes || booking.pickupNotes
    }
  });

  await notifyChange({
    booking,
    title: "Pickup actualizado por cliente",
    message: `${booking.customerName} actualizo pickup/hotel para ${booking.Tour.title}. Pickup: ${nextPickup || booking.pickup || "pendiente"}. Hotel: ${nextHotel || booking.hotel || "pendiente"}.`,
    customerMessage: "Guardamos tu pickup/hotel. Si el operador necesita validar algo, lo veras en tu cuenta."
  });

  revalidateCustomerBooking(booking.id);
}

export async function customerRequestBookingChange(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const requestType = formData.get("requestType");
  const message = formData.get("message");
  const requestedDate = formData.get("requestedDate");
  const requestedTime = formData.get("requestedTime");
  const adults = formData.get("adults");
  const children = formData.get("children");

  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva invalida.");
  }

  const type = typeof requestType === "string" ? requestType : "GENERAL";
  const label = changeRequestLabels[type] ?? changeRequestLabels.GENERAL;
  const note = typeof message === "string" ? message.trim() : "";
  const dateLabel = typeof requestedDate === "string" && requestedDate.trim() ? `Fecha solicitada: ${requestedDate.trim()}. ` : "";
  const timeLabel = typeof requestedTime === "string" && requestedTime.trim() ? `Hora solicitada: ${requestedTime.trim()}. ` : "";
  const paxLabel =
    typeof adults === "string" || typeof children === "string"
      ? `Participantes solicitados: ${adults || "0"} adultos, ${children || "0"} ninos. `
      : "";

  if (!note && !dateLabel && !timeLabel && !paxLabel) {
    throw new Error("Describe el cambio que necesitas.");
  }

  const booking = await requireCustomerBookingAccess(bookingId);
  const fullMessage = `${label}. ${dateLabel}${timeLabel}${paxLabel}${note}`.trim();

  await notifyChange({
    booking,
    title: `Solicitud de cambio: ${label}`,
    message: `${booking.customerName} solicito cambio para ${booking.Tour.title}. ${fullMessage}`,
    customerMessage: `Recibimos tu solicitud: ${label}. El equipo la revisara desde la plataforma.`
  });

  revalidateCustomerBooking(booking.id);
}
