import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/translations";
import { getPremiumTransferContentOverrides } from "@/lib/siteContent";
import { prisma } from "@/lib/prisma";
import PremiumTransferBookingWidget from "@/components/transfers/PremiumTransferBookingWidget";
import StructuredData from "@/components/schema/StructuredData";
import { PROACTIVITIS_URL } from "@/lib/seo";

const WHATSAPP_LINK = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/18093949877";

const LABELS = {
  es: {
    eliteRoute: "Ruta premium recomendada",
    galleryTitle: "Galeria VIP",
    fleetCadillac: "Cadillac Escalade Class",
    fleetSuburban: "Chevrolet Suburban Class"
  },
  en: {
    eliteRoute: "Recommended premium route",
    galleryTitle: "VIP Gallery",
    fleetCadillac: "Cadillac Escalade Class",
    fleetSuburban: "Chevrolet Suburban Class"
  },
  fr: {
    eliteRoute: "Itineraire premium recommande",
    galleryTitle: "Galerie VIP",
    fleetCadillac: "Cadillac Escalade Class",
    fleetSuburban: "Chevrolet Suburban Class"
  }
} as const;

type Props = {
  locale: Locale;
};

export default async function PremiumTransferLandingPage({ locale }: Props) {
  const content = await getPremiumTransferContentOverrides(locale);
  const copy = LABELS[locale] ?? LABELS.es;

  const origin = await prisma.transferLocation.findFirst({
    where: {
      type: "AIRPORT",
      countryCode: "RD",
      active: true,
      OR: [{ slug: { contains: "punta-cana" } }, { slug: { contains: "puj" } }]
    },
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true }
  });

  if (!origin) notFound();

  let destinations = await prisma.transferLocation.findMany({
    where: {
      type: "HOTEL",
      countryCode: "RD",
      active: true,
      zone: { slug: { contains: "punta-cana" } }
    },
    select: { id: true, slug: true, name: true },
    orderBy: { name: "asc" },
    take: 100
  });
  if (!destinations.length) {
    destinations = await prisma.transferLocation.findMany({
      where: {
        type: "HOTEL",
        countryCode: "RD",
        active: true
      },
      select: { id: true, slug: true, name: true },
      orderBy: { name: "asc" },
      take: 100
    });
  }

  const gallery = content.galleryImages ?? [];
  const bullets = content.vipBullets ?? [];

  const canonicalPath =
    locale === "es" ? "/punta-cana/premium-transfer-services" : `/${locale}/punta-cana/premium-transfer-services`;
  const canonicalUrl = `${PROACTIVITIS_URL}${canonicalPath}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: content.heroTitle,
    description: content.heroSubtitle,
    serviceType: "Luxury Airport Transfer",
    areaServed: {
      "@type": "City",
      name: "Punta Cana"
    },
    provider: {
      "@type": "LocalBusiness",
      name: "Proactivitis",
      url: PROACTIVITIS_URL
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
      priceCurrency: "USD"
    },
    image: [
      content.heroBackgroundImage,
      content.heroSpotlightImage,
      content.cadillacImage,
      content.suburbanImage,
      ...(content.galleryImages ?? [])
    ].filter(Boolean)
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <StructuredData data={schema} />

      <section className="relative overflow-hidden border-b border-amber-200/20">
        <div className="absolute inset-0">
          <Image
            src={content.heroBackgroundImage || "/transfer/suv.png"}
            alt={content.heroTitle || "Premium transfer"}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/35" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.2fr,1fr] md:py-24">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-amber-200/40 bg-amber-200/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-amber-100">
              {content.heroBadge}
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
              {content.heroTitle}
            </h1>
            <p className="max-w-2xl text-lg text-slate-200 md:text-xl">{content.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#vip-booking"
                className="rounded-full bg-amber-300 px-6 py-3 text-xs font-black uppercase tracking-[0.28em] text-slate-900 transition hover:bg-amber-200"
              >
                {content.ctaPrimaryLabel}
              </a>
              <Link
                href={WHATSAPP_LINK}
                className="rounded-full border border-white/50 px-6 py-3 text-xs font-bold uppercase tracking-[0.28em] text-white transition hover:bg-white/10"
              >
                {content.ctaSecondaryLabel}
              </Link>
            </div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
              {copy.eliteRoute}: {origin.name} {"->"} Punta Cana Resorts
            </p>
          </div>
          <div className="relative min-h-[380px] overflow-hidden rounded-[34px] border border-amber-200/30 shadow-[0_40px_90px_rgba(0,0,0,0.45)]">
            <Image
              src={content.heroSpotlightImage || content.lifestyleImage || "/transfer/sedan.png"}
              alt={content.heroTitle || "VIP spotlight"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      <section id="vip-booking" className="mx-auto max-w-7xl px-4 py-12">
        {destinations.length ? (
          <PremiumTransferBookingWidget
            locale={locale}
            originId={origin.id}
            originSlug={origin.slug}
            originLabel={origin.name}
            destinations={destinations}
            title={content.bookingTitle || "Book your premium transfer"}
          />
        ) : (
          <div className="rounded-2xl border border-amber-200/30 bg-slate-900/70 p-6 text-sm text-amber-100">
            No hay destinos premium disponibles ahora mismo. Escribe por WhatsApp para cotizacion inmediata.
          </div>
        )}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 md:grid-cols-2">
        <article className="overflow-hidden rounded-3xl border border-amber-200/20 bg-slate-900/60">
          <div className="relative h-64">
            <Image
              src={content.cadillacImage || "/transfer/suv.png"}
              alt="Cadillac premium transfer"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-200">{copy.fleetCadillac}</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Cadillac Escalade</h3>
          </div>
        </article>
        <article className="overflow-hidden rounded-3xl border border-amber-200/20 bg-slate-900/60">
          <div className="relative h-64">
            <Image
              src={content.suburbanImage || "/transfer/suv.png"}
              alt="Suburban premium transfer"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-200">{copy.fleetSuburban}</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Chevrolet Suburban</h3>
          </div>
        </article>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 md:grid-cols-[1.3fr,1fr]">
        <article className="rounded-3xl border border-amber-200/20 bg-slate-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{content.experienceTitle}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">{content.experienceBody}</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-100">
            {bullets.map((bullet) => (
              <li key={bullet} className="rounded-xl border border-amber-200/20 bg-slate-800/60 px-4 py-3">
                {bullet}
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-amber-200/20 bg-slate-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{copy.galleryTitle}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {gallery.slice(0, 4).map((image, index) => (
              <div key={image + index} className="relative h-28 overflow-hidden rounded-xl">
                <Image src={image} alt={`Premium gallery ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
