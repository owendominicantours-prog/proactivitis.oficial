import { NextRequest, NextResponse } from "next/server";
import { getGeminiSeoFactoryConfig, runGeminiSeoFactoryBatch } from "@/lib/geminiSeoFactory";

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

  const result = await runGeminiSeoFactoryBatch();
  return NextResponse.json({ ok: true, result });
}
