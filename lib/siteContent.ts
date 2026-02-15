import { prisma } from "@/lib/prisma";
import { Locale } from "@/lib/translations";

export type HomeContentOverrides = {
  hero?: {
    brand?: string;
    title?: string;
    description?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
  };
  benefits?: {
    label?: string;
    title?: string;
    description?: string;
    items?: Array<{ title?: string; description?: string }>;
  };
  recommended?: {
    label?: string;
    title?: string;
  };
  puntaCana?: {
    subtitle?: string;
    title?: string;
  };
  longform?: {
    eyebrow?: string;
    title?: string;
    body1?: string;
    body2?: string;
    body3?: string;
    points?: Array<{ title?: string; body?: string }>;
  };
  transferBanner?: {
    label?: string;
    title?: string;
    description?: string;
    cta?: string;
    backgroundImage?: string;
  };
  about?: {
    label?: string;
    title?: string;
    description?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
  };
};

export type ContactContentOverrides = {
  hero?: {
    tagline?: string;
    title?: string;
    description?: string;
  };
  phone?: {
    label?: string;
    details?: string;
    number?: string;
  };
  whatsapp?: {
    label?: string;
    cta?: string;
    number?: string;
    link?: string;
  };
  emails?: {
    sectionTitle?: string;
    general?: string;
    reservations?: string;
    suppliers?: string;
  };
  longform?: {
    eyebrow?: string;
    title?: string;
    body1?: string;
    body2?: string;
    body3?: string;
  };
};

export type GlobalBannerOverrides = {
  enabled?: boolean;
  message?: string;
  link?: string;
  linkLabel?: string;
  tone?: "info" | "success" | "warning" | "urgent";
};

export type HotelLandingOverrides = {
  seoTitle?: string;
  seoDescription?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  galleryImages?: string[];
  stars?: string;
  locationLabel?: string;
  mapUrl?: string;
  priceFromUSD?: string;
  reviewRating?: string;
  reviewCount?: string;
  quoteCta?: string;
  overviewTitle?: string;
  description1?: string;
  description2?: string;
  description3?: string;
  highlights?: string[];
  roomTypes?: Array<{ name: string; priceFrom?: string; image?: string }>;
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  groupPolicy?: string;
  bullet1?: string;
  bullet2?: string;
  bullet3?: string;
  bullet4?: string;
  toursTitle?: string;
  transfersTitle?: string;
};

export const getHomeContentOverrides = async (locale: Locale): Promise<HomeContentOverrides> => {
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: "HOME" }
    });
    if (!record?.content || typeof record.content !== "object") return {};
    const content = record.content as Record<string, unknown>;
    const localeContent = content[locale];
    if (!localeContent || typeof localeContent !== "object") return {};
    return localeContent as HomeContentOverrides;
  } catch (error) {
    console.warn("No se pudo cargar SiteContentSetting HOME", error);
    return {};
  }
};

export const getContactContentOverrides = async (locale: Locale): Promise<ContactContentOverrides> => {
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: "CONTACT" }
    });
    if (!record?.content || typeof record.content !== "object") return {};
    const content = record.content as Record<string, unknown>;
    const localeContent = content[locale];
    if (!localeContent || typeof localeContent !== "object") return {};
    return localeContent as ContactContentOverrides;
  } catch (error) {
    console.warn("No se pudo cargar SiteContentSetting CONTACT", error);
    return {};
  }
};

export const getGlobalBannerOverrides = async (locale: Locale): Promise<GlobalBannerOverrides> => {
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: "GLOBAL_BANNER" }
    });
    if (!record?.content || typeof record.content !== "object") return {};
    const content = record.content as Record<string, unknown>;
    const localeContent = content[locale];
    if (!localeContent || typeof localeContent !== "object") return {};
    return localeContent as GlobalBannerOverrides;
  } catch (error) {
    console.warn("No se pudo cargar SiteContentSetting GLOBAL_BANNER", error);
    return {};
  }
};

export const getHotelLandingOverrides = async (
  hotelSlug: string,
  locale: Locale
): Promise<HotelLandingOverrides> => {
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: "HOTEL_LANDING" }
    });
    if (!record?.content || typeof record.content !== "object") return {};
    const content = record.content as Record<string, Record<string, HotelLandingOverrides>>;
    const hotelMap = content[hotelSlug];
    if (!hotelMap || typeof hotelMap !== "object") return {};
    const localeContent = hotelMap[locale];
    if (!localeContent || typeof localeContent !== "object") return {};
    return localeContent as HotelLandingOverrides;
  } catch (error) {
    console.warn("No se pudo cargar SiteContentSetting HOTEL_LANDING", error);
    return {};
  }
};
