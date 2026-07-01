"use client";

import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { PublicAuthButtons } from "@/components/public/PublicAuthButtons";
import { PublicCurrencyLanguage } from "@/components/public/PublicCurrencyLanguage";
import { Locale, useTranslation } from "@/context/LanguageProvider";
import { useSession } from "next-auth/react";
import { Heart, ShoppingCart } from "lucide-react";

const publicNavLinks: Array<{
  labels: Record<Locale, string>;
  href: string;
  hrefByLocale?: Partial<Record<Locale, string>>;
}> = [
  {
    labels: { es: "Tours", en: "Tours", fr: "Tours" },
    href: "/tours"
  },
  {
    labels: { es: "Traslados", en: "Transfers", fr: "Transferts" },
    href: "/traslado"
  },
  {
    labels: { es: "Renta de auto", en: "Rent a car", fr: "Voitures" },
    href: "/rent-a-car",
    hrefByLocale: {
      es: "/rent-a-car",
      en: "/rent-a-car",
      fr: "/rent-a-car"
    }
  },
  {
    labels: { es: "Alojamientos", en: "Stays", fr: "Hebergements" },
    href: "/hoteles",
    hrefByLocale: {
      es: "/hoteles",
      en: "/hotels",
      fr: "/hotels"
    }
  },
  {
    labels: { es: "Contacto", en: "Contact", fr: "Contact" },
    href: "/contact"
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
  const userName = session?.user?.name ?? session?.user?.email ?? null;

  const rightSlot = (
    <div className="flex items-center gap-2">
      <Link
        href={getLocalizedPath("/wishlist", locale)}
        aria-label="Favoritos"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-slate-300"
      >
        <Heart className="h-5 w-5" />
      </Link>
      <Link
        href={getLocalizedPath("/cart", locale)}
        aria-label="Carrito"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-slate-300"
      >
        <ShoppingCart className="h-5 w-5" />
      </Link>
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

  return <Header navItems={navItems} rightSlot={rightSlot} logoScale={1} />;
}
