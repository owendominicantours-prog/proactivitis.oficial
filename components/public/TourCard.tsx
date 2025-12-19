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
  zone?: string;
  maxPax?: number;
  duration?: string;
  pickupIncluded?: boolean;
};

const IconUsers = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M7 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
    <path d="M17 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
    <path d="M2 21c0-3.314 2.686-6 6-6h8c3.314 0 6 2.686 6 6" />
  </svg>
);

const IconMap = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M7 3L3 5v14l4-2 4 2 4-2 4 2 4-2V5l-4 2" />
    <path d="M7 3v14M11 5v14M15 3v14" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export function TourCard({
  slug,
  title,
  location,
  price,
  rating,
  image,
  tags,
  description,
  zone,
  maxPax,
  duration,
  pickupIncluded
}: TourCardProps) {
  const displayRating = typeof rating === "number" ? rating.toFixed(1) : "4.9";
  const badgeText = `⭐ ${displayRating} • 1.2K reseñas`;
  const tagList = tags && tags.length ? tags : ["Experiencia Top"];
  const locationText = zone || location?.split(",")[0] || "Punta Cana";

  return (
    <Link href={`/tours/${slug}`} className="group block">
    <article className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-card transition-transform duration-300 hover:-translate-y-2">
      <div className="relative">
          <div
            className="aspect-[4/3] w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
            role="img"
            aria-label={title}
          />
          <div className="absolute right-4 top-4 rounded-xl bg-white/80 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur">
            {badgeText}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <p className="text-brand font-medium text-[10px] tracking-[0.4em] uppercase">{`Desde ${locationText}`}</p>
          <h3 className="text-slate-900 text-2xl font-black leading-tight">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
            {description ?? `Experiencia exclusiva en ${locationText} con guía local certificado.`}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-slate-500">
            {tagList.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[9px]">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-y border-slate-50 py-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <IconClock />
              {duration ?? "4 horas"}
            </span>
            <span className="flex items-center gap-1">
              <IconUsers />
              {`Máx. ${maxPax ?? 15} pers.`}
            </span>
            <span className="flex items-center gap-1">
              <IconMap />
              {locationText}
            </span>
          </div>
          {pickupIncluded && (
            <p className="text-emerald-500 font-semibold text-[10px] uppercase tracking-[0.4em]">
              Recogida en hotel incluida
            </p>
          )}
          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-[0.4em]">Desde</p>
              <div className="flex items-baseline gap-1">
                <span className="text-brand text-3xl font-black">${price.toFixed(0)}</span>
                <span className="text-sm font-semibold text-slate-500">USD</span>
              </div>
            </div>
            <span className="rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/40 transition-colors group-hover:bg-brand-light">
              Ver detalles
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
