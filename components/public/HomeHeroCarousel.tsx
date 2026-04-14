"use client";

import { ReactNode, useEffect, useState } from "react";
import { SITE_CONFIG } from "@/lib/site-config";

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
  const isFunjet = SITE_CONFIG.variant === "funjet";

  useEffect(() => {
    if (maxIndex <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % maxIndex);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, maxIndex]);

  return (
    <section
      className={`relative flex min-h-[420px] items-center justify-center overflow-hidden bg-center bg-cover ${
        isFunjet ? "rounded-b-[42px] border-b border-white/20 shadow-[0_30px_80px_rgba(106,13,173,0.24)]" : ""
      }`}
      style={{
        backgroundImage: `url('${HERO_IMAGES[activeIndex]}')`,
        backgroundPosition: HERO_POSITIONS[activeIndex] ?? "center"
      }}
    >
      <div
        className={`absolute inset-0 ${isFunjet ? "bg-[linear-gradient(120deg,rgba(58,14,94,0.88),rgba(106,13,173,0.68),rgba(255,195,0,0.18))]" : "bg-slate-900/55 md:bg-slate-900/65"}`}
        aria-hidden
      />
      {isFunjet ? (
        <>
          <div className="pointer-events-none absolute left-8 top-10 h-24 w-24 rounded-full bg-[#FFC300]/80 blur-2xl" aria-hidden />
          <div className="pointer-events-none absolute right-10 top-16 h-20 w-20 rounded-full border-4 border-white/30" aria-hidden />
          <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-[radial-gradient(circle_at_20px_-4px,transparent_18px,rgba(255,255,255,0.22)_19px,rgba(255,255,255,0.22)_22px,transparent_23px)] bg-[length:60px_24px]" aria-hidden />
        </>
      ) : null}
      <div className="relative px-6 md:px-0">
        <div className="max-w-4xl">{children}</div>
      </div>
    </section>
  );
}
