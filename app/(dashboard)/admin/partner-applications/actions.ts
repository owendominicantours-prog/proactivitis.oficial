import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { createAccountStatusNotification } from "@/lib/notificationService";
import { NotificationRole, NotificationType } from "@/lib/types/notificationTypes";
import { sendEmail } from "@/lib/email";
import { buildEmailShell } from "@/lib/emailTemplates";
import { ensureSupplierProfile } from "@/lib/supplierProfiles";
import { ensureAgencyProfile } from "@/lib/agencyProfiles";

const ensureStatusMessage = (status: "APPROVED" | "REJECTED") =>
  status === "APPROVED"
    ? "Tu cuenta ha sido aprobada. Ya puedes acceder al panel segun tu rol."
    : "Tu cuenta ha sido rechazada. Esta cuenta se borrara en 48 horas. Gracias por el interes.";

async function updateApplicationStatus(formData: FormData, status: "APPROVED" | "REJECTED") {
  "use server";
  const id = formData.get("applicationId");
  if (!id || typeof id !== "string") {
    throw new Error("Falta el identificador de la solicitud.");
  }

  const application = await prisma.partnerApplication.findUnique({
    where: { id },
    include: { User: true }
  });

  if (!application) {
    throw new Error("Solicitud no encontrada.");
  }

  if (application.status === status) {
    revalidatePath("/admin/partner-applications");
    revalidatePath("/admin/crm");
    revalidatePath("/dashboard/supplier");
    revalidatePath("/dashboard/agency");
    return;
  }

  await prisma.partnerApplication.update({
    where: { id },
    data: { status }
  });

  if (application.userId) {
    const statusMessage = ensureStatusMessage(status);

    await prisma.user.update({
      where: { id: application.userId },
      data: {
        supplierApproved: status === "APPROVED" && application.role === "SUPPLIER",
        agencyApproved: status === "APPROVED" && application.role === "AGENCY",
        accountStatus: status === "APPROVED" ? "APPROVED" : "REJECTED",
        statusMessage,
        rejectionAt: status === "REJECTED" ? new Date() : null
      }
    });

    const notificationType: NotificationType =
      application.role === "SUPPLIER" ? "SUPPLIER_ACCOUNT_STATUS" : "AGENCY_ACCOUNT_STATUS";

    const uniqueId = randomUUID();
    const metadata = {
      userId: application.userId,
      applicationId: application.id,
      notificationUniqueId: uniqueId
    };

    const messageKey = `${application.userId}-${notificationType}-${statusMessage}`;
    const alreadyNotified = await prisma.notification.findFirst({
      where: {
        type: notificationType,
        role: application.role as NotificationRole,
        metadata: { contains: `"messageKey":"${messageKey}"` }
      }
    });

    if (!alreadyNotified) {
      await createAccountStatusNotification({
        userId: application.userId,
        role: application.role as NotificationRole,
        message: statusMessage,
        type: notificationType,
        metadata: { ...metadata, messageKey }
      });
    }

    if (status === "APPROVED" && application.role === "SUPPLIER") {
      await ensureSupplierProfile(application.userId, application.companyName ?? "Proveedor");
    }
    if (status === "APPROVED" && application.role === "AGENCY") {
      await ensureAgencyProfile(application.userId, application.companyName ?? "Agencia");
    }
    if (status === "APPROVED" && application.User?.email) {
      await sendPartnerWelcome(application.User, application.role);
    }
  }

  revalidatePath("/admin/partner-applications");
  revalidatePath("/admin/crm");
  revalidatePath("/dashboard/supplier");
  revalidatePath("/dashboard/agency");
}

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "https://proactivitis.com";

const welcomeTitles: Record<string, string> = {
  SUPPLIER: "Tu cuenta de proveedor esta activa",
  AGENCY: "Tu cuenta de agencia esta activa"
};

async function sendPartnerWelcome(user: { id: string; email: string | null; name?: string | null }, role: string) {
  if (!user.email) return;
  const subject = welcomeTitles[role] ?? "Tu cuenta en Proactivitis esta activa";
  const portalPath = role === "SUPPLIER" ? "/supplier" : "/agency";
  const html = buildEmailShell({
    eyebrow: "Cuenta aprobada",
    title: subject,
    intro: `Hola ${user.name ?? "aliado"}, tu acceso fue aprobado y ya puedes comenzar a trabajar dentro del portal de ${role.toLowerCase()}.`,
    baseUrl: APP_BASE_URL,
    tone: "success",
    disclaimer:
      "Este correo confirma la activacion de una cuenta comercial dentro de Proactivitis. Guardalo como referencia de aprobacion.",
    footerNote: `ID de cuenta: ${user.id}. Usa este identificador cuando hables con soporte o necesites validar tu perfil.`,
    contentHtml: `
      <div style="padding:20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
        <p style="margin:0;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#94a3b8;">Siguientes pasos</p>
        <ul style="margin:14px 0 0;padding-left:20px;color:#475569;font-size:14px;line-height:1.7;">
          <li>Inicia sesion en tu panel comercial.</li>
          <li>Revisa reservas, herramientas y configuracion inicial.</li>
          <li>Completa cualquier dato operativo pendiente antes de vender.</li>
        </ul>
      </div>
      <a
        href="${APP_BASE_URL}${portalPath}"
        style="display:inline-block;margin-top:24px;padding:12px 22px;border-radius:14px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:700;"
      >
        Abrir mi panel
      </a>
    `
  });
  await sendEmail({
    to: user.email,
    subject,
    html
  });
}

export async function ensureSupplierProfileAction(formData: FormData) {
  "use server";
  const id = formData.get("applicationId");
  if (!id || typeof id !== "string") {
    throw new Error("Falta el identificador de la solicitud.");
  }
  const application = await prisma.partnerApplication.findUnique({
    where: { id },
    include: { User: true }
  });
  if (!application?.userId) {
    throw new Error("Solicitud o usuario invalido.");
  }
  await ensureSupplierProfile(application.userId, application.companyName);
  revalidatePath("/admin/partner-applications");
  revalidatePath("/admin/crm");
  revalidatePath("/dashboard/supplier");
}

export async function approveApplication(formData: FormData) {
  "use server";
  await updateApplicationStatus(formData, "APPROVED");
}

export async function rejectApplication(formData: FormData) {
  "use server";
  await updateApplicationStatus(formData, "REJECTED");
}
