"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatReviewCountShort } from "@/lib/reviewCounts";
import { formatDurationDisplay } from "@/lib/formatDuration";
import { getTourPrimaryLocation, normalizeTourLocation } from "@/lib/tour-display";
import { SITE_CONFIG } from "@/lib/site-config";

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
  images?: string[];
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

const IconChevron = ({ direction }: { direction: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
    {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
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
  images,
  tags,
  description,
  zone,
  maxPax,
  duration,
  pickupIncluded,
  compact = false
}: TourCardProps) {
  const isFunjet = SITE_CONFIG.variant === "funjet";
  const normalizedImages = Array.from(new Set([image, ...(images ?? [])].filter(Boolean)));
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const normalizedRating = typeof rating === "number" ? rating : 0;
  const normalizedCount = reviewCount ?? 0;
  const reviewLabel = formatReviewCountShort(normalizedCount);
  const badgeText = `Rating ${normalizedRating.toFixed(1)} - ${reviewLabel} reviews`;
  const showBadge = normalizedRating > 0 && normalizedCount > 0;
  const tagList = tags && tags.length ? tags : ["Top Experience"];
  const locationText = zone || getTourPrimaryLocation(location);
  const normalizedLocation = normalizeTourLocation(location);
  const audienceLabel = maxPax && maxPax <= 8 ? "Small group" : "Top seller";
  const durationLabel = formatDurationDisplay(duration, "4 hours");
  const activeImage = normalizedImages[activeImageIndex] ?? image;
  const bookingBadgeLabel = isFunjet ? "Direct booking" : "Instant booking";
  const fallbackDescription = isFunjet
    ? `Book this ${locationText} experience with direct local support from ${SITE_CONFIG.name}.`
    : `Book a verified ${locationText} experience with professional local support.`;
  const ctaLabel = isFunjet ? "Book now" : "View tour";

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
        className={`flex h-full flex-col overflow-hidden border transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl ${
          isFunjet
            ? "border-[#E9D7FA] bg-white shadow-[0_18px_44px_rgba(106,13,173,0.12)]"
            : "border-slate-100 bg-white shadow-card"
        } ${
          compact ? "rounded-[20px]" : "rounded-[28px]"
        }`}
      >
        <div className="relative">
          <div className={`relative ${compact ? "aspect-[16/10]" : "aspect-[4/3]"} w-full overflow-hidden`}>
            <Image
              src={activeImage}
              alt={title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes={compact ? "(max-width: 1024px) 50vw, 25vw" : "(max-width: 1024px) 100vw, 33vw"}
            />
          </div>
          {showBadge ? (
            <div className={`absolute right-3 top-3 rounded-xl px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${isFunjet ? "bg-[#FFC300]/95 text-[#4D0A7D]" : "bg-white/90 text-slate-900"}`}>
              {badgeText}
            </div>
          ) : null}
          {normalizedImages.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveImageIndex((current) => (current - 1 + normalizedImages.length) % normalizedImages.length);
                }}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
              >
                <IconChevron direction="left" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveImageIndex((current) => (current + 1) % normalizedImages.length);
                }}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
              >
                <IconChevron direction="right" />
              </button>
              <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/70 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-white backdrop-blur">
                {activeImageIndex + 1}/{normalizedImages.length}
              </div>
            </>
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
            <p className={`text-[10px] font-medium uppercase tracking-[0.35em] ${isFunjet ? "text-[#6A0DAD]" : "text-brand"}`}>{locationText}</p>
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${isFunjet ? "bg-[#F7EFFD] text-[#6A0DAD]" : "bg-slate-100 text-slate-600"}`}>
              {bookingBadgeLabel}
            </span>
          </div>
          <h3 className={`font-black leading-tight text-slate-900 ${compact ? "text-lg" : "text-2xl"}`}>{title}</h3>
          <p className={`leading-relaxed text-slate-500 ${compact ? "line-clamp-1 text-xs" : "line-clamp-2 text-sm"}`}>
            {description ?? fallbackDescription}
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
              {normalizedLocation}
            </span>
          </div>

          {pickupIncluded ? <p className="text-[11px] font-semibold text-emerald-600">Hotel pickup included</p> : null}

          {normalizedImages.length > 1 ? (
            <div className="flex items-center gap-1">
              {normalizedImages.slice(0, 5).map((photo, index) => (
                <button
                  key={`${photo}-${index}`}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setActiveImageIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition ${
                    index === activeImageIndex ? "w-6 bg-slate-900" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          ) : null}

          <div className={`mt-auto flex items-center justify-between ${isFunjet ? "border-t border-[#EFE2FA]" : "border-t border-slate-100"} ${compact ? "pt-2.5" : "pt-4"}`}>
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">From</p>
              <div className="flex items-baseline gap-1">
                <span className={`${compact ? "text-2xl" : "text-3xl"} font-black ${hasDiscount ? "text-emerald-600" : isFunjet ? "text-[#6A0DAD]" : "text-brand"}`}>
                  ${bestDiscountedPrice.toFixed(0)}
                </span>
                <span className="text-sm font-semibold text-slate-500">USD</span>
              </div>
              {hasDiscount ? (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 line-through">${price.toFixed(0)} USD</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-600">
                    {discountLabel || `-${computedDiscountPercent}%`}
                  </p>
                </div>
              ) : null}
            </div>
            <span
              className={`rounded-2xl text-sm font-bold text-white transition-colors ${
                isFunjet
                  ? "bg-[linear-gradient(135deg,#6A0DAD_0%,#8B32D1_100%)] shadow-[0_16px_34px_rgba(106,13,173,0.28)] group-hover:bg-[linear-gradient(135deg,#4D0A7D_0%,#6A0DAD_100%)]"
                  : "bg-brand shadow-lg shadow-brand/40 group-hover:bg-brand-light"
              } ${
                compact ? "px-4 py-2" : "px-6 py-3"
              }`}
            >
              {ctaLabel}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
