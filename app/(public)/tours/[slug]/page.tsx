import Image from "next/image";
import Link from "next/link";
import TourGalleryViewer from "@/components/shared/TourGalleryViewer";
import { notFound, redirect } from "next/navigation";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import { prisma } from "@/lib/prisma";
import { parseAdminItinerary, parseItinerary, ItineraryStop } from "@/lib/itinerary";
import ReserveFloatingButton from "@/components/shared/ReserveFloatingButton";

type TourDetailProps = {
  params: {
    slug?: string;
  };
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
    description: "Manejo por senderos de selva y lodo con paradas para fotos imperdibles."
  },
  {
    time: "Cultura local",
    title: "Cultura Local",
    description: "Degustación de café, cacao y tabaco en casa típica de la región."
  },
  {
    time: "Cenote o playa",
    title: "Cenote / Playa",
    description: "Parada técnica para nadar y refrescarse en un entorno natural."
  },
  {
    time: "Regreso",
    title: "Regreso",
    description: "Traslado de vuelta al punto de origen con recuerdos inolvidables."
  }
];

const additionalInfo = [
  "Confirmamos los puntos exactos de encuentro con 24 h de antelación.",
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

export default async function TourDetailPage({ params }: TourDetailProps) {
  const { slug } = await params;
  if (!slug) notFound();

  const tour = await prisma.tour.findFirst({
    where: { slug },
    include: {
      SupplierProfile: {
        include: {
          User: {
            select: {
              name: true
            }
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

  if (tour.status !== "published") {
    notFound();
  }

  const gallery = (tour.gallery ? JSON.parse(tour.gallery as string) : [tour.heroImage ?? "/fototours/fotosimple.jpg"]) as string[];
  const includes = tour.includes
    ? tour.includes.split(";").map((item) => item.trim()).filter(Boolean)
    : ["Transport", "Guide", "Lunch"];
  const excludes = ["Gratuities", "Drinks", "Photos"];

  const shortDescription = tour.shortDescription?.trim() ?? "";
  const detailedDescription = tour.description ?? "";
  const categories = (tour.category ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const languages = (tour.language ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const operatingDays = parseJsonArray<string>(tour.operatingDays);
  const blackoutDates = parseJsonArray<string>(tour.blackoutDates);
  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const durationValue = parseDuration(tour.duration);
  const durationLabel = `${durationValue.value} ${durationValue.unit}`;
  const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const allDaysSelected =
    WEEK_DAYS.length > 0 && WEEK_DAYS.every((day) => operatingDays.includes(day));
  const detailRows = [
    { label: "Categorías", values: categories },
    { label: "Idiomas", values: languages },
    {
      label: "Días operativos",
      value: allDaysSelected ? "Todos los días" : undefined,
      values: allDaysSelected ? undefined : operatingDays
    },
    { label: "Fechas bloqueadas", values: blackoutDates },
    { label: "Nivel físico", value: tour.physicalLevel },
    { label: "Capacidad máxima", value: tour.capacity ? `${tour.capacity} personas` : undefined },
    { label: "Cancelación", value: tour.cancellationPolicy },
    { label: "Requisitos", value: tour.requirements }
  ].filter((row) => (row.values ? row.values.length > 0 : Boolean(row.value)));

  const parsedAdminItinerary = parseAdminItinerary(tour.adminNote ?? "");
  const itinerarySource = parsedAdminItinerary.length ? parsedAdminItinerary : parseItinerary(tour.adminNote ?? "");
  const finalItinerary = itinerarySource.length ? itinerarySource : itineraryMock;
  const timelineSource = finalItinerary.length ? finalItinerary : itineraryMock;
  const visualTimeline = timelineSource.slice(0, 5);

  const priceLabel = `Desde $${tour.price.toFixed(0)} USD`;
  const displayTime = timeSlots.length ? formatTimeSlot(timeSlots[0]) : "09:00 AM";
  const languagesDisplay = languages.length ? languages.join(", ") : "Por confirmar";
  const shortTeaser =
    shortDescription && shortDescription.length > 220
      ? `${shortDescription.slice(0, 220).trim()}…`
      : shortDescription || "Explora esta aventura guiada por expertos locales.";
  const needsReadMore = Boolean(shortDescription && shortDescription.length > 220);

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
      label: "Idiomas",
      value: languagesDisplay,
      detail: languages.length ? `${languages.length} idiomas disponibles` : "Por confirmar",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <path d="M8 4c0 2.21-1.343 4-3 4M18 4c0 2.21 1.343 4 3 4" />
        </svg>
      )
    },
    {
      label: "Hora de salida",
      value: displayTime,
      detail: "Encuentro en el lobby",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M12 4a8 8 0 100 16 8 8 0 000-16Zm0 9V7" />
          <path d="M12 12h4" />
        </svg>
      )
    }
  ];

  const renderIcon = (label: string) => {
    if (label.toLowerCase().includes("categor")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <path d="M4 10h16M10 4v16" />
        </svg>
      );
    }
    if (label.toLowerCase().includes("idiomas") || label.toLowerCase().includes("nivel")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="9" />
          <path d="M4 12h16M12 4c0 3.314-1.343 6-3 6M20 12c0-3.314-1.343-6-3-6" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  };

  const sectionClasses = () =>
    "group relative rounded-[16px] border border-[#E5E7EB] bg-white px-4 py-4 transition hover:border-l-4 hover:border-sky-500 focus-within:border-l-4 focus-within:border-sky-500";

  const heroImageUrl = tour.heroImage ?? gallery[0] ?? "/fototours/fotosimple.jpg";
  const heroSubtitle = "Conduce un buggy, un ATV o un Buggy VIP por senderos de la selva dominicana.";

  return (
    <div className="bg-[#F8FAFC] text-slate-900 overflow-x-hidden">
      <section className="mx-auto max-w-[1180px] px-4 py-12">
        <div className="grid gap-8 rounded-[32px] border border-slate-200 bg-white px-6 py-8 shadow-[0_25px_60px_rgba(15,23,42,0.1)] lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{tour.location}, Dominican Republic</p>
              <h1 className="text-3xl font-black text-slate-900">{tour.title || "Excursión en Buggy y ATV en Punta Cana"}</h1>
              <p className="text-sm text-slate-500">{heroSubtitle}</p>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="rounded-[20px] border border-slate-100 bg-slate-50 px-6 py-5 text-slate-700 shadow-sm">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">Desde</p>
                <p className="text-4xl font-black text-brand">{priceLabel}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">Mejor precio garantizado</p>
              </div>
              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{displayTime}</p>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Salida desde el lobby</p>
                <p className="mt-2 text-xs text-slate-500">{languagesDisplay}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#booking"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-sm transition hover:border-slate-300"
              >
                Reserva ahora
              </Link>
              <Link
                href="#gallery"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-sm transition hover:border-slate-300"
              >
                Ver fotos
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="h-72 w-full overflow-hidden rounded-[24px] border border-slate-100 bg-slate-100 shadow-inner md:h-[360px] lg:h-[420px]">
              <Image
                src={heroImageUrl}
                alt={tour.title ?? "Tour destacado"}
                fill
                priority
                sizes="(max-width: 768px) 90vw, 500px"
                className="object-cover transition duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-6">
        <div className="rounded-[24px] border border-[#E5E7EB] bg-white px-0 text-sm shadow-sm">
          <div className="flex w-full divide-x divide-slate-200">
            {quickInfo.map((item) => (
              <div key={item.label} className="flex flex-1 items-center justify-between gap-3 px-3 py-3 text-sm">
                <span className="flex h-5 w-5 items-center justify-center text-slate-900">{item.icon}</span>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="text-base font-semibold text-slate-900">{item.value}</p>
                  <p className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 pb-16 lg:flex-row lg:items-start">
        <div className="space-y-6 lg:w-3/5">
          <div className={sectionClasses()}>
            <TourGalleryViewer
              images={gallery.map((img: string, index: number) => ({
                url: img,
                label: `${tour.title} ${index + 1}`
              }))}
            />
          </div>

          <section className={`${sectionClasses()} space-y-4`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resumen</p>
                <h2 className="text-[20px] font-semibold text-slate-900">Visión general</h2>
              </div>
              {needsReadMore && (
                <Link
                  href="#full-description"
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 hover:text-sky-700"
                >
                  Leer más
                </Link>
              )}
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{shortTeaser}</p>
          </section>

          <section
            id="full-description"
            className={`${sectionClasses()} space-y-4`}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Descripción</p>
              <h2 className="text-[20px] font-semibold text-slate-900">Detalles completos</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              {detailedDescription || "La descripción completa estará disponible pronto."}
            </p>
          </section>

          {detailRows.length > 0 && (
            <section className={`${sectionClasses()} space-y-4`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Detalles</p>
                  <h3 className="text-[16px] font-semibold text-slate-900">Detalles clave</h3>
                </div>
                <span className="text-[0.55rem] uppercase tracking-[0.4em] text-slate-400">Resumen</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {detailRows.map((row) => (
                  <div
                    key={row.label}
                    className="space-y-3 rounded-[12px] border border-[#F1F5F9] bg-white/0 px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-[12px] bg-white text-slate-900">
                        {renderIcon(row.label)}
                      </span>
                      <p className="text-[0.75rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                        {row.label}
                      </p>
                    </div>
                    {row.values ? (
                      <div className="flex flex-wrap gap-2">
                        {row.values.map((value) => (
                          <span
                            key={value}
                            className="rounded-full border border-[#F1F5F9] bg-white px-2 py-1 text-[0.65rem] font-semibold text-slate-600"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    ) : (
                      row.value && (
                        <p className="text-sm font-semibold text-slate-900">{row.value}</p>
                      )
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={`${sectionClasses()} space-y-4`}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Incluye</p>
                <div className="mt-3 space-y-2">
                  {includes.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-[12px] border border-emerald-100 bg-emerald-50/30 px-3 py-2 text-[0.75rem] font-semibold text-emerald-800"
                    >
                      <span aria-hidden>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">No incluye</p>
                <div className="mt-3 space-y-2">
                  {excludes.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-[12px] border border-rose-100 bg-rose-50/30 px-3 py-2 text-[0.75rem] font-semibold text-rose-600"
                    >
                      <span aria-hidden>✘</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={`${sectionClasses()} space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Itinerario</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Línea de tiempo visual</h3>
              </div>
              <span className="text-xs uppercase tracking-[0.4em] text-slate-400">Paso a paso</span>
            </div>
            <div className="relative mt-4 pl-10">
              <div className="pointer-events-none absolute left-4 top-1 bottom-1 w-px border-l-2 border-dashed border-slate-200" />
              <div className="space-y-4">
                {visualTimeline.map((stop, index) => (
                  <div key={`${stop.title}-${index}`} className="relative flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                      {index !== visualTimeline.length - 1 && (
                        <span className="mt-1 block h-6 w-px bg-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 rounded-[12px] border border-[#F1F5F9] bg-white/0 px-3 py-3">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                        {stop.time}
                      </p>
                      <p className="mt-1 text-[16px] font-semibold text-slate-900">{stop.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {stop.description ?? "Detalles próximamente."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={`${sectionClasses()} space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Prueba social</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Opiniones destacadas</h3>
              </div>
              <div className="text-sm font-semibold text-slate-500">★ 4.9 · 1,230 reseñas</div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-semibold text-slate-900">4.9</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">de 5</p>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
                  {reviewBreakdown.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-slate-500">{item.label}</span>
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
                  <div key={review.name} className="rounded-[12px] border border-[#F1F5F9] bg-white/0 p-3">
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
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.quote}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={`${sectionClasses()} space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Extra</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Qué llevar</h3>
              </div>
              <span className="text-xs uppercase tracking-[0.4em] text-slate-400">Valor agregado</span>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {packingList.map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-[140px] flex-col items-center gap-2 rounded-[12px] border border-[#F1F5F9] bg-white/0 px-3 py-4 text-center"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={`${sectionClasses()} space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Información adicional</p>
                <h3 className="text-[16px] font-semibold text-slate-900">Puntos clave</h3>
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {additionalInfo.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:w-2/5">
          <div className="space-y-6">
            <div id="booking" className="lg:sticky top-24 space-y-5">
              <TourBookingWidget tourId={tour.id} basePrice={tour.price} timeSlots={timeSlots} />
              <div className="rounded-[16px] border border-[#F1F5F9] bg-white/0 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Proveedor</p>
                <p className="mt-2 text-[16px] font-semibold text-slate-900">
                  {tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Local partner"}
                </p>
                <p className="text-sm text-slate-600">Certified by Proactivitis.</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <ReserveFloatingButton targetId="booking" priceLabel={priceLabel} />
    </div>
  );
}
