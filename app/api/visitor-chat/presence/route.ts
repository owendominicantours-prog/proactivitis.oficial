import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureVisitorChatSession, VISITOR_CHAT_COOKIE } from "@/lib/visitorChatSession";
import {
  buildVisitorContextFromRequest,
  encodeVisitorContext,
  parseVisitorContext
} from "@/lib/visitorChatContext";

type PresenceBody = {
  pagePath?: string;
  pageTitle?: string;
  pageUrl?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as PresenceBody;
    const token = request.cookies.get(VISITOR_CHAT_COOKIE)?.value ?? null;
    const session = await ensureVisitorChatSession(token);
    const context = buildVisitorContextFromRequest(request, body);

    const lastSystem = await prisma.message.findFirst({
      where: {
        conversationId: session.conversationId,
        senderRole: "SYSTEM"
      },
      orderBy: { createdAt: "desc" },
      select: { content: true, createdAt: true }
    });

    const parsed = lastSystem ? parseVisitorContext(lastSystem.content) : null;
    const samePage =
      parsed?.pagePath === context.pagePath &&
      parsed?.pageTitle === context.pageTitle &&
      parsed?.country === context.country &&
      parsed?.city === context.city;
    const recentEnough = lastSystem
      ? Date.now() - new Date(lastSystem.createdAt).getTime() < 30 * 1000
      : false;

    if (!samePage || !recentEnough) {
      await prisma.message.create({
        data: {
          id: randomUUID(),
          conversationId: session.conversationId,
          senderId: session.adminUserId,
          senderRole: "SYSTEM",
          content: encodeVisitorContext(context)
        }
      });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(VISITOR_CHAT_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  } catch (error) {
    console.error("[visitor-chat/presence]", error);
    return NextResponse.json({ error: "No se pudo actualizar presencia" }, { status: 500 });
  }
}
