import type { Locale } from "@/lib/translations";
import { updatePremiumTransferContentAction } from "@/app/(dashboard)/admin/settings/actions";

type PremiumDefaults = {
  seoTitle: string;
  seoDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImage: string;
  heroSpotlightImage: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  bookingTitle: string;
  fleetTitle: string;
  experienceTitle: string;
  experienceBody: string;
  galleryImages: string[];
  cadillacImage: string;
  suburbanImage: string;
  lifestyleImage: string;
  vipBullets: string[];
};

type Props = {
  locales: Locale[];
  defaultsByLocale: Record<string, PremiumDefaults>;
};

export default function PremiumTransferSettingsForm({ locales, defaultsByLocale }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Landing VIP Transfer (Punta Cana)</h2>
        <p className="text-sm text-slate-500">
          Edita textos e imagenes de la landing elite sin tocar codigo.
        </p>
      </div>
      <div className="space-y-6">
        {locales.map((locale) => {
          const defaults = defaultsByLocale[locale];
          const localeLabel = locale === "es" ? "Espanol" : locale === "en" ? "English" : "Francais";
          return (
            <form
              key={locale}
              action={updatePremiumTransferContentAction}
              className="space-y-5 rounded-2xl border border-slate-100 bg-slate-50 p-6"
            >
              <input type="hidden" name="locale" value={locale} />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{localeLabel}</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{locale}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  SEO Title
                  <input
                    name="premium_seo_title"
                    defaultValue={defaults.seoTitle}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  SEO Description
                  <input
                    name="premium_seo_description"
                    defaultValue={defaults.seoDescription}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Hero badge
                  <input name="premium_hero_badge" defaultValue={defaults.heroBadge} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
                <label className="text-sm text-slate-600">
                  Hero title
                  <input name="premium_hero_title" defaultValue={defaults.heroTitle} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
              </div>

              <label className="text-sm text-slate-600">
                Hero subtitle
                <textarea name="premium_hero_subtitle" rows={3} defaultValue={defaults.heroSubtitle} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Banner image URL
                  <input name="premium_hero_background" defaultValue={defaults.heroBackgroundImage} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
                <label className="text-sm text-slate-600">
                  Hero spotlight image URL
                  <input name="premium_hero_spotlight" defaultValue={defaults.heroSpotlightImage} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  CTA principal
                  <input name="premium_cta_primary" defaultValue={defaults.ctaPrimaryLabel} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
                <label className="text-sm text-slate-600">
                  CTA secundario
                  <input name="premium_cta_secondary" defaultValue={defaults.ctaSecondaryLabel} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-600">
                  Booking title
                  <input name="premium_booking_title" defaultValue={defaults.bookingTitle} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
                <label className="text-sm text-slate-600">
                  Fleet title
                  <input name="premium_fleet_title" defaultValue={defaults.fleetTitle} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
                <label className="text-sm text-slate-600">
                  Experience title
                  <input name="premium_experience_title" defaultValue={defaults.experienceTitle} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
              </div>

              <label className="text-sm text-slate-600">
                Experience body
                <textarea name="premium_experience_body" rows={3} defaultValue={defaults.experienceBody} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-600">
                  Cadillac image URL
                  <input name="premium_cadillac_image" defaultValue={defaults.cadillacImage} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
                <label className="text-sm text-slate-600">
                  Suburban image URL
                  <input name="premium_suburban_image" defaultValue={defaults.suburbanImage} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
                <label className="text-sm text-slate-600">
                  Lifestyle image URL
                  <input name="premium_lifestyle_image" defaultValue={defaults.lifestyleImage} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                </label>
              </div>

              <label className="text-sm text-slate-600">
                Gallery URLs (una por linea)
                <textarea
                  name="premium_gallery_images"
                  rows={4}
                  defaultValue={defaults.galleryImages.join("\n")}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm text-slate-600">
                VIP bullets (una por linea)
                <textarea
                  name="premium_vip_bullets"
                  rows={4}
                  defaultValue={defaults.vipBullets.join("\n")}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </label>

              <button type="submit" className="inline-flex rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white">
                Guardar landing VIP
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
