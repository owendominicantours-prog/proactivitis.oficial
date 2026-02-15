import { prisma } from "@/lib/prisma";

export type NotificationEmailKey =
  | "ADMIN_NEW_USER"
  | "ADMIN_PARTNER_APPLICATION"
  | "ADMIN_CONTACT_REQUEST"
  | "ADMIN_HOTEL_QUOTE_REQUEST"
  | "ADMIN_BOOKING_CONFIRMED"
  | "ADMIN_TOUR_MODERATION";

const DEFAULT_ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ??
  process.env.NOTIFY_FROM_EMAIL ??
  "info@proactivitis.com";

export const notificationEmailDefaults: Array<{
  key: NotificationEmailKey;
  label: string;
  description: string;
  defaultRecipients: string;
}> = [
  {
    key: "ADMIN_NEW_USER",
    label: "Nuevo cliente registrado",
    description: "Se dispara cuando un cliente crea una cuenta.",
    defaultRecipients: DEFAULT_ADMIN_EMAIL
  },
  {
    key: "ADMIN_PARTNER_APPLICATION",
    label: "Solicitud de partner",
    description: "Se dispara cuando llega una solicitud de partner.",
    defaultRecipients: DEFAULT_ADMIN_EMAIL
  },
  {
    key: "ADMIN_CONTACT_REQUEST",
    label: "Formulario de contacto",
    description: "Se dispara cuando llega un mensaje desde contacto.",
    defaultRecipients: DEFAULT_ADMIN_EMAIL
  },
  {
    key: "ADMIN_HOTEL_QUOTE_REQUEST",
    label: "Cotizacion de hotel",
    description: "Se dispara cuando llega una solicitud desde el widget de alojamiento.",
    defaultRecipients: DEFAULT_ADMIN_EMAIL
  },
  {
    key: "ADMIN_BOOKING_CONFIRMED",
    label: "Reserva confirmada",
    description: "Se dispara cuando se confirma una reserva.",
    defaultRecipients: DEFAULT_ADMIN_EMAIL
  },
  {
    key: "ADMIN_TOUR_MODERATION",
    label: "Moderaci\u00f3n de tours",
    description: "Se dispara cuando un tour se aprueba, requiere cambios o se elimina.",
    defaultRecipients: DEFAULT_ADMIN_EMAIL
  }
];

const normalizeRecipientList = (value: string) => {
  const rawItems = value
    .split(/[,\n;]+/g)
    .flatMap((chunk) => chunk.trim().split(/\s+/))
    .map((item) => item.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const valid = rawItems.filter((item) => {
    const normalized = item.toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(normalized);
  });
  return valid;
};

export const formatRecipientsForDisplay = (value?: string | null) => {
  if (!value) return "";
  return value
    .split(/[,\n;]+/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");
};

export const resolveNotificationRecipients = async (key: NotificationEmailKey) => {
  const fallback =
    notificationEmailDefaults.find((entry) => entry.key === key)?.defaultRecipients ?? DEFAULT_ADMIN_EMAIL;

  try {
    const record = await prisma.notificationEmailSetting.findUnique({
      where: { key }
    });
    if (!record?.recipients) return fallback;
    return record.recipients;
  } catch (error) {
    console.warn("No se pudo cargar NotificationEmailSetting", key, error);
    return fallback;
  }
};

export const normalizeRecipients = (value: string) => {
  const list = normalizeRecipientList(value);
  return list.join(", ");
};
