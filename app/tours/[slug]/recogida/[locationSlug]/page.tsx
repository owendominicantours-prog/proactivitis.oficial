import Image from "next/image";
import { notFound } from "next/navigation";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import TourGalleryViewer from "@/components/shared/TourGalleryViewer";
import ReserveFloatingButton from "@/components/shared/ReserveFloatingButton";
import { prisma } from "@/lib/prisma";
import { parseAdminItinerary, parseItinerary, ItineraryStop } from "@/lib/itinerary";

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

const parseJsonArray = <T,>(value?: string | null): T[] => {
  if (!value) return [];
  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
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

const additionalInfo = [
  "Confirmamos el punto exacto de encuentro con 24h de antelación.",
  "No apto para personas con movilidad reducida.",
  "No recomendado para embarazadas.",
  "Sillas infantiles disponibles bajo solicitud.",
  "Reserva confirmada desde 2 huéspedes."
];

const packingList = [
  { icon: "👟", label: "Calzado cerrado", detail: "Protección en terrenos irregulares." },
  { icon: "😎", label: "Gafas de sol", detail: "Ideal para brillo y brisa marina." },
  { icon: "☀️", label: "Protector solar", detail: "Elige una opción biodegradable." },
  { icon: "👕", label: "Ropa que se pueda ensuciar", detail: "Capas ligeras y cómodas." }
];

const reviewBreakdown = [
  { label: "5 estrellas", percent: 90 },
  { label: "4 estrellas", percent: 8 },
  { label: "3 estrellas", percent: 1 },
  { label: "2 estrellas", percent: 1 },
  { label: "1 estrella", percent: 0 }
];

type ReviewHighlight = {
  name: string;
  date: string;
  quote: string;
  avatar: string;
};

type FAQItem = {
  question: string;
  answer: string;
};

type TourVariantConfig = {
  galleryIndex?: number;
  heroBlurb?: string;
  heroBadge?: string;
  reviewHighlights?: ReviewHighlight[];
  faqOverride?: FAQItem;
};

const defaultReviewHighlights = [
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

const defaultFaqs: FAQItem[] = [
  {
    question: "¿Qué incluye la experiencia?",
    answer:
      "Traslado desde tu hotel, guía certificado, snorkel, bebidas selectas y una cena ligera frente al atardecer."
  },
  {
    question: "¿Puedo modificar la fecha?",
    answer: "Solo requerimos 24h de antelación para reprogramar, sujeto a disponibilidad del tour y del hotel."
  },
  {
    question: "¿Qué pasa si llueve?",
    answer:
      "La experiencia se ajusta a condiciones moderadas; en caso de lluvia fuerte, se ofrece cambio de fecha o reembolso."
  },
  {
    question: "¿Hay extras para grupos grandes?",
    answer:
      "Coordinamos DJ, barra o equipos especiales según el plan; comparte tu idea y te enviamos la propuesta."
  }
];

const tourVariantConfigs: Record<string, TourVariantConfig> = {
  "sunset-catamaran-cruise-passengers": {
    galleryIndex: 0,
    heroBlurb:
      "Ajustamos el horario a la llegada de tu crucero. Recogida en Puerto Taino Bay/Amber Cove a la hora exacta de atraque.",
    heroBadge: "Pick-up sincronizado con tu barco",
    reviewHighlights: [
      {
        name: "Lucía & Grupo Crucero",
        date: "Julio 2025 ¶ú Verified traveler",
        quote: "Llegamos directo desde el barco y ya teníamos la lancha esperándonos. Todo cronometrado.",
        avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598"
      }
    ],
    faqOverride: {
      question: "¿Qué pasa si mi barco se retrasa?",
      answer:
        "Monitorizamos el estado del crucero en tiempo real y reagendamos la recogida sin costo adicional para que no pierdas el atardecer."
    }
  },
  "sunset-catamaran-bachelor-party": {
    galleryIndex: 1,
    heroBlurb: "Bar abierto premium y DJ privado. El mejor plan para grupos de amigos antes de la boda.",
    heroBadge: "Fiesta privada con barra premium",
    reviewHighlights: [
      {
        name: "Marcos & Amigos",
        date: "Junio 2025 ¶ú Bachelor crew",
        quote: "DJ a bordo y tragos ilimitados hicieron que la despedida fuera inolvidable. ¡Seguiremos regresando!",
        avatar: "https://images.unsplash.com/photo-1469474968028-56623f02e42e"
      }
    ],
    faqOverride: {
      question: "¿Puedo llevar música y barra privada?",
      answer:
        "Sí, activamos el DJ y barra personalizada con mixólogos; solo confírmanos cuántas personas y preferencias."
    }
  },
  "sunset-catamaran-couples-anniversary": {
    galleryIndex: 2,
    heroBlurb: "Cena ligera a bordo y fotos profesionales del atardecer para parejas. Privacidad garantizada.",
    heroBadge: "Experiencia romántica íntima",
    reviewHighlights: [
      {
        name: "Camila & Mateo",
        date: "Abril 2025 ¶ú Couples retreat",
        quote: "La cena a bordo y el fotógrafo privado hicieron que nuestro aniversario fuera mágico y relajado.",
        avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39"
      }
    ],
    faqOverride: {
      question: "¿El tour es privado para parejas?",
      answer:
        "Personalizamos la cubierta para tu pareja, incluyendo cena ligera, fotos al atardecer y privacidad total en la zona VIP."
    }
  },
  "sunset-catamaran-family-friendly": {
    galleryIndex: 3,
    heroBlurb:
      "Chalecos salvavidas para niños y equipo de snorkel infantil. Ambiente seguro y divertido para toda la familia.",
    heroBadge: "Kit familiar con snorkel infantil",
    reviewHighlights: [
      {
        name: "Familia Castillo",
        date: "Mayo 2025 ¶ú Verified parents",
        quote:
          "Los chalecos infantiles y la atención del equipo nos hicieron sentir tranquilos mientras los niños nadaban y jugaban.",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
      }
    ],
    faqOverride: {
      question: "¿Hay chalecos y snorkel para niños?",
      answer:
        "Contamos con kits de seguridad para niños y equipo adaptado; además, los guías acompañan cada tramo para que las familias estén seguras."
    }
  },
  "sunset-catamaran-usa-travelers": {
    galleryIndex: 4,
    heroBlurb: "Precios en USD, guías nativos en inglés y estándares de seguridad americanos.",
    heroBadge: "Estándares americanos y guía nativo",
    reviewHighlights: [
      {
        name: "Travelers USA",
        date: "Agosto 2025 ¶ú Verified travelers",
        quote:
          "Todo en dólares, el guía hablaba inglés perfecto y el protocolo de seguridad fue de primer nivel, tal como lo esperábamos.",
        avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39"
      }
    ],
    faqOverride: {
      question: "¿Ofrecen guías nativos en inglés y estándares de seguridad americanos?",
      answer:
        "Sí, todos los guías tienen entrenamiento bilingüe y trabajamos con protocolos americanos de seguridad, incluidos controles de flotabilidad."
    }
  }
};

type TourHotelLandingParams = {
  params: Promise<{ slug: string; locationSlug: string }>;
  searchParams?: Promise<{ bookingCode?: string }>;
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; locationSlug: string }>;
}) {
  const { slug, locationSlug } = await params;
  const tour = await prisma.tour.findUnique({
    where: { slug },
    select: { title: true, shortDescription: true }
  });
  const location = await prisma.location.findUnique({
    where: { slug: locationSlug },
    select: { name: true }
  });

  if (!tour || !location) {
    return {
      title: "Tour no encontrado | Proactivitis",
      description: "No pudimos encontrar la experiencia seleccionada."
    };
  }

  return {
    title: `${tour.title} con recogida en ${location.name} | Proactivitis`,
    description: tour.shortDescription ?? `Reserva ${tour.title} con recogida personalizada desde ${location.name}.`
  };
}

export default async function TourHotelLanding({ params, searchParams }: TourHotelLandingParams) {
  const { slug, locationSlug } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};

  let tour = null;
  let location = null;
  try {
    [tour, location] = await Promise.all([
      prisma.tour.findUnique({
        where: { slug },
        include: {
          SupplierProfile: {
            include: { User: { select: { name: true } } }
          },
          country: true,
          destination: true,
          microZone: true
        }
      }),
      prisma.location.findUnique({
        where: { slug: locationSlug },
        include: { microZone: true, destination: true, country: true }
      })
    ]);
  } catch (error) {
        console.error("Error loading tour or location for landing page", {
          slug,
          locationSlug,
          error
        });
    throw error;
  }

  if (!tour) {
    console.error("Tour no encontrado para el slug", { slug, locationSlug });
    notFound();
  }

  if (!location) {
    console.error("Location no encontrada para el slug", { locationSlug, slug });
    notFound();
  }

  const gallery = (tour.gallery ? JSON.parse(tour.gallery as string) : [tour.heroImage ?? "/fototours/fotosimple.jpg"]) as string[];
  const includesList = tour.includes
    ? tour.includes.split(";").map((item) => item.trim()).filter(Boolean)
    : ["Traslado", "Guía", "Almuerzo"];
  const excludesList = ["Propinas", "Bebidas", "Fotos"];
  const categories = (tour.category ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  const languages = (tour.language ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  const timeSlotsRaw = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const defaultSlot: PersistedTimeSlot = { hour: 9, minute: "00", period: "AM" };
  const timeSlots: PersistedTimeSlot[] = timeSlotsRaw.length ? timeSlotsRaw : [defaultSlot];
  const durationValue = parseDuration(tour.duration);
  const durationLabel = `${durationValue.value} ${durationValue.unit}`;
  const displayTime = timeSlots.length ? formatTimeSlot(timeSlots[0]) : "09:00 AM";
  const priceLabel = `$${tour.price.toFixed(0)} USD`;
  const parsedAdminItinerary = parseAdminItinerary(tour.adminNote ?? "");
  const itinerarySource = parsedAdminItinerary.length ? parsedAdminItinerary : parseItinerary(tour.adminNote ?? "");
  const visualTimeline = itinerarySource.length ? itinerarySource : itineraryMock;
  const heroImageFallback = tour.heroImage ?? gallery[0];
  const variantConfig = tourVariantConfigs[slug];
  const variantGalleryImage =
    typeof variantConfig?.galleryIndex === "number" &&
    variantConfig.galleryIndex >= 0 &&
    variantConfig.galleryIndex < gallery.length
      ? gallery[variantConfig.galleryIndex]
      : undefined;
  const heroImage = variantGalleryImage ?? heroImageFallback;
  const baseShortTeaser =
    tour.shortDescription && tour.shortDescription.length > 220
      ? `${tour.shortDescription.slice(0, 220).trim()}…`
      : tour.shortDescription || "Explora esta aventura guiada por expertos locales.";
  const heroCopy = variantConfig?.heroBlurb ?? baseShortTeaser;
  const heroBadge = variantConfig?.heroBadge;
  const summaryDescription = tour.description ?? heroCopy;
  const variantFaq = variantConfig?.faqOverride;
  const faqList = variantFaq
    ? [variantFaq, ...defaultFaqs.filter((faq) => faq.question !== variantFaq.question)]
    : defaultFaqs;
  const variantReviewHighlights = variantConfig?.reviewHighlights ?? [];
  const combinedReviewHighlights = [
    ...variantReviewHighlights,
    ...defaultReviewHighlights.filter(
      (review) => !variantReviewHighlights.some((variantReview) => variantReview.name === review.name)
    )
  ];

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
      detail: `Encuentro en el lobby de ${location.name}`,
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
      value: `${tour.capacity ?? 15} pers.`,
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

  const bookingCode = resolvedSearch.bookingCode;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-24 overflow-x-hidden">
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-4 pt-8 sm:pt-10">
        <div className="grid gap-4 overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.06)] lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-16 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
              Recogida garantizada en {location.name}
            </div>
            <h1 className="mb-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {tour.title}
            </h1>
            {heroBadge && (
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">{heroBadge}</p>
            )}
            <p className="text-lg text-slate-500 leading-relaxed">{heroCopy}</p>
            <div className="flex items-center gap-8 border-t border-slate-100 pt-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Desde</p>
                <p className="text-4xl font-black text-indigo-600">{priceLabel}</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rating</p>
                <p className="text-xl font-black">★ 4.9</p>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#booking"
                className="rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition-transform hover:scale-105 active:scale-95"
              >
                Reservar experiencia
              </a>
              <a
                href="#gallery"
                className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Ver galería
              </a>
            </div>
          </div>
          <div
            className="h-[320px] sm:h-[350px] lg:h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImage})`
            }}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-4 py-10">
        <div className="grid gap-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2 lg:grid-cols-4">
          {quickInfo.map((item) => (
            <div key={item.label} className="space-y-2 rounded-[18px] border border-slate-100 bg-slate-50/60 p-4 text-sm">
              <div className="text-slate-500">{item.icon}</div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">{item.label}</p>
              <p className="text-lg font-semibold text-slate-900">{item.value}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-4 py-8">
        <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50/60 via-white to-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">Traslado desde tu hotel incluido</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Coordinamos la conexión con tu hotel</h3>
          <p className="mt-4 text-sm text-slate-600">
            Ofrecemos recogida en {location.name} a las 2:15 PM para que llegues a tiempo al Sunset Catamaran sin
            preocuparte por el traslado.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.35em] text-emerald-700">
            Este bloque enlaza tus 50,000 landings de hoteles con las experiencias de Proactivitis.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-4 py-8">
        <div className="rounded-[28px] border border-slate-100 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Confirmación inmediata desde tu hotel.
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Cancelación flexible.
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Soporte 24/7.
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto mt-12 grid max-w-[1240px] gap-10 px-4 sm:px-6 lg:px-4 lg:grid-cols-[1fr,400px]">
        <div className="space-y-10">
          <section id="gallery" className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <TourGalleryViewer
              images={gallery.map((img, index) => ({
                url: img,
                label: `${tour.title} ${index + 1}`
              }))}
            />
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">FAQs</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Preguntas frecuentes</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {faqList.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-[16px] border border-[#F1F5F9] bg-white/90 p-4 shadow-sm"
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                    {faq.question}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resumen general</p>
                <h2 className="text-[20px] font-semibold text-slate-900">Visión amplificada</h2>
              </div>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Recogida en {location.name}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{summaryDescription}</p>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Detalles</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Información clave</h3>
              </div>
              <span className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">Categorías</span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { title: "Categorías", value: categories.join(", ") || "Premium" },
                { title: "Idiomas", value: languages.join(", ") || "Español / Inglés" },
                { title: "Capacidad", value: `${tour.capacity ?? 15} personas` },
                { title: "Nivel físico", value: tour.physicalLevel ?? "Moderado" }
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[16px] border border-[#F1F5F9] bg-white/40 px-4 py-3"
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-500">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Incluye</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {includesList.map((entry) => (
                    <li key={entry} className="flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">No incluye</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {excludesList.map((entry) => (
                    <li key={entry} className="flex items-center gap-2">
                      <span className="text-lg">✕</span>
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Itinerario</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Paso a paso</h3>
              </div>
              <span className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">Recogida & tour</span>
            </div>
            <div className="relative mt-4 pl-0 lg:pl-10">
              <div className="absolute left-4 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-200" />
              <div className="space-y-5">
                {visualTimeline.map((stop, index) => (
                  <div key={`${stop.title}-${index}`} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="h-3 w-3 rounded-full bg-indigo-600" />
                      {index !== visualTimeline.length - 1 && <span className="mt-2 h-6 w-px bg-slate-200" />}
                    </div>
                    <div className="flex-1 rounded-[16px] border border-[#F1F5F9] bg-white/70 px-4 py-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{stop.time}</p>
                      <p className="mt-1 text-[16px] font-semibold text-slate-900">{stop.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{stop.description ?? "Detalle próximamente."}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reviews</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Opiniones</h3>
              </div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">★ 4.9 · 1,230 reseñas</div>
            </div>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-semibold text-slate-900">4.9</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">de 5</p>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
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
                <div className="flex flex-wrap gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                  {reviewTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {combinedReviewHighlights.map((review) => (
                  <div key={review.name} className="rounded-[16px] border border-[#F1F5F9] bg-white p-4 shadow-sm">
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
                    <p className="mt-2 text-sm text-slate-600">{review.quote}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Qué llevar</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Prepárate</h3>
              </div>
              <span className="text-xs uppercase tracking-[0.35em] text-slate-400">Consejos</span>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {packingList.map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-[140px] flex-col items-center gap-2 rounded-[16px] border border-[#F1F5F9] bg-white/0 px-3 py-4 text-center"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:w-[400px] w-full lg:sticky lg:top-16">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-xl" id="booking">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reserva</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Confirma tu cupo</h3>
            <p className="text-sm text-slate-600">
              Te recogemos en {location.name} y te acompañamos durante toda la actividad.
            </p>
            <TourBookingWidget
              tourId={tour.id}
              basePrice={tour.price}
              timeSlots={timeSlots}
              supplierHasStripeAccount={Boolean(tour.SupplierProfile?.stripeAccountId)}
              platformSharePercent={tour.platformSharePercent ?? 20}
              tourTitle={tour.title}
              tourImage={heroImage}
              hotelSlug={location.slug}
              bookingCode={bookingCode ?? undefined}
              originHotelName={location.name}
            />
            <div className="mt-6 rounded-[16px] border border-[#F1F5F9] bg-slate-50/60 p-4 text-sm text-slate-600 text-center">
              <p className="font-semibold text-slate-900">
                {tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Proveedor local"}
              </p>
              <p>Operado por expertos en la región.</p>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-100 bg-emerald-50/80 p-5 text-sm text-emerald-900 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Urgencia</p>
            <p className="text-xl font-semibold">Te guardamos la plaza 29:00 minutos</p>
            <p className="text-xs text-emerald-700">Reserva ahora y asegura la recogida en {location.name}.</p>
          </div>
        </aside>
      </main>

      <ReserveFloatingButton targetId="booking" priceLabel={priceLabel} />
    </div>
  );
}
