import type { Notification } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotificationRole, NotificationType } from "@/lib/types/notificationTypes";
import { randomUUID } from "crypto";
import { getCurrentSiteBrand } from "@/lib/site-brand";

export type NotificationMetadata = {
  role?: NotificationRole;
  userId?: string;
  bookingId?: string;
  referenceUrl?: string;
  [key: string]: any;
};

export type NotificationRecipient = {
  userId?: string | null;
  role?: NotificationRole | null;
  limit?: number;
};

export const parseNotificationMetadata = (
  value?: string | Record<string, unknown> | null
): NotificationMetadata => {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (typeof value === "object") {
    return value as NotificationMetadata;
  }
  return {};
};

const buildRecipientFilters = ({ userId, role }: NotificationRecipient) => {
  const byUser = userId ? { metadata: { contains: `"userId":"${userId}"` } } : null;
  const byRole = role ? { role } : null;

  if (byUser && byRole) {
    return { AND: [byUser, byRole] };
  }
  if (byUser) return byUser;
  if (byRole) return byRole;
  return undefined;
};

const roleRequiresScopedRecipient = (role?: NotificationRole | null) =>
  role === "AGENCY" || role === "SUPPLIER" || role === "CUSTOMER";

const getLegacyAccessibleBookingIds = async (
  recipient: NotificationRecipient,
  bookingIds: string[]
) => {
  if (!recipient.userId || !recipient.role || bookingIds.length === 0) {
    return new Set<string>();
  }

  if (recipient.role === "AGENCY") {
    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
        OR: [
          { userId: recipient.userId },
          { AgencyProLink: { agencyUserId: recipient.userId } },
          { AgencyTransferLink: { agencyUserId: recipient.userId } }
        ]
      },
      select: { id: true }
    });
    return new Set(bookings.map((booking) => booking.id));
  }

  if (recipient.role === "SUPPLIER") {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { userId: recipient.userId },
      select: { id: true }
    });

    if (!supplier) {
      return new Set<string>();
    }

    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
        Tour: {
          supplierId: supplier.id
        }
      },
      select: { id: true }
    });
    return new Set(bookings.map((booking) => booking.id));
  }

  if (recipient.role === "CUSTOMER") {
    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
        userId: recipient.userId
      },
      select: { id: true }
    });
    return new Set(bookings.map((booking) => booking.id));
  }

  return new Set<string>();
};

const filterNotificationsForRecipient = async (
  notifications: Notification[],
  recipient: NotificationRecipient
) => {
  if (!recipient.role) return [];
  if (recipient.role === "ADMIN") return notifications;

  if (!recipient.userId) return [];

  const bookingIds = Array.from(
    new Set(
      notifications
        .map((notification) => {
          const metadata = parseNotificationMetadata(notification.metadata);
          return metadata.bookingId ?? notification.bookingId ?? null;
        })
        .filter((value): value is string => Boolean(value))
    )
  );

  const accessibleBookingIds = await getLegacyAccessibleBookingIds(recipient, bookingIds);

  return notifications.filter((notification) => {
    const metadata = parseNotificationMetadata(notification.metadata);
    const targetUserId = typeof metadata.userId === "string" ? metadata.userId : null;

    if (targetUserId) {
      return targetUserId === recipient.userId;
    }

    if (!roleRequiresScopedRecipient(recipient.role)) {
      return notification.role === recipient.role;
    }

    const bookingId = metadata.bookingId ?? notification.bookingId ?? null;
    if (!bookingId) return false;

    return accessibleBookingIds.has(bookingId);
  });
};

export async function createNotification({
  type,
  role,
  title,
  message,
  metadata,
  bookingId,
  recipientUserId
}: {
  type: NotificationType;
  role: NotificationRole;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
  bookingId?: string;
  recipientUserId?: string | null;
}) {
  const payload: NotificationMetadata = {
    ...(metadata ?? {})
  };
  const siteBrand = getCurrentSiteBrand();
  if (recipientUserId) payload.userId = recipientUserId;
  payload.role = role;
  await prisma.notification.create({
    data: {
      id: randomUUID(),
      type,
      role,
      title,
      message,
      body: message,
      bookingId: bookingId ?? metadata?.bookingId ?? null,
      metadata: Object.keys(payload).length ? JSON.stringify(payload) : null,
      caseNumber: metadata?.bookingId ?? null,
      isRead: false,
      siteBrand
    }
  });
}

export const createPartnerApplicationNotification = async ({
  applicationId,
  companyName
}: {
  applicationId: string;
  companyName: string;
}) => {
  await createNotification({
    type: "ADMIN_PARTNER_APPLICATION",
    role: "ADMIN",
    title: "Nueva solicitud",
    message: companyName,
    metadata: {
      referenceUrl: `/admin/partner-applications`,
      applicationId
    }
  });
};

export const createAccountStatusNotification = async ({
  userId,
  role,
  message,
  type,
  metadata
}: {
  userId: string;
  role: NotificationRole;
  message: string;
  type: NotificationType;
  metadata?: NotificationMetadata;
}) => {
  await createNotification({
    type,
    role,
    title: "Estado de cuenta",
    message,
    metadata: {
      referenceUrl: `/portal/${role.toLowerCase()}`,
      ...(metadata ?? {})
    },
    recipientUserId: userId
  });
};

export async function getNotificationsForRecipient(recipient: NotificationRecipient) {
  const { limit = 5 } = recipient;
  if (!recipient.role) return [];

  if (!roleRequiresScopedRecipient(recipient.role)) {
    const where = buildRecipientFilters(recipient);
    if (!where) return [];
    return prisma.notification.findMany({
      where: {
        ...where,
        siteBrand: getCurrentSiteBrand()
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }

  const scanLimit = Math.max(limit * 8, 80);
  const candidates = await prisma.notification.findMany({
    where: { role: recipient.role, siteBrand: getCurrentSiteBrand() },
    orderBy: { createdAt: "desc" },
    take: scanLimit
  });

  const filtered = await filterNotificationsForRecipient(candidates, recipient);
  return filtered.slice(0, limit);
}

export async function getNotificationUnreadCount(recipient: NotificationRecipient) {
  if (!recipient.role) return 0;

  if (!roleRequiresScopedRecipient(recipient.role)) {
    const where = buildRecipientFilters(recipient);
    if (!where) return 0;
    return prisma.notification.count({
      where: {
        ...where,
        siteBrand: getCurrentSiteBrand(),
        isRead: false
      }
    });
  }

  const candidates = await prisma.notification.findMany({
    where: {
      role: recipient.role,
      siteBrand: getCurrentSiteBrand(),
      isRead: false
    },
    orderBy: { createdAt: "desc" },
    take: 300
  });

  const filtered = await filterNotificationsForRecipient(candidates, recipient);
  return filtered.length;
}

export async function markNotificationsForRecipientRead(recipient: NotificationRecipient) {
  if (!recipient.role) return;

  if (!roleRequiresScopedRecipient(recipient.role)) {
    const where = buildRecipientFilters(recipient);
    if (!where) return;
    await prisma.notification.updateMany({
      where: {
        ...where,
        isRead: false
      },
      data: { isRead: true }
    });
    return;
  }

  const unread = await getNotificationsForRecipient({ ...recipient, limit: 300 });
  const unreadIds = unread.filter((notification) => !notification.isRead).map((notification) => notification.id);
  if (!unreadIds.length) return;

  await prisma.notification.updateMany({
    where: {
      id: { in: unreadIds }
    },
    data: { isRead: true }
  });
}

export async function getContactNotifications(limit = 50) {
  return prisma.notification.findMany({
    where: {
      role: "ADMIN",
      type: "ADMIN_CONTACT_REQUEST",
      siteBrand: getCurrentSiteBrand()
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}

export async function markNotificationRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
}

export async function getNotificationForRecipient(
  notificationId: string,
  recipient: NotificationRecipient
) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification) return null;

  const filtered = await filterNotificationsForRecipient([notification], recipient);
  return filtered[0] ?? null;
}

export async function markNotificationReadForRecipient(
  notificationId: string,
  recipient: NotificationRecipient
) {
  const notification = await getNotificationForRecipient(notificationId, recipient);
  if (!notification) return null;

  if (!notification.isRead) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }

  return notification;
}
