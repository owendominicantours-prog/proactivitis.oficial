"use client";

import Link from "next/link";
import { useState } from "react";

const footerGroups = [
  {
    title: "Soporte",
    links: [
      { title: "Centro de ayuda", href: "/help-center" },
      { title: "Contacto", href: "/contact" },
      { title: "Cómo funciona", href: "/how-it-works" },
      { title: "FAQs", href: "/faqs" }
    ]
  },
  {
    title: "Empresa",
    links: [
      { title: "Sobre Proactivitis", href: "/about" },
      { title: "Nuestra misión", href: "/our-mission" },
      { title: "Prensa", href: "/press" },
      { title: "Aliados", href: "/partners" }
    ]
  },
  {
    title: "Colabora",
    links: [
      { title: "Conviértete en Partner", href: "/become-a-supplier" },
      { title: "Alianzas con Agencias", href: "/agency-partners" },
      { title: "Afiliados", href: "/affiliates" },
      { title: "Carreras", href: "/careers" }
    ]
  },
  {
    title: "Legal",
    links: [
      { title: "Términos y Condiciones", href: "/legal/terms" },
      { title: "Privacidad", href: "/legal/privacy" },
      { title: "Cookies", href: "/legal/cookies" },
      { title: "Información Legal", href: "/legal/information" }
    ]
  }
];

const paymentMethods = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Google Pay"];

export function PublicFooter() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <footer className="border-t border-slate-900 bg-slate-950 px-6 py-10 text-sm text-gray-200 font-[var(--font-open-sans)]">
      <div className="mx-auto max-w-6xl space-y-6 px-0 text-gray-400 md:hidden">
        {footerGroups.map((group) => (
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
                    {link.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="space-y-2 border-t border-white/10 pt-4 text-[0.65rem] uppercase tracking-[0.3em] text-gray-500">
          <p className="text-center font-semibold text-slate-100">Proactivitis — Tourism powered by people, not bots. Global Headquarters.</p>
          <p className="text-center">&copy; {new Date().getFullYear()} Proactivitis</p>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{group.title}</p>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="block text-white transition hover:text-sky-300">
                    {link.title}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-6xl mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-gray-400 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-[0.6rem] uppercase tracking-[0.3em] text-gray-300">
            {paymentMethods.map((method) => (
              <span key={method} className="rounded-full border border-white/20 px-3 py-1 text-[0.6rem] font-semibold">
                {method}
              </span>
            ))}
          </div>
          <div className="space-y-1 md:space-y-0">
            <p className="text-center text-[0.65rem] uppercase tracking-[0.3em] text-gray-500 md:text-left">
              &copy; {new Date().getFullYear()} Proactivitis
            </p>
            <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-200 md:text-left">
              Proactivitis — Tourism powered by people, not bots. Global Headquarters.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
