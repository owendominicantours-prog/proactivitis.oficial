import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 12;

async function readPayload(request: NextRequest) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const payload = await readPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  const requestCode = String(payload.requestCode ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");
  const name = String(payload.name ?? "").trim();

  if (!requestCode || !email || !password) {
    return NextResponse.json({ error: "Codigo, email y contrasena son requeridos." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "La contrasena debe tener al menos 8 caracteres." }, { status: 400 });
  }

  const opportunity = await prisma.proDiscoveryGroupOpportunity.findFirst({
    where: {
      requestCode,
      contactEmail: email
    },
    select: {
      id: true,
      contactName: true,
      contactEmail: true
    }
  });

  if (!opportunity) {
    return NextResponse.json({ error: "No encontramos esa solicitud para este correo." }, { status: 404 });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true }
  });

  if (existing?.password) {
    return NextResponse.json({
      success: true,
      existingAccount: true,
      dashboardUrl: "/dashboard/customer"
    });
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: hashed,
        name: name || opportunity.contactName,
        role: "CUSTOMER",
        accountStatus: "APPROVED"
      }
    });
  } else {
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: name || opportunity.contactName,
        email,
        password: hashed,
        role: "CUSTOMER",
        supplierApproved: false,
        accountStatus: "APPROVED"
      }
    });
  }

  return NextResponse.json({
    success: true,
    existingAccount: false,
    dashboardUrl: "/dashboard/customer"
  });
}
