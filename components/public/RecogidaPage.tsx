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

export async function buildRecogidaPickupMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const location = await prisma.location.findUnique({ where: { slug } });
  if (!location) {
    return {
      title: translate(locale, "recogida.pickup.meta.fallbackTitle"),
      description: translate(locale, "recogida.pickup.meta.fallbackDescription")
    };
  }

  return {
    title: translate(locale, "recogida.pickup.meta.title", { hotel: location.name }),
    description: translate(locale, "recogida.pickup.meta.description", { hotel: location.name }),
    alternates: {
      canonical: buildPickupCanonical(location.slug, locale),
      languages: {
        es: `${pickupBasePathByLocale.es}/${location.slug}`,
        en: `${pickupBasePathByLocale.en}/${location.slug}`,
        fr: `${pickupBasePathByLocale.fr}/${location.slug}`
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
  const transferCopy = transferCopyByLocale[locale];
  const localPath = (path: string) => (locale === "es" ? path : `/${locale}${path}`);

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
              <span className="text-lg text-green-500">{"\u2713"}</span>
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
        <section className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-orange-300">{transferCopy.eyebrow}</p>
            <h2 className="text-2xl font-semibold text-white">
              {transferCopy.title.replace("{hotel}", location.name)}
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
        <div className="grid gap-6 md:grid-cols-2">
          {displayTours.map((tour) => (
            <article key={tour.id} className="group flex flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">
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
                  className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-rose-600"
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

