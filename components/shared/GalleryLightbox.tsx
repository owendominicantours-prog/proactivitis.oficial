"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type GalleryLightboxProps = {
  images: string[];
  showDefaultTrigger?: boolean;
  buttonLabel?: string;
  buttonClassName?: string;
  renderTrigger?: (open: () => void) => React.ReactNode;
};

export default function GalleryLightbox({
  images,
  showDefaultTrigger = true,
  buttonLabel = "Ver galería",
  buttonClassName = "rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50",
  renderTrigger
}: GalleryLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = images && images.length > 0;
  const currentImage = useMemo(() => (hasImages ? images[activeIndex] : undefined), [hasImages, activeIndex, images]);

  if (!hasImages) return null;

  const open = (index?: number) => {
    if (typeof index === "number") {
      setActiveIndex(index);
    }
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);
  const goTo = (delta: number) => {
    setActiveIndex((prev) => (prev + delta + images.length) % images.length);
  };

  return (
    <>
      {renderTrigger?.(open)}
      {showDefaultTrigger && (
        <button type="button" onClick={() => open()} className={buttonClassName}>
          {buttonLabel}
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            onClick={close}
            className="absolute right-6 top-6 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow"
          >
            Cerrar
          </button>
          {currentImage && (
            <div className="relative h-[70vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/30 bg-black/60">
              <Image
                src={currentImage}
                alt={`Imagen ${activeIndex + 1}`}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 90vw, 70vw"
              />
            </div>
          )}
          <div className="absolute left-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => goTo(-1)}
              className="rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow"
            >
              ‹ Prev
            </button>
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
              {activeIndex + 1}/{images.length}
            </span>
            <button
              type="button"
              onClick={() => goTo(1)}
              className="rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow"
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </>
  );
}
