"use client";

import { useEffect, useState } from "react";
import { Locale, translate } from "@/lib/translations";

type Props = {
  locale: Locale;
};

export default function BlogReadingProgress({ locale }: Props) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      const percent = Math.round(ratio * 100);
      setProgress(percent);
      setDone(percent >= 98);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="blog-reading-progress">
      <div className="blog-reading-bar">
        <span style={{ width: `${progress}%` }} />
      </div>
      <span className={`blog-reading-chip ${done ? "is-done" : ""}`}>
        {done ? translate(locale, "blog.reading.done") : translate(locale, "blog.reading.progress")}
      </span>
    </div>
  );
}
