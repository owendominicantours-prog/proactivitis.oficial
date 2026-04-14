"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { Locale } from "@/lib/translations";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { SITE_CONFIG } from "@/lib/site-config";

type FooterSectionKey = "support" | "company" | "growth" | "legal";

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
    hrefs:
      SITE_CONFIG.variant === "funjet"
        ? ["/contact", "/faqs", "/tours", "/traslado"]
        : ["/help-center", "/contact", "/how-it-works", "/faqs"]
  },
  {
    key: "company",
    hrefs:
      SITE_CONFIG.variant === "funjet"
        ? ["/about", "/contact", "/legal/terms", "/legal/privacy"]
        : ["/about", "/our-mission", "/press", "/partners"]
  },
  {
    key: "growth",
    hrefs: SITE_CONFIG.supportSectionLinks.map((item) => item.href)
  },
  {
    key: "legal",
    hrefs: ["/legal/terms", "/legal/privacy", "/legal/cookies", "/legal/information"]
  }
];

const FOOTER_TRANSLATIONS: Record<Locale, FooterCopy> = {
  es: {
    support: {
      title: "Soporte",
      links: SITE_CONFIG.variant === "funjet" ? ["Contacto", "FAQs", "Tours", "Traslados"] : ["Centro de ayuda", "Contacto", "Como funciona", "FAQs"]
    },
    company: {
      title: "Empresa",
      links: [
        SITE_CONFIG.variant === "funjet" ? "Sobre Funjet" : "Sobre Proactivitis",
        SITE_CONFIG.variant === "funjet" ? "Contacto" : "Nuestra mision",
        SITE_CONFIG.variant === "funjet" ? "Terminos" : "Prensa",
        SITE_CONFIG.variant === "funjet" ? "Privacidad" : "Aliados"
      ]
    },
    growth: {
      title: SITE_CONFIG.supportSectionTitle.es,
      links: SITE_CONFIG.supportSectionLinks.map((item) => item.label.es)
    },
    legal: {
      title: "Legal",
      links: ["Terminos y Condiciones", "Privacidad", "Cookies", "Informacion Legal"]
    },
    tagline: SITE_CONFIG.footerTagline.es
  },
  en: {
    support: {
      title: "Support",
      links: SITE_CONFIG.variant === "funjet" ? ["Contact", "FAQs", "Tours", "Transfers"] : ["Help Center", "Contact", "How it works", "FAQs"]
    },
    company: {
      title: "Company",
      links: [
        SITE_CONFIG.variant === "funjet" ? "About Funjet" : "About Proactivitis",
        SITE_CONFIG.variant === "funjet" ? "Contact" : "Our mission",
        SITE_CONFIG.variant === "funjet" ? "Terms" : "Press",
        SITE_CONFIG.variant === "funjet" ? "Privacy" : "Partners"
      ]
    },
    growth: {
      title: SITE_CONFIG.supportSectionTitle.en,
      links: SITE_CONFIG.supportSectionLinks.map((item) => item.label.en)
    },
    legal: {
      title: "Legal",
      links: ["Terms & Conditions", "Privacy", "Cookies", "Legal information"]
    },
    tagline: SITE_CONFIG.footerTagline.en
  },
  fr: {
    support: {
      title: "Support",
      links: SITE_CONFIG.variant === "funjet" ? ["Contact", "FAQs", "Tours", "Transferts"] : ["Centre d'aide", "Contact", "Comment ca marche", "FAQs"]
    },
    company: {
      title: "Entreprise",
      links: [
        SITE_CONFIG.variant === "funjet" ? "A propos de Funjet" : "A propos de Proactivitis",
        SITE_CONFIG.variant === "funjet" ? "Contact" : "Notre mission",
        SITE_CONFIG.variant === "funjet" ? "Conditions" : "Presse",
        SITE_CONFIG.variant === "funjet" ? "Confidentialite" : "Partenaires"
      ]
    },
    growth: {
      title: SITE_CONFIG.supportSectionTitle.fr,
      links: SITE_CONFIG.supportSectionLinks.map((item) => item.label.fr)
    },
    legal: {
      title: "Mentions legales",
      links: ["Conditions", "Confidentialite", "Cookies", "Informations juridiques"]
    },
    tagline: SITE_CONFIG.footerTagline.fr
  }
};

const paymentMethods = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Google Pay"];

const normalizeLocale = (value: string | null): Locale => {
  if (!value) return "es";
  const segment = value.split("/").filter(Boolean)[0];
  if (segment === "en" || segment === "fr") return segment;
  return "es";
};

export function PublicFooter() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const locale = normalizeLocale(usePathname());
  const copy = FOOTER_TRANSLATIONS[locale] ?? FOOTER_TRANSLATIONS.es;

  const groups = FOOTER_STRUCTURE.map((section) => ({
    title: copy[section.key].title,
    links: section.hrefs.map((href, index) => ({
      href,
      label: copy[section.key].links[index]
    }))
  }));

  if (SITE_CONFIG.variant === "funjet") {
    return (
      <footer className="relative overflow-hidden border-t border-white/12 bg-[linear-gradient(180deg,#3F0868_0%,#5F10A0_48%,#7425BC_100%)] px-6 py-12 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,195,0,0.18),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_16%)]" />

        <div className="relative z-10 mx-auto max-w-7xl space-y-8">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
            <div className="rounded-[30px] border border-white/12 bg-white/8 p-6">
              <Image
                src={SITE_CONFIG.logoOnDarkSrc}
                alt={SITE_CONFIG.logoAlt}
                width={240}
                height={96}
                className="h-16 w-auto object-contain"
              />
              <p className="mt-4 text-sm leading-7 text-white">{copy.tagline}</p>
            </div>

            {groups.map((group) => (
              <div key={group.title} className="rounded-[26px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white">{group.title}</p>
                <div className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-sm font-semibold leading-6 text-white transition hover:text-[#FFC300]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
            <TrustBadges locale={locale} compact className="text-white" />
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="rounded-full border border-white/15 bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white"
                >
                  {method}
                </span>
              ))}
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white">
                &copy; {new Date().getFullYear()} {SITE_CONFIG.siteName}
              </p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/90">{copy.tagline}</p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="relative isolate overflow-hidden border-t border-slate-900 bg-slate-950 px-6 py-10 text-sm font-[var(--font-open-sans)] text-gray-200"
    >
      <div className="pointer-events-none absolute inset-0 bg-slate-950" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6 px-0 text-white md:hidden">
        <div className="flex flex-col items-center gap-3 rounded-[28px] border border-white/15 bg-white/8 px-5 py-5 text-center text-white">
          <Image
            src={SITE_CONFIG.logoSrc}
            alt={SITE_CONFIG.logoAlt}
            width={220}
            height={88}
            className="h-14 w-auto object-contain"
          />
          <p className="max-w-sm text-xs font-medium leading-6 text-white/80">{copy.tagline}</p>
        </div>
        {groups.map((group) => (
          <div key={group.title} className="rounded-2xl border border-white/10 bg-slate-900/80">
            <button
              type="button"
              className="w-full px-4 py-3 text-left font-semibold uppercase tracking-[0.3em] text-white"
              onClick={() => setOpenGroup((prev) => (prev === group.title ? null : group.title))}
            >
              {group.title}
            </button>
            {openGroup === group.title ? (
              <div className="space-y-1 px-4 pb-4 text-xs uppercase tracking-[0.3em]">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block font-semibold text-white transition hover:text-[#FFC300]"
                    style={{ color: "#FFFFFF", opacity: 1, WebkitTextFillColor: "#FFFFFF" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        <TrustBadges locale={locale} compact className="rounded-2xl border border-white/10 bg-slate-900/80 p-4" />
        <div className="space-y-2 border-t border-white/10 pt-4 text-[0.65rem] uppercase tracking-[0.3em] text-white/85">
          <p className="text-center font-semibold text-white">{copy.tagline}</p>
          <p className="text-center text-white/80">&copy; {new Date().getFullYear()} {SITE_CONFIG.siteName}</p>
        </div>
      </div>

      <div className="relative z-10 hidden md:block">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
            <div className="space-y-4">
              <div className="rounded-[30px] border border-white/15 bg-white/8 px-6 py-6">
                <Image
                  src={SITE_CONFIG.logoSrc}
                  alt={SITE_CONFIG.logoAlt}
                  width={240}
                  height={96}
                  className="h-16 w-auto object-contain"
                />
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/78">{copy.tagline}</p>
              </div>
            </div>
            {groups.map((group) => (
              <div key={group.title} className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white" style={{ color: "#FFFFFF", opacity: 1, WebkitTextFillColor: "#FFFFFF" }}>{group.title}</p>
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block font-semibold text-white transition hover:text-[#FFC300]"
                    style={{ color: "#FFFFFF", opacity: 1, WebkitTextFillColor: "#FFFFFF" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <TrustBadges locale={locale} compact className="mt-8" />
        </div>

        <div className="mx-auto mt-6 flex max-w-6xl flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-[0.6rem] uppercase tracking-[0.3em] text-white">
            {paymentMethods.map((method) => (
              <span key={method} className="rounded-full border border-white/20 px-3 py-1 text-[0.6rem] font-semibold">
                {method}
              </span>
            ))}
          </div>
          <div className="space-y-2 md:space-y-1">
            <p className="text-center text-[0.65rem] uppercase tracking-[0.3em] text-white/80 md:text-left">
              &copy; {new Date().getFullYear()} {SITE_CONFIG.siteName}
            </p>
            <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white md:text-left">
              {copy.tagline}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
