import { prisma } from "@/lib/prisma";
import { TourCard } from "@/components/public/TourCard";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";

const fetchFeaturedTours = async () =>
  prisma.tour.findMany({
    where: {
      status: {
        not: "draft"
      },
      slug: { not: HIDDEN_TRANSFER_SLUG }
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
      capacity: true
    }
  });

const formatDurationValue = (value?: string | null) => {
  if (!value) return "4 horas";
  try {
    const parsed = JSON.parse(value);
    if (parsed?.value && parsed?.unit) {
      return `${parsed.value} ${parsed.unit}`;
    }
  } catch {
    // ignore
  }
  return value;
};

const selectRotatingTours = (tours: Awaited<ReturnType<typeof fetchFeaturedTours>>) => {
  if (!tours.length) return [];
  const copy = [...tours];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(3, copy.length));
};

export default async function FeaturedToursSection() {
  const tours = await fetchFeaturedTours();
  const displayedTours = selectRotatingTours(tours);

  if (!tours.length) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-[0_35px_80px_rgba(15,23,42,0.12)]">
        <p className="text-lg font-semibold text-slate-900">Próximamente verás lo mejor del catálogo aquí.</p>
        <p>Subiremos tours reales tan pronto estén aprobados por el equipo.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {displayedTours.map((tour) => (
        <TourCard
          key={tour.id}
          slug={tour.slug}
          title={tour.title}
          location={tour.location ?? "Destino Premium"}
          zone={tour.location ? tour.location.split(",")[0] : "Punta Cana"}
          price={tour.price}
          image={tour.heroImage ?? "/fototours/fototour.jpeg"}
          description={tour.shortDescription ?? undefined}
          tags={["Experiencia Top"]}
          rating={4.9}
          maxPax={tour.capacity ?? 15}
          duration={formatDurationValue(tour.duration)}
          pickupIncluded={true}
        />
      ))}
    </div>
  );
}
