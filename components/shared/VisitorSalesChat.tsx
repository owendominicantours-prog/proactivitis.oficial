"use client";

import { ExternalLink, MessageCircle, Minimize2, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

type TourCardPayload = {
  title: string;
  slug: string;
  price: number;
  duration: string | null;
  image: string | null;
  url: string;
};

const TOUR_CARD_PREFIX = "[[TOUR_CARD]]";

const parseTourCard = (content: string): TourCardPayload | null => {
  if (!content.startsWith(TOUR_CARD_PREFIX)) return null;
  try {
    const payload = JSON.parse(content.slice(TOUR_CARD_PREFIX.length)) as TourCardPayload;
    if (!payload?.title || !payload?.url) return null;
    return payload;
  } catch {
    return null;
  }
};

const formatDuration = (value: string | null) => {
  if (!value) return "Duracion variable";
  const raw = value.trim();
  if (!raw) return "Duracion variable";
  try {
    const parsed = JSON.parse(raw) as { value?: string | number; unit?: string };
    if (parsed && (parsed.value || parsed.unit)) return `${parsed.value ?? ""} ${parsed.unit ?? "horas"}`.trim();
  } catch {
    // use raw
  }
  return raw;
};

export default function VisitorSalesChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [text, setText] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const messagesKey = sessionReady && open ? "/api/visitor-chat/messages" : null;
  const { data, mutate, isLoading } = useSWR<{ messages: VisitorMessage[] }>(messagesKey, fetcher, {
    refreshInterval: open ? 4000 : 0
  });

  const formatMessage = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, lineIndex) => {
      const urls = line.match(/https?:\/\/[^\s]+/g) ?? [];
      const cleanText = line.replace(/https?:\/\/[^\s]+/g, "").trim();

      return (
        <div key={`${line}-${lineIndex}`} className="mb-1 last:mb-0">
          {cleanText && <p>{cleanText}</p>}
          {urls.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {urls.map((url, urlIndex) => (
                <a
                  key={`${url}-${urlIndex}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  Ver enlace
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}
        </div>
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

  useEffect(() => {
    if (!open || !sessionReady) return;
    const updatePresence = async () => {
      await fetch("/api/visitor-chat/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagePath: pathname,
          pageTitle: typeof document !== "undefined" ? document.title : undefined,
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined
        })
      }).catch(() => undefined);
    };

    void updatePresence();
    const interval = window.setInterval(() => {
      void updatePresence();
    }, 20000);

    return () => window.clearInterval(interval);
  }, [open, sessionReady, pathname]);

  const messages = useMemo(() => data?.messages ?? [], [data]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !open) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, open]);

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
        pagePath: pathname,
        pageTitle: typeof document !== "undefined" ? document.title : undefined,
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined
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
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Minimizar chat"
              title="Minimizar chat"
              className="rounded-full p-1 hover:bg-white/10"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
          <div ref={messagesContainerRef} className="h-[320px] space-y-2 overflow-y-auto bg-slate-50 px-3 py-3">
            {isLoading && <p className="text-xs text-slate-500">Conectando...</p>}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
                {(() => {
                  const tourCard = parseTourCard(message.content);
                  if (tourCard) {
                    return (
                      <div className="max-w-[90%] rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-800">
                        {!message.mine && <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">{message.senderName}</p>}
                        <div className="flex items-center gap-2">
                          {tourCard.image ? (
                            <img src={tourCard.image} alt={tourCard.title} className="h-14 w-20 rounded-lg object-cover" />
                          ) : (
                            <div className="h-14 w-20 rounded-lg bg-slate-200" />
                          )}
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold text-slate-900">{tourCard.title}</p>
                            <p className="text-xs text-slate-500">USD {tourCard.price} · {formatDuration(tourCard.duration)}</p>
                            <a
                              href={tourCard.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700"
                            >
                              Ver tour
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                        message.mine ? "bg-emerald-500 text-white" : "bg-white text-slate-800 border border-slate-200"
                      }`}
                    >
                      {!message.mine && <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">{message.senderName}</p>}
                      {formatMessage(message.content)}
                    </div>
                  );
                })()}
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
