import Link from "next/link";
import { logPrismaError, prisma } from "@/lib/prisma";
import { buildTourFilter, TourSearchParams } from "@/lib/filterBuilder";
import { TourFilters } from "@/components/public/TourFilters";
import { DynamicImage } from "@/components/shared/DynamicImage";
import { TrustBadges } from "@/components/shared/TrustBadges";
import type { DurationOption } from "@/components/public/TourFilters";
import type { Prisma } from "@prisma/client";
import { Locale, translate, type TranslationKey } from "@/lib/translations";

const parseDurationMeta = (value?: string | null) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) {
      const { value: durationValue, unit } = parsed;
      if (typeof durationValue === "string" && durationValue.trim() && typeof unit === "string" && unit.trim()) {
        return { value: durationValue.trim(), unit: unit.trim() };
      }
    }
  } catch {
    // fall back to plain string
  }
  return null;
};

type CanonicalDurationUnit = "minute" | "hour" | "day" | "week" | "month";

const DURATION_UNIT_SYNONYMS = new Map<string, CanonicalDurationUnit>([
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

const DURATION_UNIT_LABELS: Record<Locale, Record<CanonicalDurationUnit, string>> = {
  es: {
    minute: "minutos",
    hour: "horas",
    day: "d\u00edas",
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

const formatDurationLabel = (
  value: string | null | undefined,
  locale: Locale,
  t: (key: TranslationKey) => string
) => {
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

const buildDurationOptions = (
  values: (string | null)[],
  locale: Locale,
  t: (key: TranslationKey) => string
): DurationOption[] => {
  const map = new Map<string, string>();
  for (const value of values) {
    if (!value) continue;
    if (!map.has(value)) {
      map.set(value, formatDurationLabel(value, locale, t));
    }
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
};

type Props = {
  searchParams?: Promise<TourSearchParams>;
  locale: Locale;
};

type CountryOption = Prisma.CountryGetPayload<{
  select: { name: true; slug: true };
}>;

type DestinationOption = Prisma.DestinationGetPayload<{
  select: {
    name: true;
    slug: true;
    country: { select: { slug: true } };
  };
}>;

type TourLanguageRow = Prisma.TourGetPayload<{
  select: { language: true };
}>;

type TourDurationRow = Prisma.TourGetPayload<{
  select: { duration: true };
}>;

type TourWithDeparture = Prisma.TourGetPayload<{
  include: {
    departureDestination: {
      include: { country: true };
    };
    country: true;
    destination: true;
    microZone: true;
    translations: {
      select: {
        locale: true;
        title: true;
        shortDescription: true;
        description: true;
      };
    };
  };
}>;

export default async function PublicToursPage({ searchParams, locale }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const params = resolvedSearchParams ?? {};

  let countries: CountryOption[] = [];
  try {
    countries = await prisma.country.findMany({
      select: { name: true, slug: true }
    });
  } catch (error) {
    logPrismaError("loading countries", error);
  }

  let destinations: DestinationOption[] = [];
  try {
    destinations = await prisma.destination.findMany({
      select: {
        name: true,
        slug: true,
        country: { select: { slug: true } }
      }
    });
  } catch (error) {
    logPrismaError("loading destinations", error);
  }

  let languagesRaw: TourLanguageRow[] = [];
  try {
    languagesRaw = await prisma.tour.findMany({
      where: { status: "published" },
      select: { language: true }
    });
  } catch (error) {
    logPrismaError("loading languages", error);
  }

  let durationsRaw: TourDurationRow[] = [];
  try {
    durationsRaw = await prisma.tour.findMany({
      where: { status: "published" },
      select: { duration: true }
    });
  } catch (error) {
    logPrismaError("loading durations", error);
  }

  const uniqueLanguages = Array.from(new Set(languagesRaw.map((entry) => entry.language).filter(Boolean)));
  const t = (key: TranslationKey, replacements?: Parameters<typeof translate>[2]) =>
    translate(locale, key, replacements);
  const durationOptions = buildDurationOptions(durationsRaw.map((entry) => entry.duration), locale, t);
  const durationLabelLookup = new Map(durationOptions.map((option) => [option.value, option.label]));

  const where = {
    ...buildTourFilter(params),
    slug: { not: "transfer-privado-proactivitis" }
  };

  let tours: TourWithDeparture[] = [];
  try {
    tours = await prisma.tour.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        departureDestination: {
          include: { country: true }
        },
        country: true,
        destination: true,
        microZone: true,
        translations: {
          where: { locale },
          select: {
            locale: true,
            title: true,
            shortDescription: true,
            description: true
          }
        }
      },
      take: 24
    });
  } catch (error) {
    logPrismaError("loading tours", error);
    console.error("Tour query failed", { where, error });
  }

  const activeFilters = [
    params.country && t("tours.filter.active.country", { value: params.country }),
    params.destination && t("tours.filter.active.destination", { value: params.destination }),
    params.language && t("tours.filter.active.language", { value: params.language }),
    params.duration &&
      t("tours.filter.active.duration", {
        value: durationLabelLookup.get(params.duration) ?? params.duration
      }),
    params.minPrice && t("tours.filter.active.minPrice", { value: params.minPrice }),
    params.maxPrice && t("tours.filter.active.maxPrice", { value: params.maxPrice })
  ].filter(Boolean);

  const featureKeys: TranslationKey[] = [
    "tours.features.instant",
    "tours.features.flexible",
    "tours.features.support"
  ];

  const pluralSuffix = tours.length === 1 ? "" : "s";
  const resultsLabel = t("tours.results.count", { count: tours.length, plural: pluralSuffix });

  return (
    <div className="bg-slate-50 pb-16">
      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              {t("tours.header.tagline")}
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              {t("tours.header.title")}
            </h1>
            <p className="text-base text-slate-600">{t("tours.header.description")}</p>
            <TrustBadges locale={locale} compact className="pt-2" />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
          <aside className="space-y-6">
            <TourFilters
              countries={countries}
              destinations={destinations.map((dest) => ({
                name: dest.name,
                slug: dest.slug,
                countrySlug: dest.country.slug
              }))}
              languages={uniqueLanguages}
              durations={durationOptions}
              mobileFriendly
              categories={["Aventura", "Cultura", "Gastronomía", "Privados", "Acuáticos"]}
            />
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">{t("tours.filter.intro")}</p>
              <ul className="space-y-1">
                <li>{t("tours.filter.item.category")}</li>
                <li>{t("tours.filter.item.destination")}</li>
                <li>{t("tours.filter.item.duration")}</li>
                <li>{t("tours.filter.item.group")}</li>
              </ul>
            </div>
          </aside>
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm font-medium text-slate-700 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
                {featureKeys.map((key) => (
                  <span key={key} className="flex items-center gap-2">
                    <span className="text-emerald-500">✅</span>
                    {t(key)}
                  </span>
                ))}
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((label) => (
                  <span key={label} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                    {label}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-500">{resultsLabel}</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => {
                const translation = tour.translations?.[0];
                const localizedTitle = translation?.title ?? tour.title;
                const tourPath = locale === "es" ? `/tours/${tour.slug}` : `/${locale}/tours/${tour.slug}`;
                const verifiedText = t("tour.card.verifiedLabel");
                const fromLabel = t("tour.card.fromLabel");
                const languagesLabel = t("tour.card.language.label");
                const languageFallback = t("tour.card.language.fallback");
                const languageValue = tour.language?.trim() ? tour.language : languageFallback;

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
                        <span>{tour.departureDestination?.name ?? tour.location}</span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-600">
                          {verifiedText}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 line-clamp-2">{localizedTitle}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {fromLabel}{" "}
                          <span className="text-base font-black text-indigo-600">
                            ${tour.price.toFixed(0)}
                          </span>
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDurationLabel(tour.duration, locale, t)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {languagesLabel}: {languageValue}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
            {tours.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                {t("tours.no-results")}
              </div>
            )}
          </section>
        </div>
      </main>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {t("tours.longform.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">{t("tours.longform.title")}</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{t("tours.longform.body1")}</p>
            <p>{t("tours.longform.body2")}</p>
            <p>{t("tours.longform.body3")}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {t("tours.longform2.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">{t("tours.longform2.title")}</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{t("tours.longform2.body1")}</p>
            <p>{t("tours.longform2.body2")}</p>
            <p>{t("tours.longform2.body3")}</p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {t("tours.destinations.label")}
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">{t("tours.destinations.heading")}</h2>
          </div>
          <Link href="/destinations" className="text-sm font-semibold text-slate-600 underline transition hover:text-slate-900">
            {t("tours.destinations.cta")}
          </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinations.slice(0, 6).map((dest) => (
              <Link
                key={dest.slug}
                href={`/destinations/${dest.country.slug}/${dest.slug}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-500 hover:bg-white"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Desde {dest.country.slug}</div>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{dest.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{t("tours.destinations.description")}</p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-sky-600">
                  {t("tours.destinations.link")}
                </span>
              </Link>
            ))}
            <p className="mt-6 text-sm text-slate-500">{t("tours.destinations.footer")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
