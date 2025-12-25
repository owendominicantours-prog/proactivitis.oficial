import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type PointPayload = {
  id?: string;
  name: string;
  slug: string;
  type: string;
  code?: string;
  description?: string;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  const { id, name, slug, type, code, description } = payload as PointPayload;
  if (!name || !slug || !type) {
    return NextResponse.json({ error: "Missing required point fields" }, { status: 400 });
  }

  try {
    if (id) {
      await prisma.transferPoint.update({
        where: { id },
        data: {
          name,
          slug,
          type,
          code: code ?? null,
          description: description ?? null
        }
      });
    } else {
      await prisma.transferPoint.create({
        data: {
          name,
          slug,
          type,
          code: code ?? null,
          description: description ?? null
        }
      });
    }
  } catch (error) {
    console.error("Failed to save transfer point", error);
    return NextResponse.json({ error: "No se pudo guardar el punto" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
