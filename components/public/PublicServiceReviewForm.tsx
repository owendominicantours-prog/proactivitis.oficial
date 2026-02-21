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

type Locale = "es" | "en" | "fr";

type Props = {
  locale: Locale;
  tours: TourOption[];
  transferOptions: TransferOption[];
  initialType?: "tour" | "transfer";
  initialTourId?: string;
  initialTransferSlug?: string;
  initialName?: string;
  initialEmail?: string;
  preferHistory?: boolean;
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

const i18n: Record<
  Locale,
  {
    serviceType: string;
    tour: string;
    transfer: string;
    historyMode: string;
    tourReview: string;
    transferDone: string;
    searchTour: string;
    tourDone: string;
    searchTransfer: string;
    transferFound: string;
    rating: string;
    title: string;
    body: string;
    addSecondTour: string;
    remove: string;
    name: string;
    email: string;
    send: string;
    noLinks: string;
    completeFields: string;
    duplicateTour: string;
    successTransfer: string;
    successTours: string;
    failed: string;
  }
> = {
  es: {
    serviceType: "Tipo de servicio",
    tour: "Tour",
    transfer: "Transfer",
    historyMode: "Usando tus servicios detectados automaticamente.",
    tourReview: "Resena de excursion",
    transferDone: "Traslado realizado",
    searchTour: "Buscar excursion",
    tourDone: "Excursion realizada",
    searchTransfer: "Buscar traslado",
    transferFound: "Traslado encontrado",
    rating: "Calificacion",
    title: "Titulo (opcional)",
    body: "Resena",
    addSecondTour: "Agregar otra resena de excursion",
    remove: "Quitar",
    name: "Nombre",
    email: "Correo",
    send: "Enviar resena",
    noLinks: "No se permiten enlaces en la resena.",
    completeFields: "Completa tour y comentario en cada resena.",
    duplicateTour: "No puedes repetir la misma excursion.",
    successTransfer: "Resena enviada. Se publicara cuando la aprobemos.",
    successTours: "Resena(s) enviada(s) para aprobacion.",
    failed: "No se pudo enviar la resena."
  },
  en: {
    serviceType: "Service type",
    tour: "Tour",
    transfer: "Transfer",
    historyMode: "Using your auto-detected services.",
    tourReview: "Tour review",
    transferDone: "Transfer used",
    searchTour: "Search tour",
    tourDone: "Tour completed",
    searchTransfer: "Search transfer",
    transferFound: "Transfer found",
    rating: "Rating",
    title: "Title (optional)",
    body: "Review",
    addSecondTour: "Add another tour review",
    remove: "Remove",
    name: "Name",
    email: "Email",
    send: "Send review",
    noLinks: "Links are not allowed in reviews.",
    completeFields: "Complete tour and comment in each review.",
    duplicateTour: "You cannot repeat the same tour.",
    successTransfer: "Review sent. It will be published after approval.",
    successTours: "Review(s) submitted for approval.",
    failed: "Could not send review."
  },
  fr: {
    serviceType: "Type de service",
    tour: "Tour",
    transfer: "Transfert",
    historyMode: "Utilisation de vos services detectes automatiquement.",
    tourReview: "Avis excursion",
    transferDone: "Transfert realise",
    searchTour: "Rechercher excursion",
    tourDone: "Excursion realisee",
    searchTransfer: "Rechercher transfert",
    transferFound: "Transfert trouve",
    rating: "Note",
    title: "Titre (optionnel)",
    body: "Avis",
    addSecondTour: "Ajouter un autre avis excursion",
    remove: "Retirer",
    name: "Nom",
    email: "Email",
    send: "Envoyer avis",
    noLinks: "Les liens ne sont pas autorises dans l'avis.",
    completeFields: "Completez excursion et commentaire dans chaque avis.",
    duplicateTour: "Vous ne pouvez pas repeter la meme excursion.",
    successTransfer: "Avis envoye. Il sera publie apres validation.",
    successTours: "Avis envoyes pour validation.",
    failed: "Impossible d'envoyer l'avis."
  }
};

export default function PublicServiceReviewForm({
  locale,
  tours,
  transferOptions,
  initialType = "tour",
  initialTourId,
  initialTransferSlug,
  initialName,
  initialEmail,
  preferHistory = false
}: Props) {
  const t = i18n[locale];
  const [reviewType, setReviewType] = useState<"tour" | "transfer">(initialType);
  const [transferSlug, setTransferSlug] = useState(initialTransferSlug ?? transferOptions[0]?.slug ?? "");
  const [transferSearch, setTransferSearch] = useState("");
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
  const [name, setName] = useState(initialName ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedTransferLabel = useMemo(
    () => transferOptions.find((item) => item.slug === transferSlug)?.label ?? "",
    [transferOptions, transferSlug]
  );

  const filteredTransferOptions = useMemo(() => {
    const term = transferSearch.trim().toLowerCase();
    if (!term) return transferOptions;
    return transferOptions.filter((option) => option.label.toLowerCase().includes(term));
  }, [transferOptions, transferSearch]);

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
          setErrorMessage(t.completeFields);
          return;
        }
        if (seenTours.has(item.tourId)) {
          setStatus("error");
          setErrorMessage(t.duplicateTour);
          return;
        }
        seenTours.add(item.tourId);
        if (LINK_PATTERN.test(item.title) || LINK_PATTERN.test(item.body)) {
          setStatus("error");
          setErrorMessage(t.noLinks);
          return;
        }
      }
    } else if (LINK_PATTERN.test(transferTitle) || LINK_PATTERN.test(transferBody)) {
      setStatus("error");
      setErrorMessage(t.noLinks);
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
          locale
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus("error");
        setErrorMessage(data?.message || t.failed);
        return;
      }

      const data = await response.json().catch(() => ({}));
      setStatus("success");
      if (reviewType === "tour") {
        const created = Number(data?.created ?? tourReviews.length);
        const skipped = Number(data?.skipped ?? 0);
        setSuccessMessage(
          skipped > 0 ? `${t.successTours} (${created} enviados, ${skipped} omitidos)` : t.successTours
        );
        setTourReviews((prev) =>
          prev
            .map((item, index) =>
              index === 0 ? { ...item, rating: 5, title: "", body: "", search: "" } : item
            )
            .slice(0, 1)
        );
      } else {
        setSuccessMessage(t.successTransfer);
        setTransferTitle("");
        setTransferBody("");
      }
    } catch {
      setStatus("error");
      setErrorMessage(t.failed);
    }
  };

  return (
    <form onSubmit={submitReview} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t.serviceType}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReviewType("tour")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              reviewType === "tour" ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"
            }`}
          >
            {t.tour}
          </button>
          <button
            type="button"
            onClick={() => setReviewType("transfer")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              reviewType === "transfer" ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"
            }`}
          >
            {t.transfer}
          </button>
        </div>
        {preferHistory ? <p className="text-xs text-emerald-700">{t.historyMode}</p> : null}
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
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {t.tourReview} #{index + 1}
                  </p>
                  {tourReviews.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeTourReview(item.key)}
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600"
                    >
                      {t.remove}
                    </button>
                  ) : null}
                </div>
                <label className="block text-sm text-slate-600">
                  {t.searchTour}
                  <input
                    value={item.search}
                    onChange={(event) =>
                      updateTourReview(item.key, (current) => ({ ...current, search: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                    placeholder="Saona, Buggy, Catamaran..."
                  />
                </label>
                <label className="block text-sm text-slate-600">
                  {t.tourDone}
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
                  <p className="text-sm text-slate-700">{t.rating}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => updateTourReview(item.key, (current) => ({ ...current, rating: value }))}
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
                  {t.title}
                  <input
                    value={item.title}
                    onChange={(event) =>
                      updateTourReview(item.key, (current) => ({ ...current, title: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                  />
                </label>
                <label className="block text-sm text-slate-600">
                  {t.body}
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
              {t.addSecondTour}
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <label className="block text-sm text-slate-600">
            {t.searchTransfer}
            <input
              value={transferSearch}
              onChange={(event) => setTransferSearch(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
              placeholder="Hotel, ruta, aeropuerto..."
            />
          </label>
          <label className="block text-sm text-slate-600">
            {t.transferDone}
            <select
              value={transferSlug}
              onChange={(event) => setTransferSlug(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
              required
            >
              {filteredTransferOptions.length ? (
                filteredTransferOptions.map((transfer) => (
                  <option key={transfer.slug} value={transfer.slug}>
                    {transfer.label}
                  </option>
                ))
              ) : (
                <option value={transferSlug}>{selectedTransferLabel || "Transfer privado Proactivitis"}</option>
              )}
            </select>
          </label>
          <p className="text-xs text-slate-500">
            {t.transferFound}: {selectedTransferLabel || "-"}
          </p>
          <div className="space-y-2">
            <p className="text-sm text-slate-700">{t.rating}</p>
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
            {t.title}
            <input
              value={transferTitle}
              onChange={(event) => setTransferTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
            />
          </label>
          <label className="block text-sm text-slate-600">
            {t.body}
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
          {t.name}
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
            required
          />
        </label>
        <label className="block text-sm text-slate-600">
          {t.email}
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
            required
          />
        </label>
      </div>

      {status === "success" ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
      {status === "error" ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {t.send}
      </button>
    </form>
  );
}
