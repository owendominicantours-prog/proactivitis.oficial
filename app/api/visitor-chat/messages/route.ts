import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildEmailShell } from "@/lib/emailTemplates";
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
    const safeMessage = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = buildEmailShell({
      eyebrow: "Chat web",
      title: "Nuevo mensaje de visitante",
      intro: "Un visitante envio un mensaje desde el chat publico y requiere seguimiento del equipo.",
      baseUrl: "https://proactivitis.com",
      tone: "dark",
      disclaimer:
        "Este correo fue enviado por Proactivitis para avisar de una nueva conversacion iniciada en el chat de visitantes.",
      footerNote: `Conversacion: ${session.conversationId}`,
      contentHtml: `
        <div style="padding:20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
          <p style="margin:0;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#94a3b8;">Origen</p>
          <p style="margin:10px 0 0;font-size:14px;color:#475569;">Pagina: <strong>${body.pageTitle ?? body.pagePath ?? "N/D"}</strong></p>
          <p style="margin:6px 0 0;font-size:14px;color:#475569;">Pais: <strong>${contextPayload.country ?? "N/D"}${contextPayload.city ? ` (${contextPayload.city})` : ""}</strong></p>
          <p style="margin:14px 0 0;font-size:14px;line-height:1.7;color:#0f172a;">${safeMessage}</p>
        </div>
        <a href="${adminChatUrl}" style="display:inline-block;margin-top:24px;color:#0ea5e9;font-weight:700;text-decoration:none;">
          Abrir chat en admin
        </a>
      `
    });

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
