import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/adminAccess";

export async function GET() {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    export: "admin-finance",
    meta: "CSV snapshot en /tmp/logs"
  });
}
