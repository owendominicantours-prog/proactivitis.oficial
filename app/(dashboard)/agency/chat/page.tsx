"use client";

import { ChatBox } from "@/components/ChatBox";
import { ConversationList } from "@/components/conversations/ConversationList";
import { useState } from "react";

export default function AgencyChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);

  return (
    <section className="space-y-5">
      <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Chat</p>
        <h1 className="mt-3 text-3xl font-semibold">Mensajes y seguimiento</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200">
          Gestiona conversaciones relacionadas con reservas y mantén el contexto comercial sin salir del panel.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <ConversationList
            onSelect={(conv) => setConversationId(conv.id)}
            selectedId={conversationId ?? undefined}
            typeFilter="RESERVATION"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <ChatBox conversationId={conversationId ?? undefined} />
        </div>
      </div>
    </section>
  );
}
