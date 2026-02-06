import type { Locale } from "@/lib/translations";
import { updateContactContentAction } from "@/app/(dashboard)/admin/settings/actions";

type ContactDefaults = {
  hero: {
    tagline: string;
    title: string;
    description: string;
  };
  phone: {
    label: string;
    details: string;
    number: string;
  };
  whatsapp: {
    label: string;
    cta: string;
    number: string;
    link: string;
  };
  emails: {
    sectionTitle: string;
    general: string;
    reservations: string;
    suppliers: string;
  };
  longform: {
    eyebrow: string;
    title: string;
    body1: string;
    body2: string;
    body3: string;
  };
};

type ContactSettingsFormProps = {
  locales: Locale[];
  defaultsByLocale: Record<string, ContactDefaults>;
};

export default function ContactSettingsForm({ locales, defaultsByLocale }: ContactSettingsFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Contacto (Contenido por idioma)</h2>
        <p className="text-sm text-slate-500">
          Administra telefonos, WhatsApp, emails y textos de la pagina de contacto.
        </p>
      </div>
      <div className="space-y-6">
        {locales.map((locale) => {
          const defaults = defaultsByLocale[locale];
          const localeLabel = locale === "es" ? "Espanol" : locale === "en" ? "English" : "Francais";
          return (
            <form
              key={`contact-${locale}`}
              action={updateContactContentAction}
              className="space-y-6 rounded-2xl border border-slate-100 bg-slate-50 p-6"
            >
              <input type="hidden" name="locale" value={locale} />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{localeLabel}</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{locale}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Hero - Tagline
                  <input
                    name="contact_hero_tagline"
                    defaultValue={defaults.hero.tagline}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Hero - Titulo
                  <input
                    name="contact_hero_title"
                    defaultValue={defaults.hero.title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <label className="text-sm text-slate-600">
                Hero - Descripcion
                <textarea
                  name="contact_hero_description"
                  defaultValue={defaults.hero.description}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-600">
                  Telefono - Etiqueta
                  <input
                    name="contact_phone_label"
                    defaultValue={defaults.phone.label}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Telefono - Detalles
                  <input
                    name="contact_phone_details"
                    defaultValue={defaults.phone.details}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Telefono - Numero
                  <input
                    name="contact_phone_number"
                    defaultValue={defaults.phone.number}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-600">
                  WhatsApp - Etiqueta
                  <input
                    name="contact_whatsapp_label"
                    defaultValue={defaults.whatsapp.label}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  WhatsApp - CTA
                  <input
                    name="contact_whatsapp_cta"
                    defaultValue={defaults.whatsapp.cta}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  WhatsApp - Numero
                  <input
                    name="contact_whatsapp_number"
                    defaultValue={defaults.whatsapp.number}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <label className="text-sm text-slate-600">
                WhatsApp - Link (opcional)
                <input
                  name="contact_whatsapp_link"
                  defaultValue={defaults.whatsapp.link}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Emails - Titulo de seccion
                  <input
                    name="contact_emails_title"
                    defaultValue={defaults.emails.sectionTitle}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-600">
                  Email general
                  <input
                    name="contact_email_general"
                    defaultValue={defaults.emails.general}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Email reservas
                  <input
                    name="contact_email_reservations"
                    defaultValue={defaults.emails.reservations}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Email proveedores
                  <input
                    name="contact_email_suppliers"
                    defaultValue={defaults.emails.suppliers}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Longform - Eyebrow
                  <input
                    name="contact_longform_eyebrow"
                    defaultValue={defaults.longform.eyebrow}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Longform - Titulo
                  <input
                    name="contact_longform_title"
                    defaultValue={defaults.longform.title}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <label className="text-sm text-slate-600">
                Longform - Parrafo 1
                <textarea
                  name="contact_longform_body1"
                  defaultValue={defaults.longform.body1}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="text-sm text-slate-600">
                Longform - Parrafo 2
                <textarea
                  name="contact_longform_body2"
                  defaultValue={defaults.longform.body2}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="text-sm text-slate-600">
                Longform - Parrafo 3
                <textarea
                  name="contact_longform_body3"
                  defaultValue={defaults.longform.body3}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
              >
                Guardar Contacto
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
