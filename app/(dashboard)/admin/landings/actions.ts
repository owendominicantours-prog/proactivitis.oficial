"use server";

import { revalidatePath } from "next/cache";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import {
  getGeminiSeoFactoryConfig,
  runGeminiSeoFactoryBatch,
  saveGeminiSeoFactoryConfig,
  updateGeminiSeoLandingStatus
} from "@/lib/geminiSeoFactory";

export async function refreshTransferLandingsAction() {
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
  return combos.map((combo) => combo.landingSlug);
}

const revalidateGeminiSeoFactory = (slug?: string) => {
  revalidatePath("/admin/landings");
  revalidatePath("/admin/landings/seo-factory");
  revalidatePath("/sitemap-seo-factory.xml");
  revalidatePath("/sitemap-index.xml");
  if (slug) {
    revalidatePath(`/seo/${slug}`);
    revalidatePath(`/en/seo/${slug}`);
    revalidatePath(`/fr/seo/${slug}`);
  }
};

export async function saveGeminiSeoFactorySettingsAction(formData: FormData) {
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
  const limit = Number(formData.get("limit") ?? "3");
  await runGeminiSeoFactoryBatch({
    manualLimit: Number.isFinite(limit) ? Math.max(1, Math.min(20, limit)) : 3
  });
  revalidateGeminiSeoFactory();
}

export async function publishGeminiSeoLandingAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await updateGeminiSeoLandingStatus(slug, "published");
  revalidateGeminiSeoFactory(slug);
}

export async function draftGeminiSeoLandingAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await updateGeminiSeoLandingStatus(slug, "draft");
  revalidateGeminiSeoFactory(slug);
}

export async function rejectGeminiSeoLandingAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await updateGeminiSeoLandingStatus(slug, "rejected");
  revalidateGeminiSeoFactory(slug);
}
