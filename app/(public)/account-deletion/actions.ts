"use server";

import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { PROACTIVITIS_EMAIL } from "@/lib/seo";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const read = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

export async function requestAccountDeletionAction(formData: FormData) {
  const email = read(formData, "email").toLowerCase();
  const name = read(formData, "name");
  const details = read(formData, "details");

  if (!EMAIL_PATTERN.test(email)) {
    redirect("/account-deletion?error=email");
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.NOTIFY_FROM_EMAIL ?? PROACTIVITIS_EMAIL;
  const requestHtml = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h1>Solicitud de eliminacion de cuenta Proactivitis App</h1>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Nombre:</strong> ${name || "No indicado"}</p>
      <p><strong>Detalle:</strong> ${details || "Sin detalle adicional"}</p>
      <p>Esta solicitud fue iniciada desde https://proactivitis.com/account-deletion.</p>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: "Solicitud de eliminacion de cuenta Proactivitis App",
    category: "internal",
    html: requestHtml
  }).catch((error) => {
    console.warn("No se pudo enviar solicitud interna de eliminacion de cuenta", error);
  });

  await sendEmail({
    to: email,
    subject: "Recibimos tu solicitud de eliminacion de cuenta",
    category: "transactional",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h1>Solicitud recibida</h1>
        <p>Recibimos tu solicitud para eliminar una cuenta de cliente de la app Proactivitis.</p>
        <p>Por seguridad, nuestro equipo puede pedir verificacion antes de eliminar datos de una cuenta.</p>
        <p>Las sesiones, preferencias y metodos de pago guardados se eliminan cuando la cuenta se procesa. Algunos registros de reservas, pagos, seguridad, impuestos o disputas pueden conservarse cuando sea necesario.</p>
      </div>
    `
  }).catch((error) => {
    console.warn("No se pudo enviar confirmacion al solicitante", error);
  });

  redirect("/account-deletion?submitted=1");
}
