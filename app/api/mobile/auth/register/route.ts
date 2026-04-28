import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

const SALT_ROUNDS = 12;

const signMobileToken = (user: { id: string; email: string }) => {
  const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "proactivitis-default";
  return jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: "30d" });
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RegisterBody;
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Escribe tu correo y crea una contrasena." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Ese correo no parece valido." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "La contrasena debe tener al menos 8 caracteres." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "Ese correo ya tiene una cuenta." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: name || null,
      email,
      password: await bcrypt.hash(password, SALT_ROUNDS),
      role: "CUSTOMER",
      supplierApproved: false,
      agencyApproved: false,
      accountStatus: "APPROVED"
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  });

  return NextResponse.json(
    {
      token: signMobileToken(user),
      user
    },
    { status: 201 }
  );
}
