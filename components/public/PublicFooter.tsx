"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { Locale } from "@/lib/translations";
import { TrustBadges } from "@/components/shared/TrustBadges";

type FooterSectionKey = "support" | "company" | "collaborate" | "legal";
const EDITORIAL_TEAM_LINK = "__editorial_team__";

type SectionDefinition = {
  key: FooterSectionKey;
  hrefs: string[];
};

type FooterSectionCopy = {
  title: string;
  links: string[];
};

type FooterCopy = {
  [key in FooterSectionKey]: FooterSectionCopy;
} & { tagline: string };

const FOOTER_STRUCTURE: SectionDefinition[] = [
  {
    key: "support",
    hrefs: ["/help-center", "/contact", "/how-it-works", "/faqs"]
  },
  {
    key: "company",
    hrefs: ["/about", "/our-mission", "/press", EDITORIAL_TEAM_LINK]
  },
  {
    key: "collaborate",
    hrefs: ["/tours", "/traslado", "/rent-a-car", "/contact"]
  },
  {
    key: "legal",
    hrefs: [
      "/legal/terms",
      "/legal/privacy",
      "/legal/refund-policy",
      "/legal/shipping-policy",
      "/legal/cookies",
      "/legal/information",
      "/account-deletion"
    ]
  }
];

const FOOTER_TRANSLATIONS: Record<Locale, FooterCopy> = {
  es: {
    support: {
      title: "Soporte",
      links: ["Centro de ayuda", "Contacto", "Cómo funciona", "FAQs"]
    },
    company: {
      title: "Empresa",
      links: ["Sobre Proactivitis", "Nuestra mision", "Prensa", "Equipo editorial"]
    },
    collaborate: {
      title: "Servicios",
      links: ["Tours", "Traslados", "Rent a car", "Contacto"]
    },
    legal: {
      title: "Legal",
      links: [
        "Terminos y Condiciones",
        "Privacidad",
        "Devoluciones",
        "Envio y entrega",
        "Cookies",
        "Informacion Legal",
        "Eliminar cuenta"
      ]
    },
    tagline: "Proactivitis - Turismo impulsado por personas, no por bots. Oficina central global."
  },
  en: {
    support: {
      title: "Support",
      links: ["Help Center", "Contact", "How it works", "FAQs"]
    },
    company: {
      title: "Company",
      links: ["About Proactivitis", "Our mission", "Press", "Editorial Team"]
    },
    collaborate: {
      title: "Services",
      links: ["Tours", "Transfers", "Rent a car", "Contact"]
    },
    legal: {
      title: "Legal",
      links: [
        "Terms & Conditions",
        "Privacy",
        "Refunds",
        "Shipping & delivery",
        "Cookies",
        "Legal information",
        "Delete account"
      ]
    },
    tagline: "Proactivitis - Tourism powered by people, not bots. Global headquarters."
  },
  fr: {
    support: {
      title: "Support",
      links: ["Centre d'aide", "Contact", "Comment ça marche", "FAQs"]
    },
    company: {
      title: "Entreprise",
      links: ["A propos de Proactivitis", "Notre mission", "Presse", "Equipe editoriale"]
    },
    collaborate: {
      title: "Services",
      links: ["Excursions", "Transferts", "Rent a car", "Contact"]
    },
    legal: {
      title: "Mentions legales",
      links: [
        "Conditions",
        "Confidentialite",
        "Remboursements",
        "Livraison",
        "Cookies",
        "Informations juridiques",
        "Supprimer le compte"
      ]
    },
    tagline: "Proactivitis - Le tourisme porte par des personnes, pas des robots. Siege mondial."
  }
};

const paymentMethods = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Google Pay"];
const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/proactivitis" },
  { label: "Facebook", href: "https://www.facebook.com/proactivitis" },
  { label: "TikTok", href: "https://www.tiktok.com/@proactivitis" }
];

const shouldHidePublicFooter = (pathname: string | null) => {
  if (!pathname) return false;
  return (
    pathname === "/prodiscovery" ||
    pathname.startsWith("/prodiscovery/") ||
    pathname === "/en/prodiscovery" ||
    pathname.startsWith("/en/prodiscovery/") ||
    pathname === "/fr/prodiscovery" ||
    pathname.startsWith("/fr/prodiscovery/")
  );
};

const normalizeLocale = (value: string | null): Locale => {
  if (!value) return "es";
  const segment = value.split("/").filter(Boolean)[0];
  if (segment === "en" || segment === "fr") {
    return segment;
  }
  return "es";
};

export function PublicFooter() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname();
  if (shouldHidePublicFooter(pathname)) return null;
  const locale = normalizeLocale(pathname);
  const rawCopy = FOOTER_TRANSLATIONS[locale] ?? FOOTER_TRANSLATIONS.es;
  const copy: FooterCopy = {
    ...rawCopy,
    tagline: rawCopy.tagline
  };
  const honorHref = locale === "es" ? "/cliente-de-honor" : `/${locale}/cliente-de-honor`;
  const honorLabel =
    locale === "es" ? "Cliente de Honor" : locale === "en" ? "Honor Client" : "Client d'Honneur";
  const editorialHref = locale === "es" ? "/es/equipo-editorial" : locale === "fr" ? "/fr/equipe-editoriale" : "/en/editorial-team";
  const editorialLabel = locale === "es" ? "Equipo editorial" : locale === "fr" ? "Equipe editoriale" : "Editorial Team";

  const groups = FOOTER_STRUCTURE.map((section) => ({
    title: copy[section.key].title,
    links: section.hrefs.map((href, index) => ({
      href: href === EDITORIAL_TEAM_LINK ? editorialHref : href,
      label:
        href === EDITORIAL_TEAM_LINK
          ? editorialLabel
          : copy[section.key].links[index] ??
        (href === "/account-deletion"
          ? locale === "en"
            ? "Delete account"
            : locale === "fr"
              ? "Supprimer le compte"
              : "Eliminar cuenta"
          : href)
    }))
  }));

  return (
    <footer className="relative isolate overflow-hidden border-t border-slate-900 bg-slate-950 px-6 py-10 text-sm text-gray-200 font-[var(--font-open-sans)]">
      <div className="pointer-events-none absolute inset-0 bg-slate-950" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6 px-0 text-gray-400 md:hidden">
        {groups.map((group) => (
          <div key={group.title} className="rounded-2xl border border-white/10 bg-slate-900/80">
            <button
              type="button"
              className="w-full px-4 py-3 text-left font-semibold uppercase tracking-[0.3em]"
              onClick={() => setOpenGroup((prev) => (prev === group.title ? null : group.title))}
            >
              {group.title}
            </button>
            {openGroup === group.title && (
              <div className="space-y-1 px-4 pb-4 text-xs uppercase tracking-[0.3em]">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="block text-slate-200 transition hover:text-sky-300">
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <TrustBadges locale={locale} compact className="rounded-2xl border border-white/10 bg-slate-900/80 p-4" />
        <Link
          href={honorHref}
          className="block rounded-2xl border border-amber-300/40 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 transition hover:border-amber-200 hover:text-amber-100"
        >
          {honorLabel}
        </Link>
        <div className="flex flex-wrap justify-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-slate-300">
          {socialLinks.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="transition hover:text-sky-300">
              {link.label}
            </a>
          ))}
        </div>
        <div className="space-y-2 border-t border-white/10 pt-4 text-[0.65rem] uppercase tracking-[0.3em] text-gray-500">
          <p className="text-center font-semibold text-slate-100">{copy.tagline}</p>
          <p className="text-center">&copy; {new Date().getFullYear()} Proactivitis</p>
        </div>
      </div>

      <div className="relative z-10 hidden md:block">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {groups.map((group) => (
              <div key={group.title} className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{group.title}</p>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="block text-white transition hover:text-sky-300">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <TrustBadges locale={locale} compact className="mt-8" />
        </div>

        <div className="mx-auto max-w-6xl mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-gray-400 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-[0.6rem] uppercase tracking-[0.3em] text-gray-300">
            {paymentMethods.map((method) => (
              <span key={method} className="rounded-full border border-white/20 px-3 py-1 text-[0.6rem] font-semibold">
                {method}
              </span>
            ))}
          </div>
          <div className="space-y-2 md:space-y-1">
            <p className="flex flex-wrap justify-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-slate-300 md:justify-start">
              {socialLinks.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="transition hover:text-sky-300">
                  {link.label}
                </a>
              ))}
            </p>
            <p className="text-center md:text-left">
              <Link
                href={honorHref}
                className="inline-flex rounded-full border border-amber-300/45 bg-amber-500/10 px-4 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-amber-200 transition hover:border-amber-200 hover:text-amber-100"
              >
                {honorLabel}
              </Link>
            </p>
            <p className="text-center text-[0.65rem] uppercase tracking-[0.3em] text-gray-500 md:text-left">
              &copy; {new Date().getFullYear()} Proactivitis
            </p>
            <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-200 md:text-left">
              {copy.tagline}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
