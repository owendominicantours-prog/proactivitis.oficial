import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_LOCALBUSINESS, PROACTIVITIS_URL, SAME_AS_URLS, getPriceValidUntil } from "@/lib/seo";
import CountdownUrgency from "@/components/landing/CountdownUrgency";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import TourGalleryCollage from "@/components/tours/TourGalleryCollage";
import GalleryLightbox from "@/components/shared/GalleryLightbox";

const TOUR_SLUG = "sunset-catamaran-snorkel";
const LANDING_SLUG = "hip-hop-party-boat";
const CTA_TEXT = "RESERVA MI FIESTA";
// El contenido de esta landing esta en espanol para preservar la estrategia SEO multilingue sin duplicacion.
const SEO_TITLE = "Hip Hop Party Boat con Snorkel en Punta Cana";
const SEO_DESCRIPTION =
  "Baila hip hop y reggaeton en el Hip Hop Party Boat mientras navegas el Caribe. Barra libre premium, snorkel y atardeceres de lujo para grupos y despedidas.";
const TAXONOMY = {
  amenities: ["barra libre", "dj en vivo", "snorkel guiado", "tobogan", "foam party", "transporte incluido"],
  niches: ["despedida de soltera", "grupos grandes", "spring break", "parejas"],
  locations: ["Playa Bavaro", "Cap Cana", "Piscina Natural", "Bibijagua"]
};

const BASE_URL = "https://proactivitis.com";

const buildKeywords = () => [
  SEO_TITLE,
  "tours en Punta Cana",
  "excursiones Punta Cana",
  ...TAXONOMY.amenities,
  ...TAXONOMY.niches,
  ...TAXONOMY.locations,
  "Proactivitis"
];

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as string[]) ?? [];
  } catch {
    return [];
  }
};

const resolveTourImage = (heroImage?: string | null, gallery?: string | null) => {
  if (heroImage) return heroImage;
  const parsed = parseGallery(gallery);
  return parsed[0] ?? null;
};

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${BASE_URL}${normalized}`;
};

const normalizePickupTimes = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const times = value.filter((item): item is string => typeof item === "string");
  return times.length ? times : null;
};

export async function generateMetadata(): Promise<Metadata> {
  const canonical = `${BASE_URL}/thingtodo/tours/${LANDING_SLUG}`;
  const tour = await prisma.tour.findUnique({
    where: { slug: TOUR_SLUG },
    select: { heroImage: true, gallery: true }
  });
  const imageUrl = toAbsoluteUrl(resolveTourImage(tour?.heroImage ?? null, tour?.gallery ?? null));
  const seoTitle = `${SEO_TITLE} | Proactivitis`;
  const seoDescription = SEO_DESCRIPTION.endsWith(".") ? SEO_DESCRIPTION : `${SEO_DESCRIPTION}.`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: buildKeywords(),
    alternates: {
      canonical,
      languages: {
        es: canonical,
        en: `https://proactivitis.com/en/thingtodo/tours/${LANDING_SLUG}`,
        fr: `https://proactivitis.com/fr/thingtodo/tours/${LANDING_SLUG}`,
        "x-default": canonical
      }
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      locale: "es_DO",
      images: imageUrl ? [{ url: imageUrl }] : undefined
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: seoTitle,
      description: seoDescription,
      images: imageUrl ? [imageUrl] : undefined
    }
  };
}

const features = [
  {
    title: "El Beat",
    copy: "DJ en vivo con selecciones curadas de hip hop, reggaeton y soca para una fiesta continua sobre el mar.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M4 16h16M4 12h16M4 8h16" />
      </svg>
    )
  },
  {
    title: "La Barra",
    copy: "Barra libre con marcas premium, mocktails artesanales y snacks tropicales durante todo el recorrido.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M8 5h8l1.5 3h-11L8 5zM6 8h12l-1 5H7L6 8zm2 8h8M14 22h-4" />
      </svg>
    )
  },
  {
    title: "El Arrecife",
    copy: "Snorkel guiado en el arrecife de Bibijagua y foam party al atardecer para fotos epicas.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M5 17c3-4 8-4 11 0" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  },
  {
    title: "El Ride",
    copy: "Traslados privados desde hoteles de Punta Cana y Cap Cana; olvida las filas de taxis.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M3 15h18" />
        <path d="M5 9h14l1 6H4l1-6z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    )
  }
];

const faqs = [
  "Incluye transporte desde los hoteles de Playa Bavaro y Cap Cana? Si, pickups privados incluidos.",
  "Que incluye la barra libre? Ron premium, vodka, cerveza local y mocktails tropicales ilimitados.",
  "Hay snorkel guiado? Si, equipo profesional y guias certificados para explorar el arrecife."
];

const itinerary = [
  "Encuentro en el club nautico con bienvenida y barra libre.",
  "Set en vivo del DJ con coreografias urbanas y beats contagiosos.",
  "Snorkel guiado en Bibijagua seguido de la foam party al atardecer.",
  "Brindis al sunset con tragos premium y musica nonstop."
];

export const runtime = "nodejs";
export const revalidate = 0;

export default async function HipHopLandingPage() {
  const tour = await prisma.tour.findUnique({
    where: { slug: TOUR_SLUG },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      heroImage: true,
      gallery: true,
      timeOptions: true,
      options: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          pricePerPerson: true,
          basePrice: true,
          baseCapacity: true,
          extraPricePerPerson: true,
          pickupTimes: true,
          isDefault: true,
          active: true
        }
      },
      SupplierProfile: {
        select: {
          stripeAccountId: true,
          company: true
        }
      },
      platformSharePercent: true,
      location: true
    }
  });

  if (!tour) {
    return notFound();
  }

  const gallery = parseGallery(tour.gallery);
  const heroImage = tour.heroImage ?? gallery[0] ?? "/fototours/fotosimple.jpg";
  const timeSlots = JSON.parse(tour.timeOptions ?? "[]") as { hour: number; minute: string; period: "AM" | "PM" }[];
  const priceLabel = `$${tour.price.toFixed(0)} USD`;
  const normalizedOptions = tour.options?.map((option) => ({
    ...option,
    pickupTimes: normalizePickupTimes(option.pickupTimes)
  }));
  const bookingWidgetProps = {
    tourId: tour.id,
    basePrice: tour.price,
    timeSlots,
    options: normalizedOptions ?? [],
    supplierHasStripeAccount: Boolean(tour.SupplierProfile?.stripeAccountId),
    platformSharePercent: tour.platformSharePercent ?? 20,
    tourTitle: tour.title ?? SEO_TITLE,
    tourImage: heroImage,
    bookingCode: undefined,
    hotelSlug: undefined
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: SEO_TITLE,
    description: SEO_DESCRIPTION,
    image: [heroImage.startsWith("http") ? heroImage : `${PROACTIVITIS_URL}${heroImage}`],
    url: `https://proactivitis.com/thingtodo/tours/${LANDING_SLUG}`,
    provider: PROACTIVITIS_LOCALBUSINESS,
    offers: {
      "@type": "Offer",
      price: tour.price,
      priceCurrency: "USD",
      priceValidUntil: getPriceValidUntil(),
      availability: "https://schema.org/InStock",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        doesNotShip: true,
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "DO"
        }
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        applicableCountry: "DO"
      }
    },
    sameAs: SAME_AS_URLS
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-950 pb-24 overflow-x-hidden">
      <LandingViewTracker landingSlug={LANDING_SLUG} />
      <StructuredData data={schema} />

      <section className="mx-auto max-w-[1240px] px-4 pt-8 sm:pt-10">
        <div className="grid gap-4 overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.06)] lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-16">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
              <svg
                aria-hidden
                className="h-3 w-3 text-indigo-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 12.5 7 12.5s7-7.25 7-12.5c0-3.866-3.134-7-7-7zm0 4a3 3 0 100-6 3 3 0 000 6z"
                />
                <circle cx="12" cy="8.4" r="2.4" />
              </svg>
              <span>{tour.location ?? "Punta Cana"}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">{SEO_TITLE}</h1>
            <p className="max-w-xl text-base text-slate-600 sm:text-lg">
              Baila hip hop y reggaeton mientras navegas por aguas turquesas, haces snorkel en Bibijagua y brindas con un
              atardecer cinematografico y servicio premium.
            </p>
            <div className="flex items-end gap-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Precio desde</p>
                <p className="text-4xl font-black text-indigo-600">{priceLabel}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rating</p>
                <div className="flex items-center gap-2">
                  <span aria-hidden className="text-2xl text-indigo-600">★</span>
                  <p className="text-xl font-black">4.8/5</p>
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">+1,500 reviews</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
              {["Guia bilingue", "Open bar", "Snorkel guiado", "Transporte incluido"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#booking"
                className="rounded-3xl bg-indigo-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-indigo-100 transition-transform hover:scale-105 active:scale-95"
              >
                {CTA_TEXT}
              </Link>
              <GalleryLightbox
                images={gallery}
                buttonLabel="Ver galeria"
                buttonClassName="rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
              />
            </div>
          </div>
          <TourGalleryCollage images={gallery} title={tour.title ?? SEO_TITLE} fallbackImage={heroImage} />
        </div>
      </section>

      <section id="booking" className="mx-auto mt-6 max-w-[1240px] px-4 lg:hidden">
        <div className="md:hidden mb-3">
          <p className="text-sm font-semibold text-gray-900">Reserva tu lugar</p>
          <p className="text-xs text-gray-600">Mesas limitadas para 2026, reserva ya tu tripulacion.</p>
        </div>
        <div className="md:hidden ring-1 ring-black/10 shadow-md rounded-[28px] border border-slate-100 bg-white p-6">
          <TourBookingWidget {...bookingWidgetProps} />
          <CountdownUrgency spots={22} />
        </div>
      </section>

      <main className="mx-auto mt-10 grid max-w-[1240px] gap-10 px-4 lg:grid-cols-[1fr,420px]">
        <div className="space-y-10">
          <section id="overview" className="space-y-4">
            <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
              <h2 className="text-xs uppercase tracking-[0.4em] text-slate-500">Overview</h2>
              <p className="text-lg text-slate-800">
                Hip Hop Party Boat es la mejor forma de vivir Punta Cana: musica en vivo, barra libre premium, snorkel y
                sunset party con fotos epicas.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature) => (
                  <article
                    key={feature.title}
                    className="space-y-3 rounded-[16px] border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="text-indigo-600">{feature.icon}</div>
                    <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="itinerary" className="space-y-4">
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
              <h2 className="text-xs uppercase tracking-[0.4em] text-slate-500">Itinerario express</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {itinerary.map((line) => (
                  <li key={line} className="rounded-[12px] border border-slate-100 bg-[#f8f9fb] p-4">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="faq" className="space-y-4">
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
              <h2 className="text-xs uppercase tracking-[0.4em] text-slate-500">FAQs</h2>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                {faqs.map((faq) => (
                  <article key={faq} className="rounded-[12px] border border-slate-100 bg-[#f8f9fb] p-4">
                    <p className="font-semibold text-slate-900">{faq.split("?")[0]}?</p>
                    <p className="text-sm text-slate-600">{faq}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-10 space-y-6 rounded-[28px] border border-slate-100 bg-white p-6 shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reserva tu lugar</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Hip Hop Party Boat</h3>
            <p className="text-sm text-slate-600">Mesas limitadas para 2026, reserva ya tu tripulacion.</p>
            <div className="mt-4">
              <TourBookingWidget {...bookingWidgetProps} />
            </div>
            <CountdownUrgency spots={22} />
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Operado por Proactivitis</span>
              <span>{tour.SupplierProfile?.company ?? "Local Crew"}</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
