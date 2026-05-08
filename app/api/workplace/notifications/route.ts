import { NextResponse } from "next/server";

import { getWorkplaceContext } from "@/lib/workplace";
import {
  emptyWorkplaceNotificationSummary,
  getWorkplaceNotificationSummary
} from "@/lib/workplaceNotifications";

export async function GET() {
  const context = await getWorkplaceContext();
  if (!context?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (
    !context.isAdmin &&
    (!context.employee ||
      context.employee.status !== "APPROVED" ||
      (context.employee.accessExpiresAt && context.employee.accessExpiresAt < new Date()))
  ) {
    return NextResponse.json({ notifications: emptyWorkplaceNotificationSummary }, { status: 403 });
  }

  const notifications = await getWorkplaceNotificationSummary(context);
  return NextResponse.json({ notifications });
}
