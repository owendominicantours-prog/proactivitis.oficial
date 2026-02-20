import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureVisitorChatSession, VISITOR_CHAT_COOKIE } from "@/lib/visitorChatSession";

type SessionBody = {
  pagePath?: string;
  pageTitle?: string;
  pageUrl?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as SessionBody;
    const currentToken = request.cookies.get(VISITOR_CHAT_COOKIE)?.value ?? null;
    const session = await ensureVisitorChatSession(currentToken);

    const existingCount = await prisma.message.count({
      where: { conversationId: session.conversationId }
    });

    if (existingCount === 0) {
      const cleanTitle = body.pageTitle?.trim();
      const cleanUrl = body.pageUrl?.trim();
      const hasContext = Boolean(cleanTitle || cleanUrl);

      await prisma.message.create({
        data: {
          id: randomUUID(),
          conversationId: session.conversationId,
          senderId: session.adminUserId,
          senderRole: "BOT",
          content: hasContext
            ? [
                "Hola, bienvenido. Te ayudo a reservar ahora mismo.",
                cleanTitle ? `Pagina actual: ${cleanTitle}` : null,
                cleanUrl ? `Enlace: ${cleanUrl}` : null
              ]
                .filter(Boolean)
                .join("\n")
            : "Hola, bienvenido. Te ayudo a reservar ahora mismo."
        }
      });
    }

    const response = NextResponse.json({
      conversationId: session.conversationId
    });

    response.cookies.set(VISITOR_CHAT_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });

    return response;
  } catch (error) {
    console.error("[visitor-chat/session]", error);
    return NextResponse.json({ error: "No se pudo iniciar el chat" }, { status: 500 });
  }
}
