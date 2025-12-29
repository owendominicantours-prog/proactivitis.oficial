"use client";

import Image from "next/image";
import Link from "next/link";

type Tour = {
  title: string;
  slug: string;
  heroImage: string | null;
  price: number;
  duration: string;
};

type Theme = {
  button: string;
  card: string;
};

type Props = {
  minisiteSlug: string;
  theme: Theme;
  tours: Tour[];
};

const formatCurrency = (value: number) => `$${value.toFixed(0)} USD`;

async function trackClick(minisiteSlug: string, tourSlug: string) {
  await fetch("/api/minisite/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ minisiteSlug, tourSlug })
  }).catch(() => {
    // ignore
  });
}

export function MinisiteTourGrid({ minisiteSlug, theme, tours }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {tours.map((tour) => (
        <article key={tour.slug} className={`flex flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-xl ${theme.card}`}>
          <div className="space-y-3">
            {tour.heroImage ? (
              <Image
                src={tour.heroImage}
                alt={tour.title}
                width={800}
                height={480}
                className="h-40 w-full rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div className="h-40 w-full rounded-2xl bg-slate-200" />
            )}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">{tour.title}</h3>
              <span className="text-sm text-slate-500">{tour.duration}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{formatCurrency(tour.price)} desde</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/tours/${tour.slug}`}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold ${theme.button}`}
              onClick={() => {
                void trackClick(minisiteSlug, tour.slug);
              }}
            >
              View details
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
