"use client";

import { ChatBox } from "@/components/ChatBox";
import { ConversationList } from "@/components/conversations/ConversationList";
import { useEffect, useState } from "react";

export default function AdminChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  const deleteCurrent = async () => {
    if (!conversationId) return;
    const ok = window.confirm("Seguro que deseas borrar este chat?");
    if (!ok) return;
    setBusy(true);
    try {
      await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE"
      });
      setConversationId(null);
      setRefreshToken((value) => value + 1);
    } finally {
      setBusy(false);
    }
  };

  const deleteVisitorChats = async () => {
    const ok = window.confirm("Seguro que deseas borrar todos los chats de visitantes?");
    if (!ok) return;
    setBusy(true);
    try {
      await fetch("/api/conversations?type=VISITOR_CHAT", {
        method: "DELETE"
      });
      setConversationId(null);
      setRefreshToken((value) => value + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-170px)] max-w-6xl gap-6 px-6 py-6">
      <div className="w-1/3 overflow-y-auto">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => void deleteCurrent()}
            disabled={!conversationId || busy}
            className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-700 disabled:opacity-50"
          >
            Borrar Chat
          </button>
          <button
            type="button"
            onClick={() => void deleteVisitorChats()}
            disabled={busy}
            className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700 disabled:opacity-50"
          >
            Borrar Visitantes
          </button>
        </div>
        <ConversationList
          onSelect={(conv) => setConversationId(conv.id)}
          selectedId={conversationId ?? undefined}
          refreshToken={refreshToken}
        />
      </div>
      <div className="w-2/3 min-h-0">
        <ChatBox conversationId={conversationId ?? undefined} enableTourCards />
      </div>
    </div>
  );
}
