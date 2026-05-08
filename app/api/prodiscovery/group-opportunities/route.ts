import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { createNotification } from "@/lib/notificationService";
import {
  buildProDiscoveryOpportunityEmail,
  createProDiscoveryRequestCode,
  generateProDiscoveryItineraryDraft,
  normalizeProDiscoveryGroupPayload,
  toJsonValue
} from "@/lib/prodiscoveryGroupOpportunity";

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  process.env.NEXTAUTH_URL?.replace(/\/+$/, "") ??
  "https://proactivitis.com";
const NOTIFY_FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL ?? "info@proactivitis.com";

async function readPayload(request: NextRequest) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const payload = await readPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  const normalized = normalizeProDiscoveryGroupPayload(payload);
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.errors[0], errors: normalized.errors }, { status: 400 });
  }

  const data = normalized.data;
  const requestCode = createProDiscoveryRequestCode();
  const opportunity = await prisma.proDiscoveryGroupOpportunity.create({
    data: {
      requestCode,
      locale: data.locale,
      city: data.city,
      country: data.country,
      arrivalDate: data.arrivalDate,
      departureDate: data.departureDate,
      groupType: data.groupType,
      groupSize: data.groupSize,
      budgetTier: data.budgetTier,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      interests: toJsonValue(data.interests),
      languages: toJsonValue(data.languages),
      assistance: toJsonValue(data.assistance),
      holidayStyles: toJsonValue(data.holidayStyles),
      additionalServices: toJsonValue(data.additionalServices),
      flexibleTiming: data.flexibleTiming,
      preferredStartTime: data.preferredStartTime,
      preferredEndTime: data.preferredEndTime,
      leadPriority: data.leadPriority,
      dream: data.dream,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      companyName: data.companyName,
      estimatedBudget: data.estimatedBudget,
      depositPercent: data.depositPercent,
      depositAmount: data.depositAmount,
      geminiStatus: "PENDING",
      emailStatus: "PENDING"
    }
  });

  const generated = await generateProDiscoveryItineraryDraft(data, requestCode);
  let emailStatus = "PENDING";
  let emailError: string | null = null;

  try {
    const emailHtml = buildProDiscoveryOpportunityEmail({
      data,
      draft: generated.draft,
      requestCode,
      baseUrl: APP_BASE_URL
    });
    const result = await sendEmail({
      to: data.contactEmail,
      subject: `Estamos disenando su experiencia en ${data.city} - Propuesta Inicial #${requestCode}`,
      html: emailHtml,
      from: NOTIFY_FROM_EMAIL
    });
    emailStatus = result ? "SENT" : "SKIPPED";
  } catch (error) {
    emailStatus = "FAILED";
    emailError = error instanceof Error ? error.message : "Email failed";
  }

  await prisma.proDiscoveryGroupOpportunity.update({
    where: { id: opportunity.id },
    data: {
      itineraryDraft: toJsonValue(generated.draft),
      itinerarySummary: generated.draft.summary,
      geminiStatus: generated.status,
      geminiError: generated.error ?? null,
      emailStatus,
      emailError
    }
  });

  await createNotification({
    type: "ADMIN_PRODISCOVERY_GROUP_OPPORTUNITY",
    role: "ADMIN",
    title: `${data.leadPriority === "PRIORIDAD_VIP" ? "PRIORIDAD VIP - " : ""}Nueva oportunidad ProDiscovery ${requestCode}`,
    message: `${data.city} - ${data.groupSize} personas - ${data.contactName}`,
    metadata: {
      referenceUrl: `/admin/prodiscovery-opportunities?opportunityId=${opportunity.id}`,
      opportunityId: opportunity.id,
      requestCode,
      city: data.city,
      groupSize: data.groupSize,
      leadPriority: data.leadPriority
    }
  });

  return NextResponse.json({
    success: true,
    requestCode,
    opportunityId: opportunity.id,
    itinerary: generated.draft,
    leadPriority: data.leadPriority,
    emailStatus,
    geminiStatus: generated.status
  });
}
