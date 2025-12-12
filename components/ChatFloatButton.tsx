"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ChatBox = dynamic(() => import("./ChatBox").then((mod) => mod.ChatBox), {
  ssr: false
});

type SessionInfo = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
};

type ChatFloatButtonProps = {
  href?: string;
  label?: string;
  phone?: string;
};

export const ChatFloatButton = ({ href, label = "Centro de ayuda", phone = "+1 809 000 0000" }: ChatFloatButtonProps) => {
  const [open, setOpen] = useState(false);
  const [showChatForm, setShowChatForm] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loadingConv, setLoadingConv] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<SessionInfo | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        setName(data.user?.name ?? "");
        setEmail(data.user?.email ?? "");
      }
    };
    fetchSession();
  }, []);

  const ensureConversation = async () => {
    if (loadingConv) return conversationId;
    setLoadingConv(true);
    const res = await fetch("/api/conversations/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message: message.trim() || undefined })
    });
    if (!res.ok) {
      setError(res.status === 401 ? "Inicia sesión para chatear" : "No se pudo iniciar el ticket");
      setLoadingConv(false);
      return null;
    }
    const data = await res.json();
    const id = data?.conversation?.id as string | undefined;
    if (id) setConversationId(id);
    setLoadingConv(false);
    return id ?? null;
  };

  const handleSend = async () => {
    if (status === "sending") return;
    if (!session?.user?.id && (!name.trim() || !email.trim())) {
      setError("Indica nombre y email para crear el ticket.");
      return;
    }
    setStatus("sending");
    try {
      const convId = conversationId ?? (await ensureConversation());
      if (!convId) {
        setStatus("idle");
        return;
      }
      if (message.trim()) {
        const messageRes = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: convId, content: message.trim() })
        });
        if (!messageRes.ok) {
          setError("No se pudo enviar el mensaje");
          setStatus("idle");
          return;
        }
      }
      setStatus("sent");
      setMessage("");
      setError(null);
    } catch (error) {
      console.error(error);
      setStatus("idle");
      setError("Algo salió mal. Intenta de nuevo.");
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          setShowChatForm(false);
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-green-600"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-lg text-white">
          ?
        </span>
        {label}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 rounded-2xl border border-green-600 bg-white shadow-2xl">
          <div className="rounded-t-2xl bg-green-700 px-4 py-3 text-white">Centro de ayuda</div>
          <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Artículos sugeridos</p>
                <button
                  className="text-xs font-semibold text-green-700 underline underline-offset-2"
                  onClick={() => href && window.open(href, "_blank")}
                  type="button"
                >
                  Ver todos
                </button>
              </div>
              <ul className="space-y-2 text-[0.85rem] text-slate-600">
                <li>Verificación de identidad</li>
                <li>Guía de compra segura</li>
                <li>Política de cancelación</li>
              </ul>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Chat</p>
                  <p className="text-sm text-slate-600">Habla con nuestro equipo</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setShowChatForm(true);
                    await ensureConversation();
                  }}
                  className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow"
                >
                  {loadingConv ? "Abriendo..." : "Iniciar"}
                </button>
              </div>

              {showChatForm && (
                <div className="space-y-2">
                  {!session?.user?.id && (
                    <>
                      <label className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">Nombre</label>
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                      />
                      <label className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">Email</label>
                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                      />
                    </>
                  )}

                  <label className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">Escribe un mensaje</label>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Cuéntanos tu caso..."
                    className="h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleSend}
                    className="w-full rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white"
                  >
                    {status === "sending" ? "Enviando..." : "Enviar mensaje"}
                  </button>

                  {conversationId && (
                    <ChatBox conversationId={conversationId} />
                  )}

                  {status === "sent" && (
                    <p className="text-[0.65rem] text-slate-400">Mensaje enviado. Te responderá un agente.</p>
                  )}
                  {error && <p className="text-[0.65rem] text-rose-500">{error}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Llamar</p>
                <p className="text-sm text-slate-600">Te conectamos con soporte.</p>
              </div>
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-green-700"
              >
                Llamar ahora
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded-b-2xl border-t border-slate-100 px-4 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-slate-500"
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
};
