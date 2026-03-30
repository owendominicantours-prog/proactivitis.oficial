import { mkdirSync, writeFileSync } from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildEmailShell } from "@/lib/emailTemplates";
import { createPartnerApplicationNotification } from "@/lib/notificationService";
import { notifyAdminPartnerApplication } from "@/lib/mailers/adminNotifications";

const REQUIRED_FIELDS = [
  "role",
  "companyName",
  "contactName",
  "contactRole",
  "email",
  "phone",
  "country",
  "description",
  "serviceTypes"
];

const UPLOADS_DIRECTORY = path.join(process.cwd(), "public", "uploads", "partner-applications");

const sanitizeFileName = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .slice(0, 120);

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  process.env.NEXTAUTH_URL ??
  "https://proactivitis.com";
const NOTIFY_FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL ?? "info@proactivitis.com";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const missing = REQUIRED_FIELDS.filter((field) => !body[field] || String(body[field]).trim() === "");

  if (missing.length) {
    return NextResponse.json(
      { error: `Faltan los campos requeridos: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const role = String(body.role).toUpperCase();
  const serviceTypes = Array.isArray(body.serviceTypes)
    ? body.serviceTypes.filter((value: unknown) => Boolean(value))
    : [];
  const normalizedEmail = String(body.email).toLowerCase().trim();
  const password = String(body.password ?? "").trim();
  const confirmPassword = String(body.confirmPassword ?? "").trim();

  if (password.length < 8) {
    return NextResponse.json({ error: "La contrasena debe tener al menos 8 caracteres." }, { status: 400 });
  }

  if (confirmPassword && password !== confirmPassword) {
    return NextResponse.json({ error: "Las contrasenas no coinciden." }, { status: 400 });
  }

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  let documentUrl: string | null = null;
  let documentName: string | null = null;

  if (body.documentData && typeof body.documentName === "string") {
    documentName = body.documentName;
    try {
      const buffer = Buffer.from(body.documentData, "base64");
      mkdirSync(UPLOADS_DIRECTORY, { recursive: true });
      const extension = path.extname(documentName ?? "");
      const safeName = `${randomUUID()}${extension || ""}`;
      const fullName = `${safeName}`;
      const destinationPath = path.join(UPLOADS_DIRECTORY, fullName);
      writeFileSync(destinationPath, buffer as unknown as Uint8Array);
      documentUrl = `/uploads/partner-applications/${fullName}`;
      documentName = sanitizeFileName(documentName ?? "");
    } catch (error) {
      console.error("No se pudo guardar el documento:", error);
    }
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const userData = {
    name: String(body.contactName),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    supplierApproved: role === "SUPPLIER" ? false : existingUser?.supplierApproved ?? false,
    agencyApproved: role === "AGENCY" ? false : existingUser?.agencyApproved ?? false,
    accountStatus: "PENDING",
    statusMessage: "Tu solicitud esta siendo revisada por nuestro equipo."
  };

  const user =
    existingUser?.id != null
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: userData
        })
      : await prisma.user.create({
          data: {
            id: randomUUID(),
            ...userData
          }
        });

  const application = await prisma.partnerApplication.create({
    data: {
      role,
      companyName: String(body.companyName),
      contactName: String(body.contactName),
      contactRole: String(body.contactRole),
      email: String(body.email),
      phone: String(body.phone),
      country: String(body.country),
      website: body.website ? String(body.website) : null,
      serviceTypes: serviceTypes.join(", "),
      description: String(body.description),
      documentName,
      documentUrl,
      userId: user.id
    }
  });

  await createPartnerApplicationNotification({ applicationId: application.id, companyName: application.companyName });
  void notifyAdminPartnerApplication({ application });

  const applicantHtml = buildEmailShell({
    eyebrow: "Solicitud recibida",
    title: "Gracias por aplicar a Proactivitis",
    intro: `Hola ${application.contactName ?? "aliado"}, ya recibimos tu solicitud como ${role === "SUPPLIER" ? "supplier" : "agencia"}.`,
    baseUrl: APP_BASE_URL,
    tone: "primary",
    disclaimer:
      "Este correo confirma que tu solicitud comercial fue recibida por Proactivitis y se encuentra en revision interna.",
    footerNote: "Nuestro equipo revisara la informacion y te contactara con la respuesta o con pasos adicionales si fueran necesarios.",
    contentHtml: `
      <div style="padding:20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
        <p style="margin:0;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#94a3b8;">Solicitud</p>
        <p style="margin:10px 0 0;font-size:18px;font-weight:600;color:#0f172a;">${application.companyName}</p>
        <p style="margin:6px 0 0;font-size:14px;color:#475569;">Contacto principal: ${application.contactName} (${application.contactRole})</p>
        <p style="margin:6px 0 0;font-size:14px;color:#475569;">Servicios: ${application.serviceTypes}</p>
      </div>
      <p style="margin:24px 0 0;font-size:14px;color:#475569;">
        Mientras validamos tu cuenta, puedes conservar este correo como comprobante de que la solicitud fue enviada correctamente.
      </p>
    `
  });

  void sendEmail({
    to: application.email,
    subject: "Recibimos tu solicitud",
    html: applicantHtml,
    from: NOTIFY_FROM_EMAIL
  }).catch((error) => {
    console.warn("No se pudo enviar el correo al solicitante", error);
  });

  return NextResponse.json({ id: application.id }, { status: 201 });
}
