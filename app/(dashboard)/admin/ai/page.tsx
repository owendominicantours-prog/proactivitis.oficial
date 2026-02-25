import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminAiToolsPage() {
  const [featuredTours, pendingBookings, seoOnlyTours, draftTours] = await Promise.all([
    prisma.tour.count({ where: { featured: true } }),
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.tour.count({ where: { status: "seo_only" } }),
    prisma.tour.count({ where: { status: "draft" } })
  ]);

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">AI Tools</p>
        <h1 className="text-3xl font-semibold text-slate-900">Centro de automatizacion</h1>
        <p className="text-sm text-slate-600">Panel rapido para priorizar contenido, reservas pendientes y volumen SEO.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-slate-500">Featured tours</p><p className="mt-2 text-3xl font-semibold text-slate-900">{featuredTours}</p></article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-amber-700">Reservas pendientes</p><p className="mt-2 text-3xl font-semibold text-amber-900">{pendingBookings}</p></article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Tours SEO only</p><p className="mt-2 text-3xl font-semibold text-emerald-900">{seoOnlyTours}</p></article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-sky-700">Borradores</p><p className="mt-2 text-3xl font-semibold text-sky-900">{draftTours}</p></article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link href="/admin/landings" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">SEO</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Gestionar landings</p>
          <p className="mt-1 text-sm text-slate-600">Refina slugs, filtros y performance SEO desde admin.</p>
        </Link>
        <Link href="/admin/tours" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Contenido</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Optimizar tours</p>
          <p className="mt-1 text-sm text-slate-600">Publica, corrige y organiza tours para conversion.</p>
        </Link>
        <Link href="/admin/bookings" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Operacion</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Revisar reservas</p>
          <p className="mt-1 text-sm text-slate-600">Atiende pendientes para evitar friccion de ventas.</p>
        </Link>
      </section>
    </div>
  );
}
