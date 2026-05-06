import { NextRequest, NextResponse } from "next/server";
import { runDailySeoCleanup } from "@/lib/seoCleanup";

export const maxDuration = 300;

const getBearerToken = (request: NextRequest) => {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
};

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.SEO_CLEANUP_SECRET ?? process.env.CRON_SECRET;
  if (!secret) return true;
  return getBearerToken(request) === secret || request.nextUrl.searchParams.get("token") === secret;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDailySeoCleanup(10);
  return NextResponse.json({
    ok: true,
    run: result.run,
    recentCleaned: result.store.cleanedUrls.slice(0, 10),
    searchConsole: result.searchConsole
  });
}
