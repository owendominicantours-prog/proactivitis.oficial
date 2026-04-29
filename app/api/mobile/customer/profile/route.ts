import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const body = (await request.json().catch(() => ({}))) as { name?: string };
    const name = String(body.name ?? "").trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 80) {
      return withMobileCors(NextResponse.json({ error: "Escribe un nombre valido." }, { status: 400 }), "POST, OPTIONS");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, email: true, name: true, role: true, accountStatus: true }
    });

    if (user.accountStatus === "DELETED") {
      return withMobileCors(NextResponse.json({ error: "Sesion expirada." }, { status: 401 }), "POST, OPTIONS");
    }

    const { accountStatus: _accountStatus, ...safeUser } = user;
    return withMobileCors(NextResponse.json({ user: safeUser }), "POST, OPTIONS");
  } catch {
    return withMobileCors(NextResponse.json({ error: "No se pudo actualizar tu perfil." }, { status: 500 }), "POST, OPTIONS");
  }
}
