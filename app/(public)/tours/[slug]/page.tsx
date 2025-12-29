import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import { prisma } from "@/lib/prisma";
import { formatReviewCountValue, getTourReviewCount } from "@/lib/reviewCounts";
import { parseAdminItinerary, parseItinerary, ItineraryStop } from "@/lib/itinerary";
import ReserveFloatingButton from "@/components/shared/ReserveFloatingButton";
import StructuredData from "@/components/schema/StructuredData";
import { PROACTIVITIS_LOCALBUSINESS, PROACTIVITIS_URL, SAME_AS_URLS, getPriceValidUntil } from "@/lib/seo";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import type { Prisma } from "@prisma/client";
import GalleryLightbox from "@/components/shared/GalleryLightbox";
import TourGalleryCollage from "@/components/tours/TourGalleryCollage";

type TourDetailSearchParams = {
  hotelSlug?: string;
  bookingCode?: string;
};

type TourDetailProps = {
  params: Promise<{
    slug?: string;
  }>;
  searchParams?: Promise<TourDetailSearchParams>;
};

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

const parseJsonArray = <T,>(value?: string | null | Prisma.JsonValue): T[] => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== undefined) as T[];
  }
  if (!value) return [];
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T[];
    } catch {
      return [];
    }
  }
  return [];
};

const parseDuration = (value?: string | null) => {
  if (!value) return { value: "4", unit: "Horas" };
  try {
    return JSON.parse(value) as { value: string; unit: string };
  } catch {
    return { value: value ?? "4", unit: "Horas" };
  }
};

const formatTimeSlot = (slot: PersistedTimeSlot) => {
  const minute = slot.minute.padStart(2, "0");
  return `${slot.hour.toString().padStart(2, "0")}:${minute} ${slot.period}`;
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug?: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug) {
    return {
      title: "Tours Proactivitis",
      description: "Explora tours premium y traslados confiables operados por Proactivitis."
    };
  }

  if (slug === HIDDEN_TRANSFER_SLUG) {
    return { title: "Tour no disponible" };
  }

  const tour = await prisma.tour.findFirst({
    where: { slug },
    select: {
      title: true,
      slug: true,
      shortDescription: true,
      heroImage: true,
      gallery: true
    }
  });

  if (!tour) {
    return {
      title: "Tours Proactivitis",
      description: "Explora tours premium y traslados confiables operados por Proactivitis."
    };
  }

  const title = `${tour.title} | Proactivitis`;
  const description =
    tour.shortDescription ?? "Explora esta experiencia guiada por expertos locales y reserva con Proactivitis.";
  const heroImage = toAbsoluteUrl(resolveTourHeroImage(tour));
  const tourUrl = `${PROACTIVITIS_URL}/tours/${tour.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: tourUrl,
      images: [
        {
          url: heroImage,
          alt: title
        }
      ],
      siteName: "Proactivitis",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImage]
    }
  };
}

const itineraryMock: ItineraryStop[] = [
  {
    time: "09:00",
    title: "Pick-up",
    description: "Recogida en el lobby de tu hotel para arrancar con energía."
  },
  {
    time: "Ruta Safari",
    title: "Ruta Safari",
    description: "Recorrido por senderos de selva con paradas para fotos."
  },
  {
    time: "Cultura Local",
    title: "Cultura Local",
    description: "Degustación de café, cacao y tabaco en casa típica."
  },
  {
    time: "Cenote / Playa",
    title: "Cenote / Playa",
    description: "Parada para nadar y refrescarse en un entorno natural."
  },
  {
    time: "Regreso",
    title: "Regreso",
    description: "Traslado de vuelta al punto de origen."
  }
];

const reviewBreakdown = [
  { label: "5 estrellas", percent: 90 },
  { label: "4 estrellas", percent: 8 },
  { label: "3 estrellas", percent: 1 },
  { label: "2 estrellas", percent: 1 },
  { label: "1 estrella", percent: 0 }
];

const reviewHighlights = [
  {
    name: "Gabriela R.",
    date: "Mayo 2025 · Verified traveler",
    quote: "Guía excepcional, recorridos emocionantes y traslado muy cómodo.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  },
  {
    name: "James T.",
    date: "Abril 2025 · Verified traveler",
    quote: "Muy bien organizado, adrenalina sin perder la seguridad y tiempo para fotos.",
    avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598"
  },
  {
    name: "Anna L.",
    date: "Marzo 2025 · Verified traveler",
    quote: "El viaje al cenote fue mágico y el equipo muy puntual.",
    avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39"
  }
];

const reviewTags = ["Excelente guía", "Mucha adrenalina", "Puntualidad"];
const DEFAULT_TOUR_IMAGE = "/fototours/fotosimple.jpg";
const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as unknown as string[]) ?? [];
  } catch {
    return [];
  }
};
const resolveTourHeroImage = (tour: { heroImage?: string | null; gallery?: string | null }) => {
  const gallery = parseGallery(tour.gallery);
  return tour.heroImage ?? gallery[0] ?? DEFAULT_TOUR_IMAGE;
};
const toAbsoluteUrl = (value: string) => {
  if (!value) return `${PROACTIVITIS_URL}${DEFAULT_TOUR_IMAGE}`;
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${PROACTIVITIS_URL}${normalized}`;
};

const buildTourTrustBadges = (languages: string[], categories: string[]) => {
  const languageLabel = languages.length ? languages.join(" · ") : "Español · Inglés";
  const categoryLabel = categories.length ? categories[0] : "Experiencia premium";
  return [
    `Guías bilingües certificados (${languageLabel})`,
    `Diseñado para ${categoryLabel} con grupos reducidos`,
    "Confirmación inmediata y soporte 24/7"
  ];
};

const buildTourFaq = (tourTitle: string, durationLabel: string, displayTime: string, priceLabel: string) => [
  {
    question: `¿Cómo reservo el tour ${tourTitle}?`,
    answer: `No tienes que escribir nada: elige fecha y pasajeros, haz clic en “Reservar experiencia” y el formulario del checkout se llena en segundos con la tarifa de ${priceLabel}.`
  },
  {
    question: "¿Qué incluye el precio?",
    answer: `El costo de ${priceLabel} cubre transporte privado, guía local, entradas pautadas, seguro básico y atención personalizada durante ${durationLabel}.`
  },
  {
    question: "¿Qué pasa si mi vuelo se retrasa?",
    answer: `Nos mantenemos en contacto: ajustamos el toque en destino y tu guía espera en la hora de encuentro pactada (${displayTime}) con comunicación directa.`
  }
];

export default async function TourDetailPage({ params, searchParams }: TourDetailProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hotelSlugFromQuery = resolvedSearchParams?.hotelSlug;
  const bookingCodeFromQuery = resolvedSearchParams?.bookingCode;
  const originHotel =
    hotelSlugFromQuery !== undefined
      ? await prisma.location.findUnique({
          where: { slug: hotelSlugFromQuery }
        })
      : null;
  if (!slug) notFound();
  if (slug === HIDDEN_TRANSFER_SLUG) notFound();

  const tour = await prisma.tour.findFirst({
    where: { slug },
    include: {
      SupplierProfile: {
        include: {
          User: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!tour) {
    const fallback = await prisma.tour.findUnique({ where: { id: slug } });
    if (fallback?.slug) redirect(`/tours/${fallback.slug}`);
    notFound();
  }

  if (tour.status !== "published") notFound();

  // --- Lógica de datos ---
  const gallery = (tour.gallery ? JSON.parse(tour.gallery as string) : [tour.heroImage ?? "/fototours/fotosimple.jpg"]) as string[];
  const highlights = parseJsonArray<string>(tour.highlights);
  const includesFromString = tour.includes ? tour.includes.split(";").map((i) => i.trim()).filter(Boolean) : ["Traslado", "Guía", "Almuerzo"];
  const includesList = parseJsonArray<string>(tour.includesList);
  const notIncludedList = parseJsonArray<string>(tour.notIncludedList);
  const includes = includesList.length ? includesList : includesFromString;
  const excludes = notIncludedList.length ? notIncludedList : ["Propinas", "Bebidas", "Fotos"];
  const categories = (tour.category ?? "").split(",").map((i) => i.trim()).filter(Boolean);
  const languages = (tour.language ?? "").split(",").map((i) => i.trim()).filter(Boolean);
  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const durationValue = parseDuration(tour.duration);
  const durationLabel = `${durationValue.value} ${durationValue.unit}`;
  const displayTime = timeSlots.length ? formatTimeSlot(timeSlots[0]) : "09:00 AM";
  const parsedAdminItinerary = parseAdminItinerary(tour.adminNote ?? "");
  const itinerarySource = parsedAdminItinerary.length ? parsedAdminItinerary : parseItinerary(tour.adminNote ?? "");
  const visualTimeline = itinerarySource.length ? itinerarySource : itineraryMock;
  const heroImage = tour.heroImage ?? gallery[0];
  const priceLabel = `$${tour.price.toFixed(0)} USD`;
  const needsReadMore = Boolean(tour.shortDescription && tour.shortDescription.length > 220);
  const shortTeaser =
    tour.shortDescription && tour.shortDescription.length > 220
      ? `${tour.shortDescription.slice(0, 220).trim()}…`
      : tour.shortDescription || "Explora esta aventura guiada por expertos locales.";
  const longDescriptionParagraphs = tour.description
    ? tour.description
        .split(/\r?\n\s*\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];
  const trustBadges = buildTourTrustBadges(languages, categories);
  const faqList = buildTourFaq(tour.title, durationLabel, displayTime, priceLabel);

  const detailReviewCount = getTourReviewCount(tour.slug, "detail");
  const detailReviewLabel = formatReviewCountValue(detailReviewCount);

  const quickInfo = [
    {
      label: "Duración",
      value: durationLabel,
      detail: "Experiencia guiada",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    },
    {
      label: "Salida",
      value: displayTime,
      detail: "Encuentro en el lobby",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M12 4a8 8 0 100 16 8 8 0 000-16Zm0 9V7" />
          <path d="M12 12h4" />
        </svg>
      )
    },
    {
      label: "Idiomas",
      value: languages.length ? languages.join(", ") : "Por confirmar",
      detail: languages.length ? `${languages.length} idiomas disponibles` : "Por confirmar",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <path d="M8 4c0 2.21-1.343 4-3 4M18 4c0 2.21 1.343 4 3 4" />
        </svg>
      )
    },
    {
      label: "Capacidad",
      value: `${tour.capacity ?? "15"} pers.`,
      detail: "Grupos reducidos",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <circle cx="8" cy="8" r="3" />
          <circle cx="16" cy="8" r="3" />
          <path d="M2 21c0-3.314 2.686-6 6-6h8c3.314 0 6 2.686 6 6" />
        </svg>
      )
    }
  ];

  const heroImageAbsolute = heroImage
    ? heroImage.startsWith("http")
      ? heroImage
      : `${PROACTIVITIS_URL}${heroImage}`
    : `${PROACTIVITIS_URL}/fototours/fotosimple.jpg`;
  const tourUrl = `${PROACTIVITIS_URL}/tours/${tour.slug}`;
  const priceValidUntil = getPriceValidUntil();
  const itineraryList = visualTimeline.map((stop, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "ListItem",
      name: stop.title,
      description: stop.description ?? stop.title
    }
  }));
  const touristTypeFallback = categories.find((category) =>
    ["Family", "Adventure", "Couples"].includes(category)
  );
  const aggregateRating =
    detailReviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: 4.9,
          reviewCount: detailReviewCount,
          bestRating: "5"
        }
      : undefined;
  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.description ?? shortTeaser,
    image: [heroImageAbsolute],
    url: tourUrl,
    provider: PROACTIVITIS_LOCALBUSINESS,
    touristType: touristTypeFallback ?? "Adventure",
    itinerary: {
      "@type": "ItemList",
      itemListElement: itineraryList
    },
    offers: {
      "@type": "Offer",
      url: tourUrl,
      price: tour.price,
      priceCurrency: "USD",
      priceValidUntil,
      availability: "https://schema.org/InStock"
    },
    sameAs: SAME_AS_URLS,
    ...(aggregateRating ? { aggregateRating } : {})
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqList.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const bookingWidgetProps = {
    tourId: tour.id,
    basePrice: tour.price,
    timeSlots,
    supplierHasStripeAccount: Boolean(tour.SupplierProfile?.stripeAccountId),
    platformSharePercent: tour.platformSharePercent ?? 20,
    tourTitle: tour.title,
    tourImage: heroImage,
    hotelSlug: hotelSlugFromQuery ?? undefined,
    bookingCode: bookingCodeFromQuery ?? undefined,
    originHotelName: originHotel?.name ?? undefined
  };

  const BookingPanel = ({ className = "" }: { className?: string }) => (
    <div className={`rounded-[28px] border border-slate-100 bg-white p-6 shadow-xl ${className}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reserva</p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">Confirma tu cupo</h3>
      <div className="mt-4">
        <TourBookingWidget {...bookingWidgetProps} />
      </div>
      <div className="mt-6 rounded-[16px] border border-[#F1F5F9] bg-slate-50/60 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">
          {tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Proveedor local"}
        </p>
        <p>Operado por expertos en la región.</p>
      </div>
    </div>
  );

  return (
  <div className="min-h-screen bg-[#FDFDFD] text-slate-950 pb-24 overflow-x-hidden">
      <StructuredData data={tourSchema} />
      <StructuredData data={faqSchema} />

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
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">{tour.title}</h1>
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Desde</p>
                  <p className="text-4xl font-black text-indigo-600">{priceLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rating</p>
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="text-2xl text-indigo-600">★</span>
                    <p className="text-xl font-black">{detailReviewLabel}</p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{detailReviewCount} reseñas</p>
                </div>
              </div>
                <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
                  {trustBadges.map((badge) => (
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
                  Reserve now
                </Link>
                <GalleryLightbox
                  images={gallery}
                  buttonLabel="View gallery"
                  buttonClassName="rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                />
              </div>
            </div>
          </div>
          <TourGalleryCollage images={gallery} title={tour.title} fallbackImage={heroImage} />
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-[1240px] px-4">
        <nav className="sticky top-16 z-10 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-lg backdrop-blur lg:top-8">
          <div className="flex gap-3 overflow-x-auto py-1 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            {[
              { label: "Overview", href: "#overview" },
              { label: "Incluye", href: "#includes" },
              { label: "Itinerario", href: "#itinerary" },
              { label: "Opiniones", href: "#reviews" },
              { label: "FAQ", href: "#faq" }
            ].map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {tab.label}
              </a>
            ))}
          </div>
        </nav>
      </section>

      <section id="overview" className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Overview</p>
          <p className="text-lg text-slate-800 line-clamp-3">{tour.shortDescription ?? shortTeaser}</p>
          {highlights.length ? (
            <ul className="space-y-2 text-sm font-semibold text-slate-700">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden className="text-lg text-emerald-600">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {longDescriptionParagraphs.length ? (
        <section className="mx-auto mt-6 max-w-[1240px] px-4">
          <div className="space-y-3 rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Descripción</p>
            <div className="space-y-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {longDescriptionParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="key-info" className="mx-auto mt-6 max-w-[1240px] px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickInfo.map((item) => (
            <div
              key={item.label}
              className="rounded-[16px] border border-slate-100 bg-white/80 px-5 py-4 text-center shadow-md"
            >
              <span className="mb-2 inline-block text-2xl">{item.icon}</span>
              <p className="text-[10px] font-semibold text-slate-500 tracking-[0.2em]">{item.label}</p>
              <p className="text-sm font-semibold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="booking" className="mx-auto mt-6 max-w-[1240px] px-4 lg:hidden">
        <div className="md:hidden mb-3">
          <p className="text-sm font-semibold text-gray-900">Reserve in 30 seconds</p>
          <p className="text-xs text-gray-600">Select date & travelers, then confirm.</p>
        </div>
        <div className="md:hidden ring-1 ring-black/10 shadow-md">
          <BookingPanel />
        </div>
      </section>

      <main className="mx-auto mt-10 grid max-w-[1240px] gap-10 px-4 lg:grid-cols-[1fr,420px]">
        <div className="space-y-10">
          <section id="includes" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Incluye / No incluye</p>
                <h2 className="text-[20px] font-semibold text-slate-900">Cobertura</h2>
              </div>
              <p className="text-xs text-slate-500">Información precisa</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Incluye</p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-emerald-600">
                  {includes.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span aria-hidden className="text-lg text-emerald-500">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">No incluye</p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-rose-500">
                  {excludes.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span aria-hidden className="text-lg text-rose-500">
                        ✕
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="itinerary" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Itinerario</p>
                <h2 className="text-[20px] font-semibold text-slate-900">Línea de tiempo</h2>
              </div>
            </div>
            <div className="space-y-4">
              {visualTimeline.map((stop, index) => (
                  <div key={`${stop.title}-${index}`} className="flex gap-4 rounded-[16px] border border-[#F1F5F9] bg-white/70 px-4 py-3">
                    <div className="flex flex-col items-center text-sm text-slate-500">
                      <span className="h-3 w-3 rounded-full bg-indigo-600" />
                      {index !== visualTimeline.length - 1 && <span className="mt-2 h-6 w-px bg-slate-200" />}
                    </div>
                    <div className="text-sm leading-relaxed text-slate-700">
                      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{stop.time}</p>
                      <p className="text-base font-semibold text-slate-900">{stop.title}</p>
                      <p>{stop.description ?? "Detalle próximamente."}</p>
                    </div>
                  </div>
              ))}
            </div>
          </section>

          <section id="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Prueba social</p>
                <h2 className="text-[20px] font-semibold text-slate-900">Opiniones</h2>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                4.9/5 · {detailReviewLabel} reseñas
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-semibold text-slate-900">4.9</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">de 5</p>
                </div>
                <div className="space-y-3 text-sm text-slate-700">
                  {reviewBreakdown.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-slate-500">{item.label}</span>
                      <div className="relative flex-1 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-2 rounded-full bg-emerald-500"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs font-semibold text-slate-500">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {reviewHighlights.map((review) => (
                  <div key={review.name} className="rounded-[16px] border border-[#F1F5F9] bg-white p-4 shadow">
                    <div className="flex items-center gap-3">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                        <p className="text-xs text-slate-500">{review.date}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{review.quote}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="faq" className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">FAQ</p>
              <h2 className="text-[20px] font-semibold text-slate-900">Preguntas frecuentes</h2>
            </div>
            <div className="space-y-4 text-sm text-slate-700">
              {faqList.map((item) => (
                <article key={item.question} className="rounded-[16px] border border-[#F1F5F9] bg-white/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.question}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-10 space-y-6">
            <BookingPanel />
          </div>
        </aside>
      </main>

      <ReserveFloatingButton targetId="booking" priceLabel={priceLabel} />
    </div>
  );
}
