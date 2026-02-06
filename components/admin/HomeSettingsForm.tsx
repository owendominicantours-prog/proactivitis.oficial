import type { Locale } from "@/lib/translations";
import { updateHomeContentAction } from "@/app/(dashboard)/admin/settings/actions";

type HomeDefaults = {
  hero: {
    brand: string;
    title: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  benefits: {
    label: string;
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  recommended: {
    label: string;
    title: string;
  };
  puntaCana: {
    subtitle: string;
    title: string;
  };
  longform: {
    eyebrow: string;
    title: string;
    body1: string;
    body2: string;
    body3: string;
    points: Array<{ title: string; body: string }>;
  };
  transferBanner: {
    label: string;
    title: string;
    description: string;
    cta: string;
    backgroundImage: string;
  };
  about: {
    label: string;
    title: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
};

type HomeSettingsFormProps = {
  locales: Locale[];
  defaultsByLocale: Record<string, HomeDefaults>;
};

export default function HomeSettingsForm({ locales, defaultsByLocale }: HomeSettingsFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Home (Contenido por idioma)</h2>
        <p className="text-sm text-slate-500">Edita el contenido principal del Home sin tocar codigo.</p>
      </div>
      <div className="space-y-6">
        {locales.map((locale) => {
          const defaults = defaultsByLocale[locale];
          const localeLabel = locale === "es" ? "Espanol" : locale === "en" ? "English" : "Francais";
          return (
            <form
              key={locale}
              action={updateHomeContentAction}
              className="space-y-6 rounded-2xl border border-slate-100 bg-slate-50 p-6"
            >
              <input type="hidden" name="locale" value={locale} />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{localeLabel}</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{locale}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Hero - Marca
                  <input
                    name="home_hero_brand"
                    defaultValue={defaults.hero.brand}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Hero - Titulo
                  <input
                    name="home_hero_title"
                    defaultValue={defaults.hero.title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <label className="text-sm text-slate-600">
                Hero - Descripcion
                <textarea
                  name="home_hero_description"
                  defaultValue={defaults.hero.description}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Hero - CTA principal
                  <input
                    name="home_hero_cta_primary"
                    defaultValue={defaults.hero.ctaPrimary}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Hero - CTA secundario
                  <input
                    name="home_hero_cta_secondary"
                    defaultValue={defaults.hero.ctaSecondary}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-600">
                  Beneficios - Etiqueta
                  <input
                    name="home_benefits_label"
                    defaultValue={defaults.benefits.label}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Beneficios - Titulo
                  <input
                    name="home_benefits_title"
                    defaultValue={defaults.benefits.title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Beneficios - Descripcion
                  <input
                    name="home_benefits_description"
                    defaultValue={defaults.benefits.description}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-600">
                  Beneficio 1 - Titulo
                  <input
                    name="home_benefit_1_title"
                    defaultValue={defaults.benefits.items[0].title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Beneficio 1 - Descripcion
                  <input
                    name="home_benefit_1_description"
                    defaultValue={defaults.benefits.items[0].description}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-600">
                  Beneficio 2 - Titulo
                  <input
                    name="home_benefit_2_title"
                    defaultValue={defaults.benefits.items[1].title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Beneficio 2 - Descripcion
                  <input
                    name="home_benefit_2_description"
                    defaultValue={defaults.benefits.items[1].description}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-600">
                  Beneficio 3 - Titulo
                  <input
                    name="home_benefit_3_title"
                    defaultValue={defaults.benefits.items[2].title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Beneficio 3 - Descripcion
                  <input
                    name="home_benefit_3_description"
                    defaultValue={defaults.benefits.items[2].description}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Recomendados - Etiqueta
                  <input
                    name="home_recommended_label"
                    defaultValue={defaults.recommended.label}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Recomendados - Titulo
                  <input
                    name="home_recommended_title"
                    defaultValue={defaults.recommended.title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Punta Cana - Subtitulo
                  <input
                    name="home_punta_subtitle"
                    defaultValue={defaults.puntaCana.subtitle}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Punta Cana - Titulo
                  <input
                    name="home_punta_title"
                    defaultValue={defaults.puntaCana.title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Longform - Eyebrow
                  <input
                    name="home_longform_eyebrow"
                    defaultValue={defaults.longform.eyebrow}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Longform - Titulo
                  <input
                    name="home_longform_title"
                    defaultValue={defaults.longform.title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <label className="text-sm text-slate-600">
                Longform - Parrafo 1
                <textarea
                  name="home_longform_body1"
                  defaultValue={defaults.longform.body1}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="text-sm text-slate-600">
                Longform - Parrafo 2
                <textarea
                  name="home_longform_body2"
                  defaultValue={defaults.longform.body2}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="text-sm text-slate-600">
                Longform - Parrafo 3
                <textarea
                  name="home_longform_body3"
                  defaultValue={defaults.longform.body3}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Longform - Punto 1 Titulo
                  <input
                    name="home_longform_point_1_title"
                    defaultValue={defaults.longform.points[0].title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Longform - Punto 1 Descripcion
                  <input
                    name="home_longform_point_1_body"
                    defaultValue={defaults.longform.points[0].body}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Longform - Punto 2 Titulo
                  <input
                    name="home_longform_point_2_title"
                    defaultValue={defaults.longform.points[1].title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Longform - Punto 2 Descripcion
                  <input
                    name="home_longform_point_2_body"
                    defaultValue={defaults.longform.points[1].body}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Longform - Punto 3 Titulo
                  <input
                    name="home_longform_point_3_title"
                    defaultValue={defaults.longform.points[2].title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Longform - Punto 3 Descripcion
                  <input
                    name="home_longform_point_3_body"
                    defaultValue={defaults.longform.points[2].body}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Banner traslados - Etiqueta
                  <input
                    name="home_transfer_label"
                    defaultValue={defaults.transferBanner.label}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Banner traslados - Titulo
                  <input
                    name="home_transfer_title"
                    defaultValue={defaults.transferBanner.title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <label className="text-sm text-slate-600">
                Banner traslados - Descripcion
                <textarea
                  name="home_transfer_description"
                  defaultValue={defaults.transferBanner.description}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Banner traslados - CTA
                  <input
                    name="home_transfer_cta"
                    defaultValue={defaults.transferBanner.cta}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Banner traslados - Imagen (URL)
                  <input
                    name="home_transfer_image"
                    defaultValue={defaults.transferBanner.backgroundImage}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Sobre nosotros - Etiqueta
                  <input
                    name="home_about_label"
                    defaultValue={defaults.about.label}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Sobre nosotros - Titulo
                  <input
                    name="home_about_title"
                    defaultValue={defaults.about.title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <label className="text-sm text-slate-600">
                Sobre nosotros - Descripcion
                <textarea
                  name="home_about_description"
                  defaultValue={defaults.about.description}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Sobre nosotros - CTA principal
                  <input
                    name="home_about_cta_primary"
                    defaultValue={defaults.about.ctaPrimary}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Sobre nosotros - CTA secundario
                  <input
                    name="home_about_cta_secondary"
                    defaultValue={defaults.about.ctaSecondary}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
              >
                Guardar Home
              </button>
            </form>
          );
        })}
      </div>
    </section>
  );
}
