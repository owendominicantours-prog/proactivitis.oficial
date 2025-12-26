"use server";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { allLandings, findLandingBySlug, transferLandings } from "@/data/transfer-landings";
import TransferQuoteCards from "@/components/transfers/TransferQuoteCards";

const AIRPORT_SLUG = "puj-airport";
const AIRPORT_NAME = "Punta Cana International Airport (PUJ)";
const BASE_URL = "https://proactivitis.com";

export async function generateStaticParams() {
  return transferLandings.map((landing) => ({ landingSlug: landing.landingSlug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}) {
  const { landingSlug } = await params;
  const landing = findLandingBySlug(landingSlug);
  if (!landing) return {};
  return {
    title: landing.seoTitle,
    description: landing.metaDescription,
    canonical: landing.canonical,
    openGraph: {
      title: landing.seoTitle,
      description: landing.metaDescription,
      url: landing.canonical,
      images: [
        {
          url: `${BASE_URL}${landing.heroImage}`,
          alt: landing.heroImageAlt
        }
      ]
    },
    keywords: landing.keywords.join(", ")
  };
}

const formatDateTime = (date: Date) => {
  const iso = date.toISOString();
  return iso.slice(0, 16);
};

export default async function TransferLandingPage({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}) {
  const { landingSlug } = await params;
  const landing = findLandingBySlug(landingSlug);
  if (!landing) {
    return notFound();
  }

  const [originLocation, destinationLocation] = await Promise.all([
    prisma.transferLocation.findUnique({ where: { slug: AIRPORT_SLUG } }),
    prisma.transferLocation.findUnique({ where: { slug: landing.hotelSlug } })
  ]);
  if (!originLocation || !destinationLocation) {
    return notFound();
  }

  const defaultDeparture = formatDateTime(new Date(Date.now() + 2 * 60 * 60 * 1000));

  const otherLandings = allLandings()
    .filter((item) => item.landingSlug !== landing.landingSlug)
    .slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `Private airport transfer ${landing.hotelName}`,
    provider: {
      "@type": "TravelAgency",
      name: "Proactivitis",
      url: "https://proactivitis.com",
      logo: "https://proactivitis.com/icon.png",
      sameAs: ["https://www.instagram.com/proactivitis/", "https://www.facebook.com/proactivitis"]
    },
    areaServed: {
      "@type": "Place",
      name: "Punta Cana"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Transfers desde Punta Cana",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Private transfer to ${landing.hotelName}`
          },
          priceCurrency: "USD",
          price: landing.priceFrom
        }
      ]
    }
  };

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Proactivitis",
    url: "https://proactivitis.com",
    logo: "https://proactivitis.com/icon.png",
    sameAs: ["https://www.instagram.com/proactivitis/", "https://www.facebook.com/proactivitis"]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://proactivitis.com/"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Transfers",
        item: "https://proactivitis.com/transfer"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: landing.heroTitle,
        item: `${BASE_URL}/transfer/${landing.landingSlug}`
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landing.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.5em] text-emerald-600">Transfer desde PUJ</p>
            <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{landing.heroTitle}</h1>
            <p className="text-lg text-slate-600">{landing.heroSubtitle}</p>
            <p className="text-sm text-slate-500">{landing.heroTagline}</p>
          </div>
          <div className="relative h-96 w-full overflow-hidden rounded-[32px] border border-white/40 shadow-xl">
            <Image src={landing.heroImage} alt={landing.heroImageAlt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-slate-500">Ruta fija: {AIRPORT_NAME} → {landing.hotelName}</p>
        <TransferQuoteCards
          originId={originLocation.id}
          destinationId={destinationLocation.id}
          originSlug={originLocation.slug}
          destinationSlug={destinationLocation.slug}
          originLabel={AIRPORT_NAME}
          destinationLabel={landing.hotelName}
          defaultDeparture={defaultDeparture}
          priceFrom={landing.priceFrom}
        />
      </section>
      <section className="mx-auto max-w-6xl space-y-5 px-4 py-12">
        {landing.longCopy.map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-slate-600">
            {paragraph}
          </p>
        ))}
      </section>
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">FAQ</p>
          <h2 className="text-2xl font-bold text-slate-900">Preguntas frecuentes</h2>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {landing.faq.map((item) => (
            <article key={item.question} className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{item.question}</p>
              <p className="mt-2 font-semibold text-slate-900">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Otras rutas desde el aeropuerto</p>
          <div className="flex flex-wrap gap-3">
            {otherLandings.map((item) => (
              <Link
                key={item.landingSlug}
                href={`/transfer/${item.landingSlug}`}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600"
              >
                {item.hotelName}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {otherLandings.map((item) => (
            <Link
              key={`reverse-${item.reverseSlug}`}
              href={`/transfer/${item.reverseSlug}`}
              className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 underline"
            >
              Volver desde {item.hotelName} al aeropuerto
            </Link>
          ))}
        </div>
      </section>
      <section className="sr-only">
        <script type="application/ld+json">{JSON.stringify(businessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </section>
    </main>
  );
}
