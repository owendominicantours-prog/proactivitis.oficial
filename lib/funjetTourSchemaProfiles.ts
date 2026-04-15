import type { Locale } from "@/lib/translations";

type SchemaProperty = {
  name: string;
  value: string;
};

type TourSchemaNode = Record<string, unknown>;

type TourSchemaProfile = {
  category?: string;
  touristTypes?: string[];
  audienceType?: string;
  additionalProperty?: SchemaProperty[];
  relatedNodes?: TourSchemaNode[];
  relatedRefs?: Array<{ "@id": string }>;
};

const localized = (locale: Locale, es: string, en: string, fr: string) =>
  locale === "es" ? es : locale === "fr" ? fr : en;

export const getFunjetTourSchemaProfile = (slug: string, locale: Locale, tourUrl: string): TourSchemaProfile | null => {
  const puntaCanaNode = {
    "@type": "Place",
    "@id": `${tourUrl}#place-punta-cana`,
    name: "Punta Cana",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Punta Cana"
    }
  };

  const bavaroBeachNode = {
    "@type": "TouristAttraction",
    "@id": `${tourUrl}#place-bavaro-beach`,
    name: "Playa Bavaro",
    url: "https://www.godominicanrepublic.com/things-to-do/playa-bavaro"
  };

  const saonaNode = {
    "@type": "TouristAttraction",
    "@id": `${tourUrl}#place-saona-island`,
    name: "Isla Saona",
    url: "https://www.godominicanrepublic.com/things-to-do/isla-saona"
  };

  const bayahibeNode = {
    "@type": "Place",
    "@id": `${tourUrl}#place-bayahibe`,
    name: "Bayahibe",
    url: "https://www.godominicanrepublic.com/destinations/bayahibe"
  };

  const profiles: Record<string, TourSchemaProfile> = {
    "tour-en-buggy-en-punta-cana": {
      category: "Adventure tour",
      touristTypes: ["Adventure tourism", "Off-road tourism"],
      audienceType: localized(locale, "Viajeros de aventura, parejas y grupos", "Adventure travelers, couples, and groups", "Voyageurs aventure, couples et groupes"),
      additionalProperty: [
        { name: "Vehicle", value: "Buggy" },
        { name: "Route style", value: localized(locale, "Off-road", "Off-road", "Off-road") },
        { name: "Terrain", value: localized(locale, "Barro y caminos rurales", "Mud and countryside trails", "Boue et chemins ruraux") },
        { name: "Swim stop", value: localized(locale, "Cueva o cenote", "Cave or cenote", "Grotte ou cenote") },
        { name: "Minimum driver age", value: "18+" },
        { name: "Hotel pickup", value: localized(locale, "Confirmado despues de reservar", "Confirmed after booking", "Confirme apres reservation") }
      ],
      relatedNodes: [puntaCanaNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-punta-cana` }]
    },
    "excursion-en-buggy-y-atv-en-punta-cana": {
      category: "Adventure tour",
      touristTypes: ["Adventure tourism", "Off-road tourism"],
      audienceType: localized(locale, "Grupos, parejas y viajeros de aventura", "Groups, couples, and adventure travelers", "Groupes, couples et voyageurs aventure"),
      additionalProperty: [
        { name: "Vehicle options", value: "Buggy, ATV" },
        { name: "Route style", value: localized(locale, "Off-road", "Off-road", "Off-road") },
        { name: "Stop type", value: localized(locale, "Cueva o cenote", "Cave or cenote", "Grotte ou cenote") },
        { name: "Minimum driver age", value: "18+" },
        { name: "Hotel pickup", value: localized(locale, "Confirmado despues de reservar", "Confirmed after booking", "Confirme apres reservation") }
      ],
      relatedNodes: [puntaCanaNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-punta-cana` }]
    },
    "tour-y-entrada-para-de-isla-saona-desde-punta-cana": {
      category: "Island excursion",
      touristTypes: ["Island tourism", "Beach tourism", "Boat excursion"],
      audienceType: localized(locale, "Parejas, familias y grupos de playa", "Couples, families, and beach groups", "Couples, familles et groupes plage"),
      additionalProperty: [
        { name: "Destination", value: "Isla Saona" },
        { name: "Departure area", value: localized(locale, "Punta Cana y Bavaro", "Punta Cana and Bavaro", "Punta Cana et Bavaro") },
        { name: "Boat transport", value: localized(locale, "Lancha rapida y catamaran", "Speedboat and catamaran", "Bateau rapide et catamaran") },
        { name: "Beach time", value: localized(locale, "Incluido", "Included", "Inclus") },
        { name: "Protected area", value: "Cotubanama National Park" }
      ],
      relatedNodes: [saonaNode, bayahibeNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-saona-island` }, { "@id": `${tourUrl}#place-bayahibe` }]
    },
    "parasailing-punta-cana": {
      category: "Water sport",
      touristTypes: ["Water sports", "Aerial activity", "Beach tourism"],
      audienceType: localized(locale, "Viajeros de aventura y playa", "Adventure and beach travelers", "Voyageurs aventure et plage"),
      additionalProperty: [
        { name: "Activity", value: "Parasailing" },
        { name: "Flight duration", value: localized(locale, "10 a 12 minutos", "10 to 12 minutes", "10 a 12 minutes") },
        { name: "Takeoff", value: localized(locale, "Desde lancha", "Boat launch", "Depuis le bateau") },
        { name: "Flight format", value: localized(locale, "Solo, doble o triple segun condiciones", "Solo, double, or triple depending on conditions", "Solo, double ou triple selon conditions") },
        { name: "Safety briefing", value: localized(locale, "Incluido", "Included", "Inclus") }
      ],
      relatedNodes: [puntaCanaNode, bavaroBeachNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-punta-cana` }, { "@id": `${tourUrl}#place-bavaro-beach` }]
    },
    "sunset-catamaran-snorkel": {
      category: "Catamaran excursion",
      touristTypes: ["Catamaran cruise", "Snorkeling tour", "Beach tourism"],
      audienceType: localized(locale, "Grupos, parejas y celebraciones", "Groups, couples, and celebrations", "Groupes, couples et celebrations"),
      additionalProperty: [
        { name: "Boat type", value: "Catamaran" },
        { name: "Snorkel stop", value: localized(locale, "Incluido", "Included", "Inclus") },
        { name: "Open bar", value: localized(locale, "Incluido", "Included", "Inclus") },
        { name: "Onboard music", value: localized(locale, "Incluida", "Included", "Incluse") },
        { name: "Pickup area", value: localized(locale, "Punta Cana y Bavaro", "Punta Cana and Bavaro", "Punta Cana et Bavaro") }
      ],
      relatedNodes: [puntaCanaNode, bavaroBeachNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-punta-cana` }, { "@id": `${tourUrl}#place-bavaro-beach` }]
    }
  };

  return profiles[slug] ?? null;
};
