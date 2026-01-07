import type { Locale } from "@/lib/translations";

export type ParasailingFaq = {
  q: string;
  a: string;
};

export type ParasailingVariant = {
  slug: string;
  clusterId: string;
  titles: Record<Locale, string>;
  heroSubtitles: Record<Locale, string>;
  metaDescriptions: Record<Locale, string>;
  bodyBlocks: Record<Locale, string[]>;
  faqs: Record<Locale, ParasailingFaq[]>;
  ctas: Record<Locale, string[]>;
};

export const PARASAILING_BASE_TOUR = {
  slug: "parasailing-punta-cana",
  inclusions: {
    es: [
      "Traslado ida y vuelta desde zona hotelera",
      "Despegue y aterrizaje desde lancha rapida",
      "Vuelo de 10 a 12 minutos",
      "Altura aproximada 150 a 200 pies",
      "Opciones individual, tandem o triple",
      "Parada opcional en mercado local"
    ],
    en: [
      "Round-trip transport from hotel zone",
      "Boat takeoff and landing on a modern speedboat",
      "10 to 12 minutes of flight time",
      "Approximate height 150 to 200 feet",
      "Solo, tandem, or triple options",
      "Optional local market stop"
    ],
    fr: [
      "Transport aller-retour depuis la zone hoteliere",
      "Decollage et atterrissage depuis un bateau rapide",
      "10 a 12 minutes de vol",
      "Hauteur approximative 150 a 200 pieds",
      "Options solo, tandem ou triple",
      "Arret optionnel au marche local"
    ]
  } as Record<Locale, string[]>,
  highlights: {
    es: [
      "Vistas aereas de la costa de Bavaro",
      "Arrecifes, hoteles y palmeras desde el cielo",
      "Despegue seguro desde lancha",
      "Mercado local con artesanias",
      "Experiencia tranquila y fotografiable"
    ],
    en: [
      "Aerial views of the Bavaro coast",
      "Reefs, hotels, and palms from above",
      "Safe boat takeoff",
      "Local market crafts stop",
      "Calm and photo friendly experience"
    ],
    fr: [
      "Vues aeriennes de la cote de Bavaro",
      "Recifs, hotels et palmiers d en haut",
      "Decollage securise depuis bateau",
      "Marche local et artisanat",
      "Experience calme et photogenique"
    ]
  } as Record<Locale, string[]>
};

export const PARASAILING_VARIANTS: ParasailingVariant[] = [
  {
    slug: "parasailing-punta-cana-vistas-del-cielo",
    clusterId: "vistas",
    titles: {
      es: "Parasailing en Punta Cana: vistas del cielo sobre Bavaro",
      en: "Parasailing in Punta Cana: sky views over Bavaro",
      fr: "Parasailing a Punta Cana: vues du ciel sur Bavaro"
    },
    heroSubtitles: {
      es: "Libertad, altura y una costa turquesa desde 200 pies.",
      en: "Freedom, height, and a turquoise coast from 200 feet.",
      fr: "Liberte, hauteur et cote turquoise depuis 200 pieds."
    },
    metaDescriptions: {
      es: "Vuela sobre Bavaro en parasailing con salida en lancha y vistas unicas de la costa.",
      en: "Soar over Bavaro with speedboat takeoff and unique coastal views.",
      fr: "Survolez Bavaro avec decollage en bateau et vues uniques de la cote."
    },
    bodyBlocks: {
      es: [
        "Esta experiencia es ligera y serena, pero llena de emocion.",
        "Ves la costa de Bavaro con arrecifes y hoteles desde arriba.",
        "La salida es desde lancha rapida, sin tocar la arena."
      ],
      en: [
        "This experience is calm and scenic, yet exciting.",
        "You see the Bavaro coastline, reefs, and hotels from above.",
        "Takeoff is from a speedboat, not from the beach."
      ],
      fr: [
        "Experience calme et sceno, mais excitante.",
        "Vous voyez la cote de Bavaro, recifs et hotels d en haut.",
        "Decollage depuis bateau rapide, pas depuis la plage."
      ]
    },
    faqs: {
      es: [{ q: "Cuanto dura el vuelo?", a: "Entre 10 y 12 minutos en el aire." }],
      en: [{ q: "How long is the flight?", a: "About 10 to 12 minutes in the air." }],
      fr: [{ q: "Combien dure le vol?", a: "Environ 10 a 12 minutes dans l air." }]
    },
    ctas: {
      es: ["Reservar vuelo", "Ver disponibilidad"],
      en: ["Book flight", "Check availability"],
      fr: ["Reserver le vol", "Voir disponibilite"]
    }
  },
  {
    slug: "speedboat-y-parasailing-en-punta-cana",
    clusterId: "seguridad",
    titles: {
      es: "Speedboat y parasailing en Punta Cana: despegue seguro",
      en: "Speedboat and parasailing in Punta Cana: safe takeoff",
      fr: "Speedboat et parasailing a Punta Cana: decollage securise"
    },
    heroSubtitles: {
      es: "Capitanes expertos y equipo certificado en cada salida.",
      en: "Expert captains and certified gear on every departure.",
      fr: "Capitaines experts et equipement certifie a chaque sortie."
    },
    metaDescriptions: {
      es: "Despegue y aterrizaje desde lancha moderna con protocolos de seguridad.",
      en: "Takeoff and landing from a modern boat with safety protocols.",
      fr: "Decollage et atterrissage depuis un bateau moderne avec protocoles."
    },
    bodyBlocks: {
      es: [
        "El despegue es desde una plataforma en lancha rapida.",
        "Equipo revisado y tripulacion con experiencia.",
        "Ideal si quieres emocion con control total."
      ],
      en: [
        "Takeoff happens from a platform on a speedboat.",
        "Checked equipment and experienced crew.",
        "Ideal if you want thrill with full control."
      ],
      fr: [
        "Decollage depuis une plateforme sur bateau rapide.",
        "Equipement verifie et equipage experimente.",
        "Ideal pour une emotion en toute confiance."
      ]
    },
    faqs: {
      es: [{ q: "Se despega desde la playa?", a: "No, el despegue es desde lancha rapida." }],
      en: [{ q: "Do you take off from the beach?", a: "No, takeoff is from the speedboat." }],
      fr: [{ q: "Decollage depuis la plage?", a: "Non, decollage depuis le bateau." }]
    },
    ctas: {
      es: ["Ver seguridad", "Reservar ahora"],
      en: ["See safety", "Book now"],
      fr: ["Voir securite", "Reserver"]
    }
  },
  {
    slug: "parasailing-en-punta-cana-fotos-aereas-perfectas",
    clusterId: "fotografia",
    titles: {
      es: "Parasailing en Punta Cana: fotos aereas perfectas",
      en: "Parasailing in Punta Cana: perfect aerial photos",
      fr: "Parasailing a Punta Cana: photos aeriennes parfaites"
    },
    heroSubtitles: {
      es: "La mejor foto del viaje: costa, arrecifes y cielo abierto.",
      en: "The best trip photo: coast, reefs, and open sky.",
      fr: "La meilleure photo du voyage: cote, recifs et ciel."
    },
    metaDescriptions: {
      es: "Vistas aereas de Bavaro y mar turquesa para capturar el momento.",
      en: "Aerial views of Bavaro and turquoise water for the perfect shot.",
      fr: "Vues aeriennes de Bavaro et eau turquoise pour la photo parfaite."
    },
    bodyBlocks: {
      es: [
        "Subes a 150-200 pies con una vista limpia y abierta.",
        "La costa de Bavaro se ve completa en una sola toma.",
        "Una experiencia tranquila, ideal para parejas."
      ],
      en: [
        "Rise to 150-200 feet with a clear, open view.",
        "The Bavaro coast fits in a single frame.",
        "A calm experience, perfect for couples."
      ],
      fr: [
        "Montez a 150-200 pieds avec une vue claire et ouverte.",
        "La cote de Bavaro tient dans un seul cadre.",
        "Experience calme, parfaite pour couples."
      ]
    },
    faqs: {
      es: [{ q: "Puedo volar en tandem?", a: "Si, hay opciones dobles y triples segun peso." }],
      en: [{ q: "Can I fly tandem?", a: "Yes, double and triple options depending on weight." }],
      fr: [{ q: "Je peux voler en tandem?", a: "Oui, options double et triple selon poids." }]
    },
    ctas: {
      es: ["Reservar fotos aereas", "Ver horarios"],
      en: ["Book for photos", "See times"],
      fr: ["Reserver pour photos", "Voir horaires"]
    }
  },
  {
    slug: "parasailing-romantico-en-punta-cana",
    clusterId: "romance",
    titles: {
      es: "Parasailing romantico en Punta Cana para parejas",
      en: "Romantic parasailing in Punta Cana for couples",
      fr: "Parasailing romantique a Punta Cana pour couples"
    },
    heroSubtitles: {
      es: "Un momento tranquilo en el aire para compartir juntos.",
      en: "A calm moment in the air to share together.",
      fr: "Un moment calme dans les airs a partager."
    },
    metaDescriptions: {
      es: "Vuela en tandem y disfruta de la costa desde el cielo con tu pareja.",
      en: "Fly tandem and enjoy the coast from the sky with your partner.",
      fr: "Volez en tandem et profitez de la cote depuis le ciel."
    },
    bodyBlocks: {
      es: [
        "El vuelo tandem es uno de los planes mas romanticos de Bavaro.",
        "Altura, calma y vista abierta para una memoria especial.",
        "Salidas seguras y organizadas desde lancha."
      ],
      en: [
        "Tandem flights are one of the most romantic plans in Bavaro.",
        "Height, calm, and open views for a special memory.",
        "Safe and organized departures from the boat."
      ],
      fr: [
        "Le vol tandem est un plan tres romantique a Bavaro.",
        "Hauteur, calme et vue ouverte pour un souvenir special.",
        "Departs securises et organises depuis le bateau."
      ]
    },
    faqs: {
      es: [{ q: "Es apto para propuestas?", a: "Si, muchas parejas lo eligen por la vista y calma." }],
      en: [{ q: "Is it good for proposals?", a: "Yes, many couples choose it for the view and calm." }],
      fr: [{ q: "C est bien pour une demande?", a: "Oui, beaucoup de couples le choisissent pour la vue." }]
    },
    ctas: {
      es: ["Reservar para parejas", "Ver disponibilidad"],
      en: ["Book for couples", "Check availability"],
      fr: ["Reserver en couple", "Voir disponibilite"]
    }
  },
  {
    slug: "parasailing-seguro-en-punta-cana-equipo-certificado",
    clusterId: "seguridad",
    titles: {
      es: "Parasailing seguro en Punta Cana: equipo certificado",
      en: "Safe parasailing in Punta Cana: certified gear",
      fr: "Parasailing securise a Punta Cana: equipement certifie"
    },
    heroSubtitles: {
      es: "Tripulacion profesional y protocolos claros antes de volar.",
      en: "Professional crew and clear pre-flight protocols.",
      fr: "Equipe pro et protocoles clairs avant vol."
    },
    metaDescriptions: {
      es: "Seguridad primero: arneses revisados, capitanes expertos y salida en barco.",
      en: "Safety first: checked harnesses, expert captains, and boat launch.",
      fr: "Securite d abord: harnais verifies, capitaines experts, depart bateau."
    },
    bodyBlocks: {
      es: [
        "La experiencia es serena gracias a la seguridad del equipo.",
        "El despegue es suave y controlado desde la lancha.",
        "Ves Bavaro desde arriba con total confianza."
      ],
      en: [
        "The experience feels calm thanks to solid safety measures.",
        "Takeoff is smooth and controlled from the boat.",
        "See Bavaro from above with full confidence."
      ],
      fr: [
        "L experience est sereine grace aux mesures de securite.",
        "Decollage doux et controle depuis le bateau.",
        "Voyez Bavaro d en haut en confiance."
      ]
    },
    faqs: {
      es: [{ q: "Hay briefing antes de volar?", a: "Si, explicamos todo antes del despegue." }],
      en: [{ q: "Is there a pre-flight briefing?", a: "Yes, we explain everything before takeoff." }],
      fr: [{ q: "Y a-t-il un briefing?", a: "Oui, tout est explique avant le decollage." }]
    },
    ctas: {
      es: ["Ver seguridad", "Reservar"],
      en: ["See safety", "Book now"],
      fr: ["Voir securite", "Reserver"]
    }
  },
  {
    slug: "parasailing-en-punta-cana-mercado-local-y-aventura",
    clusterId: "mercado",
    titles: {
      es: "Parasailing en Punta Cana con mercado local y aventura",
      en: "Parasailing in Punta Cana with local market and adventure",
      fr: "Parasailing a Punta Cana avec marche local et aventure"
    },
    heroSubtitles: {
      es: "Vuela y luego pasa por artesanias locales.",
      en: "Fly and then stop by local crafts.",
      fr: "Volez puis passez par l artisanat local."
    },
    metaDescriptions: {
      es: "Experiencia completa: vuelo, vistas y mercado de artesanias.",
      en: "Complete experience: flight, views, and local crafts market.",
      fr: "Experience complete: vol, vues et marche d artisanat."
    },
    bodyBlocks: {
      es: [
        "Despues del vuelo puedes visitar un mercado local.",
        "Ideal para sumar compras rapidas a la aventura.",
        "Una experiencia ligera, segura y fotogenica."
      ],
      en: [
        "After the flight you can visit a local market.",
        "Perfect to add quick shopping to the adventure.",
        "A light, safe, and photogenic experience."
      ],
      fr: [
        "Apres le vol, visite possible du marche local.",
        "Parfait pour ajouter du shopping a l aventure.",
        "Experience legere, sure et photogenique."
      ]
    },
    faqs: {
      es: [{ q: "El mercado es obligatorio?", a: "No, es una parada opcional." }],
      en: [{ q: "Is the market stop mandatory?", a: "No, it is optional." }],
      fr: [{ q: "Le marche est obligatoire?", a: "Non, c est optionnel." }]
    },
    ctas: {
      es: ["Reservar vuelo", "Ver detalles"],
      en: ["Book flight", "See details"],
      fr: ["Reserver le vol", "Voir details"]
    }
  },
  {
    slug: "parasailing-para-propuesta-en-punta-cana",
    clusterId: "romance",
    titles: {
      es: "Parasailing para propuesta en Punta Cana",
      en: "Parasailing for a proposal in Punta Cana",
      fr: "Parasailing pour une demande a Punta Cana"
    },
    heroSubtitles: {
      es: "Un vuelo tandem con vista abierta para un si inolvidable.",
      en: "A tandem flight with open views for an unforgettable yes.",
      fr: "Un vol tandem avec vue ouverte pour un oui inoubliable."
    },
    metaDescriptions: {
      es: "Plan romantico con altura, calma y vistas de Bavaro.",
      en: "Romantic plan with height, calm, and Bavaro views.",
      fr: "Plan romantique avec hauteur, calme et vues de Bavaro."
    },
    bodyBlocks: {
      es: [
        "La experiencia es tranquila y perfecta para parejas.",
        "Volar juntos crea un momento unico.",
        "Equipo profesional y salida organizada desde lancha."
      ],
      en: [
        "The experience is calm and perfect for couples.",
        "Flying together creates a unique moment.",
        "Professional crew and organized boat launch."
      ],
      fr: [
        "Experience calme et parfaite pour couples.",
        "Voler ensemble cree un moment unique.",
        "Equipe pro et depart organise depuis bateau."
      ]
    },
    faqs: {
      es: [{ q: "Se puede volar en pareja?", a: "Si, el tandem es la opcion mas popular." }],
      en: [{ q: "Can we fly as a couple?", a: "Yes, tandem is the most popular option." }],
      fr: [{ q: "On peut voler en couple?", a: "Oui, le tandem est l option la plus populaire." }]
    },
    ctas: {
      es: ["Reservar para propuesta", "Ver disponibilidad"],
      en: ["Book for proposal", "Check availability"],
      fr: ["Reserver pour demande", "Voir disponibilite"]
    }
  },
  {
    slug: "parasailing-punta-cana-precio-desde-90",
    clusterId: "low_cost",
    titles: {
      es: "Parasailing en Punta Cana: precios desde 90 USD",
      en: "Parasailing in Punta Cana: prices from 90 USD",
      fr: "Parasailing a Punta Cana: prix des 90 USD"
    },
    heroSubtitles: {
      es: "La mejor vista del Caribe con un precio claro.",
      en: "The best Caribbean view with a clear price.",
      fr: "La meilleure vue des Caraibes avec un prix clair."
    },
    metaDescriptions: {
      es: "Vuelo de 10-12 minutos, altura 150-200 pies y salida segura desde lancha.",
      en: "10-12 minute flight, 150-200 feet, safe boat takeoff.",
      fr: "Vol 10-12 minutes, 150-200 pieds, decollage securise."
    },
    bodyBlocks: {
      es: [
        "Precio competitivo para una experiencia de altura.",
        "Incluye transporte y equipo verificado.",
        "Ideal si quieres aventura sin mojarte demasiado."
      ],
      en: [
        "Competitive price for a high altitude experience.",
        "Includes transport and checked gear.",
        "Ideal if you want adventure without getting too wet."
      ],
      fr: [
        "Prix competitif pour une experience en hauteur.",
        "Inclut transport et equipement verifie.",
        "Ideal si tu veux l aventure sans trop te mouiller."
      ]
    },
    faqs: {
      es: [{ q: "Cuanto dura el tour completo?", a: "Entre 30 y 40 minutos total." }],
      en: [{ q: "How long is the full tour?", a: "About 30 to 40 minutes total." }],
      fr: [{ q: "Combien dure le tour complet?", a: "Environ 30 a 40 minutes au total." }]
    },
    ctas: {
      es: ["Reservar por 90 USD", "Ver disponibilidad"],
      en: ["Book for 90 USD", "Check availability"],
      fr: ["Reserver 90 USD", "Voir disponibilite"]
    }
  },
  {
    slug: "parasailing-punta-cana-vuelo-tandem-o-triple",
    clusterId: "seguridad",
    titles: {
      es: "Parasailing en Punta Cana: vuelo tandem o triple",
      en: "Parasailing in Punta Cana: tandem or triple flight",
      fr: "Parasailing a Punta Cana: vol tandem ou triple"
    },
    heroSubtitles: {
      es: "Opciones seguras para volar solo o en grupo.",
      en: "Safe options to fly solo or as a group.",
      fr: "Options sures pour voler seul ou en groupe."
    },
    metaDescriptions: {
      es: "Capacidad flexible con seguridad y equipo certificado.",
      en: "Flexible capacity with safety and certified gear.",
      fr: "Capacite flexible avec securite et equipement certifie."
    },
    bodyBlocks: {
      es: [
        "Puedes volar solo, en tandem o triple segun peso.",
        "El equipo se ajusta antes de despegar.",
        "La lancha controla el ritmo y la altura."
      ],
      en: [
        "You can fly solo, tandem, or triple depending on weight.",
        "Gear is adjusted before takeoff.",
        "The boat controls pace and height."
      ],
      fr: [
        "Tu peux voler seul, tandem ou triple selon poids.",
        "Equipement ajuste avant decollage.",
        "Le bateau controle le rythme et la hauteur."
      ]
    },
    faqs: {
      es: [{ q: "Se puede volar triple?", a: "Si, depende del peso total permitido." }],
      en: [{ q: "Can we fly triple?", a: "Yes, depending on total weight limits." }],
      fr: [{ q: "Peut-on voler a trois?", a: "Oui, selon le poids total autorise." }]
    },
    ctas: {
      es: ["Ver opciones", "Reservar"],
      en: ["View options", "Book now"],
      fr: ["Voir options", "Reserver"]
    }
  },
  {
    slug: "parasailing-punta-cana-experiencia-elevada-y-serena",
    clusterId: "vistas",
    titles: {
      es: "Parasailing en Punta Cana: experiencia elevada y serena",
      en: "Parasailing in Punta Cana: elevated and serene experience",
      fr: "Parasailing a Punta Cana: experience elevee et sereine"
    },
    heroSubtitles: {
      es: "Una forma tranquila de ver el Caribe desde el aire.",
      en: "A calm way to see the Caribbean from the air.",
      fr: "Une facon calme de voir les Caraibes depuis l air."
    },
    metaDescriptions: {
      es: "Vistas panoramicas, brisa suave y vuelo estable desde lancha.",
      en: "Panoramic views, gentle breeze, and stable flight from the boat.",
      fr: "Vues panoramiques, brise douce et vol stable depuis le bateau."
    },
    bodyBlocks: {
      es: [
        "La experiencia combina calma y emocion en el aire.",
        "Ves Bavaro y el mar turquesa con claridad.",
        "Ideal para quienes quieren aventura sin excesos."
      ],
      en: [
        "The experience blends calm and excitement in the air.",
        "You see Bavaro and the turquoise sea clearly.",
        "Ideal for travelers who want adventure without extremes."
      ],
      fr: [
        "L experience melange calme et emotion dans les airs.",
        "Vous voyez Bavaro et la mer turquoise clairement.",
        "Ideal pour une aventure sans exces."
      ]
    },
    faqs: {
      es: [{ q: "Me voy a mojar?", a: "Solo si lo decides, el vuelo es en seco." }],
      en: [{ q: "Will I get wet?", a: "Only if you want, the flight is dry." }],
      fr: [{ q: "Je vais me mouiller?", a: "Seulement si tu veux, le vol est sec." }]
    },
    ctas: {
      es: ["Reservar vuelo", "Ver horarios"],
      en: ["Book flight", "See times"],
      fr: ["Reserver le vol", "Voir horaires"]
    }
  },
  {
    slug: "parasailing-punta-cana-aventura-aerea-y-mercado",
    clusterId: "mercado",
    titles: {
      es: "Parasailing en Punta Cana: aventura aerea y mercado",
      en: "Parasailing in Punta Cana: aerial adventure and market",
      fr: "Parasailing a Punta Cana: aventure aerienne et marche"
    },
    heroSubtitles: {
      es: "Vuelo con vista y una parada ligera para artesanias.",
      en: "Flight with a view and a light stop for crafts.",
      fr: "Vol avec vue et arret leger pour artisanat."
    },
    metaDescriptions: {
      es: "Combina parasailing con una visita rapida a mercado local.",
      en: "Combine parasailing with a quick local market visit.",
      fr: "Combinez parasailing avec un arret rapide au marche local."
    },
    bodyBlocks: {
      es: [
        "Despues del vuelo puedes comprar recuerdos locales.",
        "Aventura suave y agradable para todos.",
        "Ideal para viajeros que buscan foto y shopping."
      ],
      en: [
        "After the flight you can shop for local souvenirs.",
        "A gentle adventure for everyone.",
        "Ideal for travelers who want photo and shopping."
      ],
      fr: [
        "Apres le vol, achat de souvenirs locaux.",
        "Aventure douce pour tous.",
        "Ideal pour photo et shopping."
      ]
    },
    faqs: {
      es: [{ q: "El mercado esta cerca?", a: "Si, es una parada rapida en la ruta." }],
      en: [{ q: "Is the market nearby?", a: "Yes, it is a quick stop on the route." }],
      fr: [{ q: "Le marche est proche?", a: "Oui, arret rapide sur la route." }]
    },
    ctas: {
      es: ["Reservar experiencia", "Ver detalles"],
      en: ["Book experience", "See details"],
      fr: ["Reserver experience", "Voir details"]
    }
  },
  {
    slug: "parasailing-punta-cana-para-fotos-y-propuesta",
    clusterId: "romance",
    titles: {
      es: "Parasailing en Punta Cana para fotos y propuesta",
      en: "Parasailing in Punta Cana for photos and proposals",
      fr: "Parasailing a Punta Cana pour photos et demande"
    },
    heroSubtitles: {
      es: "Una vista unica para una foto o un momento especial.",
      en: "A unique view for a photo or a special moment.",
      fr: "Une vue unique pour une photo ou un moment special."
    },
    metaDescriptions: {
      es: "Vuelo tandem, costa de Bavaro y una experiencia tranquila para parejas.",
      en: "Tandem flight, Bavaro coast, and a calm experience for couples.",
      fr: "Vol tandem, cote de Bavaro et experience calme pour couples."
    },
    bodyBlocks: {
      es: [
        "La altura y la calma crean un momento unico.",
        "Es una de las mejores actividades para parejas.",
        "Despegue seguro desde lancha con equipo certificado."
      ],
      en: [
        "Height and calm create a unique moment.",
        "It is one of the best activities for couples.",
        "Safe boat takeoff with certified gear."
      ],
      fr: [
        "La hauteur et le calme creent un moment unique.",
        "Une des meilleures activites pour couples.",
        "Decollage securise avec equipement certifie."
      ]
    },
    faqs: {
      es: [{ q: "Se puede volar en triple?", a: "Si, segun peso total permitido." }],
      en: [{ q: "Can we fly triple?", a: "Yes, depending on weight limits." }],
      fr: [{ q: "Vol triple possible?", a: "Oui, selon poids autorise." }]
    },
    ctas: {
      es: ["Reservar vuelo", "Ver disponibilidad"],
      en: ["Book flight", "Check availability"],
      fr: ["Reserver", "Voir disponibilite"]
    }
  },
  {
    slug: "parasailing-punta-cana-mejores-vistas-de-bavaro",
    clusterId: "vistas",
    titles: {
      es: "Parasailing en Punta Cana: mejores vistas de Bavaro",
      en: "Parasailing in Punta Cana: best Bavaro views",
      fr: "Parasailing a Punta Cana: meilleures vues de Bavaro"
    },
    heroSubtitles: {
      es: "Arrecifes, hoteles y palmeras desde el cielo.",
      en: "Reefs, hotels, and palm trees from the sky.",
      fr: "Recifs, hotels et palmiers depuis le ciel."
    },
    metaDescriptions: {
      es: "Vistas aereas de Bavaro con vuelo seguro y salida en lancha.",
      en: "Aerial Bavaro views with safe flight and boat launch.",
      fr: "Vues aeriennes de Bavaro avec vol sur et depart en bateau."
    },
    bodyBlocks: {
      es: [
        "Subes alto y ves toda la costa en un solo vistazo.",
        "El vuelo es suave y controlado.",
        "Ideal para viajeros que buscan la foto perfecta."
      ],
      en: [
        "You go high and see the entire coast at once.",
        "The flight is smooth and controlled.",
        "Ideal for travelers who want the perfect photo."
      ],
      fr: [
        "Vous montez haut et voyez toute la cote.",
        "Le vol est doux et controle.",
        "Ideal pour la photo parfaite."
      ]
    },
    faqs: {
      es: [{ q: "Es estable el vuelo?", a: "Si, el equipo mantiene el vuelo firme." }],
      en: [{ q: "Is the flight stable?", a: "Yes, the gear keeps a steady flight." }],
      fr: [{ q: "Le vol est stable?", a: "Oui, l equipement maintient un vol stable." }]
    },
    ctas: {
      es: ["Reservar vistas", "Ver horarios"],
      en: ["Book for views", "See times"],
      fr: ["Reserver", "Voir horaires"]
    }
  },
  {
    slug: "parasailing-punta-cana-mejor-experiencia-aerea",
    clusterId: "vistas",
    titles: {
      es: "Parasailing Punta Cana: la mejor experiencia aerea",
      en: "Parasailing Punta Cana: the best aerial experience",
      fr: "Parasailing Punta Cana: la meilleure experience aerienne"
    },
    heroSubtitles: {
      es: "Altura, calma y el Caribe a tus pies.",
      en: "Height, calm, and the Caribbean at your feet.",
      fr: "Hauteur, calme et les Caraibes a vos pieds."
    },
    metaDescriptions: {
      es: "Una aventura aerea con vistas de Bavaro y salida segura en lancha.",
      en: "An aerial adventure with Bavaro views and safe boat launch.",
      fr: "Aventure aerienne avec vues Bavaro et depart securise en bateau."
    },
    bodyBlocks: {
      es: [
        "Si buscas tranquilidad y emocion, este vuelo es ideal.",
        "Ves el mar turquesa y la costa desde arriba.",
        "Salida desde lancha, sin arena y sin complicaciones."
      ],
      en: [
        "If you want calm with excitement, this flight is ideal.",
        "See the turquoise sea and coast from above.",
        "Launch from the boat, no sand, no hassle."
      ],
      fr: [
        "Si tu veux calme et emotion, ce vol est ideal.",
        "Voir la mer turquoise et la cote d en haut.",
        "Depart depuis bateau, sans sable ni stress."
      ]
    },
    faqs: {
      es: [{ q: "Necesito experiencia previa?", a: "No, el equipo te guia en todo." }],
      en: [{ q: "Do I need experience?", a: "No, the crew guides you through everything." }],
      fr: [{ q: "Faut-il de l experience?", a: "Non, l equipe vous guide." }]
    },
    ctas: {
      es: ["Reservar ahora", "Ver disponibilidad"],
      en: ["Book now", "Check availability"],
      fr: ["Reserver", "Voir disponibilite"]
    }
  }
];
