import { NextRequest, NextResponse } from "next/server";

import { runAutomaticGoogleIndexing } from "@/lib/googleIndexingAutomation";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const getBearerToken = (request: NextRequest) => {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
};

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.GOOGLE_INDEXING_CRON_SECRET ?? process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return getBearerToken(request) === secret || request.nextUrl.searchParams.get("token") === secret;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await runAutomaticGoogleIndexing();
  return NextResponse.json({
    ok: true,
    run: result.run,
    recent: result.processed.slice(0, 20)
  });
}
