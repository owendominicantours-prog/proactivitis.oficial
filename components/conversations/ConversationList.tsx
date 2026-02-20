"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useEffect, useMemo, useRef } from "react";

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
  visitorContext?: {
    country?: string | null;
    city?: string | null;
    pageTitle?: string | null;
    pagePath?: string | null;
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
  refreshToken?: number;
};

export const ConversationList = ({ onSelect, selectedId, typeFilter, refreshToken = 0 }: Props) => {
  const queryBase = typeFilter ? `/api/conversations?type=${encodeURIComponent(typeFilter)}` : "/api/conversations";
  const query = `${queryBase}${queryBase.includes("?") ? "&" : "?"}r=${refreshToken}`;
  const { data } = useSWR<ConversationSummary[]>(query, fetcher, {
    refreshInterval: 5000
  });

  const summaries = useMemo(() => data ?? [], [data]);

  const unreadCount = useMemo(
    () => summaries.filter((conv) => conv.pendingForMe).length,
    [summaries]
  );
  const lastUnreadRef = useRef<number>(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      lastUnreadRef.current = unreadCount;
      return;
    }

    if (unreadCount > lastUnreadRef.current) {
      const canNotify = typeof window !== "undefined" && "Notification" in window;
      if (canNotify && Notification.permission === "granted") {
        const summary =
          summaries.find((conv) => conv.pendingForMe)?.participants?.[0]?.name ??
          "Cliente";
        new Notification("Nuevo mensaje en admin/chat", {
          body: `${summary} envio un mensaje nuevo.`
        });
      }
    }

    lastUnreadRef.current = unreadCount;
  }, [unreadCount, summaries]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
        <span>Conversaciones</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${unreadCount > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {unreadCount} nuevas
        </span>
      </div>
      {unreadCount > 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          Tienes mensajes pendientes de clientes.
        </div>
      ) : null}
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
            {conv.visitorContext?.country ? (
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Pais: {conv.visitorContext.country}{conv.visitorContext.city ? ` · ${conv.visitorContext.city}` : ""}
              </p>
            ) : null}
            {conv.visitorContext?.pageTitle || conv.visitorContext?.pagePath ? (
              <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                {conv.visitorContext.pageTitle ?? conv.visitorContext.pagePath}
              </p>
            ) : null}
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
