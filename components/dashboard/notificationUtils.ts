import { NotificationMenuItem } from "./notificationTypes";

export const formatNotificationDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);

export const notificationGroupLabel = (value: Date) => {
  const diff = Date.now() - value.getTime();
  const day = 1000 * 60 * 60 * 24;
  if (diff < day) return "Hoy";
  if (diff < 2 * day) return "Ayer";
  if (diff < 7 * day) return "Esta semana";
  return "Anterior";
};

export const sanitizeNotificationText = (value: string) =>
  value
    .replace(/\u0416\u042C/g, "\u00B7")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\w0-9\u00B7.,:;!?()\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const buildNotificationDetails = (notification: NotificationMenuItem, metadataLabel?: string) => {
  const raw = notification.message ?? notification.body ?? metadataLabel ?? "";
  const clean = sanitizeNotificationText(raw);
  return clean.length > 0 ? clean : undefined;
};
