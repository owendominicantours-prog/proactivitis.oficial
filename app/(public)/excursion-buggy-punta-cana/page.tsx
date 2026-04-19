import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import {
  PROACTIVITIS_EMAIL,
  PROACTIVITIS_LOCALBUSINESS,
  PROACTIVITIS_LOGO,
  PROACTIVITIS_PHONE,
  PROACTIVITIS_URL,
  PROACTIVITIS_WHATSAPP_LINK,
  getPriceValidUntil
} from "@/lib/seo";

const PAGE_URL = `${PROACTIVITIS_URL}/excursion-buggy-punta-cana`;
const PAGE_TITLE = "Tour Buggy Punta Cana | Playa Macao, Cueva y Aventura Off Road - Proactivitis";
const PAGE_DESCRIPTION =
  "Reserva un tour buggy en Punta Cana con playa Macao, cueva natural, caminos de barro y aventura off road. Descubre una de las excursiones mas divertidas de Republica Dominicana con Proactivitis.";
const H1 = "Tour Buggy Punta Cana: Playa Macao, Cueva y Aventura Off Road";
const SUBHEADLINE =
  "Explora caminos de barro, descubre Playa Macao y disfruta una experiencia llena de adrenalina en una de las excursiones mas buscadas de Punta Cana.";
const INTRO_COPY =
  "Si estas buscando un tour buggy en Punta Cana que combine aventura, paisajes tropicales y una experiencia local autentica, esta excursion reune algunos de los puntos mas atractivos de la zona en una sola ruta.";
const DEFAULT_IMAGE = "/fototours/fototour.jpeg";
const HERO_IMAGE_WIDTH = 1600;
const HERO_IMAGE_HEIGHT = 900;

const PRIMARY_BUGGY_SLUG = "tour-en-buggy-en-punta-cana";
const SECONDARY_BUGGY_SLUG = "excursion-en-buggy-y-atv-en-punta-cana";

const tocItems = [
  { id: "mejores-tours", label: "Mejores tours" },
  { id: "incluye", label: "Que incluye" },
  { id: "ruta", label: "Ruta del tour" },
  { id: "por-que-elegirlo", label: "Por que elegirlo" },
  { id: "precios", label: "Precios y duracion" },
  { id: "opiniones", label: "Opiniones" },
  { id: "faq", label: "FAQ" },
  { id: "reservar", label: "Reserva" }
];

const microBenefits = [
  "Incluye transporte",
  "No necesitas experiencia",
  "Playa Macao + cueva natural",
  "Ideal para parejas, amigos y familias"
];

const inclusions = [
  {
    title: "Transporte y recogida",
    copy:
      "Recogida y regreso desde hoteles seleccionados de Punta Cana y Bavaro segun disponibilidad operativa."
  },
  {
    title: "Buggy para 2 o 4 personas",
    copy:
      "Opciones compartidas o privadas segun el tour disponible, pensadas para parejas, grupos o familias que quieren ir juntos."
  },
  {
    title: "Guia profesional",
    copy:
      "Briefing previo, acompanamiento durante la ruta y apoyo local para que la experiencia sea fluida y segura."
  },
  {
    title: "Paradas en playa y cueva",
    copy:
      "La ruta suele incluir Playa Macao, una parada en cueva o cenote natural y espacios rurales donde se aprecia la cultura local."
  },
  {
    title: "Equipo y asistencia",
    copy:
      "Casco o equipo basico si aplica segun operacion. Antes de salir recibes indicaciones claras sobre la conduccion y el recorrido."
  },
  {
    title: "Experiencia rural local",
    copy:
      "En muchos recorridos se visita una zona comunitaria o de productos artesanales, con cacao, cafe o mamajuana."
  }
];

const routeSteps = [
  {
    title: "Pickup y llegada al rancho",
    copy:
      "El dia comienza con la recogida en tu hotel y el traslado hacia el punto de salida del buggy tour en Punta Cana."
  },
  {
    title: "Instrucciones de seguridad",
    copy:
      "Antes de acelerar recibes una explicacion simple sobre el vehiculo, la ruta, el ritmo del grupo y las recomendaciones basicas."
  },
  {
    title: "Conduccion por barro y dirt roads",
    copy:
      "Empieza la parte mas buscada del recorrido: caminos de tierra, zonas de barro, tramos con agua y un paisaje tropical muy distinto al de la zona hotelera."
  },
  {
    title: "Parada en Playa Macao",
    copy:
      "Macao Beach suele ser uno de los highlights del tour por su arena abierta, oleaje y ambiente mas natural que otras playas del area."
  },
  {
    title: "Cueva natural o cenote",
    copy:
      "Dependiendo de la operacion, el recorrido incluye una cueva o cenote donde puedes refrescarte y cambiar completamente el ritmo de la aventura."
  },
  {
    title: "Regreso y vuelta al hotel",
    copy:
      "Despues de las paradas y las fotos, vuelves al punto de salida para regresar a tu alojamiento con una experiencia mucho mas completa que un simple paseo."
  }
];

const differentiators = [
  "Combina aventura off road con playa, cueva y cultura local en una sola excursion.",
  "Es una actividad facil de disfrutar incluso si nunca has conducido un buggy en vacaciones.",
  "Sirve tanto para parejas como para grupos que quieren una experiencia divertida fuera del resort.",
  "La reserva es simple y puedes revisar disponibilidad antes de confirmar tu fecha.",
  "Funciona muy bien como plan de medio dia dentro de un itinerario mas amplio en Punta Cana.",
  "Ofrece fotos, barro, naturaleza y sensacion de movimiento real, algo que muchos viajeros priorizan sobre actividades mas pasivas."
];

const pricingNotes = [
  {
    label: "Precio orientativo",
    value: "Desde $40 USD",
    detail:
      "El valor final depende del tour disponible, la ocupacion del buggy, la temporada y el punto de recogida."
  },
  {
    label: "Duracion estimada",
    value: "3 a 5 horas",
    detail:
      "El tiempo total incluye transporte, check-in, briefing, recorrido y paradas durante la excursion."
  },
  {
    label: "Opciones habituales",
    value: "2 o 4 personas",
    detail:
      "Segun disponibilidad, puedes encontrar opciones compartidas, privadas o adaptadas a grupos pequenos."
  },
  {
    label: "Frecuencia",
    value: "Salidas diarias",
    detail:
      "En temporada alta la demanda sube rapido, por eso conviene revisar disponibilidad con anticipacion."
  }
];

const packingTips = [
  "Ropa comoda que pueda ensuciarse con barro o polvo.",
  "Gafas de sol o lentes protectores para los tramos de tierra.",
  "Protector solar y toalla si quieres aprovechar la parada de agua.",
  "Traje de bano y cambio de ropa para ir mas comodo al regreso.",
  "Dinero adicional si quieres comprar fotos o productos locales."
];

const faqItems = [
  {
    q: "Necesito experiencia para conducir el buggy?",
    a:
      "No. La experiencia esta pensada para principiantes. Antes de salir recibes instrucciones sencillas y el recorrido se hace con guia."
  },
  {
    q: "El tour en buggy en Punta Cana incluye transporte?",
    a:
      "Si. Normalmente incluye recogida y regreso desde hoteles de Punta Cana y Bavaro, sujeto a disponibilidad operativa."
  },
  {
    q: "Se visita Playa Macao?",
    a:
      "Si. Playa Macao es una de las paradas mas conocidas de este tipo de excursion y suele ser uno de los puntos mas valorados del recorrido."
  },
  {
    q: "Hay parada en cueva o cenote?",
    a:
      "Si. Dependiendo de la operacion del dia, el tour suele incluir una parada en cueva natural o cenote para refrescarse."
  },
  {
    q: "Que ropa debo llevar?",
    a:
      "Lo mejor es llevar ropa comoda, gafas, protector solar, traje de bano, toalla y un cambio de ropa porque es normal terminar con barro."
  },
  {
    q: "Cuanto dura la excursion?",
    a:
      "La duracion total suele estar entre 3 y 5 horas considerando traslados, check-in, briefing, recorrido y paradas."
  },
  {
    q: "Pueden ir parejas o grupos?",
    a:
      "Si. Es una actividad muy popular entre parejas, amigos y grupos pequenos, y normalmente hay opciones para 2 o 4 personas."
  },
  {
    q: "Se puede reservar online?",
    a:
      "Si. Puedes revisar disponibilidad online y avanzar con la reserva o pedir confirmacion por contacto directo antes de cerrar tu fecha."
  }
];

const primaryImageUrl = `${PROACTIVITIS_URL}${DEFAULT_IMAGE}`;

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
  const images = [heroImage, ...parseGallery(gallery)].filter((value): value is string => Boolean(value));
  return Array.from(new Set(images)).slice(0, 8);
};

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return primaryImageUrl;
  if (value.startsWith("http")) return value;
  return `${PROACTIVITIS_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const getBuggyLandingData = cache(async () => {
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
  const bookingHref = `${reserveHref}#booking`;
  const lowestPrice =
    buggyTours.map((tour) => Number(tour.price)).filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b)[0] ??
    40;

  return {
    heroImage,
    galleryImages,
    reserveHref,
    bookingHref,
    lowestPrice
  };
});

export async function generateMetadata(): Promise<Metadata> {
  const { heroImage } = await getBuggyLandingData();
  const ogImage = toAbsoluteUrl(heroImage);

  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    alternates: {
      canonical: PAGE_URL
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        maxImagePreview: "large",
        maxSnippet: -1,
        maxVideoPreview: -1
      }
    },
    openGraph: {
      type: "website",
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: PAGE_URL,
      siteName: "Proactivitis",
      locale: "es_DO",
      images: [
        {
          url: ogImage,
          width: HERO_IMAGE_WIDTH,
          height: HERO_IMAGE_HEIGHT,
          alt: H1
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      images: [ogImage]
    }
  };
}

export default async function BuggyPuntaCanaLandingPage() {
  const { heroImage, galleryImages, reserveHref, bookingHref, lowestPrice } = await getBuggyLandingData();

  const heroImageAbsolute = toAbsoluteUrl(heroImage);
  const galleryAbsolute = (galleryImages.length ? galleryImages : [DEFAULT_IMAGE]).map((image) => toAbsoluteUrl(image));

  const organizationSchema = {
    "@type": "Organization",
    "@id": `${PROACTIVITIS_URL}/#organization`,
    name: "Proactivitis",
    url: PROACTIVITIS_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${PROACTIVITIS_URL}/#logo`,
      url: PROACTIVITIS_LOGO
    },
    image: heroImageAbsolute,
    email: PROACTIVITIS_EMAIL,
    telephone: PROACTIVITIS_PHONE,
    description:
      "Proactivitis ofrece tours, actividades y experiencias seleccionadas en Republica Dominicana con enfoque en claridad de reserva y servicio al viajero.",
    sameAs: PROACTIVITIS_LOCALBUSINESS.sameAs
  };

  const websiteSchema = {
    "@type": "WebSite",
    "@id": `${PROACTIVITIS_URL}/#website`,
    url: PROACTIVITIS_URL,
    name: "Proactivitis",
    publisher: {
      "@id": `${PROACTIVITIS_URL}/#organization`
    },
    inLanguage: "es-DO"
  };

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "@id": `${PAGE_URL}/#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: PROACTIVITIS_URL
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tours",
        item: `${PROACTIVITIS_URL}/tours`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Tour Buggy Punta Cana",
        item: PAGE_URL
      }
    ]
  };

  const imageSchema = {
    "@type": "ImageObject",
    "@id": `${PAGE_URL}/#primaryimage`,
    url: heroImageAbsolute,
    contentUrl: heroImageAbsolute,
    caption: H1,
    width: HERO_IMAGE_WIDTH,
    height: HERO_IMAGE_HEIGHT
  };

  const webpageSchema = {
    "@type": "WebPage",
    "@id": `${PAGE_URL}/#webpage`,
    url: PAGE_URL,
    name: PAGE_TITLE,
    isPartOf: {
      "@id": `${PROACTIVITIS_URL}/#website`
    },
    about: {
      "@id": `${PAGE_URL}/#service`
    },
    primaryImageOfPage: {
      "@id": `${PAGE_URL}/#primaryimage`
    },
    description: PAGE_DESCRIPTION,
    inLanguage: "es-DO",
    breadcrumb: {
      "@id": `${PAGE_URL}/#breadcrumb`
    }
  };

  const offerSchema = {
    "@type": "Offer",
    "@id": `${PAGE_URL}/#offer`,
    url: reserveHref.startsWith("http") ? reserveHref : `${PROACTIVITIS_URL}${reserveHref}`,
    priceCurrency: "USD",
    price: lowestPrice,
    availability: "https://schema.org/InStock",
    validFrom: new Date().toISOString().split("T")[0],
    priceValidUntil: getPriceValidUntil(),
    category: "Adventure tour",
    eligibleRegion: "DO",
    itemOffered: {
      "@id": `${PAGE_URL}/#service`
    }
  };

  const serviceSchema = {
    "@type": "Service",
    "@id": `${PAGE_URL}/#service`,
    name: "Tour Buggy Punta Cana",
    serviceType: "Buggy tour en Punta Cana",
    provider: {
      "@id": `${PROACTIVITIS_URL}/#organization`
    },
    areaServed: [
      {
        "@type": "Place",
        name: "Punta Cana"
      },
      {
        "@type": "Place",
        name: "Bavaro"
      },
      {
        "@type": "Place",
        name: "Republica Dominicana"
      }
    ],
    audience: {
      "@type": "Audience",
      audienceType: ["Parejas", "Familias", "Grupos", "Viajeros de aventura"]
    },
    availableLanguage: ["es", "en"],
    description: PAGE_DESCRIPTION,
    offers: {
      "@id": `${PAGE_URL}/#offer`
    }
  };

  const faqSchema = {
    "@type": "FAQPage",
    "@id": `${PAGE_URL}/#faq`,
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };

  const highlightsSchema = {
    "@type": "ItemList",
    "@id": `${PAGE_URL}/#highlights`,
    itemListElement: [
      "Playa Macao",
      "Cueva natural o cenote",
      "Rutas de barro y dirt roads",
      "Recogida en hotel",
      "Experiencia local y tropical"
    ].map((name, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name
    }))
  };

  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      websiteSchema,
      imageSchema,
      breadcrumbSchema,
      webpageSchema,
      serviceSchema,
      offerSchema,
      faqSchema,
      highlightsSchema,
      {
        ...PROACTIVITIS_LOCALBUSINESS,
        "@id": `${PROACTIVITIS_URL}/#localbusiness`
      }
      // Add Review / AggregateRating only when real public reviews are shown on the page.
      // Replace operational placeholders only if a public business address becomes available.
    ]
  };

  const visibleGallery =
    galleryImages.length > 0
      ? galleryImages
      : [DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE];

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white">
      <StructuredData data={schemaGraph} />

      {/* SEO testing titles for future A/B checks:
          1. Buggy Punta Cana | Tour Off Road con Playa Macao - Proactivitis
          2. Punta Cana Buggy Tour | Reserva Tu Aventura Off Road - Proactivitis
          3. Excursion Buggy Punta Cana | Playa, Cueva y Barro - Proactivitis
          4. Best Buggy Tour in Punta Cana | Macao Beach Adventure - Proactivitis
          5. Tours en Buggy en Punta Cana | Reserva Online - Proactivitis
      */}

      <header className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Tour buggy en Punta Cana con barro, arena y paisaje tropical"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.72)_52%,rgba(13,13,15,0.98)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,125,20,0.42),transparent_34%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col px-5 pb-16 pt-7 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-black uppercase tracking-[0.34em] text-white">
              Proactivitis
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="hidden rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#101113] sm:inline-flex"
              >
                Contacto
              </Link>
              <Link
                href={bookingHref}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#101113]"
              >
                Ver disponibilidad
              </Link>
            </div>
          </div>

          <div className="grid flex-1 items-end gap-10 py-12 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-[#ff7d14]/40 bg-[#ff7d14]/18 px-4 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-[#ffd39f]">
                Punta Cana buggy tour
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">{H1}</h1>
              <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-[#ffd39f] sm:text-2xl">{SUBHEADLINE}</p>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">{INTRO_COPY}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={reserveHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#ff7d14] px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-[#ff9340]"
                >
                  Reservar ahora
                </Link>
                <Link
                  href={bookingHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-[#101113]"
                >
                  Ver disponibilidad
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm font-semibold text-white/90 sm:grid-cols-2">
                {microBenefits.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur">
                    <span className="text-[#ffb362]">+</span> {item}
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/10 bg-[rgba(15,15,18,0.78)] p-6 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-[#ffb362]">Resumen rapido</p>
              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">Precio desde</p>
                  <p className="mt-2 text-3xl font-black text-white">${lowestPrice} USD</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">Duracion</p>
                  <p className="mt-2 text-xl font-black text-white">3 a 5 horas</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">Ideal para</p>
                  <p className="mt-2 text-base font-semibold text-white">Parejas, amigos, familias y grupos pequenos</p>
                </div>
                <Link
                  href={PROACTIVITIS_WHATSAPP_LINK}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#25d366]/40 bg-[#25d366]/15 px-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#25d366] hover:text-[#0d0d0f]"
                >
                  Consultar por WhatsApp
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </header>

      <main>
        <nav aria-label="Tabla de contenidos" className="border-b border-white/10 bg-[#121216]">
          <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/85 transition hover:border-[#ff7d14] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <section id="mejores-tours" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[32px] border border-white/10 bg-[#17181c] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-9">
              <p className="text-xs font-black uppercase tracking-[0.34em] text-[#ffb362]">Pagina pilar</p>
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                Vive uno de los mejores tours en buggy en Punta Cana
              </h2>
              <p className="mt-6 text-base leading-8 text-white/80">
                Este tour buggy Punta Cana esta pensado para viajeros que no quieren limitarse al resort y buscan una
                actividad con movimiento real. La propuesta combina barro, caminos tropicales, Playa Macao, una parada
                en cueva natural y contacto con una parte mas rural de Republica Dominicana. Eso hace que la excursion
                responda muy bien a intenciones de busqueda como buggy punta cana, punta cana buggy tour, off road
                punta cana o best buggy tour in Punta Cana.
              </p>
              <p className="mt-4 text-base leading-8 text-white/80">
                A diferencia de otras actividades donde el traslado pesa mas que la experiencia, aqui la ruta es parte
                central del valor: conduces, sientes el terreno, ves paisajes distintos a la zona hotelera y tienes
                paradas que aportan fotos, descanso y contexto local. Es una opcion especialmente fuerte para viajeros
                que quieren combinar aventura, naturaleza y una excursion comercialmente clara, con precio desde, tiempo
                estimado y acceso sencillo a la reserva.
              </p>
              <p className="mt-4 text-base leading-8 text-white/80">
                Tambien funciona muy bien para quien compara ATV vs buggy. Sin entrar en una canibalizacion innecesaria,
                el buggy suele sentirse mas social, mas comodo para parejas o grupos y mejor adaptado a una ruta donde
                quieres compartir la experiencia mientras exploras Playa Macao, una cueva o cenote y caminos de tierra
                con tramos de barro.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                "Popular entre viajeros que buscan things to do in Punta Cana con intencion real de reserva.",
                "Mezcla adventure buggy Punta Cana con una narrativa clara de playa, barro y cueva.",
                "Encaja para vacaciones en pareja, family-friendly bookings y pequenos grupos.",
                "Es una excursion comercial fuerte para quienes quieren reservar online sin rodeos."
              ].map((item) => (
                <div key={item} className="rounded-[26px] border border-[#ff7d14]/20 bg-[#1c1d22] p-5">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ff7d14]">Por que destaca</h3>
                  <p className="mt-3 text-base leading-8 text-white/78">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="incluye" className="border-y border-white/10 bg-[#131419]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Que incluye esta excursion en buggy?</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/78">
              Antes de reservar conviene tener claro que esta no es una promesa vacia de aventura. La estructura del
              tour se apoya en inclusiones visibles que responden a las preguntas que mas se repiten: si hay transporte,
              si se visita Playa Macao, si existe parada de agua, si hace falta experiencia y si el recorrido realmente
              se siente off road. Estas son las bases de la experiencia.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {inclusions.map((item) => (
                <article key={item.title} className="rounded-[28px] border border-white/10 bg-[#1d1f24] p-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff7d14] text-lg font-black text-white">
                    +
                  </span>
                  <h3 className="mt-4 text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-base leading-8 text-white/75">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="ruta" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Ruta del tour: barro, Playa Macao y cueva natural
            </h2>
            <p className="mt-5 text-base leading-8 text-white/78">
              El recorrido esta construido para resolver la intencion comercial de quien busca macao buggy tour,
              excursion buggy punta cana o adventure buggy Punta Cana. No se trata solo de subir a un vehiculo, sino de
              pasar por una secuencia reconocible que combine pickup, briefing, conduccion, playa, agua y regreso sin
              sensacion de improvisacion. Esa estructura ayuda tanto a convertir como a responder mejor a Google.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {routeSteps.map((step, index) => (
              <article key={step.title} className="rounded-[28px] border border-white/10 bg-[#17181d] p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#ffb362]">Paso {index + 1}</p>
                <h3 className="mt-3 text-xl font-black text-white">{step.title}</h3>
                <p className="mt-3 text-base leading-8 text-white/75">{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="por-que-elegirlo" className="border-y border-white/10 bg-[#121318]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr,1.05fr]">
              <div>
                <h2 className="text-3xl font-black text-white sm:text-4xl">Por que elegir este buggy tour en Punta Cana</h2>
                <p className="mt-5 text-base leading-8 text-white/78">
                  La gran diferencia de esta experiencia es que une varios motivadores de reserva en una sola salida:
                  sensacion off road, playa famosa, cueva natural, paisaje tropical y un formato facil de entender para
                  quien esta comparando excursiones en Republica Dominicana. No exige experiencia previa y aun asi
                  entrega una percepcion alta de aventura.
                </p>
                <p className="mt-4 text-base leading-8 text-white/78">
                  Tambien es una muy buena opcion para quienes quieren actividades de medio dia. Si tu itinerario en
                  Punta Cana ya incluye isla, catamaran o parque, este buggy tour aporta contraste: tierra, barro,
                  adrenalina, fotos potentes y una faceta mas terrenal de la zona.
                </p>
              </div>
              <div className="grid gap-4">
                {differentiators.map((item) => (
                  <div key={item} className="rounded-[26px] border border-[#ff7d14]/18 bg-[#1d1f24] p-5">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ff7d14]">Ventaja real</h3>
                    <p className="mt-3 text-base leading-8 text-white/78">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="precios" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Precios, duracion y que debes llevar</h2>
          <div className="mt-8 grid gap-4 xl:grid-cols-4">
            {pricingNotes.map((item) => (
              <article key={item.label} className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#1f2025_0%,#15161a_100%)] p-6">
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#ffb362]">{item.label}</p>
                <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
                <p className="mt-4 text-sm leading-7 text-white/72">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="rounded-[32px] border border-white/10 bg-[#17181d] p-7">
              <h3 className="text-2xl font-black text-white">Que ropa usar y como prepararte</h3>
              <p className="mt-4 text-base leading-8 text-white/78">
                Si quieres disfrutar el recorrido sin friccion, prepara ropa ligera, comoda y adecuada para ensuciarse.
                En este tipo de tour es normal encontrar polvo, barro, salpicaduras y humedad, asi que conviene asumir
                desde el inicio que no es una actividad para ropa delicada. Esa expectativa correcta mejora mucho la
                experiencia y evita frustraciones.
              </p>
              <ul className="mt-6 space-y-3">
                {packingTips.map((item) => (
                  <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white/82">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#17181d] p-7">
              <h3 className="text-2xl font-black text-white">Reserva, politica y disponibilidad</h3>
              <p className="mt-4 text-base leading-8 text-white/78">
                La forma mas simple de asegurar tu fecha es revisar disponibilidad primero y luego confirmar la reserva.
                En fechas de alta ocupacion, puentes o fines de semana, los horarios mas comodos suelen agotarse antes.
                Por eso esta landing prioriza una CTA directa y una via de contacto clara.
              </p>
              <p className="mt-4 text-base leading-8 text-white/78">
                Si necesitas detalles operativos sobre pickup, edades, ocupacion del buggy o condiciones concretas de la
                reserva, puedes iniciar por la disponibilidad o escribir a Proactivitis por contacto directo.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={reserveHref}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#ff7d14] px-6 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#ff9340]"
                >
                  Reservar ahora
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#111216]"
                >
                  Hablar con Proactivitis
                </Link>
              </div>
              {/* Add privacy-policy and terms links here if public routes are created later. */}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#131419]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#ffb362]">Galeria</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Imagenes reales del tipo de experiencia</h2>
              </div>
              <Link
                href="/punta-cana/tours"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-white transition hover:border-[#ff7d14] hover:bg-[#ff7d14]"
              >
                Ver mas tours en Punta Cana
              </Link>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {visibleGallery.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={`relative overflow-hidden rounded-[26px] border border-white/10 bg-[#1d1e22] ${
                    index === 0 ? "md:col-span-2 md:min-h-[420px]" : "min-h-[220px]"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Buggy tour en Punta Cana con barro, playa o cueva - imagen ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4 text-sm font-semibold text-white">
                    {["Barro y adrenalina", "Buggy en ruta tropical", "Playa Macao", "Cueva natural", "Parada fotografica", "Aventura en grupo"][index] ??
                      "Tour buggy Punta Cana"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="opiniones" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Opiniones de viajeros</h2>
          <p className="mt-5 max-w-4xl text-base leading-8 text-white/78">
            Para mantener esta pagina precisa, Proactivitis no publica reseñas inventadas ni un aggregate rating que no
            pueda sostenerse con datos visibles en esta misma URL. Lo que si hacemos es dejar claro que es lo que mas
            valoran los viajeros antes de reservar este tipo de actividad: una ruta divertida, facilidad para reservar,
            pickup claro, parada en Playa Macao y una experiencia que se sienta realmente off road.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Lo que mas se busca",
                copy:
                  "Una excursion que combine barro, fotos, playa y cueva sin volverse complicada de entender o reservar."
              },
              {
                title: "Lo que mas pesa al decidir",
                copy:
                  "Saber si incluye transporte, cuanto dura, si sirve para principiantes y si vale la pena frente a otras activities in Punta Cana."
              },
              {
                title: "Como mantener confianza SEO",
                copy:
                  "Solo integrar reseñas estructuradas cuando existan reviews reales y visibles dentro de esta landing o en un modulo verificable."
              }
            ].map((item) => (
              <article key={item.title} className="rounded-[28px] border border-white/10 bg-[#17181d] p-6">
                <h3 className="text-xl font-black text-white">{item.title}</h3>
                <p className="mt-4 text-base leading-8 text-white/75">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="border-y border-white/10 bg-[#131419]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Preguntas frecuentes sobre el tour buggy Punta Cana
            </h2>
            <div className="mt-8 space-y-4">
              {faqItems.map((item) => (
                <article key={item.q} className="rounded-[26px] border border-white/10 bg-[#1b1d22] p-6">
                  <h3 className="text-xl font-black text-white">{item.q}</h3>
                  <p className="mt-3 text-base leading-8 text-white/75">{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="reservar" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Reserva tu aventura off road en Punta Cana</h2>
          <div className="mt-8 overflow-hidden rounded-[36px] border border-[#ff7d14]/30 bg-[linear-gradient(135deg,#ff7d14_0%,#ba4d09_100%)] p-8 shadow-[0_30px_80px_rgba(255,125,20,0.2)] sm:p-12">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-white/76">Cierre comercial</p>
            <p className="mt-4 max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">
              Reserva tu aventura off road en Punta Cana y vive una experiencia disenada para viajeros que quieren algo
              mas que una excursion tradicional.
            </p>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/88 sm:text-lg">
              Si tu idea es salir del resort, sentir el terreno, visitar Playa Macao y sumar una actividad de aventura
              con logica comercial clara, esta es una de las rutas mas solidas que puedes valorar. Revisa disponibilidad
              ahora y asegura fecha antes de temporada alta.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={reserveHref}
                className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#111214] px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-black"
              >
                Reservar ahora
              </Link>
              <Link
                href={bookingHref}
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-[#111214]"
              >
                Ver disponibilidad
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#0f1013]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#ffb362]">Confianza y entidad</p>
                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">Proactivitis como operador comercial visible</h2>
                <p className="mt-5 text-base leading-8 text-white/78">
                  Esta landing esta publicada por Proactivitis, la entidad responsable de mostrar la informacion,
                  disponibilidad y puntos de contacto de la experiencia. La pagina esta orientada a claridad de rastreo,
                  conversion y contenido util, pero sin inflar datos que no puedan sostenerse publicamente.
                </p>
                <p className="mt-4 text-base leading-8 text-white/78">
                  Si mas adelante se integran reseñas reales, direccion publica verificable, perfiles adicionales o una
                  politica publica de reservas, la estructura tecnica ya queda preparada para ampliarse sin rehacer el SEO
                  base de la pagina.
                </p>
              </div>
              <div className="rounded-[30px] border border-white/10 bg-[#17181d] p-7">
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#ffb362]">Datos visibles</p>
                <div className="mt-5 space-y-4 text-base text-white/82">
                  <p>
                    <span className="font-black text-white">Marca:</span> Proactivitis
                  </p>
                  <p>
                    <span className="font-black text-white">Email:</span> {PROACTIVITIS_EMAIL}
                  </p>
                  <p>
                    <span className="font-black text-white">Telefono:</span> {PROACTIVITIS_PHONE}
                  </p>
                  <p>
                    <span className="font-black text-white">WhatsApp:</span>{" "}
                    <Link href={PROACTIVITIS_WHATSAPP_LINK} className="text-[#ffd39f] underline underline-offset-4">
                      Contacto directo
                    </Link>
                  </p>
                  <p>
                    <span className="font-black text-white">Enlaces utiles:</span>{" "}
                    <Link href="/tours" className="text-[#ffd39f] underline underline-offset-4">
                      Todos los tours
                    </Link>{" "}
                    {" | "}
                    <Link href="/punta-cana/tours" className="text-[#ffd39f] underline underline-offset-4">
                      Tours en Punta Cana
                    </Link>{" "}
                    {" | "}
                    <Link href="/contact" className="text-[#ffd39f] underline underline-offset-4">
                      Contacto
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/35 px-5 py-10 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-black uppercase tracking-[0.24em] text-white">Proactivitis</p>
        <p className="mt-3 text-sm text-white/60">© 2026 Proactivitis. Todos los derechos reservados.</p>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0d0d0f]/95 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={reserveHref}
            className="flex min-h-14 items-center justify-center rounded-2xl bg-[#ff7d14] text-sm font-black uppercase tracking-[0.2em] text-white"
          >
            Reservar ahora
          </Link>
          <Link
            href={bookingHref}
            className="flex min-h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-sm font-black uppercase tracking-[0.2em] text-white"
          >
            Disponibilidad
          </Link>
        </div>
      </div>
    </div>
  );
}
