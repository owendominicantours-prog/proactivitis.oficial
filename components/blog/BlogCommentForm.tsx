"use client";

import { useState } from "react";

type BlogCommentFormProps = {
  blogPostId: string;
};

export default function BlogCommentForm({ blogPostId }: BlogCommentFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get("body") ?? "");
    const lower = body.toLowerCase();
    if (lower.includes("http://") || lower.includes("https://") || lower.includes("www.") || lower.includes("href=")) {
      setStatus("error");
      setMessage("No permitimos links en los comentarios.");
      return;
    }

    const payload = {
      blogPostId,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      body: String(formData.get("body") ?? "")
    };

    try {
      const response = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "No se pudo enviar el comentario.");
      }
      setStatus("success");
      setMessage("Comentario enviado. Espera aprobacion.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Error enviando comentario.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Deja tu comentario</p>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Tu nombre"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Tu correo"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
        />
      </div>
      <textarea
        name="body"
        required
        rows={4}
        placeholder="Escribe tu comentario (sin links)"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow hover:bg-slate-800 disabled:opacity-60"
      >
        Enviar comentario
      </button>
      {message ? (
        <p className={`text-xs ${status === "success" ? "text-emerald-600" : "text-rose-600"}`}>{message}</p>
      ) : null}
    </form>
  );
}
