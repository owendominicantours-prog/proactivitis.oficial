import { prisma } from "@/lib/prisma";
import { TourModerationConsole, SimpleTourRecord } from "@/components/admin/tours/TourModerationConsole";

type SearchParams = {
  q?: string;
  status?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminToursPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const query = (params.q ?? "").trim().toLowerCase();
  const statusFilter = params.status ?? "all";

  const tours = await prisma.tour.findMany({
    where: {
      status: {
        not: "draft"
      }
    },
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

  const statusPriority = ["under_review", "pending", "needs_changes", "draft", "paused", "published"];
  const sortedTours = [...tours].sort((a, b) => {
    const aPriority = statusPriority.indexOf(a.status);
    const bPriority = statusPriority.indexOf(b.status);
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  let filteredTours = sortedTours;
  if (statusFilter !== "all") {
    filteredTours = filteredTours.filter((tour) => tour.status === statusFilter);
  }
  if (query) {
    filteredTours = filteredTours.filter((tour) =>
      [tour.title, tour.slug, tour.SupplierProfile?.company, tour.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }

  const simplified: SimpleTourRecord[] = filteredTours.map((tour) => ({
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
    country: tour.departureDestination?.country?.name ?? tour.location
  }));

  const statusCount = (status: string) => tours.filter((tour) => tour.status === status).length;

  return (
    <div className="space-y-8">
      <header className="space-y-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Tours</h1>
        <p className="text-sm text-slate-500">
          Modera tours de proveedores con filtros por estado y busqueda rapida.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total</p><p className="mt-2 text-3xl font-semibold text-slate-900">{tours.length}</p></article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-amber-700">Under review</p><p className="mt-2 text-3xl font-semibold text-amber-900">{statusCount("under_review")}</p></article>
        <article className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-rose-700">Needs changes</p><p className="mt-2 text-3xl font-semibold text-rose-900">{statusCount("needs_changes")}</p></article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Published</p><p className="mt-2 text-3xl font-semibold text-emerald-900">{statusCount("published")}</p></article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col text-sm text-slate-600 md:col-span-2">
            Buscar
            <input name="q" defaultValue={params.q ?? ""} placeholder="Titulo, slug, proveedor o location" className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Estado
            <select name="status" defaultValue={statusFilter} className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <option value="all">Todos</option>
              <option value="under_review">under_review</option>
              <option value="pending">pending</option>
              <option value="needs_changes">needs_changes</option>
              <option value="paused">paused</option>
              <option value="published">published</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Filtrar</button>
            <a href="/admin/tours" className="w-full rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:border-slate-500">Limpiar</a>
          </div>
        </form>
      </section>

      <section className="space-y-6 rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resultados: {simplified.length}</p>
        <TourModerationConsole tours={simplified} />
      </section>
    </div>
  );
}
