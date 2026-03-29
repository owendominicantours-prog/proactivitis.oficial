"use client";

import Link from "next/link";
import { formatReviewCountShort } from "@/lib/reviewCounts";
import { formatDurationDisplay } from "@/lib/formatDuration";

type TourCardProps = {
  slug: string;
  title: string;
  location: string;
  price: number;
  discountPercent?: number;
  discountedPrice?: number;
  discountLabel?: string;
  rating?: number;
  reviewCount?: number;
  image: string;
  tags?: string[];
  description?: string;
  zone?: string;
  maxPax?: number;
  duration?: string;
  pickupIncluded?: boolean;
  compact?: boolean;
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
  discountPercent = 0,
  discountedPrice,
  discountLabel,
  rating,
  reviewCount,
  image,
  tags,
  description,
  zone,
  maxPax,
  duration,
  pickupIncluded,
  compact = false
}: TourCardProps) {
  const normalizedRating = typeof rating === "number" ? rating : 0;
  const normalizedCount = reviewCount ?? 0;
  const reviewLabel = formatReviewCountShort(normalizedCount);
  const badgeText = `★ ${normalizedRating.toFixed(1)} · ${reviewLabel} reviews`;
  const showBadge = normalizedRating > 0 && normalizedCount > 0;
  const tagList = tags && tags.length ? tags : ["Top Experience"];
  const locationText = zone || location?.split(",")[0] || "Punta Cana";
  const audienceLabel = maxPax && maxPax <= 8 ? "Small group" : "Top seller";
  const durationLabel = formatDurationDisplay(duration, "4 hours");

  const percentDiscountPrice = discountPercent > 0 ? price * (1 - discountPercent / 100) : price;
  const bestDiscountedPrice =
    typeof discountedPrice === "number" && discountedPrice > 0
      ? Math.min(percentDiscountPrice, discountedPrice)
      : percentDiscountPrice;
  const hasDiscount = bestDiscountedPrice < price;
  const computedDiscountPercent = hasDiscount ? Math.max(1, Math.round(((price - bestDiscountedPrice) / price) * 100)) : 0;

  return (
    <Link href={`/tours/${slug}`} className="group block">
      <article
        className={`flex h-full flex-col overflow-hidden border border-slate-100 bg-white shadow-card transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl ${
          compact ? "rounded-[20px]" : "rounded-[28px]"
        }`}
      >
        <div className="relative">
          <img
            src={image}
            alt={title}
            className={`${compact ? "aspect-[16/10]" : "aspect-[4/3]"} w-full object-cover`}
            loading="lazy"
          />
          {showBadge ? (
            <div className="absolute right-3 top-3 rounded-xl bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900 shadow-sm backdrop-blur">
              {badgeText}
            </div>
          ) : null}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/80 bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500 shadow">
              {audienceLabel}
            </span>
            {tagList.slice(0, compact ? 1 : 2).map((tag) => (
              <span
                key={`badge-${tag}`}
                className="rounded-full border border-white/80 bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500 shadow"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className={`flex flex-1 flex-col gap-2 ${compact ? "p-3" : "p-4"}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-brand text-[10px] font-medium uppercase tracking-[0.35em]">{locationText}</p>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              Instant booking
            </span>
          </div>
          <h3 className={`font-black leading-tight text-slate-900 ${compact ? "text-lg" : "text-2xl"}`}>{title}</h3>
          <p className={`leading-relaxed text-slate-500 ${compact ? "line-clamp-1 text-xs" : "line-clamp-2 text-sm"}`}>
            {description ?? `Book a verified ${locationText} experience with professional local support.`}
          </p>

          <div className={`flex flex-wrap items-center gap-2 border-y border-slate-50 text-[11px] text-slate-500 ${compact ? "py-1.5" : "py-2"}`}>
            <span className="flex items-center gap-1">
              <IconClock />
              {durationLabel}
            </span>
            <span className="flex items-center gap-1">
              <IconUsers />
              {`Max ${maxPax ?? 15}`}
            </span>
            <span className="flex items-center gap-1">
              <IconMap />
              {locationText}
            </span>
          </div>

          {pickupIncluded ? <p className="text-[11px] font-semibold text-emerald-600">Hotel pickup included</p> : null}

          <div className={`mt-auto flex items-center justify-between border-t border-slate-100 ${compact ? "pt-2.5" : "pt-4"}`}>
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">From</p>
              <div className="flex items-baseline gap-1">
                <span className={`${compact ? "text-2xl" : "text-3xl"} font-black ${hasDiscount ? "text-red-600" : "text-brand"}`}>
                  ${bestDiscountedPrice.toFixed(0)}
                </span>
                <span className="text-sm font-semibold text-slate-500">USD</span>
              </div>
              {hasDiscount ? (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 line-through">${price.toFixed(0)} USD</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-600">
                    {discountLabel || `-${computedDiscountPercent}%`}
                  </p>
                </div>
              ) : null}
            </div>
            <span
              className={`rounded-2xl bg-brand text-sm font-bold text-white shadow-lg shadow-brand/40 transition-colors group-hover:bg-brand-light ${
                compact ? "px-4 py-2" : "px-6 py-3"
              }`}
            >
              View tour
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
