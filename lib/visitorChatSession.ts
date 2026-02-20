import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export const VISITOR_CHAT_COOKIE = "visitor_chat_token";
const VISITOR_CHAT_EMAIL_DOMAIN = "visitor-chat.proactivitis.local";

type VisitorSessionData = {
  token: string;
  visitorUserId: string;
  adminUserId: string;
  conversationId: string;
};

export async function ensureVisitorChatSession(tokenFromCookie?: string | null): Promise<VisitorSessionData> {
  const token = tokenFromCookie && tokenFromCookie.length > 10 ? tokenFromCookie : randomUUID();
  const visitorEmail = `visitor-${token}@${VISITOR_CHAT_EMAIL_DOMAIN}`;

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
