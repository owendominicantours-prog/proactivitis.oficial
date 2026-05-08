import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { canAccessSupportConversation, getSupportDeskContext, isSupportSupervisor } from "@/lib/supportDesk";

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
  const internalNote = typeof body.internalNote === "string" ? body.internalNote.trim().slice(0, 4000) : undefined;

  const data: Prisma.ConversationUpdateInput = { updatedAt: new Date() };
  if (status && ["OPEN", "PENDING_CUSTOMER", "ESCALATED", "RESOLVED", "CLOSED"].includes(status)) {
    data.status = status;
    data.closedAt = status === "CLOSED" ? new Date() : null;
  }
  if (priority && ["LOW", "NORMAL", "HIGH", "URGENT"].includes(priority)) {
    data.priority = priority;
  }
  if (internalNote !== undefined) {
    data.internalNote = internalNote || null;
  }

  const canAssign = isSupportSupervisor(supportContext);
  if ((assignedDepartmentId !== undefined || assignedEmployeeId !== undefined) && !canAssign) {
    return NextResponse.json({ error: "Solo supervisor puede reasignar casos." }, { status: 403 });
  }
  if (assignedDepartmentId !== undefined) {
    if (assignedDepartmentId) {
      const department = await prisma.workplaceDepartment.findFirst({
        where: { id: assignedDepartmentId, active: true },
        select: { id: true }
      });
      if (!department) return NextResponse.json({ error: "Departamento invalido" }, { status: 400 });
    }
    data.assignedDepartment = assignedDepartmentId ? { connect: { id: assignedDepartmentId } } : { disconnect: true };
  }
  if (assignedEmployeeId !== undefined) {
    if (assignedEmployeeId) {
      const employee = await prisma.workplaceEmployee.findFirst({
        where: { id: assignedEmployeeId, status: "APPROVED" },
        select: { id: true, departmentId: true }
      });
      if (!employee) return NextResponse.json({ error: "Empleado invalido" }, { status: 400 });
      if (assignedDepartmentId === undefined && employee.departmentId) {
        data.assignedDepartment = { connect: { id: employee.departmentId } };
      }
    }
    data.assignedEmployee = assignedEmployeeId ? { connect: { id: assignedEmployeeId } } : { disconnect: true };
  }

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data
  });

  return NextResponse.json({ conversation });
}
