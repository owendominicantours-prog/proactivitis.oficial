import Link from "next/link";
import { CalendarCheck, CheckCircle2, Clock, MessageCircle, ShieldCheck, Star } from "lucide-react";
import StructuredData from "@/components/schema/StructuredData";
import { DynamicImage } from "@/components/shared/DynamicImage";
import { formatDurationDisplay } from "@/lib/formatDuration";
import {
  fillGoldenTourText,
  type GoldenTourIntent
} from "@/lib/goldenTourPages";
import type { Locale } from "@/lib/translations";

const BASE_URL = "https://proactivitis.com";
const FALLBACK_IMAGE = "/fototours/fototour.jpeg";

type TourForGoldenPage = {
  slug: string;
  title: string;
  shortDescription?: string | null;
  description: string;
  duration: string;
  price: number;
  priceChild?: number | null;
  priceYouth?: number | null;
  heroImage?: string | null;
  gallery?: string | null;
  location: string;
  category?: string | null;
  language?: string | null;
  pickup?: string | null;
  meetingPoint?: string | null;
  meetingInstructions?: string | null;
  requirements?: string | null;
  cancellationPolicy?: string | null;
  confirmationType?: string | null;
  timeOptions?: string | null;
  operatingDays?: string | null;
  capacity?: number | null;
  minAge?: number | null;
  highlights?: unknown;
  includes?: string | null;
  includesList?: unknown;
  notIncludedList?: unknown;
};

type RelatedTour = {
  slug: string;
  title: string;
  price: number;
  heroImage?: string | null;
  gallery?: string | null;
  duration: string;
};

type Props = {
  locale: Locale;
  tour: TourForGoldenPage;
  intent: GoldenTourIntent;
  pageSlug: string;
  relatedTours: RelatedTour[];
};

const copy = {
  es: {
    from: "Desde",
    adult: "adulto",
    child: "nino",
    youth: "joven",
    reserve: "Ver disponibilidad",
    whatsapp: "Hablar por WhatsApp",
    facts: "Datos rapidos",
    why: "Por que esta pagina existe",
    included: "Que incluye",
    before: "Antes de reservar",
    gallery: "Fotos reales del tour",
    related: "Tambien puedes comparar",
    duration: "Duracion",
    zone: "Zona",
    category: "Tipo",
    language: "Idioma",
    pickup: "Recogida",
    schedule: "Horario",
    days: "Dias",
    capacity: "Capacidad",
    age: "Edad minima",
    meeting: "Punto de encuentro",
    requirements: "Requisitos",
    cancellation: "Cancelacion",
    confirmation: "Confirmacion",
    faq: "Preguntas antes de reservar",
    safePay: "Pago seguro",
    support: "Soporte humano",
    clearPrice: "Precio claro",
    realPhotos: "Fotos verificadas"
  },
  en: {
    from: "From",
    adult: "adult",
    child: "child",
    youth: "youth",
    reserve: "Check availability",
    whatsapp: "Chat on WhatsApp",
    facts: "Quick facts",
    why: "Why this page exists",
    included: "What's included",
    before: "Before booking",
    gallery: "Real tour photos",
    related: "You can also compare",
    duration: "Duration",
    zone: "Area",
    category: "Type",
    language: "Language",
    pickup: "Pickup",
    schedule: "Time",
    days: "Days",
    capacity: "Capacity",
    age: "Minimum age",
    meeting: "Meeting point",
    requirements: "Requirements",
    cancellation: "Cancellation",
    confirmation: "Confirmation",
    faq: "Questions before booking",
    safePay: "Secure payment",
    support: "Human support",
    clearPrice: "Clear price",
    realPhotos: "Verified photos"
  },
  fr: {
    from: "A partir de",
    adult: "adulte",
    child: "enfant",
    youth: "jeune",
    reserve: "Voir disponibilite",
    whatsapp: "Parler sur WhatsApp",
    facts: "Infos rapides",
    why: "Pourquoi cette page existe",
    included: "Ce qui est inclus",
    before: "Avant de reserver",
    gallery: "Photos reelles du tour",
    related: "Vous pouvez aussi comparer",
    duration: "Duree",
    zone: "Zone",
    category: "Type",
    language: "Langue",
    pickup: "Pickup",
    schedule: "Horaire",
    days: "Jours",
    capacity: "Capacite",
    age: "Age minimum",
    meeting: "Point de rencontre",
    requirements: "Conditions",
    cancellation: "Annulation",
    confirmation: "Confirmation",
    faq: "Questions avant reservation",
    safePay: "Paiement securise",
    support: "Support humain",
    clearPrice: "Prix clair",
    realPhotos: "Photos verifiees"
  }
} as const;

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

const splitTextList = (value: string) =>
  value
    .split(/[\n;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const toTextList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
  } catch {
    // plain text list
  }
  return splitTextList(trimmed);
};

const parseGallery = (value?: string | null) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item)).filter(Boolean);
  } catch {
    // ignore malformed gallery
  }
  return [];
};

const resolveImage = (tour: { heroImage?: string | null; gallery?: string | null }) =>
  tour.heroImage || parseGallery(tour.gallery)[0] || FALLBACK_IMAGE;

const toAbsoluteUrl = (value: string) => {
  if (value.startsWith("http")) return value;
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const trimLong = (value: string, max = 620) =>
  value.length > max ? `${value.slice(0, max).trim()}...` : value;

const formatRawJsonList = (value?: string | null) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object" && "hour" in item) {
            const slot = item as { hour?: number | string; minute?: number | string; period?: string };
            return `${slot.hour}:${String(slot.minute ?? "00").padStart(2, "0")}${slot.period ? ` ${slot.period}` : ""}`;
          }
          return String(item);
        })
        .filter(Boolean)
        .join(", ");
    }
  } catch {
    // plain text
  }
  return trimmed;
};

export default function GoldenTourLandingPage({ locale, tour, intent, pageSlug, relatedTours }: Props) {
  const t = copy[locale];
  const prefix = localePrefix(locale);
  const headline = fillGoldenTourText(intent.headline[locale], tour.title);
  const keyword = fillGoldenTourText(intent.keyword[locale], tour.title);
  const description = trimLong(tour.shortDescription || tour.description);
  const heroImage = resolveImage(tour);
  const gallery = [heroImage, ...parseGallery(tour.gallery)].filter(Boolean).slice(0, 6);
  const includes = toTextList(tour.includesList).length
    ? toTextList(tour.includesList)
    : toTextList(tour.includes).length
      ? toTextList(tour.includes)
      : [t.safePay, t.support, t.clearPrice];
  const notIncluded = toTextList(tour.notIncludedList).slice(0, 4);
  const facts = [
    { label: t.duration, value: formatDurationDisplay(tour.duration, locale === "es" ? "Duracion variable" : locale === "fr" ? "Duree variable" : "Flexible duration") },
    { label: t.zone, value: tour.location },
    { label: t.category, value: tour.category },
    { label: t.language, value: tour.language },
    { label: t.pickup, value: tour.pickup },
    { label: t.schedule, value: formatRawJsonList(tour.timeOptions) },
    { label: t.days, value: formatRawJsonList(tour.operatingDays) },
    { label: t.capacity, value: tour.capacity ? String(tour.capacity) : null },
    { label: t.age, value: tour.minAge ? `${tour.minAge}+` : null }
  ].filter((item) => Boolean(item.value)) as Array<{ label: string; value: string }>;
  const before = [
    { label: t.meeting, value: tour.meetingPoint || tour.meetingInstructions },
    { label: t.requirements, value: tour.requirements },
    { label: t.cancellation, value: tour.cancellationPolicy },
    { label: t.confirmation, value: tour.confirmationType }
  ].filter((item) => Boolean(item.value)) as Array<{ label: string; value: string }>;
  const bookHref = `${prefix}/tours/${tour.slug}#booking`;
  const whatsappText = encodeURIComponent(`${headline} - ${BASE_URL}${prefix}/punta-cana/tours/${pageSlug}`);
  const whatsappHref = `https://wa.me/18293939757?text=${whatsappText}`;
  const pageUrl = `${BASE_URL}${prefix}/punta-cana/tours/${pageSlug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: headline,
    description,
    image: gallery.map((image) => toAbsoluteUrl(image)),
    brand: { "@type": "Brand", name: "Proactivitis" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: tour.price,
      availability: "https://schema.org/InStock",
      url: pageUrl
    }
  };

  return (
    <main className="bg-[#f6faf8] text-slate-950">
      <StructuredData data={schema} />
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-45">
          <DynamicImage src={heroImage} alt={headline} className="h-full w-full object-cover" loading="eager" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/75 to-slate-950" />
        <div className="relative mx-auto grid min-h-[660px] max-w-6xl content-end gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-16">
          <div>
            <p className="inline-flex rounded-full border border-emerald-200/30 bg-emerald-300/15 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-emerald-100 backdrop-blur">
              {intent.badge[locale]}
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">{headline}</h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold text-emerald-100">{intent.promise[locale]}</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">{description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={bookHref}
                className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-emerald-300"
              >
                {intent.cta[locale] || t.reserve}
              </Link>
              <a
                href={whatsappHref}
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-slate-950"
              >
                {t.whatsapp}
              </a>
            </div>
          </div>
          <aside className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-100">{t.from}</p>
            <p className="mt-2 text-5xl font-black">USD {Math.round(tour.price)}</p>
            <p className="text-sm font-semibold text-slate-200">{t.adult}</p>
            <div className="mt-5 grid gap-2 text-sm text-slate-100">
              {tour.priceChild ? <p>{t.child}: USD {Math.round(tour.priceChild)}</p> : null}
              {tour.priceYouth ? <p>{t.youth}: USD {Math.round(tour.priceYouth)}</p> : null}
            </div>
            <div className="mt-6 grid gap-3">
              {[t.safePay, t.support, t.clearPrice, t.realPhotos].map((item) => (
                <p key={item} className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-bold text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                  {item}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {facts.slice(0, 8).map((fact) => (
          <article key={fact.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">{fact.label}</p>
            <p className="mt-2 text-base font-black text-slate-950">{fact.value}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-4 lg:grid-cols-[1fr_0.85fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{keyword}</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">{t.why}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Star, title: intent.badge[locale], body: intent.buyer[locale] },
              { icon: ShieldCheck, title: t.clearPrice, body: intent.proof[locale] },
              { icon: MessageCircle, title: t.support, body: locale === "es" ? "Puedes confirmar dudas por WhatsApp antes de pagar." : locale === "fr" ? "Vous pouvez confirmer vos questions par WhatsApp avant paiement." : "You can confirm questions on WhatsApp before payment." }
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <card.icon className="h-6 w-6 text-emerald-600" />
                <h3 className="mt-3 text-lg font-black text-slate-950">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{card.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-base leading-7 text-slate-700">{tour.description}</p>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">{t.included}</h2>
          <div className="mt-5 grid gap-3">
            {includes.slice(0, 8).map((item) => (
              <p key={item} className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
                {item}
              </p>
            ))}
            {notIncluded.map((item) => (
              <p key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                {item}
              </p>
            ))}
          </div>
        </article>
      </section>

      {gallery.length ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-3xl font-black text-slate-950">{t.gallery}</h2>
            <CalendarCheck className="h-7 w-7 text-emerald-600" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((image, index) => (
              <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-slate-200">
                <DynamicImage src={image} alt={`${tour.title} ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">{t.before}</h2>
          <div className="mt-5 divide-y divide-slate-100">
            {before.map((item) => (
              <div key={item.label} className="py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-2xl font-black">{t.faq}</h2>
          <div className="mt-5 space-y-4">
            {[
              {
                q: locale === "es" ? "Puedo reservar ahora?" : locale === "fr" ? "Puis-je reserver maintenant ?" : "Can I book now?",
                a: locale === "es" ? "Si hay disponibilidad, puedes pasar al tour y seleccionar fecha, hora y personas." : locale === "fr" ? "Si disponible, ouvrez la page du tour et choisissez date, heure et personnes." : "If available, open the tour page and choose date, time and travelers."
              },
              {
                q: locale === "es" ? "El precio cambia?" : locale === "fr" ? "Le prix change ?" : "Can the price change?",
                a: locale === "es" ? "El precio desde sirve como referencia. El total final depende de fecha, personas y opciones activas." : locale === "fr" ? "Le prix de depart est une reference. Le total depend date, personnes et options." : "The starting price is a guide. Final total depends on date, travelers and active options."
              },
              {
                q: locale === "es" ? "Puedo pedir ayuda?" : locale === "fr" ? "Puis-je demander de l aide ?" : "Can I ask for help?",
                a: locale === "es" ? "Si. Proactivitis puede ayudarte por WhatsApp antes y despues de reservar." : locale === "fr" ? "Oui. Proactivitis peut aider via WhatsApp avant et apres reservation." : "Yes. Proactivitis can help on WhatsApp before and after booking."
              }
            ].map((item) => (
              <div key={item.q} className="rounded-2xl bg-white/10 p-4">
                <p className="font-black">{item.q}</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{item.a}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {relatedTours.length ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-emerald-600" />
            <h2 className="text-3xl font-black text-slate-950">{t.related}</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTours.map((related) => (
              <Link
                key={related.slug}
                href={`${prefix}/tours/${related.slug}`}
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-200">
                  <DynamicImage src={resolveImage(related)} alt={related.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-black text-slate-950">{related.title}</h3>
                  <p className="mt-2 text-sm font-bold text-emerald-700">USD {Math.round(related.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-[28px] bg-emerald-500 p-6 text-slate-950 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em]">Proactivitis</p>
            <h2 className="mt-2 text-3xl font-black">{headline}</h2>
          </div>
          <Link
            href={bookHref}
            className="mt-5 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-white sm:mt-0"
          >
            {t.reserve}
          </Link>
        </div>
      </section>
    </main>
  );
}
