"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeRecipients, notificationEmailDefaults, type NotificationEmailKey } from "@/lib/notificationEmailSettings";
import type {
  HomeContentOverrides,
  ContactContentOverrides,
  GlobalBannerOverrides,
  PremiumTransferContentOverrides
} from "@/lib/siteContent";

const allowedKeys = new Set<NotificationEmailKey>(notificationEmailDefaults.map((entry) => entry.key));

export async function updateNotificationEmailSettingAction(formData: FormData) {
  const key = String(formData.get("key") ?? "").trim() as NotificationEmailKey;
  const recipientsRaw = String(formData.get("recipients") ?? "");

  if (!allowedKeys.has(key)) {
    throw new Error("Tipo de notificaci\u00f3n no v\u00e1lido.");
  }

  const config = notificationEmailDefaults.find((entry) => entry.key === key);
  if (!config) {
    throw new Error("Configuraci\u00f3n no encontrada.");
  }

  const recipients = normalizeRecipients(recipientsRaw);

  await prisma.notificationEmailSetting.upsert({
    where: { key },
    update: {
      label: config.label,
      description: config.description,
      recipients
    },
    create: {
      key,
      label: config.label,
      description: config.description,
      recipients
    }
  });

  revalidatePath("/admin/settings");
}

const readField = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const parseLines = (value: string) =>
  value
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);

const parseSharedImageMap = (value: string): Record<string, string> =>
  Object.fromEntries(
    value
      .split(/\r?\n/g)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [rawKey, ...rest] = line.split("|");
        const key = (rawKey ?? "").trim().toLowerCase();
        const url = rest.join("|").trim();
        return [key, url] as const;
      })
      .filter(([key, url]) => key.length > 0 && url.length > 0)
  );

export async function updateSharedImagesAction(formData: FormData) {
  const value = readField(formData, "shared_images_map");
  const content = parseSharedImageMap(value);

  await prisma.siteContentSetting.upsert({
    where: { key: "SHARED_IMAGES" },
    update: { content },
    create: { key: "SHARED_IMAGES", content }
  });

  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/fr");
  revalidatePath("/admin/settings");
}

export async function updateHomeContentAction(formData: FormData) {
  const locale = readField(formData, "locale") || "es";

  const payload: HomeContentOverrides = {
    hero: {
      brand: readField(formData, "home_hero_brand"),
      title: readField(formData, "home_hero_title"),
      description: readField(formData, "home_hero_description"),
      ctaPrimary: readField(formData, "home_hero_cta_primary"),
      ctaSecondary: readField(formData, "home_hero_cta_secondary")
    },
    benefits: {
      label: readField(formData, "home_benefits_label"),
      title: readField(formData, "home_benefits_title"),
      description: readField(formData, "home_benefits_description"),
      items: [
        {
          title: readField(formData, "home_benefit_1_title"),
          description: readField(formData, "home_benefit_1_description")
        },
        {
          title: readField(formData, "home_benefit_2_title"),
          description: readField(formData, "home_benefit_2_description")
        },
        {
          title: readField(formData, "home_benefit_3_title"),
          description: readField(formData, "home_benefit_3_description")
        }
      ]
    },
    recommended: {
      label: readField(formData, "home_recommended_label"),
      title: readField(formData, "home_recommended_title")
    },
    puntaCana: {
      subtitle: readField(formData, "home_punta_subtitle"),
      title: readField(formData, "home_punta_title")
    },
    longform: {
      eyebrow: readField(formData, "home_longform_eyebrow"),
      title: readField(formData, "home_longform_title"),
      body1: readField(formData, "home_longform_body1"),
      body2: readField(formData, "home_longform_body2"),
      body3: readField(formData, "home_longform_body3"),
      points: [
        {
          title: readField(formData, "home_longform_point_1_title"),
          body: readField(formData, "home_longform_point_1_body")
        },
        {
          title: readField(formData, "home_longform_point_2_title"),
          body: readField(formData, "home_longform_point_2_body")
        },
        {
          title: readField(formData, "home_longform_point_3_title"),
          body: readField(formData, "home_longform_point_3_body")
        }
      ]
    },
    transferBanner: {
      label: readField(formData, "home_transfer_label"),
      title: readField(formData, "home_transfer_title"),
      description: readField(formData, "home_transfer_description"),
      cta: readField(formData, "home_transfer_cta"),
      backgroundImage: readField(formData, "home_transfer_image")
    },
    about: {
      label: readField(formData, "home_about_label"),
      title: readField(formData, "home_about_title"),
      description: readField(formData, "home_about_description"),
      ctaPrimary: readField(formData, "home_about_cta_primary"),
      ctaSecondary: readField(formData, "home_about_cta_secondary")
    }
  };

  const existing = await prisma.siteContentSetting.findUnique({ where: { key: "HOME" } });
  const content = (existing?.content as Record<string, HomeContentOverrides> | null) ?? {};
  content[locale] = payload;

  await prisma.siteContentSetting.upsert({
    where: { key: "HOME" },
    update: { content },
    create: { key: "HOME", content }
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function updateContactContentAction(formData: FormData) {
  const locale = readField(formData, "locale") || "es";

  const payload: ContactContentOverrides = {
    hero: {
      tagline: readField(formData, "contact_hero_tagline"),
      title: readField(formData, "contact_hero_title"),
      description: readField(formData, "contact_hero_description")
    },
    phone: {
      label: readField(formData, "contact_phone_label"),
      details: readField(formData, "contact_phone_details"),
      number: readField(formData, "contact_phone_number")
    },
    whatsapp: {
      label: readField(formData, "contact_whatsapp_label"),
      cta: readField(formData, "contact_whatsapp_cta"),
      number: readField(formData, "contact_whatsapp_number"),
      link: readField(formData, "contact_whatsapp_link")
    },
    emails: {
      sectionTitle: readField(formData, "contact_emails_title"),
      general: readField(formData, "contact_email_general"),
      reservations: readField(formData, "contact_email_reservations"),
      suppliers: readField(formData, "contact_email_suppliers")
    },
    longform: {
      eyebrow: readField(formData, "contact_longform_eyebrow"),
      title: readField(formData, "contact_longform_title"),
      body1: readField(formData, "contact_longform_body1"),
      body2: readField(formData, "contact_longform_body2"),
      body3: readField(formData, "contact_longform_body3")
    }
  };

  const existing = await prisma.siteContentSetting.findUnique({ where: { key: "CONTACT" } });
  const content = (existing?.content as Record<string, ContactContentOverrides> | null) ?? {};
  content[locale] = payload;

  await prisma.siteContentSetting.upsert({
    where: { key: "CONTACT" },
    update: { content },
    create: { key: "CONTACT", content }
  });

  revalidatePath("/contact");
  revalidatePath("/en/contact");
  revalidatePath("/fr/contact");
  revalidatePath("/admin/settings");
}

export async function updateGlobalBannerContentAction(formData: FormData) {
  const locale = readField(formData, "locale") || "es";
  const enabled = formData.get("banner_enabled") === "on";
  const payload: GlobalBannerOverrides = {
    enabled,
    message: readField(formData, "banner_message"),
    link: readField(formData, "banner_link"),
    linkLabel: readField(formData, "banner_link_label"),
    tone: (readField(formData, "banner_tone") as GlobalBannerOverrides["tone"]) ?? "info"
  };

  const existing = await prisma.siteContentSetting.findUnique({ where: { key: "GLOBAL_BANNER" } });
  const content = (existing?.content as Record<string, GlobalBannerOverrides> | null) ?? {};
  content[locale] = payload;

  await prisma.siteContentSetting.upsert({
    where: { key: "GLOBAL_BANNER" },
    update: { content },
    create: { key: "GLOBAL_BANNER", content }
  });

  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/fr");
  revalidatePath("/admin/settings");
}

export async function updatePremiumTransferContentAction(formData: FormData) {
  const locale = (readField(formData, "locale") || "es") as "es" | "en" | "fr";

  const payload: PremiumTransferContentOverrides = {
    seoTitle: readField(formData, "premium_seo_title"),
    seoDescription: readField(formData, "premium_seo_description"),
    heroBadge: readField(formData, "premium_hero_badge"),
    heroTitle: readField(formData, "premium_hero_title"),
    heroSubtitle: readField(formData, "premium_hero_subtitle"),
    heroBackgroundImage: readField(formData, "premium_hero_background"),
    heroSpotlightImage: readField(formData, "premium_hero_spotlight"),
    ctaPrimaryLabel: readField(formData, "premium_cta_primary"),
    ctaSecondaryLabel: readField(formData, "premium_cta_secondary"),
    bookingTitle: readField(formData, "premium_booking_title"),
    fleetTitle: readField(formData, "premium_fleet_title"),
    experienceTitle: readField(formData, "premium_experience_title"),
    experienceBody: readField(formData, "premium_experience_body"),
    galleryImages: parseLines(readField(formData, "premium_gallery_images")),
    cadillacImage: readField(formData, "premium_cadillac_image"),
    suburbanImage: readField(formData, "premium_suburban_image"),
    lifestyleImage: readField(formData, "premium_lifestyle_image"),
    vipBullets: parseLines(readField(formData, "premium_vip_bullets")),
    vipCertifications: parseLines(readField(formData, "premium_vip_certifications"))
  };

  const existing = await prisma.siteContentSetting.findUnique({ where: { key: "PREMIUM_TRANSFER_LANDING" } });
  const content = (existing?.content as Record<string, PremiumTransferContentOverrides> | null) ?? {};
  content[locale] = payload;

  await prisma.siteContentSetting.upsert({
    where: { key: "PREMIUM_TRANSFER_LANDING" },
    update: { content },
    create: { key: "PREMIUM_TRANSFER_LANDING", content }
  });

  revalidatePath("/punta-cana/premium-transfer-services");
  revalidatePath("/en/punta-cana/premium-transfer-services");
  revalidatePath("/fr/punta-cana/premium-transfer-services");
  revalidatePath("/admin/settings");
}
