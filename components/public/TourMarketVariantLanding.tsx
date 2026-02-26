import Link from "next/link";
import { DynamicImage } from "@/components/shared/DynamicImage";
import type { Locale } from "@/lib/translations";
import type { TourMarketIntent } from "@/lib/tourMarketVariants";
import { buildTourMarketIntentCards, buildTourMarketIntentFaqs } from "@/lib/tourMarketVariants";

const FALLBACK_TOUR_IMAGE = "/fototours/fototour.jpeg";
const FALLBACK_TRANSFER_IMAGE = "/transfer/sedan.png";

type Props = {
  locale: Locale;
  tour: {
    slug: string;
    title: string;
    shortDescription?: string | null;
    description: string;
    duration: string;
    price: number;
    heroImage?: string | null;
    location: string;
  };
  intent: TourMarketIntent;
  transferHotels: {
    slug: string;
    name: string;
    heroImage: string | null;
    zone?: { name: string } | null;
  }[];
  allHotels: {
    slug: string;
    name: string;
  }[];
};

export default function TourMarketVariantLanding({ locale, tour, intent, transferHotels, allHotels }: Props) {
  const localePrefix = locale === "es" ? "" : `/${locale}`;
  const title =
    locale === "es"
      ? `${intent.heroPrefix.es}: ${tour.title} en Punta Cana`
      : locale === "fr"
      ? `${intent.heroPrefix.fr}: ${tour.title} a Punta Cana`
      : `${intent.heroPrefix.en}: ${tour.title} in Punta Cana`;

  const subtitle = intent.angle[locale];
  const description = tour.shortDescription || tour.description;
  const intentCards = buildTourMarketIntentCards(intent, locale, tour.title, allHotels.length);
  const intentFaqs = buildTourMarketIntentFaqs(intent, locale, tour.title);

  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-emerald-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">{intent.keyword[locale]}</p>
            <h1 className="text-4xl font-black text-slate-900">{title}</h1>
            <p className="text-base text-slate-600">{subtitle}</p>
            <p className="text-sm text-slate-500">{description}</p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                {locale === "es" ? "Duracion" : locale === "fr" ? "Duree" : "Duration"}: {tour.duration}
              </span>
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {locale === "es" ? "Desde" : locale === "fr" ? "A partir de" : "From"} USD {Math.round(tour.price)}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`${localePrefix}/tours/${tour.slug}`}
                className="rounded-full bg-emerald-600 px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white hover:bg-emerald-700"
              >
                {locale === "es" ? "Reservar tour" : locale === "fr" ? "Reserver le tour" : "Book tour"}
              </Link>
              <Link
                href={`${localePrefix}/punta-cana/traslado`}
                className="rounded-full border border-slate-300 px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
              >
                {locale === "es" ? "Ver traslados" : locale === "fr" ? "Voir transferts" : "See transfers"}
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-full min-h-[280px]">
              <DynamicImage src={tour.heroImage || FALLBACK_TOUR_IMAGE} alt={tour.title} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {locale === "es" ? "Opciones de traslado" : locale === "fr" ? "Options de transfert" : "Transfer options"}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {locale === "es"
              ? "Traslados recomendados desde aeropuerto a hoteles de Punta Cana"
              : locale === "fr"
              ? "Transferts recommandes de l aeroport vers les hotels de Punta Cana"
              : "Recommended airport-to-hotel transfers in Punta Cana"}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {intentCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{card.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {transferHotels.map((hotel) => (
              <Link
                key={hotel.slug}
                href={`${localePrefix}/transfer/punta-cana-international-airport-to-${hotel.slug}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-emerald-400"
              >
                <div className="relative h-36">
                  <DynamicImage
                    src={hotel.heroImage || FALLBACK_TRANSFER_IMAGE}
                    alt={hotel.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                    {hotel.zone?.name || "Punta Cana"}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{hotel.name}</p>
                  <p className="text-xs text-emerald-700">
                    {locale === "es" ? "Ver traslado privado" : locale === "fr" ? "Voir transfert prive" : "View private transfer"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {locale === "es" ? "Hoteles conectados" : locale === "fr" ? "Hotels connectes" : "Connected hotels"}
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">
            {locale === "es" ? "Todos los hoteles con cobertura de traslados" : locale === "fr" ? "Tous les hotels avec couverture transferts" : "All hotels with transfer coverage"}
          </h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {allHotels.map((hotel) => (
              <Link
                key={hotel.slug}
                href={`${localePrefix}/transfer/punta-cana-international-airport-to-${hotel.slug}`}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
              >
                {hotel.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">FAQ</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {intentFaqs.map((faq) => (
              <article key={faq.q} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{faq.q}</p>
                <p className="mt-2 text-sm text-slate-700">{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
