import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { resolveNotificationRecipients } from "@/lib/notificationEmailSettings";
import { ensureVisitorChatSession, VISITOR_CHAT_COOKIE } from "@/lib/visitorChatSession";
import { buildVisitorContextFromRequest, encodeVisitorContext } from "@/lib/visitorChatContext";

type MessageBody = {
  content?: string;
  pagePath?: string;
  pageTitle?: string;
  pageUrl?: string;
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
      messages: messages
        .filter((message) => message.senderRole !== "SYSTEM")
        .map((message) => ({
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

    const contextPayload = buildVisitorContextFromRequest(request, {
      pagePath: body.pagePath,
      pageTitle: body.pageTitle,
      pageUrl: body.pageUrl
    });

    await prisma.message.create({
      data: {
        id: randomUUID(),
        conversationId: session.conversationId,
        senderId: session.adminUserId,
        senderRole: "SYSTEM",
        content: encodeVisitorContext(contextPayload)
      }
    });

    await prisma.conversation.update({
      where: { id: session.conversationId },
      data: { updatedAt: new Date() }
    });

    const adminChatUrl = "https://proactivitis.com/admin/chat";
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
        <h2 style="margin:0 0 12px;">Nuevo mensaje de visitante en chat</h2>
        <p style="margin:0 0 8px;"><strong>Conversacion:</strong> ${session.conversationId}</p>
        <p style="margin:0 0 8px;"><strong>Pagina:</strong> ${body.pageTitle ?? body.pagePath ?? "N/D"}</p>
        <p style="margin:0 0 8px;"><strong>Pais:</strong> ${contextPayload.country ?? "N/D"} ${contextPayload.city ? `(${contextPayload.city})` : ""}</p>
        <p style="margin:0 0 12px;"><strong>Mensaje:</strong> ${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        <p style="margin:0 0 8px;">
          <a href="${adminChatUrl}" style="color:#0ea5e9;font-weight:700;">Abrir chat en admin</a>
        </p>
      </div>
    `;

    const recipients = await resolveNotificationRecipients("ADMIN_CONTACT_REQUEST");
    void sendEmail({
      to: recipients,
      subject: "Nuevo mensaje de visitante - Chat Web",
      html
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
