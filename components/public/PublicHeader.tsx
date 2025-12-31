"use client";

import { Suspense } from "react";
import { Header } from "@/components/shared/Header";
import { PublicHeaderSearch } from "@/components/public/PublicHeaderSearch";
import { PublicCurrencyLanguage } from "@/components/public/PublicCurrencyLanguage";
import { PublicWishlistButton } from "@/components/public/PublicWishlistButton";
import { PublicAuthButtons } from "@/components/public/PublicAuthButtons";
import { Locale, useTranslation } from "@/context/LanguageProvider";

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
  const navItems = publicNavLinks.map((navItem) => ({
    label: navItem.label,
    href: getLocalizedPath(navItem.href, locale)
  }));

  const rightSlot = (
    <div className="flex items-center gap-3">
      <PublicHeaderSearch />
      <Suspense fallback={null}>
        <PublicCurrencyLanguage />
      </Suspense>
      <PublicWishlistButton />
      <PublicAuthButtons />
    </div>
  );

  return <Header navItems={navItems} rightSlot={rightSlot} />;
}
