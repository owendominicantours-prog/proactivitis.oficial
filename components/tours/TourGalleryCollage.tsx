"use client";

import Image from "next/image";
import { useState } from "react";
import GalleryLightbox from "@/components/shared/GalleryLightbox";

type TourGalleryCollageProps = {
  images: string[];
  title: string;
  fallbackImage: string;
  label?: string;
  variant?: "default" | "compact";
};

export default function TourGalleryCollage({
  images,
  title,
  fallbackImage,
  label = "View gallery",
  variant = "default"
}: TourGalleryCollageProps) {
  const galleryImages = images.length ? images : [fallbackImage];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0] ?? fallbackImage;
  const visibleThumbs = galleryImages.slice(0, 5);
  const hasMoreImages = galleryImages.length > visibleThumbs.length;
  const shellClassName =
    variant === "compact"
      ? "relative h-[430px] w-full overflow-hidden rounded-[28px] bg-slate-100 p-2.5 sm:h-[350px] lg:h-[430px]"
      : "relative h-[380px] w-full overflow-hidden rounded-[36px] bg-slate-100 p-3 sm:h-[420px] lg:h-[520px]";
  const mediaRadius = variant === "compact" ? "rounded-[22px]" : "rounded-[28px]";
  const goTo = (delta: number) => {
    setActiveIndex((current) => (current + delta + galleryImages.length) % galleryImages.length);
  };
  const goBack = () => {
    if (typeof window !== "undefined") window.history.back();
  };
  const shareTour = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      await navigator.share({ title }).catch(() => undefined);
    }
  };

  return (
    <div className={shellClassName}>
      <GalleryLightbox
        images={galleryImages}
        showDefaultTrigger={false}
        renderTrigger={(open) => (
          <div className="grid h-full w-full gap-2 sm:grid-cols-[96px_minmax(0,1fr)] lg:grid-cols-[118px_minmax(0,1fr)]">
            <div className="order-2 hidden gap-2 overflow-x-auto sm:order-1 sm:grid sm:grid-rows-5 sm:overflow-visible">
              {visibleThumbs.map((image, index) => {
                const isActive = index === activeIndex;
                const isLastVisible = index === visibleThumbs.length - 1 && hasMoreImages;
                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => (isLastVisible ? open() : setActiveIndex(index))}
                    className={`relative h-16 min-w-[84px] overflow-hidden rounded-xl border bg-slate-200 transition sm:h-full sm:min-w-0 ${
                      isActive ? "border-slate-950 ring-2 ring-slate-950/10" : "border-white/80 hover:border-slate-400"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${title} imagen ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    {isLastVisible ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-slate-950/55 text-xs font-black uppercase tracking-[0.18em] text-white">
                        Ver mas
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className={`relative order-1 overflow-hidden bg-slate-200 sm:order-2 ${mediaRadius}`}>
              <Image
                src={activeImage}
                alt={title}
                fill
                className="object-cover transition duration-500"
                sizes="(min-width: 1024px) 55vw, 100vw"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent sm:hidden" />
              <div className="absolute inset-x-4 top-4 flex items-center justify-between sm:hidden">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl font-light text-slate-950 shadow-lg"
                  aria-label="Volver"
                >
                  ‹
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg"
                    aria-label="Guardar"
                  >
                    <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={shareTour}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg"
                    aria-label="Compartir"
                  >
                    <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 9l5-5 5 5" />
                    </svg>
                  </button>
                </div>
              </div>
              {galleryImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => goTo(-1)}
                    className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-slate-900 shadow-lg transition hover:bg-white sm:flex"
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(1)}
                    className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-slate-900 shadow-lg transition hover:bg-white sm:flex"
                    aria-label="Foto siguiente"
                  >
                    ›
                  </button>
                </>
              ) : null}
              {galleryImages.length > 1 ? (
                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 sm:hidden">
                  {galleryImages.slice(0, 5).map((image, index) => (
                    <button
                      key={`${image}-dot-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        index === activeIndex ? "bg-white" : "bg-white/55"
                      }`}
                      aria-label={`Ver foto ${index + 1}`}
                    />
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => open()}
                className="absolute bottom-4 right-4 rounded-full border border-white/70 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-950 shadow-lg sm:bottom-4 sm:right-4"
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="inline-flex items-center gap-2 text-sm tracking-normal sm:hidden">
                  <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M8 13l2.5-2.5L14 14l2-2 3 3" />
                  </svg>
                  {galleryImages.length}
                </span>
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
