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
    content: string;
    createdAt: string;
    sender: {
      name?: string | null;
    };
  } | null;
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
    () => summaries.filter((conv) => !conv.lastMessage || !conv.lastMessage.content).length,
    [summaries]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
        <span>Conversaciones</span>
        <span className="text-emerald-500">{unreadCount} nuevas</span>
      </div>
      <div className="space-y-2">
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
              <span>{conv.bookingCode ?? conv.type}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900">{conv.participants.map((p) => p.name).join(", ")}</p>
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
