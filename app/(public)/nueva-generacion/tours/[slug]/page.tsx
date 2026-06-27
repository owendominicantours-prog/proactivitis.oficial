import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import StructuredData from "@/components/schema/StructuredData";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import {
  NUEVA_GENERACION_BASE_URL,
  NUEVA_GENERACION_PATH,
  buildNuevaGeneracionFaq,
  buildNuevaGeneracionSchema,
  buildTourFacts,
  getNuevaGeneracionTourBySlug,
  parseJsonArray,
  resolveTourPersona,
  toAbsoluteImage
} from "@/lib/nuevaGeneracionTours";

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
  const canonical = `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}/${tour.slug}`;
  const description =
    tour.shortDescription ??
    `${tour.title}: ${persona.promise}. Reserva con precio claro, fotos reales y soporte local.`;

  return {
    title: `${tour.title} | Nueva Generacion Proactivitis`,
    description,
    alternates: { canonical },
    openGraph: {
      title: tour.title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: toAbsoluteImage(facts.heroImage), alt: tour.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: tour.title,
      description,
      images: [toAbsoluteImage(facts.heroImage)]
    }
  };
}

export default async function NuevaGeneracionTourLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const tour = await getNuevaGeneracionTourBySlug(slug);
  if (!tour) notFound();

  const facts = buildTourFacts(tour);
  const persona = resolveTourPersona(tour);
  const canonical = `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}/${tour.slug}`;
  const schema = buildNuevaGeneracionSchema({ tour, facts, persona, canonical });
  const faq = buildNuevaGeneracionFaq(tour.title, facts.area, persona);
  const timeSlots = facts.timeSlots.length ? facts.timeSlots : [{ hour: 9, minute: "00", period: "AM" as const }];
  const options = tour.options.map((option) => ({
    ...option,
    pickupTimes: normalizePickupTimes(option.pickupTimes)
  }));
  const operatingDays = parseOperatingDays(tour.operatingDays);
  const supplierName = tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Proactivitis";

  return (
    <main className="bg-white text-slate-950">
      <StructuredData data={schema} />

      <section className="relative min-h-[620px] overflow-hidden bg-slate-950 text-white">
        <Image
          src={facts.heroImage}
          alt={tour.title}
          fill
          priority
          className="object-cover opacity-65"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.94),rgba(2,6,23,0.72),rgba(2,6,23,0.18))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_390px] lg:px-12 lg:py-20">
          <div className="flex min-h-[500px] flex-col justify-end">
            <Link href={NUEVA_GENERACION_PATH} className="mb-8 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-200">
              Nueva Generacion
            </Link>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-emerald-300">{persona.segment}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{tour.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-100">
              {tour.shortDescription ?? persona.promise}
            </p>
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
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">Decision rapida</p>
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
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Por que esta landing existe</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">Una pagina nueva creada solo para vender este tour</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Esta landing no reutiliza la ficha actual. Presenta {tour.title} como un producto comercial independiente:
              fotos del producto, beneficios por tipo de viajero, detalles de decision, itinerario, FAQ y schema avanzado
              para que Google pueda entender la oferta como una pagina propia.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ValueBlock title="Promesa" body={persona.promise} />
              <ValueBlock title="Preparacion" body={persona.packing} />
              <ValueBlock title="Cupo" body={persona.urgency} />
            </div>
          </section>

          <section className="border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Lo que compra el cliente</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {facts.includes.slice(0, 8).map((item) => (
                <div key={item} className="border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Itinerario comercial</p>
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
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Preguntas que convierten</p>
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
            <h2 className="mt-2 text-2xl font-black text-slate-950">{tour.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Operado por {supplierName}. Precio claro y confirmacion desde Proactivitis.</p>
            <div className="mt-5">
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
          </div>
        </aside>
      </section>
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

const parseOperatingDays = (value?: string | null) => {
  if (!value) return undefined;
  const parsed = parseJsonArray<string>(value);
  if (parsed.length) return parsed;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizePickupTimes = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const times = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return times.length ? times : null;
};
