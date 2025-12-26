import type { Notification } from "@prisma/client";

export type NotificationMenuItem = Pick<
  Notification,
  "id" | "title" | "message" | "body" | "metadata" | "createdAt" | "isRead" | "type"
>;
