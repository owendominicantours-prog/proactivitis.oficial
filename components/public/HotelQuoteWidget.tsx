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
    title: "Consulta disponibilidad",
    subtitle: "Hotel, traslado y tours coordinados en una sola solicitud",
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
    submit: "Ver disponibilidad",
    success: "Solicitud enviada. Te contactamos pronto.",
    error: "No se pudo enviar. Intenta de nuevo."
  },
  en: {
    title: "Check availability",
    subtitle: "Hotel, transfer and tours coordinated in one request",
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
    submit: "View availability",
    success: "Request sent. We will contact you soon.",
    error: "Could not send request. Please try again."
  },
  fr: {
    title: "Verifier disponibilite",
    subtitle: "Hotel, transfert et excursions coordonnes en une seule demande",
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
    submit: "Voir disponibilite",
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
    <div id="hotel-quote-widget" className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 sm:p-5">
      <div className="rounded-2xl bg-slate-950 p-4 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">Proactivitis stays</p>
        <h2 className="mt-2 text-xl font-semibold">{copy.title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-300">{copy.subtitle}</p>
      </div>
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
          className="rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {state === "sending" ? "..." : ctaLabel || copy.submit}
        </button>
        <div className="grid gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          <p>{locale === "es" ? "Confirmacion humana antes de cobrar." : locale === "fr" ? "Confirmation humaine avant paiement." : "Human confirmation before payment."}</p>
          <p>{locale === "es" ? "Podemos agregar traslado y tours a la misma cotizacion." : locale === "fr" ? "Nous pouvons ajouter transfert et excursions au meme devis." : "We can add transfer and tours to the same quote."}</p>
        </div>

        {state === "success" ? <p className="text-sm text-emerald-600">{copy.success}</p> : null}
        {state === "error" ? <p className="text-sm text-rose-600">{copy.error}</p> : null}
      </form>
    </div>
  );
}
