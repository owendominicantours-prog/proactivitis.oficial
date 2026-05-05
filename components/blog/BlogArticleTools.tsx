"use client";

import { Printer } from "lucide-react";

type Locale = "es" | "en" | "fr";

const LABELS: Record<Locale, string> = {
  es: "Imprimir / PDF",
  en: "Print / PDF",
  fr: "Imprimer / PDF"
};

export default function BlogArticleTools({ locale }: { locale: Locale }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700"
    >
      <Printer className="h-4 w-4" />
      {LABELS[locale]}
    </button>
  );
}
