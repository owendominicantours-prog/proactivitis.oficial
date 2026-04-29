import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GoldenTransferLandingPage from "@/components/public/GoldenTransferLandingPage";
import { allLandings } from "@/data/transfer-landings";
import {
  fillGoldenTransferText,
  parseGoldenTransferPageSlug
} from "@/lib/goldenTransferPages";
import type { Locale } from "@/lib/translations";

const BASE_URL = "https://proactivitis.com";

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

const trimDescription = (value: string, max = 156) =>
  value.replace(/\s+/g, " ").trim().slice(0, max).trim();

const findGoldenTransferLanding = (goldSlug: string) => {
  const parsed = parseGoldenTransferPageSlug(goldSlug);
  if (!parsed) return null;
  const landing = allLandings().find((item) => item.landingSlug === parsed.landingSlug);
  if (!landing) return null;
  return { ...parsed, landing };
};

export async function buildGoldenTransferPageMetadata(goldSlug: string, locale: Locale): Promise<Metadata> {
  const resolved = findGoldenTransferLanding(goldSlug);
  if (!resolved) {
    return {
      title:
        locale === "es"
          ? "Transfer no encontrado"
          : locale === "fr"
            ? "Transfert introuvable"
            : "Transfer not found"
    };
  }

  const { landing, intent } = resolved;
  const title = fillGoldenTransferText(intent.headline[locale], landing.hotelName);
  const keyword = fillGoldenTransferText(intent.keyword[locale], landing.hotelName);
  const description = trimDescription(`${intent.promise[locale]} Desde USD ${Math.round(landing.priceFrom)}. ${intent.buyer[locale]}`);
  const canonicalPath = `${localePrefix(locale)}/punta-cana/transfer/${goldSlug}`;
  const canonical = `${BASE_URL}${canonicalPath}`;
  const image = landing.heroImage.startsWith("http")
    ? landing.heroImage
    : `${BASE_URL}${landing.heroImage.startsWith("/") ? landing.heroImage : `/${landing.heroImage}`}`;

  return {
    title: `${title} | Proactivitis`,
    description,
    keywords: [keyword, "punta cana airport transfer", landing.hotelName, "PUJ transfer"],
    alternates: {
      canonical,
      languages: {
        es: `/punta-cana/transfer/${goldSlug}`,
        en: `/en/punta-cana/transfer/${goldSlug}`,
        fr: `/fr/punta-cana/transfer/${goldSlug}`,
        "x-default": `/punta-cana/transfer/${goldSlug}`
      }
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: image }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export async function renderGoldenTransferPage(goldSlug: string, locale: Locale) {
  const resolved = findGoldenTransferLanding(goldSlug);
  if (!resolved) return notFound();

  return (
    <GoldenTransferLandingPage
      locale={locale}
      landing={resolved.landing}
      intent={resolved.intent}
      pageSlug={goldSlug}
    />
  );
}
