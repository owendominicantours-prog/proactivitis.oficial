import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type LoginBody = {
  email?: string;
  password?: string;
};

const signMobileToken = (user: { id: string; email: string }) => {
  const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "proactivitis-default";
  return jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: "30d" });
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Escribe tu correo y contrasena." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      accountStatus: true,
      statusMessage: true
    }
  });

  if (!user?.password) {
    return NextResponse.json({ error: "No encontramos una cuenta con esos datos." }, { status: 401 });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return NextResponse.json({ error: "No encontramos una cuenta con esos datos." }, { status: 401 });
  }

  const needsApproval = ["SUPPLIER", "AGENCY"].includes(user.role ?? "");
  if (needsApproval && user.accountStatus !== "APPROVED") {
    return NextResponse.json(
      { error: user.statusMessage ?? "Tu cuenta aun no ha sido aprobada." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    token: signMobileToken(user),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
}
