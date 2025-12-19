"use client";

import Image from "next/image";
import { useState } from "react";

type TourGalleryViewerProps = {
  images: { url: string; label?: string }[];
  visibleCount?: number;
};

export default function TourGalleryViewer({ images, visibleCount = 3 }: TourGalleryViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) return null;

  const previewCount = Math.max(3, visibleCount);
  const previewImages = images.slice(0, previewCount);
  const extraCount = Math.max(images.length - 3, 0);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const navigate = (delta: number) => {
    setActiveIndex((prev) => (prev + delta + images.length) % images.length);
  };

  const close = () => setIsOpen(false);

  const renderPreviewButton = (image: { url: string; label?: string }, index: number, className: string) => (
    <button
      key={`${image.url}-${index}`}
      type="button"
      onClick={() => openLightbox(index)}
      className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm transition hover:border-slate-400 hover:shadow-lg ${className}`}
      aria-label={`Abrir foto ${index + 1}`}
    >
      <div className="relative h-full w-full">
        <Image
          src={image.url}
          alt={image.label ?? `Galería imagen ${index + 1}`}
          fill
          className="object-cover transition duration-500 hover:scale-105"
          sizes="(min-width: 1024px) 60vw, (min-width: 768px) 40vw, 100vw"
          priority={index === 0}
        />
      </div>
      <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-black/40 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white backdrop-blur">
        {index + 1}/{images.length}
      </span>
    </button>
  );

  const secondaryImages = previewImages.slice(1, 3);

  return (
    <section id="gallery" className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative">
          {previewImages[0] && renderPreviewButton(previewImages[0], 0, "h-[420px] w-full")}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-1 flex-col gap-4">
            {secondaryImages.map((image, index) =>
              renderPreviewButton(image, index + 1, "h-[192px] w-full")
            )}
          </div>
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-white"
          >
            Ver todas las fotos{extraCount ? ` (+${extraCount})` : ""}
          </button>
        </div>
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
              alt={images[activeIndex].label ?? `Galería imagen ${activeIndex + 1}`}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 90vw, 70vw"
            />
          </div>
        </div>
      )}
    </section>
  );
}
