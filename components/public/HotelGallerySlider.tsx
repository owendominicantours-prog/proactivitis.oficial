"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type HotelGallerySliderProps = {
  images: string[];
  hotelName: string;
};

export default function HotelGallerySlider({ images, hotelName }: HotelGallerySliderProps) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!safeImages.length) return null;

  const current = safeImages[activeIndex] ?? safeImages[0];

  return (
    <section className="space-y-3">
      <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 md:h-[420px]">
        <Image src={current} alt={hotelName} fill className="object-cover" sizes="100vw" priority />
        {safeImages.length > 1 ? (
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))}
              className="rounded-full bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow"
              aria-label="Imagen anterior"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev + 1) % safeImages.length)}
              className="rounded-full bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow"
              aria-label="Siguiente imagen"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {safeImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
          {safeImages.slice(0, 12).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 overflow-hidden rounded-xl border ${
                index === activeIndex ? "border-slate-900" : "border-slate-200"
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <Image src={image} alt={`${hotelName} ${index + 1}`} fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
