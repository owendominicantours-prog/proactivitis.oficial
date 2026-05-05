"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/lib/translations";

type Props = {
  locale: Locale;
};

export default function BlogReadingProgress({ locale }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setProgress(Math.round(ratio * 100));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="blog-reading-progress" aria-label={`${locale} reading progress`}>
      <div className="blog-reading-bar">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
