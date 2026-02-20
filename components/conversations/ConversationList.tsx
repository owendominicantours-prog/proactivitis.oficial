"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useMemo } from "react";

type ConversationSummary = {
  id: string;
  type: string;
  tour: {
    id: string;
    title: string;
  } | null;
  bookingCode: string | null;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    sender: {
      name?: string | null;
    };
    senderId: string;
    senderRole: string;
  } | null;
  pendingForMe?: boolean;
  participants: Array<{
    id: string;
    name: string;
    email?: string | null;
    role?: string | null;
  }>;
};

type Props = {
  onSelect: (conversation: ConversationSummary) => void;
  selectedId?: string;
  typeFilter?: string;
};

export const ConversationList = ({ onSelect, selectedId, typeFilter }: Props) => {
  const query = typeFilter ? `/api/conversations?type=${encodeURIComponent(typeFilter)}` : "/api/conversations";
  const { data } = useSWR<ConversationSummary[]>(query, fetcher, {
    refreshInterval: 5000
  });

  const summaries = useMemo(() => data ?? [], [data]);

  const unreadCount = useMemo(
    () => summaries.filter((conv) => conv.pendingForMe).length,
    [summaries]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
        <span>Conversaciones</span>
        <span className="text-emerald-500">{unreadCount} nuevas</span>
      </div>
      <div className="space-y-2">
        {summaries.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            No hay conversaciones disponibles.
          </div>
        )}
        {summaries.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
              selectedId === conv.id
                ? "border-sky-500 bg-white shadow-lg"
                : "border-slate-100 bg-white/70 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{conv.tour?.title ?? "Soporte general"}</span>
              <span className="inline-flex items-center gap-2">
                {conv.pendingForMe ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                    Pendiente
                  </span>
                ) : null}
                <span>{conv.bookingCode ?? conv.type}</span>
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900">{conv.participants.map((p) => p.name).join(", ")}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Usuarios: {conv.participants.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {conv.lastMessage
                ? `${conv.lastMessage.sender.name ?? "Tú"} · ${new Date(conv.lastMessage.createdAt).toLocaleString()}`
                : "Sin mensajes aún"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
