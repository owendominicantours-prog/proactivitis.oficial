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

  const laRomanaNode = {
    "@type": "Place",
    "@id": `${tourUrl}#place-la-romana`,
    name: "La Romana",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "La Romana"
    }
  };

  const samanaNode = {
    "@type": "Place",
    "@id": `${tourUrl}#place-samana`,
    name: "Samana",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Samana"
    }
  };

  const cayoLevantadoNode = {
    "@type": "TouristAttraction",
    "@id": `${tourUrl}#place-cayo-levantado`,
    name: "Cayo Levantado",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Samana"
    }
  };

  const elLimonNode = {
    "@type": "TouristAttraction",
    "@id": `${tourUrl}#place-el-limon-waterfall`,
    name: "Cascada El Limon",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Samana"
    }
  };

  const santoDomingoNode = {
    "@type": "Place",
    "@id": `${tourUrl}#place-santo-domingo`,
    name: "Santo Domingo",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Santo Domingo"
    }
  };

  const colonialZoneNode = {
    "@type": "TouristAttraction",
    "@id": `${tourUrl}#place-colonial-zone`,
    name: "Zona Colonial",
    url: "https://www.godominicanrepublic.com/en/things-to-do/calle-el-conde"
  };

  const countrysideNode = {
    "@type": "Place",
    "@id": `${tourUrl}#place-dominican-countryside`,
    name: localized(locale, "Campo dominicano", "Dominican countryside", "Campagne dominicaine"),
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Punta Cana"
    }
  };

  const sosuaNode = {
    "@type": "Place",
    "@id": `${tourUrl}#place-sosua`,
    name: "Sosua",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Sosua"
    }
  };

  const puertoPlataNode = {
    "@type": "Place",
    "@id": `${tourUrl}#place-puerto-plata`,
    name: "Puerto Plata",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Puerto Plata"
    }
  };

  const sosuaBayNode = {
    "@type": "TouristAttraction",
    "@id": `${tourUrl}#place-sosua-bay`,
    name: "Sosua Bay",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Sosua"
    }
  };

  const cocoBongoNode = {
    "@type": "EntertainmentBusiness",
    "@id": `${tourUrl}#place-coco-bongo`,
    name: "Coco Bongo Punta Cana",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Punta Cana"
    }
  };

  const capCanaNode = {
    "@type": "Place",
    "@id": `${tourUrl}#place-cap-cana`,
    name: "Cap Cana",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Cap Cana"
    }
  };

  const scapeParkNode = {
    "@type": "AmusementPark",
    "@id": `${tourUrl}#place-scape-park`,
    name: "Scape Park",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Cap Cana"
    }
  };

  const juanilloBeachNode = {
    "@type": "TouristAttraction",
    "@id": `${tourUrl}#place-juanillo-beach`,
    name: "Juanillo Beach",
    address: {
      "@type": "PostalAddress",
      addressCountry: "DO",
      addressLocality: "Cap Cana"
    }
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
    "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana": {
      category: "Adventure tour",
      touristTypes: ["Adventure tourism", "Off-road tourism"],
      audienceType: localized(locale, "Parejas, grupos y viajeros de aventura", "Couples, groups, and adventure travelers", "Couples, groupes et voyageurs aventure"),
      additionalProperty: [
        { name: "Vehicle options", value: "ATV, Buggy 4x4" },
        { name: "Departure area", value: localized(locale, "Bayahibe y La Romana", "Bayahibe and La Romana", "Bayahibe et La Romana") },
        { name: "Route style", value: localized(locale, "Off-road de medio dia", "Half-day off-road", "Tout-terrain demi-journee") },
        { name: "Minimum driver age", value: "18+" },
        { name: "Hotel pickup", value: localized(locale, "Segun zona y reserva", "By zone and booking", "Selon zone et reservation") }
      ],
      itinerary: [
        {
          name: localized(locale, "Check-in y salida", "Check-in and departure", "Check-in et depart"),
          description: localized(locale, "Inicio rapido en Bayahibe o La Romana con asignacion de vehiculo.", "Fast start in Bayahibe or La Romana with vehicle assignment.", "Depart rapide a Bayahibe ou La Romana avec attribution du vehicule.")
        },
        {
          name: localized(locale, "Ruta 4x4", "4x4 route", "Parcours 4x4"),
          description: localized(locale, "Manejo por caminos de tierra y tramos rurales en formato de medio dia.", "Drive through dirt roads and rural sections in a half-day format.", "Conduite sur routes de terre et troncons ruraux en format demi-journee.")
        },
        {
          name: localized(locale, "Parada de experiencia", "Experience stop", "Arret experience"),
          description: localized(locale, "Parada operativa para fotos, descanso o punto natural segun el dia.", "Operational stop for photos, a break, or a nature point depending on the day.", "Arret operationnel pour photos, pause ou point nature selon le jour.")
        }
      ],
      relatedNodes: [bayahibeNode, laRomanaNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-bayahibe` }, { "@id": `${tourUrl}#place-la-romana` }]
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
    "tour-isla-saona-desde-bayhibe-la-romana": {
      category: "Island excursion",
      touristTypes: ["Island tourism", "Beach tourism", "Boat excursion"],
      audienceType: localized(locale, "Familias, parejas y viajeros de playa", "Families, couples, and beach travelers", "Familles, couples et voyageurs plage"),
      additionalProperty: [
        { name: "Destination", value: "Isla Saona" },
        { name: "Departure area", value: localized(locale, "Bayahibe y La Romana", "Bayahibe and La Romana", "Bayahibe et La Romana") },
        { name: "Boat transport", value: localized(locale, "Lancha rapida y catamaran", "Speedboat and catamaran", "Bateau rapide et catamaran") },
        { name: "Lunch", value: localized(locale, "Buffet incluido", "Buffet included", "Buffet inclus") },
        { name: "Beach time", value: localized(locale, "Incluido", "Included", "Inclus") }
      ],
      itinerary: [
        {
          name: localized(locale, "Salida desde Bayahibe o La Romana", "Departure from Bayahibe or La Romana", "Depart depuis Bayahibe ou La Romana"),
          description: localized(locale, "Traslado al punto de embarque y check-in para la salida a Isla Saona.", "Transfer to the boarding point and check-in for the Saona departure.", "Transfert vers le point d embarquement et check-in pour le depart vers l ile Saona.")
        },
        {
          name: localized(locale, "Cruce en lancha o catamaran", "Crossing by speedboat or catamaran", "Traversee en bateau rapide ou catamaran"),
          description: localized(locale, "Navegacion caribena hasta Isla Saona con formato segun operacion del dia.", "Caribbean sail to Saona Island with format depending on daily operations.", "Navigation caribeenne jusqu a l ile Saona selon l operation du jour.")
        },
        {
          name: localized(locale, "Playa y almuerzo en Isla Saona", "Beach time and lunch on Saona Island", "Plage et dejeuner sur l ile Saona"),
          description: localized(locale, "Tiempo libre de playa con almuerzo buffet y bebidas basicas incluidas.", "Free beach time with buffet lunch and basic drinks included.", "Temps libre a la plage avec dejeuner buffet et boissons de base inclus.")
        }
      ],
      relatedNodes: [saonaNode, bayahibeNode, laRomanaNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-saona-island` }, { "@id": `${tourUrl}#place-bayahibe` }, { "@id": `${tourUrl}#place-la-romana` }]
    },
    "cayo-levantado-luxury-beach-day": {
      category: "Nature and beach excursion",
      touristTypes: ["Beach tourism", "Nature tourism", "Boat excursion"],
      audienceType: localized(locale, "Familias, parejas y viajeros de ritmo tranquilo", "Families, couples, and relaxed travelers", "Familles, couples et voyageurs au rythme tranquille"),
      additionalProperty: [
        { name: "Region", value: "Samana" },
        { name: "Beach destination", value: "Cayo Levantado" },
        { name: "Nature stop", value: localized(locale, "Cascada El Limon", "El Limon Waterfall", "Cascade El Limon") },
        { name: "Trip format", value: localized(locale, "Dia completo", "Full day", "Journee complete") },
        { name: "Lunch", value: localized(locale, "Incluido", "Included", "Inclus") }
      ],
      itinerary: [
        {
          name: localized(locale, "Salida temprana desde Punta Cana", "Early departure from Punta Cana", "Depart matinal depuis Punta Cana"),
          description: localized(locale, "Salida de dia completo hacia la peninsula de Samana.", "Full-day departure toward the Samana peninsula.", "Depart a la journee complete vers la peninsule de Samana.")
        },
        {
          name: localized(locale, "Parada en Cascada El Limon", "Stop at El Limon Waterfall", "Arret a la cascade El Limon"),
          description: localized(locale, "Visita de naturaleza en una de las paradas mas conocidas de Samana.", "Nature visit at one of Samana s best-known stops.", "Visite nature a l un des arrets les plus connus de Samana.")
        },
        {
          name: localized(locale, "Tiempo de playa en Cayo Levantado", "Beach time at Cayo Levantado", "Temps de plage a Cayo Levantado"),
          description: localized(locale, "Tiempo para nadar, relajarse y almorzar frente al mar.", "Time to swim, relax, and enjoy lunch by the sea.", "Temps pour nager, se detendre et dejeuner face a la mer.")
        }
      ],
      relatedNodes: [samanaNode, cayoLevantadoNode, elLimonNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-samana` }, { "@id": `${tourUrl}#place-cayo-levantado` }, { "@id": `${tourUrl}#place-el-limon-waterfall` }]
    },
    "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": {
      category: "Whale watching excursion",
      touristTypes: ["Wildlife tourism", "Nature tourism", "Boat excursion"],
      audienceType: localized(locale, "Viajeros de naturaleza, familias y parejas", "Nature travelers, families, and couples", "Voyageurs nature, familles et couples"),
      additionalProperty: [
        { name: "Main experience", value: localized(locale, "Avistamiento de ballenas", "Whale watching", "Observation des baleines") },
        { name: "Season", value: localized(locale, "Enero a marzo", "January to March", "Janvier a mars") },
        { name: "Nature stop", value: localized(locale, "Cascada El Limon", "El Limon Waterfall", "Cascade El Limon") },
        { name: "Beach destination", value: "Cayo Levantado" },
        { name: "Trip format", value: localized(locale, "Dia completo", "Full day", "Journee complete") }
      ],
      itinerary: [
        {
          name: localized(locale, "Salida temprana a Samana", "Early transfer to Samana", "Transfert matinal vers Samana"),
          description: localized(locale, "Traslado desde Punta Cana para una jornada completa en Samana.", "Transfer from Punta Cana for a full-day experience in Samana.", "Transfert depuis Punta Cana pour une excursion a la journee complete a Samana.")
        },
        {
          name: localized(locale, "Navegacion para avistar ballenas", "Boat trip for whale watching", "Sortie en mer pour observer les baleines"),
          description: localized(locale, "Salida en barco durante temporada para observar ballenas jorobadas en Samana.", "Boat outing during season to observe humpback whales in Samana.", "Sortie en bateau en saison pour observer les baleines a bosse a Samana.")
        },
        {
          name: localized(locale, "Cascada El Limon y Cayo Levantado", "El Limon Waterfall and Cayo Levantado", "Cascade El Limon et Cayo Levantado"),
          description: localized(locale, "La ruta combina parada natural en la cascada y tiempo de playa en Cayo Levantado.", "The route combines a waterfall nature stop and beach time at Cayo Levantado.", "Le parcours combine une halte nature a la cascade et du temps de plage a Cayo Levantado.")
        }
      ],
      relatedNodes: [samanaNode, cayoLevantadoNode, elLimonNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-samana` }, { "@id": `${tourUrl}#place-cayo-levantado` }, { "@id": `${tourUrl}#place-el-limon-waterfall` }]
    },
    "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": {
      category: "Cultural tour",
      touristTypes: ["Cultural tourism", "Countryside tourism", "Family tourism"],
      audienceType: localized(locale, "Familias y viajeros culturales", "Families and cultural travelers", "Familles et voyageurs culturels"),
      additionalProperty: [
        { name: "Experience type", value: localized(locale, "Safari cultural", "Cultural safari", "Safari culturel") },
        { name: "Route area", value: localized(locale, "Campo dominicano", "Dominican countryside", "Campagne dominicaine") },
        { name: "Guide", value: localized(locale, "Guia local incluido", "Local guide included", "Guide local inclus") },
        { name: "Tastings", value: localized(locale, "Degustaciones dominicanas", "Dominican tastings", "Degustations dominicaines") },
        { name: "Trip rhythm", value: localized(locale, "Relajado", "Relaxed", "Detendu") }
      ],
      itinerary: [
        {
          name: localized(locale, "Ruta por zonas rurales", "Route through countryside areas", "Route par les zones rurales"),
          description: localized(locale, "Recorrido por el campo dominicano y comunidades locales fuera de la zona hotelera.", "Route through the Dominican countryside and local communities outside the resort zone.", "Parcours a travers la campagne dominicaine et les communautes locales hors zone hoteliere.")
        },
        {
          name: localized(locale, "Visita a casa tipica", "Visit to a traditional home", "Visite d une maison traditionnelle"),
          description: localized(locale, "Parada cultural para conocer productos, costumbres y vida local.", "Cultural stop to learn about local products, customs, and everyday life.", "Arret culturel pour decouvrir produits, coutumes et vie locale.")
        },
        {
          name: localized(locale, "Degustaciones y regreso", "Tastings and return", "Degustations et retour"),
          description: localized(locale, "Experiencia con sabores dominicanos antes del regreso a Punta Cana.", "Dominican tasting experience before returning to Punta Cana.", "Experience de saveurs dominicaines avant le retour a Punta Cana.")
        }
      ],
      relatedNodes: [puntaCanaNode, countrysideNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-punta-cana` }, { "@id": `${tourUrl}#place-dominican-countryside` }]
    },
    "excursion-de-un-dia-a-santo-domingo-desde-punta-cana": {
      category: "City and history tour",
      touristTypes: ["Historical tourism", "City tourism", "Cultural tourism"],
      audienceType: localized(locale, "Viajeros culturales, parejas y familias", "Cultural travelers, couples, and families", "Voyageurs culturels, couples et familles"),
      additionalProperty: [
        { name: "Destination city", value: "Santo Domingo" },
        { name: "Historic area", value: localized(locale, "Zona Colonial", "Colonial Zone", "Zone Coloniale") },
        { name: "Guide", value: localized(locale, "Guia local incluido", "Local guide included", "Guide local inclus") },
        { name: "Lunch", value: localized(locale, "Tipico incluido", "Local lunch included", "Dejeuner local inclus") },
        { name: "Trip format", value: localized(locale, "Dia completo", "Full day", "Journee complete") }
      ],
      itinerary: [
        {
          name: localized(locale, "Salida desde Punta Cana", "Departure from Punta Cana", "Depart depuis Punta Cana"),
          description: localized(locale, "Traslado terrestre de dia completo hacia Santo Domingo.", "Full-day overland transfer to Santo Domingo.", "Transfert terrestre a la journee complete vers Saint-Domingue.")
        },
        {
          name: localized(locale, "Recorrido por Zona Colonial", "Colonial Zone walking tour", "Visite de la Zone Coloniale"),
          description: localized(locale, "Visita guiada por el centro historico con paradas en puntos emblematicos.", "Guided visit through the historic center with stops at iconic landmarks.", "Visite guidee du centre historique avec arrets aux lieux emblematiques.")
        },
        {
          name: localized(locale, "Almuerzo y regreso", "Lunch and return", "Dejeuner et retour"),
          description: localized(locale, "Almuerzo local y regreso a Punta Cana durante la tarde.", "Local lunch and return to Punta Cana later in the day.", "Dejeuner local et retour a Punta Cana dans l apres-midi.")
        }
      ],
      relatedNodes: [santoDomingoNode, colonialZoneNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-santo-domingo` }, { "@id": `${tourUrl}#place-colonial-zone` }]
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
    "private-buggy-tour-cenote-swim-dominican-lunch": {
      category: "Private adventure tour",
      touristTypes: ["Adventure tourism", "Private tour", "Off-road tourism"],
      audienceType: localized(locale, "Grupos privados, parejas y familias", "Private groups, couples, and families", "Groupes prives, couples et familles"),
      additionalProperty: [
        { name: "Vehicle", value: "Private buggy" },
        { name: "Tour format", value: localized(locale, "Privado", "Private", "Prive") },
        { name: "Swim stop", value: localized(locale, "Cenote o cueva", "Cenote or cave", "Cenote ou grotte") },
        { name: "Meal", value: localized(locale, "Almuerzo dominicano", "Dominican lunch", "Dejeuner dominicain") },
        { name: "Departure area", value: "Punta Cana" }
      ],
      itinerary: [
        {
          name: localized(locale, "Salida privada", "Private departure", "Depart prive"),
          description: localized(locale, "Inicio del recorrido solo para tu grupo con coordinacion directa.", "Start of the route exclusively for your group with direct coordination.", "Depart du parcours uniquement pour votre groupe avec coordination directe.")
        },
        {
          name: localized(locale, "Ruta buggy y cenote", "Buggy route and cenote stop", "Parcours buggy et arret cenote"),
          description: localized(locale, "Manejo off-road con parada para bano en cenote o cueva.", "Off-road driving with a swim stop at a cenote or cave.", "Conduite tout-terrain avec pause baignade au cenote ou dans une grotte.")
        },
        {
          name: localized(locale, "Almuerzo dominicano", "Dominican lunch", "Dejeuner dominicain"),
          description: localized(locale, "Cierre de la experiencia con almuerzo local antes del regreso.", "End of the experience with a local lunch before returning.", "Fin de l experience avec dejeuner local avant le retour.")
        }
      ],
      relatedNodes: [puntaCanaNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-punta-cana` }]
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
    },
    "party-boat-sosua": {
      category: "Boat party excursion",
      touristTypes: ["Boat excursion", "Snorkeling tour", "Nightlife and party tourism"],
      audienceType: localized(locale, "Grupos, celebraciones y viajeros de playa", "Groups, celebrations, and beach travelers", "Groupes, celebrations et voyageurs plage"),
      additionalProperty: [
        { name: "Boat type", value: localized(locale, "Party boat compartido", "Shared party boat", "Party boat partage") },
        { name: "Open bar", value: localized(locale, "Incluido", "Included", "Inclus") },
        { name: "Snorkel stop", value: localized(locale, "Incluido", "Included", "Inclus") },
        { name: "Departure area", value: localized(locale, "Sosua", "Sosua", "Sosua") },
        { name: "Pickup area", value: localized(locale, "Puerto Plata y alrededores", "Puerto Plata and nearby areas", "Puerto Plata et environs") }
      ],
      itinerary: [
        {
          name: localized(locale, "Salida en Sosua", "Departure in Sosua", "Depart a Sosua"),
          description: localized(locale, "Embarque para una salida compartida en la bahia de Sosua.", "Boarding for a shared departure in Sosua Bay.", "Embarquement pour une sortie partagee dans la baie de Sosua.")
        },
        {
          name: localized(locale, "Snorkel y bano", "Snorkel and swim stop", "Snorkeling et baignade"),
          description: localized(locale, "Parada para snorkel y tiempo en el agua segun condiciones del mar.", "Stop for snorkeling and time in the water depending on sea conditions.", "Arret pour snorkeling et temps dans l eau selon les conditions de mer.")
        },
        {
          name: localized(locale, "Musica y open bar", "Music and open bar", "Musique et open bar"),
          description: localized(locale, "Ambiente de fiesta a bordo con bebidas y musica durante la navegacion.", "Party atmosphere onboard with drinks and music during the cruise.", "Ambiance festive a bord avec boissons et musique pendant la navigation.")
        }
      ],
      relatedNodes: [sosuaNode, puertoPlataNode, sosuaBayNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-sosua` }, { "@id": `${tourUrl}#place-puerto-plata` }, { "@id": `${tourUrl}#place-sosua-bay` }]
    },
    "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua": {
      category: "Private boat party",
      touristTypes: ["Private tour", "Boat excursion", "Celebration tourism"],
      audienceType: localized(locale, "Grupos privados y celebraciones", "Private groups and celebrations", "Groupes prives et celebrations"),
      additionalProperty: [
        { name: "Boat type", value: localized(locale, "Barco privado", "Private boat", "Bateau prive") },
        { name: "Departure area", value: localized(locale, "Sosua y Puerto Plata", "Sosua and Puerto Plata", "Sosua et Puerto Plata") },
        { name: "Open bar", value: localized(locale, "Incluido segun paquete", "Included depending on package", "Inclus selon le forfait") },
        { name: "Format", value: localized(locale, "Privado", "Private", "Prive") },
        { name: "Best for", value: localized(locale, "Cumpleanos y grupos", "Birthdays and groups", "Anniversaires et groupes") }
      ],
      itinerary: [
        {
          name: localized(locale, "Coordinacion privada", "Private coordination", "Coordination privee"),
          description: localized(locale, "Salida exclusiva para tu grupo desde la zona de Sosua o Puerto Plata.", "Exclusive departure for your group from the Sosua or Puerto Plata area.", "Depart exclusif pour votre groupe depuis la zone de Sosua ou Puerto Plata.")
        },
        {
          name: localized(locale, "Navegacion y parada en bahia", "Cruise and bay stop", "Navigation et arret en baie"),
          description: localized(locale, "Recorrido privado con tiempo para nadar y disfrutar la bahia.", "Private cruise with time to swim and enjoy the bay.", "Croisiere privee avec temps pour nager et profiter de la baie.")
        },
        {
          name: localized(locale, "Fiesta a bordo", "Onboard celebration", "Fete a bord"),
          description: localized(locale, "Musica, bebidas y experiencia configurada para celebracion o grupo.", "Music, drinks, and an experience configured for a celebration or group.", "Musique, boissons et experience configuree pour une celebration ou un groupe.")
        }
      ],
      relatedNodes: [sosuaNode, puertoPlataNode, sosuaBayNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-sosua` }, { "@id": `${tourUrl}#place-puerto-plata` }, { "@id": `${tourUrl}#place-sosua-bay` }]
    },
    "coco-bongo-punta-cana": {
      category: "Nightlife experience",
      touristTypes: ["Nightlife tourism", "Entertainment tourism"],
      audienceType: localized(locale, "Adultos, parejas y grupos", "Adults, couples, and groups", "Adultes, couples et groupes"),
      additionalProperty: [
        { name: "Venue", value: "Coco Bongo Punta Cana" },
        { name: "Experience", value: localized(locale, "Show y discoteca", "Show and nightclub", "Show et discotheque") },
        { name: "Entry format", value: localized(locale, "Entrada general", "General admission", "Entree generale") },
        { name: "Best for", value: localized(locale, "Vida nocturna", "Nightlife", "Vie nocturne") }
      ],
      itinerary: [
        {
          name: localized(locale, "Entrada al venue", "Venue entry", "Entree au lieu"),
          description: localized(locale, "Acceso a Coco Bongo Punta Cana para disfrutar show y ambiente nocturno.", "Access to Coco Bongo Punta Cana to enjoy the show and nightlife atmosphere.", "Acces a Coco Bongo Punta Cana pour profiter du show et de l ambiance nocturne.")
        },
        {
          name: localized(locale, "Show en vivo", "Live show", "Show en direct"),
          description: localized(locale, "Presentacion con musica, performance y formato visual caracteristico del venue.", "Show with music, performances, and the venue s signature visual format.", "Presentation avec musique, performances et format visuel caracteristique du lieu.")
        },
        {
          name: localized(locale, "Fiesta y regreso", "Party time and return", "Fete et retour"),
          description: localized(locale, "Tiempo para seguir la noche segun el ticket seleccionado.", "Time to continue the night depending on the selected ticket.", "Temps pour continuer la nuit selon le billet choisi.")
        }
      ],
      relatedNodes: [puntaCanaNode, cocoBongoNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-punta-cana` }, { "@id": `${tourUrl}#place-coco-bongo` }]
    },
    "coco-bongo-punta-cana-show-disco-skip-the-line": {
      category: "Nightlife experience",
      touristTypes: ["Nightlife tourism", "Entertainment tourism"],
      audienceType: localized(locale, "Adultos, parejas y grupos", "Adults, couples, and groups", "Adultes, couples et groupes"),
      additionalProperty: [
        { name: "Venue", value: "Coco Bongo Punta Cana" },
        { name: "Experience", value: localized(locale, "Show, discoteca y acceso rapido", "Show, nightclub, and fast entry", "Show, discotheque et acces rapide") },
        { name: "Entry format", value: localized(locale, "Skip the line", "Skip-the-line", "Coupe-file") },
        { name: "Best for", value: localized(locale, "Vida nocturna premium", "Premium nightlife", "Vie nocturne premium") }
      ],
      itinerary: [
        {
          name: localized(locale, "Acceso preferente", "Priority entry", "Entree prioritaire"),
          description: localized(locale, "Ingreso con formato rapido para reducir esperas en la entrada.", "Fast-entry format to reduce waiting time at the entrance.", "Format d entree rapide pour reduire l attente a l entree.")
        },
        {
          name: localized(locale, "Show y discoteca", "Show and nightclub", "Show et discotheque"),
          description: localized(locale, "Experiencia completa de entretenimiento en Coco Bongo Punta Cana.", "Full entertainment experience at Coco Bongo Punta Cana.", "Experience complete de divertissement a Coco Bongo Punta Cana.")
        },
        {
          name: localized(locale, "Noche libre", "Night experience", "Experience de nuit"),
          description: localized(locale, "Tiempo para vivir el ambiente del venue con el acceso seleccionado.", "Time to enjoy the venue atmosphere with the selected access level.", "Temps pour profiter de l ambiance du lieu avec le niveau d acces choisi.")
        }
      ],
      relatedNodes: [puntaCanaNode, cocoBongoNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-punta-cana` }, { "@id": `${tourUrl}#place-coco-bongo` }]
    },
    "scape-park-punta-cana": {
      category: "Adventure park ticket",
      touristTypes: ["Theme park tourism", "Adventure tourism", "Family tourism"],
      audienceType: localized(locale, "Familias, parejas y grupos", "Families, couples, and groups", "Familles, couples et groupes"),
      additionalProperty: [
        { name: "Park", value: "Scape Park" },
        { name: "Area", value: "Cap Cana" },
        { name: "Format", value: localized(locale, "Entrada al parque", "Park entry", "Entree au parc") },
        { name: "Best for", value: localized(locale, "Dia de aventura", "Adventure day", "Journee aventure") }
      ],
      itinerary: [
        {
          name: localized(locale, "Llegada a Scape Park", "Arrival at Scape Park", "Arrivee a Scape Park"),
          description: localized(locale, "Ingreso al parque de aventura en Cap Cana para disfrutar sus atracciones.", "Entry to the adventure park in Cap Cana to enjoy its attractions.", "Entree au parc d aventure de Cap Cana pour profiter de ses attractions.")
        },
        {
          name: localized(locale, "Actividades del parque", "Park activities", "Activites du parc"),
          description: localized(locale, "Tiempo para organizar el dia segun las actividades incluidas en tu ticket.", "Time to organize the day according to the activities included in your ticket.", "Temps pour organiser la journee selon les activites incluses dans votre billet.")
        },
        {
          name: localized(locale, "Regreso", "Return", "Retour"),
          description: localized(locale, "Cierre de la visita al parque y regreso segun la logistica reservada.", "End of the park visit and return depending on booked logistics.", "Fin de la visite du parc et retour selon la logistique reservee.")
        }
      ],
      relatedNodes: [capCanaNode, scapeParkNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-cap-cana` }, { "@id": `${tourUrl}#place-scape-park` }]
    },
    "scape-park-full-admission-punta-cana": {
      category: "Adventure park ticket",
      touristTypes: ["Theme park tourism", "Adventure tourism", "Family tourism"],
      audienceType: localized(locale, "Familias, grupos y viajeros activos", "Families, groups, and active travelers", "Familles, groupes et voyageurs actifs"),
      additionalProperty: [
        { name: "Park", value: "Scape Park" },
        { name: "Area", value: "Cap Cana" },
        { name: "Ticket type", value: localized(locale, "Full admission", "Full admission", "Admission complete") },
        { name: "Best for", value: localized(locale, "Acceso amplio al parque", "Broad park access", "Acces large au parc") }
      ],
      itinerary: [
        {
          name: localized(locale, "Ingreso full admission", "Full admission entry", "Entree full admission"),
          description: localized(locale, "Entrada con acceso amplio a las experiencias incluidas por Scape Park.", "Entry with broad access to the experiences included by Scape Park.", "Entree avec acces large aux experiences incluses par Scape Park.")
        },
        {
          name: localized(locale, "Recorrido de actividades", "Activity circuit", "Circuit d activites"),
          description: localized(locale, "Planificacion del dia para aprovechar las actividades incluidas en el ticket.", "Day planning to enjoy the activities included in the ticket.", "Planification de la journee pour profiter des activites incluses dans le billet.")
        },
        {
          name: localized(locale, "Cierre del dia", "End of day", "Fin de journee"),
          description: localized(locale, "Salida del parque al finalizar la jornada de aventura.", "Departure from the park at the end of the adventure day.", "Sortie du parc a la fin de la journee aventure.")
        }
      ],
      relatedNodes: [capCanaNode, scapeParkNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-cap-cana` }, { "@id": `${tourUrl}#place-scape-park` }]
    },
    "scape-park-sunshine-cruise-punta-cana": {
      category: "Adventure and cruise combo",
      touristTypes: ["Theme park tourism", "Boat excursion", "Beach tourism"],
      audienceType: localized(locale, "Parejas, familias y grupos", "Couples, families, and groups", "Couples, familles et groupes"),
      additionalProperty: [
        { name: "Park", value: "Scape Park" },
        { name: "Combo", value: localized(locale, "Parque y cruise", "Park and cruise", "Parc et cruise") },
        { name: "Area", value: "Cap Cana" },
        { name: "Trip format", value: localized(locale, "Dia combinado", "Combo day", "Journee combinee") }
      ],
      itinerary: [
        {
          name: localized(locale, "Scape Park", "Scape Park", "Scape Park"),
          description: localized(locale, "Primera parte del dia dedicada al parque de aventura en Cap Cana.", "First part of the day dedicated to the adventure park in Cap Cana.", "Premiere partie de la journee dediee au parc d aventure de Cap Cana.")
        },
        {
          name: localized(locale, "Sunshine Cruise", "Sunshine Cruise", "Sunshine Cruise"),
          description: localized(locale, "Salida en barco o formato cruise segun operacion del paquete reservado.", "Boat departure or cruise format depending on the booked package operations.", "Sortie en bateau ou format cruise selon l operation du forfait reserve.")
        },
        {
          name: localized(locale, "Regreso", "Return", "Retour"),
          description: localized(locale, "Cierre del paquete combinado con regreso al final del dia.", "End of the combo package with return at the end of the day.", "Fin du forfait combine avec retour en fin de journee.")
        }
      ],
      relatedNodes: [capCanaNode, scapeParkNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-cap-cana` }, { "@id": `${tourUrl}#place-scape-park` }]
    },
    "scape-park-buggies-punta-cana": {
      category: "Adventure park buggy experience",
      touristTypes: ["Theme park tourism", "Adventure tourism", "Off-road tourism"],
      audienceType: localized(locale, "Viajeros de aventura y grupos", "Adventure travelers and groups", "Voyageurs aventure et groupes"),
      additionalProperty: [
        { name: "Park", value: "Scape Park" },
        { name: "Vehicle", value: "Buggy" },
        { name: "Area", value: "Cap Cana" },
        { name: "Experience type", value: localized(locale, "Buggies dentro del parque", "Buggies inside the park", "Buggies dans le parc") }
      ],
      itinerary: [
        {
          name: localized(locale, "Ingreso a Scape Park", "Arrival at Scape Park", "Arrivee a Scape Park"),
          description: localized(locale, "Entrada al parque para una experiencia enfocada en buggies.", "Entry to the park for a buggy-focused experience.", "Entree au parc pour une experience axee sur les buggies.")
        },
        {
          name: localized(locale, "Circuito buggy", "Buggy circuit", "Circuit buggy"),
          description: localized(locale, "Recorrido de aventura en buggy dentro del entorno de Cap Cana.", "Buggy adventure route inside the Cap Cana environment.", "Parcours aventure en buggy dans l environnement de Cap Cana.")
        },
        {
          name: localized(locale, "Cierre y regreso", "Wrap-up and return", "Fin et retour"),
          description: localized(locale, "Fin de la experiencia y salida del parque.", "End of the experience and departure from the park.", "Fin de l experience et sortie du parc.")
        }
      ],
      relatedNodes: [capCanaNode, scapeParkNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-cap-cana` }, { "@id": `${tourUrl}#place-scape-park` }]
    },
    "juanillo-vip-scape-park-punta-cana": {
      category: "Beach and park combo",
      touristTypes: ["Beach tourism", "Theme park tourism", "Premium excursion"],
      audienceType: localized(locale, "Parejas, grupos y viajeros premium", "Couples, groups, and premium travelers", "Couples, groupes et voyageurs premium"),
      additionalProperty: [
        { name: "Park", value: "Scape Park" },
        { name: "Beach", value: "Juanillo Beach" },
        { name: "Area", value: "Cap Cana" },
        { name: "Format", value: localized(locale, "VIP", "VIP", "VIP") }
      ],
      itinerary: [
        {
          name: localized(locale, "Scape Park", "Scape Park", "Scape Park"),
          description: localized(locale, "Parte del dia dedicada al parque y sus experiencias en Cap Cana.", "Part of the day dedicated to the park and its experiences in Cap Cana.", "Partie de la journee consacree au parc et a ses experiences a Cap Cana.")
        },
        {
          name: localized(locale, "Juanillo Beach", "Juanillo Beach", "Plage Juanillo"),
          description: localized(locale, "Tiempo para disfrutar playa en Juanillo con un enfoque mas relajado.", "Time to enjoy Juanillo Beach with a more relaxed pace.", "Temps pour profiter de la plage Juanillo avec un rythme plus detendu.")
        },
        {
          name: localized(locale, "Regreso", "Return", "Retour"),
          description: localized(locale, "Cierre del dia VIP en Cap Cana y regreso.", "End of the VIP day in Cap Cana and return.", "Fin de la journee VIP a Cap Cana et retour.")
        }
      ],
      relatedNodes: [capCanaNode, scapeParkNode, juanilloBeachNode],
      relatedRefs: [{ "@id": `${tourUrl}#place-cap-cana` }, { "@id": `${tourUrl}#place-scape-park` }, { "@id": `${tourUrl}#place-juanillo-beach` }]
    }
  };

  return profiles[slug] ?? null;
};
