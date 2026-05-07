import { Prisma } from "@prisma/client";

import { prisma as prismaLike } from "@/lib/prisma";
import { getWorkplaceContext } from "@/lib/workplace";

export const supportConversationTypes = ["SUPPORT", "VISITOR_CHAT", "RESERVATION"] as const;

export type SupportDeskContext = NonNullable<Awaited<ReturnType<typeof getWorkplaceContext>>>;

export async function getSupportDeskContext() {
  const context = await getWorkplaceContext();
  if (!context?.user) return null;
  if (context.isAdmin) return context;
  if (context.employee?.status === "APPROVED" && context.permissions.has("chat.respond")) return context;
  return null;
}

export function buildSupportConversationWhere(context: SupportDeskContext, type?: string | null): Prisma.ConversationWhereInput {
  const normalizedType = type?.trim().toUpperCase();
  const typeWhere = normalizedType
    ? { type: normalizedType }
    : { type: { in: [...supportConversationTypes] } };

  if (context.isAdmin) return typeWhere;

  const employeeId = context.employee?.id ?? "__none__";
  const departmentId = context.employee?.departmentId ?? "__none__";

  return {
    AND: [
      typeWhere,
      {
        OR: [
          { assignedEmployeeId: employeeId },
          { assignedDepartmentId: departmentId },
          { assignedDepartmentId: null },
          { ConversationParticipant: { some: { userId: context.user.id } } }
        ]
      }
    ]
  };
}

export async function canAccessSupportConversation(context: SupportDeskContext, conversationId: string) {
  const conversation = await prismaLike.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      type: true,
      assignedDepartmentId: true,
      assignedEmployeeId: true,
      ConversationParticipant: { select: { userId: true } }
    }
  });
  if (!conversation) return false;
  if (context.isAdmin) return true;
  if (!supportConversationTypes.includes(conversation.type as any)) return false;
  if (conversation.ConversationParticipant.some((participant) => participant.userId === context.user.id)) return true;
  if (!conversation.assignedDepartmentId && !conversation.assignedEmployeeId) return true;
  return (
    conversation.assignedEmployeeId === context.employee?.id ||
    conversation.assignedDepartmentId === context.employee?.departmentId
  );
}

const maskEmail = (email?: string | null) => {
  if (!email || !email.includes("@")) return null;
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
};

const maskPhone = (phone?: string | null) => {
  if (!phone) return null;
  const clean = phone.replace(/\s+/g, "");
  if (clean.length <= 4) return "***";
  return `${"*".repeat(Math.max(clean.length - 4, 3))}${clean.slice(-4)}`;
};

export const supportBookingSelect = {
  id: true,
  bookingCode: true,
  flowType: true,
  status: true,
  paymentStatus: true,
  source: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  travelDate: true,
  returnTravelDate: true,
  startTime: true,
  returnStartTime: true,
  paxAdults: true,
  paxChildren: true,
  passengers: true,
  pickup: true,
  hotel: true,
  originAirport: true,
  pickupNotes: true,
  flightNumber: true,
  totalAmount: true,
  transferVehicleName: true,
  transferVehicleCategory: true,
  tripType: true,
  createdAt: true,
  Tour: {
    select: {
      id: true,
      title: true,
      slug: true,
      heroImage: true,
      SupplierProfile: { select: { company: true } }
    }
  }
} satisfies Prisma.BookingSelect;

export type SupportBookingRecord = Prisma.BookingGetPayload<{ select: typeof supportBookingSelect }>;

export function formatSupportBooking(booking: SupportBookingRecord) {
  const passengers = booking.passengers ?? booking.paxAdults + booking.paxChildren;
  return {
    id: booking.id,
    bookingCode: booking.bookingCode ?? booking.id,
    type: booking.flowType ?? "tour",
    status: booking.status,
    paymentStatus: booking.paymentStatus ?? "pending",
    source: booking.source,
    service: booking.Tour?.title ?? "Servicio Proactivitis",
    supplier: booking.Tour?.SupplierProfile?.company ?? "Proveedor pendiente",
    travelDate: booking.travelDate,
    returnTravelDate: booking.returnTravelDate,
    startTime: booking.startTime,
    returnStartTime: booking.returnStartTime,
    passengers,
    pickup: booking.pickup ?? booking.hotel ?? booking.originAirport ?? "Pendiente de coordinar",
    hotel: booking.hotel,
    originAirport: booking.originAirport,
    flightNumber: booking.flightNumber,
    tripType: booking.tripType,
    vehicle: booking.transferVehicleName,
    vehicleCategory: booking.transferVehicleCategory,
    totalAmount: booking.totalAmount,
    customer: {
      name: booking.customerName,
      emailMasked: maskEmail(booking.customerEmail),
      phoneMasked: maskPhone(booking.customerPhone)
    },
    operationalNotes: [
      booking.pickupNotes ? `Notas de recogida: ${booking.pickupNotes}` : null,
      booking.flightNumber ? `Vuelo: ${booking.flightNumber}` : null,
      booking.transferVehicleName ? `Vehiculo: ${booking.transferVehicleName}` : null
    ].filter(Boolean)
  };
}

export async function findSupportBookings(query: string) {
  const q = query.trim();
  if (q.length < 3) return [];
  const insensitive = Prisma.QueryMode.insensitive;
  const or: Prisma.BookingWhereInput[] = [
    { id: { equals: q } },
    { bookingCode: { equals: q, mode: insensitive } },
    { bookingCode: { contains: q, mode: insensitive } },
    { customerName: { contains: q, mode: insensitive } }
  ];
  if (q.includes("@")) {
    or.push({ customerEmail: { contains: q, mode: insensitive } });
  }
  const rows = await prismaLike.booking.findMany({
    where: {
      OR: or
    },
    select: supportBookingSelect,
    orderBy: { createdAt: "desc" },
    take: 8
  });
  return rows.map(formatSupportBooking);
}
