import { ReactNode, createElement } from "react";

export type NotificationType =
  | "ADMIN_BOOKING_CREATED"
  | "ADMIN_BOOKING_CANCELLED"
  | "ADMIN_BOOKING_MODIFIED"
  | "ADMIN_BOOKING_NOTE"
  | "ADMIN_SUPPLIER_PAYOUT_SENT"
  | "ADMIN_PAYMENT_FAILED"
  | "ADMIN_SUPPLIER_LOW_AVAILABILITY"
  | "ADMIN_SYSTEM_ALERT"
  | "ADMIN_CONTACT_REQUEST"
  | "ADMIN_PARTNER_APPLICATION"
  | "SUPPLIER_BOOKING_CREATED"
  | "SUPPLIER_BOOKING_CANCELLED"
  | "SUPPLIER_BOOKING_MODIFIED"
  | "SUPPLIER_PAYOUT_CONFIRMED"
  | "SUPPLIER_TOUR_REMINDER"
  | "SUPPLIER_ACCOUNT_STATUS"
  | "SUPPLIER_TOUR_REMOVED"
  | "AGENCY_BOOKING_CREATED"
  | "AGENCY_BOOKING_CANCELLED"
  | "AGENCY_BOOKING_MODIFIED"
  | "AGENCY_COMMISSION_PAID"
  | "AGENCY_PROMO_ALERT"
  | "AGENCY_ACCOUNT_STATUS";

export type NotificationRole = "ADMIN" | "SUPPLIER" | "AGENCY" | "CUSTOMER";

type NotificationDisplayTone = "primary" | "success" | "warning" | "danger" | "info";

export type NotificationDisplayConfig = {
  icon: ReactNode;
  label: string;
  textClass: string;
  badgeClass: string;
};

const toneTextClass: Record<NotificationDisplayTone, string> = {
  primary: "text-sky-600",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-rose-600",
  info: "text-slate-600"
};

const toneIcon: Record<NotificationDisplayTone, ReactNode> = {
  primary: createElement("span", { className: "inline-flex h-4 w-4 items-center justify-center text-sky-500" }, "✱"),
  success: createElement("span", { className: "inline-flex h-4 w-4 items-center justify-center text-emerald-500" }, "✔"),
  warning: createElement("span", { className: "inline-flex h-4 w-4 items-center justify-center text-amber-500" }, "⚠"),
  danger: createElement("span", { className: "inline-flex h-4 w-4 items-center justify-center text-rose-500" }, "✖"),
  info: createElement("span", { className: "inline-flex h-4 w-4 items-center justify-center text-slate-500" }, "ℹ")
};

const createConfig = (label: string, tone: NotificationDisplayTone, icon?: ReactNode): NotificationDisplayConfig => ({
  icon: icon ?? toneIcon[tone],
  label,
  textClass: toneTextClass[tone],
  badgeClass: `border-slate-200 bg-slate-50 text-slate-600`
});

const defaultDisplay: NotificationDisplayConfig = {
  icon: toneIcon.primary,
  label: "Notificación",
  textClass: toneTextClass.primary,
  badgeClass: `border-slate-200 bg-slate-50 text-slate-600`
};

export const notificationTypeConfig: Record<NotificationType, NotificationDisplayConfig> = {
  ADMIN_BOOKING_CREATED: createConfig(
    "Nueva reserva",
    "primary",
    createElement("span", { className: "inline-flex h-4 w-4 items-center justify-center text-sky-500" }, "🎫")
  ),
  ADMIN_BOOKING_CANCELLED: createConfig("Reserva cancelada", "danger"),
  ADMIN_BOOKING_MODIFIED: createConfig("Reserva modificada", "info"),
  ADMIN_BOOKING_NOTE: createConfig("Nota interna", "info"),
  ADMIN_SUPPLIER_PAYOUT_SENT: createConfig(
    "Pago al proveedor",
    "success",
    createElement("span", { className: "inline-flex h-4 w-4 items-center justify-center text-emerald-500" }, "💰")
  ),
  ADMIN_PAYMENT_FAILED: createConfig("Pago fallido", "warning"),
  ADMIN_SUPPLIER_LOW_AVAILABILITY: createConfig("Baja disponibilidad", "warning"),
  ADMIN_SYSTEM_ALERT: createConfig("Alerta del sistema", "warning"),
  ADMIN_CONTACT_REQUEST: createConfig("Solicitud de contacto", "info"),
  ADMIN_PARTNER_APPLICATION: createConfig("Nueva solicitud", "primary"),
  SUPPLIER_BOOKING_CREATED: createConfig(
    "Nueva reserva",
    "primary",
    createElement("span", { className: "inline-flex h-4 w-4 items-center justify-center text-sky-500" }, "🎫")
  ),
  SUPPLIER_BOOKING_CANCELLED: createConfig("Reserva cancelada", "danger"),
  SUPPLIER_BOOKING_MODIFIED: createConfig("Reserva actualizada", "info"),
  SUPPLIER_PAYOUT_CONFIRMED: createConfig("Payout confirmado", "success"),
  SUPPLIER_TOUR_REMINDER: createConfig("Recordatorio de tour", "info"),
  SUPPLIER_ACCOUNT_STATUS: createConfig(
    "Estado de cuenta",
    "success",
    createElement("span", { className: "inline-flex h-4 w-4 items-center justify-center text-slate-500" }, "💼")
  ),
  SUPPLIER_TOUR_REMOVED: createConfig("Tour eliminado", "danger"),
  AGENCY_BOOKING_CREATED: createConfig(
    "Reserva creada",
    "primary",
    createElement("span", { className: "inline-flex h-4 w-4 items-center justify-center text-sky-500" }, "🎫")
  ),
  AGENCY_BOOKING_CANCELLED: createConfig("Reserva cancelada", "danger"),
  AGENCY_BOOKING_MODIFIED: createConfig("Reserva modificada", "info"),
  AGENCY_COMMISSION_PAID: createConfig("Comisión pagada", "success"),
  AGENCY_PROMO_ALERT: createConfig("Promoción activa", "info"),
  AGENCY_ACCOUNT_STATUS: createConfig("Estado de cuenta", "info")
};

export function getNotificationDisplayProps(type?: NotificationType): NotificationDisplayConfig {
  if (!type) return defaultDisplay;
  return notificationTypeConfig[type] ?? defaultDisplay;
}
