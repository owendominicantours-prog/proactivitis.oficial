import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGeminiSchemaReview, reviewTransferSchemaWithGemini } from "@/lib/geminiSchemaReview";
import { buildTransferSchemaPreviewData, listTransferSchemaCandidateSlugs } from "@/lib/transferSchemaAutopilot";
import { getTransferSchemaOverride, saveTransferSchemaOverride, type TransferSchemaOverride } from "@/lib/schemaManager";
import type { Locale } from "@/lib/translations";

type AutopilotState = {
  cursor: number;
  lastRunAt?: string;
  lastProcessed?: Array<{ slug: string; locale: Locale; status: string; detail?: string }>;
};

const AUTOPILOT_KEY = "SCHEMA_MANAGER_AUTOPILOT";
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

const getState = async (): Promise<AutopilotState> => {
  const record = await prisma.siteContentSetting.findUnique({ where: { key: AUTOPILOT_KEY } });
  if (!record?.content || typeof record.content !== "object" || Array.isArray(record.content)) {
    return { cursor: 0 };
  }
  const content = record.content as { cursor?: unknown; lastRunAt?: unknown; lastProcessed?: unknown };
  return {
    cursor: typeof content.cursor === "number" ? content.cursor : 0,
    lastRunAt: typeof content.lastRunAt === "string" ? content.lastRunAt : undefined,
    lastProcessed: Array.isArray(content.lastProcessed)
      ? (content.lastProcessed.filter((item) => typeof item === "object" && item !== null) as AutopilotState["lastProcessed"])
      : undefined
  };
};

const saveState = async (state: AutopilotState) => {
  await prisma.siteContentSetting.upsert({
    where: { key: AUTOPILOT_KEY },
    update: { content: state as unknown as object },
    create: { key: AUTOPILOT_KEY, content: state as unknown as object }
  });
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

  const state = await getState();
  const startCursor = Math.min(Math.max(0, state.cursor), jobs.length - 1);
  const processed: NonNullable<AutopilotState["lastProcessed"]> = [];

  let cursor = startCursor;
  let attempts = 0;
  while (processed.length < BATCH_SIZE && attempts < jobs.length) {
    const job = jobs[cursor];
    attempts += 1;
    cursor = (cursor + 1) % jobs.length;

    const preview = await buildTransferSchemaPreviewData(job.slug, job.locale);
    if (!preview) {
      processed.push({ slug: job.slug, locale: job.locale, status: "skipped", detail: "preview_unavailable" });
      continue;
    }

    const existingReview = await getGeminiSchemaReview(preview.slug, job.locale);
    if (!shouldRefreshReview(existingReview?.generatedAt ?? null)) {
      processed.push({ slug: preview.slug, locale: job.locale, status: "skipped", detail: "fresh_review_exists" });
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

      if (review.overrideSuggestions) {
        const current = await getTransferSchemaOverride(preview.slug, job.locale);
        const merged = mergeSuggestedOverride(current, review.overrideSuggestions);
        await saveTransferSchemaOverride(preview.slug, job.locale, merged);
      }

      processed.push({ slug: preview.slug, locale: job.locale, status: "updated" });
    } catch (error) {
      processed.push({
        slug: preview.slug,
        locale: job.locale,
        status: "error",
        detail: error instanceof Error ? error.message : "unknown_error"
      });
    }
  }

  const nextState: AutopilotState = {
    cursor,
    lastRunAt: new Date().toISOString(),
    lastProcessed: processed
  };
  await saveState(nextState);

  return NextResponse.json({
    ok: true,
    processed,
    nextCursor: cursor,
    batchSize: BATCH_SIZE,
    totalJobs: jobs.length
  });
}
