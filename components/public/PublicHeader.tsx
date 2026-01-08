"use client";

import { Suspense } from "react";
import { Header } from "@/components/shared/Header";
import { PublicHeaderSearch } from "@/components/public/PublicHeaderSearch";
import { PublicCurrencyLanguage } from "@/components/public/PublicCurrencyLanguage";
import { PublicWishlistButton } from "@/components/public/PublicWishlistButton";
import { PublicAuthButtons } from "@/components/public/PublicAuthButtons";
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
      <Suspense fallback={null}>
        <PublicCurrencyLanguage />
      </Suspense>
      {userName && (
        <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 md:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="max-w-[140px] truncate">{userName}</span>
        </div>
      )}
      <PublicWishlistButton />
      <PublicAuthButtons />
    </div>
  );

  return <Header navItems={navItems} rightSlot={rightSlot} />;
}
