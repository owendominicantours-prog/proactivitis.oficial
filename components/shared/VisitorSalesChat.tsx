"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

type VisitorMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderRole: string;
  mine: boolean;
  senderName: string;
};

export default function VisitorSalesChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [text, setText] = useState("");

  const messagesKey = sessionReady && open ? "/api/visitor-chat/messages" : null;
  const { data, mutate, isLoading } = useSWR<{ messages: VisitorMessage[] }>(messagesKey, fetcher, {
    refreshInterval: open ? 4000 : 0
  });

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const formatMessage = (content: string) => {
    const parts = content.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, index) => {
      const isUrl = /^https?:\/\/[^\s]+$/.test(part);
      if (!isUrl) return <span key={`${part}-${index}`}>{part}</span>;
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {part}
        </a>
      );
    });
  };

  const ensureSession = async () => {
    if (loadingSession || sessionReady) return;
    setLoadingSession(true);
    try {
      await fetch("/api/visitor-chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagePath: pathname,
          pageTitle: typeof document !== "undefined" ? document.title : undefined,
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined
        })
      });
      setSessionReady(true);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    if (open) {
      void ensureSession();
    }
  }, [open]);

  const messages = useMemo(() => data?.messages ?? [], [data]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    await ensureSession();
    const content = text.trim();
    setText("");
    await fetch("/api/visitor-chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        pagePath: pathname
      })
    });
    mutate();
  };

  return (
    <div className="fixed bottom-24 right-4 z-[70] sm:bottom-28 sm:right-6">
      {open ? (
        <div className="w-[350px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Asesor de reservas</p>
              <p className="text-xs text-slate-300">Ayuda inmediata para cerrar tu compra</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[320px] space-y-2 overflow-y-auto bg-slate-50 px-3 py-3">
            {isLoading && <p className="text-xs text-slate-500">Conectando...</p>}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    message.mine ? "bg-emerald-500 text-white" : "bg-white text-slate-800 border border-slate-200"
                  }`}
                >
                  {!message.mine && <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">{message.senderName}</p>}
                  {formatMessage(message.content)}
                </div>
              </div>
            ))}
            {!messages.length && !isLoading && (
              <p className="text-xs text-slate-500">Hola, necesitas ayuda para reservar?</p>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Escribe aqui..."
              className="h-10 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          <MessageCircle className="h-4 w-4" />
          Chat de ayuda
        </button>
      )}
    </div>
  );
}
