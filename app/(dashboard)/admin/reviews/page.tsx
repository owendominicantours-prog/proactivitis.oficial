import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { approveTourReview, rejectTourReview } from "./actions";

export const metadata = {
  title: "Reseñas pendientes | Proactivitis"
};

export default async function AdminReviewsPage() {
  const pending = await prisma.tourReview.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      Tour: { select: { title: true, slug: true } },
      Booking: { select: { id: true, customerEmail: true } }
    }
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Reseñas</p>
        <h1 className="text-3xl font-semibold text-slate-900">Reseñas pendientes</h1>
        <p className="text-sm text-slate-500">Aprueba o rechaza reseñas reales antes de publicarlas.</p>
      </header>

      {pending.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No hay reseñas pendientes.
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((review) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tour</p>
                  <Link href={`/tours/${review.Tour.slug}`} className="text-lg font-semibold text-slate-900">
                    {review.Tour.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">Reserva: {review.bookingId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Calificación</p>
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
    </div>
  );
}
