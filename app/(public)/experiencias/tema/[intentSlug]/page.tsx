import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import StructuredData from "@/components/schema/StructuredData";
import {
  NUEVA_GENERACION_BASE_URL,
  NUEVA_GENERACION_INTENT_PATH,
  NUEVA_GENERACION_INTENTS,
  NUEVA_GENERACION_PATH,
  getNuevaGeneracionIntent,
  getNuevaGeneracionTours,
  parseDuration,
  resolveTourPersona
} from "@/lib/nuevaGeneracionTours";

type PageProps = {
  params: Promise<{ intentSlug: string }>;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return NUEVA_GENERACION_INTENTS.map((intent) => ({ intentSlug: intent.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { intentSlug } = await params;
  const intent = getNuevaGeneracionIntent(intentSlug);
  if (!intent) {
    return {
      title: "Coleccion no encontrada | Proactivitis",
      robots: { index: false, follow: false }
    };
  }

  const canonical = `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_INTENT_PATH}/${intent.slug}`;
  const title = `${intent.titlePrefix} | Proactivitis`;
  const description = `Coleccion de tours Proactivitis para ${intent.audience}. ${intent.angle}.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website"
    }
  };
}

export default async function NuevaGeneracionIntentHubPage({ params }: PageProps) {
  const { intentSlug } = await params;
  const intent = getNuevaGeneracionIntent(intentSlug);
  if (!intent) notFound();

  const tours = await getNuevaGeneracionTours();
  const canonical = `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_INTENT_PATH}/${intent.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#page`,
        name: `${intent.titlePrefix} Proactivitis`,
        url: canonical,
        description: `Tours organizados para ${intent.audience}. ${intent.angle}.`,
        mainEntity: { "@id": `${canonical}#itemlist` }
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#itemlist`,
        name: `Lista de ${intent.keyword}`,
        itemListElement: tours.map((tour, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tour.title,
          url: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}/${tour.slug}/${intent.slug}`
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Experiencias", item: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}` },
          { "@type": "ListItem", position: 2, name: intent.label, item: canonical }
        ]
      }
    ]
  };

  return (
    <main className="bg-white text-slate-950">
      <StructuredData data={schema} />

      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12">
          <div>
            <Link href={NUEVA_GENERACION_PATH} className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
              Tours y experiencias
            </Link>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.34em] text-slate-300">{intent.keyword}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{intent.titlePrefix} en Proactivitis</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">
              Seleccion de tours para {intent.audience}. {intent.angle}.
            </p>
          </div>
          <aside className="self-end border border-white/15 bg-white/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">Coleccion</p>
            <p className="mt-4 text-5xl font-black">{tours.length}</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">{intent.proof}</p>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour) => {
            const persona = resolveTourPersona(tour);
            const hero = tour.heroImage ?? parseFirstGalleryImage(tour.gallery) ?? "/fototours/fotosimple.jpg";
            const area = tour.departureDestination?.name ?? tour.destination?.name ?? tour.microZone?.name ?? tour.location ?? "Punta Cana";
            return (
              <article key={tour.id} className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[16/10] bg-slate-100">
                  <Image src={hero} alt={tour.title} fill className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">{area}</span>
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
                    <span className="border border-slate-100 bg-slate-50 px-3 py-2">{persona.segment}</span>
                  </div>
                  <Link
                    href={`${NUEVA_GENERACION_PATH}/${tour.slug}/${intent.slug}`}
                    className="inline-flex w-full items-center justify-center bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                  >
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

const parseFirstGalleryImage = (gallery?: string | null) => {
  if (!gallery) return null;
  try {
    const parsed = JSON.parse(gallery);
    return Array.isArray(parsed) && parsed[0] ? String(parsed[0]) : null;
  } catch {
    return null;
  }
};
