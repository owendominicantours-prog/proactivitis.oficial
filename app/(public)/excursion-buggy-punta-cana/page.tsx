import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_LOCALBUSINESS, PROACTIVITIS_URL, getPriceValidUntil } from "@/lib/seo";

const PAGE_URL = `${PROACTIVITIS_URL}/excursion-buggy-punta-cana`;
const PAGE_TITLE = "Buggy Punta Cana | Tour en Buggy con Playa, Cueva y Aventura - Proactivitis";
const PAGE_DESCRIPTION =
  "Reserva tu tour en buggy en Punta Cana con Proactivitis. Incluye playa Macao, cueva, cultura local y aventura off road. ¡Plazas limitadas!";

const H1 = "Buggy Punta Cana: La Experiencia Más Divertida de tus Vacaciones";
const HERO_SUBTITLE = "Aventura, barro, playa y cultura en un solo tour.";
const HERO_DESCRIPTION =
  "Conduce tu propio buggy, atraviesa caminos de barro, visita Playa Macao y báñate en una cueva natural.";

const PRIMARY_BUGGY_SLUG = "tour-en-buggy-en-punta-cana";
const SECONDARY_BUGGY_SLUG = "excursion-en-buggy-y-atv-en-punta-cana";
const DEFAULT_IMAGE = "/fototours/fototour.jpeg";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: "Proactivitis",
    type: "website",
    locale: "es_DO"
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION
  }
};

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    const parsed = JSON.parse(gallery);
    return Array.isArray(parsed) ? parsed.map((value) => String(value)).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const toImageList = (heroImage?: string | null, gallery?: string | null) => {
  const parsed = parseGallery(gallery);
  const images = [heroImage, ...parsed].filter((value): value is string => Boolean(value));
  return Array.from(new Set(images)).slice(0, 8);
};

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return `${PROACTIVITIS_URL}${DEFAULT_IMAGE}`;
  if (value.startsWith("http")) return value;
  return `${PROACTIVITIS_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

export default async function BuggyPuntaCanaLandingPage() {
  const buggyTours = await prisma.tour.findMany({
    where: {
      status: "published",
      OR: [
        { slug: { in: [PRIMARY_BUGGY_SLUG, SECONDARY_BUGGY_SLUG] } },
        { title: { contains: "buggy", mode: "insensitive" } },
        { title: { contains: "atv", mode: "insensitive" } },
        { slug: { contains: "buggy" } },
        { slug: { contains: "atv" } }
      ]
    },
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      price: true,
      heroImage: true,
      gallery: true
    },
    orderBy: [{ slug: "asc" }],
    take: 6
  });

  const primaryTour =
    buggyTours.find((tour) => tour.slug === PRIMARY_BUGGY_SLUG) ??
    buggyTours.find((tour) => tour.slug === SECONDARY_BUGGY_SLUG) ??
    buggyTours[0] ??
    null;

  const heroImage = primaryTour?.heroImage ?? DEFAULT_IMAGE;
  const galleryImages = Array.from(
    new Set(
      buggyTours
        .flatMap((tour) => toImageList(tour.heroImage, tour.gallery))
        .filter(Boolean)
    )
  ).slice(0, 6);

  const reserveHref = primaryTour ? `/tours/${primaryTour.slug}` : "/tours";
  const secondaryHref = `${reserveHref}#booking`;
  const imageObjects = (galleryImages.length ? galleryImages : [DEFAULT_IMAGE]).map((image) => ({
    "@type": "ImageObject",
    contentUrl: toAbsoluteUrl(image)
  }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Necesito experiencia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. El tour está pensado para viajeros sin experiencia previa. Antes de salir recibes indicaciones básicas y equipo de seguridad."
        }
      },
      {
        "@type": "Question",
        name: "¿Me ensuciaré?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Parte de la experiencia es conducir por rutas de barro y caminos off road, por lo que es normal terminar con lodo."
        }
      },
      {
        "@type": "Question",
        name: "¿Incluye transporte?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Incluye recogida y regreso desde hoteles en Punta Cana y Bávaro según disponibilidad operativa."
        }
      },
      {
        "@type": "Question",
        name: "¿Dónde es el tour?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La experiencia se realiza en la zona de Punta Cana con rutas rurales, parada en Playa Macao, cueva o cenote y visitas locales."
        }
      },
      {
        "@type": "Question",
        name: "¿Qué debo llevar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ropa cómoda, gafas, protector solar, cambio de ropa y dinero extra si quieres comprar productos locales o fotos."
        }
      },
      {
        "@type": "Question",
        name: "¿Es seguro?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Se realiza con guías profesionales, briefing inicial y equipo de seguridad incluido."
        }
      }
    ]
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: H1,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    provider: PROACTIVITIS_LOCALBUSINESS,
    image: imageObjects.map((item) => item.contentUrl),
    touristType: ["Parejas", "Amigos", "Familias", "Aventura"],
    offers: {
      "@type": "Offer",
      url: reserveHref.startsWith("http") ? reserveHref : `${PROACTIVITIS_URL}${reserveHref}`,
      priceCurrency: "USD",
      price: primaryTour?.price ?? 40,
      availability: "https://schema.org/InStock",
      priceValidUntil: getPriceValidUntil()
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white">
      <StructuredData data={pageSchema} />
      <StructuredData data={faqSchema} />

      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Buggy en Punta Cana sobre barro y arena"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.76)_55%,rgba(15,15,16,0.96)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,0.38),transparent_35%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[88svh] max-w-7xl flex-col justify-between px-5 pb-24 pt-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-lg font-black uppercase tracking-[0.28em] text-white">
              Proactivitis
            </Link>
            <Link
              href={secondaryHref}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white backdrop-blur transition hover:bg-white hover:text-[#0F0F10]"
            >
              Ver disponibilidad
            </Link>
          </div>

          <div className="max-w-3xl py-14 sm:py-20">
            <span className="inline-flex rounded-full border border-[#FF7A00]/40 bg-[#FF7A00]/20 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-[#FFD08A]">
              Aventura off road en Punta Cana
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">
              {H1}
            </h1>
            <p className="mt-5 text-xl font-semibold text-[#FFD08A] sm:text-2xl">{HERO_SUBTITLE}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">{HERO_DESCRIPTION}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={reserveHref}
                className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#FF7A00] px-7 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-[#ff8e28]"
              >
                Reservar Ahora
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-7 text-sm font-black uppercase tracking-[0.22em] text-white backdrop-blur transition hover:bg-white hover:text-[#0F0F10]"
              >
                Ver Disponibilidad
              </Link>
            </div>

            <div className="mt-8 grid gap-3 text-sm font-semibold text-white/85 sm:grid-cols-3">
              {[
                "Incluye transporte",
                "No necesitas experiencia",
                "Ideal para parejas, amigos y familias"
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur">
                  <span className="text-[#FFB347]">✔</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-[#18181B] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#FFB347]">Experiencia completa</p>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
              Esto no es un tour: es una aventura completa
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-white/78">
              <p>
                Aquí no vienes solo a manejar. Vienes a sentir la adrenalina real de Punta Cana: motor, barro, curvas,
                polvo, agua y paisajes que cambian en cada parada.
              </p>
              <p>
                Conduces tu propio buggy por caminos off road, atraviesas zonas llenas de lodo, paras en Playa Macao,
                entras a una cueva o cenote natural y visitas plantaciones donde pruebas café y cacao dominicano.
              </p>
              <p>
                Es una mezcla de velocidad, naturaleza, cultura local y ese tipo de experiencia que se recuerda más que
                una excursión normal.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              "Conduces tu propio buggy",
              "Caminos off road llenos de barro",
              "Parada en Playa Macao",
              "Baño en cueva o cenote",
              "Visita a plantaciones de café y cacao",
              "Contacto con cultura local"
            ].map((item) => (
              <div key={item} className="rounded-[28px] border border-[#FF7A00]/20 bg-[#1E1E21] p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF7A00]">Buggy Tour</p>
                <p className="mt-2 text-lg font-semibold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#151518]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">¿Qué incluye tu tour en buggy?</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              "Transporte desde tu hotel",
              "Buggy para 2 o 4 personas",
              "Guía profesional",
              "Equipo de seguridad",
              "Paradas en playa, cueva y zonas rurales",
              "Degustación de productos locales"
            ].map((item) => (
              <article key={item} className="rounded-[26px] border border-white/10 bg-[#202024] p-5">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF7A00] text-xl font-black text-white">
                  +
                </span>
                <p className="mt-4 text-lg font-semibold text-white">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-white sm:text-4xl">Información clave</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Duración", value: "3 a 5 horas" },
            { label: "Precio", value: "Desde $40 USD" },
            { label: "Edad mínima", value: "18+ para conducir" },
            { label: "Disponibilidad", value: "Todos los días" }
          ].map((item) => (
            <div key={item.label} className="rounded-[28px] border border-[#FF7A00]/20 bg-[linear-gradient(180deg,#1E1E21_0%,#141416_100%)] p-6">
              <p className="text-xs font-black uppercase tracking-[0.34em] text-[#FFB347]">{item.label}</p>
              <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#141416]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Experiencias destacadas</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Buggy + Playa Macao",
              "Buggy + Cueva Natural",
              "Ruta Off Road Extrema",
              "Experiencia Completa Dominicana"
            ].map((item, index) => (
              <div key={item} className="overflow-hidden rounded-[28px] border border-white/10 bg-[#1C1C20]">
                <div className="h-2 bg-[#FF7A00]" />
                <div className="p-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FFB347]">Ruta {index + 1}</p>
                  <h3 className="mt-3 text-xl font-black text-white">{item}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/75">
                    Pensado para viajeros que quieren barro, fotos potentes y una experiencia de buggy que se sienta
                    completa de principio a fin.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#FFB347]">Galería</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Mira lo que te espera</h2>
          </div>
          <Link
            href={reserveHref}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-white transition hover:border-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
          >
            Reservar Ahora
          </Link>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {(
            galleryImages.length
              ? galleryImages
              : [DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE]
          ).map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`relative overflow-hidden rounded-[26px] border border-white/10 bg-[#1D1D20] ${
                index === 0 ? "md:col-span-2 md:min-h-[420px]" : "min-h-[200px]"
              }`}
            >
              <Image
                src={image}
                alt={`Buggy Punta Cana galería ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4 text-sm font-semibold text-white">
                {["Barro", "Buggies", "Playa", "Cuevas", "Aventura", "Viajeros disfrutando"][index] ?? "Experiencia"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#161619]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Esto dicen los viajeros</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              "Nos llenamos de barro y fue lo mejor del viaje",
              "Mucho mejor de lo que esperaba",
              "Lo recomiendo 100% si vienes a Punta Cana"
            ].map((quote, index) => (
              <article key={quote} className="rounded-[28px] border border-white/10 bg-[#202024] p-6">
                <div className="text-2xl text-[#FF7A00]">★★★★★</div>
                <p className="mt-4 text-lg font-semibold text-white">“{quote}”</p>
                <p className="mt-4 text-sm text-white/65">Viajero verificado #{index + 1}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[36px] border border-[#FF7A00]/30 bg-[linear-gradient(135deg,#FF7A00_0%,#C64E00_100%)] p-8 shadow-[0_30px_80px_rgba(255,122,0,0.22)] sm:p-12">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-white/75">Urgencia</p>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
            Las plazas se llenan rápido en temporada alta
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/85 sm:text-lg">
            Reserva ahora y asegura tu lugar en uno de los tours más populares de Punta Cana.
          </p>
          <div className="mt-8">
            <Link
              href={reserveHref}
              className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#111214] px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-black"
            >
              Reservar Ahora
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-white sm:text-4xl">Preguntas frecuentes</h2>
        <div className="mt-8 space-y-4">
          {[
            {
              q: "¿Necesito experiencia?",
              a: "No. El tour está pensado para principiantes y se explica todo antes de salir."
            },
            {
              q: "¿Me ensuciaré?",
              a: "Sí. La gracia del recorrido es precisamente el barro y el terreno off road."
            },
            {
              q: "¿Incluye transporte?",
              a: "Sí. Incluye recogida desde hoteles seleccionados de Punta Cana y Bávaro."
            },
            {
              q: "¿Dónde es el tour?",
              a: "En la zona de Punta Cana, con rutas que incluyen playa, cueva, zonas rurales y cultura local."
            },
            {
              q: "¿Qué debo llevar?",
              a: "Ropa cómoda, gafas, protector solar, toalla, traje de baño y cambio de ropa."
            },
            {
              q: "¿Es seguro?",
              a: "Sí. Se realiza con guías, equipo de seguridad y briefing previo."
            }
          ].map((item) => (
            <article key={item.q} className="rounded-[26px] border border-white/10 bg-[#1A1A1D] p-6">
              <h3 className="text-lg font-black text-white">{item.q}</h3>
              <p className="mt-3 text-base leading-8 text-white/75">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/30 px-5 py-10 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-black uppercase tracking-[0.24em] text-white">Proactivitis</p>
        <p className="mt-3 text-sm text-white/60">© 2026 Proactivitis. Todos los derechos reservados.</p>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0F0F10]/95 p-3 backdrop-blur md:hidden">
        <Link
          href={reserveHref}
          className="flex min-h-14 items-center justify-center rounded-2xl bg-[#FF7A00] text-sm font-black uppercase tracking-[0.22em] text-white"
        >
          Reservar Ahora
        </Link>
      </div>
    </div>
  );
}
