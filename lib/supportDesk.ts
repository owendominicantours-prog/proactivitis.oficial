import { Prisma } from "@prisma/client";

import { prisma as prismaLike } from "@/lib/prisma";
import { getWorkplaceContext } from "@/lib/workplace";
import { buildWorkplaceBookingWhere } from "@/lib/workplaceBookings";

export const supportConversationTypes = ["SUPPORT", "VISITOR_CHAT", "RESERVATION"] as const;
export const supportSlaMinutes = {
  due: 3,
  warning: 5,
  breached: 10
} as const;

export type SupportDeskContext = NonNullable<Awaited<ReturnType<typeof getWorkplaceContext>>>;

export async function getSupportDeskContext() {
  const context = await getWorkplaceContext();
  if (!context?.user) return null;
  if (context.isAdmin) return context;
  if (context.employee?.status === "APPROVED" && context.permissions.has("chat.respond")) return context;
  return null;
}

export function isSupportSupervisor(context: SupportDeskContext) {
  if (context.isAdmin) return true;
  if (context.permissions.has("chat.manage") || context.permissions.has("workplace.manage")) return true;
  if (!context.permissions.has("chat.respond")) return false;

  return Boolean(
    context.employee?.roles.some((assignment) => {
      if (assignment.expiresAt && assignment.expiresAt < new Date()) return false;
      return assignment.role.active && assignment.role.level >= 45;
    })
  );
}

export function buildSupportConversationWhere(
  context: SupportDeskContext,
  type?: string | null,
  view?: string | null
): Prisma.ConversationWhereInput {
  const normalizedType = type?.trim().toUpperCase();
  const typeWhere = normalizedType
    ? { type: normalizedType }
    : { type: { in: [...supportConversationTypes] } };

  if (context.isAdmin || (view === "team" && isSupportSupervisor(context))) return typeWhere;

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
  if (context.isAdmin || isSupportSupervisor(context)) return true;
  if (!supportConversationTypes.includes(conversation.type as any)) return false;
  if (conversation.ConversationParticipant.some((participant) => participant.userId === context.user.id)) return true;
  if (!conversation.assignedDepartmentId && !conversation.assignedEmployeeId) return true;
  return (
    conversation.assignedEmployeeId === context.employee?.id ||
    conversation.assignedDepartmentId === context.employee?.departmentId
  );
}

const customerMessageRoles = new Set(["CUSTOMER", "VISITOR"]);
const supportActiveStatuses = new Set(["OPEN", "ESCALATED"]);

type SupportSlaConversation = {
  status: string;
  priority: string;
  Message: Array<{
    senderRole: string;
    senderId: string;
    createdAt: Date;
  }>;
};

const priorityRank: Record<string, number> = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  URGENT: 4
};

export function getSupportSla(conversation: SupportSlaConversation, currentUserId: string, now = new Date()) {
  const latestNonSystem = conversation.Message.find((message) => message.senderRole !== "SYSTEM") ?? null;
  const isPendingCustomer =
    Boolean(latestNonSystem) &&
    customerMessageRoles.has(latestNonSystem?.senderRole ?? "") &&
    supportActiveStatuses.has(conversation.status);

  if (!latestNonSystem || !isPendingCustomer) {
    return {
      state: "ok",
      label: "Al dia",
      minutesWaiting: 0,
      pendingForMe: latestNonSystem ? latestNonSystem.senderId !== currentUserId : false,
      suggestedPriority: conversation.priority,
      shouldEscalate: false
    };
  }

  const minutesWaiting = Math.max(0, Math.floor((now.getTime() - latestNonSystem.createdAt.getTime()) / 60000));
  const state =
    minutesWaiting >= supportSlaMinutes.breached
      ? "breached"
      : minutesWaiting >= supportSlaMinutes.warning
        ? "warning"
        : minutesWaiting >= supportSlaMinutes.due
          ? "due"
          : "fresh";
  const suggestedPriority =
    state === "breached"
      ? "URGENT"
      : state === "warning"
        ? "HIGH"
        : conversation.priority;

  return {
    state,
    label:
      state === "breached"
        ? "SLA vencido"
        : state === "warning"
          ? "Atencion requerida"
          : state === "due"
            ? "Responder pronto"
            : "Nuevo",
    minutesWaiting,
    pendingForMe: latestNonSystem.senderId !== currentUserId,
    suggestedPriority:
      (priorityRank[suggestedPriority] ?? 0) > (priorityRank[conversation.priority] ?? 0)
        ? suggestedPriority
        : conversation.priority,
    shouldEscalate: state === "breached"
  };
}

export async function applySupportSlaUpdates(
  conversations: Array<SupportSlaConversation & { id: string }>,
  currentUserId: string
) {
  const updates = conversations
    .map((conversation) => {
      const sla = getSupportSla(conversation, currentUserId);
      const data: Prisma.ConversationUpdateInput = {};
      if ((priorityRank[sla.suggestedPriority] ?? 0) > (priorityRank[conversation.priority] ?? 0)) {
        data.priority = sla.suggestedPriority;
      }
      if (sla.shouldEscalate && conversation.status === "OPEN") {
        data.status = "ESCALATED";
        data.escalatedAt = new Date();
      }
      return Object.keys(data).length ? { id: conversation.id, data } : null;
    })
    .filter((item): item is { id: string; data: Prisma.ConversationUpdateInput } => Boolean(item));

  if (!updates.length) return;

  await Promise.all(
    updates.map((update) =>
      prismaLike.conversation.update({
        where: { id: update.id },
        data: { ...update.data, updatedAt: new Date() }
      })
    )
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

export async function findSupportBookings(context: SupportDeskContext, query: string) {
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
      AND: [
        buildWorkplaceBookingWhere(context.scope),
        { OR: or }
      ]
    },
    select: supportBookingSelect,
    orderBy: { createdAt: "desc" },
    take: 8
  });
  return rows.map(formatSupportBooking);
}
