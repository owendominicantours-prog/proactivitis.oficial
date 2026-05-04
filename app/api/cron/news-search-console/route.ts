import { NextRequest, NextResponse } from "next/server";
import { submitNewsSitemapsToSearchConsole } from "@/lib/googleSearchConsole";

const getBearerToken = (request: NextRequest) => {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
};

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.NEWS_SEARCH_CONSOLE_SECRET ?? process.env.CRON_SECRET;
  if (!secret) return true;
  return getBearerToken(request) === secret || request.nextUrl.searchParams.get("token") === secret;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const searchConsole = await submitNewsSitemapsToSearchConsole("news-search-console-cron");
  return NextResponse.json({
    ok: true,
    searchConsole
  });
}
