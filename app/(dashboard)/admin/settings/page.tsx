import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatRecipientsForDisplay, notificationEmailDefaults } from "@/lib/notificationEmailSettings";
import { updateNotificationEmailSettingAction } from "./actions";
import { translate, type TranslationKey, type Locale } from "@/lib/translations";
import type {
  ContactContentOverrides,
  GlobalBannerOverrides,
  HomeContentOverrides
} from "@/lib/siteContent";
import HomeSettingsForm from "@/components/admin/HomeSettingsForm";
import ContactSettingsForm from "@/components/admin/ContactSettingsForm";
import GlobalBannerSettingsForm from "@/components/admin/GlobalBannerSettingsForm";

export default async function AdminSettingsPage() {
  const landingCount = await prisma.landingPage.count();
  const tourCount = await prisma.tour.count();
  const userCount = await prisma.user.count();
  const notificationKeys = notificationEmailDefaults.map((entry) => entry.key);
  const notificationSettings = await prisma.notificationEmailSetting.findMany({
    where: { key: { in: notificationKeys } }
  });
  const settingsMap = new Map(notificationSettings.map((setting) => [setting.key, setting]));
  const homeSetting = await prisma.siteContentSetting.findUnique({ where: { key: "HOME" } });
  const contactSetting = await prisma.siteContentSetting.findUnique({ where: { key: "CONTACT" } });
  const bannerSetting = await prisma.siteContentSetting.findUnique({ where: { key: "GLOBAL_BANNER" } });
  const homeContentMap = (homeSetting?.content as Record<string, HomeContentOverrides> | null) ?? {};
  const contactContentMap = (contactSetting?.content as Record<string, ContactContentOverrides> | null) ?? {};
  const bannerContentMap = (bannerSetting?.content as Record<string, GlobalBannerOverrides> | null) ?? {};
  const locales: Locale[] = ["es", "en", "fr"];

  const buildHomeDefaults = (locale: Locale) => {
    const homeContent = homeContentMap[locale] ?? {};
    const t = (key: TranslationKey) => translate(locale, key);

    return {
      hero: {
        brand: homeContent.hero?.brand ?? t("home.hero.brand"),
        title: homeContent.hero?.title ?? t("home.hero.title"),
        description: homeContent.hero?.description ?? t("home.hero.description"),
        ctaPrimary: homeContent.hero?.ctaPrimary ?? t("home.hero.cta.primary"),
        ctaSecondary: homeContent.hero?.ctaSecondary ?? t("home.hero.cta.secondary")
      },
      benefits: {
        label: homeContent.benefits?.label ?? t("home.section.whatWeDo.label"),
        title: homeContent.benefits?.title ?? t("home.section.whatWeDo.title"),
        description: homeContent.benefits?.description ?? t("home.section.whatWeDo.description"),
        items: [
          {
            title: homeContent.benefits?.items?.[0]?.title ?? t("home.benefits.support.title"),
            description: homeContent.benefits?.items?.[0]?.description ?? t("home.benefits.support.description")
          },
          {
            title: homeContent.benefits?.items?.[1]?.title ?? t("home.benefits.allies.title"),
            description: homeContent.benefits?.items?.[1]?.description ?? t("home.benefits.allies.description")
          },
          {
            title: homeContent.benefits?.items?.[2]?.title ?? t("home.benefits.flexible.title"),
            description: homeContent.benefits?.items?.[2]?.description ?? t("home.benefits.flexible.description")
          }
        ]
      },
      recommended: {
        label: homeContent.recommended?.label ?? t("home.section.recommended.label"),
        title: homeContent.recommended?.title ?? t("home.section.recommended.title")
      },
      puntaCana: {
        subtitle: homeContent.puntaCana?.subtitle ?? t("puntaCana.links.subtitle"),
        title: homeContent.puntaCana?.title ?? t("puntaCana.links.title")
      },
      longform: {
        eyebrow: homeContent.longform?.eyebrow ?? t("home.longform.eyebrow"),
        title: homeContent.longform?.title ?? t("home.longform.title"),
        body1: homeContent.longform?.body1 ?? t("home.longform.body1"),
        body2: homeContent.longform?.body2 ?? t("home.longform.body2"),
        body3: homeContent.longform?.body3 ?? t("home.longform.body3"),
        points: [
          {
            title: homeContent.longform?.points?.[0]?.title ?? t("home.longform.points.1.title"),
            body: homeContent.longform?.points?.[0]?.body ?? t("home.longform.points.1.body")
          },
          {
            title: homeContent.longform?.points?.[1]?.title ?? t("home.longform.points.2.title"),
            body: homeContent.longform?.points?.[1]?.body ?? t("home.longform.points.2.body")
          },
          {
            title: homeContent.longform?.points?.[2]?.title ?? t("home.longform.points.3.title"),
            body: homeContent.longform?.points?.[2]?.body ?? t("home.longform.points.3.body")
          }
        ]
      },
      transferBanner: {
        label: homeContent.transferBanner?.label ?? t("home.transferBanner.label"),
        title: homeContent.transferBanner?.title ?? t("home.transferBanner.title"),
        description: homeContent.transferBanner?.description ?? t("home.transferBanner.description"),
        cta: homeContent.transferBanner?.cta ?? t("home.transferBanner.cta"),
        backgroundImage:
          homeContent.transferBanner?.backgroundImage ??
          "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/transfer/banner%20%20%20%20transfer.jpeg"
      },
      about: {
        label: homeContent.about?.label ?? t("home.section.about.label"),
        title: homeContent.about?.title ?? t("home.section.about.title"),
        description: homeContent.about?.description ?? t("home.section.about.description"),
        ctaPrimary: homeContent.about?.ctaPrimary ?? t("home.section.about.cta.primary"),
        ctaSecondary: homeContent.about?.ctaSecondary ?? t("home.section.about.cta.secondary")
      }
    };
  };

  const buildContactDefaults = (locale: Locale) => {
    const contactContent = contactContentMap[locale] ?? {};
    const t = (key: TranslationKey) => translate(locale, key);

    return {
      hero: {
        tagline: contactContent.hero?.tagline ?? t("contact.hero.tagline"),
        title: contactContent.hero?.title ?? t("contact.hero.title"),
        description: contactContent.hero?.description ?? t("contact.hero.description")
      },
      phone: {
        label: contactContent.phone?.label ?? t("contact.section.phone.label"),
        details: contactContent.phone?.details ?? t("contact.section.phone.details"),
        number: contactContent.phone?.number ?? "+1 (809) 394-9877"
      },
      whatsapp: {
        label: contactContent.whatsapp?.label ?? t("contact.whatsapp.label"),
        cta: contactContent.whatsapp?.cta ?? t("contact.whatsapp.cta"),
        number: contactContent.whatsapp?.number ?? "18093949877",
        link: contactContent.whatsapp?.link ?? "https://wa.me/18093949877"
      },
      emails: {
        sectionTitle: contactContent.emails?.sectionTitle ?? t("contact.email.sectionTitle"),
        general: contactContent.emails?.general ?? "info@proactivitis.com",
        reservations: contactContent.emails?.reservations ?? "bookings@proactivitis.com",
        suppliers: contactContent.emails?.suppliers ?? "suppliers@proactivitis.com"
      },
      longform: {
        eyebrow: contactContent.longform?.eyebrow ?? t("contact.longform.eyebrow"),
        title: contactContent.longform?.title ?? t("contact.longform.title"),
        body1: contactContent.longform?.body1 ?? t("contact.longform.body1"),
        body2: contactContent.longform?.body2 ?? t("contact.longform.body2"),
        body3: contactContent.longform?.body3 ?? t("contact.longform.body3")
      }
    };
  };

  const buildBannerDefaults = (locale: Locale) => {
    const bannerContent = bannerContentMap[locale] ?? {};
    return {
      enabled: Boolean(bannerContent.enabled),
      message: bannerContent.message ?? "",
      link: bannerContent.link ?? "",
      linkLabel: bannerContent.linkLabel ?? "",
      tone: bannerContent.tone ?? "info"
    };
  };

  const homeDefaults = Object.fromEntries(locales.map((locale) => [locale, buildHomeDefaults(locale)]));
  const contactDefaults = Object.fromEntries(locales.map((locale) => [locale, buildContactDefaults(locale)]));
  const bannerDefaults = Object.fromEntries(locales.map((locale) => [locale, buildBannerDefaults(locale)]));

  return (
    <section className="space-y-8 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Ajustes</h1>
        <p className="text-sm text-slate-500">
          Configuracion global: branding, integraciones y reglas de disponibilidad.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Landings activas</p>
          <p className="text-2xl font-semibold text-slate-900">{landingCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tours registrados</p>
          <p className="text-2xl font-semibold text-slate-900">{tourCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Usuarios totales</p>
          <p className="text-2xl font-semibold text-slate-900">{userCount}</p>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Hotel pages</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">Editor de landings de hotel</h3>
          <p className="text-sm text-slate-500">
          Edita SEO, textos y fotos de cada hotel en /hoteles y /things-to-do desde admin.
          </p>
        <Link
          href="/admin/hotel-landings"
          className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Abrir editor de hoteles
        </Link>
      </article>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Notificaciones por correo</h2>
          <p className="text-sm text-slate-500">
            Edita los correos destino para cada alerta. Separa varios emails con comas o saltos de linea.
          </p>
        </div>
        <div className="grid gap-4">
          {notificationEmailDefaults.map((setting) => {
            const saved = settingsMap.get(setting.key);
            const currentValue = formatRecipientsForDisplay(saved?.recipients ?? setting.defaultRecipients);
            return (
              <form
                key={setting.key}
                action={updateNotificationEmailSettingAction}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <input type="hidden" name="key" value={setting.key} />
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-900">{setting.label}</h3>
                    <p className="text-sm text-slate-500">{setting.description}</p>
                  </div>
                  <div className="w-full md:max-w-md">
                    <textarea
                      name="recipients"
                      defaultValue={currentValue}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      placeholder="correo@empresa.com"
                    />
                    <button
                      type="submit"
                      className="mt-3 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </div>
              </form>
            );
          })}
        </div>
      </div>

      <GlobalBannerSettingsForm locales={locales} defaultsByLocale={bannerDefaults} />
      <HomeSettingsForm locales={locales} defaultsByLocale={homeDefaults} />
      <ContactSettingsForm locales={locales} defaultsByLocale={contactDefaults} />
    </section>
  );
}
