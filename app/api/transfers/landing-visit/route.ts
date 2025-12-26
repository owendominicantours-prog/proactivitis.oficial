import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const landingSlug = body?.landingSlug ?? "";
    if (!landingSlug || typeof landingSlug !== "string") {
      return NextResponse.json({ success: false, error: "landingSlug required" }, { status: 400 });
    }
    await prisma.landingPageTraffic.upsert({
      where: { slug: landingSlug },
      update: { visits: { increment: 1 } },
      create: { slug: landingSlug, visits: 1 }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: "invalid json" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "unexpected error" }, { status: 500 });
  }
}
