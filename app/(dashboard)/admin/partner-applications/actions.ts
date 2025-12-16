import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createAccountStatusNotification } from "@/lib/notificationService";
import { NotificationRole, NotificationType } from "@/lib/types/notificationTypes";
import { sendResendEmail } from "@/lib/resend";

const ensureStatusMessage = (status: "APPROVED" | "REJECTED") =>
  status === "APPROVED"
    ? "Tu cuenta ha sido aprobada. Ya puedes acceder al panel según tu rol."
    : "Tu cuenta ha sido rechazada. Esta cuenta se borrará en 48 horas. Gracias por el interés.";

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

    await createAccountStatusNotification({
      userId: application.userId,
      role: application.role as NotificationRole,
      message: statusMessage,
      type: notificationType
    });
    if (status === "APPROVED" && application.User?.email) {
      await sendPartnerWelcome(application.User, application.role);
    }
  }

  revalidatePath("/admin/partner-applications");
  revalidatePath("/admin/crm");
}

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "https://proactivitis.com";

const welcomeTitles: Record<string, string> = {
  SUPPLIER: "Tu cuenta de proveedor está activa",
  AGENCY: "Tu cuenta de agencia está activa"
};

async function sendPartnerWelcome(user: { id: string; email: string | null; name?: string }, role: string) {
  if (!user.email) return;
  const subject = welcomeTitles[role] ?? "Tu cuenta en Proactivitis está activa";
  const html = `
    <div style="font-family:system-ui,sans-serif;background:#f4f5fb;color:#0f172a;padding:32px;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 30px 60px rgba(15,23,42,0.15);">
        <div style="background:linear-gradient(135deg,#0f172a,#0ea5e9);padding:28px 32px;color:#f8fafc;">
          <h1 style="margin:0;font-size:24px;font-weight:600;">${subject}</h1>
          <p style="margin:8px 0 0;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;">ID de cuenta: ${user.id}</p>
        </div>
        <div style="padding:32px;line-height:1.6;">
          <p style="margin:0 0 8px;">Hola ${user.name ?? "Aliado"},</p>
          <p style="margin:0 0 12px;">
            Tu acceso fue aprobado. Ya puedes iniciar sesión en el portal de ${role.toLowerCase()} y empezar a trabajar con viajeros
            reales utilizando herramientas de reservas, pagos y soporte en tiempo real.
          </p>
          <p style="margin:0 0 20px;font-size:14px;color:#475569;">
            Recuerda usar el ID de cuenta arriba como referencia cuando hables con soporte o consultes tu perfil.
          </p>
          <a
            href="${APP_BASE_URL}/auth/login"
            style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:#0ea5e9;color:#fff;border-radius:14px;font-weight:600;text-decoration:none;"
          >
            Ir al panel
          </a>
        </div>
        <div style="padding:16px 32px 28px;font-size:12px;color:#94a3b8;background:#f8fafc;text-align:center;">
          Gracias por confiar en Proactivitis. Estamos aquí para coordinar cada detalle contigo.
        </div>
      </div>
    </div>
  `;
  await sendResendEmail({
    to: user.email,
    subject,
    html
  });
}

export async function approveApplication(formData: FormData) {
  "use server";
  await updateApplicationStatus(formData, "APPROVED");
}

export async function rejectApplication(formData: FormData) {
  "use server";
  await updateApplicationStatus(formData, "REJECTED");
}
