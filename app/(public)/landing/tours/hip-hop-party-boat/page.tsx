import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_LOCALBUSINESS, PROACTIVITIS_URL, SAME_AS_URLS, getPriceValidUntil } from "@/lib/seo";

const TOUR_SLUG = "sunset-catamaran-snorkel";
const LANDING_SLUG = "hip-hop-party-boat";
const CTA_TEXT = "Reserva tu plaza ahora";
const SEO_TITLE = "Hip Hop Party Boat with Snorkeling in Punta Cana";
const SEO_DESCRIPTION =
  "Vive el sunset más vibrante a bordo del Hip Hop Party Boat with Snorkeling en Punta Cana. DJ en vivo, barra libre, snorkel y fiesta en alta mar con transporte incluido.";
const TAXONOMY = {
  intentModifiers: [
    "mejor",
    "oferta",
    "reserva",
    "precio",
    "barato",
    "vip",
    "privado",
    "2026",
    "opiniones",
    "tickets",
    "descuento",
    "last minute",
    "lujo",
    "premium",
    "economico",
    "exclusivo",
    "top",
    "recomendado",
    "oficial",
    "descuento hoy",
    "tarifas",
    "costo",
    "low cost",
    "all inclusive"
  ],
  mainEntities: [
    "party boat",
    "barco de fiesta",
    "catamaran party",
    "booze cruise",
    "excursion en barco",
    "paseo en catamaran",
    "floating bar",
    "snorkel party",
    "charter privado",
    "boat tour",
    "fiesta en el mar",
    "crucero de fiesta",
    "alquiler de catamaran",
    "yate de fiesta",
    "party ship",
    "ocean party"
  ],
  locations: ["Punta Cana", "Bavaro", "Playa Bavaro", "Dominican Republic"],
  niches: ["despedida de soltera", "grupos grandes", "spring break", "parejas", "cumpleaños", "turistas"],
  amenities: ["barra libre", "open bar", "tobogan", "snorkeling", "dj en vivo", "fiesta de la espuma", "transporte incluido"],
  timeVariants: ["sunset cruise", "medio dia", "4 horas", "atardecer"]
};

const SEO_KEYWORDS = [
  SEO_TITLE,
  ...TAXONOMY.intentModifiers,
  ...TAXONOMY.mainEntities,
  ...TAXONOMY.locations,
  ...TAXONOMY.niches
];

const metadata: Metadata = {
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  alternates: {
    canonical: `https://proactivitis.com/thingtodo/tours/${LANDING_SLUG}`
  },
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    url: `https://proactivitis.com/thingtodo/tours/${LANDING_SLUG}`
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

const parseTimeSlots = (value?: string | null) => {
  if (!value) return [];
  try {
    return (JSON.parse(value) as { hour: number; minute: string; period: "AM" | "PM" }[]) ?? [];
  } catch {
    return [];
  }
};

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
          company: true,
          User: { select: { name: true } }
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
  const heroHighlights = [
    "DJ en vivo y sistema de sonido 360°",
    "Snorkel guiado en el arrecife de Bávaro",
    "Barra libre premium y barra de frutas tropicales",
    "Transporte privado desde Playa Bávaro y Cap Cana"
  ];

  const itinerary = [
    "Bienvenida en el club náutico de Punta Cana",
    "Open bar + playa a bordo para tomar el sol",
    "Clase exprés de hip hop con DJ en vivo",
    "Snorkel en aguas cristalinas y fiesta de espuma",
    "Sunset con bebidas premium y playlist exclusiva"
  ];

  const faqs = [
    "¿Incluye transporte desde hoteles del área de Bávaro? Sí, recogemos en todos los principales resorts de Punta Cana y Cap Cana.",
    "¿Qué incluye la barra libre? Gin, ron, vodka, cerveza local y mocktails tropicales durante toda la experiencia.",
    "¿Hay equipo de snorkel a bordo? Contamos con máscaras, snorkels y chalecos certificados para explorar el coral."
  ];

  const timeSlots = parseTimeSlots(tour.timeOptions);
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

  const itineraryList = itinerary.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "ListItem",
      name: item
    }
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: SEO_TITLE,
    description: SEO_DESCRIPTION,
    image: [heroImage.startsWith("http") ? heroImage : `${PROACTIVITIS_URL}${heroImage}`],
    url: `https://proactivitis.com/landing/tours/${LANDING_SLUG}`,
    provider: PROACTIVITIS_LOCALBUSINESS,
    offers: {
      "@type": "Offer",
      price: tour.price,
      priceCurrency: "USD",
      priceValidUntil: getPriceValidUntil(),
      availability: "https://schema.org/InStock"
    },
    itinerary: {
      "@type": "ItemList",
      itemListElement: itineraryList
    },
    sameAs: SAME_AS_URLS
  };

  return (
    <div className="bg-slate-950 text-white">
      <StructuredData data={schema} />
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-600 to-slate-900 px-4 py-14">
        <div className="absolute inset-0 opacity-70">
          <Image src={heroImage} alt={tour.title ?? SEO_TITLE} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-transparent" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-amber-200">Sunset & Snorkel</p>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">{SEO_TITLE}</h1>
            <p className="max-w-xl text-lg text-white/90">
              Combina el ritmo urbano del Hip Hop Party Boat con el snorkel entre arrecifes y la puesta de sol
              más vibrante de Punta Cana. Fiesta premium, barra libre, tobogán, foam party y un sunset de lujo para 2026.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 md:grid-cols-3">
              <span>4 Horas</span>
              <span>{priceLabel}</span>
              <span>{timeSlots.length ? `${timeSlots[0].hour}:${timeSlots[0].minute} ${timeSlots[0].period}` : "Horario fijo"}</span>
            </div>
            <div className="space-y-2">
              {heroHighlights.map((highlight) => (
                <p key={highlight} className="text-sm text-white/90">
                  • {highlight}
                </p>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#booking"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-lg transition hover:scale-[1.02]"
              >
                {CTA_TEXT}
              </a>
              <Link
                href={`/tours/${tour.slug}`}
                className="rounded-full border border-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
              >
                Ver tour original
              </Link>
            </div>
          </div>
          <div className="w-full rounded-[32px] border border-white/30 bg-white/90 p-6 text-slate-900 shadow-2xl backdrop-blur lg:w-[420px]">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reserva ahora</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Hip Hop Party Boat</h3>
            <p className="text-sm text-slate-600">Entradas limitadas por flotilla.</p>
            <div className="mt-4">
              <TourBookingWidget {...bookingWidgetProps} />
            </div>
            <p className="mt-5 text-xs text-slate-600">
              Operado por Proactivitis · {tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Equipo local"}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-16">
        <div className="rounded-[36px] bg-white/95 p-8 shadow-xl">
          <h2 className="text-3xl font-black text-slate-900">¿Qué incluye tu fiesta en el mar?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Diseñada para grupos que buscan lo mejor en música y snorkel: barra premium, DJ en vivo, transporte desde Cap Cana y foam party.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {TAXONOMY.amenities.map((amenity) => (
              <div key={amenity} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                {amenity}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-[36px] bg-white/95 p-8 shadow-lg">
            <h3 className="text-2xl font-black text-slate-900">Estrategia de fiesta</h3>
            <p className="text-sm text-slate-600">Perfecta para {TAXONOMY.niches.slice(0, 3).join(", ")} y eventos empresariales en 2026.</p>
            <ul className="space-y-3 text-sm text-slate-700">
              {TAXONOMY.mainEntities.slice(0, 5).map((entity) => (
                <li key={entity} className="flex items-center gap-3">
                  <span aria-hidden className="text-lg text-rose-500">
                    •
                  </span>
                  {entity}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 rounded-[36px] bg-black/80 p-8 text-white shadow-lg">
            <h3 className="text-2xl font-black">¿Dónde parte?</h3>
            <p className="text-sm text-white/80">
              Embarque privado desde Playa Bávaro, Cap Cana o Punta Cana Resort. Las rutas se ajustan a tus hoteles y tiempos.
            </p>
            <div className="space-y-2 text-sm">
              {TAXONOMY.locations.map((location) => (
                <p key={location} className="text-sm text-white/90">
                  {location}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="expectations" className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="rounded-[36px] bg-white/95 p-8 shadow-xl">
          <h3 className="text-3xl font-black text-slate-900">¿Qué esperar?</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              "Bebidas premium ilimitadas y snacks tropicales",
              "DJ residente que mezcla hip hop, reggaetón y beats caribeños",
              "Snorkel guiado en el arrecife y foam party al atardecer",
              "Zona lounge techada, deck para fotos y hashtags customizados"
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="itinerary" className="mx-auto max-w-6xl px-4 py-16">
        <div className="space-y-6 rounded-[36px] bg-white/95 p-8 shadow-xl">
          <h3 className="text-3xl font-black text-slate-900">Itinerario exprés</h3>
          <div className="space-y-4 text-sm text-slate-700">
            {itinerary.map((step) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {faqs.map((faq) => (
            <article key={faq} className="rounded-[32px] border border-slate-200 bg-white/95 p-6 text-sm text-slate-700 shadow-lg">
              <p className="font-semibold text-slate-900">{faq.split("?")[0]}?</p>
              <p className="mt-2 text-slate-600">{faq}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export { metadata };
