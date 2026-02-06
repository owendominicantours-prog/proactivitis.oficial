import Link from "next/link";
import { Mail, Phone, Smartphone } from "lucide-react";

import ContactForm from "@/components/contact/ContactForm";
import { Locale, translate, type TranslationKey } from "@/lib/translations";
import { getContactContentOverrides } from "@/lib/siteContent";

type PublicContactPageProps = {
  locale: Locale;
};

export default async function PublicContactPage({ locale }: PublicContactPageProps) {
  const overrides = await getContactContentOverrides(locale);
  const heroTagline = overrides.hero?.tagline ?? translate(locale, "contact.hero.tagline");
  const heroTitle = overrides.hero?.title ?? translate(locale, "contact.hero.title");
  const heroDescription = overrides.hero?.description ?? translate(locale, "contact.hero.description");
  const phoneLabel = overrides.phone?.label ?? translate(locale, "contact.section.phone.label");
  const phoneDetails = overrides.phone?.details ?? translate(locale, "contact.section.phone.details");
  const phoneNumber = overrides.phone?.number ?? "+1 (809) 394-9877";
  const whatsappLabel = overrides.whatsapp?.label ?? translate(locale, "contact.whatsapp.label");
  const whatsappCta = overrides.whatsapp?.cta ?? translate(locale, "contact.whatsapp.cta");
  const whatsappNumber = overrides.whatsapp?.number ?? "18093949877";
  const whatsappLink = overrides.whatsapp?.link ?? `https://wa.me/${whatsappNumber}`;
  const emailSectionTitle = overrides.emails?.sectionTitle ?? translate(locale, "contact.email.sectionTitle");
  const contactEmails: { labelKey: TranslationKey; value: string }[] = [
    { labelKey: "contact.email.general", value: overrides.emails?.general ?? "info@proactivitis.com" },
    { labelKey: "contact.email.reservations", value: overrides.emails?.reservations ?? "bookings@proactivitis.com" },
    { labelKey: "contact.email.suppliers", value: overrides.emails?.suppliers ?? "suppliers@proactivitis.com" }
  ];
  const longformEyebrow = overrides.longform?.eyebrow ?? translate(locale, "contact.longform.eyebrow");
  const longformTitle = overrides.longform?.title ?? translate(locale, "contact.longform.title");
  const longformBody1 = overrides.longform?.body1 ?? translate(locale, "contact.longform.body1");
  const longformBody2 = overrides.longform?.body2 ?? translate(locale, "contact.longform.body2");
  const longformBody3 = overrides.longform?.body3 ?? translate(locale, "contact.longform.body3");

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 lg:px-0">
        <section className="space-y-4 rounded-3xl bg-white p-10 shadow-xl">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">{heroTagline}</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{heroTitle}</h1>
          <p className="text-lg text-slate-600">{heroDescription}</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl bg-white p-8 shadow-xl">
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-slate-500">{phoneLabel}</p>
                <p className="text-xl font-semibold">{phoneNumber}</p>
                <p className="text-sm text-slate-500">{phoneDetails}</p>
              </div>
            </div>
            <Link href={whatsappLink} className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{whatsappLabel}</p>
                <p className="text-lg font-semibold text-slate-900">{whatsappCta}</p>
              </div>
            </Link>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{emailSectionTitle}</p>
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
            {longformEyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            {longformTitle}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{longformBody1}</p>
            <p>{longformBody2}</p>
            <p>{longformBody3}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
