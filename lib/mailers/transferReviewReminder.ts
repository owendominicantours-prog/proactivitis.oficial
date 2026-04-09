import { sendEmail } from "@/lib/email";
import { buildEmailShell } from "@/lib/emailTemplates";

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const FROM_EMAIL =
  process.env.NOTIFY_FROM_EMAIL ??
  process.env.ADMIN_NOTIFICATION_EMAIL ??
  "info@proactivitis.com";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type TransferReviewReminderPayload = {
  to: string;
  bookingId: string;
  customerName: string;
  tourTitle: string;
  travelDate: Date;
};

export async function sendTransferReviewReminder(payload: TransferReviewReminderPayload) {
  const reviewUrl = `${APP_BASE_URL}/transfer-review/${payload.bookingId}`;
  const travelDateLabel = new Intl.DateTimeFormat("es-DO", {
    dateStyle: "long",
    timeZone: "America/Santo_Domingo"
  }).format(payload.travelDate);

  const subject = `Como te fue en tu traslado de ${payload.tourTitle}?`;
  const html = buildEmailShell({
    eyebrow: "Tu opinion cuenta",
    title: "Ayudanos con tu resena",
    intro: `Hola ${payload.customerName || "viajero"}, queremos saber como fue tu experiencia en el traslado ${payload.tourTitle}.`,
    baseUrl: APP_BASE_URL,
    tone: "primary",
    disclaimer:
      "Este correo fue enviado para invitarte a dejar una opinion sobre un traslado realizado con Proactivitis.",
    footerNote: "Responder toma menos de un minuto y nos ayuda a mejorar el servicio para futuros viajeros.",
    contentHtml: `
      <div style="padding:20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
        <p style="margin:0;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#94a3b8;">Servicio completado</p>
        <p style="margin:10px 0 0;font-size:18px;font-weight:600;color:#0f172a;">${escapeHtml(payload.tourTitle)}</p>
        <p style="margin:8px 0 0;font-size:14px;color:#475569;">Fecha del servicio: ${escapeHtml(travelDateLabel)}</p>
      </div>
      <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#475569;">
        Tu opinion ayuda a otros viajeros a reservar con mas confianza y nos permite mejorar la operacion diaria.
      </p>
      <a
        href="${reviewUrl}"
        style="display:inline-block;margin-top:20px;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:14px;font-weight:700;"
      >
        Dejar mi resena
      </a>
    `
  });

  return sendEmail({
    to: payload.to,
    from: FROM_EMAIL,
    subject,
    html,
    category: "optional"
  });
}
