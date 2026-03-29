"use client";

import { useState } from "react";

import { ChatBox } from "@/components/ChatBox";
import { ConversationList } from "@/components/conversations/ConversationList";

export default function SupplierChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-200">Comunicación</p>
        <h1 className="mt-3 text-3xl font-semibold">Chat operativo</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Gestiona conversaciones relacionadas con reservas, seguimiento al cliente y coordinación interna desde una sola vista.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Conversaciones</p>
            <p className="mt-2 text-sm text-slate-600">Selecciona una reserva para abrir el historial del chat.</p>
          </div>
          <div className="p-4">
            <ConversationList
              onSelect={(conv) => setConversationId(conv.id)}
              selectedId={conversationId ?? undefined}
              typeFilter="RESERVATION"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Ventana activa</p>
            <p className="mt-2 text-sm text-slate-600">
              {conversationId
                ? "Responde, comparte seguimiento y conserva la comunicación dentro de la reserva."
                : "Elige una conversación para empezar."}
            </p>
          </div>
          <div className="min-h-[620px] p-4">
            <ChatBox conversationId={conversationId ?? undefined} />
          </div>
        </section>
      </div>
    </div>
  );
}
