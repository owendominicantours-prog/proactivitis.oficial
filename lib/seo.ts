import { SITE_CONFIG } from "@/lib/site-config";

export const SAME_AS_URLS = [
  ...SITE_CONFIG.sameAs
];

export const PROACTIVITIS_URL = SITE_CONFIG.url;
const resolveSiteAssetUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://") ? value : `${PROACTIVITIS_URL}${value}`;
export const PROACTIVITIS_LOGO = resolveSiteAssetUrl(SITE_CONFIG.logoSrc);
export const PROACTIVITIS_PHONE = SITE_CONFIG.phone;
export const PROACTIVITIS_PHONE_MACHINE = SITE_CONFIG.phoneMachine;
export const PROACTIVITIS_WHATSAPP_NUMBER = PROACTIVITIS_PHONE_MACHINE;
export const PROACTIVITIS_WHATSAPP_LINK = SITE_CONFIG.whatsappLink;
export const PROACTIVITIS_EMAIL = SITE_CONFIG.email;

export const ECUADOR_SUPPORT_EMAIL = "soporte.ec@proactivitis.com";
export const ECUADOR_SUPPORT_PHONE = "+593-9-876-54321";

export const PROACTIVITIS_LOCALBUSINESS = {
  "@type": "LocalBusiness",
  name: SITE_CONFIG.name,
  url: PROACTIVITIS_URL,
  telephone: PROACTIVITIS_PHONE,
  email: PROACTIVITIS_EMAIL,
  image: PROACTIVITIS_LOGO,
  logo: PROACTIVITIS_LOGO,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    email: PROACTIVITIS_EMAIL,
    telephone: PROACTIVITIS_PHONE,
    availableLanguage: ["es", "en"]
  },
  sameAs: SAME_AS_URLS,
  address: {
    "@type": "PostalAddress",
    addressCountry: "DO"
  }
} as const;

export const getPriceValidUntil = () => {
  const now = new Date();
  const future = new Date(now);
  future.setMonth(future.getMonth() + 6);
  return future.toISOString().split("T")[0];
};

export const buildGoogleMapsUrl = (place: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
