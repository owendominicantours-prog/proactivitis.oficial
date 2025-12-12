"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

type Props = {
  conversationId?: string;
};

export const ChatBox = ({ conversationId }: Props) => {
  const { data, mutate } = useSWR(conversationId ? `/api/messages/${conversationId}` : null, fetcher, {
    refreshInterval: 5000
  });
  const [text, setText] = useState("");

  if (!conversationId) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 rounded-[28px] border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-lg">
        <p>Selecciona una conversación para chatear</p>
      </div>
    );
  }

  const messages: Array<{ id: string; content: string; sender: { name?: string | null; email?: string | null } }> =
    data?.messages ?? [];

  const sendMessage = async () => {
    if (!text.trim()) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ conversationId, content: text })
    });
    setText("");
    mutate();
  };

  return (
    <div className="flex h-full min-h-[320px] flex-col justify-between rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg">
      <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Sin mensajes por el momento</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{message.sender?.name ?? message.sender?.email}</p>
            <p className="mt-1 text-base text-slate-900">{message.content}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          className="rounded-full bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};
