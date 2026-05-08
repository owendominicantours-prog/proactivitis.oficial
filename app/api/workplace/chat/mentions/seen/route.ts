import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getWorkplaceContext } from "@/lib/workplace";

export async function POST(request: NextRequest) {
  const context = await getWorkplaceContext();
  if (!context?.user) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  if (!context.isAdmin && (!context.employee || !context.permissions.has("chat.view"))) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const roomId = typeof body.roomId === "string" ? body.roomId : "";
  if (!roomId) {
    return NextResponse.json({ ok: false, error: "roomId requerido" }, { status: 400 });
  }

  const mentionTargets = [
    context.employee?.id ? { employeeId: context.employee.id } : null,
    context.employee?.departmentId ? { departmentId: context.employee.departmentId } : null
  ].filter((item): item is { employeeId: string } | { departmentId: string } => Boolean(item));

  if (!mentionTargets.length) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  const result = await prisma.workplaceChatMention.updateMany({
    where: {
      roomId,
      status: "OPEN",
      OR: mentionTargets
    },
    data: { status: "SEEN" }
  });

  return NextResponse.json({ ok: true, updated: result.count });
}
