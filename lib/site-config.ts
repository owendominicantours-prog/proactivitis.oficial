import type { Locale } from "@/lib/translations";

export type SiteVariant = "proactivitis" | "funjet";

export type SiteConfig = {
  variant: SiteVariant;
  name: string;
  legalName: string;
  siteName: string;
  url: string;
  logoSrc: string;
  logoOnDarkSrc: string;
  logoAlt: string;
  phone: string;
  phoneMachine: string;
  whatsappLink: string;
  email: string;
  sameAs: string[];
  defaultLocalePath: string;
  homeTitle: Record<Locale, string>;
  homeDescription: Record<Locale, string>;
  footerTagline: Record<Locale, string>;
  supportSectionTitle: Record<Locale, string>;
  supportSectionLinks: Array<{
    href: string;
    label: Record<Locale, string>;
  }>;
};

const PROACTIVITIS_CONFIG: SiteConfig = {
  variant: "proactivitis",
  name: "Proactivitis",
  legalName: "Proactivitis",
  siteName: "Proactivitis",
  url: "https://proactivitis.com",
  logoSrc: "/logo.png",
  logoOnDarkSrc: "/logo.png",
  logoAlt: "Proactivitis",
  phone: "+1 (829) 475-6298",
  phoneMachine: "18294756298",
  whatsappLink: "https://wa.me/18294756298",
  email: "info@proactivitis.com",
  sameAs: ["https://www.facebook.com/proactivitis", "https://www.instagram.com/proactivitis"],
  defaultLocalePath: "/",
  homeTitle: {
    es: "Tours, Excursiones y Traslados en Punta Cana | Proactivitis",
    en: "Punta Cana Tours, Excursions and Airport Transfers | Proactivitis",
    fr: "Tours, Excursions et Transferts a Punta Cana | Proactivitis"
  },
  homeDescription: {
    es: "Reserva tours en Punta Cana, excursiones todo incluido y traslados privados al aeropuerto con precios claros, soporte 24/7 y confirmacion inmediata.",
    en: "Book Punta Cana tours, top excursions, and private airport transfers with clear pricing, verified operators, and instant confirmation.",
    fr: "Reservez des excursions a Punta Cana et des transferts prives avec prix clairs, operateurs verifies et confirmation rapide."
  },
  footerTagline: {
    es: "Proactivitis - Turismo impulsado por personas, no por bots. Oficina central global.",
    en: "Proactivitis - Tourism powered by people, not bots. Global headquarters.",
    fr: "Proactivitis - Le tourisme porte par des personnes, pas des robots. Siege mondial."
  },
  supportSectionTitle: {
    es: "Colabora",
    en: "Collaborate",
    fr: "Collaborer"
  },
  supportSectionLinks: [
    {
      href: "/become-a-supplier",
      label: { es: "Conviertete en Partner", en: "Become a Partner", fr: "Devenir partenaire" }
    },
    {
      href: "/agency-partners",
      label: { es: "Alianzas con Agencias", en: "Agency alliances", fr: "Partenariats agences" }
    },
    {
      href: "/affiliates",
      label: { es: "Afiliados", en: "Affiliates", fr: "Affilies" }
    },
    {
      href: "/careers",
      label: { es: "Carreras", en: "Careers", fr: "Carrieres" }
    }
  ]
};

const FUNJET_CONFIG: SiteConfig = {
  variant: "funjet",
  name: "Funjet Tour Operador",
  legalName: "Funjet Tour Operador",
  siteName: "Funjet Tour Operador",
  url: "https://funjettouroperador.com",
  logoSrc: "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/funjet/Funjet%20Logo.png",
  logoOnDarkSrc: "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/funjet/Logo%20Blanco.png",
  logoAlt: "Funjet Tour Operador",
  phone: "+1 (829) 475-6298",
  phoneMachine: "18294756298",
  whatsappLink: "https://wa.me/18294756298",
  email: "info@funjettouroperador.com",
  sameAs: [],
  defaultLocalePath: "/",
  homeTitle: {
    es: "Tours y Traslados en Punta Cana: Reserva con Funjet Tour Operador",
    en: "Punta Cana Tours and Transfers: Book with Funjet Tour Operador",
    fr: "Tours et transferts a Punta Cana : reservez avec Funjet Tour Operador"
  },
  homeDescription: {
    es: "Explora Punta Cana con Funjet Tour Operador. Desde traslados privados hasta tours en Buggy e Isla Saona. Cancelacion facil, atencion local y los mejores precios garantizados. Reserva tu aventura hoy.",
    en: "Explore Punta Cana with Funjet Tour Operador. From private transfers to Buggy tours and Saona Island. Easy cancellation, local support, and competitive pricing. Book your adventure today.",
    fr: "Explorez Punta Cana avec Funjet Tour Operador. Des transferts prives aux tours en buggy et a l ile Saona. Annulation facile, assistance locale et tarifs competitifs. Reservez votre aventure aujourd hui."
  },
  footerTagline: {
    es: "Funjet Tour Operador - Venta directa de tours y traslados en Punta Cana.",
    en: "Funjet Tour Operador - Direct seller of Punta Cana tours and transfers.",
    fr: "Funjet Tour Operador - Vente directe de tours et transferts a Punta Cana."
  },
  supportSectionTitle: {
    es: "Reserva directa",
    en: "Direct booking",
    fr: "Reservation directe"
  },
  supportSectionLinks: [
    {
      href: "/tours",
      label: { es: "Tours destacados", en: "Top tours", fr: "Tours phares" }
    },
    {
      href: "/traslado",
      label: { es: "Traslados privados", en: "Private transfers", fr: "Transferts prives" }
    },
    {
      href: "/contact",
      label: { es: "Hablar por WhatsApp", en: "Chat on WhatsApp", fr: "Parler sur WhatsApp" }
    },
    {
      href: "/contact",
      label: { es: "Ayuda para reservar", en: "Booking help", fr: "Aide a la reservation" }
    }
  ]
};

export const resolveSiteVariant = (): SiteVariant => {
  const explicit = process.env.NEXT_PUBLIC_SITE_BRAND?.trim().toLowerCase();
  if (explicit === "funjet") return "funjet";
  if (explicit === "proactivitis") return "proactivitis";

  const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim().toLowerCase();
  if (branch === "funjet-tour-oprador") return "funjet";

  const projectUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().toLowerCase();
  if (projectUrl?.includes("funjet")) return "funjet";

  return "proactivitis";
};

export const getSiteConfig = (): SiteConfig =>
  resolveSiteVariant() === "funjet" ? FUNJET_CONFIG : PROACTIVITIS_CONFIG;

export const SITE_CONFIG = getSiteConfig();

export const getLocalizedSiteHref = (path: string, locale: Locale) =>
  locale === "es" ? path : `/${locale}${path === "/" ? "" : path}`;
