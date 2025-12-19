import { prisma } from "@/lib/prisma";
import { TourCard } from "@/components/public/TourCard";

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
      location: true,
      duration: true,
      capacity: true,
      status: true
    }
  });

const statusHint = (status: string) => {
  const mapping: Record<string, string> = {
    published: "Publicado",
    pending: "En revisión",
    rejected: "Rechazado"
  };
  return mapping[status] ?? status;
};

export default async function FeaturedToursSection() {
  const tours = await fetchFeaturedTours();
  if (!tours.length) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-[0_35px_80px_rgba(15,23,42,0.12)]">
        <p className="text-lg font-semibold text-slate-900">Próximamente verás lo mejor del catálogo aquí.</p>
        <p>Subiremos tours reales tan pronto estén aprobados por el equipo.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {tours.map((tour) => (
        <TourCard
          key={tour.id}
          slug={tour.slug}
          title={tour.title}
          location={tour.location ?? "Destino Premium"}
          zone={tour.location ? tour.location.split(",")[0] : "Zona exclusiva"}
          price={tour.price}
          image={tour.heroImage ?? "/fototours/fototour.jpeg"}
          description={tour.shortDescription ?? undefined}
          tags={[statusHint(tour.status), "Experiencia Top"]}
          rating={4.9}
          maxPax={tour.capacity ?? 12}
          duration={tour.duration ?? "4 horas"}
          pickupIncluded={true}
        />
      ))}
    </div>
  );
}
