"use client";

import { FormEvent, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";

const subjectOptions = [
  { value: "Reserva", label: "Reserva" },
  { value: "Proveedor", label: "Proveedor" },
  { value: "General", label: "General" }
];

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setStatusError(null);
    setIsSubmitting(true);
    try {
      const form = event.currentTarget;
      const payload = new FormData(form);
      const response = await fetch("/api/contact", {
        method: "POST",
        body: payload
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error ?? "No se pudo enviar la solicitud");
      }
      setStatusMessage("Gracias, recibimos tu mensaje y te respondemos en breve.");
      form.reset();
    } catch (error) {
      setStatusError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-slate-700" />
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">Formulario inteligente</p>
      </div>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit} ref={formRef}>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600">Nombre</label>
          <input
            name="name"
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="Ej. Ana Pérez"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="tu@correo.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600">Asunto</label>
          <select
            name="topic"
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="" disabled>
              Selecciona un motivo
            </option>
            {subjectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600">Mensaje</label>
          <textarea
            name="message"
            rows={4}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="Cuéntanos en detalle cómo podemos ayudarte."
          />
        </div>
        {statusError && <p className="text-sm text-rose-500">{statusError}</p>}
        {statusMessage && <p className="text-sm text-emerald-600">{statusMessage}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Enviar consulta"}
        </button>
      </form>
    </div>
  );
}
