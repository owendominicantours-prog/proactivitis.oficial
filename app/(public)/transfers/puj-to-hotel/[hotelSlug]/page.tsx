import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TransferLandingQuote, getTransferLandingQuote } from "@/lib/transfers/landing-quote";
import { getPromotionByDestination, transferLandingPromotions } from "@/data/promotions";
import { TransferLandingPromotion } from "@/data/promotions/puj-to-hotels";

const DEFAULT_ORIGIN_SLUG = "puj-airport";
const DEFAULT_PASSENGERS = 2;
const ORIGIN_LABEL = "Aeropuerto Internacional de Punta Cana (PUJ)";
const BASE_URL = "https://proactivitis.com";

const buildCheckoutHref = (
  vehicle: TransferLandingQuote["vehicles"][number],
  promotion: TransferLandingPromotion
) => {
  const params = new URLSearchParams();
  params.set("type", "transfer");
  params.set("hotelSlug", promotion.destinationSlug);
  params.set("origin", DEFAULT_ORIGIN_SLUG);
  params.set("vehicleId", vehicle.id);
  params.set("tourPrice", vehicle.price.toFixed(2));
  params.set("totalPrice", (vehicle.price * DEFAULT_PASSENGERS).toFixed(2));
  params.set("adults", String(DEFAULT_PASSENGERS));
  params.set("youth", "0");
  params.set("child", "0");
  params.set("tripType", "one-way");
  params.set("originLabel", ORIGIN_LABEL);
  params.set("originHotelName", promotion.hotelName);
  params.set("tourTitle", `Traslado a ${promotion.hotelName}`);
  if (promotion.heroImage) {
    params.set("tourImage", promotion.heroImage);
  }
  params.set("flowType", "transfer");
  return `/checkout?${params.toString()}`;
};

const buildSchema = (promotion: TransferLandingPromotion, quote: TransferLandingQuote) => {
  const topVehicle = quote.vehicles[0];
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: promotion.heroTitle,
    url: `${BASE_URL}/transfers/puj-to-hotel/${promotion.destinationSlug}`,
    provider: {
      "@type": "Organization",
      name: "Proactivitis",
      url: "https://proactivitis.com",
      telephone: "+18002345678"
    },
    areaServed: {
      "@type": "Place",
      name: "Punta Cana, República Dominicana"
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: topVehicle?.price ?? 0,
      availability: "https://schema.org/InStock"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: promotion.schemaRating,
      reviewCount: promotion.schemaReviewCount
    }
  };
};

const buildFaqSchema = (promotion: TransferLandingPromotion) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: promotion.faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a
    }
  }))
});

export async function generateStaticParams() {
  return transferLandingPromotions.map((promotion) => ({
    hotelSlug: promotion.destinationSlug
  }));
}

export async function generateMetadata({ params }: { params: { hotelSlug: string } }) {
  const promotion = getPromotionByDestination(params.hotelSlug);
  if (!promotion) {
    return {};
  }
  return {
    title: promotion.seoTitle,
    description: promotion.metaDescription,
    openGraph: {
      title: promotion.seoTitle,
      description: promotion.metaDescription,
      url: `${BASE_URL}/transfers/puj-to-hotel/${promotion.destinationSlug}`,
      images: [
        {
          url: `${BASE_URL}${promotion.heroImage}`,
          alt: promotion.heroImageAlt
        }
      ]
    },
    keywords: promotion.keywords.join(", ")
  };
}

export default async function TransferLandingPage({ params }: { params: { hotelSlug: string } }) {
  const promotion = getPromotionByDestination(params.hotelSlug);
  if (!promotion) {
    return notFound();
  }

  let quote: TransferLandingQuote;
  try {
    quote = await getTransferLandingQuote({
      originSlug: DEFAULT_ORIGIN_SLUG,
      destinationSlug: promotion.destinationSlug,
      passengers: DEFAULT_PASSENGERS
    });
  } catch (error) {
    return notFound();
  }

  const schema = buildSchema(promotion, quote);
  const faqSchema = buildFaqSchema(promotion);

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.5em] text-emerald-600">Promoción PUJ → Hotel</p>
            <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{promotion.heroTitle}</h1>
            <p className="text-lg text-slate-600">{promotion.heroSubtitle}</p>
            <p className="text-base text-slate-500">{promotion.heroDescription}</p>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">{promotion.heroTagline}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{promotion.priceGuide}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {promotion.priceDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              {promotion.trustBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-slate-200 px-4 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-600">
                  {badge}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              {promotion.socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 underline decoration-emerald-300 decoration-2 underline-offset-4"
                >
                  {social.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative h-96 w-full overflow-hidden rounded-[32px] border border-white/40 shadow-xl">
            <Image src={promotion.heroImage} alt={promotion.heroImageAlt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-4 py-12">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Tarifas confirmadas</p>
          <h2 className="text-3xl font-black text-slate-900">Resultados con precio garantizado</h2>
          <p className="text-sm text-slate-500">
            Selecciona el vehículo perfecto para tu llegada desde PUJ y asegúrate el mismo precio fijo aunque cambien los pasajeros.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {quote.vehicles.map((vehicle) => {
            const reserveUrl = buildCheckoutHref(vehicle, promotion);
            const totalPrice = (vehicle.price * DEFAULT_PASSENGERS).toFixed(2);
            return (
              <article key={vehicle.id} className="flex flex-col justify-between gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">{vehicle.category}</p>
                  <h3 className="text-2xl font-semibold text-slate-900">{vehicle.name}</h3>
                  <p className="text-sm text-slate-500">{vehicle.minPax}–{vehicle.maxPax} pasajeros</p>
                  <p className="text-3xl font-bold text-emerald-600">${vehicle.price.toFixed(2)}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tarifa por viajero · Total ${totalPrice}</p>
                  <div className="grid gap-2 text-xs text-slate-500">
                    <p>Chofer bilingüe</p>
                    <p>Wifi a bordo y agua fría</p>
                    <p>Soporte 24/7 en Punta Cana</p>
                  </div>
                </div>
                <Link href={reserveUrl} className="rounded-2xl bg-slate-900 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800">
                  Reservar ahora
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-12 text-white">
          <h3 className="text-2xl font-semibold">Lo que hace único este traslado</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {promotion.highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-white/20 bg-white/5 p-4 text-sm">
                {highlight}
              </div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {promotion.gallery.map((image) => (
              <div key={image} className="relative h-40 w-full overflow-hidden rounded-2xl border border-white/20">
                <Image src={image} alt={promotion.heroImageAlt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Preguntas frecuentes</p>
          <h2 className="text-2xl font-bold text-slate-900">{promotion.hotelName} + PUJ</h2>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {promotion.faq.map((item) => (
            <article key={item.q} className="rounded-2xl border border-slate-100 bg-white/80 p-6 text-sm text-slate-600 shadow-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{item.q}</p>
              <p className="mt-2 font-semibold text-slate-900">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="space-y-2 text-center text-sm text-slate-500">
          <p>¿Quieres revisar otras rutas? </p>
          <Link href="/traslado" className="font-semibold text-emerald-600">
            Volver al buscador general de traslados
          </Link>
        </div>
      </section>

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(schema)}
      </script>
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(faqSchema)}
      </script>
    </main>
  );
}
