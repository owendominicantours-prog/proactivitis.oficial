import type { Locale } from "@/lib/translations";

type IntentSeed = {
  id: string;
  keyword: Record<Locale, string>;
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
};

type AreaSeed = {
  id: string;
  label: Record<Locale, string>;
};

export type PremiumTransferMarketLanding = {
  slug: string;
  keyword: Record<Locale, string>;
  heroTitle: Record<Locale, string>;
  heroSubtitle: Record<Locale, string>;
  seoTitle: Record<Locale, string>;
  seoDescription: Record<Locale, string>;
  bodyTitle: Record<Locale, string>;
  bodyIntro: Record<Locale, string>;
};

const INTENTS: IntentSeed[] = [
  {
    id: "vip-airport-transfer",
    keyword: {
      es: "transfer VIP aeropuerto Punta Cana",
      en: "vip airport transfer punta cana",
      fr: "transfert vip aeroport punta cana"
    },
    title: {
      es: "Transfer VIP desde PUJ con Cadillac o Suburban",
      en: "VIP transfer from PUJ with Cadillac or Suburban",
      fr: "Transfert VIP depuis PUJ en Cadillac ou Suburban"
    },
    subtitle: {
      es: "Servicio privado premium, puntual y sin esperas para viajeros exigentes.",
      en: "Private premium service, punctual and no waiting lines for demanding travelers.",
      fr: "Service prive premium, ponctuel et sans attente pour voyageurs exigeants."
    }
  },
  {
    id: "luxury-airport-transportation",
    keyword: {
      es: "transporte de lujo aeropuerto Punta Cana",
      en: "luxury airport transportation punta cana",
      fr: "transport de luxe aeroport punta cana"
    },
    title: {
      es: "Transporte de lujo en Punta Cana para llegada y salida",
      en: "Luxury transportation in Punta Cana for arrivals and departures",
      fr: "Transport de luxe a Punta Cana pour arrivees et departs"
    },
    subtitle: {
      es: "Chofer bilingue, seguimiento de vuelo y experiencia ejecutiva 24/7.",
      en: "Bilingual chauffeur, flight tracking, and executive-level experience 24/7.",
      fr: "Chauffeur bilingue, suivi des vols et experience executive 24/7."
    }
  },
  {
    id: "private-suv-transfer",
    keyword: {
      es: "traslado privado SUV Punta Cana",
      en: "private suv transfer punta cana",
      fr: "transfert prive suv punta cana"
    },
    title: {
      es: "SUV privado premium para traslados en Punta Cana",
      en: "Premium private SUV for Punta Cana transfers",
      fr: "SUV prive premium pour transferts a Punta Cana"
    },
    subtitle: {
      es: "Espacio, privacidad y confort superior para familias y grupos pequenos.",
      en: "Space, privacy, and superior comfort for families and small groups.",
      fr: "Espace, intimite et confort superieur pour familles et petits groupes."
    }
  },
  {
    id: "cadillac-escalade-transfer",
    keyword: {
      es: "Cadillac Escalade transfer Punta Cana",
      en: "cadillac escalade transfer punta cana",
      fr: "transfert cadillac escalade punta cana"
    },
    title: {
      es: "Cadillac Escalade transfer en Punta Cana",
      en: "Cadillac Escalade transfer in Punta Cana",
      fr: "Transfert Cadillac Escalade a Punta Cana"
    },
    subtitle: {
      es: "Imagen ejecutiva, comodidad full-size y servicio puerta a puerta.",
      en: "Executive image, full-size comfort, and door-to-door service.",
      fr: "Image executive, confort full-size et service porte-a-porte."
    }
  },
  {
    id: "chevrolet-suburban-transfer",
    keyword: {
      es: "Chevrolet Suburban transfer Punta Cana",
      en: "chevrolet suburban transfer punta cana",
      fr: "transfert chevrolet suburban punta cana"
    },
    title: {
      es: "Chevrolet Suburban transfer premium en Punta Cana",
      en: "Chevrolet Suburban premium transfer in Punta Cana",
      fr: "Transfert premium Chevrolet Suburban a Punta Cana"
    },
    subtitle: {
      es: "Ideal para equipaje grande, grupos y traslados de alto confort.",
      en: "Ideal for heavy luggage, groups, and high-comfort transfers.",
      fr: "Ideal pour gros bagages, groupes et transferts haut confort."
    }
  },
  {
    id: "executive-transfer-service",
    keyword: {
      es: "servicio de transfer ejecutivo Punta Cana",
      en: "executive transfer service punta cana",
      fr: "service de transfert executive punta cana"
    },
    title: {
      es: "Servicio ejecutivo de transfer en Punta Cana",
      en: "Executive transfer service in Punta Cana",
      fr: "Service de transfert executive a Punta Cana"
    },
    subtitle: {
      es: "Para viajeros corporativos, parejas VIP y clientes premium.",
      en: "For corporate travelers, VIP couples, and premium guests.",
      fr: "Pour voyageurs d affaires, couples VIP et clients premium."
    }
  },
  {
    id: "nonstop-private-transfer",
    keyword: {
      es: "traslado privado sin paradas Punta Cana",
      en: "nonstop private transfer punta cana",
      fr: "transfert prive sans arret punta cana"
    },
    title: {
      es: "Traslado privado sin paradas en Punta Cana",
      en: "Nonstop private transfer in Punta Cana",
      fr: "Transfert prive sans arret a Punta Cana"
    },
    subtitle: {
      es: "Del aeropuerto al hotel con ruta directa y puntualidad real.",
      en: "From airport to resort with direct routing and real punctuality.",
      fr: "De l aeroport a l hotel avec itineraire direct et ponctualite."
    }
  },
  {
    id: "family-luxury-transfer",
    keyword: {
      es: "transfer familiar de lujo Punta Cana",
      en: "family luxury transfer punta cana",
      fr: "transfert luxe famille punta cana"
    },
    title: {
      es: "Transfer familiar de lujo en Punta Cana",
      en: "Family luxury transfer in Punta Cana",
      fr: "Transfert luxe famille a Punta Cana"
    },
    subtitle: {
      es: "Asientos para ninos, espacio de maletas y recepcion asistida.",
      en: "Child seats, luggage room, and assisted airport meet-and-greet.",
      fr: "Sieges enfants, espace bagages et accueil aeroport assiste."
    }
  },
  {
    id: "round-trip-vip-transfer",
    keyword: {
      es: "transfer VIP ida y vuelta Punta Cana",
      en: "round trip vip transfer punta cana",
      fr: "transfert vip aller retour punta cana"
    },
    title: {
      es: "Transfer VIP ida y vuelta en Punta Cana",
      en: "Round-trip VIP transfer in Punta Cana",
      fr: "Transfert VIP aller-retour a Punta Cana"
    },
    subtitle: {
      es: "Asegura tu llegada y salida con una misma operacion premium.",
      en: "Secure your arrival and departure with one premium operation.",
      fr: "Securisez arrivee et depart avec une seule operation premium."
    }
  },
  {
    id: "hotel-airport-chauffeur",
    keyword: {
      es: "chofer privado hotel aeropuerto Punta Cana",
      en: "hotel airport chauffeur punta cana",
      fr: "chauffeur prive hotel aeroport punta cana"
    },
    title: {
      es: "Chofer privado hotel-aeropuerto en Punta Cana",
      en: "Private chauffeur hotel-airport in Punta Cana",
      fr: "Chauffeur prive hotel-aeroport a Punta Cana"
    },
    subtitle: {
      es: "Conductor profesional, confirmacion inmediata y soporte por WhatsApp.",
      en: "Professional chauffeur, instant confirmation, and WhatsApp support.",
      fr: "Chauffeur professionnel, confirmation immediate et support WhatsApp."
    }
  }
];

const AREAS: AreaSeed[] = [
  {
    id: "bavaro",
    label: { es: "Bavaro", en: "Bavaro", fr: "Bavaro" }
  },
  {
    id: "cap-cana",
    label: { es: "Cap Cana", en: "Cap Cana", fr: "Cap Cana" }
  },
  {
    id: "uvero-alto",
    label: { es: "Uvero Alto", en: "Uvero Alto", fr: "Uvero Alto" }
  },
  {
    id: "arena-gorda",
    label: { es: "Arena Gorda", en: "Arena Gorda", fr: "Arena Gorda" }
  },
  {
    id: "punta-cana-resorts",
    label: { es: "Resorts de Punta Cana", en: "Punta Cana Resorts", fr: "Resorts de Punta Cana" }
  }
];

export const premiumTransferMarketLandings: PremiumTransferMarketLanding[] = INTENTS.flatMap((intent) =>
  AREAS.map((area) => {
    const slug = `${intent.id}-${area.id}`;
    return {
      slug,
      keyword: {
        es: `${intent.keyword.es} ${area.label.es}`.trim(),
        en: `${intent.keyword.en} ${area.label.en}`.trim(),
        fr: `${intent.keyword.fr} ${area.label.fr}`.trim()
      },
      heroTitle: {
        es: `${intent.title.es} - ${area.label.es}`,
        en: `${intent.title.en} - ${area.label.en}`,
        fr: `${intent.title.fr} - ${area.label.fr}`
      },
      heroSubtitle: {
        es: `${intent.subtitle.es} Cobertura premium en ${area.label.es}.`,
        en: `${intent.subtitle.en} Premium coverage in ${area.label.en}.`,
        fr: `${intent.subtitle.fr} Couverture premium a ${area.label.fr}.`
      },
      seoTitle: {
        es: `${intent.keyword.es} ${area.label.es} | Punta Cana Premium Transfer Services`,
        en: `${intent.keyword.en} ${area.label.en} | Punta Cana Premium Transfer Services`,
        fr: `${intent.keyword.fr} ${area.label.fr} | Punta Cana Premium Transfer Services`
      },
      seoDescription: {
        es: `Reserva ${intent.keyword.es} en ${area.label.es} con Cadillac Escalade o Chevrolet Suburban. Servicio privado, seguimiento de vuelo y soporte 24/7.`,
        en: `Book ${intent.keyword.en} in ${area.label.en} with Cadillac Escalade or Chevrolet Suburban. Private service, flight tracking, and 24/7 support.`,
        fr: `Reservez ${intent.keyword.fr} a ${area.label.fr} en Cadillac Escalade ou Chevrolet Suburban. Service prive, suivi des vols et support 24/7.`
      },
      bodyTitle: {
        es: `Cobertura premium real para ${area.label.es}`,
        en: `Real premium coverage for ${area.label.en}`,
        fr: `Couverture premium reelle pour ${area.label.fr}`
      },
      bodyIntro: {
        es: `Servicio VIP puerta a puerta desde PUJ hacia ${area.label.es}, con chofer profesional, seguimiento de vuelo y confirmacion inmediata.`,
        en: `VIP door-to-door service from PUJ to ${area.label.en}, with professional chauffeur, flight tracking, and instant confirmation.`,
        fr: `Service VIP porte-a-porte depuis PUJ vers ${area.label.fr}, avec chauffeur professionnel, suivi de vol et confirmation immediate.`
      }
    };
  })
);

export const premiumTransferMarketLandingSlugs = premiumTransferMarketLandings.map((item) => item.slug);

export const findPremiumTransferMarketLandingBySlug = (slug: string) =>
  premiumTransferMarketLandings.find((item) => item.slug === slug);
