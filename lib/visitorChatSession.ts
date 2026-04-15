import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentSiteBrand } from "@/lib/site-brand";

export const VISITOR_CHAT_COOKIE = "visitor_chat_token";

type VisitorSessionData = {
  token: string;
  visitorUserId: string;
  adminUserId: string;
  conversationId: string;
};

export async function ensureVisitorChatSession(tokenFromCookie?: string | null): Promise<VisitorSessionData> {
  const siteBrand = getCurrentSiteBrand();
  const token = tokenFromCookie && tokenFromCookie.length > 10 ? tokenFromCookie : randomUUID();
  const visitorChatEmailDomain =
    siteBrand === "FUNJET" ? "visitor-chat.funjet.local" : "visitor-chat.proactivitis.local";
  const visitorEmail = `visitor-${token}@${visitorChatEmailDomain}`;

  const [visitor, admin] = await Promise.all([
    prisma.user.upsert({
      where: { email: visitorEmail },
      update: {},
      create: {
        email: visitorEmail,
        name: "Visitante web",
        role: "CUSTOMER",
        password: randomUUID()
      }
    }),
    prisma.user.findFirst({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true }
    })
  ]);

  if (!admin) {
    throw new Error("No admin user available");
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      siteBrand,
      type: "VISITOR_CHAT",
      createdById: visitor.id,
      ConversationParticipant: {
        some: { userId: admin.id }
      }
    },
    select: { id: true }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        id: randomUUID(),
        siteBrand,
        type: "VISITOR_CHAT",
        createdById: visitor.id,
        updatedAt: new Date(),
        ConversationParticipant: {
          create: [{ userId: visitor.id }, { userId: admin.id }]
        }
      },
      select: { id: true }
    });
  }

  return {
    token,
    visitorUserId: visitor.id,
    adminUserId: admin.id,
    conversationId: conversation.id
  };
}
