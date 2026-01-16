"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { translate, type Locale } from "@/lib/translations";

type Props = {
  tourId: string;
  locale: Locale;
};

const LINK_PATTERN = /(https?:\/\/|www\.)/i;

export default function TourReviewForm({ tourId, locale }: Props) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = (key: string) => translate(locale, key as never);

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (LINK_PATTERN.test(title) || LINK_PATTERN.test(body)) {
      setErrorMessage(t("tour.reviews.form.linkError"));
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch(`/api/tours/${tourId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title,
          body,
          name: guestName,
          email: guestEmail
        })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data?.message || t("tour.reviews.form.error"));
        setStatus("error");
        return;
      }
      setStatus("success");
      setTitle("");
      setBody("");
    } catch {
      setErrorMessage(t("tour.reviews.form.error"));
      setStatus("error");
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      setGuestName((prev) => prev || session.user?.name || "");
      setGuestEmail((prev) => prev || session.user?.email || "");
    }
  }, [session?.user?.email, session?.user?.name]);

  return (
    <form onSubmit={submitReview} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tour.reviews.form.title")}</p>
        <p className="mt-2 text-sm text-slate-700">{t("tour.reviews.form.rating")}</p>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setRating(value)}
              className={`grid h-10 w-10 place-items-center rounded-full border transition-all duration-200 ${
                rating >= value
                  ? "border-amber-300 bg-amber-50 shadow-md shadow-amber-200/60 scale-105"
                  : "border-slate-200 bg-white hover:scale-105"
              }`}
              aria-label={`Rating ${value}`}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className={`h-5 w-5 transition-colors ${
                  rating >= value ? "text-amber-500" : "text-slate-300"
                }`}
                fill={rating >= value ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M12 3.5l2.7 5.48 6.05.88-4.38 4.27 1.03 6.03L12 17.9l-5.4 2.84 1.03-6.03-4.38-4.27 6.05-.88L12 3.5z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-600">
          {t("tour.reviews.form.guestName")}
          <input
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
            placeholder={t("tour.reviews.form.guestName")}
            required
          />
        </label>
        <label className="block text-sm text-slate-600">
          {t("tour.reviews.form.guestEmail")}
          <input
            value={guestEmail}
            onChange={(event) => setGuestEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
            placeholder={t("tour.reviews.form.guestEmail")}
            type="email"
            required
          />
        </label>
      </div>

      <label className="block text-sm text-slate-600">
        {t("tour.reviews.form.headline")}
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
          placeholder={t("tour.reviews.form.headline")}
        />
      </label>

      <label className="block text-sm text-slate-600">
        {t("tour.reviews.form.body")}
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
          placeholder={t("tour.reviews.form.body")}
          required
        />
      </label>

      {status === "success" && (
        <p className="text-sm text-emerald-600">{t("tour.reviews.form.success")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-rose-600">{errorMessage ?? t("tour.reviews.form.error")}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {t("tour.reviews.form.submit")}
      </button>
    </form>
  );
}
