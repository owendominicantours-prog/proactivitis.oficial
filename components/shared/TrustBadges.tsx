import Link from "next/link";
import { Star } from "lucide-react";
import { Locale, translate, type TranslationKey } from "@/lib/translations";
import { SITE_CONFIG } from "@/lib/site-config";

type BadgeLink = {
  key: "trustpilot" | "google";
  href: string;
  accent: string;
  ring: string;
  iconBg: string;
};

const BADGE_LINKS: BadgeLink[] = [
  {
    key: "trustpilot",
    href: "https://www.trustpilot.com/review/proactivitis.com",
    accent: "text-emerald-600",
    ring: "border-emerald-200/60",
    iconBg: "bg-emerald-50"
  },
  {
    key: "google",
    href: "https://share.google/COHIDVtDTyM1oLAIQ",
    accent: "text-sky-600",
    ring: "border-sky-200/60",
    iconBg: "bg-sky-50"
  }
];

type TrustBadgesProps = {
  locale: Locale;
  compact?: boolean;
  className?: string;
};

export function TrustBadges({ locale, compact, className }: TrustBadgesProps) {
  const t = (key: TranslationKey) => translate(locale, key);
  const isFunjet = SITE_CONFIG.variant === "funjet";

  return (
    <div className={className}>
      {!compact && (
        <div className="mb-3 space-y-1">
          <p className={`text-xs font-semibold uppercase tracking-[0.4em] ${isFunjet ? "text-white" : "text-slate-400"}`}>
            {t("trust.badges.eyebrow")}
          </p>
          <p className={`text-sm ${isFunjet ? "text-white/80" : "text-slate-500"}`}>{t("trust.badges.body")}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {BADGE_LINKS.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={`group flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition hover:-translate-y-0.5 ${
              isFunjet ? "border-white/15 bg-white/8" : link.ring
            }`}
          >
            <span className={`grid h-7 w-7 place-items-center rounded-full ${link.iconBg}`}>
              <Star className={`h-4 w-4 ${link.accent}`} />
            </span>
            <span className={isFunjet ? "text-white" : "text-slate-700"}>{t(`trust.badges.${link.key}`)}</span>
            <span className={`text-[0.65rem] ${isFunjet ? "text-white/75" : "text-slate-400"}`}>{t("trust.badges.cta")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
