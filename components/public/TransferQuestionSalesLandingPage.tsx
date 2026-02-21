import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/translations";
import { prisma } from "@/lib/prisma";
import PremiumTransferBookingWidget from "@/components/transfers/PremiumTransferBookingWidget";
import StructuredData from "@/components/schema/StructuredData";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import { PROACTIVITIS_URL, PROACTIVITIS_LOCALBUSINESS, SAME_AS_URLS, getPriceValidUntil } from "@/lib/seo";
import {
  findTransferQuestionSalesLandingBySlug,
  type TransferQuestionSalesLanding
} from "@/data/transfer-question-sales-landings";

const DOMINICAN_COUNTRY_CODES = ["RD", "DO", "DOMINICAN-REPUBLIC"];

const FAQ_FOLLOWUPS: Record<Locale, Array<{ q: string; a: string }>> = {
  es: [
    {
      q: "Conviene reservar el transfer antes de viajar?",
      a: "Si. Aseguras tarifa, disponibilidad y llegada sin estres."
    },
    {
      q: "Puedo agregar tours luego del traslado?",
      a: "Si. Puedes coordinar actividades con pickup desde el hotel."
    }
  ],
  en: [
    {
      q: "Should I pre-book transfer before flying?",
      a: "Yes. You secure rates, availability, and smoother arrival."
    },
    {
      q: "Can I add tours after transfer booking?",
      a: "Yes. You can add hotel-pickup activities easily."
    }
  ],
  fr: [
    {
      q: "Faut-il reserver le transfert avant le vol ?",
      a: "Oui. Vous securisez tarif, disponibilite et arrivee fluide."
    },
    {
      q: "Puis-je ajouter des tours apres le transfert ?",
      a: "Oui. Vous pouvez ajouter des activites avec pickup hotel."
    }
  ]
};

const UI = {
  es: {
    eyebrow: "Google Question Intent",
    title2: "Respuesta directa + decision de compra",
    ctaBack: "Ver landing premium principal",
    ctaTransfers: "Ver traslados por hotel",
    bookingTitle: "Cotiza tu traslado premium ahora",
    fallback:
      "No hay opciones activas en este momento. Escribenos por WhatsApp para cotizacion inmediata.",
    whyTitle: "Por que esta respuesta convierte",
    whyCopy:
      "Responde la duda real del cliente y lo lleva directo a una accion concreta: reservar traslado y luego sumar tours."
  },
  en: {
    eyebrow: "Google Question Intent",
    title2: "Direct answer + buying decision",
    ctaBack: "Open main premium landing",
    ctaTransfers: "See hotel transfer pages",
    bookingTitle: "Get your premium transfer quote now",
    fallback: "No active options right now. Message us on WhatsApp for an instant quote.",
    whyTitle: "Why this answer converts",
    whyCopy:
      "It solves the real doubt and moves the visitor to a concrete action: book transfer first, add tours next."
  },
  fr: {
    eyebrow: "Google Question Intent",
    title2: "Reponse directe + decision d achat",
    ctaBack: "Voir landing premium principale",
    ctaTransfers: "Voir les transferts par hotel",
    bookingTitle: "Obtenez votre devis premium maintenant",
    fallback: "Aucune option active pour le moment. Ecrivez-nous sur WhatsApp pour un devis immediat.",
    whyTitle: "Pourquoi cette reponse convertit",
    whyCopy:
      "Elle repond au vrai doute du client et le pousse vers une action concrete: reserver transfert puis ajouter des tours."
  }
} as const;

export default async function TransferQuestionSalesLandingPage({
  locale,
  questionSlug
}: {
  locale: Locale;
  questionSlug: string;
}) {
  const entry = findTransferQuestionSalesLandingBySlug(questionSlug);
  if (!entry) return notFound();
  const copy = UI[locale] ?? UI.es;

  let locations: Array<{ id: string; slug: string; name: string }> = [];
  try {
    locations = await prisma.transferLocation.findMany({
      where: {
        active: true,
        countryCode: { in: DOMINICAN_COUNTRY_CODES },
        type: { in: ["HOTEL", "AIRPORT"] }
      },
      select: { id: true, slug: true, name: true },
      orderBy: { name: "asc" },
      take: 500
    });
  } catch (error) {
    console.warn("transfer-question-sales: fallback without locations", error);
  }

  const canBook = locations.length > 1;
  const pagePath =
    locale === "es"
      ? `/punta-cana/premium-transfer-services/questions/${entry.slug}`
      : `/${locale}/punta-cana/premium-transfer-services/questions/${entry.slug}`;
  const pageUrl = `${PROACTIVITIS_URL}${pagePath}`;
  const priceValidUntil = getPriceValidUntil();
  const faqItems = [{ q: entry.question[locale], a: entry.shortAnswer[locale] }, ...(FAQ_FOLLOWUPS[locale] ?? [])];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: entry.seoTitle[locale],
    description: entry.seoDescription[locale],
    serviceType: "Premium Airport Transfer + Tours Assistance",
    provider: PROACTIVITIS_LOCALBUSINESS,
    offers: {
      "@type": "Offer",
      url: pageUrl,
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
      priceValidUntil,
      shippingDetails: {
        "@type": "OfferShippingDetails",
        doesNotShip: true,
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "DO"
        }
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        applicableCountry: "DO"
      }
    },
    keywords: entry.keywords.join(", "),
    sameAs: SAME_AS_URLS
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };

  const webSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: entry.seoTitle[locale],
    description: entry.seoDescription[locale],
    url: pageUrl,
    inLanguage: locale
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <LandingViewTracker landingSlug={`punta-cana/premium-transfer-services/questions/${entry.slug}`} />
      <StructuredData data={serviceSchema} />
      <StructuredData data={faqSchema} />
      <StructuredData data={webSchema} />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">{copy.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black leading-tight text-white md:text-5xl">{entry.question[locale]}</h1>
        <p className="mt-4 text-lg text-slate-200">{entry.shortAnswer[locale]}</p>
        <p className="mt-3 text-sm text-slate-300">{entry.salesBody[locale]}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={locale === "es" ? "/punta-cana/premium-transfer-services" : `/${locale}/punta-cana/premium-transfer-services`}
            className="rounded-full bg-amber-300 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-slate-900"
          >
            {copy.ctaBack}
          </Link>
          <Link
            href={locale === "es" ? "/transfer/punta-cana" : `/${locale}/transfer/punta-cana`}
            className="rounded-full border border-white/50 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white"
          >
            {copy.ctaTransfers}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <article className="rounded-3xl border border-amber-200/20 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold text-white">{copy.title2}</h2>
          <p className="mt-3 text-sm text-slate-300">{copy.whyCopy}</p>
          <p className="mt-3 text-sm text-slate-300">
            {locale === "es"
              ? "Secuencia recomendada: 1) cerrar traslado aeropuerto-hotel, 2) cerrar tours con pickup desde hotel."
              : locale === "fr"
              ? "Sequence recommandee: 1) fermer transfert aeroport-hotel, 2) vendre tours avec pickup hotel."
              : "Recommended sequence: 1) close airport-hotel transfer, 2) close hotel-pickup tours."}
          </p>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        {canBook ? (
          <PremiumTransferBookingWidget locale={locale} locations={locations} title={copy.bookingTitle} />
        ) : (
          <div className="rounded-2xl border border-amber-200/30 bg-slate-900/70 p-6 text-sm text-amber-100">
            {copy.fallback}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <article className="rounded-3xl border border-amber-200/20 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold text-white">{copy.whyTitle}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {faqItems.map((item) => (
              <div key={item.q} className="rounded-xl border border-amber-200/20 bg-slate-800/60 p-4">
                <h3 className="text-sm font-semibold text-white">{item.q}</h3>
                <p className="mt-2 text-xs text-slate-200">{item.a}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

export const findQuestionLandingOrNull = (questionSlug: string): TransferQuestionSalesLanding | undefined =>
  findTransferQuestionSalesLandingBySlug(questionSlug);
