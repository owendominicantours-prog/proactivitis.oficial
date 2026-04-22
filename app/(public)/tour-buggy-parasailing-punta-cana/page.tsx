import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

const SITE_URL = "https://proactivitis.com";
const LANDING_PATH = "/tour-buggy-parasailing-punta-cana";
const TOUR_SLUG = "tour-buggy-parasailing-punta-cana";
const DEFAULT_IMAGE = "/fototours/fotosimple.jpg";

const keywordClusters = [
  "buggy parasailing punta cana",
  "buggy and parasailing punta cana",
  "parasailing and buggy punta cana",
  "punta cana buggy combo",
  "buggy playa macao parasailing"
];

const highlights = [
  "Ruta en buggy por caminos de barro y zonas rurales",
  "Parada en cenote o cueva natural para refrescarte",
  "Vuelo de parasailing con vistas sobre Bávaro",
  "Transporte incluido desde hoteles de Punta Cana"
];

const includedItems = [
  "Recogida y regreso a tu hotel en transporte climatizado",
  "Guía profesional durante la experiencia",
  "Buggy compartido o individual según reserva",
  "Vuelo de 10 a 15 minutos en parasailing",
  "Chaleco salvavidas y equipo de seguridad",
  "Degustación de café, cacao y productos locales",
  "Agua embotellada durante la actividad"
];

const excludedItems = [
  "Fotos y videos",
  "Propinas",
  "Pañuelos o gafas para el barro"
];

const timeline = [
  {
    label: "1. Pickup",
    title: "Recogida en tu hotel",
    description: "El operador coordina la salida desde hoteles de Punta Cana y Bávaro para comenzar la jornada sin complicaciones."
  },
  {
    label: "2. Off-road",
    title: "Ruta en buggy con barro y paisaje rural",
    description: "Conduces por senderos de tierra, zonas de lodo y caminos donde se siente la parte más auténtica y salvaje del destino."
  },
  {
    label: "3. Cenote",
    title: "Parada en cueva o cenote natural",
    description: "Después del recorrido en buggy llega uno de los momentos más buscados: un baño refrescante en aguas subterráneas."
  },
  {
    label: "4. Macao",
    title: "Vista de Playa Macao",
    description: "La experiencia buggy se conecta con uno de los paisajes más conocidos del área antes de pasar al tramo aéreo."
  },
  {
    label: "5. Parasailing",
    title: "Vuelo panorámico sobre el Caribe",
    description: "Subes al parasailing para ver la costa de Bávaro desde arriba con una sensación completamente distinta a la del buggy."
  }
];

const faqs = [
  {
    question: "¿Este combo incluye buggy y parasailing el mismo día?",
    answer:
      "Sí. La experiencia está pensada como un combo en una sola jornada para viajeros que quieren combinar aventura en tierra y vistas panorámicas sobre el mar."
  },
  {
    question: "¿Necesito experiencia para conducir el buggy o hacer parasailing?",
    answer:
      "No. Es una actividad orientada a viajeros sin experiencia previa. El operador ofrece instrucciones y equipo antes de comenzar."
  },
  {
    question: "¿Incluye transporte desde el hotel?",
    answer:
      "Sí. El tour se comercializa con recogida y regreso desde hoteles de Punta Cana y Bávaro."
  },
  {
    question: "¿Qué debo llevar para esta excursión?",
    answer:
      "Lleva ropa que se pueda ensuciar, traje de baño, toalla, protector solar y calzado cerrado. Para el tramo buggy conviene considerar gafas o pañuelo."
  },
  {
    question: "¿Es apto para todo el mundo?",
    answer:
      "No se recomienda para embarazadas ni para personas con cirugías recientes de espalda o cuello. Para conducir el buggy se requiere ser mayor de edad."
  }
];

const normalizeIncludes = (value?: string | null) =>
  value
    ? value
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return `${SITE_URL}${DEFAULT_IMAGE}`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

async function getLandingTour() {
  return prisma.tour.findUnique({
    where: { slug: TOUR_SLUG },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
        take: 6
      }
    }
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const tour = await getLandingTour();
  if (!tour) return {};

  const canonical = `${SITE_URL}${LANDING_PATH}`;
  const title = "Buggy + Parasailing Punta Cana | Cenote, Playa Macao y Aventura Aérea";
  const description =
    "Reserva el combo de buggy + parasailing en Punta Cana. Recorre caminos de barro, visita cenote y Playa Macao, y vuela sobre Bávaro con transporte incluido.";
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
          alt: "Buggy y parasailing en Punta Cana"
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

export default async function BuggyParasailingLandingPage() {
  const tour = await getLandingTour();
  if (!tour) notFound();

  const canonicalUrl = `${SITE_URL}${LANDING_PATH}`;
  const bookingUrl = `${SITE_URL}/tours/${tour.slug}`;
  const heroImage = toAbsoluteUrl(tour.heroImage);
  const includes = normalizeIncludes(tour.includes);
  const approvedReviews = tour.reviews ?? [];
  const averageRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length
      : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Proactivitis",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        image: `${SITE_URL}/logo.png`,
        email: "info@proactivitis.com",
        telephone: "+1-809-394-9877"
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
        name: "Buggy + Parasailing Punta Cana",
        isPartOf: {
          "@id": `${SITE_URL}/#website`
        },
        description:
          "Landing SEO del combo buggy + parasailing en Punta Cana con cenote, Playa Macao y reserva online.",
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
        url: heroImage,
        contentUrl: heroImage,
        name: "Buggy + Parasailing Punta Cana"
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
            name: "Buggy + Parasailing Punta Cana",
            item: canonicalUrl
          }
        ]
      },
      {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        name: "Buggy + Parasailing Punta Cana",
        serviceType: "Adventure tour combo",
        provider: {
          "@id": `${SITE_URL}/#organization`
        },
        areaServed: "Punta Cana",
        availableLanguage: ["es", "en"],
        description:
          "Excursión combinada con buggy off-road, cenote, Playa Macao y vuelo en parasailing sobre Bávaro.",
        offers: {
          "@id": `${canonicalUrl}#offer`
        },
        aggregateRating:
          averageRating !== null
            ? {
                "@type": "AggregateRating",
                ratingValue: averageRating.toFixed(1),
                reviewCount: approvedReviews.length
              }
            : undefined
      },
      {
        "@type": "TouristTrip",
        "@id": `${canonicalUrl}#trip`,
        name: "Tour Buggy + Parasailing en Punta Cana",
        description:
          "Experiencia combinada de aventura en tierra y aire con cenote, Playa Macao y vuelo panorámico sobre la costa.",
        touristType: "Travelers",
        provider: {
          "@id": `${SITE_URL}/#organization`
        },
        offers: {
          "@id": `${canonicalUrl}#offer`
        }
      },
      {
        "@type": "Offer",
        "@id": `${canonicalUrl}#offer`,
        url: bookingUrl,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        itemOffered: {
          "@id": `${canonicalUrl}#service`
        }
      },
      ...approvedReviews.map((review) => ({
        "@type": "Review",
        "@id": `${canonicalUrl}#review-${review.id}`,
        author: {
          "@type": "Person",
          name: review.customerName
        },
        datePublished: (review.approvedAt ?? review.createdAt).toISOString().slice(0, 10),
        reviewBody: review.body,
        headline: review.title || undefined,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5
        },
        itemReviewed: {
          "@id": `${canonicalUrl}#service`
        }
      })),
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="relative overflow-hidden border-b border-black/5 bg-[radial-gradient(circle_at_top_left,_rgba(243,115,53,0.18),_transparent_32%),linear-gradient(135deg,#f7f4ee_0%,#f4efe2_48%,#e6f0f4_100%)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {keywordClusters.slice(0, 3).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#c15b24]">Punta Cana Adventure Combo</p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
                Buggy + Parasailing Punta Cana: barro, cenote, Playa Macao y vistas sobre el Caribe
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                Esta landing está pensada para quienes buscan una excursión de buggy + parasailing en Punta Cana que combine
                aventura en tierra, pausa en cenote natural y vuelo panorámico sobre la costa de Bávaro en una sola salida.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-black/8 bg-white/80 px-4 py-4 text-sm text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/tours/${tour.slug}`}
                className="inline-flex items-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
              >
                Reservar ahora
              </Link>
              <Link
                href="#seo-faq"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
              >
                Ver disponibilidad
              </Link>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-[32px] border border-black/10 bg-slate-100 shadow-[0_35px_90px_rgba(15,23,42,0.12)]">
            <Image src={tour.heroImage || DEFAULT_IMAGE} alt={tour.title} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/75">Combo más buscado</p>
              <p className="mt-2 text-2xl font-semibold">{tour.title}</p>
              <p className="mt-2 max-w-md text-sm text-white/80">
                Diseñado para viajeros que quieren combinar adrenalina, paisaje costero y reserva directa con Proactivitis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <section className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
          <article className="rounded-[30px] border border-black/8 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Intención comercial</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Una excursión pensada para convertir búsquedas de alto valor</h2>
            <div className="mt-5 space-y-4 text-sm leading-8 text-slate-700">
              <p>
                Si alguien busca <strong>buggy parasailing Punta Cana</strong>, normalmente no quiere leer una ficha genérica:
                quiere saber si el combo realmente vale la pena, si incluye transporte, si el tramo buggy es auténtico y si el
                parasailing se siente seguro. Esta página responde esa intención de forma directa y orientada a reserva.
              </p>
              <p>
                El mayor diferencial de esta experiencia es el contraste. Primero conduces por tramos de tierra, barro y zonas
                rurales donde el recorrido se siente más real que una actividad montada solo para fotos. Después cambias por
                completo de ritmo para subir al parasailing y ver la costa desde arriba con una sensación mucho más relajada.
              </p>
              <p>
                Eso convierte este combo en una propuesta fuerte para viajeros que quieren más que una sola actividad: quieren
                una jornada completa, escaneable, fácil de reservar y con suficiente variedad como para justificar el clic y la compra.
              </p>
            </div>
          </article>

          <article className="rounded-[30px] border border-black/8 bg-[#13232d] p-7 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Quick facts</p>
            <div className="mt-5 grid gap-4">
              {[
                { label: "Duración", value: "Aprox. 4 a 5 horas" },
                { label: "Zona", value: "Punta Cana, Playa Macao y Bávaro" },
                { label: "Incluye", value: "Buggy + cenote + parasailing + pickup" },
                { label: "Ideal para", value: "Parejas, amigos y viajeros activos" }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-[30px] border border-black/8 bg-white p-7 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Qué incluye</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Qué resuelve este combo mejor que reservar actividades separadas</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(includes.length ? includes : includedItems).map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
            {excludedItems.map((item) => (
              <div key={item} className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-sm leading-7 text-slate-700">
                No incluye: {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
          <article className="rounded-[30px] border border-black/8 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Ruta SEO</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Buggy off-road, cenote natural y vuelo sobre Bávaro</h2>
            <div className="mt-5 space-y-4 text-sm leading-8 text-slate-700">
              <p>
                El primer tramo empuja la keyword principal con contexto real: aquí no se vende un “buggy genérico” sino una
                excursión con caminos de lodo, parada para baño y conexión con Playa Macao. Eso ayuda a cubrir búsquedas como
                <strong> buggy Playa Macao Punta Cana</strong> y variaciones con cenote.
              </p>
              <p>
                El segundo tramo introduce la capa aérea. Quien busca <strong>parasailing Punta Cana</strong> suele estar comparando
                tours más simples, pero este formato combinado gana fuerza porque le da más valor a la jornada y reduce la sensación
                de comprar dos actividades separadas sin coordinación.
              </p>
              <p>
                A nivel comercial, esta página sirve para posicionar y también para derivar tráfico listo a la ficha del producto,
                donde ya tienes reserva y reseñas aprobadas.
              </p>
            </div>
          </article>

          <article className="rounded-[30px] border border-black/8 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Paso a paso</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Cómo se vive la experiencia</h2>
            <div className="mt-6 space-y-4">
              {timeline.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c15b24]">{item.label}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        {approvedReviews.length > 0 ? (
          <section className="rounded-[30px] border border-black/8 bg-white p-7 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Prueba social</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Reseñas aprobadas que refuerzan la intención de compra</h2>
              </div>
              {averageRating !== null ? (
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  {averageRating.toFixed(1)} / 5 · {approvedReviews.length} reseñas visibles
                </div>
              ) : null}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {approvedReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-950">{review.title || "Reseña"}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{review.body}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {review.customerName}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section id="seo-faq" className="rounded-[30px] border border-black/8 bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">FAQ SEO</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Preguntas frecuentes sobre buggy + parasailing en Punta Cana</h2>
          <div className="mt-6 grid gap-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-slate-950">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-700">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[34px] border border-black/8 bg-[linear-gradient(135deg,#13232d_0%,#1f3740_45%,#c15b24_100%)] p-8 text-white shadow-sm">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/65">CTA final</p>
            <h2 className="text-3xl font-semibold leading-tight">Reserva el combo de buggy + parasailing en Punta Cana antes de que cambie la disponibilidad</h2>
            <p className="text-sm leading-8 text-white/80">
              Esta landing está creada para captar tráfico comercial y llevarlo al producto real. Si ya tomaste la decisión,
              entra a la ficha del tour y completa tu reserva con Proactivitis.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/tours/${tour.slug}`}
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:bg-slate-100"
              >
                Ir al tour
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
              >
                Hablar con soporte
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
