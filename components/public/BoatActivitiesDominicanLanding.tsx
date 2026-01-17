import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translationService";
import type { Locale } from "@/lib/translations";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { DynamicImage } from "@/components/shared/DynamicImage";

const TOUR_SLUGS = [
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana",
  "tour-isla-saona-desde-bayhibe-la-romana",
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana",
  "sunset-catamaran-snorkel",
  "party-boat-sosua"
];

const DEFAULT_TOUR_IMAGE = "/fototours/fotosimple.jpg";

const BASE_COPY = {
  eyebrow: "Republica Dominicana",
  title: "Top actividades en barco en Republica Dominicana",
  subtitle:
    "Seleccionamos las excursiones mas completas en mar: Saona, ballenas en Samana y los party boats mas buscados.",
  sections: [
    {
      title: "Experiencias en barco que valen el viaje",
      body:
        "Estas rutas combinan mar Caribe, naturaleza y entretenimiento. Cada tour incluye datos claros, horarios definidos y soporte continuo para que puedas elegir con confianza."
    },
    {
      title: "Opciones para grupos, parejas y celebraciones",
      body:
        "Desde catamaranes tranquilos hasta barcos de fiesta con open bar. Escoge el estilo que buscas y compara disponibilidad real."
    }
  ],
  cardsTitle: "Las mejores experiencias en barco",
  cardsSubtitle: "Selecciona el tour, revisa los detalles y reserva en minutos.",
  ctaLabel: "Ver tour",
  priceLabel: "Desde",
  durationLabel: "Duracion",
  pickupLabel: "Recogida incluida"
};

type BoatLandingCopy = typeof BASE_COPY;

const localizeCopy = async (locale: Locale): Promise<BoatLandingCopy> => {
  if (locale === "es") return BASE_COPY;
  const [eyebrow, title, subtitle, cardsTitle, cardsSubtitle, ctaLabel, priceLabel, durationLabel, pickupLabel] =
    await Promise.all([
      translateText(BASE_COPY.eyebrow, locale),
      translateText(BASE_COPY.title, locale),
      translateText(BASE_COPY.subtitle, locale),
      translateText(BASE_COPY.cardsTitle, locale),
      translateText(BASE_COPY.cardsSubtitle, locale),
      translateText(BASE_COPY.ctaLabel, locale),
      translateText(BASE_COPY.priceLabel, locale),
      translateText(BASE_COPY.durationLabel, locale),
      translateText(BASE_COPY.pickupLabel, locale)
    ]);
  const sections = await Promise.all(
    BASE_COPY.sections.map(async (section) => ({
      title: await translateText(section.title, locale),
      body: await translateText(section.body, locale)
    }))
  );
  return {
    eyebrow,
    title,
    subtitle,
    sections,
    cardsTitle,
    cardsSubtitle,
    ctaLabel,
    priceLabel,
    durationLabel,
    pickupLabel
  };
};

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as string[]) ?? [];
  } catch {
    return [];
  }
};

const resolveHeroImage = (tour: { heroImage?: string | null; gallery?: string | null }) => {
  const gallery = parseGallery(tour.gallery);
  return tour.heroImage ?? gallery[0] ?? DEFAULT_TOUR_IMAGE;
};

const toAbsoluteUrl = (value: string) => {
  if (!value) return `${PROACTIVITIS_URL}${DEFAULT_TOUR_IMAGE}`;
  if (value.startsWith("http")) return value;
  return `${PROACTIVITIS_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

type DurationPayload = {
  value?: string | number;
  unit?: string;
};

const normalizeDurationUnit = (unit: string, locale: Locale) => {
  const lower = unit.toLowerCase();
  if (locale === "es") {
    if (lower.includes("hour") || lower.includes("hora")) return "horas";
    if (lower.includes("minute") || lower.includes("minuto")) return "minutos";
    if (lower.includes("day") || lower.includes("dia")) return "dias";
    return unit;
  }
  if (locale === "fr") {
    if (lower.includes("hour") || lower.includes("hora")) return "heures";
    if (lower.includes("minute") || lower.includes("minuto")) return "minutes";
    if (lower.includes("day") || lower.includes("dia")) return "jours";
    return unit;
  }
  if (lower.includes("hora") || lower.includes("hour")) return "hours";
  if (lower.includes("minuto") || lower.includes("minute")) return "minutes";
  if (lower.includes("dia") || lower.includes("day")) return "days";
  return unit;
};

const resolveDurationLabel = (value: string | null | undefined, locale: Locale) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed) as DurationPayload;
      if (parsed?.value && parsed?.unit) {
        return `${parsed.value} ${normalizeDurationUnit(parsed.unit, locale)}`;
      }
    } catch {
      return trimmed;
    }
  }
  return normalizeDurationUnit(trimmed, locale) === trimmed ? trimmed : normalizeDurationUnit(trimmed, locale);
};

export async function buildBoatActivitiesMetadata(locale: Locale): Promise<Metadata> {
  const copy = await localizeCopy(locale);
  const canonicalPath = "/things-to-do/boat-activities-dominican-republic";
  const canonicalUrl =
    locale === "es"
      ? `${PROACTIVITIS_URL}${canonicalPath}`
      : `${PROACTIVITIS_URL}/${locale}${canonicalPath}`;
  const heroImage = toAbsoluteUrl(DEFAULT_TOUR_IMAGE);

  return {
    title: copy.title,
    description: copy.subtitle,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        es: `${PROACTIVITIS_URL}${canonicalPath}`,
        en: `${PROACTIVITIS_URL}/en${canonicalPath}`,
        fr: `${PROACTIVITIS_URL}/fr${canonicalPath}`
      }
    },
    openGraph: {
      title: copy.title,
      description: copy.subtitle,
      url: canonicalUrl,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: copy.title
        }
      ],
      siteName: "Proactivitis",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.subtitle,
      images: [heroImage]
    }
  };
}

export default async function BoatActivitiesDominicanLanding({ locale }: { locale: Locale }) {
  const [copy, tours] = await Promise.all([
    localizeCopy(locale),
    prisma.tour.findMany({
      where: { slug: { in: TOUR_SLUGS }, status: "published" },
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        subtitle: true,
        description: true,
        duration: true,
        pickup: true,
        price: true,
        heroImage: true,
        gallery: true,
        destination: { select: { name: true } },
        translations: {
          where: { locale },
          select: { title: true, shortDescription: true, description: true }
        }
      }
    })
  ]);

  if (!tours.length) {
    notFound();
  }

  const tourCards = await Promise.all(
    tours.map(async (tour) => {
      const translation = tour.translations?.[0];
      const title = translation?.title ?? tour.title;
      const description =
        translation?.shortDescription ??
        translation?.description ??
        tour.shortDescription ??
        tour.subtitle ??
        "";
      const duration = resolveDurationLabel(tour.duration, locale);
      const pickupIncluded = Boolean(tour.pickup);
      return {
        id: tour.id,
        slug: tour.slug,
        title,
        description,
        duration,
        pickupIncluded,
        price: tour.price,
        image: resolveHeroImage(tour),
        destination: tour.destination?.name ?? "Republica Dominicana"
      };
    })
  );

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">{copy.eyebrow}</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{copy.title}</h1>
            <p className="text-lg text-slate-600">{copy.subtitle}</p>
          </div>
          <div className="grid gap-4">
            {copy.sections.map((section) => (
              <div
                key={section.title}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                <p className="mt-2 text-sm text-slate-600">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-16">
        <div className="flex flex-col gap-3 pb-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{copy.cardsTitle}</p>
          <p className="text-sm text-slate-600">{copy.cardsSubtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tourCards.map((tour) => (
            <article
              key={tour.id}
              className="flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative h-44 w-full">
                <DynamicImage src={tour.image} alt={tour.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">
                  {tour.destination}
                </p>
                <h3 className="text-lg font-semibold text-slate-900">{tour.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3">{tour.description}</p>
                <div className="mt-auto space-y-2 text-xs text-slate-500">
                  {tour.duration && (
                    <p>
                      <span className="font-semibold text-slate-700">{copy.durationLabel}:</span>{" "}
                      {resolveDurationLabel(tour.duration, locale)}
                    </p>
                  )}
                  {tour.pickupIncluded && (
                    <p className="font-semibold text-emerald-600">{copy.pickupLabel}</p>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">{copy.priceLabel}</p>
                    <p className="text-xl font-semibold text-slate-900">${tour.price.toFixed(0)} USD</p>
                  </div>
                  <a
                    href={`/tours/${tour.slug}`}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 hover:border-slate-400"
                  >
                    {copy.ctaLabel}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
