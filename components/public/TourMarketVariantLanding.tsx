import Link from "next/link";
import { DynamicImage } from "@/components/shared/DynamicImage";
import { formatDurationDisplay } from "@/lib/formatDuration";
import type { Locale } from "@/lib/translations";
import type { TourMarketIntent } from "@/lib/tourMarketVariants";
import { buildTourMarketIntentCards, buildTourMarketIntentFaqs } from "@/lib/tourMarketVariants";

const FALLBACK_TOUR_IMAGE = "/fototours/fototour.jpeg";

type Props = {
  locale: Locale;
  tour: {
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
  intent: TourMarketIntent;
};

const copy = {
  es: {
    badge: "Experiencia seleccionada",
    reserve: "Ver disponibilidad",
    details: "Ver pagina completa",
    from: "Desde",
    adult: "adulto",
    child: "nino",
    youth: "joven",
    duration: "Duracion",
    location: "Zona",
    category: "Tipo",
    language: "Idioma",
    pickup: "Recogida",
    whyTitle: "Por que elegir esta experiencia",
    tourTitle: "Detalles reales del tour",
    includesTitle: "Que incluye",
    beforeTitle: "Antes de reservar",
    galleryTitle: "Fotos de la experiencia",
    faqTitle: "Preguntas frecuentes",
    meetingPoint: "Punto de encuentro",
    meetingInstructions: "Instrucciones de recogida",
    requirements: "Requisitos",
    cancellation: "Cancelacion",
    confirmation: "Confirmacion",
    schedule: "Horarios",
    days: "Dias de operacion",
    capacity: "Capacidad",
    minAge: "Edad minima",
    fallbackIncludes: ["Soporte local de Proactivitis", "Confirmacion de reserva", "Detalles claros antes del pago"],
    support: "Soporte humano antes y despues de reservar"
  },
  en: {
    badge: "Selected experience",
    reserve: "Check availability",
    details: "Open full tour page",
    from: "From",
    adult: "adult",
    child: "child",
    youth: "youth",
    duration: "Duration",
    location: "Area",
    category: "Type",
    language: "Language",
    pickup: "Pickup",
    whyTitle: "Why choose this experience",
    tourTitle: "Real tour details",
    includesTitle: "What's included",
    beforeTitle: "Before booking",
    galleryTitle: "Experience photos",
    faqTitle: "Frequently asked questions",
    meetingPoint: "Meeting point",
    meetingInstructions: "Pickup instructions",
    requirements: "Requirements",
    cancellation: "Cancellation",
    confirmation: "Confirmation",
    schedule: "Times",
    days: "Operating days",
    capacity: "Capacity",
    minAge: "Minimum age",
    fallbackIncludes: ["Local Proactivitis support", "Booking confirmation", "Clear details before payment"],
    support: "Human support before and after booking"
  },
  fr: {
    badge: "Experience selectionnee",
    reserve: "Voir disponibilite",
    details: "Voir la page complete",
    from: "A partir de",
    adult: "adulte",
    child: "enfant",
    youth: "jeune",
    duration: "Duree",
    location: "Zone",
    category: "Type",
    language: "Langue",
    pickup: "Pickup",
    whyTitle: "Pourquoi choisir cette experience",
    tourTitle: "Details reels du tour",
    includesTitle: "Ce qui est inclus",
    beforeTitle: "Avant de reserver",
    galleryTitle: "Photos de l experience",
    faqTitle: "Questions frequentes",
    meetingPoint: "Point de rencontre",
    meetingInstructions: "Instructions de pickup",
    requirements: "Conditions",
    cancellation: "Annulation",
    confirmation: "Confirmation",
    schedule: "Horaires",
    days: "Jours d operation",
    capacity: "Capacite",
    minAge: "Age minimum",
    fallbackIncludes: ["Support local Proactivitis", "Confirmation de reservation", "Details clairs avant paiement"],
    support: "Support humain avant et apres reservation"
  }
} as const;

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

const trimLong = (value: string, max = 520) =>
  value.length > max ? `${value.slice(0, max).trim()}...` : value;

export default function TourMarketVariantLanding({ locale, tour, intent }: Props) {
  const t = copy[locale];
  const localePrefix = locale === "es" ? "" : `/${locale}`;
  const title =
    locale === "es"
      ? `${intent.heroPrefix.es}: ${tour.title} en Punta Cana`
      : locale === "fr"
        ? `${intent.heroPrefix.fr}: ${tour.title} a Punta Cana`
        : `${intent.heroPrefix.en}: ${tour.title} in Punta Cana`;
  const description = trimLong(tour.shortDescription || tour.description);
  const durationLabel = formatDurationDisplay(
    tour.duration,
    locale === "es" ? "Duracion variable" : locale === "fr" ? "Duree variable" : "Flexible duration"
  );
  const intentCards = buildTourMarketIntentCards(intent, locale, tour.title, 0);
  const intentFaqs = buildTourMarketIntentFaqs(intent, locale, tour.title);
  const highlights = toTextList(tour.highlights);
  const includes = toTextList(tour.includesList).length
    ? toTextList(tour.includesList)
    : toTextList(tour.includes).length
      ? toTextList(tour.includes)
      : [...t.fallbackIncludes];
  const notIncluded = toTextList(tour.notIncludedList);
  const gallery = [tour.heroImage, ...parseGallery(tour.gallery)].filter((item): item is string => Boolean(item)).slice(0, 6);
  const facts: Array<{ label: string; value?: string | null }> = [
    { label: t.duration, value: durationLabel },
    { label: t.location, value: tour.location },
    { label: t.category, value: tour.category },
    { label: t.language, value: tour.language },
    { label: t.pickup, value: tour.pickup },
    { label: t.schedule, value: tour.timeOptions },
    { label: t.days, value: tour.operatingDays },
    { label: t.capacity, value: tour.capacity ? `${tour.capacity}` : null },
    { label: t.minAge, value: tour.minAge ? `${tour.minAge}+` : null }
  ].filter((item) => Boolean(item.value)) as Array<{ label: string; value: string }>;
  const beforeBooking: Array<{ label: string; value?: string | null }> = [
    { label: t.meetingPoint, value: tour.meetingPoint },
    { label: t.meetingInstructions, value: tour.meetingInstructions },
    { label: t.requirements, value: tour.requirements },
    { label: t.cancellation, value: tour.cancellationPolicy },
    { label: t.confirmation, value: tour.confirmationType },
    { label: "Proactivitis", value: t.support }
  ].filter((item) => Boolean(item.value)) as Array<{ label: string; value: string }>;

  return (
    <main className="bg-[#f7faf9] text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-45">
          <DynamicImage
            src={tour.heroImage || FALLBACK_TOUR_IMAGE}
            alt={tour.title}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/70 to-slate-950" />
        <div className="relative mx-auto grid min-h-[620px] max-w-6xl content-end gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-16">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-emerald-100 backdrop-blur">
              {t.badge}
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold text-emerald-100">{intent.angle[locale]}</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">{description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`${localePrefix}/tours/${tour.slug}#booking`}
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-emerald-300"
              >
                {t.reserve}
              </Link>
              <Link
                href={`${localePrefix}/tours/${tour.slug}`}
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-slate-950"
              >
                {t.details}
              </Link>
            </div>
          </div>
          <aside className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-100">{t.from}</p>
            <p className="mt-2 text-5xl font-black">USD {Math.round(tour.price)}</p>
            <p className="text-sm font-semibold text-slate-200">{t.adult}</p>
            <div className="mt-5 grid gap-2 text-sm text-slate-100">
              {tour.priceChild ? <p>{t.child}: USD {Math.round(tour.priceChild)}</p> : null}
              {tour.priceYouth ? <p>{t.youth}: USD {Math.round(tour.priceYouth)}</p> : null}
              <p>{t.duration}: {durationLabel}</p>
              <p>{t.location}: {tour.location}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {facts.slice(0, 8).map((fact) => (
          <article key={`${fact.label}-${fact.value}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">{fact.label}</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{fact.value}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{intent.keyword[locale]}</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">{t.whyTitle}</h2>
          <div className="mt-5 grid gap-3">
            {intentCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <h3 className="text-base font-black text-slate-950">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{card.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-black text-slate-950">{t.tourTitle}</h2>
          <p className="mt-3 text-base leading-7 text-slate-700">{tour.description}</p>
          {highlights.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {highlights.slice(0, 6).map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800">
                  {item}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">{t.includesTitle}</h2>
          <div className="mt-5 grid gap-3">
            {includes.slice(0, 10).map((item) => (
              <p key={item} className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
                {item}
              </p>
            ))}
            {notIncluded.slice(0, 4).map((item) => (
              <p key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">{t.beforeTitle}</h2>
          <div className="mt-5 divide-y divide-slate-100">
            {beforeBooking.map((item) => (
              <div key={item.label} className="py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {gallery.length ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-2xl font-black text-slate-950">{t.galleryTitle}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((image, index) => (
              <div key={`${image}-${index}`} className="relative h-64 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
                <DynamicImage src={image} alt={`${tour.title} ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-8 pb-16">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">{t.faqTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {intentFaqs.map((faq) => (
              <article key={faq.q} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">{faq.q}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
