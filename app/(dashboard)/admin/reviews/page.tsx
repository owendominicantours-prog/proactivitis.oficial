import { prisma } from "@/lib/prisma";
import { approveTourReview, rejectTourReview } from "@/lib/actions/tourReviews";

const statusClasses: Record<string, string> = {
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700"
};

export default async function AdminReviewsPage() {
  const reviews = await prisma.tourReview.findMany({
    include: {
      Tour: {
        select: {
          id: true,
          title: true,
          slug: true
        }
      }
    },
    orderBy: [{ status: "asc" }, { approvedAt: "desc" }, { createdAt: "desc" }]
  });

  const pendingCount = reviews.filter((review) => review.status === "PENDING").length;
  const approvedCount = reviews.filter((review) => review.status === "APPROVED").length;

  return (
    <section className="space-y-6 rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Admin Reviews</p>
        <h1 className="text-2xl font-semibold text-slate-900">Reseñas de tours</h1>
        <p className="text-sm text-slate-500">
          Aquí puedes aprobar o rechazar comentarios cargados para los tours antes de que salgan en la web pública.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{reviews.length}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Pendientes</p>
          <p className="mt-2 text-3xl font-semibold text-amber-800">{pendingCount}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Aprobadas</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-800">{approvedCount}</p>
        </article>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${
                      statusClasses[review.status] ?? "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {review.status}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
                    {review.locale ?? "und"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
                    {review.rating}/5
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{review.title || "Sin título"}</h2>
                  <p className="text-sm text-slate-500">
                    {review.customerName}
                    {review.customerEmail ? ` · ${review.customerEmail}` : ""}
                    {review.createdAt ? ` · ${review.createdAt.toLocaleDateString("es-DO")}` : ""}
                  </p>
                </div>
                <p className="max-w-3xl text-sm leading-7 text-slate-700">{review.body}</p>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Tour: {review.Tour.title} · slug: {review.Tour.slug}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-3">
                <form action={approveTourReview}>
                  <input type="hidden" name="reviewId" value={review.id} />
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-emerald-500"
                  >
                    Aprobar
                  </button>
                </form>
                <form action={rejectTourReview}>
                  <input type="hidden" name="reviewId" value={review.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-rose-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-rose-600 transition hover:bg-rose-50"
                  >
                    Rechazar
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No hay reseñas cargadas todavía.
          </div>
        ) : null}
      </div>
    </section>
  );
}
