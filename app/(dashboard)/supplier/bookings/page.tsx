export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SupplierBookingList, type SupplierBookingSummary } from "@/components/supplier/SupplierBookingList";

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

  const summaries = bookings.map<SupplierBookingSummary>((booking) => ({
    id: booking.id,
    bookingCode: booking.bookingCode,
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
    updatedAt: booking.updatedAt.toISOString(),
    whatsappNumber: booking.customerPhone
  }));

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
