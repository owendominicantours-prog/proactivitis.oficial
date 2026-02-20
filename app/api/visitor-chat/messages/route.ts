import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVisitorChatReply } from "@/lib/visitorChatBot";
import { ensureVisitorChatSession, VISITOR_CHAT_COOKIE } from "@/lib/visitorChatSession";

type MessageBody = {
  content?: string;
  pagePath?: string;
};

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(VISITOR_CHAT_COOKIE)?.value ?? null;
    const session = await ensureVisitorChatSession(token);

    const messages = await prisma.message.findMany({
      where: { conversationId: session.conversationId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderRole: true,
        senderId: true,
        User: {
          select: {
            name: true
          }
        }
      }
    });

    const response = NextResponse.json({
      messages: messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderRole: message.senderRole,
        mine: message.senderId === session.visitorUserId,
        senderName: message.User?.name ?? "Soporte"
      }))
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
    console.error("[visitor-chat/messages:get]", error);
    return NextResponse.json({ error: "No se pudieron cargar los mensajes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as MessageBody;
    const content = (body.content ?? "").trim();
    if (!content) {
      return NextResponse.json({ error: "Mensaje vacio" }, { status: 400 });
    }

    const token = request.cookies.get(VISITOR_CHAT_COOKIE)?.value ?? null;
    const session = await ensureVisitorChatSession(token);

    await prisma.message.create({
      data: {
        id: randomUUID(),
        conversationId: session.conversationId,
        senderId: session.visitorUserId,
        senderRole: "VISITOR",
        content
      }
    });

    const autoReply = await generateVisitorChatReply({
      message: content,
      pagePath: body.pagePath
    });

    await prisma.message.create({
      data: {
        id: randomUUID(),
        conversationId: session.conversationId,
        senderId: session.adminUserId,
        senderRole: "BOT",
        content: autoReply
      }
    });

    await prisma.conversation.update({
      where: { id: session.conversationId },
      data: { updatedAt: new Date() }
    });

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
    console.error("[visitor-chat/messages:post]", error);
    return NextResponse.json({ error: "No se pudo enviar el mensaje" }, { status: 500 });
  }
}
