"use client";

import Link from "next/link";

type TourCardProps = {
  slug: string;
  title: string;
  location: string;
  price: number;
  rating?: number;
  image: string;
  tags?: string[];
  description?: string;
};

export function TourCard({
  slug,
  title,
  location,
  price,
  rating,
  image,
  tags,
  description
}: TourCardProps) {
  const displayRating = typeof rating === "number" ? rating.toFixed(1) : "4.9";
  const badgeText = `⭐ ${displayRating} (1.2K Reseñas)`;
  const tagList = tags && tags.length ? tags : [location, "Aventura", "Cenotes"];

  return (
    <Link href={`/tours/${slug}`} className="group block">
      <article className="flex h-full transform flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2">
        <div className="relative">
          <div
            className="aspect-[4/3] w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
            role="img"
            aria-label={title}
          />
          <div className="absolute right-4 top-4 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
            {badgeText}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tagList.map((tag) => (
              <span
                key={tag}
                className="flex-shrink-0 rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-slate-900 text-xl font-black leading-tight">
            {title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
            {description ?? `Explora la selva de ${location} en una experiencia guiada de alto impacto.`}
          </p>
          <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-6">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Desde</p>
              <div className="flex items-baseline gap-1">
                <span className="text-indigo-700 text-3xl font-black">${price.toFixed(0)}</span>
                <span className="text-sm font-semibold text-slate-500">USD</span>
              </div>
            </div>
            <span className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700">
              Ver detalles
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
