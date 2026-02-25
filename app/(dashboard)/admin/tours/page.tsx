import { prisma } from "@/lib/prisma";
import { TourModerationConsole, SimpleTourRecord } from "@/components/admin/tours/TourModerationConsole";

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({
    include: {
      SupplierProfile: {
        select: {
          company: true
        }
      },
      departureDestination: {
        select: {
          country: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

  const statusCount = (status: string) => tours.filter((tour) => tour.status === status).length;

  const statusPriority = ["under_review", "pending", "needs_changes", "draft", "paused", "published", "seo_only"];
  const sortedTours = [...tours].sort((a, b) => {
    const aPriority = statusPriority.indexOf(a.status);
    const bPriority = statusPriority.indexOf(b.status);
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const simplified: SimpleTourRecord[] = sortedTours.map((tour) => ({
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    price: tour.price,
    duration: tour.duration,
    description: tour.description,
    language: tour.language,
    includes: tour.includes,
    location: tour.location,
    supplier: {
      name: tour.SupplierProfile?.company ?? "Proveedor sin nombre"
    },
    status: tour.status,
    heroImage: tour.heroImage ?? null,
    country: tour.departureDestination?.country?.name ?? tour.location,
    adminNote: tour.adminNote ?? null,
    createdAt: tour.createdAt.toISOString(),
    updatedAt: tour.createdAt.toISOString()
  }));

  return (
    <div className="space-y-8">
      <header className="space-y-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Tours</h1>
        <p className="text-sm text-slate-500">
          Moderacion completa y organizada por estado: publicados, borradores y cola de revision.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Total" value={tours.length} color="slate" />
        <MetricCard label="Revisión" value={statusCount("under_review") + statusCount("pending") + statusCount("needs_changes")} color="amber" />
        <MetricCard label="Publicados" value={statusCount("published")} color="emerald" />
        <MetricCard label="Borradores" value={statusCount("draft")} color="slate" />
        <MetricCard label="Pausados" value={statusCount("paused")} color="indigo" />
        <MetricCard label="SEO only" value={statusCount("seo_only")} color="cyan" />
      </section>

      <section className="space-y-6 rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <TourModerationConsole tours={simplified} />
      </section>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: "slate" | "amber" | "emerald" | "indigo" | "cyan" }) {
  const colorClass = {
    slate: "border-slate-200 bg-white text-slate-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-900",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-900"
  }[color];

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${colorClass}`}>
      <p className="text-xs uppercase tracking-[0.3em]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value.toLocaleString()}</p>
    </article>
  );
}

