import { NextRequest, NextResponse } from "next/server";

import { findSupportBookings, getSupportDeskContext } from "@/lib/supportDesk";

export async function GET(request: NextRequest) {
  const context = await getSupportDeskContext();
  if (!context) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const bookings = await findSupportBookings(q);
  return NextResponse.json({ bookings });
}
