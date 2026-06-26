import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/adminAccess";
import { upsertTourPoi } from "@/lib/tourPoi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const parseBody = async (request: NextRequest) => {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
};

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await parseBody(request);

  try {
    const poi = await upsertTourPoi({
      tourId: body.tourId,
      googlePlaceId: body.googlePlaceId,
      placeName: body.placeName,
      latitude: body.latitude,
      longitude: body.longitude,
      notes: body.notes
    });

    return NextResponse.json({ poi });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo guardar el POI." },
      { status: 400 }
    );
  }
}
