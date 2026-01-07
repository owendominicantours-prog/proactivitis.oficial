import Link from "next/link";
import Image from "next/image";
import FeaturedToursSection from "@/components/public/FeaturedToursSection";
import { allLandings } from "@/data/transfer-landings";
import { es, translate } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  const locale = es;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const transferCards = allLandings().slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12">
      <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{t("notFound.eyebrow")}</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">{t("notFound.title")}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">{t("notFound.body")}</p>
        <div className="mt-6">
          <form action="/tours" method="get" className="flex flex-wrap gap-3">
            <label className="flex flex-1 flex-col text-sm text-slate-600">
              {t("notFound.search.label")}
              <input
                name="destination"
                placeholder={t("notFound.search.placeholder")}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </label>
            <button
              type="submit"
              className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
            >
              {t("notFound.search.cta")}
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{t("notFound.tours.eyebrow")}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{t("notFound.tours.title")}</h2>
        </div>
        <FeaturedToursSection locale={locale} />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{t("notFound.transfers.eyebrow")}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{t("notFound.transfers.title")}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {transferCards.map((landing) => (
            <Link
              key={landing.landingSlug}
              href={`/transfer/${landing.landingSlug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={landing.heroImage || "/transfer/mini van.png"}
                  alt={landing.heroImageAlt || landing.hotelName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("notFound.transfers.cardTag")}</p>
                <h3 className="text-base font-semibold text-slate-900">{landing.hotelName}</h3>
                <p className="text-sm text-slate-600">{landing.heroSubtitle}</p>
                <span className="mt-auto text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
                  {t("notFound.transfers.cardCta")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
