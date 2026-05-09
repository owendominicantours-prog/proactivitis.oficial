import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getWorkplaceContext } from "@/lib/workplace";

export type WorkplaceNotificationSummary = {
  mentions: number;
  support: number;
  proDiscovery: number;
  approvals: number;
  total: number;
  primaryHref: string;
};

export type WorkplaceNotificationContext = NonNullable<Awaited<ReturnType<typeof getWorkplaceContext>>>;

export const emptyWorkplaceNotificationSummary: WorkplaceNotificationSummary = {
  mentions: 0,
  support: 0,
  proDiscovery: 0,
  approvals: 0,
  total: 0,
  primaryHref: "/workplace"
};

const supportConversationTypes = ["SUPPORT", "VISITOR_CHAT", "RESERVATION"];

export async function getWorkplaceNotificationSummary(context: WorkplaceNotificationContext) {
  const mentionWhere: Prisma.WorkplaceChatMentionWhereInput = context.isAdmin
    ? { status: "OPEN" }
    : {
        status: "OPEN",
        OR: [
          context.employee?.id ? { employeeId: context.employee.id } : { id: "__none__" },
          context.employee?.departmentId ? { departmentId: context.employee.departmentId } : { id: "__none__" }
        ]
      };

  const supportAccessWhere: Prisma.ConversationWhereInput = context.isAdmin
    ? {}
    : {
        OR: [
          context.employee?.id ? { assignedEmployeeId: context.employee.id } : { id: "__none__" },
          context.employee?.departmentId ? { assignedDepartmentId: context.employee.departmentId } : { id: "__none__" },
          { assignedDepartmentId: null },
          { ConversationParticipant: { some: { userId: context.user.id } } }
        ]
      };

  const supportWhere: Prisma.ConversationWhereInput = {
    AND: [
      { type: { in: supportConversationTypes } },
      { status: { in: ["OPEN", "ESCALATED"] } },
      supportAccessWhere
    ]
  };

  const [mentions, support, approvals] = await Promise.all([
    context.isAdmin || context.permissions.has("chat.view")
      ? prisma.workplaceChatMention.count({ where: mentionWhere })
      : 0,
    context.isAdmin || context.permissions.has("chat.respond")
      ? prisma.conversation.count({ where: supportWhere })
      : 0,
    context.isAdmin ? prisma.workplaceApprovalRequest.count({ where: { status: "PENDING" } }) : 0
  ]);

  const proDiscovery =
    context.isAdmin || context.permissions.has("prodiscovery.view")
      ? await prisma.proDiscoveryGroupOpportunity.count({
          where: { status: { in: ["NEW", "REVIEWING", "QUOTED", "ACCEPTED"] } }
        })
      : 0;

  const total = mentions + support + proDiscovery + approvals;
  const primaryHref = mentions
    ? "/workplace/chat"
    : support
      ? "/workplace/support"
      : proDiscovery
        ? "/workplace/prodiscovery"
        : approvals
          ? "/admin/workplace"
          : "/workplace";

  return { mentions, support, proDiscovery, approvals, total, primaryHref };
}
