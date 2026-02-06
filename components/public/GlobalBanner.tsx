"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/context/LanguageProvider";

type BannerPayload = {
  enabled: boolean;
  message: string;
  link: string;
  linkLabel: string;
  tone: "info" | "success" | "warning" | "urgent";
};

const toneStyles: Record<BannerPayload["tone"], { wrapper: string; link: string }> = {
  info: {
    wrapper: "bg-slate-900 text-white",
    link: "text-white underline"
  },
  success: {
    wrapper: "bg-emerald-600 text-white",
    link: "text-white underline"
  },
  warning: {
    wrapper: "bg-amber-500 text-slate-900",
    link: "text-slate-900 underline"
  },
  urgent: {
    wrapper: "bg-red-600 text-white",
    link: "text-white underline"
  }
};

export default function GlobalBanner() {
  const { locale } = useTranslation();
  const [banner, setBanner] = useState<BannerPayload | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/site-content/banner?locale=${locale}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setBanner(data as BannerPayload);
      })
      .catch(() => {
        if (!active) return;
        setBanner(null);
      });
    return () => {
      active = false;
    };
  }, [locale]);

  const styles = useMemo(() => {
    if (!banner) return null;
    return toneStyles[banner.tone] ?? toneStyles.info;
  }, [banner]);

  if (!banner || !banner.enabled || !banner.message.trim()) {
    return null;
  }

  return (
    <div className={`w-full ${styles?.wrapper ?? toneStyles.info.wrapper}`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.3em] sm:flex-row sm:justify-between sm:text-left sm:text-sm">
        <span className="flex-1">{banner.message}</span>
        {banner.link ? (
          <Link href={banner.link} className={styles?.link ?? toneStyles.info.link}>
            {banner.linkLabel || "Ver mas"}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
