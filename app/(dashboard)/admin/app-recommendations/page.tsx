import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { updateAppRecommendationsAction } from "@/app/(dashboard)/admin/app-recommendations/actions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams?: Promise<{
    saved?: string;
  }>;
};

const statusLabel: Record<string, string> = {
  published: "Publicado",
  draft: "Borrador",
  paused: "Pausado",
  seo_only: "Solo SEO",
  under_review: "Revision",
  pending: "Pendiente",
  needs_changes: "Cambios"
};

export default async function AdminAppRecommendationsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const tours = await prisma.tour.findMany({
    orderBy: [{ featured: "desc" }, { status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      location: true,
      category: true,
      status: true,
      featured: true,
      heroImage: true,
      createdAt: true
    }
  });

  const publishedTours = tours.filter((tour) => tour.status === "published");
  const recommendedCount = tours.filter((tour) => tour.featured).length;
  const recommendedPreview = tours.filter((tour) => tour.featured && tour.status === "published").slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">App Proactivitis</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">Recomendados de la app</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Elige los tours que deben salir primero en la seccion de recomendados del inicio de la app. La app muestra los primeros 5 tours publicados marcados aqui.
            </p>
          </div>
          <Link
            href="/admin/tours"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            Ver tours
          </Link>
        </div>
        {params?.saved === "1" ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            Recomendados actualizados. La app puede tardar unos segundos en refrescar cache.
          </div>
        ) : null}
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Seleccionados" value={recommendedCount} />
        <MetricCard label="Publicados disponibles" value={publishedTours.length} />
        <MetricCard label="Visible en inicio" value={Math.min(recommendedPreview.length, 5)} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Vista previa en la app</h2>
            <p className="text-sm text-slate-500">Estos son los primeros tours publicados que vera el cliente.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            Maximo visible: 5
          </span>
        </div>
        {recommendedPreview.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-5">
            {recommendedPreview.map((tour, index) => (
              <article key={tour.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="aspect-[4/3] bg-slate-200">
                  {tour.heroImage ? <img src={tour.heroImage} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-700">#{index + 1}</p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{tour.title}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            No hay tours publicados marcados como recomendados.
          </p>
        )}
      </section>

      <form action={updateAppRecommendationsAction} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Seleccionar tours</h2>
            <p className="text-sm text-slate-500">Marca los productos que quieres empujar en la app. Los no publicados no salen en la app aunque esten marcados.</p>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Guardar recomendados
          </button>
        </div>

        <div className="grid gap-3">
          {tours.map((tour) => {
            const isPublished = tour.status === "published";
            return (
              <label
                key={tour.id}
                className={`grid cursor-pointer gap-4 rounded-xl border p-4 transition md:grid-cols-[auto,80px,1fr,auto] md:items-center ${
                  tour.featured ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  name="tourId"
                  value={tour.id}
                  defaultChecked={tour.featured}
                  className="h-5 w-5 rounded border-slate-300 text-sky-600"
                />
                <div className="h-20 w-20 overflow-hidden rounded-lg bg-slate-100">
                  {tour.heroImage ? <img src={tour.heroImage} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-950">{tour.title}</p>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                      isPublished ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}>
                      {statusLabel[tour.status] ?? tour.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {tour.location || "Sin zona"} · {tour.category || "Tour"} · ${tour.price.toFixed(0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">/{tour.slug}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  tour.featured ? "bg-sky-700 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {tour.featured ? "Recomendado" : "Normal"}
                </span>
              </label>
            );
          })}
        </div>
      </form>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value.toLocaleString()}</p>
    </article>
  );
}
