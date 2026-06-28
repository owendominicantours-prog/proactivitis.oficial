import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import StructuredData from "@/components/schema/StructuredData";
import {
  TourIncludedExcludedSection,
  TourMobileBookingBar,
  TourProofSection,
  TourTrustBadges
} from "@/components/public/TourLandingConversionBlocks";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import {
  NUEVA_GENERACION_BASE_URL,
  type NuevaGeneracionLocale,
  buildIntentLandingCopy,
  buildNuevaGeneracionConversionCopy,
  buildNuevaGeneracionFaq,
  buildNuevaGeneracionIntentPath,
  buildNuevaGeneracionIntentTourPath,
  buildNuevaGeneracionSchema,
  buildNuevaGeneracionTourPath,
  buildTourFacts,
  getNuevaGeneracionDisplayTitle,
  getNuevaGeneracionHubPath,
  getNuevaGeneracionIntent,
  getNuevaGeneracionIntents,
  getNuevaGeneracionRelatedTours,
  getNuevaGeneracionTourBySlug,
  getNuevaGeneracionTourDescription,
  getNuevaGeneracionTours,
  normalizePickupTimes,
  parseDuration,
  parseJsonArray,
  parseOperatingDays,
  resolveTourPersona,
  toAbsoluteImage
} from "@/lib/nuevaGeneracionTours";
import { getApprovedTourReviewsForTour } from "@/lib/tourReviews";

const UI = {
  es: {
    indexTitle: "Tours y experiencias en Punta Cana | Proactivitis",
    indexDescription: "Reserva tours y experiencias en Punta Cana con fotos reales, precio claro, soporte local y confirmacion directa.",
    collectionName: "Tours y experiencias Proactivitis",
    collectionDescription: "Coleccion de tours y experiencias disponibles para reservar con Proactivitis.",
    eyebrow: "Tours y experiencias",
    indexH1: "Elige tu proxima experiencia en Punta Cana",
    indexIntro: "Compara tours por tipo de plan, precio, horario, fotos reales y detalles importantes antes de reservar. Nuestro equipo te ayuda a confirmar la experiencia y coordinar los datos de salida.",
    activeTours: "Tours activos",
    intents: "Intenciones",
    directBooking: "Reserva directa",
    chooseByTrip: "Elige por tipo de viaje",
    chooseByTripH2: "Encuentra la opcion que mejor encaja con tu plan",
    viewExperience: "Ver experiencia",
    notFound: "Pagina no encontrada | Proactivitis",
    collection: "Coleccion",
    selectedFor: "Seleccion de tours para",
    details: "Ver detalles",
    reserveNow: "Reservar ahora",
    quickSummary: "Resumen de reserva",
    priceFrom: "Precio desde",
    duration: "Duracion",
    firstDeparture: "Salida inicial",
    zone: "Zona",
    whyEyebrow: "Por que reservar este tour",
    whyH2: "Una experiencia lista para reservar sin dudas",
    whatLive: "Lo que vas a vivir",
    prepare: "Como prepararte",
    bestTime: "Mejor momento para reservar",
    choosePlan: "Elige segun tu plan",
    waysToBook: "Formas de reservar esta experiencia",
    itinerary: "Itinerario",
    realPhotos: "Fotos reales del producto",
    related: "Tours relacionados",
    relatedH2: "Mas experiencias para comparar",
    faq: "Preguntas frecuentes",
    directReserve: "Reserva directa",
    operatedBy: "Operado por",
    confirmBy: "Precio claro y confirmacion desde Proactivitis.",
    relatedCompare: "Alternativas relacionadas para comparar antes de reservar",
    experienceDetails: "Detalles de la experiencia"
  },
  en: {
    indexTitle: "Punta Cana excursions and experiences | Proactivitis",
    indexDescription: "Book Punta Cana excursions with real photos, clear pricing, local support and direct confirmation.",
    collectionName: "Proactivitis tours and experiences",
    collectionDescription: "Collection of tours and experiences available to book with Proactivitis.",
    eyebrow: "Tours and experiences",
    indexH1: "Choose your next Punta Cana experience",
    indexIntro: "Compare tours by travel style, price, schedule, real photos and important details before booking. Our team helps confirm the experience and coordinate departure details.",
    activeTours: "Active tours",
    intents: "Ways to choose",
    directBooking: "Direct booking",
    chooseByTrip: "Choose by travel style",
    chooseByTripH2: "Find the option that best fits your plan",
    viewExperience: "View experience",
    notFound: "Page not found | Proactivitis",
    collection: "Collection",
    selectedFor: "Selected tours for",
    details: "View details",
    reserveNow: "Book now",
    quickSummary: "Booking summary",
    priceFrom: "Price from",
    duration: "Duration",
    firstDeparture: "First departure",
    zone: "Area",
    whyEyebrow: "Why book this tour",
    whyH2: "An experience ready to book with fewer doubts",
    whatLive: "What you will experience",
    prepare: "How to prepare",
    bestTime: "Best time to book",
    choosePlan: "Choose by plan",
    waysToBook: "Ways to book this experience",
    itinerary: "Itinerary",
    realPhotos: "Real product photos",
    related: "Related tours",
    relatedH2: "More experiences to compare",
    faq: "Frequently asked questions",
    directReserve: "Direct booking",
    operatedBy: "Operated by",
    confirmBy: "Clear price and confirmation from Proactivitis.",
    relatedCompare: "Related alternatives to compare before booking",
    experienceDetails: "Experience details"
  },
  fr: {
    indexTitle: "Excursions et expériences à Punta Cana | Proactivitis",
    indexDescription: "Réservez des excursions à Punta Cana avec photos réelles, prix clair, support local et confirmation directe.",
    collectionName: "Tours et expériences Proactivitis",
    collectionDescription: "Collection de tours et expériences disponibles à réserver avec Proactivitis.",
    eyebrow: "Tours et expériences",
    indexH1: "Choisissez votre prochaine expérience à Punta Cana",
    indexIntro: "Comparez les tours par type de voyage, prix, horaire, photos réelles et détails importants avant de réserver. Notre équipe aide à confirmer l'expérience et coordonner le départ.",
    activeTours: "Tours actifs",
    intents: "Façons de choisir",
    directBooking: "Réservation directe",
    chooseByTrip: "Choisir par type de voyage",
    chooseByTripH2: "Trouvez l'option qui correspond le mieux à votre plan",
    viewExperience: "Voir l'expérience",
    notFound: "Page introuvable | Proactivitis",
    collection: "Collection",
    selectedFor: "Sélection de tours pour",
    details: "Voir détails",
    reserveNow: "Réserver",
    quickSummary: "Résumé de réservation",
    priceFrom: "Prix dès",
    duration: "Durée",
    firstDeparture: "Premier départ",
    zone: "Zone",
    whyEyebrow: "Pourquoi réserver ce tour",
    whyH2: "Une expérience prête à réserver avec moins de doutes",
    whatLive: "Ce que vous allez vivre",
    prepare: "Comment se préparer",
    bestTime: "Meilleur moment pour réserver",
    choosePlan: "Choisir selon votre plan",
    waysToBook: "Façons de réserver cette expérience",
    itinerary: "Itinéraire",
    realPhotos: "Photos réelles du produit",
    related: "Tours liés",
    relatedH2: "Plus d'expériences à comparer",
    faq: "Questions fréquentes",
    directReserve: "Réservation directe",
    operatedBy: "Opéré par",
    confirmBy: "Prix clair et confirmation depuis Proactivitis.",
    relatedCompare: "Alternatives liées à comparer avant de réserver",
    experienceDetails: "Détails de l'expérience"
  }
};

export const buildNuevaGeneracionIndexMetadata = (locale: NuevaGeneracionLocale): Metadata => ({
  title: UI[locale].indexTitle,
  description: UI[locale].indexDescription,
  alternates: {
    canonical: `${NUEVA_GENERACION_BASE_URL}${getNuevaGeneracionHubPath(locale)}`,
    languages: {
      es: getNuevaGeneracionHubPath("es"),
      en: getNuevaGeneracionHubPath("en"),
      fr: getNuevaGeneracionHubPath("fr")
    }
  }
});

export async function NuevaGeneracionToursIndexPage({ locale }: { locale: NuevaGeneracionLocale }) {
  const t = UI[locale];
  const tours = await getNuevaGeneracionTours(locale);
  const intents = getNuevaGeneracionIntents(locale);
  const canonical = `${NUEVA_GENERACION_BASE_URL}${getNuevaGeneracionHubPath(locale)}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t.collectionName,
    url: canonical,
    inLanguage: locale,
    description: t.collectionDescription,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tours.map((tour, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: getNuevaGeneracionDisplayTitle(tour, locale),
        url: `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionTourPath(tour.slug, locale)}`
      }))
    }
  };

  return (
    <main className="bg-white text-slate-950">
      <StructuredData data={schema} />
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">{t.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{t.indexH1}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">{t.indexIntro}</p>
          </div>
          <div className="grid gap-3 self-end sm:grid-cols-3">
            <StatCard value={String(tours.length)} label={t.activeTours} />
            <StatCard value={String(intents.length)} label={t.intents} />
            <StatCard value="1" label={t.directBooking} />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">{t.chooseByTrip}</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">{t.chooseByTripH2}</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {intents.map((intent) => (
              <Link key={intent.slug} href={buildNuevaGeneracionIntentPath(intent.slug, locale)} className="border border-slate-200 bg-white p-4 transition hover:border-emerald-300">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{intent.keyword}</p>
                <h3 className="mt-2 text-sm font-black text-slate-950">{intent.label}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">{intent.audience}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour) => {
            const persona = resolveTourPersona(tour, locale);
            const hero = tour.heroImage ?? parseFirstGalleryImage(tour.gallery) ?? "/fototours/fotosimple.jpg";
            const area = tour.departureDestination?.name ?? tour.destination?.name ?? tour.microZone?.name ?? tour.location;
            const title = getNuevaGeneracionDisplayTitle(tour, locale);
            return (
              <article key={tour.id} className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[16/10] bg-slate-100">
                  <Image src={hero} alt={title} fill className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">{persona.segment}</span>
                    <span className="text-sm font-black text-slate-950">${tour.price.toFixed(0)} USD</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black leading-snug text-slate-950">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{getNuevaGeneracionTourDescription(tour, locale) || persona.promise}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <span className="border border-slate-100 bg-slate-50 px-3 py-2">{parseDuration(tour.duration)}</span>
                    <span className="border border-slate-100 bg-slate-50 px-3 py-2">{area ?? "Punta Cana"}</span>
                  </div>
                  <Link href={buildNuevaGeneracionTourPath(tour.slug, locale)} className="inline-flex w-full items-center justify-center bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800">
                    {t.viewExperience}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export async function buildNuevaGeneracionIntentHubMetadata(intentSlug: string, locale: NuevaGeneracionLocale): Promise<Metadata> {
  const intent = getNuevaGeneracionIntent(intentSlug, locale);
  if (!intent) return { title: UI[locale].notFound, robots: { index: false, follow: false } };
  const canonical = `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionIntentPath(intent.slug, locale)}`;
  const title = `${intent.titlePrefix} | Proactivitis`;
  const description = locale === "en"
    ? `Collection of Proactivitis tours for ${intent.audience}. ${intent.angle}.`
    : locale === "fr"
      ? `Collection de tours Proactivitis pour ${intent.audience}. ${intent.angle}.`
      : `Coleccion de tours Proactivitis para ${intent.audience}. ${intent.angle}.`;
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: "website" } };
}

export async function NuevaGeneracionIntentHubPage({ intentSlug, locale }: { intentSlug: string; locale: NuevaGeneracionLocale }) {
  const t = UI[locale];
  const intent = getNuevaGeneracionIntent(intentSlug, locale);
  if (!intent) notFound();
  const tours = await getNuevaGeneracionTours(locale);
  const canonical = `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionIntentPath(intent.slug, locale)}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#page`,
        name: `${intent.titlePrefix} Proactivitis`,
        url: canonical,
        inLanguage: locale,
        description: `${intent.audience}. ${intent.angle}.`,
        mainEntity: { "@id": `${canonical}#itemlist` }
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#itemlist`,
        name: intent.keyword,
        itemListElement: tours.map((tour, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: getNuevaGeneracionDisplayTitle(tour, locale),
          url: `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionIntentTourPath(tour.slug, intent.slug, locale)}`
        }))
      }
    ]
  };

  return (
    <main className="bg-white text-slate-950">
      <StructuredData data={schema} />
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12">
          <div>
            <Link href={getNuevaGeneracionHubPath(locale)} className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">{t.eyebrow}</Link>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.34em] text-slate-300">{intent.keyword}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{intent.titlePrefix} Proactivitis</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">{t.selectedFor} {intent.audience}. {intent.angle}.</p>
          </div>
          <aside className="self-end border border-white/15 bg-white/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">{t.collection}</p>
            <p className="mt-4 text-5xl font-black">{tours.length}</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">{intent.proof}</p>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour) => {
            const persona = resolveTourPersona(tour, locale);
            const hero = tour.heroImage ?? parseFirstGalleryImage(tour.gallery) ?? "/fototours/fotosimple.jpg";
            const area = tour.departureDestination?.name ?? tour.destination?.name ?? tour.microZone?.name ?? tour.location ?? "Punta Cana";
            const title = getNuevaGeneracionDisplayTitle(tour, locale);
            return (
              <article key={tour.id} className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[16/10] bg-slate-100">
                  <Image src={hero} alt={title} fill className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">{area}</span>
                    <span className="text-sm font-black text-slate-950">${tour.price.toFixed(0)} USD</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black leading-snug text-slate-950">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{getNuevaGeneracionTourDescription(tour, locale) || persona.promise}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <span className="border border-slate-100 bg-slate-50 px-3 py-2">{parseDuration(tour.duration)}</span>
                    <span className="border border-slate-100 bg-slate-50 px-3 py-2">{persona.segment}</span>
                  </div>
                  <Link href={buildNuevaGeneracionIntentTourPath(tour.slug, intent.slug, locale)} className="inline-flex w-full items-center justify-center bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800">
                    {intent.cta}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export async function buildNuevaGeneracionTourMetadata(slug: string, locale: NuevaGeneracionLocale): Promise<Metadata> {
  const tour = await getNuevaGeneracionTourBySlug(slug, locale);
  if (!tour) return { title: locale === "es" ? "Tour no encontrado | Proactivitis" : UI[locale].notFound, robots: { index: false, follow: false } };
  const persona = resolveTourPersona(tour, locale);
  const facts = buildTourFacts(tour, locale);
  const title = getNuevaGeneracionDisplayTitle(tour, locale);
  const canonical = `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionTourPath(tour.slug, locale)}`;
  const description = getNuevaGeneracionTourDescription(tour, locale) || `${title}: ${persona.promise}.`;
  return {
    title: `${title} | Proactivitis`,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", images: [{ url: toAbsoluteImage(facts.heroImage), alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [toAbsoluteImage(facts.heroImage)] }
  };
}

export async function NuevaGeneracionTourLandingPage({ slug, locale }: { slug: string; locale: NuevaGeneracionLocale }) {
  const t = UI[locale];
  const tour = await getNuevaGeneracionTourBySlug(slug, locale);
  if (!tour) notFound();
  const [relatedTours, rawReviews] = await Promise.all([
    getNuevaGeneracionRelatedTours(tour, 8, locale),
    getApprovedTourReviewsForTour({ id: tour.id, slug: tour.slug }, 3)
  ]);
  const reviews = rawReviews.filter((review) => review.locale === locale);
  const facts = buildTourFacts(tour, locale);
  const persona = resolveTourPersona(tour, locale);
  const conversion = buildNuevaGeneracionConversionCopy({ tour, facts, persona, locale });
  const title = getNuevaGeneracionDisplayTitle(tour, locale);
  const description = getNuevaGeneracionTourDescription(tour, locale);
  const canonical = `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionTourPath(tour.slug, locale)}`;
  const schema = buildNuevaGeneracionSchema({ tour, facts, persona, canonical, relatedTours, locale });
  const faq = buildNuevaGeneracionFaq(title, facts.area, persona, undefined, locale);
  const timeSlots = facts.timeSlots.length ? facts.timeSlots : [{ hour: 9, minute: "00", period: "AM" as const }];
  const options = tour.options.map((option) => ({ ...option, pickupTimes: normalizePickupTimes(option.pickupTimes) }));
  const operatingDays = parseOperatingDays(tour.operatingDays);
  const supplierName = tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Proactivitis";

  return (
    <main className="bg-white pb-24 text-slate-950 lg:pb-0">
      <StructuredData data={schema} />
      <section className="relative min-h-[620px] overflow-hidden bg-slate-950 text-white">
        <Image src={facts.heroImage} alt={title} fill priority className="object-cover opacity-65" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.94),rgba(2,6,23,0.72),rgba(2,6,23,0.18))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_390px] lg:px-12 lg:py-20">
          <div className="flex min-h-[500px] flex-col justify-end">
            <Link href={getNuevaGeneracionHubPath(locale)} className="mb-8 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-200">{t.eyebrow}</Link>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-emerald-300">{persona.segment}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-100">{conversion.heroSubtitle}</p>
            <TourTrustBadges badges={conversion.trustBadges} dark />
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#reservar" className="bg-emerald-400 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300">{t.reserveNow}</a>
              <a href="#detalles" className="border border-white/25 bg-white/10 px-6 py-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/15">{t.details}</a>
            </div>
          </div>
          <aside className="self-end border border-white/15 bg-white/12 p-5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">{t.quickSummary}</p>
            <div className="mt-5 grid gap-3">
              <FactLine label={t.priceFrom} value={`$${tour.price.toFixed(0)} USD`} />
              <FactLine label={t.duration} value={facts.duration} />
              <FactLine label={t.firstDeparture} value={facts.firstTime} />
              <FactLine label={t.zone} value={facts.area} />
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-200">{persona.hook}</p>
          </aside>
        </div>
      </section>

      <section id="detalles" className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_380px] lg:px-12">
        <div className="space-y-8">
          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">{t.whyEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">{t.whyH2}</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">{description || conversion.heroSubtitle}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ValueBlock title={t.whatLive} body={persona.promise} />
              <ValueBlock title={t.prepare} body={persona.packing} />
              <ValueBlock title={t.bestTime} body={persona.urgency} />
            </div>
          </section>
          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{t.choosePlan}</p>
            <h2 className="mt-3 text-2xl font-black">{t.waysToBook}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {getNuevaGeneracionIntents(locale).map((intent) => (
                <Link key={intent.slug} href={buildNuevaGeneracionIntentTourPath(tour.slug, intent.slug, locale)} className="border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{intent.keyword}</p>
                  <h3 className="mt-2 text-sm font-black text-slate-950">{intent.titlePrefix}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{intent.audience}</p>
                </Link>
              ))}
            </div>
          </section>
          <TourIncludedExcludedSection includes={facts.includes} exclusions={conversion.exclusions} locale={locale} />
          <TourProofSection reviews={reviews} confidence={conversion.confidence} locale={locale} />
          <TourItinerarySection title={t.itinerary} stops={facts.itinerary} />
          <TourPhotosSection title={t.realPhotos} images={facts.images} tourTitle={title} />
          <RelatedToursSection title={t.related} heading={t.relatedH2} relatedTours={relatedTours} locale={locale} />
          <FaqSection title={t.faq} faq={faq} />
        </div>
        <aside id="reservar" className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="border border-slate-200 bg-white p-5 shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">{t.directReserve}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{conversion.bookingPrompt} {t.operatedBy} {supplierName}. {t.confirmBy}</p>
            <div className="mt-5">
              <TourBookingWidget tourId={tour.id} basePrice={tour.price} timeSlots={timeSlots} operatingDays={operatingDays} options={options} supplierHasStripeAccount={Boolean(tour.SupplierProfile?.stripeAccountId)} platformSharePercent={tour.platformSharePercent ?? 20} tourTitle={title} tourImage={facts.heroImage} />
            </div>
          </div>
        </aside>
      </section>
      <TourMobileBookingBar price={tour.price} locale={locale} />
    </main>
  );
}

export async function buildNuevaGeneracionIntentTourMetadata(slug: string, intentSlug: string, locale: NuevaGeneracionLocale): Promise<Metadata> {
  const [tour, intent] = await Promise.all([getNuevaGeneracionTourBySlug(slug, locale), Promise.resolve(getNuevaGeneracionIntent(intentSlug, locale))]);
  if (!tour || !intent) return { title: UI[locale].notFound, robots: { index: false, follow: false } };
  const facts = buildTourFacts(tour, locale);
  const persona = resolveTourPersona(tour, locale);
  const copy = buildIntentLandingCopy({ tour, facts, persona, intent, locale });
  const canonical = `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionIntentTourPath(tour.slug, intent.slug, locale)}`;
  return {
    title: `${copy.title} | Proactivitis`,
    description: copy.description,
    alternates: { canonical },
    openGraph: { title: copy.title, description: copy.description, url: canonical, type: "website", images: [{ url: toAbsoluteImage(facts.heroImage), alt: copy.title }] },
    twitter: { card: "summary_large_image", title: copy.title, description: copy.description, images: [toAbsoluteImage(facts.heroImage)] }
  };
}

export async function NuevaGeneracionIntentTourPage({ slug, intentSlug, locale }: { slug: string; intentSlug: string; locale: NuevaGeneracionLocale }) {
  const t = UI[locale];
  const intent = getNuevaGeneracionIntent(intentSlug, locale);
  if (!intent) notFound();
  const tour = await getNuevaGeneracionTourBySlug(slug, locale);
  if (!tour) notFound();
  const [relatedTours, rawReviews] = await Promise.all([
    getNuevaGeneracionRelatedTours(tour, 8, locale),
    getApprovedTourReviewsForTour({ id: tour.id, slug: tour.slug }, 3)
  ]);
  const reviews = rawReviews.filter((review) => review.locale === locale);
  const facts = buildTourFacts(tour, locale);
  const persona = resolveTourPersona(tour, locale);
  const conversion = buildNuevaGeneracionConversionCopy({ tour, facts, persona, locale });
  const copy = buildIntentLandingCopy({ tour, facts, persona, intent, locale });
  const title = getNuevaGeneracionDisplayTitle(tour, locale);
  const canonical = `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionIntentTourPath(tour.slug, intent.slug, locale)}`;
  const schema = buildNuevaGeneracionSchema({ tour, facts, persona, canonical, intent, relatedTours, locale });
  const faq = buildNuevaGeneracionFaq(title, facts.area, persona, intent, locale);
  const timeSlots = facts.timeSlots.length ? facts.timeSlots : [{ hour: 9, minute: "00", period: "AM" as const }];
  const options = tour.options.map((option) => ({ ...option, pickupTimes: normalizePickupTimes(option.pickupTimes) }));
  const operatingDays = parseOperatingDays(tour.operatingDays);
  const supplierName = tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Proactivitis";

  return (
    <main className="bg-white pb-24 text-slate-950 lg:pb-0">
      <StructuredData data={schema} />
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_430px] lg:px-12 lg:py-16">
          <div>
            <Link href={buildNuevaGeneracionTourPath(tour.slug, locale)} className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">{t.eyebrow}</Link>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.34em] text-slate-300">{copy.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">{conversion.heroSubtitle}</p>
            <TourTrustBadges badges={conversion.trustBadges} dark />
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#reservar" className="bg-emerald-400 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300">{copy.cta}</a>
              <a href="#comparar" className="border border-white/20 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/15">{t.related}</a>
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden bg-slate-800">
            <Image src={facts.heroImage} alt={copy.title} fill priority className="object-cover" sizes="(min-width: 1024px) 430px, 100vw" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_390px] lg:px-12">
        <div className="space-y-8">
          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">{intent.keyword}</p>
            <h2 className="mt-3 text-3xl font-black">{locale === "en" ? "Built for this kind of trip" : locale === "fr" ? "Pensé pour ce type de voyage" : "Pensado para este tipo de viaje"}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {copy.decision.map((item) => <ValueBlock key={item.title} title={item.title} body={item.body} />)}
            </div>
          </section>
          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{t.experienceDetails}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <MiniStat label={locale === "en" ? "Price" : locale === "fr" ? "Prix" : "Precio"} value={`$${tour.price.toFixed(0)} USD`} />
              <MiniStat label={t.duration} value={facts.duration} />
              <MiniStat label={locale === "en" ? "Departure" : locale === "fr" ? "Départ" : "Salida"} value={facts.firstTime} />
              <MiniStat label={t.zone} value={facts.area} />
            </div>
          </section>
          <TourIncludedExcludedSection includes={facts.includes} exclusions={conversion.exclusions} locale={locale} />
          <TourProofSection reviews={reviews} confidence={conversion.confidence} locale={locale} />
          <RelatedToursSection id="comparar" title={t.related} heading={t.relatedCompare} relatedTours={relatedTours} locale={locale} intentSlug={intent.slug} />
          <FaqSection title={t.faq} faq={faq} />
        </div>
        <aside id="reservar" className="lg:sticky lg:top-20 lg:self-start">
          <div className="border border-slate-200 bg-white p-5 shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">{intent.label}</p>
            <h2 className="mt-2 text-2xl font-black">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{conversion.bookingPrompt} {t.operatedBy} {supplierName}. Proactivitis.</p>
            <TourBookingWidget tourId={tour.id} basePrice={tour.price} timeSlots={timeSlots} operatingDays={operatingDays} options={options} supplierHasStripeAccount={Boolean(tour.SupplierProfile?.stripeAccountId)} platformSharePercent={tour.platformSharePercent ?? 20} tourTitle={title} tourImage={facts.heroImage} />
          </div>
        </aside>
      </section>
      <TourMobileBookingBar price={tour.price} cta={copy.cta} locale={locale} />
    </main>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-white/15 bg-white/10 p-5">
      <p className="text-4xl font-black">{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">{label}</p>
    </div>
  );
}

function FactLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border border-white/10 bg-white/10 px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

function ValueBlock({ title, body }: { title: string; body: string }) {
  return (
    <article className="border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function TourItinerarySection({
  title,
  stops
}: {
  title: string;
  stops: Array<{ time: string; title: string; description?: string }>;
}) {
  return (
    <section className="border border-slate-200 bg-white p-6">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{title}</p>
      <div className="mt-5 space-y-4">
        {stops.slice(0, 6).map((stop, index) => (
          <article key={`${stop.title}-${index}`} className="grid gap-3 border border-slate-200 bg-white p-4 md:grid-cols-[120px_1fr]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">{stop.time}</p>
            <div>
              <h3 className="text-lg font-black text-slate-950">{stop.title}</h3>
              {stop.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{stop.description}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TourPhotosSection({ title, images, tourTitle }: { title: string; images: string[]; tourTitle: string }) {
  return (
    <section className="border border-slate-200 bg-white p-6">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{title}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {images.slice(0, 6).map((image, index) => (
          <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden bg-slate-100">
            <Image src={image} alt={`${tourTitle} ${index + 1}`} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw" />
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedToursSection({
  id,
  title,
  heading,
  relatedTours,
  locale,
  intentSlug
}: {
  id?: string;
  title: string;
  heading: string;
  relatedTours: Awaited<ReturnType<typeof getNuevaGeneracionRelatedTours>>;
  locale: NuevaGeneracionLocale;
  intentSlug?: string;
}) {
  return (
    <section id={id} className="border border-slate-200 bg-white p-6">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{title}</p>
      <h2 className="mt-3 text-2xl font-black">{heading}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {relatedTours.map((related) => {
          const relatedImage = related.heroImage ?? parseJsonArray<string>(related.gallery)[0] ?? "/fototours/fotosimple.jpg";
          const href = intentSlug
            ? buildNuevaGeneracionIntentTourPath(related.slug, intentSlug, locale)
            : buildNuevaGeneracionTourPath(related.slug, locale);
          return (
            <Link key={related.id} href={href} className="grid grid-cols-[110px_1fr] gap-4 border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300">
              <div className="relative min-h-[92px] overflow-hidden bg-slate-200">
                <Image src={relatedImage} alt={getNuevaGeneracionDisplayTitle(related, locale)} fill className="object-cover" sizes="110px" />
              </div>
              <div>
                <h3 className="text-sm font-black leading-snug text-slate-950">{getNuevaGeneracionDisplayTitle(related, locale)}</h3>
                <p className="mt-2 text-xs text-slate-600">${related.price.toFixed(0)} USD - {related.destination?.name ?? related.location}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function FaqSection({ title, faq }: { title: string; faq: Array<{ question: string; answer: string }> }) {
  return (
    <section className="border border-slate-200 bg-white p-6">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{title}</p>
      <div className="mt-5 space-y-3">
        {faq.map((item) => (
          <details key={item.question} className="border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-black text-slate-950">{item.question}</summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const parseFirstGalleryImage = (gallery?: string | null) => {
  if (!gallery) return null;
  try {
    const parsed = JSON.parse(gallery);
    return Array.isArray(parsed) && parsed[0] ? String(parsed[0]) : null;
  } catch {
    return null;
  }
};
