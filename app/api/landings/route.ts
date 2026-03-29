import { NextResponse } from "next/server";
import { landingPages } from "@/lib/landing";

export async function GET() {
  const response = NextResponse.json({ landings: landingPages });
  response.headers.set("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
  return response;
}
