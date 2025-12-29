"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Payload = {
  minisiteSlug?: string;
  tourSlug?: string;
};

export async function POST(request: Request) {
  const payload: Payload = await request.json().catch(() => ({}));
  if (!payload.minisiteSlug || !payload.tourSlug) {
    return NextResponse.json({ ok: false, message: "Payload inválido" }, { status: 400 });
  }

  const minisite = await prisma.supplierMinisite.findUnique({
    where: { slug: payload.minisiteSlug },
    select: { id: true }
  });

  if (!minisite) {
    return NextResponse.json({ ok: false, message: "Minisite no encontrado" }, { status: 404 });
  }

  await prisma.supplierMinisiteClick.create({
    data: {
      minisiteId: minisite.id,
      tourSlug: payload.tourSlug
    }
  });

  return NextResponse.json({ ok: true });
}
