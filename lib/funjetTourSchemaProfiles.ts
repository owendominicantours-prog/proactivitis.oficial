import type { Locale } from "@/lib/translations";

type SchemaProperty = {
  name: string;
  value: string;
};

type TourItineraryStop = {
  name: string;
  description: string;
};

type TourSchemaNode = Record<string, unknown>;

type TourSchemaProfile = {
  category?: string;
  touristTypes?: string[];
  audienceType?: string;
  additionalProperty?: SchemaProperty[];
  itinerary?: TourItineraryStop[];
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
      itinerary: [
        {
          name: localized(locale, "Salida desde Punta Cana", "Departure from Punta Cana", "Depart depuis Punta Cana"),
          description: localized(locale, "Recogida o punto de encuentro confirmado despues de reservar.", "Pickup or meeting point confirmed after booking.", "Prise en charge ou point de rendez-vous confirme apres reservation.")
        },
        {
          name: localized(locale, "Ruta buggy off-road", "Off-road buggy route", "Parcours buggy tout-terrain"),
          description: localized(locale, "Recorrido por caminos rurales, barro y zonas de aventura en Punta Cana.", "Ride through countryside trails, mud, and adventure terrain in Punta Cana.", "Parcours sur chemins ruraux, boue et zones d aventure a Punta Cana.")
        },
        {
          name: localized(locale, "Parada en cueva o cenote", "Cave or cenote stop", "Arret a la grotte ou au cenote"),
          description: localized(locale, "Tiempo para refrescarse en una cueva o cenote segun operacion del dia.", "Time to cool off in a cave or cenote depending on daily operations.", "Temps pour se rafraichir dans une grotte ou un cenote selon l operation du jour.")
        }
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
      itinerary: [
        {
          name: localized(locale, "Check-in de aventura", "Adventure check-in", "Enregistrement aventure"),
          description: localized(locale, "Registro rapido y eleccion de vehiculo segun disponibilidad.", "Quick check-in and vehicle selection subject to availability.", "Enregistrement rapide et choix du vehicule selon disponibilite.")
        },
        {
          name: localized(locale, "Ruta buggy y ATV", "Buggy and ATV route", "Parcours buggy et ATV"),
          description: localized(locale, "Tramo de manejo por terreno off-road en Punta Cana.", "Driving section across off-road terrain in Punta Cana.", "Section de conduite sur terrain tout-terrain a Punta Cana.")
        },
        {
          name: localized(locale, "Parada de bano", "Swimming stop", "Pause baignade"),
          description: localized(locale, "Parada en cueva o cenote para una experiencia de agua.", "Stop at a cave or cenote for a water break.", "Arret dans une grotte ou un cenote pour une pause baignade.")
        }
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
      itinerary: [
        {
          name: localized(locale, "Salida hacia Bayahibe", "Transfer to Bayahibe", "Transfert vers Bayahibe"),
          description: localized(locale, "Traslado desde Punta Cana al muelle de salida en Bayahibe.", "Transfer from Punta Cana to the departure dock in Bayahibe.", "Transfert depuis Punta Cana jusqu au quai de depart a Bayahibe.")
        },
        {
          name: localized(locale, "Navegacion a Isla Saona", "Sailing to Saona Island", "Navigation vers l ile Saona"),
          description: localized(locale, "Cruce en lancha rapida o catamaran segun operacion del tour.", "Crossing by speedboat or catamaran depending on tour operations.", "Traversee en bateau rapide ou catamaran selon l operation du tour.")
        },
        {
          name: localized(locale, "Tiempo de playa en Isla Saona", "Beach time on Saona Island", "Temps de plage sur l ile Saona"),
          description: localized(locale, "Tiempo libre para disfrutar playa, agua turquesa y ambiente caribeno.", "Free time to enjoy the beach, turquoise water, and Caribbean atmosphere.", "Temps libre pour profiter de la plage, de l eau turquoise et de l ambiance caribeenne.")
        }
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
      itinerary: [
        {
          name: localized(locale, "Recepcion en la playa", "Beach reception", "Accueil sur la plage"),
          description: localized(locale, "Llegada al punto de salida y coordinacion del turno de vuelo.", "Arrival at the launch area and coordination of the flight slot.", "Arrivee a la zone de depart et coordination du tour de vol.")
        },
        {
          name: localized(locale, "Briefing de seguridad", "Safety briefing", "Briefing de securite"),
          description: localized(locale, "Indicaciones del equipo antes del despegue sobre el mar.", "Crew instructions before takeoff over the sea.", "Instructions de l equipe avant le decollage au-dessus de la mer.")
        },
        {
          name: localized(locale, "Vuelo de parasailing", "Parasailing flight", "Vol de parasailing"),
          description: localized(locale, "Vuelo panoramico sobre la costa de Punta Cana y Bavaro.", "Panoramic flight over the Punta Cana and Bavaro coastline.", "Vol panoramique au-dessus de la cote de Punta Cana et Bavaro.")
        }
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
      itinerary: [
        {
          name: localized(locale, "Embarque en catamaran", "Catamaran boarding", "Embarquement sur catamaran"),
          description: localized(locale, "Salida en catamaran desde la zona de Punta Cana o Bavaro.", "Catamaran departure from the Punta Cana or Bavaro area.", "Depart en catamaran depuis la zone de Punta Cana ou Bavaro.")
        },
        {
          name: localized(locale, "Parada de snorkel", "Snorkel stop", "Arret snorkeling"),
          description: localized(locale, "Tiempo en el agua para snorkel segun condiciones del mar.", "Time in the water for snorkeling depending on sea conditions.", "Temps dans l eau pour le snorkeling selon les conditions de mer.")
        },
        {
          name: localized(locale, "Paseo al atardecer", "Sunset cruise", "Croisiere au coucher du soleil"),
          description: localized(locale, "Navegacion relajada con musica y bebidas mientras cae el sol.", "Relaxed sailing with music and drinks as the sun goes down.", "Navigation detendue avec musique et boissons pendant le coucher du soleil.")
        }
      ],
      relatedNodes: [puntaCanaNode, bavaroBeachNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-punta-cana` }, { "@id": `${tourUrl}#place-bavaro-beach` }]
    }
  };

  return profiles[slug] ?? null;
};
