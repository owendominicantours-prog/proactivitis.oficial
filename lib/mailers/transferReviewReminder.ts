import { sendEmail } from "@/lib/email";

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

  const subject = `¿Como te fue en tu traslado de ${payload.tourTitle}?`;
  const html = `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">
        <div style="padding:24px;background:#0f172a;color:#fff;">
          <h1 style="margin:0;font-size:22px;">Tu opinion nos ayuda a mejorar</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#cbd5e1;">
            Traslado: ${escapeHtml(payload.tourTitle)} · Fecha: ${escapeHtml(travelDateLabel)}
          </p>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 12px;">Hola ${escapeHtml(payload.customerName || "viajero")},</p>
          <p style="margin:0 0 16px;">
            Ya paso la fecha de tu traslado. Queremos conocer tu experiencia para seguir mejorando nuestro servicio.
          </p>
          <p style="margin:0 0 20px;">
            Dejar tu resena toma menos de 1 minuto.
          </p>
          <a href="${reviewUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 18px;border-radius:9999px;font-weight:600;">
            Dejar resena
          </a>
          <p style="margin:20px 0 0;font-size:12px;color:#64748b;">
            Si ya enviaste tu resena, puedes ignorar este correo.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: payload.to,
    from: FROM_EMAIL,
    subject,
    html
  });
}
