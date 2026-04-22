import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import ReserveFloatingButton from "@/components/shared/ReserveFloatingButton";
import TourGalleryViewer from "@/components/shared/TourGalleryViewer";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import { parseAdminItinerary, parseItinerary, type ItineraryStop } from "@/lib/itinerary";
import { prisma } from "@/lib/prisma";

type TourDetailProps = {
  params: Promise<{
    slug?: string;
  }>;
};

type PersistedTimeSlot = {
  hour: number;
  minute: string;
  period: "AM" | "PM";
};

const SITE_URL = "https://proactivitis.com";
const DEFAULT_IMAGE = "/fototours/fotosimple.jpg";

const parseJsonArray = <T,>(value?: string | null): T[] => {
  if (!value) return [];
  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
};

const parseDuration = (value?: string | null) => {
  if (!value) return { value: "4", unit: "horas" };
  try {
    return JSON.parse(value) as { value: string; unit: string };
  } catch {
    return { value, unit: "" };
  }
};

const formatDurationLabel = (value?: string | null) => {
  const parsed = parseDuration(value);
  return `${parsed.value}${parsed.unit ? ` ${parsed.unit}` : ""}`.trim();
};

const formatTimeSlot = (slot: PersistedTimeSlot) => {
  const minute = slot.minute.padStart(2, "0");
  return `${slot.hour.toString().padStart(2, "0")}:${minute} ${slot.period}`;
};

const parseGallery = (gallery?: string | null, heroImage?: string | null) => {
  if (gallery) {
    try {
      const parsed = JSON.parse(gallery) as unknown[];
      const urls = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      if (urls.length) return urls;
    } catch {
      // ignore malformed gallery JSON
    }
  }
  return [heroImage ?? DEFAULT_IMAGE];
};

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return `${SITE_URL}${DEFAULT_IMAGE}`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const buildVisibleFaqs = ({
  title,
  includes,
  durationLabel,
  pickup,
  language,
  minAge,
  physicalLevel
}: {
  title: string;
  includes: string[];
  durationLabel: string;
  pickup?: string | null;
  language?: string | null;
  minAge?: number | null;
  physicalLevel?: string | null;
}) => [
  {
    question: `Que incluye ${title}?`,
    answer: includes.length
      ? `${title} incluye ${includes.join(", ")}.`
      : `${title} incluye los servicios confirmados en tu reserva.`
  },
  {
    question: "Cuanto dura la experiencia?",
    answer: `La actividad dura aproximadamente ${durationLabel}.`
  },
  {
    question: "Hay pickup o punto de encuentro?",
    answer: pickup?.trim() || "El punto de encuentro se confirma antes de la salida."
  },
  {
    question: "En que idiomas opera el tour?",
    answer: language?.trim() || "El idioma de la operacion se confirma al reservar."
  },
  {
    question: "Que nivel fisico o edad minima se recomienda?",
    answer: `El nivel recomendado es ${physicalLevel ?? "moderado"} y la edad minima indicada es ${
      minAge ?? "segun la operacion"
    }.`
  }
];

async function getPublishedTourBySlug(slug: string) {
  return prisma.tour.findFirst({
    where: { slug, status: "published" },
    include: {
      SupplierProfile: {
        include: {
          User: {
            select: { name: true }
          }
        }
      },
      departureDestination: {
        include: {
          country: true
        }
      }
    }
  });
}

export async function generateMetadata({ params }: TourDetailProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return {};

  const tour = await getPublishedTourBySlug(slug);
  if (!tour) return {};

  const canonical = `${SITE_URL}/tours/${tour.slug}`;
  const description =
    tour.shortDescription?.trim() ||
    tour.description?.trim().slice(0, 160) ||
    `Reserva ${tour.title} en Proactivitis.`;
  const title = `${tour.title} | Proactivitis`;
  const image = toAbsoluteUrl(tour.heroImage);

  return {
    title,
    description,
    alternates: {
      canonical
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "Proactivitis",
      locale: "es_DO",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: tour.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export default async function TourDetailPage({ params }: TourDetailProps) {
  const { slug } = await params;
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
      },
      departureDestination: {
        include: {
          country: true
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

  const gallery = parseGallery(tour.gallery, tour.heroImage);
  const heroImage = tour.heroImage ?? gallery[0] ?? DEFAULT_IMAGE;
  const includes = tour.includes
    ? tour.includes
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const excludes = ["Propinas", "Fotos o videos opcionales", "Extras no detallados"];
  const languages = (tour.language ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const categories = (tour.category ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const durationLabel = formatDurationLabel(tour.duration);
  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const departureTime = timeSlots.length ? formatTimeSlot(timeSlots[0]) : "Por confirmar";
  const parsedAdminItinerary = parseAdminItinerary(tour.adminNote ?? "");
  const parsedItinerary = parsedAdminItinerary.length ? parsedAdminItinerary : parseItinerary(tour.adminNote ?? "");
  const itinerary: ItineraryStop[] =
    parsedItinerary.length > 0
      ? parsedItinerary
      : [
          {
            time: "Salida",
            title: "Inicio de la experiencia",
            description: "Recogida o encuentro segun la coordinacion final."
          },
          {
            time: "Actividad",
            title: "Desarrollo del tour",
            description: "Experiencia guiada con paradas y puntos destacados del recorrido."
          },
          {
            time: "Regreso",
            title: "Cierre de la actividad",
            description: "Fin del servicio y retorno al hotel o punto acordado."
          }
        ];
  const shortTeaser =
    tour.shortDescription?.trim() ||
    tour.description?.trim().slice(0, 220) ||
    "Experiencia guiada con soporte local y reserva online.";
  const priceLabel = tour.price > 0 ? `$${tour.price.toFixed(0)} USD` : "Precio por confirmar";
  const faqs = buildVisibleFaqs({
    title: tour.title,
    includes,
    durationLabel,
    pickup: tour.pickup,
    language: tour.language,
    minAge: tour.minAge,
    physicalLevel: tour.physicalLevel
  });
  const canonicalUrl = `${SITE_URL}/tours/${tour.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Proactivitis",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.png`
        },
        image: `${SITE_URL}/logo.png`,
        email: "info@proactivitis.com",
        telephone: "+1-809-394-9877",
        description:
          "Proactivitis es una plataforma de experiencias, tours y traslados con reservas directas y soporte local."
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Proactivitis",
        publisher: {
          "@id": `${SITE_URL}/#organization`
        },
        inLanguage: "es"
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: tour.title,
        isPartOf: {
          "@id": `${SITE_URL}/#website`
        },
        description: shortTeaser,
        primaryImageOfPage: {
          "@id": `${canonicalUrl}#primaryimage`
        },
        breadcrumb: {
          "@id": `${canonicalUrl}#breadcrumb`
        },
        inLanguage: "es"
      },
      {
        "@type": "ImageObject",
        "@id": `${canonicalUrl}#primaryimage`,
        url: toAbsoluteUrl(heroImage),
        contentUrl: toAbsoluteUrl(heroImage),
        name: tour.title
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: SITE_URL
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tours",
            item: `${SITE_URL}/tours`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tour.title,
            item: canonicalUrl
          }
        ]
      },
      {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        name: tour.title,
        serviceType: categories[0] || "Tour",
        provider: {
          "@id": `${SITE_URL}/#organization`
        },
        areaServed: tour.departureDestination?.name || tour.location,
        availableLanguage: languages.length ? languages : ["es"],
        description: shortTeaser,
        audience: {
          "@type": "Audience",
          audienceType: "Travelers"
        },
        offers: tour.price > 0 ? { "@id": `${canonicalUrl}#offer` } : undefined
      },
      {
        "@type": "TouristTrip",
        "@id": `${canonicalUrl}#trip`,
        name: tour.title,
        description: tour.description,
        touristType: "Travelers",
        provider: {
          "@id": `${SITE_URL}/#organization`
        },
        itinerary: itinerary.map((stop, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: stop.title,
          description: stop.description ?? stop.title
        })),
        offers: tour.price > 0 ? { "@id": `${canonicalUrl}#offer` } : undefined
      },
      ...(tour.price > 0
        ? [
            {
              "@type": "Offer",
              "@id": `${canonicalUrl}#offer`,
              url: canonicalUrl,
              priceCurrency: "USD",
              price: tour.price.toFixed(2),
              availability: "https://schema.org/InStock",
              category: categories[0] || "Tour",
              itemOffered: {
                "@id": `${canonicalUrl}#service`
              }
            }
          ]
        : []),
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 pb-24 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="grid overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_30px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[1.1fr,0.9fr]">
          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-12">
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
              <span className="rounded-full bg-sky-50 px-3 py-1">{tour.location}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{durationLabel}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{languages.join(" / ") || "Idioma por confirmar"}</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {tour.title}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{shortTeaser}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Desde</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{priceLabel}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Salida</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{departureTime}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Proveedor</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {tour.SupplierProfile?.company ?? "Proveedor local"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#booking"
                className="inline-flex items-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Reservar ahora
              </Link>
              <Link
                href="#details"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Ver detalles
              </Link>
            </div>
          </div>

          <div className="relative min-h-[320px] bg-slate-100 lg:min-h-full">
            <Image
              src={heroImage}
              alt={tour.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <main className="mx-auto mt-10 grid max-w-6xl gap-8 px-4 lg:grid-cols-[minmax(0,1fr),360px]">
        <div className="space-y-8">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <TourGalleryViewer
              images={gallery.map((image, index) => ({
                url: image,
                label: `${tour.title} ${index + 1}`
              }))}
            />
          </section>

          <section id="details" className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Resumen</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Vista general del tour</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{tour.description || shortTeaser}</p>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Informacion clave</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Datos operativos</h2>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Listo para reservar</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Duracion", value: durationLabel },
                { label: "Ubicacion", value: tour.location || "Por confirmar" },
                { label: "Idiomas", value: languages.join(", ") || "Por confirmar" },
                { label: "Capacidad", value: `${tour.capacity ?? 0} personas`.replace(/^0 personas$/, "Segun operacion") },
                { label: "Edad minima", value: tour.minAge ? `${tour.minAge}+` : "Consultar" },
                { label: "Nivel fisico", value: tour.physicalLevel ?? "Moderado" },
                { label: "Confirmacion", value: tour.confirmationType ?? "Segun disponibilidad" },
                { label: "Pickup", value: tour.pickup?.trim() || "Se confirma al reservar" }
              ].map((item) => (
                <article key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Incluye y no incluye</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Incluye</p>
                <ul className="mt-4 space-y-3">
                  {includes.length ? (
                    includes.map((item) => (
                      <li key={item} className="flex gap-3 text-sm text-slate-700">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-600">Se detalla al confirmar la reserva.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-700">No incluye</p>
                <ul className="mt-4 space-y-3">
                  {excludes.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-slate-700">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Itinerario</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Paso a paso</h2>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Operacion</span>
            </div>
            <div className="mt-6 space-y-4">
              {itinerary.map((stop, index) => (
                <article key={`${stop.title}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                      {stop.time || `Paso ${index + 1}`}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-950">{stop.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{stop.description || "Detalle por confirmar."}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">FAQ</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Preguntas frecuentes</h2>
            <div className="mt-5 space-y-4">
              {faqs.map((item) => (
                <article key={item.question} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-950">{item.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div id="booking" className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Reserva</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Confirma tu fecha</h2>
            <TourBookingWidget
              tourId={tour.id}
              basePrice={tour.price}
              timeSlots={timeSlots}
              supplierHasStripeAccount={Boolean(tour.SupplierProfile?.stripeAccountId)}
              platformSharePercent={tour.platformSharePercent ?? 20}
              tourTitle={tour.title}
              tourImage={heroImage}
            />
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">
                {tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Proveedor local"}
              </p>
              <p className="mt-1">Operado en {tour.departureDestination?.name || tour.location || "el destino seleccionado"}.</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Politicas</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Requisitos y notas</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>{tour.requirements?.trim() || "Sigue las indicaciones del operador y lleva documento valido si aplica."}</p>
              <p>{tour.cancellationPolicy?.trim() || "Las condiciones de cancelacion se confirman antes del pago."}</p>
              {tour.terms?.trim() ? <p>{tour.terms.trim()}</p> : null}
            </div>
          </div>
        </aside>
      </main>

      <ReserveFloatingButton targetId="booking" priceLabel={priceLabel} />
    </div>
  );
}
