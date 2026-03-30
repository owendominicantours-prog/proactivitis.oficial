import { PartnerApplication } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { buildEmailShell } from "@/lib/emailTemplates";
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

const formatDetailRows = (items: AdminDetail[]) =>
  items
    .filter((item) => item.value !== undefined && item.value !== null && item.value !== "")
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;vertical-align:top;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;width:165px;">
            ${escapeHtml(item.label)}
          </td>
          <td style="padding:10px 0;font-size:14px;line-height:1.65;color:#0f172a;font-weight:600;">
            ${escapeHtml(item.value)}
          </td>
        </tr>
      `
    )
    .join("");

const buildAdminHtml = (subject: string, summary: string, details: AdminDetail[], footer?: string) => {
  const detailsHtml = formatDetailRows(details);
  const now = new Date().toLocaleString("es-ES", { timeZone: "America/Santo_Domingo" });

  return buildEmailShell({
    eyebrow: "Notificacion interna",
    title: subject,
    intro: summary,
    baseUrl: APP_BASE_URL,
    tone: "dark",
    disclaimer:
      "Este correo fue enviado por Proactivitis para informar un evento interno del panel administrativo. Compartelo solo con el equipo autorizado.",
    footerNote: footer ?? `Generado automaticamente el ${now}.`,
    contentHtml: `
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        ${detailsHtml}
      </table>
      <div style="margin-top:24px;padding:18px;border-radius:16px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
        <p style="margin:0;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#94a3b8;">Panel admin</p>
        <a href="${APP_BASE_URL}/admin" style="display:inline-block;margin-top:10px;color:#0ea5e9;font-weight:700;text-decoration:none;">
          Abrir panel administrativo
        </a>
      </div>
    `
  });
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
    console.warn("No se configuro lista de correos para", key);
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
    "Revisa la solicitud para aprobarla o solicitar mas informacion.",
    [
      { label: "Empresa", value: application.companyName },
      { label: "Contacto", value: `${application.contactName} (${application.contactRole})` },
      { label: "Correo", value: application.email },
      { label: "Telefono", value: application.phone },
      { label: "Pais", value: application.country },
      { label: "Servicios", value: application.serviceTypes },
      { label: "Descripcion", value: application.description }
    ],
    `Revisa la documentacion aqui: ${APP_BASE_URL}/admin/partner-applications`
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
    "Un visitante dejo un mensaje para el equipo.",
    [
      { label: "Nombre", value: name },
      { label: "Correo", value: email },
      { label: "Tema", value: topic },
      { label: "Reserva asociada", value: bookingCode ?? "Sin codigo" },
      { label: "Mensaje", value: message }
    ],
    `Agregalo como ticket en Zoho: ${APP_BASE_URL}/admin/crm`
  );
}

type NotifyHotelQuotePayload = {
  hotelName: string;
  hotelSlug: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  childrenAges?: string | null;
  rooms: number;
  name: string;
  email: string;
  phone?: string | null;
  notes?: string | null;
  locale?: string | null;
};

export async function notifyAdminHotelQuoteRequest(payload: NotifyHotelQuotePayload) {
  await sendAdminEmail(
    "ADMIN_HOTEL_QUOTE_REQUEST",
    `Nueva cotizacion hotel: ${payload.hotelName}`,
    "Un cliente envio una solicitud desde el widget de alojamiento.",
    [
      { label: "Hotel", value: payload.hotelName },
      { label: "Slug", value: payload.hotelSlug },
      { label: "Check-in", value: payload.checkIn },
      { label: "Check-out", value: payload.checkOut },
      { label: "Adultos", value: payload.adults },
      { label: "Ninos", value: payload.children },
      { label: "Edades ninos", value: payload.childrenAges ?? "-" },
      { label: "Habitaciones", value: payload.rooms },
      { label: "Nombre", value: payload.name },
      { label: "Correo", value: payload.email },
      { label: "Telefono", value: payload.phone ?? "-" },
      { label: "Idioma", value: payload.locale ?? "es" },
      { label: "Notas", value: payload.notes ?? "-" }
    ],
    `Revisa solicitudes en: ${APP_BASE_URL}/admin/bookings`
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
    "La reserva ya tiene pago confirmado y se genero el voucher.",
    [
      { label: "Codigo interno", value: payload.orderCode },
      { label: "ID de reserva", value: payload.bookingId },
      { label: "Cliente", value: payload.customerName ?? "Sin nombre" },
      { label: "Servicio", value: payload.tourTitle },
      { label: "Fecha", value: payload.travelDate.toLocaleDateString("es-ES") },
      { label: "Hora", value: payload.startTime ?? "Pendiente" },
      { label: "Flujo", value: payload.flowType ?? "tour" },
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

const actionLabelMap: Record<TourModerationAction, { subject: string; summary: string }> = {
  approved: {
    subject: "Tour aprobado y publicado",
    summary: "El equipo publico un tour aprobado."
  },
  changes_requested: {
    subject: "Tour necesita cambios",
    summary: "Se solicitaron modificaciones antes de publicar."
  },
  sent_to_review: {
    subject: "Tour enviado a revision",
    summary: "Un proveedor envio un tour para revision."
  },
  deleted: {
    subject: "Tour eliminado",
    summary: "Un tour fue eliminado y se notifico al proveedor."
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
      ...(payload.reason ? [{ label: "Motivo eliminacion", value: payload.reason }] : [])
    ],
    `Ver en moderacion: ${APP_BASE_URL}/admin/tours`
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

const supplierActionCopy: Record<TourModerationAction, { subject: string; summary: string }> = {
  approved: {
    subject: "Tu tour fue aprobado",
    summary: "Ya esta publicado y visible para los clientes."
  },
  changes_requested: {
    subject: "Cambios solicitados en tu tour",
    summary: "Revisa las observaciones y vuelve a enviar tu tour."
  },
  sent_to_review: {
    subject: "Tu tour esta en revision",
    summary: "Nuestro equipo revisara tu tour pronto."
  },
  deleted: {
    subject: "Tu tour fue eliminado",
    summary: "El equipo elimino el tour tras la revision."
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
  const html = buildEmailShell({
    eyebrow: "Moderacion de tours",
    title: actionInfo.subject,
    intro: actionInfo.summary,
    baseUrl: APP_BASE_URL,
    tone: action === "approved" ? "success" : action === "deleted" ? "warning" : "dark",
    disclaimer:
      "Este correo fue enviado por Proactivitis para informarte el estado actual de un tour dentro del flujo de moderacion y publicacion.",
    footerNote: "Puedes entrar al panel supplier para revisar el historial completo del tour y responder cualquier observacion pendiente.",
    contentHtml: `
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        ${formatDetailRows([
          { label: "Tour", value: tourTitle },
          { label: "Slug", value: tourSlug },
          ...(note ? [{ label: "Nota", value: note }] : []),
          ...(reason ? [{ label: "Motivo", value: reason }] : [])
        ])}
      </table>
      <div style="margin-top:24px;padding:18px;border-radius:16px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
        <a href="${APP_BASE_URL}/supplier/tours" style="display:inline-block;color:#0ea5e9;font-weight:700;text-decoration:none;">
          Abrir panel de tours
        </a>
      </div>
    `
  });
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
