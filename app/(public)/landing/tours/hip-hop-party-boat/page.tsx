import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_LOCALBUSINESS, PROACTIVITIS_URL, SAME_AS_URLS, getPriceValidUntil } from "@/lib/seo";
import CountdownUrgency from "@/components/landing/CountdownUrgency";

const TOUR_SLUG = "sunset-catamaran-snorkel";
const LANDING_SLUG = "hip-hop-party-boat";
const CTA_TEXT = "RESERVA MI FIESTA";
const SEO_TITLE = "Punta Cana's #1 Rated Urban Party Boat & Snorkel Experience";
const SEO_DESCRIPTION =
  "Baila hip hop y reggaetón en el Hip Hop Party Boat mientras navegas el Caribe. Barra libre premium, snorkel y atardeceres de lujo para grupos y despedidas.";
const TAXONOMY = {
  amenities: ["barra libre", "dj en vivo", "snorkel guiado", "tobogÃ¡n", "foam party", "transporte incluido"],
  niches: ["despedida de soltera", "grupos grandes", "spring break", "parejas"],
  locations: ["Playa BÃ¡varo", "Cap Cana", "Piscina Natural", "Bibijagua"]
};

const metadata: Metadata = {
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: [...TAXONOMY.amenities, ...TAXONOMY.niches, ...TAXONOMY.locations],
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    url: `https://proactivitis.com/thingtodo/tours/${LANDING_SLUG}`
  },
  alternates: {
    canonical: `https://proactivitis.com/thingtodo/tours/${LANDING_SLUG}`
  }
};

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as string[]) ?? [];
  } catch {
    return [];
  }
};

const features = [
  {
    title: "The Beats",
    copy: "DJ en vivo con selecciones curadas de hip hop, reggaetÃ³n y soca para una fiesta continua sobre el mar.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M4 16h16M4 12h16M4 8h16" />
      </svg>
    )
  },
  {
    title: "The Drinks",
    copy: "Barra libre con marcas premium, mocktails artesanales y snacks tropicales durante todo el recorrido.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M8 5h8l1.5 3h-11L8 5zM6 8h12l-1 5H7L6 8zm2 8h8M14 22h-4" />
      </svg>
    )
  },
  {
    title: "The Reef",
    copy: "Snorkel guiado en el arrecife de Bibijagua y foam party al atardecer para fotos Ã©picas.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M5 17c3-4 8-4 11 0" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  },
  {
    title: "The Ride",
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
  "¿Incluye transporte desde los hoteles de Playa Bávaro y Cap Cana? Sí, pickups privados incluidos.",
  "¿Qué incluye la barra libre? Ron premium, vodka, cerveza local y mocktails tropicales ilimitados.",
  "¿Hay snorkel guiado? Sí, equipo profesional y guías certificados para explorar el arrecife."
];

const itinerary = [
  "Encuentro en el club náutico con bienvenida y barra libre.",
  "Set en vivo del DJ con coreografías urbanas y beats contagiosos.",
  "Snorkel guiado en Bibijagua seguido de la foam party al atardecer.",
  "Brindis al sunset con tragos premium y música nonstop."
];

export const runtime = "edge";
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
      SupplierProfile: {
        select: {
          stripeAccountId: true,
          company: true
        }
      },
      platformSharePercent: true
    }
  });

  if (!tour) {
    return notFound();
  }

  const gallery = parseGallery(tour.gallery);
  const heroImage = tour.heroImage ?? gallery[0] ?? "/fototours/fotosimple.jpg";
  const timeSlots = JSON.parse(tour.timeOptions ?? "[]") as { hour: number; minute: string; period: "AM" | "PM" }[];
  const priceLabel = `$${tour.price.toFixed(0)} USD`;
  const bookingWidgetProps = {
    tourId: tour.id,
    basePrice: tour.price,
    timeSlots,
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
      availability: "https://schema.org/InStock"
    },
    sameAs: SAME_AS_URLS
  };

  const heroStats = [
    {label:"+1,500 viajeros felices", value:"4,8/5 reseÃ±as"},
    {label:"Horario sunset", value: timeSlots[0]? `${timeSlots[0].hour}:${timeSlots[0].minute} ${timeSlots[0].period}`:"08:00 AM / 01:00 PM"},
    {label:"DuraciÃ³n", value:"4 horas"}
  ];


  return (
    <div className="min-h-screen bg-[#f5f6fb] text-slate-900">
      <StructuredData data={schema} />
      <section className="relative overflow-hidden bg-[#f5f6fb]">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={tour.title ?? SEO_TITLE}
            fill
            className="object-cover filter saturate-110"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-[#f5f6fb]" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 lg:flex-row">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.6em] text-[#00e5ff]">Crucero Urbano</p>
            <h1 className="text-4xl font-black uppercase leading-tight text-slate-900 lg:text-5xl">{SEO_TITLE}</h1>
            <p className="max-w-xl text-lg text-slate-700">
              Baila hip hop y reggaetÃ³n mientras navegas por aguas turquesas, practicas snorkel en Bibijagua y brindas con un atardecer cinematogrÃ¡fico y servicio premium.
            </p>
            <div className="flex flex-wrap gap-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-[16px] border border-slate-200 bg-white/80 px-5 py-4 text-sm shadow-md">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                  <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#booking"
                className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#0d0d0d] shadow-[0_20px_35px_rgba(212,175,55,0.35)] transition hover:bg-[#b58f2e]"
              >
                {CTA_TEXT}
              </a>
              <Link
                href={`/tours/${tour.slug}`}
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-900 transition hover:border-[#00e5ff]"
              >
                Ver tour oficial
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-8 text-xs uppercase tracking-[0.3em] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-1 w-8 bg-[#00e5ff]" />
                Valorado en TripAdvisor
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-8 bg-[#d4af37]" />
                Opiniones en Google 4.8/5
              </div>
            </div>
          </div>
          <div id="booking" className="w-full rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_30px_60px_rgba(15,23,42,0.15)] lg:w-[420px]">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Asegura tu mesa en el party boat</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Hip Hop Party Boat</h3>
            <p className="text-sm text-slate-600">Mesas limitadas para 2026, reserva ya tu tripulaciÃ³n.</p>
            <div className="mt-4">
              <TourBookingWidget {...bookingWidgetProps} />
            </div>
            <CountdownUrgency spots={22} />
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Operado por Proactivitis</span>
              <span>{tour.SupplierProfile?.company ?? "Local Crew"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-16">
        <div className="rounded-[32px] bg-white p-8 shadow-[0_25px_60px_rgba(0,0,0,0.08)]">
          <p className="text-xs uppercase tracking-[0.4em] text-[#00e5ff]">Testimonios reales</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-[16px] border border-slate-100 bg-[#fafbff] p-5 text-sm">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">TripAdvisor</p>
              <p className="text-lg font-black text-slate-900">4.8/5</p>
              <p className="text-xs text-slate-400">+1,500 opiniones</p>
            </div>
            <div className="rounded-[16px] border border-slate-100 bg-[#fafbff] p-5 text-sm">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Google</p>
              <p className="text-lg font-black text-slate-900">4.8/5</p>
              <p className="text-xs text-slate-400">Viajeros verificados</p>
            </div>
            <div className="rounded-[16px] border border-slate-100 bg-[#fafbff] p-5 text-sm">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Disponibilidad</p>
              <p className="text-lg font-black text-[#d4af37]">22 plazas</p>
              <p className="text-xs text-slate-400">Actualizado diariamente</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="space-y-3 rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.1)]"
            >
              <div className="text-[#00e5ff]">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
            <h3 className="text-2xl font-black text-slate-900">Itinerario Express</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {itinerary.map((line) => (
                <li key={line} className="rounded-[12px] border border-slate-100 bg-[#f8f9fb] p-4">
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
            <h3 className="text-2xl font-black text-slate-900">FAQs</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              {faqs.map((faq) => (
                <article key={faq} className="rounded-[12px] border border-slate-100 bg-[#f8f9fb] p-4">
                  <p className="font-semibold text-slate-900">{faq.split("?")[0]}?</p>
                  <p className="text-sm text-slate-600">{faq}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );

}

export { metadata };
