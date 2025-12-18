import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const DEFAULT_DRAFT_KEY = "supplier-autosave";

type SaveDraftRequest = {
  draftId?: string;
  draftKey?: string;
  title?: string;
  data?: unknown;
};

async function resolveSupplier(sessionUserId?: string | null) {
  if (!sessionUserId) {
    return null;
  }
  return prisma.supplierProfile.findUnique({ where: { userId: sessionUserId } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const supplier = await resolveSupplier(session?.user?.id ?? null);
  if (!supplier) {
    return NextResponse.json({ error: "Supplier profile missing" }, { status: 401 });
  }

  let body: SaveDraftRequest;
  try {
    body = (await request.json()) as SaveDraftRequest;
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const draftKey = body.draftKey ?? DEFAULT_DRAFT_KEY;
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : undefined;
  const data = body.data ?? {};

  let draft;
  if (body.draftId) {
    const existing = await prisma.tourDraft.findUnique({ where: { id: body.draftId } });
    if (!existing || existing.supplierId !== supplier.id) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    draft = await prisma.tourDraft.update({
      where: { id: body.draftId },
      data: { data, title, draftKey }
    });
  } else {
    draft = await prisma.tourDraft.upsert({
      where: {
        supplierId_draftKey: {
          supplierId: supplier.id,
          draftKey
        }
      },
      create: {
        supplierId: supplier.id,
        draftKey,
        title,
        data
      },
      update: {
        title,
        data
      }
    });
  }

  return NextResponse.json({ draftId: draft.id, updatedAt: draft.updatedAt });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const supplier = await resolveSupplier(session?.user?.id ?? null);
  if (!supplier) {
    return NextResponse.json({ error: "Supplier profile missing" }, { status: 401 });
  }

  const url = new URL(request.url);
  const draftId = url.searchParams.get("draftId");
  const draftKey = url.searchParams.get("draftKey") ?? DEFAULT_DRAFT_KEY;

  if (draftId) {
    await prisma.tourDraft.deleteMany({ where: { id: draftId, supplierId: supplier.id } });
    return NextResponse.json({ success: true });
  }

  await prisma.tourDraft.deleteMany({ where: { supplierId: supplier.id, draftKey } });
  return NextResponse.json({ success: true });
}
