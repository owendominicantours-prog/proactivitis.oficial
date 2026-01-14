import Link from "next/link";
import { translate, type Locale, type TranslationKey } from "@/lib/translations";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import TourGalleryCollage from "@/components/tours/TourGalleryCollage";
import GalleryLightbox from "@/components/shared/GalleryLightbox";
import CountdownUrgency from "@/components/landing/CountdownUrgency";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import { SAMANA_WHALE_BASE_TOUR, type SamanaWhaleVariant } from "@/data/samana-whale-variants";

const FALLBACK_TOUR_IMAGE = "/fototours/fotosimple.jpg";
const FALLBACK_TRANSFER_IMAGE = "/transfer/sedan.png";
const TRANSFER_LANDING_PREFIX = "punta-cana-international-airport-to-";

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

type SamanaWhaleVariantLandingProps = {
  locale: Locale;
  variant: SamanaWhaleVariant;
  tour: {
    id: string;
    slug: string;
    title: string;
    price: number;
    heroImage: string | null;
    gallery: string | null;
    timeOptions: string | null;
    platformSharePercent: number | null;
    SupplierProfile?: { stripeAccountId?: string | null; company?: string | null } | null;
  };
  transferHotels: {
    slug: string;
    name: string;
    heroImage: string | null;
    zone?: { name: string } | null;
  }[];
};

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as string[]) ?? [];
  } catch {
    return [];
  }
};

const resolveTourImage = (heroImage?: string | null, gallery?: string | null) => {
  if (heroImage) return heroImage;
  const parsed = parseGallery(gallery);
  return parsed[0] ?? FALLBACK_TOUR_IMAGE;
};

export default function SamanaWhaleVariantLanding({
  locale,
  variant,
  tour,
  transferHotels
}: SamanaWhaleVariantLandingProps) {
  const t = (key: string, replacements?: Record<string, string | number>) =>
    translate(locale, key as TranslationKey, replacements);
  const localePrefix = locale === "es" ? "" : `/${locale}`;
  const heroImage = resolveTourImage(tour.heroImage, tour.gallery);
  const timeSlots = JSON.parse(tour.timeOptions ?? "[]") as PersistedTimeSlot[];
  const priceLabel = `$${tour.price.toFixed(0)} USD`;
  const inclusions =
    SAMANA_WHALE_BASE_TOUR.inclusions[locale] ?? SAMANA_WHALE_BASE_TOUR.inclusions.es;
  const highlights =
    SAMANA_WHALE_BASE_TOUR.highlights[locale] ?? SAMANA_WHALE_BASE_TOUR.highlights.es;
  const landingSlug = `thingtodo/tours/${variant.slug}`;
  const eyebrow =
    locale === "es"
      ? "Tour Samana"
      : locale === "fr"
        ? "Tour Samana"
        : "Samana Whale Tour";
  const highlightsLabel =
    locale === "es"
      ? "Momentos clave"
      : locale === "fr"
        ? "Moments cles"
        : "Key highlights";

  const bookingWidgetProps = {
    tourId: tour.id,
    basePrice: tour.price,
    timeSlots,
    supplierHasStripeAccount: Boolean(tour.SupplierProfile?.stripeAccountId),
    platformSharePercent: tour.platformSharePercent ?? 20,
    tourTitle: tour.title ?? variant.titles[locale],
    tourImage: heroImage,
    bookingCode: undefined,
    hotelSlug: undefined
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-950 pb-20 overflow-x-hidden">
      <LandingViewTracker landingSlug={landingSlug} />

      <section className="mx-auto max-w-[1240px] px-4 pt-10">
        <div className="grid gap-6 overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.06)] lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-14">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{eyebrow}</p>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">
              {variant.titles[locale]}
            </h1>
            <p className="text-base text-slate-600 sm:text-lg">{variant.heroSubtitles[locale]}</p>
            <div className="flex items-end gap-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t("tour.hero.priceLabel")}
                </p>
                <p className="text-4xl font-black text-indigo-600">{priceLabel}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t("tour.hero.ratingLabel")}
                </p>
                <div className="flex items-center gap-2">
                  <span aria-hidden className="text-2xl text-indigo-600">*</span>
                  <p className="text-xl font-black">4.7/5</p>
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">1,000+ reviews</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
              {highlights.slice(0, 3).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {variant.ctas[locale].map((cta) => (
                <Link
                  key={cta}
                  href={`${localePrefix}/tours/${tour.slug}#booking`}
                  className="rounded-3xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-100 transition-transform hover:scale-105"
                >
                  {cta}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative h-[360px] w-full overflow-hidden rounded-[32px] bg-slate-100 p-3 sm:h-[420px] lg:h-full">
            <GalleryLightbox
              images={parseGallery(tour.gallery).length ? parseGallery(tour.gallery) : [heroImage]}
              buttonLabel={t("tour.hero.cta.gallery")}
              buttonClassName="absolute bottom-6 left-6 rounded-2xl border border-white/70 bg-white/90 px-6 py-2 text-xs font-semibold text-slate-900"
            />
            <TourGalleryCollage images={[heroImage]} title={variant.titles[locale]} fallbackImage={heroImage} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-8 px-4 py-12 lg:grid-cols-[1fr,380px]">
        <div className="space-y-10">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{highlightsLabel}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{variant.titles[locale]}</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              {variant.bodyBlocks[locale].map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {t("tour.landing.inclusions")}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {inclusions.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-emerald-500">*</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {t("tour.landing.faq")}
            </p>
            <div className="mt-4 space-y-4 text-sm text-slate-700">
              {variant.faqs[locale].map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{faq.q}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {t("tour.landing.transfers")}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {transferHotels.map((hotel) => (
                <Link
                  key={hotel.slug}
                  href={`${localePrefix}/transfer/${TRANSFER_LANDING_PREFIX}${hotel.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-lg"
                >
                  <img
                    src={hotel.heroImage ?? FALLBACK_TRANSFER_IMAGE}
                    alt={hotel.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                      {hotel.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {hotel.zone?.name ?? "Punta Cana"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <CountdownUrgency spots={18} />
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {t("tour.landing.booking")}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{variant.titles[locale]}</h3>
            <div className="mt-4">
              <TourBookingWidget {...bookingWidgetProps} />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
