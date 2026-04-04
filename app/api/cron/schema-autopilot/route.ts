import { NextRequest, NextResponse } from "next/server";
import { getGeminiSchemaReview, reviewTransferSchemaWithGemini } from "@/lib/geminiSchemaReview";
import {
  getSchemaAutopilotState,
  saveSchemaAutopilotState,
  type SchemaAutopilotProcessedItem,
  type SchemaAutopilotState
} from "@/lib/schemaAutopilotState";
import { getSchemaProcessingState, updateSchemaProcessingState } from "@/lib/schemaProcessingState";
import { buildTransferSchemaPreviewData, listTransferSchemaCandidateSlugs } from "@/lib/transferSchemaAutopilot";
import { getTransferSchemaOverride, saveTransferSchemaOverride, type TransferSchemaOverride } from "@/lib/schemaManager";
import type { Locale } from "@/lib/translations";
const DEFAULT_LOCALES: Locale[] = ["es", "en", "fr"];
const BATCH_SIZE = Math.max(1, Number(process.env.SCHEMA_AUTOPILOT_BATCH_SIZE ?? "3"));
const REVIEW_MAX_AGE_HOURS = Math.max(1, Number(process.env.SCHEMA_AUTOPILOT_REVIEW_MAX_AGE_HOURS ?? "336"));

const hasMeaningfulValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
  return true;
};

const mergeSuggestedOverride = (
  existing: TransferSchemaOverride | null,
  suggestion: Partial<TransferSchemaOverride> | null | undefined
): TransferSchemaOverride => {
  const merged: TransferSchemaOverride = { ...(existing ?? {}) };
  Object.entries(suggestion ?? {}).forEach(([key, value]) => {
    if (hasMeaningfulValue(value)) {
      (merged as Record<string, unknown>)[key] = value;
    }
  });
  return merged;
};

const hasMeaningfulSuggestion = (suggestion: Partial<TransferSchemaOverride> | null | undefined) =>
  Object.values(suggestion ?? {}).some((value) => hasMeaningfulValue(value));

const getBearerToken = (request: NextRequest) => {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
};

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.SCHEMA_AUTOPILOT_SECRET ?? process.env.CRON_SECRET;
  if (!secret) return true;
  return getBearerToken(request) === secret || request.nextUrl.searchParams.get("token") === secret;
};

const shouldRefreshReview = (generatedAt?: string | null) => {
  if (!generatedAt) return true;
  const created = new Date(generatedAt);
  if (Number.isNaN(created.getTime())) return true;
  const ageMs = Date.now() - created.getTime();
  return ageMs > REVIEW_MAX_AGE_HOURS * 60 * 60 * 1000;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const slugs = await listTransferSchemaCandidateSlugs();
  const jobs = slugs.flatMap((slug) => DEFAULT_LOCALES.map((locale) => ({ slug, locale })));
  if (!jobs.length) {
    return NextResponse.json({ ok: true, processed: [], totalJobs: 0 });
  }

  const state = await getSchemaAutopilotState();
  const startCursor = Math.min(Math.max(0, state.cursor), jobs.length - 1);
  const processed: SchemaAutopilotProcessedItem[] = [];

  let cursor = startCursor;
  let attempts = 0;
  while (processed.length < BATCH_SIZE && attempts < jobs.length) {
    const job = jobs[cursor];
    attempts += 1;
    cursor = (cursor + 1) % jobs.length;

    const preview = await buildTransferSchemaPreviewData(job.slug, job.locale);
    if (!preview) {
      processed.push({ slug: job.slug, locale: job.locale, status: "skipped", detail: "preview_unavailable" });
      await updateSchemaProcessingState(job.slug, job.locale, {
        lastAutopilotStatus: "skipped",
        lastAutopilotDetail: "preview_unavailable",
        lastAutopilotRunAt: new Date().toISOString()
      });
      continue;
    }

    const existingReview = await getGeminiSchemaReview(preview.slug, job.locale);
    const processingState = await getSchemaProcessingState(preview.slug, job.locale);
    if (!shouldRefreshReview(existingReview?.generatedAt ?? null)) {
      if (!processingState?.overrideAppliedAt && existingReview?.overrideSuggestions) {
        if (hasMeaningfulSuggestion(existingReview.overrideSuggestions)) {
          const current = await getTransferSchemaOverride(preview.slug, job.locale);
          const merged = mergeSuggestedOverride(current, existingReview.overrideSuggestions);
          await saveTransferSchemaOverride(preview.slug, job.locale, merged);
          await updateSchemaProcessingState(preview.slug, job.locale, {
            reviewGeneratedAt: existingReview.generatedAt,
            reviewModel: existingReview.model,
            reviewSource: processingState?.reviewSource ?? "autopilot",
            overrideAppliedAt: new Date().toISOString(),
            overrideAppliedSource: "autopilot",
            lastAutopilotStatus: "applied",
            lastAutopilotDetail: "fresh_review_auto_applied",
            lastAutopilotRunAt: new Date().toISOString()
          });
          processed.push({ slug: preview.slug, locale: job.locale, status: "applied", detail: "fresh_review_auto_applied" });
        } else {
          await updateSchemaProcessingState(preview.slug, job.locale, {
            reviewGeneratedAt: existingReview.generatedAt,
            reviewModel: existingReview.model,
            reviewSource: processingState?.reviewSource ?? "autopilot",
            lastAutopilotStatus: "no_changes_needed",
            lastAutopilotDetail: "fresh_review_no_meaningful_changes",
            lastAutopilotRunAt: new Date().toISOString()
          });
          processed.push({ slug: preview.slug, locale: job.locale, status: "no_changes_needed", detail: "fresh_review_no_meaningful_changes" });
        }
      } else {
        processed.push({ slug: preview.slug, locale: job.locale, status: "skipped_fresh", detail: "fresh_review_exists" });
        await updateSchemaProcessingState(preview.slug, job.locale, {
          reviewGeneratedAt: existingReview?.generatedAt,
          reviewModel: existingReview?.model,
          lastAutopilotStatus: "skipped_fresh",
          lastAutopilotDetail: "fresh_review_exists",
          lastAutopilotRunAt: new Date().toISOString()
        });
      }
      continue;
    }

    try {
      const review = await reviewTransferSchemaWithGemini({
        slug: preview.slug,
        locale: job.locale,
        pageUrl: preview.canonical,
        pageTitle: preview.pageTitle,
        pageDescription: preview.pageDescription,
        schemaGraph: preview.graph
      });

      const hasSuggestions = hasMeaningfulSuggestion(review.overrideSuggestions);
      if (hasSuggestions) {
        const current = await getTransferSchemaOverride(preview.slug, job.locale);
        const merged = mergeSuggestedOverride(current, review.overrideSuggestions);
        await saveTransferSchemaOverride(preview.slug, job.locale, merged);
      }

      await updateSchemaProcessingState(preview.slug, job.locale, {
        reviewGeneratedAt: review.generatedAt,
        reviewModel: review.model,
        reviewSource: "autopilot",
        overrideAppliedAt: hasSuggestions ? new Date().toISOString() : undefined,
        overrideAppliedSource: hasSuggestions ? "autopilot" : undefined,
        lastAutopilotStatus: hasSuggestions ? "applied" : "no_changes_needed",
        lastAutopilotDetail: hasSuggestions ? "review_auto_applied" : "review_no_meaningful_changes",
        lastAutopilotRunAt: new Date().toISOString()
      });

      processed.push({
        slug: preview.slug,
        locale: job.locale,
        status: hasSuggestions ? "applied" : "no_changes_needed",
        detail: hasSuggestions ? "review_auto_applied" : "review_no_meaningful_changes"
      });
    } catch (error) {
      await updateSchemaProcessingState(preview.slug, job.locale, {
        lastAutopilotStatus: "error",
        lastAutopilotDetail: error instanceof Error ? error.message : "unknown_error",
        lastAutopilotRunAt: new Date().toISOString()
      });
      processed.push({
        slug: preview.slug,
        locale: job.locale,
        status: "error",
        detail: error instanceof Error ? error.message : "unknown_error"
      });
    }
  }

  const nextState: SchemaAutopilotState = {
    cursor,
    lastRunAt: new Date().toISOString(),
    lastProcessed: processed
  };
  await saveSchemaAutopilotState(nextState);

  return NextResponse.json({
    ok: true,
    processed,
    nextCursor: cursor,
    batchSize: BATCH_SIZE,
    totalJobs: jobs.length
  });
}
