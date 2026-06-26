import { NextResponse } from "next/server";

import { getTourJsonFeed } from "@/lib/tourPoi";

export const dynamic = "force-dynamic";

export async function GET() {
  const feed = await getTourJsonFeed();

  return NextResponse.json(feed, {
    headers: {
      "cache-control": "public, s-maxage=1800, stale-while-revalidate=86400"
    }
  });
}
