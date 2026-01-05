"use client";

import { useEffect, useState } from "react";

type CountdownUrgencyProps = {
  spots?: number;
};

const formatTime = (value: number) => value.toString().padStart(2, "0");

export default function CountdownUrgency({ spots = 24 }: CountdownUrgencyProps) {
  const [seconds, setSeconds] = useState(900);
  const [availability, setAvailability] = useState(spots);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAvailability((prev) => (prev > 4 ? prev - 1 : spots));
    }, 15000);
    return () => clearInterval(interval);
  }, [spots]);

  return (
    <div className="mt-6 rounded-[16px] border border-[#d4af37]/40 bg-[#0d0d0d]/80 p-4 text-xs uppercase tracking-[0.3em] text-white">
      <p className="text-[10px] text-slate-300">Últimos espacios disponibles para hoy</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-2xl font-black text-[#d4af37]">{availability} spots</span>
        <span>
          {formatTime(Math.floor(seconds / 60))}:{formatTime(seconds % 60)}
        </span>
      </div>
    </div>
  );
}
