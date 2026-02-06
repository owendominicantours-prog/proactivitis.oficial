import type { Locale } from "@/lib/translations";
import { updateGlobalBannerContentAction } from "@/app/(dashboard)/admin/settings/actions";

type BannerDefaults = {
  enabled: boolean;
  message: string;
  link: string;
  linkLabel: string;
  tone: "info" | "success" | "warning" | "urgent";
};

type GlobalBannerSettingsFormProps = {
  locales: Locale[];
  defaultsByLocale: Record<string, BannerDefaults>;
};

export default function GlobalBannerSettingsForm({
  locales,
  defaultsByLocale
}: GlobalBannerSettingsFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Banner Global</h2>
        <p className="text-sm text-slate-500">
          Activa un aviso en todo el sitio (promociones, alertas o anuncios).
        </p>
      </div>
      <div className="space-y-6">
        {locales.map((locale) => {
          const defaults = defaultsByLocale[locale];
          const localeLabel = locale === "es" ? "Espanol" : locale === "en" ? "English" : "Francais";
          return (
            <form
              key={`banner-${locale}`}
              action={updateGlobalBannerContentAction}
              className="space-y-6 rounded-2xl border border-slate-100 bg-slate-50 p-6"
            >
              <input type="hidden" name="locale" value={locale} />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{localeLabel}</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{locale}</span>
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="banner_enabled"
                  defaultChecked={defaults.enabled}
                  className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                Mostrar banner global
              </label>

              <label className="text-sm text-slate-600">
                Mensaje
                <input
                  name="banner_message"
                  defaultValue={defaults.message}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Link (opcional)
                  <input
                    name="banner_link"
                    defaultValue={defaults.link}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Texto del link
                  <input
                    name="banner_link_label"
                    defaultValue={defaults.linkLabel}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>

              <label className="text-sm text-slate-600">
                Estilo
                <select
                  name="banner_tone"
                  defaultValue={defaults.tone}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
              >
                Guardar banner
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
