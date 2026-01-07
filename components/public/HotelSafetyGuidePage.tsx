import Link from "next/link";
import { translate, type Locale, type TranslationKey } from "@/lib/translations";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import { SAFETY_GUIDE_BASE_PATH, SAFETY_GUIDE_SLUG_SUFFIX } from "@/lib/safety-guide";

const TRANSFER_LANDING_PREFIX = "punta-cana-international-airport-to-";
const FALLBACK_TOUR_IMAGE = "/fototours/fotosimple.jpg";
const FALLBACK_TRANSFER_IMAGE = "/transfer/sedan.png";

type HotelInfo = {
  slug: string;
  name: string;
  description?: string | null;
  heroImage?: string | null;
};

type TourInfo = {
  slug: string;
  title: string;
  price: number;
  heroImage?: string | null;
  gallery?: string | null;
};

type TransferHotelInfo = {
  slug: string;
  name: string;
  heroImage?: string | null;
  zone?: { name: string } | null;
};

type HotelSafetyGuidePageProps = {
  locale: Locale;
  hotel: HotelInfo;
  tours: TourInfo[];
  transferHotels: TransferHotelInfo[];
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

const tKey = (base: string, index: number) => `${base}.${index}` as TranslationKey;

export default function HotelSafetyGuidePage({
  locale,
  hotel,
  tours,
  transferHotels
}: HotelSafetyGuidePageProps) {
  const t = (key: TranslationKey, replacements?: Record<string, string>) =>
    translate(locale, key, replacements);
  const localePrefix = locale === "es" ? "" : `/${locale}`;
  const heroImage = hotel.heroImage ?? FALLBACK_TRANSFER_IMAGE;
  const landingSlug = `${SAFETY_GUIDE_BASE_PATH}/${hotel.slug}${SAFETY_GUIDE_SLUG_SUFFIX}`;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-950 pb-20">
      <LandingViewTracker landingSlug={landingSlug} />

      <section className="mx-auto max-w-[1240px] px-4 pt-10">
        <div className="grid gap-6 rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_30px_60px_rgba(0,0,0,0.06)] lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{t("safetyGuide.hero.label")}</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              {t("safetyGuide.hero.title", { hotel: hotel.name })}
            </h1>
            <p className="mt-4 max-w-3xl text-base text-slate-600">
              {t("safetyGuide.hero.body", { hotel: hotel.name })}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`${localePrefix}/tours`}
                className="rounded-3xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100"
              >
                {t("safetyGuide.hero.cta.tours")}
              </Link>
              <a
                href="#checklist"
                className="rounded-3xl border border-slate-200 px-8 py-3 text-sm font-semibold text-slate-900"
              >
                {t("safetyGuide.hero.cta.checklist")}
              </a>
            </div>
            <p className="mt-4 text-xs text-slate-500">{t("safetyGuide.hero.urlLabel")}</p>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
            <img src={heroImage} alt={hotel.name} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section id="checklist" className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">{t("safetyGuide.section.license.title")}</h2>
            <p className="mt-3 text-sm text-slate-600">{t("safetyGuide.section.license.body")}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {[1, 2, 3].map((index) => (
                <li key={index}>{t(tKey("safetyGuide.section.license.bullets", index))}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">{t("safetyGuide.section.checklist.title")}</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {[1, 2, 3, 4].map((index) => (
                <li key={index}>{t(tKey("safetyGuide.section.checklist.bullets", index))}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">{t("safetyGuide.section.operator.title")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/40 p-4 text-sm text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                {t("safetyGuide.section.operator.legal.label")}
              </p>
              <ul className="mt-3 space-y-2">
                {[1, 2, 3, 4].map((index) => (
                  <li key={index}>{t(tKey("safetyGuide.section.operator.legal.bullets", index))}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[20px] border border-rose-100 bg-rose-50/40 p-4 text-sm text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">
                {t("safetyGuide.section.operator.alert.label")}
              </p>
              <ul className="mt-3 space-y-2">
                {[1, 2, 3, 4].map((index) => (
                  <li key={index}>{t(tKey("safetyGuide.section.operator.alert.bullets", index))}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">{t("safetyGuide.section.lost.title")}</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
              {[1, 2, 3].map((index) => (
                <li key={index}>{t(tKey("safetyGuide.section.lost.steps", index))}</li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-slate-600">
              {t("safetyGuide.section.lost.body", { hotel: hotel.name })}
            </p>
          </div>
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">{t("safetyGuide.section.cert.title")}</h2>
            <p className="mt-3 text-sm text-slate-600">{t("safetyGuide.section.cert.body")}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-slate-700">
              <div className="rounded-[16px] border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {t("safetyGuide.section.cert.cards.gps.label")}
                </p>
                <p className="mt-2 font-semibold">{t("safetyGuide.section.cert.cards.gps.body")}</p>
              </div>
              <div className="rounded-[16px] border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {t("safetyGuide.section.cert.cards.insurance.label")}
                </p>
                <p className="mt-2 font-semibold">{t("safetyGuide.section.cert.cards.insurance.body")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">{t("safetyGuide.section.pricing.title")}</h2>
          <p className="mt-3 text-sm text-slate-600">{t("safetyGuide.section.pricing.body")}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-slate-700">
            <div className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {t("safetyGuide.section.pricing.legal.label")}
              </p>
              <ul className="mt-3 space-y-2">
                {[1, 2, 3].map((index) => (
                  <li key={index}>{t(tKey("safetyGuide.section.pricing.legal.bullets", index))}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {t("safetyGuide.section.pricing.informal.label")}
              </p>
              <ul className="mt-3 space-y-2">
                {[1, 2, 3].map((index) => (
                  <li key={index}>{t(tKey("safetyGuide.section.pricing.informal.bullets", index))}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">{t("safetyGuide.section.pricing.note")}</p>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{t("safetyGuide.reco.label")}</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{t("safetyGuide.reco.title")}</h2>
          <p className="mt-3 text-sm text-slate-600">{t("safetyGuide.reco.body")}</p>
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {t("safetyGuide.reco.tours.label")}
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tours.map((tour) => {
                  const image = resolveTourImage(tour.heroImage, tour.gallery);
                  return (
                    <Link
                      key={tour.slug}
                      href={`${localePrefix}/tours/${tour.slug}`}
                      className="flex h-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm transition hover:border-slate-400"
                    >
                      <div className="h-40 w-full overflow-hidden bg-slate-100">
                        <img src={image} alt={tour.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-4 text-sm text-slate-700">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                          {t("safetyGuide.reco.tours.badge")}
                        </p>
                        <h3 className="text-base font-semibold text-slate-900">{tour.title}</h3>
                        <p className="text-sm text-slate-600">
                          ${tour.price.toFixed(0)} {t("safetyGuide.reco.tours.priceSuffix")}
                        </p>
                        <span className="mt-auto text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
                          {t("safetyGuide.reco.tours.cta")}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {t("safetyGuide.reco.transfers.label")}
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {transferHotels.map((transferHotel) => (
                  <Link
                    key={transferHotel.slug}
                    href={`${localePrefix}/transfer/${TRANSFER_LANDING_PREFIX}${transferHotel.slug}`}
                    className="flex h-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm transition hover:border-slate-400"
                  >
                    <div className="h-40 w-full overflow-hidden bg-slate-100">
                      <img
                        src={transferHotel.heroImage ?? FALLBACK_TRANSFER_IMAGE}
                        alt={transferHotel.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4 text-sm text-slate-700">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {transferHotel.zone?.name ?? t("safetyGuide.reco.transfers.zoneFallback")}
                      </p>
                      <h3 className="text-base font-semibold text-slate-900">{transferHotel.name}</h3>
                      <p className="text-sm text-slate-600">{t("safetyGuide.reco.transfers.body")}</p>
                      <span className="mt-auto text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
                        {t("safetyGuide.reco.transfers.cta")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
