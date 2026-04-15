import Link from "next/link";
import { Mail, Phone, ShieldCheck, Smartphone } from "lucide-react";

import ContactForm from "@/components/contact/ContactForm";
import { PROACTIVITIS_PHONE, PROACTIVITIS_WHATSAPP_LINK, PROACTIVITIS_WHATSAPP_NUMBER } from "@/lib/seo";
import { getContactContentOverrides } from "@/lib/siteContent";
import { getLocalizedSiteHref, SITE_CONFIG } from "@/lib/site-config";
import { Locale, translate, type TranslationKey } from "@/lib/translations";

type PublicContactPageProps = {
  locale: Locale;
};

const CONTACT_NOTICE: Record<Locale, { eyebrow: string; title: string; body: string }> = {
  es: {
    eyebrow: "Canales operados por Proactivitis",
    title: "Funjet vende directo. Proactivitis gestiona el contacto operativo.",
    body:
      "Funjet Tour Operador centraliza la venta directa de tours y traslados. Las respuestas por WhatsApp, telefono y correo se gestionan a traves de los canales oficiales de Proactivitis, empresa madre del grupo."
  },
  en: {
    eyebrow: "Channels operated by Proactivitis",
    title: "Funjet sells direct. Proactivitis handles the operational contact flow.",
    body:
      "Funjet Tour Operador manages direct sales for tours and transfers. WhatsApp, phone, and email responses are handled through the official Proactivitis channels, the parent company behind the operation."
  },
  fr: {
    eyebrow: "Canaux operes par Proactivitis",
    title: "Funjet vend en direct. Proactivitis gere le contact operationnel.",
    body:
      "Funjet Tour Operador centralise la vente directe de tours et de transferts. Les reponses par WhatsApp, telephone et email sont gerees via les canaux officiels de Proactivitis, societe mere de l'operation."
  }
};

const FUNJET_STATS: Record<Locale, Array<{ label: string; value: string }>> = {
  es: [
    { label: "Respuesta comercial", value: "Rapida por WhatsApp" },
    { label: "Cobertura", value: "Tours y traslados" },
    { label: "Gestion", value: "Funjet by Proactivitis" }
  ],
  en: [
    { label: "Response time", value: "Fast on WhatsApp" },
    { label: "Coverage", value: "Tours and transfers" },
    { label: "Managed by", value: "Funjet by Proactivitis" }
  ],
  fr: [
    { label: "Reponse commerciale", value: "Rapide sur WhatsApp" },
    { label: "Couverture", value: "Tours et transferts" },
    { label: "Gestion", value: "Funjet by Proactivitis" }
  ]
};

function FunjetContactPage({
  locale,
  heroTagline,
  heroTitle,
  heroDescription,
  phoneLabel,
  phoneDetails,
  phoneNumber,
  whatsappLabel,
  whatsappCta,
  whatsappNumber,
  whatsappLink,
  emailSectionTitle,
  contactEmails,
  longformEyebrow,
  longformTitle,
  longformBody1,
  longformBody2,
  longformBody3
}: {
  locale: Locale;
  heroTagline: string;
  heroTitle: string;
  heroDescription: string;
  phoneLabel: string;
  phoneDetails: string;
  phoneNumber: string;
  whatsappLabel: string;
  whatsappCta: string;
  whatsappNumber: string;
  whatsappLink: string;
  emailSectionTitle: string;
  contactEmails: { labelKey: TranslationKey; value: string }[];
  longformEyebrow: string;
  longformTitle: string;
  longformBody1: string;
  longformBody2: string;
  longformBody3: string;
}) {
  const notice = CONTACT_NOTICE[locale];
  const stats = FUNJET_STATS[locale];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#a855f7_0%,_#6A0DAD_38%,_#3f0071_100%)] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="relative overflow-hidden rounded-[36px] border border-white/15 bg-white/[0.08] p-6 shadow-[0_30px_80px_rgba(31,0,61,0.35)] backdrop-blur md:p-10">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-[#FFC300]/25 blur-3xl" />
          <div className="absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/85">
                {heroTagline}
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-['Poppins'] text-4xl font-semibold leading-tight sm:text-5xl">
                  {heroTitle}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
                  {heroDescription}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/12 bg-black/10 px-5 py-4"
                  >
                    <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">{item.label}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/15 bg-[#2b0449]/55 p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC300] text-[#4A0A78] shadow-lg shadow-[#FFC300]/25">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.34em] text-[#FFC300]">{notice.eyebrow}</p>
                  <h2 className="text-2xl font-semibold leading-tight text-white">{notice.title}</h2>
                  <p className="text-sm leading-7 text-white/76">{notice.body}</p>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">
                  {locale === "es" ? "Operacion comercial" : locale === "en" ? "Commercial operation" : "Operation commerciale"}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/84">
                  {locale === "es"
                    ? "Todos los contactos publicados aqui siguen activos. La diferencia es que Funjet presenta la oferta comercial y Proactivitis procesa la comunicacion, confirmaciones y seguimiento."
                    : locale === "en"
                      ? "All published contact channels remain active. The difference is that Funjet presents the commercial offer while Proactivitis handles communication, confirmations, and follow-up."
                      : "Tous les canaux de contact publies ici restent actifs. La difference est que Funjet presente l'offre commerciale tandis que Proactivitis gere la communication, les confirmations et le suivi."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6 rounded-[34px] border border-white/12 bg-white/[0.08] p-6 shadow-[0_28px_70px_rgba(31,0,61,0.3)] backdrop-blur md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-white/12 bg-white/[0.06] p-5">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#FFC300]">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/58">{phoneLabel}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{phoneNumber}</p>
                    <p className="mt-2 text-sm leading-7 text-white/70">{phoneDetails}</p>
                  </div>
                </div>
              </div>

              <Link
                href={whatsappLink}
                className="group rounded-[28px] border border-[#FFC300]/35 bg-[#FFC300] p-5 text-[#3f0071] shadow-[0_18px_50px_rgba(255,195,0,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(255,195,0,0.34)]"
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3f0071]/10 text-[#3f0071]">
                    <Smartphone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#4A0A78]/80">
                      {whatsappLabel}
                    </p>
                    <p className="mt-2 text-xl font-semibold">{whatsappCta}</p>
                    <p className="mt-2 text-sm text-[#4A0A78]/85">
                      Funjet by Proactivitis • {whatsappNumber}
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            <div className="rounded-[30px] border border-white/12 bg-[#2b0449]/45 p-5 md:p-6">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/56">{emailSectionTitle}</p>
              <div className="mt-4 grid gap-3">
                {contactEmails.map((email) => (
                  <div
                    key={email.labelKey}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#FFC300]">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.26em] text-white/56">
                        {translate(locale, email.labelKey)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">{email.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-dashed border-white/18 bg-white/[0.04] p-5">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#FFC300]">
                {locale === "es" ? "Aviso de marca" : locale === "en" ? "Brand notice" : "Avis de marque"}
              </p>
              <p className="mt-3 text-sm leading-7 text-white/76">
                {locale === "es"
                  ? "En Funjet mantendremos la experiencia comercial de la marca, pero el soporte, la logistica y las confirmaciones se canalizan con la infraestructura operativa de Proactivitis."
                  : locale === "en"
                    ? "Funjet keeps its own commercial presentation, but support, logistics, and confirmations are routed through Proactivitis operational infrastructure."
                    : "Funjet conserve sa propre presentation commerciale, mais le support, la logistique et les confirmations passent par l'infrastructure operationnelle de Proactivitis."}
              </p>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/12 bg-white/[0.08] p-4 shadow-[0_28px_70px_rgba(31,0,61,0.3)] backdrop-blur md:p-5">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.06] p-4 md:p-5">
              <ContactForm />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[34px] border border-white/12 bg-white/[0.08] p-6 shadow-[0_28px_70px_rgba(31,0,61,0.3)] backdrop-blur md:p-8">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#FFC300]">{longformEyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">{longformTitle}</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/76">
              <p>{longformBody1}</p>
              <p>{longformBody2}</p>
              <p>{longformBody3}</p>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/12 bg-[#2b0449]/45 p-6 shadow-[0_28px_70px_rgba(31,0,61,0.3)] md:p-8">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/56">
              {locale === "es" ? "Rutas rapidas" : locale === "en" ? "Quick paths" : "Acces rapides"}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                {
                  href: getLocalizedSiteHref("/tours", locale),
                  title: locale === "es" ? "Tours principales" : locale === "en" ? "Top tours" : "Tours principaux",
                  body:
                    locale === "es"
                      ? "Ve directo a las experiencias mas buscadas y deja el contacto abierto para cierres rapidos."
                      : locale === "en"
                        ? "Go straight to the most requested experiences and keep contact open for fast closing."
                        : "Accede directement aux experiences les plus demandees et garde le contact ouvert pour une conversion rapide."
                },
                {
                  href: getLocalizedSiteHref("/traslado", locale),
                  title:
                    locale === "es"
                      ? "Traslados privados"
                      : locale === "en"
                        ? "Private transfers"
                        : "Transferts prives",
                  body:
                    locale === "es"
                      ? "Confirma rutas de aeropuerto y hotel con la misma atencion comercial de Funjet."
                      : locale === "en"
                        ? "Confirm airport and hotel routes with the same Funjet commercial attention."
                        : "Confirmez les trajets aeroport-hotel avec la meme attention commerciale Funjet."
                }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[28px] border border-white/12 bg-white/[0.05] p-5 transition hover:-translate-y-0.5 hover:border-[#FFC300]/40 hover:bg-white/[0.08]"
                >
                  <p className="text-lg font-semibold text-white">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-white/72">{item.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default async function PublicContactPage({ locale }: PublicContactPageProps) {
  const overrides = await getContactContentOverrides(locale);
  const heroTagline = overrides.hero?.tagline ?? translate(locale, "contact.hero.tagline");
  const heroTitle = overrides.hero?.title ?? translate(locale, "contact.hero.title");
  const heroDescription = overrides.hero?.description ?? translate(locale, "contact.hero.description");
  const phoneLabel = overrides.phone?.label ?? translate(locale, "contact.section.phone.label");
  const phoneDetails = overrides.phone?.details ?? translate(locale, "contact.section.phone.details");
  const phoneNumber = overrides.phone?.number ?? PROACTIVITIS_PHONE;
  const whatsappLabel = overrides.whatsapp?.label ?? translate(locale, "contact.whatsapp.label");
  const whatsappCta = overrides.whatsapp?.cta ?? translate(locale, "contact.whatsapp.cta");
  const whatsappNumber = overrides.whatsapp?.number ?? PROACTIVITIS_WHATSAPP_NUMBER;
  const whatsappLink =
    overrides.whatsapp?.link ??
    `${PROACTIVITIS_WHATSAPP_LINK}?text=${encodeURIComponent("Hola Funjet by Proactivitis")}`;
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

  if (SITE_CONFIG.variant === "funjet") {
    return (
      <FunjetContactPage
        locale={locale}
        heroTagline={heroTagline}
        heroTitle={heroTitle}
        heroDescription={heroDescription}
        phoneLabel={phoneLabel}
        phoneDetails={phoneDetails}
        phoneNumber={phoneNumber}
        whatsappLabel={whatsappLabel}
        whatsappCta={whatsappCta}
        whatsappNumber={whatsappNumber}
        whatsappLink={whatsappLink}
        emailSectionTitle={emailSectionTitle}
        contactEmails={contactEmails}
        longformEyebrow={longformEyebrow}
        longformTitle={longformTitle}
        longformBody1={longformBody1}
        longformBody2={longformBody2}
        longformBody3={longformBody3}
      />
    );
  }

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
                <div
                  key={email.labelKey}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <Mail className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {translate(locale, email.labelKey)}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{email.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ContactForm />
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{longformEyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">{longformTitle}</h2>
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
