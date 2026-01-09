"use client";

import { Header } from "@/components/shared/Header";
import { PublicHeaderSearch } from "@/components/public/PublicHeaderSearch";
import { PublicAuthButtons } from "@/components/public/PublicAuthButtons";
import { PublicCurrencyLanguage } from "@/components/public/PublicCurrencyLanguage";
import { Locale, useTranslation } from "@/context/LanguageProvider";
import { useSession } from "next-auth/react";

const publicNavLinks = [
  { label: "Inicio", href: "/" },
  { label: "Tours", href: "/tours" },
  { label: "Traslado", href: "/traslado" },
  { label: "Contacto", href: "/contact" }
];

const getLocalizedPath = (href: string, locale: Locale) => {
  if (href === "/") {
    return locale === "es" ? "/" : `/${locale}`;
  }

  const normalizedHref = href.replace(/^\/(en|fr)(?=\/|$)/, "");
  const prefix = locale === "es" ? "" : `/${locale}`;
  return `${prefix}${normalizedHref}`;
};

export function PublicHeader() {
  const { locale } = useTranslation();
  const { data: session } = useSession();
  const navItems = publicNavLinks.map((navItem) => ({
    label: navItem.label,
    href: getLocalizedPath(navItem.href, locale)
  }));

  const userName = session?.user?.name ?? session?.user?.email ?? null;

  const rightSlot = (
    <div className="flex items-center gap-3">
      <PublicHeaderSearch />
      <PublicCurrencyLanguage />
      {userName && (
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 sm:px-3 sm:text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="hidden max-w-[140px] truncate sm:inline">{userName}</span>
        </div>
      )}
      <PublicAuthButtons />
    </div>
  );

  return <Header navItems={navItems} rightSlot={rightSlot} />;
}
