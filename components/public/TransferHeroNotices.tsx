"use client";

import { useEffect, useState } from "react";
import { Locale, translate } from "@/lib/translations";

const noticeKeys = [
  "transfer.hero.notice.one",
  "transfer.hero.notice.two",
  "transfer.hero.notice.three"
] as const;

const ROTATE_MS = 7000;

type Props = {
  locale: Locale;
};

export default function TransferHeroNotices({ locale }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % noticeKeys.length);
    }, ROTATE_MS);

    return () => clearInterval(timer);
  }, []);

  const firstKey = noticeKeys[index % noticeKeys.length];
  const secondKey = noticeKeys[(index + 1) % noticeKeys.length];

  return (
    <div className="flex flex-wrap gap-2 text-xs text-white/80">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
        <span className="h-2 w-2 rounded-full bg-emerald-300" />
        {translate(locale, firstKey)}
      </span>
      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
        <span className="h-2 w-2 rounded-full bg-emerald-300" />
        {translate(locale, secondKey)}
      </span>
    </div>
  );
}
