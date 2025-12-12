"use client";

import clsx from "clsx";

type ConversationSummary = {
  id: string;
  type: string;
  participants: { user: { id: string; name?: string | null } }[];
  messages: Array<{ content: string; createdAt: string }>;
};

type Props = {
  conversations: ConversationSummary[];
  selectedId?: string;
  onSelect?: (conversationId: string) => void;
};

export const ConversationList = ({ conversations, selectedId, onSelect }: Props) => (
  <div className="space-y-4 rounded-[28px] bg-white p-4 shadow-lg">
    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Conversaciones</p>
    {conversations.length === 0 && (
      <p className="text-sm text-slate-500">Aún no tienes conversaciones. Inicia una desde una reserva o soporte.</p>
    )}
    {conversations.map((conversation) => {
      const lastMessage = conversation.messages?.[0];
      const primary = conversation.participants.find((item) => item.user.name)?.user.name ?? conversation.type;
      const isSelected = selectedId === conversation.id;
      return (
        <button
          key={conversation.id}
          onClick={() => onSelect?.(conversation.id)}
          className={clsx(
            "w-full rounded-2xl border px-3 py-3 text-left transition",
            isSelected ? "border-brand/70 bg-slate-50" : "border-slate-100 bg-white hover:border-slate-300"
          )}
        >
          <p className="text-sm font-semibold text-slate-900">{primary}</p>
          <p className="text-xs text-slate-500">{lastMessage?.content ?? "Sin mensajes aún"}</p>
        </button>
      );
    })}
  </div>
);
