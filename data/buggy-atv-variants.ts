import type { Locale } from "@/lib/translations";

export type BuggyAtvFaq = {
  q: string;
  a: string;
};

export type BuggyAtvVariant = {
  slug: string;
  clusterId: string;
  titles: Record<Locale, string>;
  heroSubtitles: Record<Locale, string>;
  metaDescriptions: Record<Locale, string>;
  bodyBlocks: Record<Locale, string[]>;
  faqs: Record<Locale, BuggyAtvFaq[]>;
  ctas: Record<Locale, string[]>;
};

export const BUGGY_ATV_BASE_TOUR = {
  slug: "excursion-en-buggy-y-atv-en-punta-cana",
  inclusions: {
    es: [
      "Transporte ida y vuelta desde zona hotelera",
      "Buggy o ATV individual o doble",
      "Parada en Playa Macao",
      "Cueva taina / cenote para nadar",
      "Casa tipica con degustacion",
      "Duracion aproximada 4 horas"
    ],
    en: [
      "Round-trip transport from hotel zone",
      "Buggy or ATV single or double",
      "Macao Beach stop",
      "Taina cave / cenote swim",
      "Local house tasting stop",
      "Approximate duration 4 hours"
    ],
    fr: [
      "Transport aller-retour depuis la zone hoteliere",
      "Buggy ou ATV solo ou double",
      "Arret a la plage Macao",
      "Grotte taina / cenote baignade",
      "Maison locale avec degustation",
      "Duree approximative 4 heures"
    ]
  } as Record<Locale, string[]>,
  highlights: {
    es: [
      "Rutas off-road con barro y charcos",
      "Llegada a Playa Macao",
      "Cueva taina con agua fresca",
      "Cafe, cacao y tabaco en casa tipica",
      "Opciones ATV, buggy clasico o VIP"
    ],
    en: [
      "Off-road routes with mud and splashes",
      "Arrival at Macao Beach",
      "Taina cave with fresh water",
      "Coffee, cacao, and tobacco tasting",
      "ATV, classic buggy, or VIP options"
    ],
    fr: [
      "Routes off-road avec boue et eclaboussures",
      "Arrivee a la plage Macao",
      "Grotte taina avec eau fraiche",
      "Degustation cafe, cacao et tabac",
      "Options ATV, buggy classique ou VIP"
    ]
  } as Record<Locale, string[]>
};

export const BUGGY_ATV_VARIANTS: BuggyAtvVariant[] = [
  {
    slug: "aventura-buggy-y-atv-en-punta-cana-dunas-y-barro",
    clusterId: "adrenalina",
    titles: {
      es: "Aventura buggy y ATV en Punta Cana: dunas y barro",
      en: "ATV Buggy adventure in Punta Cana: dunes and mud",
      fr: "Aventure buggy et ATV a Punta Cana: dunes et boue"
    },
    heroSubtitles: {
      es: "Pura adrenalina off-road con charcos, curvas y playa al final.",
      en: "Pure off-road adrenaline with mud, turns, and beach at the end.",
      fr: "Adrénaline off-road avec boue, virages et plage a la fin."
    },
    metaDescriptions: {
      es: "Ruta off-road con barro, Playa Macao y cueva taina. Buggy o ATV a tu ritmo.",
      en: "Off-road route with mud, Macao Beach, and the Taina cave. Buggy or ATV at your pace.",
      fr: "Route off-road avec boue, plage Macao et grotte taina. Buggy ou ATV a ton rythme."
    },
    bodyBlocks: {
      es: [
        "Este tour es para quien quiere ensuciarse y divertirse en serio.",
        "Conduces tu buggy o ATV por caminos con barro y vistas abiertas.",
        "El cierre perfecto es Playa Macao para respirar y tomar fotos."
      ],
      en: [
        "This tour is for anyone who wants to get dirty and have real fun.",
        "Drive your buggy or ATV through muddy tracks and open views.",
        "The perfect finish is Macao Beach for a breath and photos."
      ],
      fr: [
        "Ce tour est pour ceux qui veulent se salir et s amuser vraiment.",
        "Conduis ton buggy ou ATV sur des pistes boueuses et ouvertes.",
        "La fin parfaite: la plage Macao pour respirer et prendre des photos."
      ]
    },
    faqs: {
      es: [{ q: "Se puede elegir ATV o buggy?", a: "Si, hay opciones individuales y dobles." }],
      en: [{ q: "Can I choose ATV or buggy?", a: "Yes, there are single and double options." }],
      fr: [{ q: "Je peux choisir ATV ou buggy?", a: "Oui, options solo ou double." }]
    },
    ctas: {
      es: ["Reservar aventura", "Ver disponibilidad"],
      en: ["Book adventure", "Check availability"],
      fr: ["Reserver l aventure", "Voir disponibilite"]
    }
  },
  {
    slug: "tour-de-buggies-en-punta-cana-cueva-cenote-y-playa-macao",
    clusterId: "adrenalina",
    titles: {
      es: "Tour de buggies en Punta Cana: cueva cenote y Playa Macao",
      en: "Dune buggies Punta Cana: cenote cave and Macao Beach",
      fr: "Buggies a Punta Cana: grotte cenote et plage Macao"
    },
    heroSubtitles: {
      es: "Barro, cueva taina y una llegada triunfal a Macao.",
      en: "Mud, the Taina cave, and a triumphant finish at Macao.",
      fr: "Boue, grotte taina et arrivee a Macao."
    },
    metaDescriptions: {
      es: "Cueva cenote, casa tipica y Playa Macao en una sola ruta off-road.",
      en: "Cenote cave, local house, and Macao Beach on one off-road route.",
      fr: "Grotte cenote, maison locale et plage Macao sur une route off-road."
    },
    bodyBlocks: {
      es: [
        "El contraste es perfecto: motor, barro y agua fresca en la cueva.",
        "La casa tipica aporta una pausa con degustacion local.",
        "Macao es el final ideal para cerrar con playa."
      ],
      en: [
        "The contrast is perfect: engine, mud, and fresh water in the cave.",
        "The local house adds a pause with tasting.",
        "Macao is the ideal finish to end with beach time."
      ],
      fr: [
        "Le contraste est parfait: moteur, boue et eau fraiche dans la grotte.",
        "La maison locale ajoute une pause avec degustation.",
        "Macao est la fin ideale pour terminer a la plage."
      ]
    },
    faqs: {
      es: [{ q: "Se puede nadar en la cueva?", a: "Si, la parada es para refrescarse y nadar." }],
      en: [{ q: "Can we swim in the cave?", a: "Yes, the stop is for a refreshing swim." }],
      fr: [{ q: "On peut nager dans la grotte?", a: "Oui, arret pour se rafraichir." }]
    },
    ctas: {
      es: ["Quiero esta ruta", "Reservar"],
      en: ["I want this route", "Book now"],
      fr: ["Je veux cette route", "Reserver"]
    }
  },
  {
    slug: "buggies-en-punta-cana-opciones-clasicas-y-vip-en-rd",
    clusterId: "vehiculos",
    titles: {
      es: "Buggies en Punta Cana: opciones clasicas y VIP en RD",
      en: "Buggies in Punta Cana: classic and VIP options in DR",
      fr: "Buggies a Punta Cana: options classiques et VIP en RD"
    },
    heroSubtitles: {
      es: "Elige ATV, buggy clasico o VIP segun tu estilo.",
      en: "Choose ATV, classic buggy, or VIP based on your style.",
      fr: "Choisis ATV, buggy classique ou VIP selon ton style."
    },
    metaDescriptions: {
      es: "Tres opciones de vehiculos y la misma ruta con barro, cueva y playa.",
      en: "Three vehicle options with the same mud, cave, and beach route.",
      fr: "Trois options de vehicules avec la meme route boue, grotte et plage."
    },
    bodyBlocks: {
      es: [
        "ATV maniobrable, buggy clasico compartido o VIP con mas potencia.",
        "La ruta es intensa, con barro y charcos reales.",
        "Playa Macao y cueva taina completan la aventura."
      ],
      en: [
        "Choose a nimble ATV, a classic shared buggy, or a VIP buggy with more power.",
        "The route is intense with real mud and splashes.",
        "Macao Beach and the Taina cave complete the adventure."
      ],
      fr: [
        "Choisis un ATV maniable, un buggy classique partage ou un VIP plus puissant.",
        "La route est intense avec boue et eclaboussures.",
        "Plage Macao et grotte taina completent l aventure."
      ]
    },
    faqs: {
      es: [{ q: "Cual es la diferencia del buggy VIP?", a: "Mas potencia y menos traqueteo." }],
      en: [{ q: "What is the VIP buggy difference?", a: "More power and smoother ride." }],
      fr: [{ q: "Quelle difference avec le buggy VIP?", a: "Plus de puissance et moins de secousses." }]
    },
    ctas: {
      es: ["Ver opciones", "Reservar"],
      en: ["View options", "Book"],
      fr: ["Voir options", "Reserver"]
    }
  },
  {
    slug: "la-mejor-excursion-de-buggies-en-punta-cana-ruta-wild-tiger",
    clusterId: "adrenalina",
    titles: {
      es: "La mejor excursion de buggies en Punta Cana: ruta Wild Tiger",
      en: "Best buggy excursion in Punta Cana: Wild Tiger route",
      fr: "Meilleure excursion buggy a Punta Cana: route Wild Tiger"
    },
    heroSubtitles: {
      es: "Una ruta intensa con barro, playa y cueva en 4 horas.",
      en: "An intense route with mud, beach, and cave in 4 hours.",
      fr: "Une route intense avec boue, plage et grotte en 4 heures."
    },
    metaDescriptions: {
      es: "Excursion off-road con Playa Macao, cueva taina y casa tipica.",
      en: "Off-road excursion with Macao Beach, Taina cave, and local house stop.",
      fr: "Excursion off-road avec plage Macao, grotte taina et maison locale."
    },
    bodyBlocks: {
      es: [
        "Si quieres una ruta intensa, esta es la opcion.",
        "Barro, charcos y manejo real, sin vueltas.",
        "Llegas a Macao para cerrar con mar y fotos."
      ],
      en: [
        "If you want an intense route, this is the pick.",
        "Mud, splashes, and real driving, no fluff.",
        "You reach Macao to finish with sea and photos."
      ],
      fr: [
        "Si tu veux une route intense, c est le choix.",
        "Boue, eclaboussures et conduite reelle, sans detours.",
        "Arrivee a Macao pour finir avec mer et photos."
      ]
    },
    faqs: {
      es: [{ q: "Cuanto dura la ruta?", a: "Aproximadamente 4 horas con paradas." }],
      en: [{ q: "How long is the route?", a: "About 4 hours with stops." }],
      fr: [{ q: "Quelle est la duree?", a: "Environ 4 heures avec arrets." }]
    },
    ctas: {
      es: ["Reservar ahora", "Ver disponibilidad"],
      en: ["Book now", "Check availability"],
      fr: ["Reserver", "Voir disponibilite"]
    }
  },
  {
    slug: "buggies-en-punta-cana-aventura-intensa-y-divertida",
    clusterId: "adrenalina",
    titles: {
      es: "Buggies en Punta Cana: aventura intensa y divertida",
      en: "Buggies in Punta Cana: intense and fun adventure",
      fr: "Buggies a Punta Cana: aventure intense et fun"
    },
    heroSubtitles: {
      es: "Barro, velocidad controlada y paradas para refrescar.",
      en: "Mud, controlled speed, and stops to refresh.",
      fr: "Boue, vitesse controlee et pauses pour se rafraichir."
    },
    metaDescriptions: {
      es: "Aventura de 4 horas con cueva, casa tipica y Playa Macao.",
      en: "4-hour adventure with cave, local house, and Macao Beach.",
      fr: "Aventure de 4 heures avec grotte, maison locale et plage Macao."
    },
    bodyBlocks: {
      es: [
        "La ruta combina tierra, barro y agua en un solo plan.",
        "La cueva taina es la parada fresca del recorrido.",
        "Cierra en Macao con playa y descanso."
      ],
      en: [
        "The route mixes dirt, mud, and water in one plan.",
        "The Taina cave is the fresh stop of the route.",
        "Finish at Macao with beach time and rest."
      ],
      fr: [
        "La route melange terre, boue et eau dans un seul plan.",
        "La grotte taina est l arret frais du parcours.",
        "Fin a Macao avec plage et repos."
      ]
    },
    faqs: {
      es: [{ q: "Hay opciones para compartir buggy?", a: "Si, hay buggies dobles disponibles." }],
      en: [{ q: "Are there double buggies?", a: "Yes, double buggies are available." }],
      fr: [{ q: "Y a-t-il des buggies doubles?", a: "Oui, buggies doubles disponibles." }]
    },
    ctas: {
      es: ["Reservar aventura", "Ver horarios"],
      en: ["Book adventure", "See times"],
      fr: ["Reserver l aventure", "Voir horaires"]
    }
  },
  {
    slug: "ride-punta-cana-tours-de-aventura-y-rutas-en-buggy",
    clusterId: "adrenalina",
    titles: {
      es: "Ride Punta Cana: tours de aventura y rutas en buggy",
      en: "Ride Punta Cana: adventure tours and buggy routes",
      fr: "Ride Punta Cana: tours aventure et routes en buggy"
    },
    heroSubtitles: {
      es: "Ruta dinamica con barro, cueva y Playa Macao.",
      en: "Dynamic route with mud, cave, and Macao Beach.",
      fr: "Route dynamique avec boue, grotte et plage Macao."
    },
    metaDescriptions: {
      es: "Tour off-road con ATV o buggy, casa tipica y cueva taina.",
      en: "Off-road tour with ATV or buggy, local house, and Taina cave.",
      fr: "Tour off-road en ATV ou buggy, maison locale et grotte taina."
    },
    bodyBlocks: {
      es: [
        "Ideal para grupos y parejas que buscan accion.",
        "La ruta combina barro, agua y playa en 4 horas.",
        "Todo con transporte incluido desde la zona hotelera."
      ],
      en: [
        "Ideal for groups and couples who want action.",
        "The route blends mud, water, and beach in 4 hours.",
        "All with transport included from the hotel zone."
      ],
      fr: [
        "Ideal pour groupes et couples qui veulent de l action.",
        "La route combine boue, eau et plage en 4 heures.",
        "Transport inclus depuis la zone hoteliere."
      ]
    },
    faqs: {
      es: [{ q: "Hay pausas durante el tour?", a: "Si, hay paradas en cueva y playa." }],
      en: [{ q: "Are there stops during the tour?", a: "Yes, there are stops at the cave and beach." }],
      fr: [{ q: "Y a-t-il des pauses?", a: "Oui, arrets a la grotte et a la plage." }]
    },
    ctas: {
      es: ["Reservar ruta", "Ver disponibilidad"],
      en: ["Book route", "Check availability"],
      fr: ["Reserver la route", "Voir disponibilite"]
    }
  },
  {
    slug: "los-mejores-tours-de-buggy-y-atv-en-punta-cana",
    clusterId: "vehiculos",
    titles: {
      es: "Los mejores tours de buggy y ATV en Punta Cana",
      en: "The best buggy and ATV tours in Punta Cana",
      fr: "Les meilleurs tours buggy et ATV a Punta Cana"
    },
    heroSubtitles: {
      es: "Aventura de barro con paradas reales y vehiculos a elegir.",
      en: "Mud adventure with real stops and vehicles to choose.",
      fr: "Aventure boue avec vraies pauses et choix de vehicule."
    },
    metaDescriptions: {
      es: "Buggy o ATV, Playa Macao, cueva taina y casa tipica en una sola ruta.",
      en: "Buggy or ATV, Macao Beach, Taina cave, and local house in one route.",
      fr: "Buggy ou ATV, plage Macao, grotte taina et maison locale en une route."
    },
    bodyBlocks: {
      es: [
        "Esta ruta mezcla adrenalina y paradas culturales.",
        "Macao aporta el cierre con playa y fotos.",
        "Elige ATV, buggy clasico o VIP."
      ],
      en: [
        "This route mixes adrenaline with cultural stops.",
        "Macao gives the perfect beach finish.",
        "Choose ATV, classic buggy, or VIP."
      ],
      fr: [
        "Cette route melange adrenaline et pauses culturelles.",
        "Macao offre la fin parfaite sur la plage.",
        "Choisis ATV, buggy classique ou VIP."
      ]
    },
    faqs: {
      es: [{ q: "Se puede manejar en pareja?", a: "Si, hay opciones dobles." }],
      en: [{ q: "Can couples ride together?", a: "Yes, double options are available." }],
      fr: [{ q: "On peut rouler a deux?", a: "Oui, options doubles." }]
    },
    ctas: {
      es: ["Ver opciones", "Reservar"],
      en: ["View options", "Book now"],
      fr: ["Voir options", "Reserver"]
    }
  },
  {
    slug: "buggies-vip-y-quad-4x4-en-punta-cana",
    clusterId: "vip",
    titles: {
      es: "Buggies VIP y quad 4x4 en Punta Cana",
      en: "VIP buggies and 4x4 quad in Punta Cana",
      fr: "Buggies VIP et quad 4x4 a Punta Cana"
    },
    heroSubtitles: {
      es: "Mas potencia, mejor suspension y una ruta igual de intensa.",
      en: "More power, better suspension, same intense route.",
      fr: "Plus de puissance, meilleure suspension, route intense."
    },
    metaDescriptions: {
      es: "Buggy VIP con menos traqueteo y la misma aventura en barro.",
      en: "VIP buggy with smoother ride and the same mud adventure.",
      fr: "Buggy VIP plus confortable avec la meme aventure boue."
    },
    bodyBlocks: {
      es: [
        "Para quien busca mas comodidad sin perder adrenalina.",
        "Rutas con barro, cueva y Playa Macao.",
        "Elige VIP si quieres potencia extra."
      ],
      en: [
        "For those who want more comfort without losing adrenaline.",
        "Routes with mud, cave, and Macao Beach.",
        "Choose VIP for extra power."
      ],
      fr: [
        "Pour ceux qui veulent plus de confort sans perdre l adrenaline.",
        "Routes avec boue, grotte et plage Macao.",
        "Choisis VIP pour plus de puissance."
      ]
    },
    faqs: {
      es: [{ q: "El buggy VIP es mas comodo?", a: "Si, tiene mejor suspension y potencia." }],
      en: [{ q: "Is the VIP buggy smoother?", a: "Yes, better suspension and power." }],
      fr: [{ q: "Le buggy VIP est plus confortable?", a: "Oui, meilleure suspension et puissance." }]
    },
    ctas: {
      es: ["Ver buggy VIP", "Reservar"],
      en: ["See VIP buggy", "Book now"],
      fr: ["Voir buggy VIP", "Reserver"]
    }
  },
  {
    slug: "buggies-y-4-ruedas-en-punta-cana-ruta-otium",
    clusterId: "adrenalina",
    titles: {
      es: "Buggies y 4 ruedas en Punta Cana: ruta Otium",
      en: "Buggies and 4 wheels in Punta Cana: Otium route",
      fr: "Buggies et 4 roues a Punta Cana: route Otium"
    },
    heroSubtitles: {
      es: "Aventura clasica con barro, cueva y Playa Macao.",
      en: "Classic adventure with mud, cave, and Macao Beach.",
      fr: "Aventure classique avec boue, grotte et plage Macao."
    },
    metaDescriptions: {
      es: "Ruta Otium con ATV o buggy, casa tipica y paradas naturales.",
      en: "Otium route with ATV or buggy, local house, and natural stops.",
      fr: "Route Otium avec ATV ou buggy, maison locale et arrets naturels."
    },
    bodyBlocks: {
      es: [
        "Una ruta completa para quienes quieren lo esencial del tour.",
        "Macao, cueva y casa tipica en 4 horas.",
        "Transporte incluido desde la zona hotelera."
      ],
      en: [
        "A full route for those who want the essentials of the tour.",
        "Macao, cave, and local house in 4 hours.",
        "Transport included from the hotel zone."
      ],
      fr: [
        "Une route complete pour ceux qui veulent l essentiel du tour.",
        "Macao, grotte et maison locale en 4 heures.",
        "Transport inclus depuis la zone hoteliere."
      ]
    },
    faqs: {
      es: [{ q: "La ruta es apta para principiantes?", a: "Si, el guia da instrucciones antes de salir." }],
      en: [{ q: "Is the route beginner friendly?", a: "Yes, the guide gives instructions before departure." }],
      fr: [{ q: "La route est adaptee aux debutants?", a: "Oui, le guide explique avant le depart." }]
    },
    ctas: {
      es: ["Reservar ruta", "Ver disponibilidad"],
      en: ["Book route", "Check availability"],
      fr: ["Reserver la route", "Voir disponibilite"]
    }
  },
  {
    slug: "buggy-y-atv-desde-30-usd-en-punta-cana",
    clusterId: "low_cost",
    titles: {
      es: "Buggy y ATV desde 30 USD en Punta Cana",
      en: "Buggy and ATV from 30 USD in Punta Cana",
      fr: "Buggy et ATV des 30 USD a Punta Cana"
    },
    heroSubtitles: {
      es: "Precio agresivo para una ruta completa con barro y playa.",
      en: "Aggressive price for a full route with mud and beach.",
      fr: "Prix agressif pour une route complete avec boue et plage."
    },
    metaDescriptions: {
      es: "Lead price 30 USD con ruta off-road, cueva y Playa Macao.",
      en: "Lead price 30 USD with off-road route, cave, and Macao Beach.",
      fr: "Prix d appel 30 USD avec route off-road, grotte et plage Macao."
    },
    bodyBlocks: {
      es: [
        "Una de las experiencias mas buscadas por su precio y adrenalina.",
        "Incluye los tres puntos clave: cueva, casa tipica y Macao.",
        "Ideal para quienes quieren aventura sin gastar de mas."
      ],
      en: [
        "One of the most searched experiences for price and adrenaline.",
        "Includes the three key stops: cave, local house, and Macao.",
        "Ideal if you want adventure without overspending."
      ],
      fr: [
        "Une des experiences les plus cherchees pour le prix et l adrenaline.",
        "Inclut les trois arrets cles: grotte, maison locale et Macao.",
        "Ideal si tu veux l aventure sans depenser trop."
      ]
    },
    faqs: {
      es: [{ q: "El precio es final?", a: "Confirmamos disponibilidad y condiciones antes de reservar." }],
      en: [{ q: "Is the price final?", a: "We confirm availability and conditions before booking." }],
      fr: [{ q: "Le prix est final?", a: "On confirme disponibilite et conditions avant reservation." }]
    },
    ctas: {
      es: ["Reservar por 30 USD", "Ver disponibilidad"],
      en: ["Book for 30 USD", "Check availability"],
      fr: ["Reserver 30 USD", "Voir disponibilite"]
    }
  },
  {
    slug: "buggy-familiar-en-punta-cana-doble-y-seguro",
    clusterId: "family",
    titles: {
      es: "Buggy familiar en Punta Cana: doble y seguro",
      en: "Family buggy in Punta Cana: double and safe",
      fr: "Buggy familial a Punta Cana: double et sur"
    },
    heroSubtitles: {
      es: "Una aventura compartida con paradas y ritmo controlado.",
      en: "A shared adventure with stops and a controlled pace.",
      fr: "Une aventure partagee avec pauses et rythme controle."
    },
    metaDescriptions: {
      es: "Buggies dobles y ruta guiada con cueva, casa tipica y playa.",
      en: "Double buggies and guided route with cave, local house, and beach.",
      fr: "Buggies doubles et route guidee avec grotte, maison locale et plage."
    },
    bodyBlocks: {
      es: [
        "Perfecto para familias o parejas que quieren ir juntos.",
        "La ruta tiene paradas para descansar y refrescarse.",
        "Playa Macao es el cierre tranquilo del tour."
      ],
      en: [
        "Perfect for families or couples who want to ride together.",
        "The route includes stops to rest and refresh.",
        "Macao Beach is the calm finish to the tour."
      ],
      fr: [
        "Parfait pour familles ou couples qui veulent rouler ensemble.",
        "La route inclut des pauses pour se reposer et se rafraichir.",
        "Plage Macao est la fin calme du tour."
      ]
    },
    faqs: {
      es: [{ q: "Hay buggies dobles?", a: "Si, puedes compartir sin problema." }],
      en: [{ q: "Are there double buggies?", a: "Yes, you can share a buggy." }],
      fr: [{ q: "Y a-t-il des buggies doubles?", a: "Oui, vous pouvez partager." }]
    },
    ctas: {
      es: ["Reservar en pareja", "Ver disponibilidad"],
      en: ["Book for two", "Check availability"],
      fr: ["Reserver a deux", "Voir disponibilite"]
    }
  },
  {
    slug: "buggy-vip-en-punta-cana-mas-potencia-y-menos-traqueteo",
    clusterId: "vip",
    titles: {
      es: "Buggy VIP en Punta Cana: mas potencia y menos traqueteo",
      en: "VIP buggy in Punta Cana: more power, smoother ride",
      fr: "Buggy VIP a Punta Cana: plus de puissance, plus fluide"
    },
    heroSubtitles: {
      es: "Adrenalina con mas control y mejor suspension.",
      en: "Adrenaline with more control and better suspension.",
      fr: "Adrenaline avec plus de controle et meilleure suspension."
    },
    metaDescriptions: {
      es: "Buggy VIP tipo Polaris con ruta de barro, cueva y Playa Macao.",
      en: "VIP buggy Polaris style with mud route, cave, and Macao Beach.",
      fr: "Buggy VIP type Polaris avec route boue, grotte et plage Macao."
    },
    bodyBlocks: {
      es: [
        "Ideal si quieres potencia extra y menos golpes en la ruta.",
        "La aventura sigue siendo off-road y con barro real.",
        "Cueva taina y Macao completan el recorrido."
      ],
      en: [
        "Ideal if you want extra power and fewer bumps.",
        "The adventure is still off-road with real mud.",
        "Taina cave and Macao complete the route."
      ],
      fr: [
        "Ideal si tu veux plus de puissance et moins de chocs.",
        "L aventure reste off-road avec boue reelle.",
        "Grotte taina et Macao completent la route."
      ]
    },
    faqs: {
      es: [{ q: "Vale la pena el VIP?", a: "Si quieres mas comodidad, es la mejor opcion." }],
      en: [{ q: "Is VIP worth it?", a: "If you want more comfort, it is the best option." }],
      fr: [{ q: "Le VIP vaut le coup?", a: "Si tu veux plus de confort, c est le meilleur choix." }]
    },
    ctas: {
      es: ["Ver buggy VIP", "Reservar"],
      en: ["See VIP buggy", "Book now"],
      fr: ["Voir buggy VIP", "Reserver"]
    }
  },
  {
    slug: "tour-de-barro-en-punta-cana-macao-cueva-y-casa-tipica",
    clusterId: "adrenalina",
    titles: {
      es: "Tour de barro en Punta Cana: Macao, cueva y casa tipica",
      en: "Mud tour in Punta Cana: Macao, cave, and local house",
      fr: "Tour boue a Punta Cana: Macao, grotte et maison locale"
    },
    heroSubtitles: {
      es: "Barro real, agua fresca y playa para cerrar.",
      en: "Real mud, fresh water, and beach to finish.",
      fr: "Vraie boue, eau fraiche et plage pour finir."
    },
    metaDescriptions: {
      es: "La ruta mas sucia y divertida: barro, cueva taina y Playa Macao.",
      en: "The muddiest and most fun route: mud, Taina cave, and Macao Beach.",
      fr: "La route la plus boueuse et fun: boue, grotte taina et plage Macao."
    },
    bodyBlocks: {
      es: [
        "Si quieres barro de verdad, esta es la ruta.",
        "Parada en cueva para bajar la temperatura.",
        "Macao es el final perfecto para limpiar y descansar."
      ],
      en: [
        "If you want real mud, this is the route.",
        "Cave stop to cool off.",
        "Macao is the perfect finish to relax and clean up."
      ],
      fr: [
        "Si tu veux de la vraie boue, c est la route.",
        "Arret grotte pour se rafraichir.",
        "Macao est la fin parfaite pour se detendre."
      ]
    },
    faqs: {
      es: [{ q: "Me voy a ensuciar mucho?", a: "Si, es una aventura de barro real." }],
      en: [{ q: "Will I get really dirty?", a: "Yes, it is a real mud adventure." }],
      fr: [{ q: "Je vais me salir beaucoup?", a: "Oui, c est une aventure boue reelle." }]
    },
    ctas: {
      es: ["Reservar tour de barro", "Ver disponibilidad"],
      en: ["Book mud tour", "Check availability"],
      fr: ["Reserver tour boue", "Voir disponibilite"]
    }
  }
];
