"use client";

import { ReactNode, useEffect, useState } from "react";

type HomeHeroCarouselProps = {
  children: ReactNode;
  intervalMs?: number;
};

const HERO_IMAGES = [
  "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/Carrusel/CARRU1.jpg",
  "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/Carrusel/CARRU2.jpg",
  "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/Carrusel/CARR3.png"
];
const HERO_POSITIONS = ["center", "center", "center 15%"];

export function HomeHeroCarousel({ children, intervalMs = 4500 }: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = HERO_IMAGES.length;

  useEffect(() => {
    if (maxIndex <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % maxIndex);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, maxIndex]);

  return (
    <section
      className="relative flex min-h-[560px] items-center justify-center overflow-hidden bg-center bg-cover"
      style={{
        backgroundImage: `url('${HERO_IMAGES[activeIndex]}')`,
        backgroundPosition: HERO_POSITIONS[activeIndex] ?? "center"
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.82)_0%,rgba(15,23,42,0.58)_42%,rgba(15,23,42,0.22)_100%)]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-50 via-slate-50/65 to-transparent" aria-hidden />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-20 md:px-8">
        <div className="max-w-4xl">{children}</div>
      </div>
    </section>
  );
}
