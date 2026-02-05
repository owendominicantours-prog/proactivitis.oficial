import { PartnerApplication } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { resolveNotificationRecipients, type NotificationEmailKey } from "@/lib/notificationEmailSettings";

const DEFAULT_ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ??
  process.env.NOTIFY_FROM_EMAIL ??
  "info@proactivitis.com";
const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL ?? DEFAULT_ADMIN_EMAIL;
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

type AdminDetail = {
  label: string;
  value?: string | number | null;
};

const escapeHtml = (value: string | number | null | undefined) => {
  if (value === undefined || value === null) return "-";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatDetailList = (items: AdminDetail[]) =>
  items
    .filter((item) => item.value !== undefined && item.value !== null && item.value !== "")
    .map(
      (item) =>
        `<li style="margin-bottom:6px;"><strong style="display:inline-block;width:120px;color:#0f172a;">${escapeHtml(
          item.label
        )}:</strong> ${escapeHtml(item.value)}</li>`
    )
    .join("");

const buildAdminHtml = (subject: string, summary: string, details: AdminDetail[], footer?: string) => {
  const detailsHtml = formatDetailList(details);
  const now = new Date().toLocaleString("es-ES", { timeZone: "America/Santo_Domingo" });
  return `
    <div style="font-family:'Inter',sans-serif;background:#0f172a;color:#fff;padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(2,6,23,0.2);">
        <div style="background:linear-gradient(135deg,#0ea5e9,#0b67d0);padding:28px 32px;">
          <h1 style="margin:0;font-size:22px;color:#f8fbff;">${escapeHtml(subject)}</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#e2f0ff;">${escapeHtml(summary)}</p>
        </div>
        <div style="background:#f8fafc;padding:28px;color:#0f172a;">
          <ul style="list-style:none;margin:0;padding:0;">${detailsHtml}</ul>
          ${footer ? `<p style="margin-top:16px;font-size:13px;color:#475569;">${escapeHtml(footer)}</p>` : ""}
          <p style="margin-top:18px;font-size:11px;color:#64748b;">Dashboard admin: <a href="${APP_BASE_URL}/admin" style="color:#0ea5e9;">${APP_BASE_URL}/admin</a></p>
          <p style="margin-top:4px;font-size:11px;color:#a1a6b7;">Notificación generada ${escapeHtml(now)}</p>
        </div>
      </div>
    </div>
  `;
};

const sendAdminEmail = async (
  key: NotificationEmailKey,
  subject: string,
  summary: string,
  details: AdminDetail[],
  footer?: string
) => {
  const html = buildAdminHtml(subject, summary, details, footer);
  const recipients = await resolveNotificationRecipients(key);
  if (!recipients) {
    console.warn("No se configuró lista de correos para", key);
    return;
  }
  try {
    await sendEmail({
      to: recipients,
      from: FROM_EMAIL,
      subject,
      html
    });
  } catch (error) {
    console.error("Error enviando correo a admin:", error);
  }
};

type NotifyNewUserPayload = {
  userId: string;
  email: string;
  name?: string | null;
  role?: string | null;
};

export async function notifyAdminNewUser({ userId, email, name, role }: NotifyNewUserPayload) {
  await sendAdminEmail(
    "ADMIN_NEW_USER",
    "Nuevo cliente registrado",
    "Un nuevo viajero acaba de crear cuenta en el sitio.",
    [
      { label: "ID de usuario", value: userId },
      { label: "Nombre", value: name || "Sin nombre" },
      { label: "Correo", value: email },
      { label: "Rol", value: role ?? "CUSTOMER" }
    ],
    `Ver registros en: ${APP_BASE_URL}/admin/users`
  );
}

type NotifyPartnerApplicationPayload = {
  application: PartnerApplication;
};

export async function notifyAdminPartnerApplication({ application }: NotifyPartnerApplicationPayload) {
  await sendAdminEmail(
    "ADMIN_PARTNER_APPLICATION",
    `Nueva solicitud de ${application.role?.toLowerCase() ?? "partner"}`,
    "Revisa la solicitud para aprobarla o solicitar más información.",
    [
      { label: "Empresa", value: application.companyName },
      { label: "Contacto", value: `${application.contactName} (${application.contactRole})` },
      { label: "Correo", value: application.email },
      { label: "Teléfono", value: application.phone },
      { label: "País", value: application.country },
      { label: "Servicios", value: application.serviceTypes },
      { label: "Descripción", value: application.description }
    ],
    `Revisa la documentación aquí: ${APP_BASE_URL}/admin/partner-applications`
  );
}

type NotifyContactPayload = {
  name: string;
  email: string;
  topic: string;
  message: string;
  bookingCode?: string | null;
};

export async function notifyAdminContactRequest({ name, email, topic, message, bookingCode }: NotifyContactPayload) {
  await sendAdminEmail(
    "ADMIN_CONTACT_REQUEST",
    "Nueva solicitud desde el formulario de contacto",
    "Un visitante dejó un mensaje para el equipo.",
    [
      { label: "Nombre", value: name },
      { label: "Correo", value: email },
      { label: "Tema", value: topic },
      { label: "Reserva asociada", value: bookingCode ?? "Sin código" },
      { label: "Mensaje", value: message }
    ],
    `Agrégalo como ticket en Zoho: ${APP_BASE_URL}/admin/crm`
  );
}

type NotifyBookingPayload = {
  bookingId: string;
  orderCode: string;
  totalAmount: number;
  customerName?: string | null;
  customerEmail: string;
  tourTitle: string;
  tourSlug: string;
  flowType?: string | null;
  travelDate: Date;
  startTime?: string | null;
};

export async function notifyAdminBookingConfirmed(payload: NotifyBookingPayload) {
  await sendAdminEmail(
    "ADMIN_BOOKING_CONFIRMED",
    `Reserva confirmada ${payload.orderCode}`,
    "La reserva ya tiene pago confirmado y se generó el voucher.",
    [
      { label: "Código interno", value: payload.orderCode },
      { label: "ID de reserva", value: payload.bookingId },
      { label: "Cliente", value: payload.customerName ?? "Sin nombre" },
      { label: "Tour", value: payload.tourTitle },
      { label: "Fecha", value: payload.travelDate.toLocaleDateString("es-ES") },
      { label: "Hora", value: payload.startTime ?? "Pendiente" },
      { label: "Flow", value: payload.flowType ?? "tour" },
      { label: "Total", value: `$ ${payload.totalAmount.toFixed(2)} USD` },
      { label: "Email cliente", value: payload.customerEmail },
      { label: "Link tour", value: `${APP_BASE_URL}/tours/${payload.tourSlug}` }
    ],
    `Ve la reserva en: ${APP_BASE_URL}/admin/bookings`
  );
}

type TourModerationAction = "approved" | "changes_requested" | "sent_to_review" | "deleted";

type NotifyTourModerationPayload = {
  action: TourModerationAction;
  tourId: string;
  tourTitle: string;
  tourSlug: string;
  supplierName?: string | null;
  note?: string | null;
  reason?: string | null;
};

const actionLabelMap: Record<
  TourModerationAction,
  { subject: string; summary: string }
> = {
  approved: {
    subject: "Tour aprobado y publicado",
    summary: "El equipo publicó un tour aprobado."
  },
  changes_requested: {
    subject: "Tour necesita cambios",
    summary: "Se solicitaron modificaciones antes de publicar."
  },
  sent_to_review: {
    subject: "Tour enviado a revisión",
    summary: "Un proveedor envió un tour para revisión."
  },
  deleted: {
    subject: "Tour eliminado",
    summary: "Un tour fue eliminado y se notificó al proveedor."
  }
};

export async function notifyAdminTourModeration(payload: NotifyTourModerationPayload) {
  const actionInfo = actionLabelMap[payload.action];
  await sendAdminEmail(
    "ADMIN_TOUR_MODERATION",
    actionInfo.subject,
    actionInfo.summary,
    [
      { label: "Tour", value: payload.tourTitle },
      { label: "ID", value: payload.tourId },
      { label: "Slug", value: payload.tourSlug },
      { label: "Proveedor", value: payload.supplierName ?? "Proveedor no asignado" },
      ...(payload.note ? [{ label: "Nota admin", value: payload.note }] : []),
      ...(payload.reason ? [{ label: "Motivo eliminación", value: payload.reason }] : [])
    ],
    `Ver en moderación: ${APP_BASE_URL}/admin/tours`
  );
}

type NotifySupplierTourPayload = {
  to: string;
  action: TourModerationAction;
  tourTitle: string;
  tourSlug: string;
  note?: string | null;
  reason?: string | null;
};

const supplierActionCopy: Record<
  TourModerationAction,
  { subject: string; summary: string }
> = {
  approved: {
    subject: "Tu tour fue aprobado",
    summary: "Ya está publicado y visible para los clientes."
  },
  changes_requested: {
    subject: "Cambios solicitados en tu tour",
    summary: "Revisa las observaciones y vuelve a enviar tu tour."
  },
  sent_to_review: {
    subject: "Tu tour está en revisión",
    summary: "Nuestro equipo revisará tu tour pronto."
  },
  deleted: {
    subject: "Tu tour fue eliminado",
    summary: "El equipo eliminó el tour tras la revisión."
  }
};

export async function notifySupplierTourModeration({
  to,
  action,
  tourTitle,
  tourSlug,
  note,
  reason
}: NotifySupplierTourPayload) {
  if (!to) return;
  const actionInfo = supplierActionCopy[action];
  const html = buildAdminHtml(
    actionInfo.subject,
    actionInfo.summary,
    [
      { label: "Tour", value: tourTitle },
      { label: "Slug", value: tourSlug },
      ...(note ? [{ label: "Nota", value: note }] : []),
      ...(reason ? [{ label: "Motivo", value: reason }] : [])
    ],
    `Ver tour: ${APP_BASE_URL}/tours/${tourSlug}`
  );
  try {
    await sendEmail({
      to,
      from: FROM_EMAIL,
      subject: actionInfo.subject,
      html
    });
  } catch (error) {
    console.error("Error enviando correo al proveedor:", error);
  }
}

