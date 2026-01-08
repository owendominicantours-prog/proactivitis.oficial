"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const DEFAULT_WHATSAPP_LINK = "https://wa.me/18093949877?text=Hola%20Proactivitis";

const COPY = {
  es: { title: "Necesitas ayuda", cta: "Chat en WhatsApp" },
  en: { title: "Need help", cta: "Chat on WhatsApp" },
  fr: { title: "Besoin d'aide", cta: "Chat WhatsApp" }
} as const;

type LocaleKey = keyof typeof COPY;

const resolveLocale = (pathname: string | null): LocaleKey => {
  const path = pathname ?? "";
  if (path.startsWith("/en")) return "en";
  if (path.startsWith("/fr")) return "fr";
  return "es";
};

export default function WhatsappFloatingChat() {
  const pathname = usePathname();
  const locale = useMemo(() => resolveLocale(pathname), [pathname]);
  const { title, cta } = COPY[locale];
  const link = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? DEFAULT_WHATSAPP_LINK;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
      aria-label="Chat on WhatsApp"
    >
      <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
        <Image src="/logo.png" alt="Proactivitis" width={48} height={48} className="h-12 w-12 object-cover" />
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      </span>
      <span className="flex flex-col text-left">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Proactivitis</span>
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <span className="text-xs text-slate-500">{cta}</span>
      </span>
    </a>
  );
}
