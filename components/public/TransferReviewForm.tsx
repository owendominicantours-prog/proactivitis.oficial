"use client";

import { useState } from "react";

type Props = {
  bookingId: string;
  defaultName: string;
  defaultEmail: string;
};

const LINK_PATTERN = /(https?:\/\/|www\.)/i;

export default function TransferReviewForm({ bookingId, defaultName, defaultEmail }: Props) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (LINK_PATTERN.test(title) || LINK_PATTERN.test(body)) {
      setErrorMessage("No se permiten enlaces en la reseña.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/transfers/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          rating,
          title,
          body,
          name,
          email,
          locale: "es"
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data?.message || "No se pudo enviar la reseña.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setTitle("");
      setBody("");
    } catch {
      setErrorMessage("No se pudo enviar la reseña.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={submitReview} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resena de traslado</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900">Cuentanos como fue tu experiencia</h3>
      <p className="mt-1 text-sm text-slate-600">
        Tu opinion ayuda a otros clientes a reservar con seguridad.
      </p>

      <div className="mt-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => setRating(value)}
            className={`grid h-10 w-10 place-items-center rounded-full border transition ${
              rating >= value ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"
            }`}
            aria-label={`Calificacion ${value}`}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className={`h-5 w-5 ${rating >= value ? "text-amber-500" : "text-slate-300"}`}
              fill={rating >= value ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M12 3.5l2.7 5.48 6.05.88-4.38 4.27 1.03 6.03L12 17.9l-5.4 2.84 1.03-6.03-4.38-4.27 6.05-.88L12 3.5z" />
            </svg>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-600">
          Nombre
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
            required
          />
        </label>
        <label className="block text-sm text-slate-600">
          Correo
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
            required
          />
        </label>
      </div>

      <label className="mt-4 block text-sm text-slate-600">
        Titulo (opcional)
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
        />
      </label>

      <label className="mt-4 block text-sm text-slate-600">
        Comentario
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
          required
        />
      </label>

      {status === "success" && (
        <p className="mt-4 text-sm text-emerald-600">Resena enviada. La revisaremos antes de publicarla.</p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-rose-600">{errorMessage ?? "No se pudo enviar la reseña."}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Enviar reseña
      </button>
    </form>
  );
}
