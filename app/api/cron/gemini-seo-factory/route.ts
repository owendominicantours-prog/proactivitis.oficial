import { NextRequest, NextResponse } from "next/server";
import {
  getGeminiSeoFactoryConfig,
  getGeminiSeoGeneratedTodayCount,
  runGeminiSeoFactoryBatch
} from "@/lib/geminiSeoFactory";

export const maxDuration = 300;

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
  const transferLimitOverride = manualLimit === 1 && generatedToday % 2 === 1 ? 0 : 1;
  const tourLimitOverride = Math.max(0, manualLimit - transferLimitOverride);
  const result = await runGeminiSeoFactoryBatch({
    manualLimit,
    transferLimitOverride,
    tourLimitOverride
  });
  return NextResponse.json({
    ok: true,
    generatedToday,
    remainingToday,
    requested: {
      total: manualLimit,
      transfer: transferLimitOverride,
      tour: tourLimitOverride
    },
    result
  });
}
