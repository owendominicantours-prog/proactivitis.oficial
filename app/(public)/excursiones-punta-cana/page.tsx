import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import StructuredData from "@/components/schema/StructuredData";
import {
  NUEVA_GENERACION_BASE_URL,
  NUEVA_GENERACION_HUB_PATH,
  NUEVA_GENERACION_INTENTS,
  buildNuevaGeneracionIntentPath,
  buildNuevaGeneracionTourPath,
  getNuevaGeneracionTours,
  parseDuration,
  resolveTourPersona
} from "@/lib/nuevaGeneracionTours";

export const metadata: Metadata = {
  title: "Tours y experiencias en Punta Cana | Proactivitis",
  description:
    "Reserva tours y experiencias en Punta Cana con fotos reales, precio claro, soporte local y confirmacion directa.",
  alternates: {
    canonical: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_HUB_PATH}`
  }
};

export const revalidate = 86400;

export default async function NuevaGeneracionToursIndexPage() {
  const tours = await getNuevaGeneracionTours();
  const canonical = `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_HUB_PATH}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tours y experiencias Proactivitis",
    url: canonical,
    description: "Coleccion de tours y experiencias disponibles para reservar con Proactivitis.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tours.map((tour, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tour.title,
        url: `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionTourPath(tour.slug)}`
      }))
    }
  };

  return (
    <main className="bg-white text-slate-950">
      <StructuredData data={schema} />
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Tours y experiencias</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
              Elige tu proxima experiencia en Punta Cana
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">
              Compara tours por tipo de plan, precio, horario, fotos reales y detalles importantes antes de reservar.
              Nuestro equipo te ayuda a confirmar la experiencia y coordinar los datos de salida.
            </p>
          </div>
          <div className="grid gap-3 self-end sm:grid-cols-3">
            <div className="border border-white/15 bg-white/10 p-5">
              <p className="text-4xl font-black">{tours.length}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Tours activos</p>
            </div>
            <div className="border border-white/15 bg-white/10 p-5">
              <p className="text-4xl font-black">{NUEVA_GENERACION_INTENTS.length}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Intenciones</p>
            </div>
            <div className="border border-white/15 bg-white/10 p-5">
              <p className="text-4xl font-black">1</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Reserva directa</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Elige por tipo de viaje</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Encuentra la opcion que mejor encaja con tu plan</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {NUEVA_GENERACION_INTENTS.map((intent) => (
              <Link
                key={intent.slug}
                href={buildNuevaGeneracionIntentPath(intent.slug)}
                className="border border-slate-200 bg-white p-4 transition hover:border-emerald-300"
              >
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
            const persona = resolveTourPersona(tour);
            const hero = tour.heroImage ?? parseFirstGalleryImage(tour.gallery) ?? "/fototours/fotosimple.jpg";
            const area = tour.departureDestination?.name ?? tour.destination?.name ?? tour.microZone?.name ?? tour.location;
            return (
              <article key={tour.id} className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[16/10] bg-slate-100">
                  <Image src={hero} alt={tour.title} fill className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                      {persona.segment}
                    </span>
                    <span className="text-sm font-black text-slate-950">${tour.price.toFixed(0)} USD</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black leading-snug text-slate-950">{tour.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {tour.shortDescription ?? persona.promise}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <span className="border border-slate-100 bg-slate-50 px-3 py-2">{parseDuration(tour.duration)}</span>
                    <span className="border border-slate-100 bg-slate-50 px-3 py-2">{area ?? "Punta Cana"}</span>
                  </div>
                  <Link
                    href={buildNuevaGeneracionTourPath(tour.slug)}
                    className="inline-flex w-full items-center justify-center bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                  >
                    Ver experiencia
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

const parseFirstGalleryImage = (gallery?: string | null) => {
  if (!gallery) return null;
  try {
    const parsed = JSON.parse(gallery);
    return Array.isArray(parsed) && parsed[0] ? String(parsed[0]) : null;
  } catch {
    return null;
  }
};
