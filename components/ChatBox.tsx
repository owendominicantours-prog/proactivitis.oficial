"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

type Props = {
  conversationId?: string;
  enableTourCards?: boolean;
};

type ChatMessage = {
  id: string;
  content: string;
  sender: { name?: string | null; email?: string | null };
};

type TourSuggestion = {
  id: string;
  title: string;
  slug: string;
  price: number;
  duration: string | null;
  image: string | null;
  url: string;
};

type EncodedTourCard = {
  title: string;
  slug: string;
  price: number;
  duration: string | null;
  image: string | null;
  url: string;
};

const TOUR_CARD_PREFIX = "[[TOUR_CARD]]";

const parseTourCard = (content: string): EncodedTourCard | null => {
  if (!content.startsWith(TOUR_CARD_PREFIX)) return null;
  const payload = content.slice(TOUR_CARD_PREFIX.length);
  try {
    const parsed = JSON.parse(payload) as EncodedTourCard;
    if (!parsed?.title || !parsed?.url) return null;
    return parsed;
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

export const ChatBox = ({ conversationId, enableTourCards = false }: Props) => {
  const { data, mutate } = useSWR(conversationId ? `/api/messages/${conversationId}` : null, fetcher, {
    refreshInterval: 5000
  });
  const [text, setText] = useState("");
  const [tourQuery, setTourQuery] = useState("");

  const toursQuery = enableTourCards
    ? `/api/admin/chat/tours${tourQuery.trim() ? `?q=${encodeURIComponent(tourQuery.trim())}` : ""}`
    : null;
  const { data: toursData } = useSWR<{ tours: TourSuggestion[] }>(toursQuery, fetcher, {
    refreshInterval: 0
  });

  if (!conversationId) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 rounded-[28px] border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-lg">
        <p>Selecciona una conversacion para chatear</p>
      </div>
    );
  }

  const messages: ChatMessage[] = data?.messages ?? [];
  const tours = useMemo(() => toursData?.tours ?? [], [toursData]);

  const sendRawMessage = async (content: string) => {
    if (!content.trim()) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ conversationId, content })
    });
    mutate();
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    await sendRawMessage(text);
    setText("");
  };

  const sendTourCard = async (tour: TourSuggestion) => {
    const payload: EncodedTourCard = {
      title: tour.title,
      slug: tour.slug,
      price: tour.price,
      duration: tour.duration,
      image: tour.image,
      url: tour.url
    };
    await sendRawMessage(`${TOUR_CARD_PREFIX}${JSON.stringify(payload)}`);
  };

  return (
    <div className="flex h-full min-h-[540px] flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg">
      {enableTourCards ? (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Enviar Card de Tour</p>
          <input
            type="text"
            placeholder="Buscar tour por nombre..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
            value={tourQuery}
            onChange={(event) => setTourQuery(event.target.value)}
          />
          <div className="mt-2 max-h-32 space-y-2 overflow-y-auto pr-1">
            {tours.slice(0, 6).map((tour) => (
              <div key={tour.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{tour.title}</p>
                  <p className="text-xs text-slate-500">USD {tour.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void sendTourCard(tour)}
                  className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                >
                  Enviar
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Sin mensajes por el momento</p>}
        {messages.map((message) => {
          const tourCard = parseTourCard(message.content);
          if (tourCard) {
            return (
              <div key={message.id} className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{message.sender?.name ?? message.sender?.email}</p>
                <div className="mt-2 flex items-center gap-3">
                  {tourCard.image ? (
                    <img src={tourCard.image} alt={tourCard.title} className="h-14 w-20 rounded-lg object-cover" />
                  ) : (
                    <div className="h-14 w-20 rounded-lg bg-slate-200" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{tourCard.title}</p>
                    <p className="text-xs text-slate-600">USD {tourCard.price} · {formatDuration(tourCard.duration)}</p>
                    <a
                      href={tourCard.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex rounded-full border border-sky-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-sky-700"
                    >
                      Ver tour
                    </a>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={message.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{message.sender?.name ?? message.sender?.email}</p>
              <p className="mt-1 text-base text-slate-900">{message.content}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void sendMessage();
            }
          }}
        />
        <button
          onClick={() => void sendMessage()}
          className="rounded-full bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};
