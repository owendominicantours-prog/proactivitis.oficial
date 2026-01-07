import type { Locale } from "@/lib/translations";

export type SantoDomingoFaq = {
  q: string;
  a: string;
};

export type SantoDomingoVariant = {
  slug: string;
  clusterId: string;
  titles: Record<Locale, string>;
  heroSubtitles: Record<Locale, string>;
  metaDescriptions: Record<Locale, string>;
  bodyBlocks: Record<Locale, string[]>;
  faqs: Record<Locale, SantoDomingoFaq[]>;
  ctas: Record<Locale, string[]>;
};

export const SANTO_DOMINGO_BASE_TOUR = {
  slug: "excursion-de-un-dia-a-santo-domingo-desde-punta-cana",
  inclusions: {
    es: [
      "Bus de lujo con aire acondicionado",
      "Guia bilingue oficial",
      "Traslado directo por la Autovia del Este",
      "Paradas historicas y culturales",
      "Almuerzo tipico dominicano"
    ],
    en: [
      "Luxury coach with air conditioning",
      "Official bilingual guide",
      "Direct ride via Autovia del Este",
      "Historic and cultural stops",
      "Traditional Dominican lunch"
    ],
    fr: [
      "Bus premium avec climatisation",
      "Guide bilingue officiel",
      "Trajet direct par l'Autovia del Este",
      "Arrets historiques et culturels",
      "Dejeuner dominicain typique"
    ]
  } as Record<Locale, string[]>,
  highlights: {
    es: [
      "Parque Nacional Los Tres Ojos",
      "Zona Colonial y Calle Las Damas",
      "Faro a Colon",
      "Palacio Nacional",
      "Malecon de Santo Domingo"
    ],
    en: [
      "Los Tres Ojos National Park",
      "Colonial Zone and Las Damas Street",
      "Columbus Lighthouse",
      "National Palace",
      "Santo Domingo Malecon"
    ],
    fr: [
      "Parc national Los Tres Ojos",
      "Zone coloniale et Calle Las Damas",
      "Faro a Colon",
      "Palais national",
      "Malecon de Saint-Domingue"
    ]
  } as Record<Locale, string[]>
};

export const SANTO_DOMINGO_VARIANTS: SantoDomingoVariant[] = [
  {
    slug: "santo-domingo-historia-001",
    clusterId: "historica",
    titles: {
      es: "Viaje al origen de America: Santo Domingo historico en un dia",
      en: "Origin of the Americas: Santo Domingo history day trip",
      fr: "Origine des Ameriques: journee historique a Saint Domingue"
    },
    heroSubtitles: {
      es: "Sal del resort y conoce la primera ciudad europea en America con guia experto.",
      en: "Leave the resort and explore the first European city in the Americas with an expert guide.",
      fr: "Sortez du resort et explorez la premiere ville europeenne des Ameriques avec un guide expert."
    },
    metaDescriptions: {
      es: "Tour historico a Santo Domingo desde Punta Cana: Zona Colonial, museos y arquitectura en un dia.",
      en: "Historic Santo Domingo tour from Punta Cana: Colonial Zone, museums, and architecture in one day.",
      fr: "Tour historique a Saint Domingue depuis Punta Cana: Zone coloniale, musees et architecture en une journee."
    },
    bodyBlocks: {
      es: [
        "Este tour se enfoca en el legado colonial y los primeros capitulos de America.",
        "Recorres la Zona Colonial con paradas claves como Calle Las Damas y el Alcazar.",
        "Todo esta organizado para que disfrutes historia real sin perder tiempo."
      ],
      en: [
        "This tour focuses on colonial heritage and the first chapters of the Americas.",
        "Walk through the Colonial Zone with key stops like Las Damas Street and the Alcazar.",
        "Everything is planned so you get real history without wasting time."
      ],
      fr: [
        "Cette excursion met en avant l heritage colonial et les premiers chapitres des Ameriques.",
        "Vous visitez la Zone coloniale avec des arrets cles comme Calle Las Damas et l Alcazar.",
        "Tout est organise pour vivre l histoire sans perdre de temps."
      ]
    },
    faqs: {
      es: [
        {
          q: "Incluye guia historico en la Zona Colonial?",
          a: "Si, el guia oficial acompana la visita y explica cada punto clave."
        }
      ],
      en: [
        {
          q: "Is a historical guide included in the Colonial Zone?",
          a: "Yes, the official guide leads the visit and explains each key point."
        }
      ],
      fr: [
        {
          q: "Le guide historique est-il inclus dans la Zone coloniale?",
          a: "Oui, le guide officiel accompagne la visite et explique chaque point cle."
        }
      ]
    },
    ctas: {
      es: ["Reservar visita historica", "Ver disponibilidad"],
      en: ["Book historical visit", "Check availability"],
      fr: ["Reserver la visite historique", "Voir disponibilite"]
    }
  },
  {
    slug: "santo-domingo-historia-002",
    clusterId: "historica",
    titles: {
      es: "Zona Colonial y Faro a Colon: historia viva desde Punta Cana",
      en: "Colonial Zone and Columbus Lighthouse: history from Punta Cana",
      fr: "Zone coloniale et Faro a Colon: histoire depuis Punta Cana"
    },
    heroSubtitles: {
      es: "Museos, plazas y monumentos en el corazon historico de la capital.",
      en: "Museums, plazas, and monuments in the historic heart of the capital.",
      fr: "Musees, places et monuments au coeur historique de la capitale."
    },
    metaDescriptions: {
      es: "Explora la Zona Colonial y el Faro a Colon en un tour completo con transporte desde Punta Cana.",
      en: "Explore the Colonial Zone and Columbus Lighthouse with transport from Punta Cana.",
      fr: "Explorez la Zone coloniale et le Faro a Colon avec transport depuis Punta Cana."
    },
    bodyBlocks: {
      es: [
        "Esta ruta combina lo mas iconico de la ciudad con monumentos simbolicos.",
        "El Faro a Colon y los edificios coloniales cuentan la historia de la isla.",
        "Vas con transporte directo y tiempos claros para disfrutar sin prisa."
      ],
      en: [
        "This route combines the most iconic landmarks with symbolic monuments.",
        "The Columbus Lighthouse and colonial buildings tell the island story.",
        "You get direct transport and clear timing to enjoy it without rushing."
      ],
      fr: [
        "Cet itineraire combine les sites les plus iconiques et des monuments symboliques.",
        "Le Faro a Colon et les batiments coloniaux racontent l histoire de l ile.",
        "Transport direct et horaires clairs pour en profiter sans stress."
      ]
    },
    faqs: {
      es: [
        {
          q: "Se visita el Faro a Colon por dentro?",
          a: "La visita incluye paradas fotografias y vistas exteriores segun la ruta del dia."
        }
      ],
      en: [
        {
          q: "Do we go inside the Columbus Lighthouse?",
          a: "The visit includes photo stops and exterior views depending on the day route."
        }
      ],
      fr: [
        {
          q: "Visite-t-on l interieur du Faro a Colon?",
          a: "La visite comprend des arrets photo et des vues exterieures selon la route du jour."
        }
      ]
    },
    ctas: {
      es: ["Reserva la ruta colonial", "Confirmar cupo"],
      en: ["Book the colonial route", "Confirm spot"],
      fr: ["Reserver la route coloniale", "Confirmer la place"]
    }
  },
  {
    slug: "santo-domingo-historia-003",
    clusterId: "historica",
    titles: {
      es: "Catedral, Alcazar y Calle Las Damas en un solo dia",
      en: "Cathedral, Alcazar, and Las Damas Street in one day",
      fr: "Cathedrale, Alcazar et Calle Las Damas en une journee"
    },
    heroSubtitles: {
      es: "Una inmersion directa en la herencia colonial con guia bilingue.",
      en: "A direct immersion into colonial heritage with a bilingual guide.",
      fr: "Une immersion directe dans l heritage colonial avec guide bilingue."
    },
    metaDescriptions: {
      es: "Tour cultural con los edificios mas antiguos del continente en Santo Domingo.",
      en: "Cultural tour with the oldest buildings of the continent in Santo Domingo.",
      fr: "Tour culturel avec les batiments les plus anciens du continent a Saint Domingue."
    },
    bodyBlocks: {
      es: [
        "Recorres la Catedral, el Alcazar y las calles mas antiguas.",
        "Cada parada explica el origen de la ciudad y su impacto historico.",
        "Ideal para viajeros que valoran arquitectura y patrimonio real."
      ],
      en: [
        "Visit the Cathedral, the Alcazar, and the oldest streets.",
        "Each stop explains the city origin and historical impact.",
        "Ideal for travelers who value architecture and true heritage."
      ],
      fr: [
        "Visitez la Cathedrale, l Alcazar et les rues les plus anciennes.",
        "Chaque arret explique l origine de la ville et son impact historique.",
        "Ideal pour les voyageurs qui aiment l architecture et le patrimoine."
      ]
    },
    faqs: {
      es: [
        {
          q: "Este tour es para gente interesada en historia?",
          a: "Si, el enfoque es cultural y cada punto tiene contexto historico."
        }
      ],
      en: [
        {
          q: "Is this tour for history lovers?",
          a: "Yes, the focus is cultural and each stop has historical context."
        }
      ],
      fr: [
        {
          q: "Ce tour est-il pour les passionnes d histoire?",
          a: "Oui, l approche est culturelle et chaque arret a un contexte historique."
        }
      ]
    },
    ctas: {
      es: ["Agendar tour cultural", "Ver horarios"],
      en: ["Schedule cultural tour", "See times"],
      fr: ["Programmer le tour culturel", "Voir les horaires"]
    }
  },
  {
    slug: "santo-domingo-historia-004",
    clusterId: "historica",
    titles: {
      es: "Patrimonio UNESCO en Santo Domingo: excursion desde Punta Cana",
      en: "UNESCO heritage in Santo Domingo: day trip from Punta Cana",
      fr: "Patrimoine UNESCO a Saint Domingue: excursion depuis Punta Cana"
    },
    heroSubtitles: {
      es: "Una visita a la ciudad primada con narrativa historica y organizada.",
      en: "A visit to the first city with an organized historical narrative.",
      fr: "Une visite de la premiere ville avec un recit historique organise."
    },
    metaDescriptions: {
      es: "Descubre la primera ciudad del Nuevo Mundo con rutas UNESCO y guia bilingue.",
      en: "Discover the first city of the New World with UNESCO routes and a bilingual guide.",
      fr: "Decouvrez la premiere ville du Nouveau Monde avec routes UNESCO et guide bilingue."
    },
    bodyBlocks: {
      es: [
        "La Zona Colonial es Patrimonio de la Humanidad y el centro del recorrido.",
        "Las paradas incluyen monumentos y plazas con siglos de historia.",
        "Transporte comodo para una experiencia cultural sin complicaciones."
      ],
      en: [
        "The Colonial Zone is a UNESCO site and the core of the route.",
        "Stops include monuments and plazas with centuries of history.",
        "Comfortable transport for a cultural experience without hassle."
      ],
      fr: [
        "La Zone coloniale est un site UNESCO et le coeur du parcours.",
        "Les arrets incluent monuments et places avec des siecles d histoire.",
        "Transport confortable pour une experience culturelle sans souci."
      ]
    },
    faqs: {
      es: [
        {
          q: "Se visita la Zona Colonial en profundidad?",
          a: "Si, el recorrido incluye los puntos mas representativos del casco historico."
        }
      ],
      en: [
        {
          q: "Do we explore the Colonial Zone deeply?",
          a: "Yes, the route includes the most representative historic points."
        }
      ],
      fr: [
        {
          q: "Explore-t-on la Zone coloniale en profondeur?",
          a: "Oui, l itineraire inclut les points historiques les plus representatifs."
        }
      ]
    },
    ctas: {
      es: ["Ver ruta UNESCO", "Reservar"],
      en: ["See UNESCO route", "Book now"],
      fr: ["Voir la route UNESCO", "Reserver"]
    }
  },
  {
    slug: "santo-domingo-explora-005",
    clusterId: "exploradora",
    titles: {
      es: "Los Tres Ojos y cenotes de Santo Domingo en un dia",
      en: "Los Tres Ojos and cenotes of Santo Domingo in one day",
      fr: "Los Tres Ojos et cenotes de Saint Domingue en une journee"
    },
    heroSubtitles: {
      es: "Naturaleza subterranea, lagos azules y un recorrido bien guiado.",
      en: "Underground nature, blue lakes, and a well guided route.",
      fr: "Nature souterraine, lacs bleus et itineraire bien guide."
    },
    metaDescriptions: {
      es: "Explora Los Tres Ojos y la Zona Colonial en una excursion completa desde Punta Cana.",
      en: "Explore Los Tres Ojos and the Colonial Zone on a full day trip from Punta Cana.",
      fr: "Explorez Los Tres Ojos et la Zone coloniale lors d une excursion depuis Punta Cana."
    },
    bodyBlocks: {
      es: [
        "Los Tres Ojos es una joya natural con lagos subterraneos.",
        "La ruta combina naturaleza y ciudad en un solo dia organizado.",
        "Ideal para quienes buscan paisaje y patrimonio juntos."
      ],
      en: [
        "Los Tres Ojos is a natural gem with underground lakes.",
        "The route mixes nature and city in a single organized day.",
        "Perfect for travelers who want scenery and heritage together."
      ],
      fr: [
        "Los Tres Ojos est un joyau naturel avec des lacs souterrains.",
        "L itineraire combine nature et ville en une journee organisee.",
        "Parfait pour ceux qui veulent paysages et patrimoine."
      ]
    },
    faqs: {
      es: [
        {
          q: "Cuanto tiempo se pasa en Los Tres Ojos?",
          a: "El tiempo depende del dia, pero se dedica una parada completa al parque."
        }
      ],
      en: [
        {
          q: "How long do we spend at Los Tres Ojos?",
          a: "Timing depends on the day, but a full stop is included at the park."
        }
      ],
      fr: [
        {
          q: "Combien de temps a Los Tres Ojos?",
          a: "La duree depend du jour, mais un arret complet est prevu."
        }
      ]
    },
    ctas: {
      es: ["Ver ruta natural", "Reservar cupo"],
      en: ["See nature route", "Reserve spot"],
      fr: ["Voir la route nature", "Reserver la place"]
    }
  },
  {
    slug: "santo-domingo-explora-006",
    clusterId: "exploradora",
    titles: {
      es: "Malecon y panoramicas urbanas: Santo Domingo desde Punta Cana",
      en: "Malecon and urban panoramas: Santo Domingo from Punta Cana",
      fr: "Malecon et panoramas urbains: Saint Domingue depuis Punta Cana"
    },
    heroSubtitles: {
      es: "Una mirada completa a la capital con vistas al Caribe.",
      en: "A complete view of the capital with Caribbean vistas.",
      fr: "Une vue complete de la capitale avec horizons caraibes."
    },
    metaDescriptions: {
      es: "Tour panoramico con Malecon, Palacio Nacional y paradas emblematicas.",
      en: "Panoramic tour with Malecon, National Palace, and iconic stops.",
      fr: "Tour panoramique avec Malecon, Palais national et arrets emblematiques."
    },
    bodyBlocks: {
      es: [
        "El Malecon ofrece el contraste perfecto entre ciudad y mar.",
        "Se suman paradas clave para fotos y contexto local.",
        "Un recorrido equilibrado entre paisaje urbano e historia."
      ],
      en: [
        "The Malecon offers the perfect contrast between city and sea.",
        "Key stops add photo moments and local context.",
        "A balanced route between urban scenery and history."
      ],
      fr: [
        "Le Malecon offre le contraste parfait entre ville et mer.",
        "Des arrets cles ajoutent photos et contexte local.",
        "Un parcours equilibre entre paysage urbain et histoire."
      ]
    },
    faqs: {
      es: [
        {
          q: "Hay tiempo para fotos en el Malecon?",
          a: "Si, la ruta incluye paradas cortas para disfrutar las vistas."
        }
      ],
      en: [
        {
          q: "Is there time for photos at the Malecon?",
          a: "Yes, the route includes short stops to enjoy the views."
        }
      ],
      fr: [
        {
          q: "Y a-t-il du temps pour des photos au Malecon?",
          a: "Oui, l itineraire inclut de courts arrets pour profiter des vues."
        }
      ]
    },
    ctas: {
      es: ["Ver panoramicas", "Confirmar salida"],
      en: ["View panoramas", "Confirm departure"],
      fr: ["Voir les panoramas", "Confirmer le depart"]
    }
  },
  {
    slug: "santo-domingo-explora-007",
    clusterId: "exploradora",
    titles: {
      es: "Naturaleza + monumentos: Los Tres Ojos y Faro a Colon",
      en: "Nature + monuments: Los Tres Ojos and Columbus Lighthouse",
      fr: "Nature + monuments: Los Tres Ojos et Faro a Colon"
    },
    heroSubtitles: {
      es: "Un mix perfecto entre paisajes naturales y arquitectura simbolica.",
      en: "A perfect mix of natural scenery and symbolic architecture.",
      fr: "Un mix parfait entre paysages naturels et architecture symbolique."
    },
    metaDescriptions: {
      es: "Excursion con naturaleza subterranea y monumentos iconicos en Santo Domingo.",
      en: "Day trip with underground nature and iconic monuments in Santo Domingo.",
      fr: "Excursion avec nature souterraine et monuments iconiques a Saint Domingue."
    },
    bodyBlocks: {
      es: [
        "Los Tres Ojos aporta naturaleza, el Faro a Colon aporta historia.",
        "La ruta integra puntos diferentes para una experiencia variada.",
        "Ideal si buscas algo mas que un simple city tour."
      ],
      en: [
        "Los Tres Ojos brings nature, the Columbus Lighthouse brings history.",
        "The route blends distinct spots for a varied experience.",
        "Ideal if you want more than a simple city tour."
      ],
      fr: [
        "Los Tres Ojos apporte la nature, le Faro a Colon apporte l histoire.",
        "L itineraire combine des lieux differents pour une experience variee.",
        "Ideal si vous voulez plus qu un simple city tour."
      ]
    },
    faqs: {
      es: [
        {
          q: "El tour incluye entradas a los parques?",
          a: "Las entradas se gestionan como parte de la logistica del dia."
        }
      ],
      en: [
        {
          q: "Are park tickets included?",
          a: "Tickets are managed as part of the day logistics."
        }
      ],
      fr: [
        {
          q: "Les billets des parcs sont-ils inclus?",
          a: "Les billets sont geres dans la logistique de la journee."
        }
      ]
    },
    ctas: {
      es: ["Quiero esta ruta", "Reservar ahora"],
      en: ["I want this route", "Book now"],
      fr: ["Je veux cette route", "Reserver maintenant"]
    }
  },
  {
    slug: "santo-domingo-explora-008",
    clusterId: "exploradora",
    titles: {
      es: "Ruta panoramica completa: capital, mar y parques naturales",
      en: "Full panoramic route: capital, sea, and nature parks",
      fr: "Route panoramique complete: capitale, mer et parcs naturels"
    },
    heroSubtitles: {
      es: "Un dia completo con vistas, historia y naturaleza.",
      en: "A full day with views, history, and nature.",
      fr: "Une journee complete avec vues, histoire et nature."
    },
    metaDescriptions: {
      es: "Itinerario completo con paradas urbanas y naturales en Santo Domingo.",
      en: "Complete itinerary with urban and natural stops in Santo Domingo.",
      fr: "Itineraire complet avec arrets urbains et naturels a Saint Domingue."
    },
    bodyBlocks: {
      es: [
        "La ruta conecta parques naturales con zonas historicas.",
        "Combina malecon, plazas y paisajes en un solo dia.",
        "Perfecto para viajeros que quieren variedad sin improvisar."
      ],
      en: [
        "The route connects natural parks with historic zones.",
        "It blends the malecon, plazas, and landscapes in one day.",
        "Perfect for travelers who want variety without improvising."
      ],
      fr: [
        "L itineraire relie parcs naturels et zones historiques.",
        "Il combine malecon, places et paysages en une journee.",
        "Parfait pour ceux qui veulent de la variete sans improviser."
      ]
    },
    faqs: {
      es: [
        {
          q: "Es un tour pesado por el tiempo de viaje?",
          a: "Se organiza para que el trayecto sea comodo y con paradas."
        }
      ],
      en: [
        {
          q: "Is it a long day because of travel time?",
          a: "It is organized so the ride is comfortable with planned stops."
        }
      ],
      fr: [
        {
          q: "La journee est-elle longue a cause du trajet?",
          a: "Le trajet est organise pour etre confortable avec des pauses."
        }
      ]
    },
    ctas: {
      es: ["Ver itinerario", "Reservar tour completo"],
      en: ["View itinerary", "Book full tour"],
      fr: ["Voir l itineraire", "Reserver le tour complet"]
    }
  },
  {
    slug: "santo-domingo-gastro-009",
    clusterId: "gastronomica",
    titles: {
      es: "Almuerzo tipico y cultura local en Santo Domingo",
      en: "Local lunch and culture in Santo Domingo",
      fr: "Dejeuner local et culture a Saint Domingue"
    },
    heroSubtitles: {
      es: "Historia por la manana y sabor dominicano al mediodia.",
      en: "History in the morning and Dominican flavor at midday.",
      fr: "Histoire le matin et saveurs dominicaines a midi."
    },
    metaDescriptions: {
      es: "Excursion con almuerzo tipico incluido y visita a la Zona Colonial.",
      en: "Day trip with traditional lunch included and Colonial Zone visit.",
      fr: "Excursion avec dejeuner traditionnel inclus et visite de la Zone coloniale."
    },
    bodyBlocks: {
      es: [
        "El tour incluye un almuerzo dominicano para recargar energias.",
        "Combina patrimonio, cultura y una pausa gastronomica real.",
        "Una opcion ideal para viajeros curiosos y foodies."
      ],
      en: [
        "The tour includes a Dominican lunch to recharge.",
        "It combines heritage, culture, and a true food break.",
        "Ideal for curious travelers and food lovers."
      ],
      fr: [
        "Le tour inclut un dejeuner dominicain pour reprendre des forces.",
        "Il combine patrimoine, culture et pause gourmande.",
        "Ideal pour les voyageurs curieux et gourmands."
      ]
    },
    faqs: {
      es: [
        {
          q: "El almuerzo esta incluido?",
          a: "Si, el almuerzo tipico forma parte del recorrido."
        }
      ],
      en: [
        {
          q: "Is lunch included?",
          a: "Yes, the traditional lunch is part of the tour."
        }
      ],
      fr: [
        {
          q: "Le dejeuner est-il inclus?",
          a: "Oui, le dejeuner traditionnel fait partie du tour."
        }
      ]
    },
    ctas: {
      es: ["Reservar con almuerzo", "Ver disponibilidad"],
      en: ["Book with lunch", "Check availability"],
      fr: ["Reserver avec dejeuner", "Voir disponibilite"]
    }
  },
  {
    slug: "santo-domingo-gastro-010",
    clusterId: "gastronomica",
    titles: {
      es: "Compras culturales en la Zona Colonial: ambar y larimar",
      en: "Cultural shopping in the Colonial Zone: amber and larimar",
      fr: "Shopping culturel dans la Zone coloniale: ambre et larimar"
    },
    heroSubtitles: {
      es: "Tiempo para artesanias y recuerdos autenticos sin presion.",
      en: "Time for authentic crafts and souvenirs without pressure.",
      fr: "Du temps pour artisanat et souvenirs authentiques sans pression."
    },
    metaDescriptions: {
      es: "Ruta con paradas para compras culturales y patrimonio en Santo Domingo.",
      en: "Route with cultural shopping stops and heritage in Santo Domingo.",
      fr: "Itineraire avec arrets shopping culturel et patrimoine a Saint Domingue."
    },
    bodyBlocks: {
      es: [
        "La Zona Colonial ofrece tiendas de ambar y larimar.",
        "El tour da tiempo para comprar con calma y guia local.",
        "Ideal si quieres llevar recuerdos con historia."
      ],
      en: [
        "The Colonial Zone offers amber and larimar shops.",
        "The tour allows time to shop calmly with a local guide.",
        "Ideal if you want souvenirs with history."
      ],
      fr: [
        "La Zone coloniale propose des boutiques d ambre et de larimar.",
        "Le tour laisse du temps pour acheter calmement avec un guide local.",
        "Ideal si vous voulez des souvenirs avec histoire."
      ]
    },
    faqs: {
      es: [
        {
          q: "Hay tiempo para compras durante el tour?",
          a: "Si, se incluye una parada para compras culturales."
        }
      ],
      en: [
        {
          q: "Is there time for shopping during the tour?",
          a: "Yes, a cultural shopping stop is included."
        }
      ],
      fr: [
        {
          q: "Y a-t-il du temps pour le shopping?",
          a: "Oui, un arret shopping culturel est prevu."
        }
      ]
    },
    ctas: {
      es: ["Ver ruta de compras", "Reservar ahora"],
      en: ["See shopping route", "Book now"],
      fr: ["Voir la route shopping", "Reserver"]
    }
  },
  {
    slug: "santo-domingo-gastro-011",
    clusterId: "gastronomica",
    titles: {
      es: "Sabores de la capital: tour historico con pausa gastronomica",
      en: "Capital flavors: historic tour with a food stop",
      fr: "Saveurs de la capitale: tour historique avec pause gourmande"
    },
    heroSubtitles: {
      es: "Descubre la ciudad y disfruta de una comida local bien servida.",
      en: "Discover the city and enjoy a well served local meal.",
      fr: "Decouvrez la ville et profitez d un repas local bien servi."
    },
    metaDescriptions: {
      es: "Una mezcla de cultura y comida dominicana en un tour guiado.",
      en: "A mix of culture and Dominican food in a guided tour.",
      fr: "Un melange de culture et cuisine dominicaine dans un tour guide."
    },
    bodyBlocks: {
      es: [
        "La comida es parte de la experiencia cultural del dia.",
        "Visitas los lugares clave y luego disfrutas sabores locales.",
        "Una opcion completa para viajar con buen ritmo."
      ],
      en: [
        "Food is part of the cultural experience of the day.",
        "You visit key locations and then enjoy local flavors.",
        "A complete option for a well paced trip."
      ],
      fr: [
        "La nourriture fait partie de l experience culturelle de la journee.",
        "Vous visitez les lieux cles puis profitez des saveurs locales.",
        "Une option complete pour un voyage bien rythme."
      ]
    },
    faqs: {
      es: [
        {
          q: "La comida es dominicana?",
          a: "Si, el almuerzo es tipico y se sirve durante el recorrido."
        }
      ],
      en: [
        {
          q: "Is the food Dominican?",
          a: "Yes, the lunch is traditional and served during the tour."
        }
      ],
      fr: [
        {
          q: "Le repas est-il dominicain?",
          a: "Oui, le dejeuner est traditionnel et servi pendant le tour."
        }
      ]
    },
    ctas: {
      es: ["Reservar con comida", "Ver opciones"],
      en: ["Book with food", "View options"],
      fr: ["Reserver avec repas", "Voir options"]
    }
  },
  {
    slug: "santo-domingo-gastro-012",
    clusterId: "gastronomica",
    titles: {
      es: "Ruta cultural con pausa de compras y almuerzo local",
      en: "Cultural route with shopping stop and local lunch",
      fr: "Route culturelle avec shopping et dejeuner local"
    },
    heroSubtitles: {
      es: "Patrimonio, souvenirs y un almuerzo tipico en una sola excursion.",
      en: "Heritage, souvenirs, and a local lunch in one excursion.",
      fr: "Patrimoine, souvenirs et dejeuner local en une excursion."
    },
    metaDescriptions: {
      es: "Santo Domingo con compras culturales y almuerzo tipico, todo incluido.",
      en: "Santo Domingo with cultural shopping and traditional lunch, all included.",
      fr: "Saint Domingue avec shopping culturel et dejeuner traditionnel, tout inclus."
    },
    bodyBlocks: {
      es: [
        "El tour reserva tiempo para artesanias y recuerdos locales.",
        "Incluye almuerzo tipico para recargar antes de regresar.",
        "Una ruta pensada para disfrutar la ciudad con calma."
      ],
      en: [
        "The tour sets time for local crafts and souvenirs.",
        "It includes a traditional lunch before heading back.",
        "A route designed to enjoy the city at an easy pace."
      ],
      fr: [
        "Le tour prevoit du temps pour artisanat et souvenirs.",
        "Il inclut un dejeuner traditionnel avant le retour.",
        "Une route pensee pour profiter de la ville calmement."
      ]
    },
    faqs: {
      es: [
        {
          q: "Hay tiempo libre en la Zona Colonial?",
          a: "Si, la ruta incluye momentos para explorar con calma."
        }
      ],
      en: [
        {
          q: "Is there free time in the Colonial Zone?",
          a: "Yes, the route includes time to explore at ease."
        }
      ],
      fr: [
        {
          q: "Y a-t-il du temps libre dans la Zone coloniale?",
          a: "Oui, l itineraire inclut du temps pour explorer."
        }
      ]
    },
    ctas: {
      es: ["Ver ruta cultural", "Reservar ahora"],
      en: ["See cultural route", "Book now"],
      fr: ["Voir la route culturelle", "Reserver"]
    }
  },
  {
    slug: "santo-domingo-logistica-013",
    clusterId: "logistica",
    titles: {
      es: "Bus de lujo y guia oficial: Santo Domingo sin estres",
      en: "Luxury coach and official guide: Santo Domingo without stress",
      fr: "Bus premium et guide officiel: Saint Domingue sans stress"
    },
    heroSubtitles: {
      es: "Logistica clara, traslado directo y horarios confirmados.",
      en: "Clear logistics, direct transport, and confirmed schedules.",
      fr: "Logistique claire, transport direct et horaires confirmes."
    },
    metaDescriptions: {
      es: "Excursion organizada con bus comodo, guia bilingue y ruta directa.",
      en: "Organized day trip with comfortable coach, bilingual guide, and direct route.",
      fr: "Excursion organisee avec bus confortable, guide bilingue et trajet direct."
    },
    bodyBlocks: {
      es: [
        "El viaje largo se hace comodo con bus de lujo y aire acondicionado.",
        "Recogidas desde Uvero Alto, Macao, Bavaro y Cap Cana.",
        "Guia oficial y tiempos confirmados para evitar retrasos."
      ],
      en: [
        "The long ride is comfortable with a luxury coach and AC.",
        "Pickups from Uvero Alto, Macao, Bavaro, and Cap Cana.",
        "Official guide and confirmed timing to avoid delays."
      ],
      fr: [
        "Le long trajet est confortable avec un bus premium et climatisation.",
        "Pickups depuis Uvero Alto, Macao, Bavaro et Cap Cana.",
        "Guide officiel et horaires confirmes pour eviter les retards."
      ]
    },
    faqs: {
      es: [
        {
          q: "El traslado es directo por la Autovia del Este?",
          a: "Si, usamos la ruta directa para optimizar el tiempo."
        }
      ],
      en: [
        {
          q: "Is the transfer direct via Autovia del Este?",
          a: "Yes, we use the direct route to optimize time."
        }
      ],
      fr: [
        {
          q: "Le transfert est-il direct via l Autovia del Este?",
          a: "Oui, nous utilisons la route directe pour optimiser le temps."
        }
      ]
    },
    ctas: {
      es: ["Confirmar logistica", "Reservar ahora"],
      en: ["Confirm logistics", "Book now"],
      fr: ["Confirmer la logistique", "Reserver maintenant"]
    }
  },
  {
    slug: "santo-domingo-logistica-014",
    clusterId: "logistica",
    titles: {
      es: "Horarios claros y salida garantizada a Santo Domingo",
      en: "Clear schedules and guaranteed departure to Santo Domingo",
      fr: "Horaires clairs et depart garanti vers Saint Domingue"
    },
    heroSubtitles: {
      es: "El plan ideal si quieres saber tiempos exactos y regreso seguro.",
      en: "Ideal if you want exact timing and a safe return.",
      fr: "Ideal si vous voulez des horaires exacts et un retour sur."
    },
    metaDescriptions: {
      es: "Tour con horarios definidos, recogida por zonas y regreso el mismo dia.",
      en: "Tour with defined schedule, zone pickups, and same day return.",
      fr: "Tour avec horaires definis, pickups par zones et retour le meme jour."
    },
    bodyBlocks: {
      es: [
        "Se confirma hora de recogida por zona despues de reservar.",
        "Regreso garantizado al hotel el mismo dia.",
        "Un tour pensado para viajeros que valoran orden y puntualidad."
      ],
      en: [
        "Pickup time is confirmed by zone after booking.",
        "Guaranteed return to the hotel the same day.",
        "Designed for travelers who value order and punctuality."
      ],
      fr: [
        "L heure de pickup est confirmee par zone apres reservation.",
        "Retour garanti a l hotel le meme jour.",
        "Concu pour les voyageurs qui aiment l ordre et la ponctualite."
      ]
    },
    faqs: {
      es: [
        {
          q: "Se confirma la hora antes del dia del tour?",
          a: "Si, la confirmacion se envia tras la reserva."
        }
      ],
      en: [
        {
          q: "Is the pickup time confirmed before the tour day?",
          a: "Yes, confirmation is sent after booking."
        }
      ],
      fr: [
        {
          q: "L heure de pickup est-elle confirmee avant le tour?",
          a: "Oui, la confirmation est envoyee apres reservation."
        }
      ]
    },
    ctas: {
      es: ["Ver horarios", "Asegurar cupo"],
      en: ["See schedules", "Secure spot"],
      fr: ["Voir les horaires", "Assurer la place"]
    }
  },
  {
    slug: "santo-domingo-logistica-015",
    clusterId: "logistica",
    titles: {
      es: "Traslado directo Punta Cana - Santo Domingo con guia bilingue",
      en: "Direct transfer Punta Cana - Santo Domingo with bilingual guide",
      fr: "Transfert direct Punta Cana - Saint Domingue avec guide bilingue"
    },
    heroSubtitles: {
      es: "Comodidad y organizacion para un viaje largo bien resuelto.",
      en: "Comfort and organization for a long trip done right.",
      fr: "Confort et organisation pour un long trajet bien gere."
    },
    metaDescriptions: {
      es: "Viaje directo por Autovia del Este, guia bilingue y paradas clave en la capital.",
      en: "Direct ride via Autovia del Este, bilingual guide, and key stops in the capital.",
      fr: "Trajet direct via Autovia del Este, guide bilingue et arrets cles dans la capitale."
    },
    bodyBlocks: {
      es: [
        "La logistica esta pensada para un trayecto largo sin complicaciones.",
        "Incluye guia bilingue, transporte directo y paradas historicas.",
        "Un tour confiable para conocer la capital en un solo dia."
      ],
      en: [
        "The logistics are designed for a long ride without complications.",
        "Includes a bilingual guide, direct transport, and historic stops.",
        "A reliable tour to see the capital in a single day."
      ],
      fr: [
        "La logistique est pensee pour un long trajet sans complications.",
        "Inclut un guide bilingue, transport direct et arrets historiques.",
        "Un tour fiable pour visiter la capitale en une journee."
      ]
    },
    faqs: {
      es: [
        {
          q: "Se visita el Palacio Nacional?",
          a: "Se hacen paradas clave segun la ruta del dia, incluyendo vistas del Palacio."
        }
      ],
      en: [
        {
          q: "Do we visit the National Palace?",
          a: "Key stops depend on the day route, including views of the Palace."
        }
      ],
      fr: [
        {
          q: "Visite-t-on le Palais national?",
          a: "Les arrets cles dependent de la route du jour, avec vues du Palais."
        }
      ]
    },
    ctas: {
      es: ["Reservar traslado guiado", "Confirmar salida"],
      en: ["Book guided transfer", "Confirm departure"],
      fr: ["Reserver transfert guide", "Confirmer le depart"]
    }
  }
];
