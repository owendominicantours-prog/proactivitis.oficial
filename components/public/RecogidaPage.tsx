import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import { Locale, translate } from "@/lib/translations";
import StructuredData from "@/components/schema/StructuredData";
import { ensureLeadingCapital } from "@/lib/text-format";

const RECENT_TOURS_LIMIT = 6;
const BASE_URL = "https://proactivitis.com";

type SearchParams = {
  bookingCode?: string;
};

type RecogidaPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<SearchParams>;
};

type PickupTarget = {
  slug: string;
  name: string;
  countryId: string;
  destinationId?: string | null;
  microZoneId?: string | null;
};

type TourWithDeparture = Prisma.TourGetPayload<{
  include: {
    departureDestination: { select: { name: true; slug: true; country: { select: { slug: true } } } };
  };
}>;

type TransferCard = {
  title: string;
  body: string;
  cta: string;
  href: string;
};

type TransferSectionCopy = {
  eyebrow: string;
  title: string;
  body: string;
  cards: [TransferCard, TransferCard, TransferCard];
};

const transferCopyByLocale: Record<Locale, TransferSectionCopy> = {
  es: {
    eyebrow: "Traslados recomendados",
    title: "Coordina tu transporte desde {hotel}",
    body: "Reserva traslado privado, premium o combinaciones con tours desde un solo panel. Confirmacion rapida y soporte 24/7.",
    cards: [
      {
        title: "Traslado privado aeropuerto -> hotel",
        body: "Servicio directo, chofer verificado y tarifa clara para llegar sin demoras.",
        cta: "Ver traslados privados",
        href: "/traslado"
      },
      {
        title: "Premium transfer VIP",
        body: "Cadillac Escalade y Suburban para una llegada ejecutiva con seguimiento de vuelo.",
        cta: "Ver servicio premium",
        href: "/punta-cana/premium-transfer-services"
      },
      {
        title: "Excursiones con recogida en tu hotel",
        body: "Combina tours con pickup confirmado en lobby para optimizar tiempo y presupuesto.",
        cta: "Ver landing de recogida",
        href: "/excursiones-con-recogida"
      }
    ]
  },
  en: {
    eyebrow: "Recommended transfers",
    title: "Arrange transportation from {hotel}",
    body: "Book private transfer, VIP options, or transfer + tour bundles from one place with fast confirmation.",
    cards: [
      {
        title: "Private airport to hotel transfer",
        body: "Direct service, vetted driver, and clear pricing for a smooth arrival.",
        cta: "View private transfers",
        href: "/traslado"
      },
      {
        title: "Premium VIP transfer",
        body: "Cadillac Escalade and Suburban service with flight tracking and executive comfort.",
        cta: "View premium service",
        href: "/punta-cana/premium-transfer-services"
      },
      {
        title: "Hotel pickup excursions",
        body: "Bundle tours with lobby pickup to save time and keep logistics simple.",
        cta: "View hotel pickup page",
        href: "/excursions-with-hotel-pickup"
      }
    ]
  },
  fr: {
    eyebrow: "Transferts recommandes",
    title: "Organisez vos transferts depuis {hotel}",
    body: "Reservez transfert prive, service VIP ou packs transfert + excursions avec confirmation rapide.",
    cards: [
      {
        title: "Transfert prive aeroport -> hotel",
        body: "Service direct, chauffeur verifie et tarif clair pour arriver sans stress.",
        cta: "Voir les transferts prives",
        href: "/traslado"
      },
      {
        title: "Transfert premium VIP",
        body: "Cadillac Escalade et Suburban avec suivi de vol et confort haut de gamme.",
        cta: "Voir le service premium",
        href: "/punta-cana/premium-transfer-services"
      },
      {
        title: "Excursions avec pickup hotel",
        body: "Combinez vos excursions avec pickup au lobby pour une logistique simple.",
        cta: "Voir la page pickup hotel",
        href: "/excursions-avec-pickup-hotel"
      }
    ]
  }
};

const buildCanonical = (slug: string, locale: Locale) =>
  locale === "es" ? `${BASE_URL}/recogida/${slug}` : `${BASE_URL}/${locale}/recogida/${slug}`;

const pickupBasePathByLocale: Record<Locale, string> = {
  es: "/excursiones-con-recogida",
  en: "/excursions-with-hotel-pickup",
  fr: "/excursions-avec-pickup-hotel"
};

const buildPickupCanonical = (slug: string, locale: Locale) =>
  `${BASE_URL}${pickupBasePathByLocale[locale]}/${slug}`;

export async function buildRecogidaMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const pickupTarget = await resolvePickupTarget(slug);
  if (!pickupTarget) {
    return {
      title: ensureLeadingCapital(translate(locale, "recogida.meta.fallbackTitle")),
      description: translate(locale, "recogida.meta.fallbackDescription")
    };
  }

  return {
    title: ensureLeadingCapital(translate(locale, "recogida.meta.title", { hotel: pickupTarget.name })),
    description: translate(locale, "recogida.meta.description", { hotel: pickupTarget.name }),
    alternates: {
      canonical: buildCanonical(pickupTarget.slug, locale),
      languages: {
        es: `/recogida/${pickupTarget.slug}`,
        en: `/en/recogida/${pickupTarget.slug}`,
        fr: `/fr/recogida/${pickupTarget.slug}`,
        "x-default": `/recogida/${pickupTarget.slug}`
      }
    }
  };
}

export async function buildRecogidaPickupMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const pickupTarget = await resolvePickupTarget(slug);
  if (!pickupTarget) {
    return {
      title: ensureLeadingCapital(translate(locale, "recogida.pickup.meta.fallbackTitle")),
      description: translate(locale, "recogida.pickup.meta.fallbackDescription")
    };
  }

  return {
    title: ensureLeadingCapital(translate(locale, "recogida.pickup.meta.title", { hotel: pickupTarget.name })),
    description: translate(locale, "recogida.pickup.meta.description", { hotel: pickupTarget.name }),
    alternates: {
      canonical: buildPickupCanonical(pickupTarget.slug, locale),
      languages: {
        es: `${pickupBasePathByLocale.es}/${pickupTarget.slug}`,
        en: `${pickupBasePathByLocale.en}/${pickupTarget.slug}`,
        fr: `${pickupBasePathByLocale.fr}/${pickupTarget.slug}`,
        "x-default": `${pickupBasePathByLocale.es}/${pickupTarget.slug}`
      }
    }
  };
}


const buildTourUrl = (
  tour: { slug: string },
  locationSlug: string,
  locale: Locale,
  bookingCode?: string
) => {
  const params = new URLSearchParams({
    hotelSlug: locationSlug
  });
  if (bookingCode) {
    params.set("bookingCode", bookingCode);
  }
  const basePath =
    locale === "es"
      ? `/tours/${tour.slug}/recogida/${locationSlug}`
      : `/${locale}/tours/${tour.slug}/recogida/${locationSlug}`;
  return `${basePath}?${params.toString()}`;
};

const resolvePickupTarget = async (slug: string): Promise<PickupTarget | null> => {
  const location = await prisma.location.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      countryId: true,
      destinationId: true,
      microZoneId: true
    }
  });

  if (location) {
    return location;
  }

  const transferLocation = await prisma.transferLocation.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      countryCode: true
    }
  });

  if (!transferLocation) return null;

  const mappedLocation = await prisma.location.findFirst({
    where: {
      OR: [{ slug: transferLocation.slug }, { name: transferLocation.name }]
    },
    select: {
      destinationId: true,
      microZoneId: true
    }
  });

  return {
    slug: transferLocation.slug,
    name: transferLocation.name,
    countryId: transferLocation.countryCode,
    destinationId: mappedLocation?.destinationId ?? null,
    microZoneId: mappedLocation?.microZoneId ?? null
  };
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
  const transferCopy = transferCopyByLocale[locale];
  const localPath = (path: string) => (locale === "es" ? path : `/${locale}${path}`);

  let pickupTarget: PickupTarget | null = null;
  try {
    pickupTarget = await resolvePickupTarget(resolvedParams.slug);
  } catch (error) {
    console.error("Error cargando pickup target para slug", { slug: resolvedParams.slug, error });
    throw error;
  }

  if (!pickupTarget) {
    console.error("Pickup target no encontrado", { slug: resolvedParams.slug });
    notFound();
  }

  const baseCountryCondition = { countryId: pickupTarget.countryId };
  const orFilters = [];
  if (pickupTarget.microZoneId) {
    orFilters.push({ ...baseCountryCondition, microZoneId: pickupTarget.microZoneId });
  }
  if (pickupTarget.destinationId) {
    orFilters.push({ ...baseCountryCondition, destinationId: pickupTarget.destinationId });
  }
  orFilters.push(baseCountryCondition);
  orFilters.push({
    ...baseCountryCondition,
    category: { contains: "Nacional", mode: "insensitive" }
  });
  if (pickupTarget.destinationId) {
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
          countryId: pickupTarget.countryId
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
        countryId: pickupTarget.countryId,
        error
      });
    }
  }

  const canonicalUrl = buildCanonical(pickupTarget.slug, locale);
  const localizedHome = locale === "es" ? "/" : `/${locale}`;
  const localizedRecogidaBase = locale === "es" ? "/excursiones-con-recogida" : pickupBasePathByLocale[locale];

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("recogida.meta.title", { hotel: pickupTarget.name }),
    description: t("recogida.meta.description", { hotel: pickupTarget.name }),
    url: canonicalUrl
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Proactivitis", item: `${BASE_URL}${localizedHome}` },
      { "@type": "ListItem", position: 2, name: t("recogida.hero.eyebrow"), item: `${BASE_URL}${localizedRecogidaBase}` },
      { "@type": "ListItem", position: 3, name: pickupTarget.name, item: canonicalUrl }
    ]
  };

  const toursItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("recogida.tours.title"),
    itemListElement: displayTours.slice(0, 6).map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${BASE_URL}${buildTourUrl(tour, pickupTarget.slug, locale, bookingCode)}`,
      item: {
        "@type": "TouristTrip",
        name: tour.title,
        description: tour.shortDescription ?? t("recogida.tours.cardFallback")
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <StructuredData data={webPageSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={toursItemListSchema} />
      <section className="bg-gradient-to-br from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{t("recogida.hero.eyebrow")}</p>
            <h1 className="text-4xl font-bold text-slate-900">
              {t("recogida.hero.title", { hotel: pickupTarget.name })}
            </h1>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <span className="text-lg text-green-500">{"\u2713"}</span>
              {t("recogida.hero.confirmed", { hotel: pickupTarget.name })}
            </p>
            <p className="max-w-3xl text-sm text-slate-600">{t("recogida.hero.body")}</p>
          </div>
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr,1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("recogida.hotel.label")}</p>
              <p className="text-2xl font-semibold text-slate-900">{pickupTarget.name}</p>
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
        <section className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-orange-300">{transferCopy.eyebrow}</p>
            <h2 className="text-2xl font-semibold text-white">
              {transferCopy.title.replace("{hotel}", pickupTarget.name)}
            </h2>
            <p className="max-w-3xl text-sm text-slate-200">{transferCopy.body}</p>
          </div>
          <div className="relative mt-5 grid gap-4 md:grid-cols-3">
            {transferCopy.cards.map((card) => (
              <article
                key={card.title}
                className="group flex h-full flex-col rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300/60 hover:bg-white/15"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm text-white">
                  VIP
                </div>
                <h3 className="text-base font-semibold text-white">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-200">{card.body}</p>
                <Link
                  href={localPath(card.href)}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-300"
                >
                  {card.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t("recogida.tours.eyebrow")}</p>
          <h2 className="text-3xl font-semibold text-slate-900">{t("recogida.tours.title")}</h2>
          <p className="text-sm text-slate-600">{t("recogida.tours.body")}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {displayTours.map((tour) => (
            <article key={tour.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="relative h-44 bg-slate-200">
                <Image
                  src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                  alt={tour.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="space-y-3 p-4">
                <div className="space-y-1">
                  <h3 className="line-clamp-2 text-base font-bold text-slate-900">{tour.title}</h3>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    {tour.departureDestination?.name ?? tour.location}
                  </p>
                </div>
                <p className="line-clamp-3 text-sm text-slate-600">
                  {tour.shortDescription ?? t("recogida.tours.cardFallback")}
                </p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm font-semibold text-emerald-700">${tour.price.toFixed(0)} USD</span>
                <Link
                  href={buildTourUrl(tour, pickupTarget.slug, locale, bookingCode)}
                  className="inline-flex rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 transition hover:bg-emerald-50"
                >
                  {t("recogida.tours.cardCta", { tour: tour.title, hotel: pickupTarget.name })}
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

