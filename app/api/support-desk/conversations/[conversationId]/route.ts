import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { canAccessSupportConversation, getSupportDeskContext } from "@/lib/supportDesk";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const supportContext = await getSupportDeskContext();
  if (!supportContext) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { conversationId } = await context.params;
  if (!(await canAccessSupportConversation(supportContext, conversationId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const status = typeof body.status === "string" ? body.status.toUpperCase() : undefined;
  const priority = typeof body.priority === "string" ? body.priority.toUpperCase() : undefined;
  const assignedDepartmentId = typeof body.assignedDepartmentId === "string" ? body.assignedDepartmentId : undefined;
  const assignedEmployeeId = typeof body.assignedEmployeeId === "string" ? body.assignedEmployeeId : undefined;

  const data: Record<string, any> = { updatedAt: new Date() };
  if (status && ["OPEN", "PENDING_CUSTOMER", "ESCALATED", "RESOLVED", "CLOSED"].includes(status)) {
    data.status = status;
    data.closedAt = status === "CLOSED" ? new Date() : null;
  }
  if (priority && ["LOW", "NORMAL", "HIGH", "URGENT"].includes(priority)) {
    data.priority = priority;
  }
  if (assignedDepartmentId !== undefined) {
    data.assignedDepartmentId = assignedDepartmentId || null;
  }
  if (assignedEmployeeId !== undefined) {
    data.assignedEmployeeId = assignedEmployeeId || null;
  }

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data
  });

  return NextResponse.json({ conversation });
}
