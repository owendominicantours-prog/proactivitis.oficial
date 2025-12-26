import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markNotificationsForRecipientRead } from "@/lib/notificationService";
import { NotificationRole } from "@/lib/types/notificationTypes";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const role = session.user.role as NotificationRole | undefined;
  await markNotificationsForRecipientRead({ role, userId: session.user.id });
  return NextResponse.json({ success: true });
}
