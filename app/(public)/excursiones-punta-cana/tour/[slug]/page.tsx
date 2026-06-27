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
  NUEVA_GENERACION_HUB_PATH,
  NUEVA_GENERACION_INTENTS,
  buildNuevaGeneracionConversionCopy,
  buildNuevaGeneracionIntentTourPath,
  buildNuevaGeneracionTourPath,
  buildNuevaGeneracionFaq,
  buildNuevaGeneracionSchema,
  buildTourFacts,
  getNuevaGeneracionRelatedTours,
  getNuevaGeneracionDisplayTitle,
  getNuevaGeneracionTourBySlug,
  normalizePickupTimes,
  parseJsonArray,
  parseOperatingDays,
  resolveTourPersona,
  toAbsoluteImage
} from "@/lib/nuevaGeneracionTours";
import { getApprovedTourReviews } from "@/lib/tourReviews";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getNuevaGeneracionTourBySlug(slug);
  if (!tour) {
    return {
      title: "Tour no encontrado | Proactivitis",
      robots: { index: false, follow: false }
    };
  }

  const persona = resolveTourPersona(tour);
  const facts = buildTourFacts(tour);
  const displayTitle = getNuevaGeneracionDisplayTitle(tour);
  const canonical = `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionTourPath(tour.slug)}`;
  const description =
    tour.shortDescription ??
    `${displayTitle}: ${persona.promise}. Reserva con precio claro, fotos reales y soporte local.`;

  return {
    title: `${displayTitle} | Proactivitis`,
    description,
    alternates: { canonical },
    openGraph: {
      title: displayTitle,
      description,
      url: canonical,
      type: "website",
      images: [{ url: toAbsoluteImage(facts.heroImage), alt: displayTitle }]
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description,
      images: [toAbsoluteImage(facts.heroImage)]
    }
  };
}

export default async function NuevaGeneracionTourLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const tour = await getNuevaGeneracionTourBySlug(slug);
  if (!tour) notFound();

  const [relatedTours, reviews] = await Promise.all([
    getNuevaGeneracionRelatedTours(tour, 8),
    getApprovedTourReviews(tour.id, 3)
  ]);
  const facts = buildTourFacts(tour);
  const persona = resolveTourPersona(tour);
  const conversion = buildNuevaGeneracionConversionCopy({ tour, facts, persona });
  const displayTitle = getNuevaGeneracionDisplayTitle(tour);
  const canonical = `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionTourPath(tour.slug)}`;
  const schema = buildNuevaGeneracionSchema({ tour, facts, persona, canonical, relatedTours });
  const faq = buildNuevaGeneracionFaq(displayTitle, facts.area, persona);
  const timeSlots = facts.timeSlots.length ? facts.timeSlots : [{ hour: 9, minute: "00", period: "AM" as const }];
  const options = tour.options.map((option) => ({
    ...option,
    pickupTimes: normalizePickupTimes(option.pickupTimes)
  }));
  const operatingDays = parseOperatingDays(tour.operatingDays);
  const supplierName = tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Proactivitis";

  return (
    <main className="bg-white pb-24 text-slate-950 lg:pb-0">
      <StructuredData data={schema} />

      <section className="relative min-h-[620px] overflow-hidden bg-slate-950 text-white">
        <Image
          src={facts.heroImage}
          alt={displayTitle}
          fill
          priority
          className="object-cover opacity-65"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.94),rgba(2,6,23,0.72),rgba(2,6,23,0.18))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_390px] lg:px-12 lg:py-20">
          <div className="flex min-h-[500px] flex-col justify-end">
            <Link href={NUEVA_GENERACION_HUB_PATH} className="mb-8 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-200">
              Tours y experiencias
            </Link>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-emerald-300">{persona.segment}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{displayTitle}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-100">
              {conversion.heroSubtitle}
            </p>
            <TourTrustBadges badges={conversion.trustBadges} dark />
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#reservar" className="bg-emerald-400 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300">
                Reservar ahora
              </a>
              <a href="#detalles" className="border border-white/25 bg-white/10 px-6 py-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/15">
                Ver detalles
              </a>
            </div>
          </div>

          <aside className="self-end border border-white/15 bg-white/12 p-5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">Resumen de reserva</p>
            <div className="mt-5 grid gap-3">
              <FactLine label="Precio desde" value={`$${tour.price.toFixed(0)} USD`} />
              <FactLine label="Duracion" value={facts.duration} />
              <FactLine label="Salida inicial" value={facts.firstTime} />
              <FactLine label="Zona" value={facts.area} />
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-200">{persona.hook}</p>
          </aside>
        </div>
      </section>

      <section id="detalles" className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_380px] lg:px-12">
        <div className="space-y-8">
          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Por que reservar este tour</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">Una experiencia lista para reservar sin dudas</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              {tour.shortDescription ?? conversion.heroSubtitle}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ValueBlock title="Lo que vas a vivir" body={persona.promise} />
              <ValueBlock title="Como prepararte" body={persona.packing} />
              <ValueBlock title="Mejor momento para reservar" body={persona.urgency} />
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Elige segun tu plan</p>
            <h2 className="mt-3 text-2xl font-black">Formas de reservar esta experiencia</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {NUEVA_GENERACION_INTENTS.map((intent) => (
                <Link
                  key={intent.slug}
                  href={buildNuevaGeneracionIntentTourPath(tour.slug, intent.slug)}
                  className="border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white"
                >
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{intent.keyword}</p>
                  <h3 className="mt-2 text-sm font-black text-slate-950">{intent.titlePrefix}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{intent.audience}</p>
                </Link>
              ))}
            </div>
          </section>

          <TourIncludedExcludedSection includes={facts.includes} exclusions={conversion.exclusions} />

          <TourProofSection reviews={reviews} confidence={conversion.confidence} />

          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Itinerario</p>
            <div className="mt-5 space-y-4">
              {facts.itinerary.slice(0, 6).map((stop, index) => (
                <article key={`${stop.title}-${index}`} className="grid gap-3 border border-slate-200 bg-white p-4 md:grid-cols-[120px_1fr]">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">{stop.time}</p>
                  <div>
                    <h3 className="text-lg font-black text-slate-950">{stop.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{stop.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Fotos reales del producto</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {facts.images.slice(0, 6).map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image src={image} alt={`${tour.title} ${index + 1}`} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw" />
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Tours relacionados</p>
            <h2 className="mt-3 text-2xl font-black">Mas experiencias para comparar</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {relatedTours.map((related) => {
                const relatedImage = related.heroImage ?? parseJsonArray<string>(related.gallery)[0] ?? "/fototours/fotosimple.jpg";
                return (
                  <Link
                    key={related.id}
                    href={buildNuevaGeneracionTourPath(related.slug)}
                    className="grid grid-cols-[110px_1fr] gap-4 border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300"
                  >
                    <div className="relative min-h-[92px] overflow-hidden bg-slate-200">
                      <Image src={relatedImage} alt={related.title} fill className="object-cover" sizes="110px" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black leading-snug text-slate-950">{related.title}</h3>
                      <p className="mt-2 text-xs text-slate-600">${related.price.toFixed(0)} USD - {related.destination?.name ?? related.location}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Preguntas frecuentes</p>
            <div className="mt-5 space-y-3">
              {faq.map((item) => (
                <details key={item.question} className="border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-black text-slate-950">{item.question}</summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside id="reservar" className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="border border-slate-200 bg-white p-5 shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Reserva directa</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{displayTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {conversion.bookingPrompt} Operado por {supplierName}. Precio claro y confirmacion desde Proactivitis.
            </p>
            <div className="mt-5">
              <TourBookingWidget
                tourId={tour.id}
                basePrice={tour.price}
                timeSlots={timeSlots}
                operatingDays={operatingDays}
                options={options}
                supplierHasStripeAccount={Boolean(tour.SupplierProfile?.stripeAccountId)}
                platformSharePercent={tour.platformSharePercent ?? 20}
                tourTitle={displayTitle}
                tourImage={facts.heroImage}
              />
            </div>
          </div>
        </aside>
      </section>
      <TourMobileBookingBar price={tour.price} />
    </main>
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
