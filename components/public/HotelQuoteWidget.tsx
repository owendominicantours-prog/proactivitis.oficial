"use client";

import { FormEvent, useMemo, useState } from "react";

type Locale = "es" | "en" | "fr";

type HotelQuoteWidgetProps = {
  hotelSlug: string;
  hotelName: string;
  locale: Locale;
  ctaLabel?: string;
};

type QuoteState = "idle" | "sending" | "success" | "error";

const LABELS: Record<Locale, Record<string, string>> = {
  es: {
    title: "Motor de cotizacion",
    subtitle: "Respuesta rapida por WhatsApp o email",
    checkIn: "Check-in",
    checkOut: "Check-out",
    adults: "Adultos",
    children: "Ninos",
    childrenAges: "Edades de ninos",
    childrenAgesPlaceholder: "Ej: 4, 8",
    rooms: "Habitaciones",
    name: "Nombre",
    email: "Email",
    phone: "Telefono / WhatsApp",
    notes: "Detalles adicionales",
    notesPlaceholder: "Hora de llegada, celebracion, peticiones especiales...",
    submit: "Consultar Disponibilidad",
    success: "Solicitud enviada. Te contactamos pronto.",
    error: "No se pudo enviar. Intenta de nuevo."
  },
  en: {
    title: "Availability widget",
    subtitle: "Fast reply via WhatsApp or email",
    checkIn: "Check-in",
    checkOut: "Check-out",
    adults: "Adults",
    children: "Children",
    childrenAges: "Children ages",
    childrenAgesPlaceholder: "Example: 4, 8",
    rooms: "Rooms",
    name: "Name",
    email: "Email",
    phone: "Phone / WhatsApp",
    notes: "Extra details",
    notesPlaceholder: "Arrival time, celebration, special requests...",
    submit: "Check Availability",
    success: "Request sent. We will contact you soon.",
    error: "Could not send request. Please try again."
  },
  fr: {
    title: "Widget de disponibilite",
    subtitle: "Reponse rapide via WhatsApp ou email",
    checkIn: "Check-in",
    checkOut: "Check-out",
    adults: "Adultes",
    children: "Enfants",
    childrenAges: "Age des enfants",
    childrenAgesPlaceholder: "Ex: 4, 8",
    rooms: "Chambres",
    name: "Nom",
    email: "Email",
    phone: "Telephone / WhatsApp",
    notes: "Details supplementaires",
    notesPlaceholder: "Heure d'arrivee, celebration, demandes speciales...",
    submit: "Demander Disponibilite",
    success: "Demande envoyee. Nous vous contactons bientot.",
    error: "Impossible d'envoyer la demande. Reessayez."
  }
};

export default function HotelQuoteWidget({ hotelSlug, hotelName, locale, ctaLabel }: HotelQuoteWidgetProps) {
  const copy = useMemo(() => LABELS[locale] ?? LABELS.es, [locale]);
  const [state, setState] = useState<QuoteState>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("sending");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      hotelSlug,
      hotelName,
      locale,
      checkIn: String(formData.get("checkIn") ?? ""),
      checkOut: String(formData.get("checkOut") ?? ""),
      adults: Number(formData.get("adults") ?? 2),
      children: Number(formData.get("children") ?? 0),
      childrenAges: String(formData.get("childrenAges") ?? ""),
      rooms: Number(formData.get("rooms") ?? 1),
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      notes: String(formData.get("notes") ?? "")
    };

    const response = await fetch("/api/hotel-quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      form.reset();
      setState("success");
      return;
    }

    setState("error");
  };

  return (
    <div id="hotel-quote-widget" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      <p className="mt-1 text-xs text-slate-500">{copy.subtitle}</p>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {copy.checkIn}
            <input required type="date" name="checkIn" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {copy.checkOut}
            <input required type="date" name="checkOut" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {copy.adults}
            <input required min={1} defaultValue={2} type="number" name="adults" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {copy.children}
            <input min={0} defaultValue={0} type="number" name="children" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {copy.rooms}
            <input required min={1} defaultValue={1} type="number" name="rooms" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </label>
        </div>

        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {copy.childrenAges}
          <input name="childrenAges" placeholder={copy.childrenAgesPlaceholder} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
        </label>

        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {copy.name}
          <input required name="name" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
        </label>

        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {copy.email}
          <input required type="email" name="email" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
        </label>

        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {copy.phone}
          <input required name="phone" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
        </label>

        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {copy.notes}
          <textarea name="notes" rows={3} placeholder={copy.notesPlaceholder} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
        </label>

        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-xl bg-slate-900 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {state === "sending" ? "..." : ctaLabel || copy.submit}
        </button>

        {state === "success" ? <p className="text-sm text-emerald-600">{copy.success}</p> : null}
        {state === "error" ? <p className="text-sm text-rose-600">{copy.error}</p> : null}
      </form>
    </div>
  );
}
