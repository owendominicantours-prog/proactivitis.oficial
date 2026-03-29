import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPasswordResetToken } from "@/lib/passwordReset";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!token) {
    return NextResponse.json({ error: "Token invalido." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "La contrasena debe tener al menos 8 caracteres." }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Las contrasenas no coinciden." }, { status: 400 });
  }

  try {
    const { email } = verifyPasswordResetToken(token);
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: {
        password: passwordHash
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "El enlace ya no es valido o ha expirado." }, { status: 400 });
  }
}
