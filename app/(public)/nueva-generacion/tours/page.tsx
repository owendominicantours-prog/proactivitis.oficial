import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import StructuredData from "@/components/schema/StructuredData";
import {
  NUEVA_GENERACION_BASE_URL,
  NUEVA_GENERACION_PATH,
  getNuevaGeneracionTours,
  parseDuration,
  resolveTourPersona
} from "@/lib/nuevaGeneracionTours";

export const metadata: Metadata = {
  title: "Nueva Generacion de Tours | Proactivitis",
  description:
    "Landings comerciales nuevas para los tours activos de Proactivitis, creadas con contenido propio, fotos reales y schema avanzado.",
  alternates: {
    canonical: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}`
  }
};

export const revalidate = 86400;

export default async function NuevaGeneracionToursIndexPage() {
  const tours = await getNuevaGeneracionTours();
  const canonical = `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Nueva Generacion de Tours Proactivitis",
    url: canonical,
    description: "Coleccion separada de landings comerciales nuevas para medir posicionamiento organico.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tours.map((tour, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tour.title,
        url: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}/${tour.slug}`
      }))
    }
  };

  return (
    <main className="bg-white text-slate-950">
      <StructuredData data={schema} />
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Nueva Generacion</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
              Landings nuevas para vender los tours activos de Proactivitis
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">
              Esta seccion vive separada de las paginas actuales. Cada tour tiene una landing nueva con copy comercial,
              fotos del producto, datos operativos y schema avanzado para medir su rendimiento de forma limpia.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            <div className="border border-white/15 bg-white/10 p-5">
              <p className="text-4xl font-black">{tours.length}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Tours activos</p>
            </div>
            <div className="border border-white/15 bg-white/10 p-5">
              <p className="text-4xl font-black">1</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Sitemap propio</p>
            </div>
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
                    href={`${NUEVA_GENERACION_PATH}/${tour.slug}`}
                    className="inline-flex w-full items-center justify-center bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                  >
                    Ver landing nueva
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
