import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATIC_VARIANTS } from "@/lib/tourVariantCatalog";
import { importStaticVariant, deleteTourVariant } from "./actions";

export const metadata = {
  title: "Variantes de tours | Admin"
};

export default async function TourVariantsPage() {
  const variants = await prisma.tourVariant.findMany({
    orderBy: { updatedAt: "desc" }
  });
  const variantMap = new Map(variants.map((variant) => [variant.slug, variant]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Variantes de tours</p>
          <h1 className="text-2xl font-semibold text-slate-900">Editor de variantes</h1>
        </div>
        <Link
          href="/admin/tour-variants/new"
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Crear variante
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Variantes en base de datos</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {variants.length === 0 && (
            <p className="text-sm text-slate-500">Aun no hay variantes creadas.</p>
          )}
          {variants.map((variant) => (
            <div key={variant.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{variant.type}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{variant.slug}</p>
              <p className="text-xs text-slate-500">Estado: {variant.status}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/admin/tour-variants/${variant.id}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  Editar
                </Link>
                <Link
                  href={`/thingtodo/tours/${variant.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  Ver landing
                </Link>
                <form action={deleteTourVariant.bind(null, variant.id)}>
                  <button className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600">
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Variantes base (codigo)</h2>
        <p className="mt-2 text-sm text-slate-500">
          Importa una variante base para editarla desde el panel.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STATIC_VARIANTS.map((variant) => {
            const existing = variantMap.get(variant.slug);
            return (
              <div key={variant.slug} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{variant.type}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{variant.slug}</p>
                <p className="text-xs text-slate-500">
                  {existing ? `Editando en BD (${existing.status})` : "Solo en codigo"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {existing ? (
                    <Link
                      href={`/admin/tour-variants/${existing.id}`}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      Editar
                    </Link>
                  ) : (
                    <form action={importStaticVariant.bind(null, variant.slug)}>
                      <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        Importar
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/thingtodo/tours/${variant.slug}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    Ver landing
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
