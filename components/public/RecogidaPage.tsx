import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import { Locale, translate } from "@/lib/translations";

const RECENT_TOURS_LIMIT = 6;
const BASE_URL = "https://proactivitis.com";

type SearchParams = {
  bookingCode?: string;
};

type RecogidaPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<SearchParams>;
};

type TourWithDeparture = Prisma.TourGetPayload<{
  include: {
    departureDestination: { select: { name: true; slug: true; country: { select: { slug: true } } } };
  };
}>;

const buildCanonical = (slug: string, locale: Locale) =>
  locale === "es" ? `${BASE_URL}/recogida/${slug}` : `${BASE_URL}/${locale}/recogida/${slug}`;

export async function buildRecogidaMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const location = await prisma.location.findUnique({ where: { slug } });
  if (!location) {
    return {
      title: translate(locale, "recogida.meta.fallbackTitle"),
      description: translate(locale, "recogida.meta.fallbackDescription")
    };
  }

  return {
    title: translate(locale, "recogida.meta.title", { hotel: location.name }),
    description: translate(locale, "recogida.meta.description", { hotel: location.name }),
    alternates: {
      canonical: buildCanonical(location.slug, locale),
      languages: {
        es: `/recogida/${location.slug}`,
        en: `/en/recogida/${location.slug}`,
        fr: `/fr/recogida/${location.slug}`
      }
    }
  };
}


const buildTourUrl = (tour: { slug: string }, locationSlug: string, bookingCode?: string) => {
  const params = new URLSearchParams({
    hotelSlug: locationSlug
  });
  if (bookingCode) {
    params.set("bookingCode", bookingCode);
  }
  return `/tours/${tour.slug}/recogida/${locationSlug}?${params.toString()}`;
};

export async function RecogidaPage({
  params,
  searchParams,
  locale
}: RecogidaPageProps & { locale: Locale }) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const bookingCode = resolvedSearchParams?.bookingCode;
  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);

  let location = null;
  try {
    location = await prisma.location.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        microZone: true,
        destination: true,
        country: true
      }
    });
  } catch (error) {
    console.error("Error cargando location para slug", { slug: resolvedParams.slug, error });
    throw error;
  }

  if (!location) {
    console.error("Location no encontrada", { slug: resolvedParams.slug });
    notFound();
  }

  const baseCountryCondition = { countryId: location.countryId };
  const orFilters = [];
  if (location.microZoneId) {
    orFilters.push({ ...baseCountryCondition, microZoneId: location.microZoneId });
  }
  if (location.destinationId) {
    orFilters.push({ ...baseCountryCondition, destinationId: location.destinationId });
  }
  orFilters.push(baseCountryCondition);
  orFilters.push({
    ...baseCountryCondition,
    category: { contains: "Nacional", mode: "insensitive" }
  });
  if (location.destination?.name?.toLowerCase().includes("punta cana")) {
    orFilters.push({
      ...baseCountryCondition,
      category: { contains: "Punta Cana", mode: "insensitive" }
    });
  }

  let tours: TourWithDeparture[] = [];
  try {
    tours = await prisma.tour.findMany({
      where: {
        status: "published",
        OR: orFilters
      },
      orderBy: { featured: "desc" },
      take: RECENT_TOURS_LIMIT,
      include: {
        departureDestination: { select: { name: true, slug: true, country: { select: { slug: true } } } }
      }
    });
  } catch (error) {
    console.error("Error cargando tours para location", {
      slug: resolvedParams.slug,
      orFilters,
      error
    });
  }

  let displayTours = tours;
  if (!displayTours.length) {
    try {
      displayTours = await prisma.tour.findMany({
        where: {
          status: "published",
          countryId: location.countryId
        },
        orderBy: { createdAt: "desc" },
        take: RECENT_TOURS_LIMIT,
        include: {
          departureDestination: { select: { name: true, slug: true, country: { select: { slug: true } } } }
        }
      });
    } catch (error) {
      console.error("Fallback tour query failed for location fallback", {
        slug: resolvedParams.slug,
        countryId: location.countryId,
        error
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{t("recogida.hero.eyebrow")}</p>
            <h1 className="text-4xl font-bold text-slate-900">
              {t("recogida.hero.title", { hotel: location.name })}
            </h1>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <span className="text-lg text-green-500">✅</span>
              {t("recogida.hero.confirmed", { hotel: location.name })}
            </p>
            <p className="max-w-3xl text-sm text-slate-600">{t("recogida.hero.body")}</p>
          </div>
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr,1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("recogida.hotel.label")}</p>
              <p className="text-2xl font-semibold text-slate-900">{location.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("recogida.booking.label")}</p>
              <p className="text-sm text-slate-600">
                {t("recogida.booking.codeLabel")}{" "}
                <span className="font-semibold text-slate-900">
                  {bookingCode ?? t("recogida.booking.fallback")}
                </span>
              </p>
              <p className="text-sm text-slate-500">{t("recogida.booking.note")}</p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t("recogida.tours.eyebrow")}</p>
          <h2 className="text-3xl font-semibold text-slate-900">{t("recogida.tours.title")}</h2>
          <p className="text-sm text-slate-600">{t("recogida.tours.body")}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {displayTours.map((tour) => (
            <article key={tour.id} className="group flex flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-44 w-full overflow-hidden bg-slate-200">
                <Image
                  src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                  alt={tour.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">{tour.title}</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {tour.departureDestination?.name ?? tour.location}
                  </p>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3">
                  {tour.shortDescription ?? t("recogida.tours.cardFallback")}
                </p>
                <div className="mt-auto flex items-center justify-between text-sm text-slate-700">
                  <span className="text-slate-900 font-semibold">${tour.price.toFixed(0)} USD</span>
                <Link
                  href={buildTourUrl(tour, location.slug, bookingCode)}
                  className="rounded-2xl bg-orange-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-orange-600"
                >
                  {t("recogida.tours.cardCta", { tour: tour.title, hotel: location.name })}
                </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
