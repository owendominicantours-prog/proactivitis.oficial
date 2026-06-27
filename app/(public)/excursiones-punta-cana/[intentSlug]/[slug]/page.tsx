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
  buildNuevaGeneracionConversionCopy,
  buildNuevaGeneracionIntentTourPath,
  buildNuevaGeneracionTourPath,
  buildIntentLandingCopy,
  buildNuevaGeneracionFaq,
  buildNuevaGeneracionSchema,
  buildTourFacts,
  getNuevaGeneracionIntent,
  getNuevaGeneracionRelatedTours,
  getNuevaGeneracionTourBySlug,
  normalizePickupTimes,
  parseJsonArray,
  parseOperatingDays,
  resolveTourPersona,
  toAbsoluteImage
} from "@/lib/nuevaGeneracionTours";
import { getApprovedTourReviews } from "@/lib/tourReviews";

type PageProps = {
  params: Promise<{ slug: string; intentSlug: string }>;
};

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, intentSlug } = await params;
  const [tour, intent] = await Promise.all([
    getNuevaGeneracionTourBySlug(slug),
    Promise.resolve(getNuevaGeneracionIntent(intentSlug))
  ]);

  if (!tour || !intent) {
    return {
      title: "Pagina no encontrada | Proactivitis",
      robots: { index: false, follow: false }
    };
  }

  const facts = buildTourFacts(tour);
  const persona = resolveTourPersona(tour);
  const copy = buildIntentLandingCopy({ tour, facts, persona, intent });
  const canonical = `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionIntentTourPath(tour.slug, intent.slug)}`;

  return {
    title: `${copy.title} | Proactivitis`,
    description: copy.description,
    alternates: { canonical },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonical,
      type: "website",
      images: [{ url: toAbsoluteImage(facts.heroImage), alt: copy.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [toAbsoluteImage(facts.heroImage)]
    }
  };
}

export default async function NuevaGeneracionIntentTourPage({ params }: PageProps) {
  const { slug, intentSlug } = await params;
  const intent = getNuevaGeneracionIntent(intentSlug);
  if (!intent) notFound();

  const tour = await getNuevaGeneracionTourBySlug(slug);
  if (!tour) notFound();

  const [relatedTours, reviews] = await Promise.all([
    getNuevaGeneracionRelatedTours(tour, 8),
    getApprovedTourReviews(tour.id, 3)
  ]);
  const facts = buildTourFacts(tour);
  const persona = resolveTourPersona(tour);
  const conversion = buildNuevaGeneracionConversionCopy({ tour, facts, persona });
  const copy = buildIntentLandingCopy({ tour, facts, persona, intent });
  const canonical = `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionIntentTourPath(tour.slug, intent.slug)}`;
  const schema = buildNuevaGeneracionSchema({ tour, facts, persona, canonical, intent, relatedTours });
  const faq = buildNuevaGeneracionFaq(tour.title, facts.area, persona, intent);
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
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_430px] lg:px-12 lg:py-16">
          <div>
            <Link href={buildNuevaGeneracionTourPath(tour.slug)} className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
              Tours y experiencias
            </Link>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.34em] text-slate-300">{copy.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">{conversion.heroSubtitle}</p>
            <TourTrustBadges badges={conversion.trustBadges} dark />
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#reservar" className="bg-emerald-400 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300">
                {copy.cta}
              </a>
              <a href="#comparar" className="border border-white/20 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/15">
                Ver tours relacionados
              </a>
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
            <h2 className="mt-3 text-3xl font-black">Pensado para este tipo de viaje</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {copy.decision.map((item) => (
                <article key={item.title} className="border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Detalles de la experiencia</p>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <MiniStat label="Precio" value={`$${tour.price.toFixed(0)} USD`} />
              <MiniStat label="Duracion" value={facts.duration} />
              <MiniStat label="Salida" value={facts.firstTime} />
              <MiniStat label="Zona" value={facts.area} />
            </div>
          </section>

          <TourIncludedExcludedSection includes={facts.includes} exclusions={conversion.exclusions} />

          <TourProofSection reviews={reviews} confidence={conversion.confidence} />

          <section id="comparar" className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Tours relacionados</p>
            <h2 className="mt-3 text-2xl font-black">Alternativas relacionadas para comparar antes de reservar</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {relatedTours.map((related) => {
                const relatedImage = related.heroImage ?? parseJsonArray<string>(related.gallery)[0] ?? "/fototours/fotosimple.jpg";
                return (
                  <Link
                    key={related.id}
                    href={buildNuevaGeneracionIntentTourPath(related.slug, intent.slug)}
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

        <aside id="reservar" className="lg:sticky lg:top-20 lg:self-start">
          <div className="border border-slate-200 bg-white p-5 shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">{intent.label}</p>
            <h2 className="mt-2 text-2xl font-black">{tour.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {conversion.bookingPrompt} Operado por {supplierName}. Confirmacion desde Proactivitis.
            </p>
            <TourBookingWidget
              tourId={tour.id}
              basePrice={tour.price}
              timeSlots={timeSlots}
              operatingDays={operatingDays}
              options={options}
              supplierHasStripeAccount={Boolean(tour.SupplierProfile?.stripeAccountId)}
              platformSharePercent={tour.platformSharePercent ?? 20}
              tourTitle={tour.title}
              tourImage={facts.heroImage}
            />
          </div>
        </aside>
      </section>
      <TourMobileBookingBar price={tour.price} cta={copy.cta} />
    </main>
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
