"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/adminAccess";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import {
  getGeminiSeoFactoryConfig,
  runGeminiSeoFactoryBatch,
  saveGeminiSeoFactoryConfig,
  updateGeminiSeoLandingStatus
} from "@/lib/geminiSeoFactory";
import {
  getGeminiGlobalTourFactoryConfig,
  runGeminiGlobalTourFactoryBatch,
  saveGeminiGlobalTourFactoryConfig
} from "@/lib/geminiGlobalTourFactory";
import {
  importKeywordPlannerCsv,
  updateKeywordPlannerStatus,
  type KeywordPlannerStatus
} from "@/lib/keywordPlanner";
import {
  submitSeoFactorySitemapsToSearchConsole,
  submitTransferLandingSitemapsToSearchConsole
} from "@/lib/googleSearchConsole";

export async function refreshTransferLandingsAction() {
  await requireAdminSession();

  const combos = await getDynamicTransferLandingCombos();
  combos.forEach((combo) => {
    revalidatePath(`/transfer/${combo.landingSlug}`);
    combo.aliasSlugs.forEach((aliasSlug) => {
      revalidatePath(`/transfer/${aliasSlug}`);
    });
  });
  revalidatePath("/sitemap-transfers.xml");
  revalidatePath("/sitemap-things-to-do.xml");
  revalidatePath("/sitemap-admin-landings-extra.xml");
  await submitTransferLandingSitemapsToSearchConsole("admin-transfer-landings-refresh");
  return combos.map((combo) => combo.landingSlug);
}

const revalidateGeminiSeoFactory = (slug?: string) => {
  revalidatePath("/admin/landings");
  revalidatePath("/admin/landings/seo-factory");
  revalidatePath("/admin/landings/keyword-planner");
  revalidatePath("/sitemap-seo-factory.xml");
  revalidatePath("/sitemap-index.xml");
  if (slug) {
    revalidatePath(`/punta-cana/${slug}`);
    revalidatePath(`/en/punta-cana/${slug}`);
    revalidatePath(`/fr/punta-cana/${slug}`);
    revalidatePath(`/seo/${slug}`);
    revalidatePath(`/en/seo/${slug}`);
    revalidatePath(`/fr/seo/${slug}`);
  }
};

export async function saveGeminiSeoFactorySettingsAction(formData: FormData) {
  await requireAdminSession();

  const current = await getGeminiSeoFactoryConfig();
  const dailyLimit = Number(formData.get("dailyLimit") ?? current.dailyLimit);
  const tourDailyLimit = Number(formData.get("tourDailyLimit") ?? current.tourDailyLimit);
  const transferDailyLimit = Number(formData.get("transferDailyLimit") ?? current.transferDailyLimit);

  await saveGeminiSeoFactoryConfig({
    enabled: formData.get("enabled") === "on",
    autoPublish: formData.get("autoPublish") === "on",
    dailyLimit: Number.isFinite(dailyLimit) ? Math.max(1, Math.min(50, dailyLimit)) : current.dailyLimit,
    tourDailyLimit: Number.isFinite(tourDailyLimit) ? Math.max(0, Math.min(50, tourDailyLimit)) : current.tourDailyLimit,
    transferDailyLimit: Number.isFinite(transferDailyLimit)
      ? Math.max(0, Math.min(50, transferDailyLimit))
      : current.transferDailyLimit,
    pausedSchemaAutopilot: true
  });
  revalidateGeminiSeoFactory();
}

export async function generateGeminiSeoFactoryBatchAction(formData: FormData) {
  await requireAdminSession();

  const limit = Number(formData.get("limit") ?? "3");
  const result = await runGeminiSeoFactoryBatch({
    manualLimit: Number.isFinite(limit) ? Math.max(1, Math.min(20, limit)) : 3
  });
  revalidateGeminiSeoFactory();
  if (result.published > 0) {
    await submitSeoFactorySitemapsToSearchConsole("admin-seo-factory-generate");
  }
}

export async function publishGeminiSeoLandingAction(formData: FormData) {
  await requireAdminSession();

  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await updateGeminiSeoLandingStatus(slug, "published");
  revalidateGeminiSeoFactory(slug);
  await submitSeoFactorySitemapsToSearchConsole("admin-seo-factory-publish");
}

export async function draftGeminiSeoLandingAction(formData: FormData) {
  await requireAdminSession();

  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await updateGeminiSeoLandingStatus(slug, "draft");
  revalidateGeminiSeoFactory(slug);
}

export async function rejectGeminiSeoLandingAction(formData: FormData) {
  await requireAdminSession();

  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await updateGeminiSeoLandingStatus(slug, "rejected");
  revalidateGeminiSeoFactory(slug);
}

const revalidateGeminiGlobalTourFactory = () => {
  revalidatePath("/admin/landings/seo-factory");
  revalidatePath("/admin/tours");
  revalidatePath("/tours");
  revalidatePath("/destinations");
};

export async function saveGeminiGlobalTourFactorySettingsAction(formData: FormData) {
  await requireAdminSession();

  const current = await getGeminiGlobalTourFactoryConfig();
  const batchSize = Number(formData.get("globalBatchSize") ?? current.batchSize);
  const dailyLimit = Number(formData.get("globalDailyLimit") ?? current.dailyLimit);
  const markupPerPerson = Number(formData.get("globalMarkupPerPerson") ?? current.markupPerPerson);
  const minLeadHours = Number(formData.get("globalMinLeadHours") ?? current.minLeadHours);

  await saveGeminiGlobalTourFactoryConfig({
    enabled: formData.get("globalEnabled") === "on",
    batchSize: Number.isFinite(batchSize) ? Math.max(1, Math.min(2, batchSize)) : current.batchSize,
    dailyLimit: Number.isFinite(dailyLimit) ? Math.max(1, Math.min(192, dailyLimit)) : current.dailyLimit,
    markupPerPerson: Number.isFinite(markupPerPerson)
      ? Math.max(0, Math.min(500, markupPerPerson))
      : current.markupPerPerson,
    minLeadHours: Number.isFinite(minLeadHours) ? Math.max(12, Math.min(168, minLeadHours)) : current.minLeadHours
  });
  revalidateGeminiGlobalTourFactory();
}

export async function generateGeminiGlobalTourFactoryBatchAction(formData: FormData) {
  await requireAdminSession();

  const limit = Number(formData.get("limit") ?? "2");
  await runGeminiGlobalTourFactoryBatch({
    manualLimit: Number.isFinite(limit) ? Math.max(1, Math.min(2, limit)) : 2
  });
  revalidateGeminiGlobalTourFactory();
}

export async function importKeywordPlannerCsvAction(formData: FormData) {
  await requireAdminSession();

  const files = formData.getAll("keywordCsv").filter((file): file is File => file instanceof File && file.size > 0);
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = buffer[0] === 0xff && buffer[1] === 0xfe ? buffer.toString("utf16le") : buffer.toString("utf8");
    await importKeywordPlannerCsv({
      fileName: file.name || "keyword-planner.csv",
      text
    });
  }
  revalidatePath("/admin/landings/keyword-planner");
  revalidatePath("/admin/landings/seo-factory");
}

export async function updateKeywordPlannerStatusAction(formData: FormData) {
  await requireAdminSession();

  const normalizedKeyword = String(formData.get("normalizedKeyword") ?? "");
  const status = String(formData.get("status") ?? "pending") as KeywordPlannerStatus;
  const allowedStatuses: KeywordPlannerStatus[] = [
    "new",
    "pending",
    "in_process",
    "draft_created",
    "published",
    "duplicate",
    "ignored"
  ];
  if (!normalizedKeyword || !allowedStatuses.includes(status)) return;
  await updateKeywordPlannerStatus(normalizedKeyword, status);
  revalidatePath("/admin/landings/keyword-planner");
  revalidatePath("/admin/landings/seo-factory");
}
