"use server";

import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/adminAccess";
import {
  getGoogleIndexingUrlMetadata,
  publishGoogleIndexingBatch,
  type GoogleIndexingNotificationType
} from "@/lib/googleIndexing";
import { runAutomaticGoogleIndexing } from "@/lib/googleIndexingAutomation";

const readField = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

function parseUrls(value: string) {
  return value
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function buildRedirectParams(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  });
  return searchParams.toString();
}

function parseNotificationType(value: string): GoogleIndexingNotificationType {
  return value === "URL_DELETED" ? "URL_DELETED" : "URL_UPDATED";
}

export async function submitIndexingUrlsAction(formData: FormData) {
  await requireAdminSession();

  const urls = parseUrls(readField(formData, "urls"));
  const type = parseNotificationType(readField(formData, "type"));

  if (!urls.length) {
    redirect("/admin/seo/indexing?error=Agrega%20al%20menos%20una%20URL.");
  }

  const result = await publishGoogleIndexingBatch(urls, type);
  const firstError = result.failed[0]?.error;
  const params = buildRedirectParams({
    action: "publish",
    type,
    configured: result.configured,
    submitted: result.submitted.length,
    failed: result.failed.length,
    skipped: result.skipped.length,
    missing: result.missing.join(", "),
    firstError
  });

  redirect(`/admin/seo/indexing?${params}`);
}

export async function checkIndexingMetadataAction(formData: FormData) {
  await requireAdminSession();

  const url = readField(formData, "url");
  if (!url) {
    redirect("/admin/seo/indexing?error=Agrega%20una%20URL%20para%20consultar.");
  }

  let params: string;
  try {
    const metadata = await getGoogleIndexingUrlMetadata(url);
    const latestUpdate = String(
      (metadata.latestUpdate as { notifyTime?: unknown } | undefined)?.notifyTime ??
        (metadata.latest_update as { notify_time?: unknown } | undefined)?.notify_time ??
        ""
    );
    const latestRemove = String(
      (metadata.latestRemove as { notifyTime?: unknown } | undefined)?.notifyTime ??
        (metadata.latest_remove as { notify_time?: unknown } | undefined)?.notify_time ??
        ""
    );
    params = buildRedirectParams({
      action: "metadata",
      checked: 1,
      latestUpdate,
      latestRemove
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo consultar la URL.";
    params = buildRedirectParams({ action: "metadata", checked: 0, firstError: message });
  }
  redirect(`/admin/seo/indexing?${params}`);
}

export async function runAutomaticGoogleIndexingAction() {
  await requireAdminSession();

  const result = await runAutomaticGoogleIndexing();
  const params = buildRedirectParams({
    action: "auto",
    configured: result.run.configured,
    submitted: result.run.submitted,
    failed: result.run.failed,
    skipped: result.run.skipped,
    checked: result.run.checked,
    firstError: result.run.errors[0]
  });
  redirect(`/admin/seo/indexing?${params}`);
}
