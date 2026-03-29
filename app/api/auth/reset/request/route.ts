import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { createPasswordResetToken } from "@/lib/passwordReset";

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  process.env.NEXTAUTH_URL ??
  "https://proactivitis.com";

const NOTIFY_FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL ?? "info@proactivitis.com";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Debes indicar un correo valido." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (user) {
    const token = createPasswordResetToken(user.email);
    const resetUrl = `${APP_BASE_URL}/auth/reset?token=${encodeURIComponent(token)}`;

    const html = `
      <div style="font-family:Inter,system-ui,sans-serif;background:#f8fafc;padding:32px;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;box-shadow:0 20px 60px rgba(15,23,42,0.12);">
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#64748b;">Proactivitis</p>
          <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a;">Restablece tu contrasena</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#475569;">
            Recibimos una solicitud para cambiar la contrasena de tu cuenta. Si fuiste tu, usa el siguiente boton.
          </p>
          <a href="${resetUrl}" style="display:inline-block;padding:14px 20px;border-radius:16px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:700;">
            Crear nueva contrasena
          </a>
          <p style="margin:18px 0 8px;font-size:13px;line-height:1.7;color:#64748b;">
            Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este mensaje.
          </p>
          <p style="margin:0;font-size:12px;word-break:break-all;color:#94a3b8;">${resetUrl}</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Restablece tu contrasena en Proactivitis",
      html,
      from: NOTIFY_FROM_EMAIL
    });
  }

  return NextResponse.json({
    success: true,
    message: "Si el correo existe en nuestra base de datos, recibiras un enlace para restablecer la contrasena."
  });
}
