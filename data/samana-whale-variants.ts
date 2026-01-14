import type { Locale } from "@/lib/translations";

export type SamanaWhaleFaq = {
  q: string;
  a: string;
};

export type SamanaWhaleVariant = {
  slug: string;
  clusterId: string;
  titles: Record<Locale, string>;
  heroSubtitles: Record<Locale, string>;
  metaDescriptions: Record<Locale, string>;
  bodyBlocks: Record<Locale, string[]>;
  faqs: Record<Locale, SamanaWhaleFaq[]>;
  ctas: Record<Locale, string[]>;
};

export const SAMANA_WHALE_BASE_TOUR = {
  slug: "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana",
  inclusions: {
    es: [
      "Transporte ida y vuelta desde Punta Cana",
      "Avistamiento de ballenas en la Bahia de Samana",
      "Excursion a la Cascada El Limon",
      "Almuerzo tipico dominicano",
      "Visita a Cayo Levantado",
      "Guia certificado"
    ],
    en: [
      "Round-trip transport from Punta Cana",
      "Whale watching in Samana Bay",
      "El Limon Waterfall excursion",
      "Traditional Dominican lunch",
      "Cayo Levantado visit",
      "Certified guide"
    ],
    fr: [
      "Transport aller-retour depuis Punta Cana",
      "Observation des baleines dans la baie de Samana",
      "Excursion a la cascade El Limon",
      "Dejeuner dominicain typique",
      "Visite de Cayo Levantado",
      "Guide certifie"
    ]
  } as Record<Locale, string[]>,
  highlights: {
    es: [
      "Bahia de Samana y su santuario de ballenas",
      "Cayo Levantado (Bacardi Island)",
      "Cascada El Limon",
      "Naturaleza tropical y vida marina",
      "Ruta completa en un solo dia"
    ],
    en: [
      "Samana Bay whale sanctuary",
      "Cayo Levantado (Bacardi Island)",
      "El Limon Waterfall",
      "Tropical nature and marine life",
      "Full-day route in one trip"
    ],
    fr: [
      "Sanctuaire des baleines de la baie de Samana",
      "Cayo Levantado (Bacardi Island)",
      "Cascade El Limon",
      "Nature tropicale et vie marine",
      "Itineraire complet en une journee"
    ]
  } as Record<Locale, string[]>
};

export const SAMANA_WHALE_VARIANTS: SamanaWhaleVariant[] = [
  {
    slug: "samana-3-en-1-ballenas-cayo-levantado",
    clusterId: "master",
    titles: {
      es: "Samana ballenas y Cayo Levantado: aventura 3 en 1",
      en: "Samana Whale Watching & Cayo Levantado: The Ultimate 3-in-1 Adventure",
      fr: "Samana baleines et Cayo Levantado: aventure 3-en-1 ultime"
    },
    heroSubtitles: {
      es: "Ballenas, cascada El Limon y playa en un solo dia desde Punta Cana.",
      en: "Whales, El Limon waterfall, and beach time in one day from Punta Cana.",
      fr: "Baleines, cascade El Limon et plage en une journee depuis Punta Cana."
    },
    metaDescriptions: {
      es: "Vive Samana completo con avistamiento de ballenas, Cascada El Limon y Cayo Levantado en una excursion 3 en 1.",
      en: "Experience the full Samana day: whale watching, El Limon waterfall, and Cayo Levantado in a 3-in-1 tour.",
      fr: "Decouvrez Samana en une journee: baleines, cascade El Limon et Cayo Levantado en formule 3-en-1."
    },
    bodyBlocks: {
      es: [
        "Esta ruta combina tres iconos de Samana en un solo dia organizado.",
        "Incluye santuario de ballenas, cascada y playa con tiempos claros.",
        "Ideal si buscas la experiencia mas completa desde Punta Cana."
      ],
      en: [
        "This route combines three Samana icons in one organized day.",
        "It includes the whale sanctuary, waterfall, and beach with clear timing.",
        "Perfect for travelers who want the most complete experience from Punta Cana."
      ],
      fr: [
        "Cet itineraire combine trois icones de Samana en une journee organisee.",
        "Il inclut le sanctuaire des baleines, la cascade et la plage avec horaires clairs.",
        "Ideal pour ceux qui veulent l experience la plus complete depuis Punta Cana."
      ]
    },
    faqs: {
      es: [
        {
          q: "Se hace todo en un solo dia?",
          a: "Si, el recorrido esta planificado para cubrir los tres puntos principales."
        }
      ],
      en: [
        {
          q: "Is everything done in one day?",
          a: "Yes, the itinerary is designed to cover all three highlights."
        }
      ],
      fr: [
        {
          q: "Tout se fait en une journee?",
          a: "Oui, l itineraire est organise pour couvrir les trois points cles."
        }
      ]
    },
    ctas: {
      es: ["Reservar aventura 3 en 1", "Ver disponibilidad"],
      en: ["Book the 3-in-1 adventure", "Check availability"],
      fr: ["Reserver l aventure 3-en-1", "Voir disponibilite"]
    }
  },
  {
    slug: "encuentro-ballenas-samana-y-cascada-el-limon",
    clusterId: "whales",
    titles: {
      es: "Encuentro con ballenas: Bahia de Samana y Cascada El Limon",
      en: "Humpback Whale Encounter: Samana Bay & El Limon Waterfall Expedition",
      fr: "Rencontre avec les baleines: baie de Samana et cascade El Limon"
    },
    heroSubtitles: {
      es: "La experiencia mas emocionante para ver ballenas y selva tropical.",
      en: "The most exciting mix of whale watching and tropical rainforest.",
      fr: "Le meilleur mix entre observation des baleines et foret tropicale."
    },
    metaDescriptions: {
      es: "Explora la Bahia de Samana y la Cascada El Limon en un tour guiado con transporte desde Punta Cana.",
      en: "Explore Samana Bay and El Limon Waterfall on a guided tour with transport from Punta Cana.",
      fr: "Explorez la baie de Samana et la cascade El Limon avec transport depuis Punta Cana."
    },
    bodyBlocks: {
      es: [
        "La Bahia de Samana es el santuario natural de las ballenas jorobadas.",
        "Luego visitas la Cascada El Limon en una ruta de naturaleza y aventura.",
        "Una excursion ideal para amantes del mar y la selva."
      ],
      en: [
        "Samana Bay is the natural sanctuary for humpback whales.",
        "Then you visit El Limon Waterfall on a nature and adventure route.",
        "A perfect tour for travelers who love ocean and rainforest."
      ],
      fr: [
        "La baie de Samana est le sanctuaire naturel des baleines a bosse.",
        "Ensuite, visite de la cascade El Limon sur une route nature et aventure.",
        "Une excursion ideale pour les amoureux de la mer et de la foret."
      ]
    },
    faqs: {
      es: [
        {
          q: "Se requiere experiencia para la Cascada El Limon?",
          a: "No, el recorrido es guiado y con ritmo controlado."
        }
      ],
      en: [
        {
          q: "Do I need experience for El Limon Waterfall?",
          a: "No, the route is guided and paced for visitors."
        }
      ],
      fr: [
        {
          q: "Faut-il de l experience pour la cascade El Limon?",
          a: "Non, le parcours est guide et adapte."
        }
      ]
    },
    ctas: {
      es: ["Ver santuario de ballenas", "Reservar excursion"],
      en: ["See the whale sanctuary", "Book the expedition"],
      fr: ["Voir le sanctuaire des baleines", "Reserver l excursion"]
    }
  },
  {
    slug: "samana-explorer-ballenas-cascadas-y-bacardi-island",
    clusterId: "explorer",
    titles: {
      es: "Samana Explorer: ballenas, cascadas y Bacardi Island",
      en: "Samana Explorer: Whales, Waterfalls, and Bacardi Island Day Trip",
      fr: "Samana Explorer: baleines, cascades et Bacardi Island"
    },
    heroSubtitles: {
      es: "Un viaje completo para ver ballenas y relajar en Cayo Levantado.",
      en: "A complete trip for whale watching and relaxing at Cayo Levantado.",
      fr: "Un voyage complet pour voir les baleines et se detendre a Cayo Levantado."
    },
    metaDescriptions: {
      es: "Tour explorador a Samana con avistamiento de ballenas, Cascada El Limon y Cayo Levantado.",
      en: "Explorer tour to Samana with whale watching, El Limon waterfall, and Cayo Levantado.",
      fr: "Tour explorateur a Samana avec baleines, cascade El Limon et Cayo Levantado."
    },
    bodyBlocks: {
      es: [
        "El recorrido combina aventura en cascadas y descanso en Bacardi Island.",
        "Se navega por la Bahia de Samana en busca de ballenas.",
        "Una opcion ideal para viajeros activos."
      ],
      en: [
        "The route blends waterfall adventure with Bacardi Island downtime.",
        "You sail through Samana Bay searching for whales.",
        "An ideal option for active travelers."
      ],
      fr: [
        "Le parcours combine aventure aux cascades et repos a Bacardi Island.",
        "Vous naviguez dans la baie de Samana a la recherche des baleines.",
        "Une option ideale pour les voyageurs actifs."
      ]
    },
    faqs: {
      es: [
        {
          q: "Cayo Levantado es parte del tour?",
          a: "Si, se incluye tiempo de playa en la isla."
        }
      ],
      en: [
        {
          q: "Is Cayo Levantado included?",
          a: "Yes, beach time on the island is included."
        }
      ],
      fr: [
        {
          q: "Cayo Levantado est-il inclus?",
          a: "Oui, un temps de plage est inclus."
        }
      ]
    },
    ctas: {
      es: ["Explorar Samana", "Reservar ahora"],
      en: ["Explore Samana", "Book now"],
      fr: ["Explorer Samana", "Reserver maintenant"]
    }
  },
  {
    slug: "samana-completo-ballenas-cabalgata-y-playa-paraiso",
    clusterId: "complete",
    titles: {
      es: "Samana completo: ballenas, cabalgata y playa paraiso",
      en: "The Complete Samana Experience: Whales, Jungle Riding & Paradise Beach",
      fr: "Experience complete Samana: baleines, balade et plage paradis"
    },
    heroSubtitles: {
      es: "Combina ballenas, cascada y Cayo Levantado con ritmo perfecto.",
      en: "Combine whales, waterfall, and Cayo Levantado with perfect timing.",
      fr: "Combinez baleines, cascade et Cayo Levantado avec un rythme parfait."
    },
    metaDescriptions: {
      es: "Tour completo a Samana con avistamiento de ballenas, Cascada El Limon y playa en Cayo Levantado.",
      en: "Complete Samana tour with whale watching, El Limon waterfall, and Cayo Levantado beach.",
      fr: "Tour complet de Samana avec baleines, cascade El Limon et plage a Cayo Levantado."
    },
    bodyBlocks: {
      es: [
        "Disfruta la aventura completa con cascadas, ballenas y playa.",
        "La ruta esta pensada para maximizar el dia sin prisas.",
        "Perfecto para familias y grupos que quieren todo en uno."
      ],
      en: [
        "Enjoy the complete adventure with waterfalls, whales, and beach time.",
        "The route is designed to maximize the day without rushing.",
        "Perfect for families and groups who want everything in one tour."
      ],
      fr: [
        "Profitez de l aventure complete avec cascades, baleines et plage.",
        "L itineraire est pense pour profiter de la journee sans stress.",
        "Parfait pour les familles et groupes qui veulent tout en un."
      ]
    },
    faqs: {
      es: [
        {
          q: "Hay tiempo para descansar en la isla?",
          a: "Si, se programa una pausa de playa en Cayo Levantado."
        }
      ],
      en: [
        {
          q: "Is there time to relax on the island?",
          a: "Yes, beach time at Cayo Levantado is scheduled."
        }
      ],
      fr: [
        {
          q: "Y a-t-il du temps pour se reposer sur l ile?",
          a: "Oui, du temps de plage a Cayo Levantado est prevu."
        }
      ]
    },
    ctas: {
      es: ["Reservar Samana completo", "Ver cupos"],
      en: ["Book complete Samana", "See spots"],
      fr: ["Reserver Samana complet", "Voir les places"]
    }
  },
  {
    slug: "punta-cana-a-samana-ballenas-y-cascadas-tropicales",
    clusterId: "route",
    titles: {
      es: "Punta Cana a Samana: ballenas y cascadas tropicales",
      en: "Punta Cana to Samana: Majestic Whales and Hidden Tropical Cascades",
      fr: "Punta Cana vers Samana: baleines et cascades tropicales"
    },
    heroSubtitles: {
      es: "Un viaje directo al corazon natural de Samana.",
      en: "A direct ride into the natural heart of Samana.",
      fr: "Un trajet direct vers le coeur naturel de Samana."
    },
    metaDescriptions: {
      es: "Salida desde Punta Cana con transporte directo, ballenas en Samana y Cascada El Limon.",
      en: "Depart from Punta Cana with direct transport, whales in Samana, and El Limon Waterfall.",
      fr: "Depart de Punta Cana avec transport direct, baleines a Samana et cascade El Limon."
    },
    bodyBlocks: {
      es: [
        "Se confirma la salida desde Punta Cana con transporte comodo.",
        "La ruta incluye santuario de ballenas y cascadas ocultas.",
        "Una experiencia ideal para amantes de naturaleza real."
      ],
      en: [
        "Departure from Punta Cana is confirmed with comfortable transport.",
        "The route includes the whale sanctuary and hidden waterfalls.",
        "An ideal experience for true nature lovers."
      ],
      fr: [
        "Depart confirme depuis Punta Cana avec transport confortable.",
        "L itineraire inclut le sanctuaire des baleines et des cascades cachees.",
        "Une experience ideale pour les amoureux de nature authentique."
      ]
    },
    faqs: {
      es: [
        {
          q: "El transporte esta incluido desde Punta Cana?",
          a: "Si, incluye ida y vuelta desde los hoteles de la zona."
        }
      ],
      en: [
        {
          q: "Is transport included from Punta Cana?",
          a: "Yes, it includes round-trip transport from local hotels."
        }
      ],
      fr: [
        {
          q: "Le transport depuis Punta Cana est-il inclus?",
          a: "Oui, aller-retour depuis les hotels locaux."
        }
      ]
    },
    ctas: {
      es: ["Confirmar salida", "Reservar tour"],
      en: ["Confirm departure", "Book tour"],
      fr: ["Confirmer le depart", "Reserver le tour"]
    }
  },
  {
    slug: "samana-vip-ballenas-y-escape-a-la-isla",
    clusterId: "vip",
    titles: {
      es: "Samana VIP: ballenas y escape a la isla",
      en: "Samana VIP: Private-Style Whale Watching and Island Escape",
      fr: "Samana VIP: baleines et echappee sur l ile"
    },
    heroSubtitles: {
      es: "Una experiencia premium con ritmo mas calmado y organizado.",
      en: "A premium experience with a calmer, organized pace.",
      fr: "Une experience premium avec un rythme calme et organise."
    },
    metaDescriptions: {
      es: "Opcion VIP para ver ballenas, cascadas y Cayo Levantado con servicio mas personalizado.",
      en: "VIP option for whale watching, waterfalls, and Cayo Levantado with more personalized service.",
      fr: "Option VIP pour baleines, cascades et Cayo Levantado avec service plus personnalise."
    },
    bodyBlocks: {
      es: [
        "Ideal si buscas una salida con enfoque mas exclusivo.",
        "La ruta mantiene los puntos clave con una atencion mas cercana.",
        "Perfecto para parejas o grupos pequenos."
      ],
      en: [
        "Ideal if you want a more exclusive style of tour.",
        "The route keeps the key stops with closer attention.",
        "Perfect for couples or small groups."
      ],
      fr: [
        "Ideal si vous voulez une sortie plus exclusive.",
        "L itineraire garde les points cles avec une attention plus proche.",
        "Parfait pour couples ou petits groupes."
      ]
    },
    faqs: {
      es: [
        {
          q: "La opcion VIP incluye los mismos puntos?",
          a: "Si, incluye ballenas, cascada y Cayo Levantado."
        }
      ],
      en: [
        {
          q: "Does the VIP option include the same stops?",
          a: "Yes, it includes whales, waterfall, and Cayo Levantado."
        }
      ],
      fr: [
        {
          q: "L option VIP inclut-elle les memes arrets?",
          a: "Oui, baleines, cascade et Cayo Levantado sont inclus."
        }
      ]
    },
    ctas: {
      es: ["Reservar VIP", "Ver opcion premium"],
      en: ["Book VIP", "View premium option"],
      fr: ["Reserver VIP", "Voir option premium"]
    }
  },
  {
    slug: "santuario-de-ballenas-y-cascada-el-limon-en-samana",
    clusterId: "whales",
    titles: {
      es: "Santuario de ballenas y Cascada El Limon en Samana",
      en: "Whale Sanctuary & El Limon Falls: A Journey into Samana",
      fr: "Sanctuaire des baleines et cascade El Limon a Samana"
    },
    heroSubtitles: {
      es: "Una ruta natural con mar, selva y cascadas en el mismo dia.",
      en: "A natural route with ocean, rainforest, and waterfalls in one day.",
      fr: "Un itineraire nature avec mer, foret et cascades en une journee."
    },
    metaDescriptions: {
      es: "Ruta a Samana con santuario de ballenas, cascada El Limon y visita a la isla.",
      en: "Samana route with whale sanctuary, El Limon waterfall, and island visit.",
      fr: "Itineraire Samana avec sanctuaire des baleines, cascade El Limon et visite de l ile."
    },
    bodyBlocks: {
      es: [
        "El santuario de ballenas es el punto mas esperado del tour.",
        "La cascada aporta aventura y paisaje tropical unico.",
        "Se completa con tiempo de playa en Cayo Levantado."
      ],
      en: [
        "The whale sanctuary is the most anticipated part of the tour.",
        "The waterfall adds adventure and unique tropical scenery.",
        "It finishes with beach time at Cayo Levantado."
      ],
      fr: [
        "Le sanctuaire des baleines est le moment le plus attendu.",
        "La cascade apporte aventure et paysage tropical unique.",
        "La journee se termine par du temps de plage a Cayo Levantado."
      ]
    },
    faqs: {
      es: [
        {
          q: "La salida depende del clima?",
          a: "Si, la seguridad maritima se confirma antes de navegar."
        }
      ],
      en: [
        {
          q: "Does the departure depend on weather?",
          a: "Yes, marine safety is confirmed before sailing."
        }
      ],
      fr: [
        {
          q: "Le depart depend-il de la meteo?",
          a: "Oui, la securite maritime est verifiee avant de naviguer."
        }
      ]
    },
    ctas: {
      es: ["Ver santuario", "Reservar salida"],
      en: ["See the sanctuary", "Book the trip"],
      fr: ["Voir le sanctuaire", "Reserver la sortie"]
    }
  },
  {
    slug: "espectaculo-natural-ballenas-y-cayo-levantado-full-day",
    clusterId: "nature",
    titles: {
      es: "Espectaculo natural: ballenas y Cayo Levantado full day",
      en: "Nature's Spectacle: Humpback Whales & Cayo Levantado Full-Day Tour",
      fr: "Spectacle naturel: baleines et Cayo Levantado full day"
    },
    heroSubtitles: {
      es: "Naturaleza pura con tiempo de mar y playa en el mismo recorrido.",
      en: "Pure nature with ocean and beach time in the same journey.",
      fr: "Nature pure avec mer et plage dans la meme journee."
    },
    metaDescriptions: {
      es: "Tour de dia completo con avistamiento de ballenas y relax en Cayo Levantado.",
      en: "Full-day tour with whale watching and relaxation at Cayo Levantado.",
      fr: "Tour journee complete avec observation des baleines et detente a Cayo Levantado."
    },
    bodyBlocks: {
      es: [
        "Samana es el escenario perfecto para ballenas y playas famosas.",
        "La ruta permite disfrutar el mar y luego descansar en la isla.",
        "Una opcion ideal para fotos y momentos memorables."
      ],
      en: [
        "Samana is the perfect stage for whales and famous beaches.",
        "The route lets you enjoy the ocean and then relax on the island.",
        "An ideal option for photos and memorable moments."
      ],
      fr: [
        "Samana est le decor ideal pour baleines et plages celebres.",
        "L itineraire permet de profiter de la mer puis de se detendre sur l ile.",
        "Une option ideale pour photos et moments memorables."
      ]
    },
    faqs: {
      es: [
        {
          q: "Cuanto tiempo dura el tour completo?",
          a: "Es una experiencia de dia completo con varias paradas."
        }
      ],
      en: [
        {
          q: "How long is the full tour?",
          a: "It is a full-day experience with multiple stops."
        }
      ],
      fr: [
        {
          q: "Combien de temps dure le tour complet?",
          a: "C est une experience journee complete avec plusieurs arrets."
        }
      ]
    },
    ctas: {
      es: ["Ver tour full day", "Reservar ahora"],
      en: ["See full-day tour", "Book now"],
      fr: ["Voir le tour full day", "Reserver maintenant"]
    }
  },
  {
    slug: "samana-discovery-montanas-cascadas-y-safari-de-ballenas",
    clusterId: "explorer",
    titles: {
      es: "Samana Discovery: montanas, cascadas y safari de ballenas",
      en: "Samana Discovery: Mountains, Waterfalls, and Whale Watching Safari",
      fr: "Samana Discovery: montagnes, cascades et safari de baleines"
    },
    heroSubtitles: {
      es: "Un dia de exploracion con paisaje, mar y naturaleza tropical.",
      en: "A day of exploration with scenery, ocean, and tropical nature.",
      fr: "Une journee d exploration avec paysages, mer et nature tropicale."
    },
    metaDescriptions: {
      es: "Ruta discovery con montanas, cascadas y ballenas en Samana desde Punta Cana.",
      en: "Discovery route with mountains, waterfalls, and whales in Samana from Punta Cana.",
      fr: "Itineraire discovery avec montagnes, cascades et baleines a Samana depuis Punta Cana."
    },
    bodyBlocks: {
      es: [
        "El paisaje cambia entre montanas, selva y costa.",
        "El safari de ballenas es el momento estrella del dia.",
        "Una excursion completa para viajeros curiosos."
      ],
      en: [
        "The scenery changes between mountains, rainforest, and coast.",
        "The whale safari is the star moment of the day.",
        "A complete excursion for curious travelers."
      ],
      fr: [
        "Les paysages alternent montagnes, foret et littoral.",
        "Le safari des baleines est le moment phare de la journee.",
        "Une excursion complete pour voyageurs curieux."
      ]
    },
    faqs: {
      es: [
        {
          q: "Se visita la cascada en esta ruta?",
          a: "Si, la cascada El Limon esta incluida."
        }
      ],
      en: [
        {
          q: "Is the waterfall included in this route?",
          a: "Yes, El Limon waterfall is included."
        }
      ],
      fr: [
        {
          q: "La cascade est-elle incluse?",
          a: "Oui, la cascade El Limon est incluse."
        }
      ]
    },
    ctas: {
      es: ["Descubrir Samana", "Reservar cupo"],
      en: ["Discover Samana", "Reserve spot"],
      fr: ["Decouvrir Samana", "Reserver"]
    }
  },
  {
    slug: "escape-a-samana-ballenas-caballos-y-aguas-azules",
    clusterId: "escape",
    titles: {
      es: "Escape a Samana: ballenas, caballos y aguas azules",
      en: "Escape to Samana: Whales, Horses, and the Blue Waters of Cayo Levantado",
      fr: "Evasion a Samana: baleines, chevaux et eaux bleues de Cayo Levantado"
    },
    heroSubtitles: {
      es: "Una salida con mar, naturaleza y un cierre en playa cristalina.",
      en: "A journey with ocean, nature, and a finish at crystal-clear beaches.",
      fr: "Un voyage entre mer, nature et plage aux eaux claires."
    },
    metaDescriptions: {
      es: "Tour de escape a Samana con ballenas, Cascada El Limon y playa en Cayo Levantado.",
      en: "Escape tour to Samana with whales, El Limon waterfall, and Cayo Levantado beach.",
      fr: "Tour evasions a Samana avec baleines, cascade El Limon et plage a Cayo Levantado."
    },
    bodyBlocks: {
      es: [
        "Inicias con avistamiento de ballenas en la bahia.",
        "La cascada suma aventura antes del descanso en la isla.",
        "Perfecto para desconectarte un dia completo."
      ],
      en: [
        "You start with whale watching in the bay.",
        "The waterfall adds adventure before relaxing on the island.",
        "Perfect to disconnect for a full day."
      ],
      fr: [
        "Vous commencez par l observation des baleines dans la baie.",
        "La cascade ajoute l aventure avant la detente sur l ile.",
        "Parfait pour deconnecter pendant une journee."
      ]
    },
    faqs: {
      es: [
        {
          q: "La ruta incluye tiempo de playa?",
          a: "Si, hay tiempo dedicado en Cayo Levantado."
        }
      ],
      en: [
        {
          q: "Is beach time included?",
          a: "Yes, dedicated time at Cayo Levantado is included."
        }
      ],
      fr: [
        {
          q: "Y a-t-il du temps de plage?",
          a: "Oui, du temps est prevu a Cayo Levantado."
        }
      ]
    },
    ctas: {
      es: ["Ver escape a Samana", "Reservar ahora"],
      en: ["See Samana escape", "Book now"],
      fr: ["Voir l evasion Samana", "Reserver"]
    }
  },
  {
    slug: "samana-grand-tour-ballenas-cascada-y-bacardi-island",
    clusterId: "grand",
    titles: {
      es: "Samana Grand Tour: ballenas, cascada y Bacardi Island",
      en: "Samana Grand Tour: Whales, Waterfalls, and Bacardi Island Escape",
      fr: "Samana Grand Tour: baleines, cascade et Bacardi Island"
    },
    heroSubtitles: {
      es: "Un gran tour para vivir Samana de principio a fin.",
      en: "A grand tour to experience Samana from start to finish.",
      fr: "Un grand tour pour vivre Samana du debut a la fin."
    },
    metaDescriptions: {
      es: "Grand tour a Samana con ballenas, Cascada El Limon y Cayo Levantado incluido.",
      en: "Grand tour to Samana with whales, El Limon waterfall, and Cayo Levantado included.",
      fr: "Grand tour de Samana avec baleines, cascade El Limon et Cayo Levantado inclus."
    },
    bodyBlocks: {
      es: [
        "La experiencia completa para quienes quieren todo en un dia.",
        "Se combina mar, selva y playa en un mismo recorrido.",
        "Ideal para grupos que quieren un itinerario premium."
      ],
      en: [
        "The complete experience for travelers who want it all in a day.",
        "It combines ocean, rainforest, and beach in a single route.",
        "Ideal for groups who want a premium itinerary."
      ],
      fr: [
        "L experience complete pour ceux qui veulent tout en une journee.",
        "Elle combine mer, foret et plage dans un seul itineraire.",
        "Ideal pour les groupes qui veulent un parcours premium."
      ]
    },
    faqs: {
      es: [
        {
          q: "Es el tour mas completo de Samana?",
          a: "Si, incluye ballenas, cascada y la isla en un dia."
        }
      ],
      en: [
        {
          q: "Is this the most complete Samana tour?",
          a: "Yes, it includes whales, waterfall, and the island in one day."
        }
      ],
      fr: [
        {
          q: "Est-ce le tour le plus complet de Samana?",
          a: "Oui, il inclut baleines, cascade et ile en une journee."
        }
      ]
    },
    ctas: {
      es: ["Reservar Grand Tour", "Ver disponibilidad"],
      en: ["Book Grand Tour", "Check availability"],
      fr: ["Reserver Grand Tour", "Voir disponibilite"]
    }
  },
  {
    slug: "gigantes-del-caribe-ballenas-cayo-levantado-y-el-limon",
    clusterId: "giants",
    titles: {
      es: "Gigantes del Caribe: ballenas, Cayo Levantado y El Limon",
      en: "Caribbean Giants: Whale Watching + El Limon + Cayo Levantado",
      fr: "Geants des Caraibes: baleines, El Limon et Cayo Levantado"
    },
    heroSubtitles: {
      es: "Un dia para ver los gigantes del mar y cerrar en playa turquesa.",
      en: "A day to see ocean giants and finish on turquoise beaches.",
      fr: "Une journee pour voir les geants de la mer et finir sur une plage turquoise."
    },
    metaDescriptions: {
      es: "Ballenas jorobadas, Cascada El Limon y Cayo Levantado en un tour unico desde Punta Cana.",
      en: "Humpback whales, El Limon waterfall, and Cayo Levantado in one unique tour from Punta Cana.",
      fr: "Baleines a bosse, cascade El Limon et Cayo Levantado en un tour unique depuis Punta Cana."
    },
    bodyBlocks: {
      es: [
        "El avistamiento de ballenas es el momento mas impactante del dia.",
        "Luego se visita la cascada para una pausa en la naturaleza.",
        "La jornada termina en las aguas claras de la isla."
      ],
      en: [
        "Whale watching is the most impressive moment of the day.",
        "Then you visit the waterfall for a nature break.",
        "The day ends in the clear waters of the island."
      ],
      fr: [
        "L observation des baleines est le moment le plus impressionnant.",
        "Puis visite de la cascade pour une pause nature.",
        "La journee se termine dans les eaux claires de l ile."
      ]
    },
    faqs: {
      es: [
        {
          q: "Se puede ver ballenas en temporada?",
          a: "Si, en temporada se avistan con alta probabilidad."
        }
      ],
      en: [
        {
          q: "Can we see whales during season?",
          a: "Yes, in season sightings are highly likely."
        }
      ],
      fr: [
        {
          q: "Peut-on voir des baleines en saison?",
          a: "Oui, en saison les observations sont tres probables."
        }
      ]
    },
    ctas: {
      es: ["Ver gigantes del Caribe", "Reservar ahora"],
      en: ["See Caribbean giants", "Book now"],
      fr: ["Voir les geants des Caraibes", "Reserver"]
    }
  },
  {
    slug: "samana-dia-completo-ballenas-cabalgata-y-playa",
    clusterId: "full-day",
    titles: {
      es: "Samana dia completo: ballenas, cabalgata y playa",
      en: "Samana Ultimate Day Trip: Whales, Jungle Ride & Island Beach",
      fr: "Samana journee complete: baleines, balade et plage"
    },
    heroSubtitles: {
      es: "La combinacion ideal de aventura, naturaleza y relax.",
      en: "The ideal mix of adventure, nature, and relaxation.",
      fr: "Le mix ideal entre aventure, nature et detente."
    },
    metaDescriptions: {
      es: "Dia completo con avistamiento de ballenas, Cascada El Limon y playa en Cayo Levantado.",
      en: "Full-day trip with whale watching, El Limon waterfall, and Cayo Levantado beach.",
      fr: "Journee complete avec baleines, cascade El Limon et plage a Cayo Levantado."
    },
    bodyBlocks: {
      es: [
        "Un dia intenso con rutas claras y paradas bien marcadas.",
        "Incluye lo mejor de Samana con tiempo para cada punto.",
        "Perfecto para quienes buscan la experiencia completa."
      ],
      en: [
        "An intense day with clear routes and well-timed stops.",
        "It includes the best of Samana with time for each highlight.",
        "Perfect for travelers who want the complete experience."
      ],
      fr: [
        "Une journee intense avec itineraire clair et arrets bien cadences.",
        "Elle inclut le meilleur de Samana avec temps pour chaque point.",
        "Parfait pour ceux qui veulent l experience complete."
      ]
    },
    faqs: {
      es: [
        {
          q: "Se puede combinar con otros tours?",
          a: "Por la duracion completa, se recomienda dedicar el dia solo a este tour."
        }
      ],
      en: [
        {
          q: "Can it be combined with other tours?",
          a: "Because it is full-day, it is best to dedicate the day to this tour."
        }
      ],
      fr: [
        {
          q: "Peut-on combiner avec d autres tours?",
          a: "Vu la duree, il est conseille de consacrer la journee a ce tour."
        }
      ]
    },
    ctas: {
      es: ["Reservar dia completo", "Ver cupos"],
      en: ["Book full day", "See availability"],
      fr: ["Reserver la journee", "Voir disponibilite"]
    }
  },
  {
    slug: "samana-ballenas-cascada-el-limon-expedicion-premium",
    clusterId: "premium",
    titles: {
      es: "Samana premium: ballenas y Cascada El Limon en una sola salida",
      en: "Whales & El Limon Waterfall: Premium Samana Expedition",
      fr: "Expedition premium: baleines et cascade El Limon"
    },
    heroSubtitles: {
      es: "Una salida premium que combina mar, selva y cascada.",
      en: "A premium outing that blends ocean, rainforest, and waterfall.",
      fr: "Une sortie premium qui combine mer, foret et cascade."
    },
    metaDescriptions: {
      es: "Expedicion premium a Samana con ballenas, Cascada El Limon y servicio organizado.",
      en: "Premium Samana expedition with whales, El Limon waterfall, and organized service.",
      fr: "Expedition premium a Samana avec baleines, cascade El Limon et service organise."
    },
    bodyBlocks: {
      es: [
        "Ruta premium para quienes buscan una experiencia bien cuidada.",
        "Incluye ballenas y cascada con tiempos controlados.",
        "Perfecto para viajeros que valoran calidad y organizacion."
      ],
      en: [
        "Premium route for travelers who want a well-curated experience.",
        "Includes whales and waterfall with controlled timing.",
        "Perfect for travelers who value quality and organization."
      ],
      fr: [
        "Itineraire premium pour ceux qui veulent une experience soignee.",
        "Inclut baleines et cascade avec horaires controles.",
        "Parfait pour les voyageurs qui valorisent qualite et organisation."
      ]
    },
    faqs: {
      es: [
        {
          q: "La expedicion premium incluye los mismos puntos?",
          a: "Si, incluye ballenas, cascada y Cayo Levantado."
        }
      ],
      en: [
        {
          q: "Does the premium expedition include the same stops?",
          a: "Yes, it includes whales, waterfall, and Cayo Levantado."
        }
      ],
      fr: [
        {
          q: "L expedition premium inclut-elle les memes arrets?",
          a: "Oui, elle inclut baleines, cascade et Cayo Levantado."
        }
      ]
    },
    ctas: {
      es: ["Reservar expedicion premium", "Ver disponibilidad"],
      en: ["Book premium expedition", "Check availability"],
      fr: ["Reserver expedition premium", "Voir disponibilite"]
    }
  }
];
