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
      className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-center bg-cover"
      style={{
        backgroundImage: `url('${HERO_IMAGES[activeIndex]}')`,
        backgroundPosition: HERO_POSITIONS[activeIndex] ?? "center"
      }}
    >
      <div className="absolute inset-0 bg-slate-900/35 md:bg-slate-900/45" aria-hidden />
      <div className="relative px-6 md:px-0">
        <div className="max-w-4xl">{children}</div>
      </div>
    </section>
  );
}
