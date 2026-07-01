import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Heart,
  MapPin,
  MessageCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  Star,
  ThumbsUp,
  Users,
} from "lucide-react";

import { Locale } from "@/lib/translations";
import { prisma } from "@/lib/prisma";
import { getPriceValidUntil, PROACTIVITIS_URL } from "@/lib/seo";

type PublicHomePageProps = {
  locale: Locale;
};

type HomeTour = {
  id: string;
  slug: string;
  title: string;
  price: number;
  heroImage: string | null;
  duration: string | null;
  location: string | null;
};

const heroImage = "/CARRU1.jpg";
const transferImage = "/banner    transfer.jpeg";
const teamImage = "/mini-portada.png";

const copy = {
  es: {
    badge: "Experiencias reales en Republica Dominicana",
    title: "Reserva tours y traslados en Republica Dominicana sin perder tiempo",
    subtitle: "Experiencias reales, proveedores verificados y soporte humano por WhatsApp.",
    destination: "A donde quieres ir?",
    destinationHint: "Punta Cana, Saona...",
    date: "Fecha",
    dateHint: "Selecciona fecha",
    people: "Personas",
    peopleHint: "2 personas",
    search: "Buscar experiencias",
    popular: "Busquedas populares:",
    recommended: "Recomendado",
    popularTours: "Tours mas populares",
    viewTours: "Ver todos los tours",
    why: "Por que elegir Proactivitis",
    peopleTitle: "Turismo pensado por personas reales",
    peopleBody:
      "Combinamos personas en el terreno, tecnologia y procesos confiables para que cada viaje sea claro, humano y memorable.",
    knowMore: "Conocenos mas",
    destinationsLabel: "Destinos populares",
    destinationsTitle: "Zonas mas buscadas",
    viewZones: "Ver todas las zonas",
    transferLabel: "Traslados privados",
    transferTitle: "Traslados privados con chofer verificado",
    transferBody:
      "Desde el aeropuerto a tu hotel o cualquier destino en Republica Dominicana. Confianza, comodidad y puntualidad garantizada.",
    transferCta: "Reservar traslado",
    reviewsLabel: "Lo que dicen nuestros viajeros",
    reviewsTitle: "Mas de 5,000 viajeros ya confian en nosotros",
    viewReviews: "Ver todas las resenas",
  },
  en: {
    badge: "Real experiences in the Dominican Republic",
    title: "Book tours and transfers in the Dominican Republic without wasting time",
    subtitle: "Real experiences, verified providers and human WhatsApp support.",
    destination: "Where do you want to go?",
    destinationHint: "Punta Cana, Saona...",
    date: "Date",
    dateHint: "Select date",
    people: "People",
    peopleHint: "2 people",
    search: "Search experiences",
    popular: "Popular searches:",
    recommended: "Recommended",
    popularTours: "Most popular tours",
    viewTours: "View all tours",
    why: "Why choose Proactivitis",
    peopleTitle: "Tourism designed by real people",
    peopleBody:
      "We combine people on the ground, technology and reliable processes so every trip feels clear, human and memorable.",
    knowMore: "Learn more",
    destinationsLabel: "Popular destinations",
    destinationsTitle: "Most searched areas",
    viewZones: "View all areas",
    transferLabel: "Private transfers",
    transferTitle: "Private transfers with verified drivers",
    transferBody:
      "From the airport to your hotel or any destination in the Dominican Republic. Trust, comfort and punctuality guaranteed.",
    transferCta: "Book transfer",
    reviewsLabel: "What travelers say",
    reviewsTitle: "More than 5,000 travelers already trust us",
    viewReviews: "View all reviews",
  },
  fr: {
    badge: "Experiences reelles en Republique dominicaine",
    title: "Reservez tours et transferts en Republique dominicaine sans perdre de temps",
    subtitle: "Experiences reelles, prestataires verifies et support humain par WhatsApp.",
    destination: "Ou voulez-vous aller?",
    destinationHint: "Punta Cana, Saona...",
    date: "Date",
    dateHint: "Selectionnez une date",
    people: "Personnes",
    peopleHint: "2 personnes",
    search: "Chercher",
    popular: "Recherches populaires:",
    recommended: "Recommande",
    popularTours: "Tours les plus populaires",
    viewTours: "Voir tous les tours",
    why: "Pourquoi choisir Proactivitis",
    peopleTitle: "Un tourisme pense par de vraies personnes",
    peopleBody:
      "Nous combinons equipe locale, technologie et processus fiables pour rendre chaque voyage clair, humain et memorable.",
    knowMore: "En savoir plus",
    destinationsLabel: "Destinations populaires",
    destinationsTitle: "Zones les plus recherchees",
    viewZones: "Voir toutes les zones",
    transferLabel: "Transferts prives",
    transferTitle: "Transferts prives avec chauffeur verifie",
    transferBody:
      "De l aeroport a votre hotel ou toute destination en Republique dominicaine. Confiance, confort et ponctualite.",
    transferCta: "Reserver transfert",
    reviewsLabel: "Ce que disent nos voyageurs",
    reviewsTitle: "Plus de 5 000 voyageurs nous font deja confiance",
    viewReviews: "Voir tous les avis",
  },
} satisfies Record<Locale, Record<string, string>>;

const chips = ["Isla Saona", "Buggy", "Santo Domingo", "Parasailing", "Shuttle"];

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Proveedores verificados",
    body: "Trabajamos solo con los mejores",
  },
  {
    icon: CreditCard,
    title: "Pago seguro",
    body: "Tu pago esta 100% protegido",
  },
  {
    icon: MessageCircle,
    title: "Soporte 24/7",
    body: "Te ayudamos siempre",
  },
  {
    icon: RefreshCcw,
    title: "Cancelacion flexible",
    body: "Hasta 24 horas antes",
  },
];

const benefits = [
  {
    icon: ThumbsUp,
    title: "Experiencias reales",
    body: "Vive lo mejor de cada destino con actividades probadas.",
  },
  {
    icon: MessageCircle,
    title: "Atencion humana",
    body: "Hablamos tu idioma y estamos disponibles por WhatsApp.",
  },
  {
    icon: ArrowRight,
    title: "Mejores precios",
    body: "Sin intermediarios, precios justos y sin cargos ocultos.",
  },
  {
    icon: Check,
    title: "Viajes responsables",
    body: "Apoyamos comunidades locales y turismo responsable.",
  },
];

const destinations = [
  { name: "Punta Cana", count: "128 tours", image: "/CARRU2.jpg" },
  { name: "Isla Saona", count: "23 tours", image: "/CARRU1.jpg" },
  { name: "Santo Domingo", count: "18 tours", image: "/banner.png" },
  { name: "Bayahibe", count: "15 tours", image: "/CARR3.png" },
  { name: "Samana", count: "12 tours", image: "/mejorbanner.png" },
  { name: "Puerto Plata", count: "10 tours", image: "/uploads/1765475552058-928dca75-2e04-438f-9ce9-aa04a93382a0.webp" },
];

const fallbackTours = [
  {
    slug: "tour-y-entrada-para-de-isla-saona-desde-punta-cana",
    title: "Isla Saona desde Punta Cana",
    price: 75,
    image: "/CARRU1.jpg",
    badge: "Mas vendido",
    rating: "4.8",
    reviews: "460",
    duration: "8 horas",
  },
  {
    slug: "tour-en-buggy-por-punta-cana",
    title: "Tour en buggy por Punta Cana",
    price: 35,
    image: "/fototours/fototour.jpeg",
    badge: "Popular",
    rating: "4.9",
    reviews: "320",
    duration: "3 horas",
  },
  {
    slug: "snorkel-en-arrecife-de-coral",
    title: "Snorkel en Arrecife de Coral",
    price: 50,
    image: "/CARR3.png",
    badge: "Top valorado",
    rating: "4.9",
    reviews: "180",
    duration: "4 horas",
  },
  {
    slug: "parasailing-punta-cana",
    title: "Aventura en Parasailing",
    price: 90,
    image: "/uploads/1765478992529-893939d5-8ce3-4440-8dac-7cf1c89986b0.webp",
    badge: "Aventura",
    rating: "4.8",
    reviews: "230",
    duration: "2 horas",
  },
  {
    slug: "monkeyland-punta-cana",
    title: "Monkeyland + Cenote Natural",
    price: 65,
    image: "/uploads/1765478993158-db314cee-543c-43bc-9537-6e0168a4f43e.webp",
    badge: "Familiar",
    rating: "4.7",
    reviews: "150",
    duration: "5 horas",
  },
];

const reviews = [
  {
    name: "Sarah Johnson",
    country: "US",
    date: "Junio 2024",
    text: "Increible experiencia! Los guias fueron muy amables y el cenote es hermoso. Lo recomiendo 100%.",
    images: ["/fototours/fototour.jpeg", "/uploads/1765478992298-712c51d5-950b-43f0-8a32-84efcfae5e8c.webp", "/CARRU1.jpg"],
  },
  {
    name: "Mark Davis",
    country: "CA",
    date: "Mayo 2024",
    text: "Muy divertido, buena organizacion y vale cada centavo. Volveria a reservar sin duda.",
    images: ["/transfer/suv.png", "/CARRU2.jpg", "/CARR3.png"],
  },
  {
    name: "Laura Martinez",
    country: "ES",
    date: "Abril 2024",
    text: "Excelente servicio desde la reserva hasta el final. Soporte por WhatsApp 24/7.",
    images: ["/fototours/fotosimple.jpg", "/uploads/1765478993158-db314cee-543c-43bc-9537-6e0168a4f43e.webp", "/CARR3.png"],
  },
];

function localePath(locale: Locale, path: string) {
  if (locale === "es") return path;
  return `/${locale}${path}`;
}

function imageUrl(image?: string | null) {
  if (!image) return "/fototours/fototour.jpeg";
  return image.startsWith("http") ? image : image;
}

function parseDuration(value?: string | null) {
  if (!value) return "4 horas";
  try {
    const parsed = JSON.parse(value);
    if (parsed?.value && parsed?.unit) return `${parsed.value} ${parsed.unit}`;
  } catch {
    return value;
  }
  return value;
}

async function getHomeTours(locale: Locale) {
  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      heroImage: true,
      duration: true,
      location: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 5,
  });

  const reviewsByTour = tours.length
    ? await prisma.tourReview.groupBy({
        by: ["tourId"],
        where: { status: "APPROVED", tourId: { in: tours.map((tour) => tour.id) } },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];

  const ratingMap = new Map(
    reviewsByTour.map((row) => [
      row.tourId,
      {
        rating: Number(row._avg.rating ?? 0),
        count: row._count.rating,
      },
    ])
  );

  if (!tours.length) {
    return fallbackTours.map((tour) => ({
      ...tour,
      location: "Punta Cana",
      href: localePath(locale, `/tours/${tour.slug}`),
    }));
  }

  return tours.map((tour: HomeTour, index: number) => {
    const rating = ratingMap.get(tour.id);
    const fallback = fallbackTours[index] ?? fallbackTours[0];
    return {
      slug: tour.slug,
      title: tour.title,
      price: Number(tour.price || fallback.price),
      image: imageUrl(tour.heroImage) || fallback.image,
      badge: fallback.badge,
      rating: rating?.rating ? rating.rating.toFixed(1) : fallback.rating,
      reviews: rating?.count ? String(rating.count) : fallback.reviews,
      duration: parseDuration(tour.duration) || fallback.duration,
      location: tour.location ?? "Punta Cana",
      href: localePath(locale, `/tours/${tour.slug}`),
    };
  });
}

export default async function PublicHomePage({ locale }: PublicHomePageProps) {
  const text = copy[locale] ?? copy.es;
  const tours = await getHomeTours(locale);
  const priceValidUntil = getPriceValidUntil();
  const homeUrl = `${PROACTIVITIS_URL}${locale === "es" ? "/" : `/${locale}`}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${homeUrl}#webpage`,
        url: homeUrl,
        name: text.title,
        description: text.subtitle,
      },
      {
        "@type": "ItemList",
        "@id": `${homeUrl}#popular-tours`,
        name: text.popularTours,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: tours.length,
        itemListElement: tours.map((tour, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: tour.title,
            image: tour.image.startsWith("http") ? tour.image : `${PROACTIVITIS_URL}${tour.image}`,
            url: `${PROACTIVITIS_URL}${localePath(locale, `/tours/${tour.slug}`)}`,
            brand: { "@type": "Brand", name: "Proactivitis" },
            offers: {
              "@type": "Offer",
              price: tour.price,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              priceValidUntil,
              url: `${PROACTIVITIS_URL}${localePath(locale, `/tours/${tour.slug}`)}`,
            },
          },
        })),
      },
    ],
  };

  return (
    <div className="bg-white text-[#071329]">
      <section className="relative min-h-[590px] overflow-hidden">
        <Image src={heroImage} alt="Playa en Republica Dominicana" fill priority className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00395f]/82 via-[#006b92]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/25" />

        <div className="relative z-10 mx-auto max-w-[1280px] px-5 pt-[92px] sm:px-8 lg:pt-[108px]">
          <div className="max-w-[660px]">
            <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-sm backdrop-blur">
              {text.badge}
            </p>
            <h1 className="mt-5 text-[34px] font-black leading-[1.02] tracking-[-0.03em] text-white drop-shadow sm:text-[46px] lg:text-[54px]">
              {text.title}
            </h1>
            <p className="mt-5 max-w-[520px] text-base font-bold leading-7 text-white sm:text-lg">{text.subtitle}</p>
          </div>

          <form action={localePath(locale, "/tours")} className="mt-8 max-w-[1060px] rounded-2xl bg-white p-3 shadow-[0_24px_70px_rgba(7,19,41,0.18)]">
            <div className="grid gap-2 lg:grid-cols-[1.35fr,0.9fr,0.8fr,220px]">
              <label className="flex items-center gap-4 rounded-xl px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[#0c1d3a]">
                  <MapPin className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black text-[#071329]">{text.destination}</span>
                  <input name="destination" className="mt-1 w-full border-0 p-0 text-sm font-semibold text-slate-500 outline-none placeholder:text-slate-400" placeholder={text.destinationHint} />
                </span>
              </label>
              <label className="flex items-center gap-4 rounded-xl border-l border-slate-100 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[#0c1d3a]">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black text-[#071329]">{text.date}</span>
                  <span className="mt-1 block text-sm font-semibold text-slate-500">{text.dateHint}</span>
                </span>
              </label>
              <label className="flex items-center gap-4 rounded-xl border-l border-slate-100 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[#0c1d3a]">
                  <Users className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black text-[#071329]">{text.people}</span>
                  <span className="mt-1 block text-sm font-semibold text-slate-500">{text.peopleHint}</span>
                </span>
              </label>
              <button className="rounded-xl bg-[#1267e8] px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-[#0d57c7]">
                {text.search}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm font-bold text-white">
            <span className="mr-2">{text.popular}</span>
            {chips.map((chip) => (
              <Link key={chip} href={`${localePath(locale, "/tours")}?destination=${encodeURIComponent(chip)}`} className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-black text-white backdrop-blur hover:bg-white/30">
                {chip}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-14 px-5 sm:px-8">
        <div className="mx-auto grid max-w-[1210px] gap-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_22px_60px_rgba(7,19,41,0.12)] md:grid-cols-4">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className={`flex items-center gap-4 px-7 py-7 ${index ? "border-t border-slate-100 md:border-l md:border-t-0" : ""}`}>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-[#1267e8]">
                  <Icon className="h-7 w-7" />
                </span>
                <span>
                  <strong className="block text-sm font-black text-[#071329]">{item.title}</strong>
                  <span className="mt-1 block text-sm font-semibold text-slate-500">{item.body}</span>
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <main className="mx-auto max-w-[1210px] px-5 py-10 sm:px-8">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.32em] text-[#1267e8]">{text.recommended}</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#071329] sm:text-4xl">{text.popularTours}</h2>
            </div>
            <Link href={localePath(locale, "/tours")} className="hidden items-center gap-2 text-sm font-black text-[#1267e8] md:inline-flex">
              {text.viewTours}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative">
            <button aria-label="Anterior" className="absolute -left-8 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg lg:flex">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {tours.map((tour) => (
                <article key={tour.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_34px_rgba(7,19,41,0.11)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(7,19,41,0.16)]">
                  <div className="relative h-[152px]">
                    <Image src={tour.image} alt={tour.title} fill className="object-cover" sizes="(min-width:1024px) 230px, 50vw" />
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-black text-white">{tour.badge}</span>
                    <button aria-label="Guardar tour" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-xs font-black text-slate-700">
                      <Star className="h-4 w-4 fill-[#ffb703] text-[#ffb703]" />
                      {tour.rating} <span className="text-slate-400">({tour.reviews})</span>
                    </div>
                    <h3 className="mt-2 min-h-[48px] text-base font-black leading-tight text-[#071329]">{tour.title}</h3>
                    <div className="mt-3 flex items-center gap-3 text-[12px] font-bold text-slate-500">
                      <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {tour.duration}</span>
                      <span className="inline-flex items-center gap-1"><Car className="h-3.5 w-3.5" /> Recogida incluida</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold text-slate-500">Desde</p>
                        <p className="text-xl font-black text-[#0d3b85]">${tour.price} <span className="text-xs">USD</span></p>
                      </div>
                      <Link href={tour.href ?? localePath(locale, `/tours/${tour.slug}`)} className="rounded-xl bg-[#1267e8] px-4 py-2 text-xs font-black text-white hover:bg-[#0d57c7]">
                        Ver tour
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <button aria-label="Siguiente" className="absolute -right-8 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg lg:flex">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        <section className="grid gap-10 py-14 lg:grid-cols-[0.9fr,1.7fr,1fr] lg:items-center">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.32em] text-[#1267e8]">{text.why}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight tracking-[-0.03em] text-[#071329]">{text.peopleTitle}</h2>
            <p className="mt-4 text-base font-semibold leading-7 text-slate-600">{text.peopleBody}</p>
            <Link href={localePath(locale, "/about")} className="mt-6 inline-flex rounded-xl bg-[#1267e8] px-6 py-3 text-sm font-black text-white">
              {text.knowMore}
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="text-center sm:text-left">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf3ff] text-[#1267e8] sm:mx-0">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-sm font-black text-[#071329]">{benefit.title}</h3>
                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{benefit.body}</p>
                </article>
              );
            })}
          </div>
          <div className="relative min-h-[230px] overflow-hidden rounded-3xl shadow-[0_20px_45px_rgba(7,19,41,0.16)]">
            <Image src={teamImage} alt="Equipo Proactivitis" fill className="object-cover" sizes="360px" />
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.32em] text-[#1267e8]">{text.destinationsLabel}</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#071329]">{text.destinationsTitle}</h2>
            </div>
            <Link href={localePath(locale, "/destinations")} className="hidden items-center gap-2 text-sm font-black text-[#1267e8] md:inline-flex">
              {text.viewZones}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {destinations.map((destination) => (
              <Link key={destination.name} href={`${localePath(locale, "/tours")}?destination=${encodeURIComponent(destination.name)}`} className="group relative h-[92px] overflow-hidden rounded-2xl shadow-md">
                <Image src={destination.image} alt={destination.name} fill className="object-cover transition group-hover:scale-105" sizes="200px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071329]/80 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-base font-black leading-none">{destination.name}</p>
                  <p className="mt-1 text-xs font-bold">{destination.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="relative overflow-hidden rounded-3xl bg-[#071329] p-8 text-white shadow-[0_22px_55px_rgba(7,19,41,0.22)] md:p-11">
            <Image src={transferImage} alt="Traslado privado al aeropuerto" fill className="object-cover opacity-55" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071329]/95 via-[#071329]/75 to-[#071329]/20" />
            <div className="relative z-10 max-w-[640px]">
              <p className="text-[12px] font-black uppercase tracking-[0.38em] text-white/70">{text.transferLabel}</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">{text.transferTitle}</h2>
              <p className="mt-4 text-base font-semibold leading-7 text-white/88">{text.transferBody}</p>
              <Link href={localePath(locale, "/traslado")} className="mt-6 inline-flex rounded-xl bg-white px-7 py-3 text-sm font-black text-[#071329]">
                {text.transferCta}
              </Link>
              <div className="mt-7 flex flex-wrap gap-5 text-sm font-bold text-white/90">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Choferes verificados</span>
                <span className="inline-flex items-center gap-2"><Car className="h-5 w-5" /> Vehiculos modernos</span>
                <span className="inline-flex items-center gap-2"><CreditCard className="h-5 w-5" /> Precios fijos sin sorpresas</span>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.32em] text-[#1267e8]">{text.reviewsLabel}</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#071329]">{text.reviewsTitle}</h2>
            </div>
            <Link href={localePath(locale, "/reviews")} className="hidden items-center gap-2 text-sm font-black text-[#1267e8] md:inline-flex">
              {text.viewReviews}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <button aria-label="Resena anterior" className="absolute -left-8 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg lg:flex">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="grid gap-5 lg:grid-cols-3">
              {reviews.map((review) => (
                <article key={review.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf3ff] text-sm font-black text-[#1267e8]">{review.name.slice(0, 1)}</div>
                    <div>
                      <p className="text-sm font-black text-[#071329]">
                        {review.name} <span className="text-xs text-slate-400">{review.country}</span>
                      </p>
                      <p className="text-xs font-bold text-slate-400">{review.date}</p>
                    </div>
                  </div>
                  <p className="mt-4 min-h-[64px] text-sm font-semibold leading-6 text-slate-600">{review.text}</p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {review.images.map((image) => (
                      <div key={image} className="relative h-[64px] overflow-hidden rounded-xl">
                        <Image src={image} alt="Foto de resena" fill className="object-cover" sizes="120px" />
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <button aria-label="Resena siguiente" className="absolute -right-8 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg lg:flex">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </div>
  );
}
