"use client";

import Image from "next/image";
import { useState } from "react";

type TourGalleryViewerProps = {
  images: { url: string; label?: string }[];
};

export default function TourGalleryViewer({ images }: TourGalleryViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return null;
  }

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const changeIndex = (delta: number) => {
    setActiveIndex((prev) => (prev + delta + images.length) % images.length);
  };

  const close = () => setIsOpen(false);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.url + index}
            type="button"
            className="group relative flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:border-slate-400"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={image.url}
              alt={image.label ?? `Gallery image ${index + 1}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/80 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-600">
              {index + 1}/{images.length}
            </span>
          </button>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <button
            onClick={close}
            className="absolute top-6 right-6 rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-slate-900 backdrop-blur"
          >
            Cerrar
          </button>
          <button
            onClick={() => changeIndex(-1)}
            className="absolute left-6 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 backdrop-blur"
          >
            ←
          </button>
          <button
            onClick={() => changeIndex(1)}
            className="absolute right-6 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 backdrop-blur"
          >
            →
          </button>
          <div className="relative mx-auto h-[70vh] max-w-5xl overflow-hidden rounded-3xl border border-white/30 bg-black">
            <Image
              src={images[activeIndex].url}
              alt={images[activeIndex].label ?? `Gallery image ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 90vw, 70vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
