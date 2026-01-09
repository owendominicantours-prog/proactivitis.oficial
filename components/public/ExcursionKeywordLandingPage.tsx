import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DynamicImage } from "@/components/shared/DynamicImage";
import { findExcursionKeywordLandingBySlug } from "@/data/excursion-keyword-landings";
import { excursionKeywordLandings } from "@/data/excursion-keyword-landings";
import { Locale, translate, type TranslationKey } from "@/lib/translations";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import type { Prisma } from "@prisma/client";

const BASE_URL = "https://proactivitis.com";
const MAX_TOURS = 9;

const DURATION_UNIT_SYNONYMS = new Map<string, string>([
  ["min", "minute"],
  ["mins", "minute"],
  ["minute", "minute"],
  ["minutes", "minute"],
  ["minuto", "minute"],
  ["minutos", "minute"],
  ["heure", "hour"],
  ["heures", "hour"],
  ["hour", "hour"],
  ["hours", "hour"],
  ["hora", "hour"],
  ["horas", "hour"],
  ["jour", "day"],
  ["jours", "day"],
  ["day", "day"],
  ["days", "day"],
  ["dia", "day"],
  ["d\u00eda", "day"],
  ["dias", "day"],
  ["d\u00edas", "day"],
  ["week", "week"],
  ["weeks", "week"],
  ["semana", "week"],
  ["semanas", "week"],
  ["month", "month"],
  ["months", "month"],
  ["mes", "month"],
  ["meses", "month"]
]);

const DURATION_UNIT_LABELS: Record<Locale, Record<string, string>> = {
  es: {
    minute: "minutos",
    hour: "horas",
    day: "dias",
    week: "semanas",
    month: "meses"
  },
  en: {
    minute: "minutes",
    hour: "hours",
    day: "days",
    week: "weeks",
    month: "months"
  },
  fr: {
    minute: "minutes",
    hour: "heures",
    day: "jours",
    week: "semaines",
    month: "mois"
  }
};

const normalizeDurationUnit = (unit: string, locale: Locale) => {
  const key = DURATION_UNIT_SYNONYMS.get(unit.trim().toLowerCase());
  if (!key) return unit.trim();
  return DURATION_UNIT_LABELS[locale][key] ?? unit.trim();
};

const parseDurationMeta = (value?: string | null) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) {
      const { value: durationValue, unit } = parsed as { value?: string; unit?: string };
      if (typeof durationValue === "string" && durationValue.trim() && typeof unit === "string" && unit.trim()) {
        return { value: durationValue.trim(), unit: unit.trim() };
      }
    }
  } catch {
    return null;
  }
  return null;
};

const formatDurationLabel = (value: string | null | undefined, locale: Locale, t: (key: TranslationKey) => string) => {
  const meta = parseDurationMeta(value);
  if (meta) {
    const unit = normalizeDurationUnit(meta.unit, locale);
    return `${meta.value} ${unit}`;
  }
  if (value && value.trim()) {
    const trimmed = value.trim();
    const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(\D+)$/);
    if (match) {
      const unit = normalizeDurationUnit(match[2], locale);
      return `${match[1]} ${unit}`;
    }
    return normalizeDurationUnit(trimmed, locale);
  }
  return t("tour.card.duration.placeholder");
};

const FOCUS_TOKENS: Record<string, string[]> = {
  general: [],
  saona: ["saona", "isla saona", "bayahibe"],
  catalina: ["catalina", "isla catalina"],
  snorkeling: ["snorkel", "snorkeling", "reef", "coral", "scuba", "diving"],
  buggy: ["buggy", "atv", "dune", "cave"],
  horseback: ["horse", "horseback", "caballo"],
  parasailing: ["parasailing", "paragliding"],
  watersports: ["jetski", "jet ski", "banana", "speedboat", "water sports"],
  partyboat: ["party boat", "booze cruise", "catamaran", "sunset"],
  samana: ["samana", "whale", "cayo levantado", "el limon", "bacardi"],
  cultural: ["santo domingo", "cultural", "city", "higuey", "basilica", "countryside", "river", "market", "eco", "hidden"]
};

const buildLongCopy = (keyword: string, locale: Locale) => {
  if (locale === "en") {
    return [
      `Explore ${keyword} with curated tours that prioritize comfort, safety, and clear pricing.`,
      "We work with verified operators and local guides so you can book with confidence and receive fast confirmation.",
      "Most experiences include hotel pickup, bilingual support, and flexible cancellation options."
    ];
  }
  if (locale === "fr") {
    return [
      `Decouvrez ${keyword} avec des tours selectionnes qui privilegient confort, securite et prix clairs.`,
      "Nous travaillons avec des operateurs verifies et des guides locaux pour une confirmation rapide.",
      "La plupart des experiences incluent pickup hotel, support bilingue et annulation flexible."
    ];
  }
  return [
    `Explora ${keyword} con tours curados que priorizan comodidad, seguridad y precios claros.`,
    "Trabajamos con operadores verificados y guias locales para que reserves con confianza y confirmacion rapida.",
    "La mayoria de las experiencias incluye pickup en hotel, soporte bilingue y cancelacion flexible."
  ];
};

type TourWithTranslations = Prisma.TourGetPayload<{
  include: {
    departureDestination: { select: { name: true } };
    translations: { select: { locale: true; title: true; shortDescription: true } };
  };
}>;

const buildTourQuery = (tokens: string[], locale: Locale) => {
  if (!tokens.length) return undefined;
  const or: Prisma.TourWhereInput[] = [];
  tokens.forEach((token) => {
    or.push(
      { title: { contains: token, mode: "insensitive" } },
      { slug: { contains: token, mode: "insensitive" } },
      { category: { contains: token, mode: "insensitive" } },
      {
        translations: {
          some: {
            locale,
            title: { contains: token, mode: "insensitive" }
          }
        }
      },
      {
        translations: {
          some: {
            locale,
            shortDescription: { contains: token, mode: "insensitive" }
          }
        }
      }
    );
  });
  return { OR: or };
};

const fetchToursForLanding = async (focus: string, locale: Locale) => {
  const tokens = FOCUS_TOKENS[focus] ?? [];
  const where: Prisma.TourWhereInput = {
    status: "published",
    slug: { not: HIDDEN_TRANSFER_SLUG },
    ...(buildTourQuery(tokens, locale) ?? {})
  };
  let tours: TourWithTranslations[] = [];
  try {
    tours = await prisma.tour.findMany({
      where: tokens.length ? where : { status: "published", slug: { not: HIDDEN_TRANSFER_SLUG } },
      orderBy: { createdAt: "desc" },
      include: {
        departureDestination: { select: { name: true } },
        translations: {
          where: { locale },
          select: { locale: true, title: true, shortDescription: true }
        }
      },
      take: MAX_TOURS
    });
  } catch {
    tours = [];
  }

  if (tokens.length && tours.length < 6) {
    const fallback = await prisma.tour.findMany({
      where: { status: "published", slug: { not: HIDDEN_TRANSFER_SLUG } },
      orderBy: { createdAt: "desc" },
      include: {
        departureDestination: { select: { name: true } },
        translations: {
          where: { locale },
          select: { locale: true, title: true, shortDescription: true }
        }
      },
      take: MAX_TOURS
    });
    tours = fallback;
  }

  return tours;
};

const buildCanonical = (slug: string, locale: Locale) =>
  locale === "es" ? `${BASE_URL}/excursiones/${slug}` : `${BASE_URL}/${locale}/excursiones/${slug}`;

export async function buildExcursionLandingMetadata(landingSlug: string, locale: Locale): Promise<Metadata> {
  const landing = findExcursionKeywordLandingBySlug(landingSlug);
  if (!landing) return {};
  const canonical = buildCanonical(landing.landingSlug, locale);
  const seoTitle = landing.seoTitle[locale];
  const seoDescription = landing.metaDescription[locale];
  const imageUrl = encodeURI(`${BASE_URL}/fototours/fototour.jpeg`);
  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical,
      languages: {
        es: `/excursiones/${landing.landingSlug}`,
        en: `/en/excursiones/${landing.landingSlug}`,
        fr: `/fr/excursiones/${landing.landingSlug}`
      }
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      locale: locale === "es" ? "es_DO" : locale === "fr" ? "fr_FR" : "en_US",
      images: [
        {
          url: imageUrl,
          alt: landing.keyword
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [imageUrl]
    },
    keywords: landing.keywords
  };
}

export async function ExcursionKeywordLandingPage({ landingSlug, locale }: { landingSlug: string; locale: Locale }) {
  const landing = findExcursionKeywordLandingBySlug(landingSlug);
  if (!landing) return notFound();

  const t = (key: TranslationKey, replacements?: Parameters<typeof translate>[2]) =>
    translate(locale, key, replacements);

  const tours = await fetchToursForLanding(landing.focus, locale);
  const longCopy = buildLongCopy(landing.keyword, locale);
  const pluralSuffix = tours.length === 1 ? "" : "s";

  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-emerald-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">Proactivitis Tours</p>
          <h1 className="mt-4 text-4xl font-black text-slate-900 md:text-5xl">{landing.titles[locale]}</h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600">{landing.descriptions[locale]}</p>
          <div className="mt-6 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            {longCopy.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">{landing.keyword}</h2>
          <Link href={locale === "es" ? "/tours" : `/${locale}/tours`} className="text-sm font-semibold text-emerald-600">
            {t("tours.destinations.cta")}
          </Link>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {t("tours.results.count", { count: tours.length.toString(), plural: pluralSuffix })}
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => {
            const translation = tour.translations?.[0];
            const localizedTitle = translation?.title ?? tour.title;
            const localizedDescription = translation?.shortDescription ?? tour.shortDescription ?? undefined;
            const tourPath = locale === "es" ? `/tours/${tour.slug}` : `/${locale}/tours/${tour.slug}`;
            const verifiedText = t("tour.card.verifiedLabel");
            const fromLabel = t("tour.card.fromLabel");
            const languagesLabel = t("tour.card.language.label");
            const languageFallback = t("tour.card.language.fallback");
            const languageValue = tour.language?.trim() ? tour.language : languageFallback;
            const locationLabel = tour.departureDestination?.name ?? tour.location ?? "Punta Cana";

            return (
              <Link
                key={tour.slug}
                href={tourPath}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-slate-200">
                  <DynamicImage
                    src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                    alt={localizedTitle}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-2 px-4 py-4">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    <span>{locationLabel}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-600">
                      {verifiedText}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 line-clamp-2">{localizedTitle}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {fromLabel}{" "}
                      <span className="text-base font-black text-indigo-600">${tour.price.toFixed(0)}</span>
                    </span>
                    <span className="text-xs text-slate-500">{formatDurationLabel(tour.duration, locale, t)}</span>
                  </div>
                  <p className="text-xs text-slate-500">{languagesLabel}: {languageValue}</p>
                  {localizedDescription && (
                    <p className="text-xs text-slate-500 line-clamp-2">{localizedDescription}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        {tours.length === 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            {t("tours.no-results")}
          </div>
        )}
      </section>
    </main>
  );
}

export const excursionLandingSlugs = excursionKeywordLandings.map((landing) => landing.landingSlug);
