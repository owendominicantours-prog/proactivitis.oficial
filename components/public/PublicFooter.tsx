"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { Locale } from "@/lib/translations";
import { TrustBadges } from "@/components/shared/TrustBadges";

type FooterSectionKey = "support" | "company" | "collaborate" | "legal";

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
    hrefs: ["/about", "/our-mission", "/press", "/partners"]
  },
  {
    key: "collaborate",
    hrefs: ["/become-a-supplier", "/agency-partners", "/affiliates", "/careers"]
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
      links: ["Centro de ayuda", "Contacto", "Cómo funciona", "FAQs"]
    },
    company: {
      title: "Empresa",
      links: ["Sobre Proactivitis", "Nuestra misión", "Prensa", "Aliados"]
    },
    collaborate: {
      title: "Colabora",
      links: ["Conviértete en Partner", "Alianzas con Agencias", "Afiliados", "Carreras"]
    },
    legal: {
      title: "Legal",
      links: ["Términos y Condiciones", "Privacidad", "Cookies", "Información Legal"]
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
      links: ["About Proactivitis", "Our mission", "Press", "Partners"]
    },
    collaborate: {
      title: "Collaborate",
      links: ["Become a Partner", "Agency alliances", "Affiliates", "Careers"]
    },
    legal: {
      title: "Legal",
      links: ["Terms & Conditions", "Privacy", "Cookies", "Legal information"]
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
      links: ["À propos de Proactivitis", "Notre mission", "Presse", "Partenaires"]
    },
    collaborate: {
      title: "Collaborer",
      links: ["Devenir partenaire", "Partenariats agences", "Affiliés", "Carrières"]
    },
    legal: {
      title: "Mentions légales",
      links: ["Conditions", "Confidentialité", "Cookies", "Informations juridiques"]
    },
    tagline: "Proactivitis - Le tourisme porté par des personnes, pas des robots. Siège mondial."
  }
};

const paymentMethods = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Google Pay"];

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
  const locale = normalizeLocale(usePathname());
  const copy = FOOTER_TRANSLATIONS[locale] ?? FOOTER_TRANSLATIONS.es;
  const honorHref = locale === "es" ? "/cliente-de-honor" : `/${locale}/cliente-de-honor`;
  const honorLabel =
    locale === "es" ? "Cliente de Honor" : locale === "en" ? "Honor Client" : "Client d'Honneur";

  const groups = FOOTER_STRUCTURE.map((section) => ({
    title: copy[section.key].title,
    links: section.hrefs.map((href, index) => ({
      href,
      label: copy[section.key].links[index]
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
