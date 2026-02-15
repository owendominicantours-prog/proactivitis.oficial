"use client";

import { Header } from "@/components/shared/Header";
import { PublicHeaderSearch } from "@/components/public/PublicHeaderSearch";
import { PublicAuthButtons } from "@/components/public/PublicAuthButtons";
import { PublicCurrencyLanguage } from "@/components/public/PublicCurrencyLanguage";
import { Locale, useTranslation } from "@/context/LanguageProvider";
import { useSession } from "next-auth/react";

const publicNavLinks: Array<{
  labels: Record<Locale, string>;
  href: string;
  hrefByLocale?: Partial<Record<Locale, string>>;
}> = [
  {
    labels: { es: "Inicio", en: "Home", fr: "Accueil" },
    href: "/"
  },
  {
    labels: { es: "Tours", en: "Tours", fr: "Tours" },
    href: "/tours"
  },
  {
    labels: { es: "Traslado", en: "Transfer", fr: "Transfert" },
    href: "/traslado"
  },
  {
    labels: { es: "Alojamiento", en: "Accommodation", fr: "Hebergement" },
    href: "/hoteles",
    hrefByLocale: {
      es: "/hoteles",
      en: "/hotels",
      fr: "/hotels"
    }
  }
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
    label: navItem.labels[locale] ?? navItem.labels.es,
    href: getLocalizedPath(navItem.hrefByLocale?.[locale] ?? navItem.href, locale)
  }));
  const dropdownNav = {
    label: "Contacto",
    items: [
      { label: "Contacto", href: getLocalizedPath("/contact", locale) },
      { label: "Blog", href: getLocalizedPath("/news", locale) }
    ]
  };

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

  return <Header navItems={navItems} rightSlot={rightSlot} dropdownNav={dropdownNav} />;
}
