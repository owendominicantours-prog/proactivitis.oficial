"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type TourGalleryViewerProps = {
  images: { url: string; label?: string }[];
  visibleCount?: number;
};

export default function TourGalleryViewer({ images, visibleCount = 3 }: TourGalleryViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  if (!images.length) return null;

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const navigate = (delta: number) => {
    setActiveIndex((prev) => (prev + delta + images.length) % images.length);
  };

  const close = () => setIsOpen(false);

  const scrollThumbnails = (delta: number) => {
    if (!carouselRef.current) return;
    const step = Math.max(carouselRef.current.clientWidth / visibleCount, 120);
    carouselRef.current.scrollBy({ left: delta * step, behavior: "smooth" });
  };

  return (
    <>
      <div className="relative">
        <div className="flex w-full gap-3 overflow-hidden pb-2 lg:w-full" ref={carouselRef}>
          {images.slice(0, visibleCount).map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => openLightbox(index)}
              className="relative min-w-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-1 transition hover:border-slate-400"
            >
              <div className="relative h-32 w-full overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={image.url}
                  alt={image.label ?? `Gallery image ${index + 1}`}
                  fill
                  className="object-cover transition duration-300 hover:scale-105"
                  sizes="140px"
                />
              </div>
              <span className="mt-1 block text-center text-[0.7rem] uppercase tracking-[0.3em] text-slate-500">
                {index + 1}/{images.length}
              </span>
            </button>
          ))}
          {images.length > visibleCount && (
            <button
              type="button"
              onClick={() => openLightbox(visibleCount)}
              className="relative flex min-w-[140px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-1 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              +{images.length - visibleCount}
            </button>
          )}
        </div>
        {images.length > visibleCount && (
          <div className="mt-2 flex items-center justify-between space-x-2 text-xs text-slate-600 sm:hidden">
            <button
              onClick={() => scrollThumbnails(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
              aria-label="Anterior miniatura"
            >
              ←
            </button>
            <button
              onClick={() => scrollThumbnails(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
              aria-label="Siguiente miniatura"
            >
              →
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            onClick={close}
            className="absolute right-6 top-6 rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-slate-900 backdrop-blur"
          >
            Cerrar
          </button>
          <button
            onClick={() => navigate(-1)}
            className="absolute left-6 rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-slate-900 backdrop-blur"
          >
            ←
          </button>
          <button
            onClick={() => navigate(1)}
            className="absolute right-6 rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-slate-900 backdrop-blur"
          >
            →
          </button>
          <div className="relative mx-auto h-[65vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/30 bg-black/60">
            <Image
              src={images[activeIndex].url}
              alt={images[activeIndex].label ?? `Gallery image ${activeIndex + 1}`}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 90vw, 70vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
