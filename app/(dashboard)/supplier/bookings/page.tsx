export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseNotificationMetadata } from "@/lib/notificationService";
import {
  SupplierBookingList,
  type SupplierBookingSummary,
  type SupplierTimelineEntry,
  type SupplierNote
} from "@/components/supplier/SupplierBookingList";

export default async function SupplierBookingsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Accede para ver tus reservas.</div>;
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    select: { id: true }
  });

  if (!supplier) {
    return <div className="py-10 text-center text-sm text-slate-600">Activa tu perfil de supplier para ver tus reservas.</div>;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      Tour: {
        supplierId: supplier.id
      }
    },
    include: { Tour: true },
    orderBy: { travelDate: "asc" }
  });
  const bookingIds = bookings.map((booking) => booking.id);
  const notifications = await prisma.notification.findMany({
    where: {
      bookingId: {
        in: bookingIds
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const timelineMap: Record<string, SupplierTimelineEntry[]> = {};
  const notesMap: Record<string, SupplierNote[]> = {};
  notifications.forEach((notification) => {
    if (!notification.bookingId) return;
    const metadata = parseNotificationMetadata(notification.metadata);
    const entry: SupplierTimelineEntry = {
      title: notification.title ?? "Actualización",
      description: notification.message ?? notification.body ?? metadata.supplierNote ?? "Sin detalle",
      timestamp: notification.createdAt.toISOString()
    };
    timelineMap[notification.bookingId] = timelineMap[notification.bookingId] ?? [];
    timelineMap[notification.bookingId].push(entry);
    if (notification.type === "ADMIN_BOOKING_NOTE" || metadata.supplierNote) {
      const author =
        metadata.author ??
        (notification.type === "ADMIN_BOOKING_NOTE" ? "Admin" : "Proveedor");
      notesMap[notification.bookingId] = notesMap[notification.bookingId] ?? [];
      notesMap[notification.bookingId].push({
        author,
        message: entry.description,
        timestamp: entry.timestamp
      });
    }
  });

  const summaries = bookings.map<SupplierBookingSummary>((booking) => {
    const notificationEvents = timelineMap[booking.id] ?? [];
    const baseTimeline: SupplierTimelineEntry[] = [
      {
        title: "Reserva creada",
        description: `Origen: ${booking.source ?? "n/d"}`,
        timestamp: booking.createdAt.toISOString()
      }
    ];
    if (booking.paymentStatus) {
      baseTimeline.push({
        title: "Pago registrado",
        description: `Stripe: ${booking.paymentStatus}`,
        timestamp: booking.updatedAt?.toISOString() ?? booking.createdAt.toISOString()
      });
    }
    if (booking.cancellationReason) {
      baseTimeline.push({
        title: "Cancelación solicitada",
        description: booking.cancellationReason,
        timestamp:
          booking.cancellationAt?.toISOString() ??
          booking.updatedAt?.toISOString() ??
          booking.createdAt.toISOString()
      });
    }
    const timeline = [...baseTimeline, ...notificationEvents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      id: booking.id,
      bookingCode: booking.bookingCode ?? booking.id,
      travelDate: booking.travelDate.toLocaleDateString("es-ES"),
      travelDateValue: booking.travelDate.toISOString(),
      startTime: booking.startTime,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      tourTitle: booking.Tour?.title ?? "Tour",
      pax: booking.paxAdults + booking.paxChildren,
      pickup: booking.pickup,
      hotel: booking.hotel,
      status: booking.status,
      totalAmount: booking.totalAmount,
      platformFee: booking.platformFee,
      supplierAmount: booking.supplierAmount,
      flightNumber: booking.flightNumber,
      pickupNotes: booking.pickupNotes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt?.toISOString() ?? booking.createdAt.toISOString(),
      whatsappNumber: booking.customerPhone,
      timeline,
      notes: notesMap[booking.id] ?? []
    };
  });

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reservas</h1>
        <p className="text-sm text-slate-500">Datos críticos de operación para coordinar tus tours.</p>
      </div>
      <SupplierBookingList bookings={summaries} />
    </section>
  );
}
