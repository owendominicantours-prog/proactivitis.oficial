import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TransferLocationType } from "@prisma/client";
import TrasladoSearchV2, { type LocationSummary } from "@/components/traslado/TrasladoSearchV2";
import StructuredData from "@/components/schema/StructuredData";
import { resolveLocationByAlias } from "@/components/public/TransferLandingPage";
import {
  getGeminiSeoLanding,
  type GeminiSeoLandingRecord,
  type GeminiSeoLocaleContent
} from "@/lib/geminiSeoFactory";
import type { Locale } from "@/lib/translations";

const BASE_URL = "https://proactivitis.com";

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);
export const geminiSeoPublicPath = (slug: string, locale: Locale) =>
  `${localePrefix(locale)}/punta-cana/${slug}`;

const absoluteUrl = (value?: string | null) => {
  if (!value) return `${BASE_URL}/transfer/sedan.png`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const getDisplayImage = (landing: GeminiSeoLandingRecord, content: GeminiSeoLocaleContent) => {
  if (landing.type === "transfer") return "/transfer/sedan.png";
  const candidate = absoluteUrl(content.image || landing.product.image);
  const normalized = candidate.toLowerCase();
  if (
    normalized.includes("google.com/url") ||
    normalized.includes("gstatic.com") ||
    normalized.includes("encrypted-tbn") ||
    normalized.includes("placeholder")
  ) {
    return absoluteUrl(landing.product.image);
  }
  try {
    const url = new URL(candidate);
    if (url.hostname === "proactivitis.com" || url.hostname === "www.proactivitis.com") {
      return decodeURI(url.pathname);
    }
  } catch {
    return candidate;
  }
  return candidate;
};

const toLocationSummary = (location: Awaited<ReturnType<typeof resolveLocationByAlias>>): LocationSummary | null =>
  location
    ? {
        id: location.id,
        name: location.name,
        slug: location.slug,
        type: location.type,
        zoneName: null
      }
    : null;

const getTransferInitialLocations = async (landing: GeminiSeoLandingRecord) => {
  if (landing.type !== "transfer") return { initialOrigin: null, initialDestination: null };
  const [originSlugRaw, destinationSlugRaw] = landing.product.slug.includes("-to-")
    ? landing.product.slug.split("-to-")
    : ["puj-airport", landing.product.slug];
  const [originLocation, destinationLocation] = await Promise.all([
    resolveLocationByAlias(originSlugRaw || "puj-airport", TransferLocationType.AIRPORT),
    resolveLocationByAlias(destinationSlugRaw || landing.product.slug)
  ]);
  return {
    initialOrigin: toLocationSummary(originLocation),
    initialDestination: toLocationSummary(destinationLocation)
  };
};

const getContent = (landing: GeminiSeoLandingRecord, locale: Locale): GeminiSeoLocaleContent =>
  landing.locales[locale] ?? landing.locales.es;

export async function buildGeminiSeoLandingMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const landing = await getGeminiSeoLanding(slug);
  if (!landing) return {};
  const content = getContent(landing, locale);
  const prefix = localePrefix(locale);
  const pageUrl = `${BASE_URL}${geminiSeoPublicPath(landing.slug, locale)}`;
  const imageUrl = absoluteUrl(getDisplayImage(landing, content));
  const isPublished = landing.status === "published";

  return {
    title: content.title,
    description: content.metaDescription,
    robots: {
      index: isPublished,
      follow: isPublished
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        es: geminiSeoPublicPath(landing.slug, "es"),
        en: geminiSeoPublicPath(landing.slug, "en"),
        fr: geminiSeoPublicPath(landing.slug, "fr"),
        "x-default": geminiSeoPublicPath(landing.slug, "es")
      }
    },
    openGraph: {
      title: content.ogTitle || content.title,
      description: content.ogDescription || content.metaDescription,
      url: pageUrl,
      siteName: "Proactivitis",
      type: "website",
      locale: locale === "es" ? "es_DO" : locale === "fr" ? "fr_FR" : "en_US",
      images: [
        {
          url: imageUrl,
          alt: content.imageAlt || content.h1,
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: content.ogTitle || content.title,
      description: content.ogDescription || content.metaDescription,
      images: [imageUrl]
    },
    keywords: content.keywords
  };
}

export default async function GeminiSeoLandingPage({
  slug,
  locale,
  preview = false
}: {
  slug: string;
  locale: Locale;
  preview?: boolean;
}) {
  const landing = await getGeminiSeoLanding(slug);
  if (!landing) return notFound();
  if (landing.status !== "published" && !preview) return notFound();

  const content = getContent(landing, locale);
  const prefix = localePrefix(locale);
  const productUrl =
    landing.type === "transfer"
      ? `${prefix}${new URL(landing.product.url).pathname}`
      : `${prefix}${new URL(landing.product.url).pathname}`;
  const imageUrl = getDisplayImage(landing, content);
  const { initialOrigin, initialDestination } = await getTransferInitialLocations(landing);
  const priceLabel =
    typeof landing.product.price === "number"
      ? `Desde $${Math.round(landing.product.price)}`
      : locale === "es"
        ? "Precio claro al reservar"
        : locale === "fr"
          ? "Prix clair a la reservation"
          : "Clear price before booking";

  return (
    <main className="bg-white text-slate-950">
      <StructuredData data={content.schema} />
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <Image src={imageUrl} alt={content.imageAlt || content.h1} fill priority className="object-cover opacity-65" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/45 to-slate-950" />
        </div>
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-5 pb-12 pt-24 sm:px-8 lg:px-12">
          {preview ? (
            <div className="mb-5 w-fit rounded-full bg-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-950">
              Draft preview
            </div>
          ) : null}
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-200">
              {landing.type === "transfer" ? "Private transfer" : "Selected experience"}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              {content.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-white/90">{content.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={landing.type === "transfer" ? "#seo-transfer-quote" : productUrl}
                className="rounded-full bg-sky-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-sky-950/30 transition hover:bg-sky-400"
              >
                {content.ctaLabel}
              </a>
              <span className="rounded-full border border-white/25 bg-white/15 px-6 py-4 text-sm font-black text-white backdrop-blur">
                {priceLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:grid-cols-3 sm:px-8 lg:px-12">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Producto real</p>
            <p className="mt-2 font-black text-slate-950">{landing.product.title}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Confianza</p>
            <p className="mt-2 font-black text-emerald-950">Soporte local y checkout seguro</p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-700">Siguiente paso</p>
            <p className="mt-2 font-black text-sky-950">
              {landing.type === "transfer" ? "Cotiza tu ruta" : "Ver disponibilidad"}
            </p>
          </div>
        </div>
      </section>

      {landing.type === "transfer" ? (
        <section id="seo-transfer-quote" className="bg-slate-50 px-5 py-12 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-700">
                {locale === "es" ? "Cotiza sin salir de la pagina" : locale === "fr" ? "Devis sans quitter la page" : "Quote without leaving"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                {locale === "es"
                  ? "Elige tu vehiculo y asegura el precio aqui mismo"
                  : locale === "fr"
                    ? "Choisissez votre vehicule et gardez le prix ici"
                    : "Choose your vehicle and secure the price here"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {locale === "es"
                  ? "No mandamos al viajero a otra pagina para descubrir el precio. La cotizacion, el regreso y el checkout empiezan aqui."
                  : locale === "fr"
                    ? "Le voyageur voit le prix, le retour et la prochaine etape ici, sans friction."
                    : "The traveler sees price, return option, and the next step here without extra friction."}
              </p>
            </div>
            <TrasladoSearchV2
              initialOrigin={initialOrigin}
              initialDestination={initialDestination}
              initialPassengers={2}
              autoQuote={Boolean(initialOrigin && initialDestination)}
            />
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12">
        <div className="space-y-8">
          {content.sections.map((section) => (
            <article key={section.heading} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">{section.heading}</h2>
              <p className="mt-3 text-base leading-8 text-slate-700">{section.body}</p>
              {section.bullets && section.bullets.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {section.bullets.map((bullet) => (
                    <div key={bullet} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                      {bullet}
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}

          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-black text-slate-950">
              {locale === "es" ? "Preguntas frecuentes" : locale === "fr" ? "Questions frequentes" : "Frequently asked questions"}
            </h2>
            <div className="mt-5 divide-y divide-slate-200">
              {content.faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="cursor-pointer list-none text-base font-black text-slate-950">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{faq.answer}</p>
                </details>
              ))}
            </div>
          </article>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="relative aspect-[4/3]">
              <Image src={imageUrl} alt={content.imageAlt || content.h1} fill className="object-cover" />
            </div>
            <div className="space-y-4 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                {landing.type === "transfer" ? "Reserva tu traslado" : "Reserva tu tour"}
              </p>
              <h3 className="text-xl font-black text-slate-950">{landing.product.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{content.metaDescription}</p>
              <Link
                href={landing.type === "transfer" ? "#seo-transfer-quote" : productUrl}
                className="block rounded-2xl bg-slate-950 px-5 py-4 text-center text-sm font-black text-white transition hover:bg-slate-800"
              >
                {content.ctaLabel}
              </Link>
              {landing.sources.length > 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Senales revisadas</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Gemini uso busqueda actual para ajustar intencion, FAQ y angulo SEO.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
