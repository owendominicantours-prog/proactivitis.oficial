import Image from "next/image";
import Link from "next/link";
import TourGalleryViewer from "@/components/shared/TourGalleryViewer";
import { notFound, redirect } from "next/navigation";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import { prisma } from "@/lib/prisma";
import { parseAdminItinerary, parseItinerary, ItineraryStop } from "@/lib/itinerary";
import ReserveFloatingButton from "@/components/shared/ReserveFloatingButton";

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
  { icon: "🕶️", label: "Gafas de sol", detail: "Ideal para brillo y brisa marina." },
  { icon: "🧴", label: "Protector solar", detail: "Elige una opción biodegradable." },
  { icon: "👕", label: "Ropa que se pueda ensuciar", detail: "Capas ligeras y cómodas." }
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
    quote: "Guía excepcional, recorridos emocionantes y transporte muy cómodo.",
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
  const includes = tour.includes ? tour.includes.split(";").map((i) => i.trim()).filter(Boolean) : ["Transporte", "Guía", "Almuerzo"];
  const excludes = ["Propinas", "Bebidas", "Fotos"];
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

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-24 overflow-x-hidden">
      {/* Hero */}
      <section className="mx-auto max-w-[1240px] px-4 pt-8 sm:pt-10">
        <div className="grid gap-4 overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.06)] lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
              📍 {tour.location}
            </div>
            <h1 className="mb-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {tour.title}
            </h1>
            <p className="mb-10 text-lg text-slate-500 leading-relaxed">{shortTeaser}</p>
            <div className="flex items-center gap-8 border-t border-slate-100 pt-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Desde</p>
                <p className="text-4xl font-black text-indigo-600">{priceLabel}</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rating</p>
                <p className="text-xl font-black">⭐ 4.9</p>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="#booking"
                className="rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition-transform hover:scale-105 active:scale-95"
              >
                Reservar experiencia
              </Link>
              <Link
                href="#gallery"
                className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Ver galería
              </Link>
            </div>
          </div>
          <div
            className="h-[400px] lg:h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImage})`
            }}
          />
        </div>
      </section>

      {/* Quick Info */}
      <section className="mx-auto mt-10 max-w-[1240px] px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickInfo.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="mb-3 block text-2xl">{item.icon}</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
              <p className="text-sm font-black text-slate-900">{item.value}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mt-2">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Grid */}
      <main className="mx-auto mt-12 grid max-w-[1240px] gap-10 px-4 lg:grid-cols-[1fr,400px]">
        <div className="space-y-10">
          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resumen</p>
                <h2 className="text-[20px] font-semibold text-slate-900">Visión general</h2>
              </div>
              {needsReadMore && (
                <Link href="#full-description" className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
                  Leer más
                </Link>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{shortTeaser}</p>
          </section>

          <section id="full-description" className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Descripción</p>
              <h2 className="text-[20px] font-semibold text-slate-900">Detalles completos</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {tour.description || "La descripción completa estará disponible pronto."}
            </p>
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
            <h3 className="text-[16px] font-semibold text-slate-900">Incluye / No incluye</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Incluye</p>
                <div className="mt-3 space-y-2">
                  {includes.map((item) => (
                    <p key={item} className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                      <span className="text-lg">✔︎</span>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">No incluye</p>
                <div className="mt-3 space-y-2">
                  {excludes.map((item) => (
                    <p key={item} className="flex items-center gap-2 text-sm font-semibold text-rose-500">
                      <span className="text-lg">✘</span>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Itinerario</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Línea de tiempo</h3>
              </div>
              <span className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-400">Paso a paso</span>
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Prueba social</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Opiniones</h3>
              </div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">⭐ 4.9 · 1,230 reseñas</div>
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
                {reviewHighlights.map((review) => (
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Prepárate</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Qué llevar</h3>
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

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Extras</p>
              <h3 className="text-[16px] font-semibold text-slate-900">Información adicional</h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {additionalInfo.map((info) => (
                <li key={info} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6 lg:w-[400px] w-full">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reserva</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Confirma tu cupo</h3>
          <TourBookingWidget
            tourId={tour.id}
            basePrice={tour.price}
            timeSlots={timeSlots}
            supplierHasStripeAccount={Boolean(tour.SupplierProfile?.stripeAccountId)}
            platformSharePercent={tour.platformSharePercent ?? 20}
            tourTitle={tour.title}
            tourImage={heroImage}
            hotelSlug={hotelSlugFromQuery ?? undefined}
            bookingCode={bookingCodeFromQuery ?? undefined}
            originHotelName={originHotel?.name ?? undefined}
          />
            <div className="mt-6 rounded-[16px] border border-[#F1F5F9] bg-slate-50/60 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                {tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Proveedor local"}
              </p>
              <p>Operado por expertos en la región.</p>
            </div>
          </div>
        </aside>
      </main>

      <ReserveFloatingButton targetId="booking" priceLabel={priceLabel} />
    </div>
  );
}
