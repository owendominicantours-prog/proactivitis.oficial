import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/notificationService";
import { sendEmail } from "@/lib/email";
import { buildEmailShell } from "@/lib/emailTemplates";
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

  const summary = `${name} - ${email}${bookingCode ? ` - Reserva ${bookingCode}` : ""}`;
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

  const ackHtml = buildEmailShell({
    eyebrow: "Contacto Proactivitis",
    title: "Recibimos tu mensaje",
    intro: `Hola ${name || "viajero"}, gracias por escribirnos. Nuestro equipo revisara tu caso y respondera lo antes posible.`,
    baseUrl: APP_BASE_URL,
    tone: "primary",
    disclaimer:
      "Este correo confirma que recibimos tu solicitud de contacto. Si no reconoces este mensaje, puedes ignorarlo.",
    footerNote: "Tiempo estimado de respuesta: dentro de las proximas 24 horas laborables.",
    contentHtml: `
      <div style="padding:20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
        <p style="margin:0;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#94a3b8;">Resumen</p>
        <p style="margin:10px 0 0;font-size:16px;font-weight:600;color:#0f172a;">${topic}</p>
        ${bookingCode ? `<p style="margin:8px 0 0;font-size:14px;color:#475569;">Reserva asociada: <strong>${bookingCode}</strong></p>` : ""}
        <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#475569;">${message}</p>
      </div>
      <p style="margin:24px 0 0;font-size:14px;color:#475569;">
        Si necesitas agregar datos antes de nuestra respuesta, puedes escribir nuevamente desde el formulario de contacto oficial.
      </p>
    `
  });

  void sendEmail({
    to: email,
    subject: "Recibimos tu mensaje",
    html: ackHtml,
    from: NOTIFY_FROM_EMAIL
  }).catch((error) => {
    console.warn("No se pudo enviar la confirmacion al contacto", error);
  });

  return NextResponse.json({ success: true });
}
