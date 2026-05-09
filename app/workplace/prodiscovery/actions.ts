"use server";

import { revalidatePath } from "next/cache";

import { sendEmail } from "@/lib/email";
import { buildEmailShell } from "@/lib/emailTemplates";
import { prisma } from "@/lib/prisma";
import {
  BUDGET_TIER_LABELS,
  calculateGroupOpportunityAccounting,
  GROUP_TYPE_LABELS
} from "@/lib/prodiscoveryGroupOpportunity";
import { recordWorkplaceAuditLog, requireWorkplaceContext } from "@/lib/workplace";

const allowedStatuses = new Set(["NEW", "REVIEWING", "QUOTED", "ACCEPTED", "PAYMENT_STARTED", "WON", "LOST"]);
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  process.env.NEXTAUTH_URL?.replace(/\/+$/, "") ??
  "https://proactivitis.com";
const NOTIFY_FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL ?? "info@proactivitis.com";

const readString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const readNumber = (formData: FormData, key: string) => {
  const value = readString(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const escapeHtml = (value: string | number | null | undefined) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const paragraphHtml = (value: string) =>
  value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.75;color:#334155;">${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");

const detailCard = (label: string, value?: string | number | null) =>
  value === undefined || value === null || value === ""
    ? ""
    : `
      <div style="padding:14px 16px;border-radius:16px;background:#ffffff;border:1px solid rgba(15,23,42,0.08);">
        <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.24em;color:#94a3b8;">${escapeHtml(label)}</p>
        <p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:#0f172a;font-weight:700;">${escapeHtml(value)}</p>
      </div>
    `;

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export async function updateWorkplaceProDiscoveryOpportunityAction(formData: FormData) {
  const context = await requireWorkplaceContext("prodiscovery.manage");
  const canFinance = context.isAdmin || context.permissions.has("prodiscovery.finance");

  const id = readString(formData, "opportunityId");
  if (!id) throw new Error("Falta la solicitud ProDiscovery.");

  const opportunity = await prisma.proDiscoveryGroupOpportunity.findUnique({ where: { id } });
  if (!opportunity) throw new Error("Solicitud ProDiscovery no encontrada.");

  const requestedStatus = readString(formData, "status");
  const status = allowedStatuses.has(requestedStatus) ? requestedStatus : opportunity.status;
  const acceptedBudget = canFinance ? readNumber(formData, "acceptedBudget") : opportunity.acceptedBudget;
  const depositPercent = canFinance ? readNumber(formData, "depositPercent") ?? opportunity.depositPercent : opportunity.depositPercent;
  const leaderCommissionPercent = canFinance
    ? readNumber(formData, "leaderCommissionPercent") ?? opportunity.leaderCommissionPercent ?? 10
    : opportunity.leaderCommissionPercent;
  const leaderGuideId = readString(formData, "leaderGuideId") || null;
  const assignedToEmployeeId = readString(formData, "assignedToEmployeeId") || null;
  const itinerarySummary = readString(formData, "itinerarySummary") || opportunity.itinerarySummary;

  const accounting = calculateGroupOpportunityAccounting({
    groupSize: opportunity.groupSize,
    budgetTier: opportunity.budgetTier,
    acceptedBudget: acceptedBudget ?? opportunity.acceptedBudget ?? opportunity.estimatedBudget,
    depositPercent,
    leaderCommissionPercent
  });

  const guide = leaderGuideId
    ? await prisma.supplierProfile.findUnique({
        where: { id: leaderGuideId },
        include: { User: { select: { email: true } } }
      })
    : null;

  const beforeData = {
    status: opportunity.status,
    acceptedBudget: opportunity.acceptedBudget,
    depositPercent: opportunity.depositPercent,
    depositAmount: opportunity.depositAmount,
    leaderGuideId: opportunity.leaderGuideId,
    assignedToEmployeeId: opportunity.assignedToEmployeeId
  };

  const updated = await prisma.proDiscoveryGroupOpportunity.update({
    where: { id },
    data: {
      status,
      acceptedBudget,
      depositPercent,
      depositAmount: canFinance ? accounting.depositAmount : opportunity.depositAmount,
      leaderGuideId,
      leaderGuideName: guide?.company ?? null,
      leaderGuideEmail: guide?.User.email ?? null,
      leaderCommissionPercent,
      leaderCommissionAmount: canFinance ? accounting.leaderCommissionAmount : opportunity.leaderCommissionAmount,
      assignedToEmployeeId,
      itinerarySummary
    }
  });

  await recordWorkplaceAuditLog({
    actorUserId: context.user.id,
    employeeId: context.employee?.id ?? null,
    actionKey: "prodiscovery.update",
    moduleKey: "prodiscovery",
    resourceType: "ProDiscoveryGroupOpportunity",
    resourceId: id,
    beforeData,
    afterData: {
      status: updated.status,
      acceptedBudget: updated.acceptedBudget,
      depositPercent: updated.depositPercent,
      depositAmount: updated.depositAmount,
      leaderGuideId: updated.leaderGuideId,
      assignedToEmployeeId: updated.assignedToEmployeeId
    }
  });

  revalidatePath("/workplace/prodiscovery");
  revalidatePath("/dashboard/customer");
  revalidatePath("/admin/prodiscovery-opportunities");
}

export async function sendWorkplaceProDiscoveryCustomerMessageAction(formData: FormData) {
  const context = await requireWorkplaceContext("prodiscovery.manage");
  const canFinance = context.isAdmin || context.permissions.has("prodiscovery.finance");

  const id = readString(formData, "opportunityId");
  if (!id) throw new Error("Falta la solicitud ProDiscovery.");

  const opportunity = await prisma.proDiscoveryGroupOpportunity.findUnique({ where: { id } });
  if (!opportunity) throw new Error("Solicitud ProDiscovery no encontrada.");

  const intent = readString(formData, "messageIntent") === "reply" ? "reply" : "proposal";
  const proposalSubject = `Propuesta ProDiscovery #${opportunity.requestCode} - ${opportunity.city}`;
  const replySubject = `Respuesta ProDiscovery #${opportunity.requestCode}`;
  const rawSubject = readString(formData, "subject");
  const subject =
    rawSubject && !(intent === "reply" && rawSubject === proposalSubject)
      ? rawSubject
      : intent === "proposal"
        ? proposalSubject
        : replySubject;
  const message = readString(formData, "clientMessage");
  if (message.length < 12) throw new Error("Escribe un mensaje util para el cliente antes de enviar.");

  const publicSummary = readString(formData, "itinerarySummary") || opportunity.itinerarySummary || message;
  const acceptedBudget = canFinance ? readNumber(formData, "acceptedBudget") : opportunity.acceptedBudget;
  const depositPercent = canFinance ? readNumber(formData, "depositPercent") ?? opportunity.depositPercent : opportunity.depositPercent;
  const leaderCommissionPercent = opportunity.leaderCommissionPercent ?? 10;
  const accounting = calculateGroupOpportunityAccounting({
    groupSize: opportunity.groupSize,
    budgetTier: opportunity.budgetTier,
    acceptedBudget: acceptedBudget ?? opportunity.acceptedBudget ?? opportunity.estimatedBudget,
    depositPercent,
    leaderCommissionPercent
  });
  const depositAmount = canFinance ? accounting.depositAmount : opportunity.depositAmount;
  const nextStatus = intent === "proposal" ? "QUOTED" : opportunity.status === "NEW" ? "REVIEWING" : opportunity.status;
  const dashboardUrl = `${APP_BASE_URL}/auth/login?callbackUrl=${encodeURIComponent("/dashboard/customer")}`;
  const registerUrl = `${APP_BASE_URL}/auth/register?callbackUrl=${encodeURIComponent("/dashboard/customer")}`;

  const contentHtml = `
    <div style="padding:18px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
      ${paragraphHtml(message)}
    </div>
    <div style="display:grid;gap:12px;margin-top:18px;">
      ${detailCard("Codigo", opportunity.requestCode)}
      ${detailCard("Destino", opportunity.city)}
      ${detailCard("Grupo", `${GROUP_TYPE_LABELS[opportunity.groupType] ?? opportunity.groupType} - ${opportunity.groupSize} personas`)}
      ${detailCard("Presupuesto", acceptedBudget ? money.format(acceptedBudget) : BUDGET_TIER_LABELS[opportunity.budgetTier] ?? opportunity.budgetTier)}
      ${detailCard("Deposito", acceptedBudget && depositAmount ? `${money.format(depositAmount)} (${depositPercent}%)` : "Pendiente de confirmacion")}
      ${detailCard("Guia lider", opportunity.leaderGuideName)}
    </div>
    <div style="margin-top:18px;padding:18px;border-radius:18px;background:#ecfdf5;border:1px solid rgba(16,185,129,0.2);">
      <p style="margin:0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#047857;font-weight:800;">Tu cuenta ProDiscovery</p>
      <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:#065f46;">
        La propuesta tambien queda disponible en tu cuenta. Desde ahi puedes revisar el estado y pagar el deposito cuando este habilitado.
      </p>
      <div style="margin-top:14px;">
        <a href="${dashboardUrl}" style="display:inline-block;margin-right:10px;margin-bottom:8px;padding:12px 18px;border-radius:14px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:800;">Entrar a mi cuenta</a>
        <a href="${registerUrl}" style="display:inline-block;margin-bottom:8px;padding:12px 18px;border-radius:14px;background:#ffffff;color:#065f46;text-decoration:none;font-weight:800;border:1px solid rgba(16,185,129,0.35);">Crear cuenta</a>
      </div>
    </div>
  `;

  let emailStatus = "PENDING";
  let emailError: string | null = null;

  try {
    const html = buildEmailShell({
      eyebrow: "ProDiscovery Concierge",
      title: intent === "proposal" ? `Propuesta para ${opportunity.city}` : `Respuesta sobre ${opportunity.city}`,
      intro: `Hola ${opportunity.contactName}, el equipo ProDiscovery te escribe sobre la solicitud ${opportunity.requestCode}.`,
      baseUrl: APP_BASE_URL,
      tone: intent === "proposal" ? "success" : "primary",
      disclaimer: "Este correo corresponde a una solicitud de viaje a medida. No confirma una reserva hasta completar el deposito o la confirmacion indicada por el equipo.",
      reasonWhyReceived: "Recibes este correo porque completaste una solicitud ProDiscovery o estas gestionando una propuesta con nuestro equipo.",
      contentHtml
    });
    const result = await sendEmail({
      to: opportunity.contactEmail,
      subject,
      html,
      from: NOTIFY_FROM_EMAIL
    });
    emailStatus = result ? (intent === "proposal" ? "PROPOSAL_SENT" : "REPLY_SENT") : "SKIPPED";
  } catch (error) {
    emailStatus = "FAILED";
    emailError = error instanceof Error ? error.message : "Email failed";
  }

  const updated = await prisma.proDiscoveryGroupOpportunity.update({
    where: { id },
    data: {
      status: emailStatus === "PROPOSAL_SENT" || emailStatus === "REPLY_SENT" ? nextStatus : opportunity.status,
      acceptedBudget: canFinance ? acceptedBudget : opportunity.acceptedBudget,
      depositPercent,
      depositAmount: canFinance ? depositAmount : opportunity.depositAmount,
      itinerarySummary: publicSummary,
      emailStatus,
      emailError
    }
  });

  await recordWorkplaceAuditLog({
    actorUserId: context.user.id,
    employeeId: context.employee?.id ?? null,
    actionKey: intent === "proposal" ? "prodiscovery.proposal_email" : "prodiscovery.reply_email",
    moduleKey: "prodiscovery",
    resourceType: "ProDiscoveryGroupOpportunity",
    resourceId: id,
    metadata: {
      subject,
      emailStatus,
      emailError
    },
    beforeData: {
      status: opportunity.status,
      acceptedBudget: opportunity.acceptedBudget,
      depositAmount: opportunity.depositAmount,
      emailStatus: opportunity.emailStatus
    },
    afterData: {
      status: updated.status,
      acceptedBudget: updated.acceptedBudget,
      depositAmount: updated.depositAmount,
      emailStatus: updated.emailStatus
    }
  });

  revalidatePath("/workplace/prodiscovery");
  revalidatePath("/dashboard/customer");
  revalidatePath("/admin/prodiscovery-opportunities");
}
