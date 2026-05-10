"use client";

import { FormEvent, useState } from "react";

type CustomerSupportFormProps = {
  name?: string | null;
  email?: string | null;
  bookingCode?: string | null;
  defaultTopic?: string;
};

export function CustomerSupportForm({
  name,
  email,
  bookingCode,
  defaultTopic = "Soporte de reserva"
}: CustomerSupportFormProps) {
  const [topic, setTopic] = useState(defaultTopic);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setFeedback(null);

    const formData = new FormData();
    formData.append("name", name?.trim() || "Cliente Proactivitis");
    formData.append("email", email?.trim() || "");
    formData.append("topic", topic);
    formData.append("bookingCode", bookingCode?.trim() || "");
    formData.append("message", message.trim());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error ?? "No se pudo enviar el mensaje.");
      }
      setMessage("");
      setStatus("success");
      setFeedback("Mensaje enviado. El equipo respondera desde la plataforma.");
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "No se pudo enviar el mensaje.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Tipo
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm normal-case tracking-normal text-slate-900 outline-none focus:border-slate-400"
          >
            <option>Soporte de reserva</option>
            <option>Cambio de pickup</option>
            <option>Pago o factura</option>
            <option>Pregunta operativa</option>
          </select>
        </label>
        <div className="space-y-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Reserva
          <div className="mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm normal-case tracking-normal text-slate-700">
            {bookingCode || "Sin codigo asociado"}
          </div>
        </div>
      </div>
      <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        Mensaje
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          rows={4}
          minLength={8}
          className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm normal-case tracking-normal text-slate-900 outline-none focus:border-slate-400"
          placeholder="Escribe lo que necesitas resolver..."
        />
      </label>
      <button
        type="submit"
        disabled={status === "loading" || !email}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
      >
        {status === "loading" ? "Enviando..." : "Enviar desde la web"}
      </button>
      {feedback ? (
        <p className={`text-sm ${status === "error" ? "text-rose-600" : "text-emerald-700"}`}>{feedback}</p>
      ) : null}
    </form>
  );
}
