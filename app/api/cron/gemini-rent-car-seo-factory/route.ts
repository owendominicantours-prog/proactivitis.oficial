import { NextRequest, NextResponse } from "next/server";
import {
  getGeminiSeoFactoryConfig,
  getGeminiSeoGeneratedTodayCount,
  runGeminiSeoFactoryBatch
} from "@/lib/geminiSeoFactory";
import { submitSeoFactorySitemapsToSearchConsole } from "@/lib/googleSearchConsole";

export const maxDuration = 300;
const GEMINI_CRON_INTERVAL_MS = 48 * 60 * 60 * 1000;

const getBearerToken = (request: NextRequest) => {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
};

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.GEMINI_SEO_FACTORY_SECRET ?? process.env.CRON_SECRET;
  if (!secret) return true;
  return getBearerToken(request) === secret || request.nextUrl.searchParams.get("token") === secret;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const config = await getGeminiSeoFactoryConfig();
  if (!config.enabled) {
    return NextResponse.json({ ok: true, skipped: true, reason: "Gemini SEO Factory pausado." });
  }
  const force = request.nextUrl.searchParams.get("force") === "1";
  const lastRunAt = config.lastRunAt ? new Date(config.lastRunAt).getTime() : 0;
  if (!force && lastRunAt && Date.now() - lastRunAt < GEMINI_CRON_INTERVAL_MS) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Gemini Rent Car SEO Factory espera 48 horas entre lotes.",
      lastRunAt: config.lastRunAt,
      nextRunAt: new Date(lastRunAt + GEMINI_CRON_INTERVAL_MS).toISOString()
    });
  }

  const generatedToday = await getGeminiSeoGeneratedTodayCount();
  const remainingToday = Math.max(0, config.dailyLimit - generatedToday);
  if (remainingToday <= 0) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Limite diario alcanzado.",
      generatedToday,
      dailyLimit: config.dailyLimit
    });
  }

  const manualLimit = Math.min(2, remainingToday);
  const result = await runGeminiSeoFactoryBatch({
    manualLimit,
    rentCarLimitOverride: manualLimit,
    transferLimitOverride: 0,
    tourLimitOverride: 0
  });
  const searchConsole =
    result.published > 0
      ? await submitSeoFactorySitemapsToSearchConsole("gemini-rent-car-seo-factory-cron")
      : null;

  return NextResponse.json({
    ok: true,
    generatedToday,
    remainingToday,
    requested: {
      total: manualLimit,
      rentCar: manualLimit,
      transfer: 0,
      tour: 0
    },
    result,
    searchConsole
  });
}
