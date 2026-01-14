"use client";

import { useState } from "react";
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
        body: JSON.stringify({ rating, title, body })
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

  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        {t("tour.reviews.form.login")}
      </div>
    );
  }

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
              className={`h-10 w-10 rounded-full border text-sm font-semibold ${
                rating >= value ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-400"
              }`}
            >
              ★
            </button>
          ))}
        </div>
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
