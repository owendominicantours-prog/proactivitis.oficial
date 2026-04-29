import { NextResponse } from "next/server";
import {
  markNotificationReadForRecipient,
  markNotificationsForRecipientRead
} from "@/lib/notificationService";
import { readMobileUserId, withMobileCors } from "@/lib/mobileAuth";

export function OPTIONS() {
  return withMobileCors(new NextResponse(null, { status: 204 }), "POST, OPTIONS");
}

export async function POST(request: Request) {
  try {
    const userId = readMobileUserId(request);
    if (!userId) {
      return withMobileCors(NextResponse.json({ error: "Sesion requerida." }, { status: 401 }), "POST, OPTIONS");
    }

    const body = (await request.json().catch(() => ({}))) as { notificationId?: string };
    const notificationId = body.notificationId?.trim();
    if (notificationId) {
      const notification = await markNotificationReadForRecipient(notificationId, { role: "CUSTOMER", userId });
      if (!notification) {
        return withMobileCors(NextResponse.json({ error: "Aviso no encontrado." }, { status: 404 }), "POST, OPTIONS");
      }
      return withMobileCors(NextResponse.json({ ok: true }), "POST, OPTIONS");
    }

    await markNotificationsForRecipientRead({ role: "CUSTOMER", userId });
    return withMobileCors(NextResponse.json({ ok: true }), "POST, OPTIONS");
  } catch {
    return withMobileCors(NextResponse.json({ error: "No se pudo actualizar avisos." }, { status: 500 }), "POST, OPTIONS");
  }
}
