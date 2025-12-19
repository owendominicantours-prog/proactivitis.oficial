"use client";

import Image from "next/image";
import { useState } from "react";

type TourGalleryViewerProps = {
  images: { url: string; label?: string }[];
};

export default function TourGalleryViewer({ images }: TourGalleryViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) return null;

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const navigate = (delta: number) => {
    setActiveIndex((prev) => (prev + delta + images.length) % images.length);
  };

  const close = () => setIsOpen(false);

  return (
    <>
      <div className="flex w-full gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
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
