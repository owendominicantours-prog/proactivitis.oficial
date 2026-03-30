import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildEmailShell } from "@/lib/emailTemplates";
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

    const html = buildEmailShell({
      title: "Restablece tu contrasena",
      intro: "Recibimos una solicitud para cambiar la contrasena de tu cuenta en Proactivitis.",
      baseUrl: APP_BASE_URL,
      tone: "warning",
      disclaimer:
        "Este correo fue enviado para ayudarte a restablecer el acceso a tu cuenta. Si no solicitaste este cambio, puedes ignorarlo con seguridad.",
      footerNote: "El enlace expira en 1 hora por motivos de seguridad.",
      contentHtml: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#475569;">
          Si fuiste tu quien inicio el proceso, usa el siguiente boton para crear una nueva contrasena segura.
        </p>
        <a href="${resetUrl}" style="display:inline-block;padding:14px 20px;border-radius:16px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:700;">
          Crear nueva contrasena
        </a>
        <p style="margin:18px 0 8px;font-size:13px;line-height:1.7;color:#64748b;">
          Si el boton no funciona, copia y pega esta URL en tu navegador.
        </p>
        <p style="margin:0;font-size:12px;word-break:break-all;color:#94a3b8;">${resetUrl}</p>
      `
    });

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
