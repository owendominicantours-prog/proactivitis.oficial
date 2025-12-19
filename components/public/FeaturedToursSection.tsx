import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const fetchFeaturedTours = async () =>
  prisma.tour.findMany({
    where: {
      status: {
        not: "draft"
      }
    },
    orderBy: [
      { featured: "desc" },
      { createdAt: "desc" }
    ],
    take: 6,
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      shortDescription: true,
      heroImage: true,
      status: true
    }
  });

const statusLabel = (status: string) => {
  const mapping: Record<string, string> = {
    published: "Publicado",
    pending: "En revisión",
    draft: "Borrador",
    rejected: "Rechazado"
  };
  return mapping[status] ?? status;
};

export default async function FeaturedToursSection() {
  const tours = await fetchFeaturedTours();
  if (!tours.length) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 text-center text-sm text-slate-500 shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Próximamente verás lo mejor del catálogo aquí.</p>
        <p>Subiremos tours reales tan pronto como estén aprobados por el equipo.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {tours.map((tour) => (
        <article key={tour.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          {tour.heroImage ? (
            <div className="relative h-44 w-full overflow-hidden rounded-2xl">
              <Image
                src={tour.heroImage}
                alt={tour.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ) : (
            <div className="h-44 rounded-2xl bg-slate-100" />
          )}
          <div className="mt-4 space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">{tour.title}</h3>
            {tour.shortDescription && <p className="text-sm text-slate-500">{tour.shortDescription}</p>}
            <p className="text-sm font-semibold text-slate-800">${tour.price.toFixed(2)}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{statusLabel(tour.status)}</p>
            <Link
              href={`/tours/${tour.slug}`}
              className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Ver detalles
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
