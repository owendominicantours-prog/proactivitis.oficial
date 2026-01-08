import Link from "next/link";
import { Mail, Phone, Smartphone } from "lucide-react";

import ContactForm from "@/components/contact/ContactForm";
import { Locale, translate, type TranslationKey } from "@/lib/translations";

const contactEmails: { labelKey: TranslationKey; value: string }[] = [
  { labelKey: "contact.email.general", value: "info@proactivitis.com" },
  { labelKey: "contact.email.reservations", value: "bookings@proactivitis.com" },
  { labelKey: "contact.email.suppliers", value: "suppliers@proactivitis.com" }
];

type PublicContactPageProps = {
  locale: Locale;
};

export default function PublicContactPage({ locale }: PublicContactPageProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 lg:px-0">
        <section className="space-y-4 rounded-3xl bg-white p-10 shadow-xl">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">{translate(locale, "contact.hero.tagline")}</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{translate(locale, "contact.hero.title")}</h1>
          <p className="text-lg text-slate-600">{translate(locale, "contact.hero.description")}</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl bg-white p-8 shadow-xl">
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-slate-500">{translate(locale, "contact.section.phone.label")}</p>
                <p className="text-xl font-semibold">+1 (809) 394-9877</p>
                <p className="text-sm text-slate-500">{translate(locale, "contact.section.phone.details")}</p>
              </div>
            </div>
            <Link href="https://wa.me/18093949877" className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{translate(locale, "contact.whatsapp.label")}</p>
                <p className="text-lg font-semibold text-slate-900">{translate(locale, "contact.whatsapp.cta")}</p>
              </div>
            </Link>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{translate(locale, "contact.email.sectionTitle")}</p>
              {contactEmails.map((email) => (
                <div key={email.labelKey} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Mail className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{translate(locale, email.labelKey)}</p>
                    <p className="text-sm font-semibold text-slate-900">{email.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ContactForm />
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {translate(locale, "contact.longform.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            {translate(locale, "contact.longform.title")}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{translate(locale, "contact.longform.body1")}</p>
            <p>{translate(locale, "contact.longform.body2")}</p>
            <p>{translate(locale, "contact.longform.body3")}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
