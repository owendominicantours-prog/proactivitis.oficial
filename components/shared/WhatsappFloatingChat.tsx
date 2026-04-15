"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { PROACTIVITIS_WHATSAPP_LINK } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/site-config";

const DEFAULT_WHATSAPP_LINK = `${PROACTIVITIS_WHATSAPP_LINK}?text=Hola%20Proactivitis`;

const COPY = {
  es: { title: "Soporte inmediato", cta: "Chatea por WhatsApp", intro: "Hola, vengo de" },
  en: { title: "Instant support", cta: "Chat on WhatsApp", intro: "Hi, I'm coming from" },
  fr: { title: "Support instantane", cta: "Chat WhatsApp", intro: "Bonjour, je viens de" }
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
  const searchParams = useSearchParams();
  const locale = useMemo(() => resolveLocale(pathname), [pathname]);
  const { title, cta, intro } = COPY[locale];
  const isFunjet = SITE_CONFIG.variant === "funjet";
  const rawLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? DEFAULT_WHATSAPP_LINK;
  const baseLink = rawLink.split("?")[0] ?? rawLink;
  const query = searchParams?.toString();
  const path = pathname ?? "/";
  const pageUrl = `${SITE_CONFIG.url}${query ? `${path}?${query}` : path}`;
  const message = `${intro} ${pageUrl}.`;
  const link = `${baseLink}?text=${encodeURIComponent(message)}`;
  const brandLabel = isFunjet ? "Funjet by Proactivitis" : "Proactivitis";

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={`fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-[22px] px-3 py-2 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:bottom-6 sm:right-6 sm:px-4 sm:py-3 ${
        isFunjet
          ? "border border-[#FFC300]/35 bg-[linear-gradient(135deg,#6A0DAD_0%,#7d1fd3_60%,#8f32e6_100%)] shadow-[0_16px_45px_rgba(106,13,173,0.45)]"
          : "bg-[#25D366]"
      }`}
      style={isFunjet ? { boxShadow: "0 20px 55px rgba(106,13,173,0.45)" } : undefined}
      aria-label="Chat on WhatsApp"
    >
      <span
        className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border sm:h-12 sm:w-12 ${
          isFunjet ? "border-[#FFC300]/55 bg-white/10" : "border-white/80 bg-white/10"
        }`}
      >
        <Image
          src="/fotoperfilwhatsapp.png"
          alt={SITE_CONFIG.name}
          width={48}
          height={48}
          className="h-10 w-10 object-cover sm:h-12 sm:w-12"
        />
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
            isFunjet ? "border-[#6A0DAD] bg-[#FFC300]" : "border-white bg-emerald-400"
          }`}
        />
      </span>
      <span className="hidden flex-col text-left sm:flex">
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
            isFunjet ? "text-[#FFC300]" : "text-white/70"
          }`}
        >
          {brandLabel}
        </span>
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className={`text-xs ${isFunjet ? "text-white/88" : "text-white/80"}`}>{cta}</span>
      </span>
      <span
        className={`ml-0 inline-flex h-9 w-9 items-center justify-center rounded-full sm:ml-1 ${
          isFunjet ? "bg-[#FFC300] text-[#4A0A78]" : "bg-white/20"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 32 32"
          className={`h-5 w-5 ${isFunjet ? "fill-[#4A0A78]" : "fill-white"}`}
        >
          <path d="M19.11 17.67c-.27-.14-1.6-.79-1.85-.88-.25-.09-.44-.14-.63.14-.19.27-.72.88-.88 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.43-2.19-1.38-.81-.73-1.36-1.63-1.52-1.9-.16-.27-.02-.42.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.63-1.52-.86-2.08-.23-.55-.46-.48-.63-.49l-.54-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.36.98 2.67 1.12 2.86.14.18 1.93 2.95 4.68 4.13.65.28 1.16.45 1.56.58.66.21 1.26.18 1.74.11.53-.08 1.6-.65 1.82-1.28.23-.63.23-1.18.16-1.28-.06-.11-.23-.18-.5-.32ZM16 5.33c-5.89 0-10.67 4.78-10.67 10.67 0 1.89.5 3.74 1.45 5.38L5 27l5.82-1.52c1.58.86 3.36 1.31 5.18 1.31 5.89 0 10.67-4.78 10.67-10.67C26.67 10.11 21.89 5.33 16 5.33Zm0 19.2c-1.62 0-3.2-.44-4.58-1.27l-.33-.2-3.46.9.92-3.37-.22-.35a8.51 8.51 0 0 1-1.33-4.59c0-4.7 3.82-8.53 8.53-8.53 4.7 0 8.53 3.82 8.53 8.53 0 4.7-3.82 8.53-8.53 8.53Z" />
        </svg>
      </span>
    </a>
  );
}
