"use server";

import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildEmailShell } from "@/lib/emailTemplates";
import { notifyAdminNewUser } from "@/lib/mailers/adminNotifications";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";

const SALT_ROUNDS = 12;

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "https://proactivitis.com";

type RegisterBody = {
  email?: string;
  password?: string;
  name?: string;
};

const benefitList = [
  "Proveedores verificados",
  "Confirmacion rapida",
  "Soporte real por WhatsApp",
  "Reservas y vouchers en un solo lugar"
];

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as RegisterBody;
    const rawEmail = body.email?.toString().trim() ?? "";
    const rawPassword = body.password?.toString() ?? "";
    const rawName = body.name?.toString().trim() ?? "";

    if (!rawEmail || !rawPassword) {
      return NextResponse.json({ error: "Email y contrasena son requeridos" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      return NextResponse.json({ error: "El correo no parece valido" }, { status: 400 });
    }

    if (rawPassword.length < 8) {
      return NextResponse.json({ error: "La contrasena debe tener al menos 8 caracteres" }, { status: 400 });
    }

    const normalizedEmail = rawEmail.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (existing) {
      return NextResponse.json({ error: "Ese correo ya tiene una cuenta registrada" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(rawPassword, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: rawName || null,
        email: normalizedEmail,
        password: hashed,
        role: "CUSTOMER",
        supplierApproved: false,
        accountStatus: "APPROVED"
      }
    });

    const recommendedTours = await prisma.tour.findMany({
      where: { status: "published", slug: { not: HIDDEN_TRANSFER_SLUG } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        title: true,
        price: true,
        slug: true,
        location: true
      }
    });

    const benefitItems = benefitList
      .map(
        (item) => `
          <li style="margin-bottom:8px;color:#475569;">${item}</li>
        `
      )
      .join("");

    const tourCards = recommendedTours
      .map(
        (tour) => `
          <div style="padding:16px;border-radius:16px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);margin-bottom:12px;">
            <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${tour.title}</p>
            <p style="margin:6px 0 0;font-size:14px;color:#475569;">${tour.location} - USD ${tour.price.toFixed(0)}</p>
            <a href="${APP_BASE_URL}/tours/${tour.slug}" style="display:inline-block;margin-top:10px;color:#0ea5e9;font-weight:700;text-decoration:none;">
              Ver experiencia
            </a>
          </div>
        `
      )
      .join("");

    const htmlBody = buildEmailShell({
      eyebrow: "Bienvenido",
      title: "Tu cuenta ya esta lista",
      intro: `Hola ${rawName || "viajero"}, ya puedes explorar tours, traslados y reservas dentro de Proactivitis.`,
      baseUrl: APP_BASE_URL,
      tone: "primary",
      disclaimer:
        "Este correo confirma la creacion de tu cuenta en Proactivitis y contiene accesos directos a tu experiencia inicial dentro de la plataforma.",
      footerNote: `ID de cuenta: ${user.id}. Usa este identificador si necesitas ayuda con tu perfil.`,
      contentHtml: `
        <div style="padding:20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
          <p style="margin:0;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#94a3b8;">Que puedes hacer</p>
          <ul style="margin:14px 0 0;padding-left:20px;font-size:14px;line-height:1.7;">
            ${benefitItems}
          </ul>
        </div>
        <div style="margin-top:24px;">
          <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#0f172a;">Sugerencias para empezar</p>
          ${
            tourCards ||
            `<p style="margin:0;font-size:14px;color:#475569;">Pronto te mostraremos nuevas experiencias destacadas para tu cuenta.</p>`
          }
        </div>
        <a
          href="${APP_BASE_URL}/tours"
          style="display:inline-block;margin-top:24px;padding:14px 24px;background:#006bff;color:#ffffff;border-radius:16px;font-weight:700;text-decoration:none;"
        >
          Explorar experiencias
        </a>
      `
    });

    await sendEmail({
      to: normalizedEmail,
      subject: "Bienvenido a Proactivitis",
      html: htmlBody
    }).catch((err) => {
      console.warn("No se pudo enviar el email de bienvenida a", normalizedEmail, err?.message ?? err);
    });

    void notifyAdminNewUser({
      userId: user.id,
      email: normalizedEmail,
      name: rawName || null,
      role: user.role
    });

    return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Register error", error);
    const message = error instanceof Error ? error.message : "Error interno creando la cuenta";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
