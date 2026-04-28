import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Sesion requerida." }, { status: 401 });
  }

  try {
    const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "proactivitis-default";
    const decoded = jwt.verify(token, secret) as { userId?: string };
    if (!decoded.userId) throw new Error("Token invalido");

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    });
    if (!user) {
      return NextResponse.json({ error: "Sesion expirada." }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Sesion expirada." }, { status: 401 });
  }
}
