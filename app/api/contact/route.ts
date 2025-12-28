import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/notificationService";
import { sendEmail } from "@/lib/email";
import { notifyAdminContactRequest } from "@/lib/mailers/adminNotifications";

const sanitizeField = (value: FormDataEntryValue | null): string => {
  return typeof value === "string" ? value.trim() : "";
};

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  process.env.NEXTAUTH_URL ??
  "https://proactivitis.com";
const NOTIFY_FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL ?? "info@proactivitis.com";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = sanitizeField(formData.get("name"));
  const email = sanitizeField(formData.get("email"));
  const topic = sanitizeField(formData.get("topic"));
  const bookingCode = sanitizeField(formData.get("bookingCode"));
  const message = sanitizeField(formData.get("message"));

  if (!name || !email || !topic || !message) {
    return NextResponse.json({ error: "Completa todos los campos obligatorios." }, { status: 400 });
  }

  const summary = `${name} • ${email}${bookingCode ? ` • Reserva ${bookingCode}` : ""}`;
  await createNotification({
    type: "ADMIN_CONTACT_REQUEST",
    role: "ADMIN",
    title: `Contacto: ${topic}`,
    message,
    metadata: {
      name,
      email,
      topic,
      bookingCode: bookingCode || null,
      summary
    }
  });

  void notifyAdminContactRequest({ name, email, topic, message, bookingCode: bookingCode || null });

  const ackHtml = `
    <div style="font-family:'Inter',sans-serif;background:#f8fafc;padding:32px;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(15,23,42,0.1);">
        <h1 style="margin:0 0 12px;font-size:18px;color:#0f172a;">Gracias por escribirnos</h1>
        <p style="margin:0 0 8px;font-size:15px;color:#475569;">
          Hola ${name || "viajero"}, recibimos tu mensaje sobre "${topic}". Nuestro equipo te contestará dentro de las próximas 24 horas.
        </p>
        <p style="margin:0;font-size:13px;color:#64748b;">
          Si quieres revisar tus solicitudes puedes visitar <a href="${APP_BASE_URL}" style="color:#0ea5e9;">${APP_BASE_URL}</a>.
        </p>
      </div>
    </div>
  `;

  void sendEmail({
    to: email,
    subject: "Recibimos tu mensaje",
    html: ackHtml,
    from: NOTIFY_FROM_EMAIL
  }).catch((error) => {
    console.warn("No se pudo enviar la confirmación al contacto", error);
  });

  return NextResponse.json({ success: true });
}
