import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  approveTourReview,
  approveTransferReview,
  rejectTourReview,
  rejectTransferReview
} from "./actions";

export const metadata = {
  title: "Resenas pendientes | Proactivitis"
};

type SearchParams = {
  q?: string;
  section?: "all" | "tour" | "transfer";
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminReviewsPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const query = (params.q ?? "").trim().toLowerCase();
  const section = params.section ?? "all";

  const [pendingTours, pendingTransfers] = await Promise.all([
    prisma.tourReview.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        Tour: { select: { title: true, slug: true } },
        Booking: { select: { id: true, customerEmail: true } }
      }
    }),
    prisma.transferReview.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        Booking: {
          select: {
            id: true,
            customerEmail: true,
            Tour: { select: { title: true } }
          }
        }
      }
    })
  ]);

  const tourRows = query
    ? pendingTours.filter((review) =>
        [review.customerName, review.customerEmail, review.title, review.Tour?.title]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      )
    : pendingTours;

  const transferRows = query
    ? pendingTransfers.filter((review) =>
        [review.customerName, review.customerEmail, review.title, review.transferServiceLabel]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      )
    : pendingTransfers;

  const showTours = section === "all" || section === "tour";
  const showTransfers = section === "all" || section === "transfer";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Resenas</p>
        <h1 className="text-3xl font-semibold text-slate-900">Moderacion de resenas</h1>
        <p className="text-sm text-slate-500">Aprueba o rechaza resenas con filtros rapidos por tipo y busqueda.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total pendientes</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{(pendingTours.length + pendingTransfers.length).toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Tours</p>
          <p className="mt-2 text-3xl font-semibold text-sky-900">{pendingTours.length.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-700">Transfers</p>
          <p className="mt-2 text-3xl font-semibold text-indigo-900">{pendingTransfers.length.toLocaleString()}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col text-sm text-slate-600 md:col-span-2">
            Buscar
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Cliente, titulo o servicio"
              className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Tipo
            <select
              name="section"
              defaultValue={section}
              className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="tour">Tours</option>
              <option value="transfer">Transfers</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Filtrar</button>
            <Link href="/admin/reviews" className="w-full rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:border-slate-500">Limpiar</Link>
          </div>
        </form>
      </section>

      {showTours && (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Tours</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {tourRows.length}
          </span>
        </div>
        {tourRows.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No hay resenas pendientes de tours.
          </div>
        ) : (
          <div className="space-y-4">
            {tourRows.map((review) => (
              <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tour</p>
                    <Link href={`/tours/${review.Tour.slug}`} className="text-lg font-semibold text-slate-900">
                      {review.Tour.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">Reserva: {review.bookingId ?? "Sin reserva"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Calificacion</p>
                    <p className="text-2xl font-black text-amber-500">{review.rating}/5</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{review.customerName}</p>
                  <p className="text-xs text-slate-400">{review.customerEmail}</p>
                  {review.title && <p className="text-sm font-semibold text-slate-800">{review.title}</p>}
                  <p className="whitespace-pre-wrap">{review.body}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <form action={approveTourReview.bind(null, review.id)}>
                    <button className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                      Aprobar
                    </button>
                  </form>
                  <form action={rejectTourReview.bind(null, review.id)}>
                    <button className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                      Rechazar
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      )}

      {showTransfers && (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Transfers</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {transferRows.length}
          </span>
        </div>
        {transferRows.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No hay resenas pendientes de transfers.
          </div>
        ) : (
          <div className="space-y-4">
            {transferRows.map((review) => {
              const transferUrl = review.transferLandingSlug ? `/transfer/${review.transferLandingSlug}` : null;
              const serviceName =
                review.transferServiceLabel ?? review.Booking?.Tour.title ?? "Transfer";
              return (
                <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Transfer</p>
                      {transferUrl ? (
                        <Link href={transferUrl} className="text-lg font-semibold text-slate-900">
                          {serviceName}
                        </Link>
                      ) : (
                        <p className="text-lg font-semibold text-slate-900">{serviceName}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">Reserva: {review.bookingId ?? "Sin reserva"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Calificacion</p>
                      <p className="text-2xl font-black text-amber-500">{review.rating}/5</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{review.customerName}</p>
                    <p className="text-xs text-slate-400">{review.customerEmail}</p>
                    {review.title && <p className="text-sm font-semibold text-slate-800">{review.title}</p>}
                    <p className="whitespace-pre-wrap">{review.body}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={approveTransferReview.bind(null, review.id)}>
                      <button className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                        Aprobar
                      </button>
                    </form>
                    <form action={rejectTransferReview.bind(null, review.id)}>
                      <button className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                        Rechazar
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      )}
    </div>
  );
}
