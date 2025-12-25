export const SAME_AS_URLS = [
  "https://www.facebook.com/proactivitis",
  "https://www.instagram.com/proactivitis"
];

export const PROACTIVITIS_URL = "https://proactivitis.com";
export const PROACTIVITIS_LOGO = `${PROACTIVITIS_URL}/logo.png`;
export const PROACTIVITIS_PHONE = "+1-809-394-9877";
export const PROACTIVITIS_EMAIL = "info@proactivitis.com";

export const ECUADOR_SUPPORT_EMAIL = "soporte.ec@proactivitis.com";
export const ECUADOR_SUPPORT_PHONE = "+593-9-876-54321";

export const PROACTIVITIS_LOCALBUSINESS = {
  "@type": "LocalBusiness",
  name: "Proactivitis",
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
