"use client";

import { useMemo, useState } from "react";

type TourOption = {
  id: string;
  title: string;
};

type TransferOption = {
  slug: string;
  label: string;
};

type Props = {
  tours: TourOption[];
  transferOptions: TransferOption[];
  initialType?: "tour" | "transfer";
  initialTourId?: string;
  initialTransferSlug?: string;
};

type TourDraftReview = {
  key: string;
  tourId: string;
  search: string;
  rating: number;
  title: string;
  body: string;
};

const LINK_PATTERN = /(https?:\/\/|www\.)/i;
const MAX_TOUR_REVIEWS_PER_SUBMIT = 2;

export default function PublicServiceReviewForm({
  tours,
  transferOptions,
  initialType = "tour",
  initialTourId,
  initialTransferSlug
}: Props) {
  const [reviewType, setReviewType] = useState<"tour" | "transfer">(initialType);
  const [transferSlug, setTransferSlug] = useState(initialTransferSlug ?? transferOptions[0]?.slug ?? "");
  const [transferRating, setTransferRating] = useState(5);
  const [transferTitle, setTransferTitle] = useState("");
  const [transferBody, setTransferBody] = useState("");
  const [tourReviews, setTourReviews] = useState<TourDraftReview[]>([
    {
      key: "tour-review-1",
      tourId: initialTourId ?? tours[0]?.id ?? "",
      search: "",
      rating: 5,
      title: "",
      body: ""
    }
  ]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedTransferLabel = useMemo(
    () => transferOptions.find((item) => item.slug === transferSlug)?.label ?? "",
    [transferOptions, transferSlug]
  );

  const addTourReview = () => {
    if (tourReviews.length >= MAX_TOUR_REVIEWS_PER_SUBMIT) return;
    setTourReviews((prev) => [
      ...prev,
      {
        key: `tour-review-${Date.now()}`,
        tourId: tours[0]?.id ?? "",
        search: "",
        rating: 5,
        title: "",
        body: ""
      }
    ]);
  };

  const removeTourReview = (key: string) => {
    if (tourReviews.length <= 1) return;
    setTourReviews((prev) => prev.filter((item) => item.key !== key));
  };

  const updateTourReview = (key: string, updater: (current: TourDraftReview) => TourDraftReview) => {
    setTourReviews((prev) => prev.map((item) => (item.key === key ? updater(item) : item)));
  };

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    setSuccessMessage(null);

    if (reviewType === "tour") {
      const seenTours = new Set<string>();
      for (const item of tourReviews) {
        if (!item.tourId || !item.body.trim()) {
          setStatus("error");
          setErrorMessage("Completa tour y comentario en cada resena.");
          return;
        }
        if (seenTours.has(item.tourId)) {
          setStatus("error");
          setErrorMessage("No puedes repetir la misma excursion.");
          return;
        }
        seenTours.add(item.tourId);
        if (LINK_PATTERN.test(item.title) || LINK_PATTERN.test(item.body)) {
          setStatus("error");
          setErrorMessage("No se permiten enlaces en la resena.");
          return;
        }
      }
    } else if (LINK_PATTERN.test(transferTitle) || LINK_PATTERN.test(transferBody)) {
      setStatus("error");
      setErrorMessage("No se permiten enlaces en la resena.");
      return;
    }

    try {
      const response = await fetch("/api/reviews/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewType,
          tourReviews:
            reviewType === "tour"
              ? tourReviews.map((item) => ({
                  tourId: item.tourId,
                  rating: item.rating,
                  title: item.title,
                  body: item.body
                }))
              : undefined,
          transferLandingSlug: reviewType === "transfer" ? transferSlug : undefined,
          transferServiceLabel: reviewType === "transfer" ? selectedTransferLabel : undefined,
          rating: transferRating,
          title: transferTitle,
          body: transferBody,
          name,
          email,
          locale: "es"
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus("error");
        setErrorMessage(data?.message || "No se pudo enviar la resena.");
        return;
      }

      const data = await response.json().catch(() => ({}));
      setStatus("success");
      if (reviewType === "tour") {
        const created = Number(data?.created ?? tourReviews.length);
        const skipped = Number(data?.skipped ?? 0);
        setSuccessMessage(
          skipped > 0
            ? `Se enviaron ${created} resena(s). ${skipped} ya existian y se omitieron.`
            : `Se enviaron ${created} resena(s) para aprobacion.`
        );
        setTourReviews((prev) =>
          prev
            .map((item, index) =>
              index === 0 ? { ...item, rating: 5, title: "", body: "", search: "" } : item
            )
            .slice(0, 1)
        );
      } else {
        setSuccessMessage("Resena enviada. Se publicara cuando la aprobemos.");
        setTransferTitle("");
        setTransferBody("");
      }
    } catch {
      setStatus("error");
      setErrorMessage("No se pudo enviar la resena.");
    }
  };

  return (
    <form onSubmit={submitReview} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tipo de servicio</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReviewType("tour")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              reviewType === "tour" ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"
            }`}
          >
            Tour
          </button>
          <button
            type="button"
            onClick={() => setReviewType("transfer")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              reviewType === "transfer" ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"
            }`}
          >
            Transfer
          </button>
        </div>
      </div>

      {reviewType === "tour" ? (
        <div className="space-y-4">
          {tourReviews.map((item, index) => {
            const normalizedSearch = item.search.trim().toLowerCase();
            const filteredTours = normalizedSearch
              ? tours.filter((tour) => tour.title.toLowerCase().includes(normalizedSearch))
              : tours;
            return (
              <div key={item.key} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resena de excursion #{index + 1}</p>
                  {tourReviews.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeTourReview(item.key)}
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600"
                    >
                      Quitar
                    </button>
                  ) : null}
                </div>
                <label className="block text-sm text-slate-600">
                  Buscar excursion
                  <input
                    value={item.search}
                    onChange={(event) =>
                      updateTourReview(item.key, (current) => ({ ...current, search: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                    placeholder="Ej: Saona, Buggy, Catamaran..."
                  />
                </label>
                <label className="block text-sm text-slate-600">
                  Excursion realizada
                  <select
                    value={item.tourId}
                    onChange={(event) =>
                      updateTourReview(item.key, (current) => ({ ...current, tourId: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                    required
                  >
                    {filteredTours.map((tour) => (
                      <option key={tour.id} value={tour.id}>
                        {tour.title}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">Calificacion</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() =>
                          updateTourReview(item.key, (current) => ({ ...current, rating: value }))
                        }
                        className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                          item.rating >= value ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"
                        }`}
                      >
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          className={`h-5 w-5 ${item.rating >= value ? "text-amber-500" : "text-slate-300"}`}
                          fill={item.rating >= value ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path d="M12 3.5l2.7 5.48 6.05.88-4.38 4.27 1.03 6.03L12 17.9l-5.4 2.84 1.03-6.03-4.38-4.27 6.05-.88L12 3.5z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block text-sm text-slate-600">
                  Titulo (opcional)
                  <input
                    value={item.title}
                    onChange={(event) =>
                      updateTourReview(item.key, (current) => ({ ...current, title: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                  />
                </label>
                <label className="block text-sm text-slate-600">
                  Resena
                  <textarea
                    value={item.body}
                    onChange={(event) =>
                      updateTourReview(item.key, (current) => ({ ...current, body: event.target.value }))
                    }
                    className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                    required
                  />
                </label>
              </div>
            );
          })}
          {tourReviews.length < MAX_TOUR_REVIEWS_PER_SUBMIT ? (
            <button
              type="button"
              onClick={addTourReview}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
            >
              Agregar otra resena de excursion
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <label className="block text-sm text-slate-600">
            Transfer realizado
            <select
              value={transferSlug}
              onChange={(event) => setTransferSlug(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
              required
            >
              {transferOptions.map((transfer) => (
                <option key={transfer.slug} value={transfer.slug}>
                  {transfer.label}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-2">
            <p className="text-sm text-slate-700">Calificacion</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setTransferRating(value)}
                  className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                    transferRating >= value ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className={`h-5 w-5 ${transferRating >= value ? "text-amber-500" : "text-slate-300"}`}
                    fill={transferRating >= value ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path d="M12 3.5l2.7 5.48 6.05.88-4.38 4.27 1.03 6.03L12 17.9l-5.4 2.84 1.03-6.03-4.38-4.27 6.05-.88L12 3.5z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm text-slate-600">
            Titulo (opcional)
            <input
              value={transferTitle}
              onChange={(event) => setTransferTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
            />
          </label>
          <label className="block text-sm text-slate-600">
            Resena
            <textarea
              value={transferBody}
              onChange={(event) => setTransferBody(event.target.value)}
              className="mt-2 min-h-[140px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
              required
            />
          </label>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-600">
          Nombre
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
            required
          />
        </label>
        <label className="block text-sm text-slate-600">
          Correo
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
            required
          />
        </label>
      </div>

      {status === "success" ? (
        <p className="text-sm text-emerald-600">{successMessage ?? "Resena enviada. Se publicara cuando la aprobemos."}</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-rose-600">{errorMessage ?? "No se pudo enviar la resena."}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Enviar resena
      </button>
    </form>
  );
}
