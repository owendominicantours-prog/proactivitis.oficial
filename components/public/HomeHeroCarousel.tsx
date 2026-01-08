"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";

type HomeHeroCarouselProps = {
  children: ReactNode;
  intervalMs?: number;
};

const HERO_IMAGES = ["/CARRU1.jpg", "/CARRU2.jpg", "/CARRU3.jpg"];

export function HomeHeroCarousel({ children, intervalMs = 4500 }: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = HERO_IMAGES.length;
  const backgroundStyles = useMemo(
    () =>
      HERO_IMAGES.map((image) => ({
        backgroundImage: `linear-gradient(90deg, rgba(4, 21, 45, 0.85), rgba(4, 21, 45, 0.35)), url('${image}')`
      })),
    []
  );

  useEffect(() => {
    if (maxIndex <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % maxIndex);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, maxIndex]);

  return (
    <section className="relative overflow-hidden">
      <div className="h-[420px] w-full">
        {backgroundStyles.map((style, index) => (
          <div
            key={style.backgroundImage}
            aria-hidden
            className={`absolute inset-0 bg-center bg-cover transition-opacity duration-700 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            style={style}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-6 md:px-0">
        <div className="max-w-4xl">{children}</div>
      </div>
    </section>
  );
}
