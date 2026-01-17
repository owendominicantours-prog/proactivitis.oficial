import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translationService";
import { Locale } from "@/lib/translations";
import { PROACTIVITIS_URL } from "@/lib/seo";
import SosuaPartyBoatOptions from "@/components/public/SosuaPartyBoatOptions";

const TOUR_SLUG = "party-boat-sosua";
const DEFAULT_TOUR_IMAGE = "/fototours/fotosimple.jpg";

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

const parseJsonArray = <T,>(value?: string | null | unknown): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      return (JSON.parse(value) as T[]) ?? [];
    } catch {
      return [];
    }
  }
  return [];
};

const parseGallery = (gallery?: string | null) => parseJsonArray<string>(gallery);

const resolveTourHeroImage = (tour: { heroImage?: string | null; gallery?: string | null }) => {
  const gallery = parseGallery(tour.gallery);
  return tour.heroImage ?? gallery[0] ?? DEFAULT_TOUR_IMAGE;
};

const normalizePickupTimes = (value?: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => `${entry}`.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[;,]/g)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const toAbsoluteUrl = (value: string) => {
  if (!value) return `${PROACTIVITIS_URL}${DEFAULT_TOUR_IMAGE}`;
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${PROACTIVITIS_URL}${normalized}`;
};

const buildOptionPricingLabel = (option: {
  pricePerPerson?: number | null;
  basePrice?: number | null;
  baseCapacity?: number | null;
  extraPricePerPerson?: number | null;
}) => {
  if (option.basePrice && option.baseCapacity) {
    return `$${option.basePrice.toFixed(2)} USD (1-${option.baseCapacity} pax)`;
  }
  if (option.basePrice) {
    return `$${option.basePrice.toFixed(2)} USD total`;
  }
  if (option.pricePerPerson) {
    return `$${option.pricePerPerson.toFixed(2)} USD / persona`;
  }
  return "Precio variable";
};

const BASE_COPY = {
  eyebrow: "Sosúa Party Boat",
  title: "Sosúa Party Boat: la fiesta náutica más completa de Puerto Plata",
  subtitle:
    "Open bar, snorkel y vibra caribeña con equipo profesional. Elige la opción que más te conviene y reserva en minutos.",
  highlights: [
    "Open bar real con bebidas locales y cócteles fríos.",
    "Parada para snorkel y visita a la zona de delfines.",
    "Staff especializado y coordinación de pick-up desde hoteles."
  ],
  overviewTitle: "¿Qué hace diferente el Party Boat de Sosúa?",
  overviewBody:
    "En Sosúa la clave es la logística. Nosotros coordinamos todo: transporte, horarios, bebidas y servicio. Te subes al catamarán con todo listo y un equipo que se encarga de que solo disfrutes. Esta experiencia combina mar abierto, música, snacks y un ambiente seguro para grupos y celebraciones.",
  experienceTitle: "Experiencia completa en el Caribe norte",
  experienceBody:
    "Navega por la costa de Puerto Plata, disfruta aguas cristalinas y un equipo que se ocupa del ritmo. La excursión tiene horarios claros, regreso garantizado y un itinerario diseñado para aprovechar cada hora en el mar.",
  optionTitle: "Opciones disponibles",
  optionSubtitle: "Tres formas de vivir Sosúa Party Boat. Selecciona la tuya.",
  inclusionsTitle: "Incluye",
  scheduleTitle: "Horarios de recogida",
  bookingTitle: "Reserva hoy",
  bookingSubtitle:
    "Selecciona fecha, número de viajeros y elige la opción ideal. Confirmación rápida y soporte inmediato."
};

type SosuaLandingCopy = typeof BASE_COPY;

const localizeCopy = async (locale: Locale): Promise<SosuaLandingCopy> => {
  if (locale === "es") return BASE_COPY;
  const [eyebrow, title, subtitle, overviewTitle, overviewBody, experienceTitle, experienceBody, optionTitle, optionSubtitle, inclusionsTitle, scheduleTitle, bookingTitle, bookingSubtitle] =
    await Promise.all([
      translateText(BASE_COPY.eyebrow, locale),
      translateText(BASE_COPY.title, locale),
      translateText(BASE_COPY.subtitle, locale),
      translateText(BASE_COPY.overviewTitle, locale),
      translateText(BASE_COPY.overviewBody, locale),
      translateText(BASE_COPY.experienceTitle, locale),
      translateText(BASE_COPY.experienceBody, locale),
      translateText(BASE_COPY.optionTitle, locale),
      translateText(BASE_COPY.optionSubtitle, locale),
      translateText(BASE_COPY.inclusionsTitle, locale),
      translateText(BASE_COPY.scheduleTitle, locale),
      translateText(BASE_COPY.bookingTitle, locale),
      translateText(BASE_COPY.bookingSubtitle, locale)
    ]);
  const highlights = await Promise.all(BASE_COPY.highlights.map((item) => translateText(item, locale)));
  return {
    eyebrow,
    title,
    subtitle,
    highlights,
    overviewTitle,
    overviewBody,
    experienceTitle,
    experienceBody,
    optionTitle,
    optionSubtitle,
    inclusionsTitle,
    scheduleTitle,
    bookingTitle,
    bookingSubtitle
  };
};

const getOptionDetails = (optionName: string) => {
  const normalized = optionName.toLowerCase();
  if (normalized.includes("vip")) {
    return ["Brunch premium incluido", "Open bar ilimitado", "Atención personalizada"];
  }
  if (normalized.includes("private")) {
    return ["Catamarán privado", "Snack + bebidas incluidas", "Ideal para grupos y eventos"];
  }
  return ["Catamarán compartido", "Barra libre incluida", "Ambiente social y animación"];
};

export async function buildSosuaPartyBoatMetadata(locale: Locale): Promise<Metadata> {
  const [copy, tour] = await Promise.all([
    localizeCopy(locale),
    prisma.tour.findFirst({
      where: { slug: TOUR_SLUG },
      select: { heroImage: true, gallery: true }
    })
  ]);
  const heroImage = toAbsoluteUrl(resolveTourHeroImage(tour ?? {}));
  const canonicalPath = "/sosua/party-boat";
  const canonicalUrl =
    locale === "es"
      ? `${PROACTIVITIS_URL}${canonicalPath}`
      : `${PROACTIVITIS_URL}/${locale}${canonicalPath}`;

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

export default async function SosuaPartyBoatLanding({ locale }: { locale: Locale }) {
  const [copy, tour] = await Promise.all([
    localizeCopy(locale),
    prisma.tour.findFirst({
      where: { slug: TOUR_SLUG },
      include: {
        SupplierProfile: { select: { stripeAccountId: true } },
        translations: {
          where: { locale },
          select: {
            title: true,
            shortDescription: true,
            description: true,
            includesList: true
          }
        },
        options: { orderBy: { createdAt: "asc" } }
      }
    })
  ]);

  if (!tour) {
    notFound();
  }

  const translation = tour.translations?.[0];
  const localizedTitle = translation?.title ?? tour.title;
  const localizedShortDescription =
    translation?.shortDescription ?? tour.shortDescription ?? tour.subtitle ?? "";

  const heroImage = resolveTourHeroImage(tour);
  const gallery = parseGallery(tour.gallery);
  const optionImages = [
    gallery[1] ?? gallery[0] ?? heroImage,
    gallery[2] ?? gallery[1] ?? heroImage,
    gallery[3] ?? gallery[2] ?? heroImage
  ];

  const includesFromTour = parseJsonArray<string>(translation?.includesList ?? tour.includesList);
  const includesFallback = tour.includes
    ? tour.includes.split(/[;\n]/g).map((item) => item.trim()).filter(Boolean)
    : [];
  const includes = includesFromTour.length ? includesFromTour : includesFallback;
  const localizedIncludes =
    locale === "es" ? includes : await Promise.all(includes.map((item) => translateText(item, locale)));

  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const pickupTimes = normalizePickupTimes(tour.options?.[0]?.pickupTimes);

  const optionCards = await Promise.all(
    tour.options.map(async (option, index) => {
      const name = locale === "es" ? option.name : await translateText(option.name, locale);
      const description = option.description
        ? locale === "es"
          ? option.description
          : await translateText(option.description, locale)
        : null;
      const detailsBase = getOptionDetails(option.name);
      const details =
        locale === "es"
          ? detailsBase
          : await Promise.all(detailsBase.map((item) => translateText(item, locale)));
      return {
        id: option.id,
        name,
        description,
        priceLabel: buildOptionPricingLabel(option),
        details,
        pickupTimes: normalizePickupTimes(option.pickupTimes),
        image: optionImages[index] ?? heroImage,
        ctaLabel: locale === "es" ? "Seleccionar" : await translateText("Seleccionar", locale)
      };
    })
  );

  const bookingProps = {
    tourId: tour.id,
    basePrice: tour.price,
    timeSlots,
    options: tour.options.map((option) => ({
      ...option,
      pickupTimes: normalizePickupTimes(option.pickupTimes)
    })),
    supplierHasStripeAccount: Boolean(tour.SupplierProfile?.stripeAccountId),
    platformSharePercent: tour.platformSharePercent,
    tourTitle: localizedTitle,
    tourImage: heroImage
  };

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt={localizedTitle} className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto grid max-w-[1240px] gap-10 px-4 py-16 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.6em] text-emerald-300">{copy.eyebrow}</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{localizedTitle}</h1>
            <p className="text-lg text-slate-200">{copy.subtitle}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {copy.highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-white/20 bg-white/5 p-3 text-sm text-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-sm text-slate-200 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">{copy.bookingTitle}</p>
            <p className="mt-3 text-base text-slate-100">{copy.bookingSubtitle}</p>
            {localizedShortDescription && (
              <p className="mt-4 text-sm text-slate-300">{localizedShortDescription}</p>
            )}
            <div className="mt-4 space-y-2 text-xs uppercase tracking-[0.3em] text-slate-300">
              {pickupTimes.length ? (
                <span>{pickupTimes.join(" · ")}</span>
              ) : (
                <span>Pick-up confirmado tras la reserva</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{copy.overviewTitle}</p>
            <p className="text-sm leading-relaxed text-slate-700">{copy.overviewBody}</p>
          </div>
          <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{copy.experienceTitle}</p>
            <p className="text-sm leading-relaxed text-slate-700">{copy.experienceBody}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{copy.inclusionsTitle}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {localizedIncludes.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-10">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{copy.scheduleTitle}</p>
          <p className="mt-3 text-sm text-slate-700">
            {pickupTimes.length ? pickupTimes.join(" · ") : "Pick-up confirmado tras la reserva"}
          </p>
        </div>
      </section>

      <SosuaPartyBoatOptions
        options={optionCards}
        bookingProps={bookingProps}
        sectionTitle={copy.optionTitle}
        sectionSubtitle={copy.optionSubtitle}
      />
    </div>
  );
}
