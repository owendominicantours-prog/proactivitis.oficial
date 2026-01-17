import Link from "next/link";
import { translate, type Locale, type TranslationKey } from "@/lib/translations";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import TourGalleryCollage from "@/components/tours/TourGalleryCollage";
import GalleryLightbox from "@/components/shared/GalleryLightbox";
import CountdownUrgency from "@/components/landing/CountdownUrgency";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import { BUGGY_ATV_BASE_TOUR } from "@/data/buggy-atv-variants";
import type { RenderableVariant } from "@/lib/tourVariantCatalog";

const FALLBACK_TOUR_IMAGE = "/fototours/fotosimple.jpg";
const FALLBACK_TRANSFER_IMAGE = "/transfer/sedan.png";
const TRANSFER_LANDING_PREFIX = "punta-cana-international-airport-to-";

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

type BuggyAtvVariantLandingProps = {
  locale: Locale;
  variant: RenderableVariant;
  tour: {
    id: string;
    slug: string;
    title: string;
    price: number;
    heroImage: string | null;
    gallery: string | null;
    timeOptions: string | null;
    options?: {
      id: string;
      name: string;
      type: string | null;
      description: string | null;
      pricePerPerson: number | null;
      basePrice: number | null;
      baseCapacity: number | null;
      extraPricePerPerson: number | null;
      pickupTimes: string[] | null;
      isDefault: boolean | null;
      active: boolean | null;
    }[];
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

export default function BuggyAtvVariantLanding({
  locale,
  variant,
  tour,
  transferHotels
}: BuggyAtvVariantLandingProps) {
  const t = (key: TranslationKey, replacements?: Record<string, string | number>) =>
    translate(locale, key, replacements);
  const localePrefix = locale === "es" ? "" : `/${locale}`;
  const heroImage = resolveTourImage(tour.heroImage, tour.gallery);
  const timeSlots = JSON.parse(tour.timeOptions ?? "[]") as PersistedTimeSlot[];
  const priceLabel = `$${tour.price.toFixed(0)} USD`;
  const inclusions = BUGGY_ATV_BASE_TOUR.inclusions[locale] ?? BUGGY_ATV_BASE_TOUR.inclusions.es;
  const highlights = BUGGY_ATV_BASE_TOUR.highlights[locale] ?? BUGGY_ATV_BASE_TOUR.highlights.es;
  const landingSlug = `thingtodo/tours/${variant.slug}`;
  const eyebrow =
    locale === "es"
      ? "Buggy y ATV Punta Cana"
      : locale === "fr"
        ? "Buggy et ATV Punta Cana"
        : "Buggy and ATV Punta Cana";
  const highlightsLabel =
    locale === "es"
      ? "Ruta y paradas"
      : locale === "fr"
        ? "Parcours et arrets"
        : "Route highlights";

  const bookingWidgetProps = {
    tourId: tour.id,
    basePrice: tour.price,
    timeSlots,
    options: tour.options ?? [],
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {t("tour.hero.reviewsCount", { count: 1420 })}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
              {inclusions.slice(0, 4).map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#booking"
                className="rounded-3xl bg-indigo-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-indigo-100 transition-transform hover:scale-105 active:scale-95"
              >
                {variant.ctas[locale][0] ?? t("tour.hero.cta.reserve")}
              </Link>
              <GalleryLightbox
                images={parseGallery(tour.gallery)}
                buttonLabel={t("tour.hero.cta.gallery")}
                buttonClassName="rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
              />
            </div>
          </div>
          <TourGalleryCollage
            images={parseGallery(tour.gallery)}
            title={variant.titles[locale]}
            fallbackImage={heroImage}
          />
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                {t("tour.section.overview.label")}
              </p>
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                {variant.bodyBlocks[locale].map((block) => (
                  <p key={block}>{block}</p>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                {t("thingtodo.longform.eyebrow")}
              </p>
              <h2 className="mt-2 text-[20px] font-semibold text-slate-900">
                {t("thingtodo.longform.title", { title: variant.titles[locale] })}
              </h2>
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                <p>{t("thingtodo.longform.body1", { title: variant.titles[locale] })}</p>
                <p>{t("thingtodo.longform.body2")}</p>
                <p>{t("thingtodo.longform.body3")}</p>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                {t("thingtodo.longform2.eyebrow")}
              </p>
              <h2 className="mt-2 text-[20px] font-semibold text-slate-900">
                {t("thingtodo.longform2.title", { title: variant.titles[locale] })}
              </h2>
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                <p>{t("thingtodo.longform2.body1", { title: variant.titles[locale] })}</p>
                <p>{t("thingtodo.longform2.body2")}</p>
                <p>{t("thingtodo.longform2.body3")}</p>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                {t("thingtodo.longform3.eyebrow")}
              </p>
              <h2 className="mt-2 text-[20px] font-semibold text-slate-900">
                {t("thingtodo.longform3.title", { title: variant.titles[locale] })}
              </h2>
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                <p>{t("thingtodo.longform3.body1", { title: variant.titles[locale] })}</p>
                <p>{t("thingtodo.longform3.body2")}</p>
                <p>{t("thingtodo.longform3.body3")}</p>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{highlightsLabel}</p>
              <ul className="mt-4 space-y-2 text-sm font-semibold text-slate-700">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden className="text-lg text-indigo-500">*</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                {t("tour.section.coverage.label")}
              </p>
              <h2 className="text-[20px] font-semibold text-slate-900">
                {t("tour.section.coverage.heading")}
              </h2>
              <ul className="mt-4 space-y-2 text-sm font-semibold text-emerald-600">
                {inclusions.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden className="text-lg text-emerald-500">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">FAQ</p>
              <div className="mt-3 space-y-4 text-sm text-slate-700">
                {variant.faqs[locale].map((faq) => (
                  <article key={faq.q} className="rounded-[16px] border border-[#F1F5F9] bg-white/60 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{faq.q}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{faq.a}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <aside className="space-y-6" id="booking">
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {t("tour.booking.panel.label")}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">{tour.title}</h3>
              <p className="text-sm text-slate-600">{variant.heroSubtitles[locale]}</p>
              <div className="mt-4">
                <TourBookingWidget {...bookingWidgetProps} />
              </div>
              <CountdownUrgency spots={20} />
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{t("partyBoat.operatorLabel")}</span>
                <span>{tour.SupplierProfile?.company ?? "Local Crew"}</span>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                {t("safetyGuide.reco.transfers.label")}
              </p>
              <div className="mt-4 space-y-3">
                {transferHotels.map((hotel) => (
                  <Link
                    key={hotel.slug}
                    href={`${localePrefix}/transfer/${TRANSFER_LANDING_PREFIX}${hotel.slug}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700"
                  >
                    <img
                      src={hotel.heroImage ?? FALLBACK_TRANSFER_IMAGE}
                      alt={hotel.name}
                      className="h-16 w-20 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {hotel.zone?.name ?? t("safetyGuide.reco.transfers.zoneFallback")}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">{hotel.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
