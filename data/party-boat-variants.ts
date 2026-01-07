import type { Locale } from "@/lib/translations";

export type PartyBoatFaq = {
  q: string;
  a: string;
};

export type PartyBoatVariant = {
  slug: string;
  clusterId: string;
  titles: Record<Locale, string>;
  heroSubtitles: Record<Locale, string>;
  metaDescriptions: Record<Locale, string>;
  bodyBlocks: Record<Locale, string[]>;
  faqs: Record<Locale, PartyBoatFaq[]>;
  ctas: Record<Locale, string[]>;
};

export const PARTY_BOAT_BASE_TOUR = {
  slug: "sunset-catamaran-snorkel",
  landingBaseSlug: "hip-hop-party-boat",
  inclusions: {
    es: [
      "Recogida y regreso al hotel (confirmado tras reservar)",
      "Open bar (bebidas locales)",
      "Musica y ambiente de fiesta",
      "Parada de snorkel (zona de arrecife)",
      "Parada en Piscina Natural",
      "Asistencia de tripulacion y briefing de seguridad"
    ],
    en: [
      "Hotel pick-up and drop-off (confirmed after booking)",
      "Open bar (local drinks)",
      "Music and party vibes",
      "Snorkeling stop (reef area)",
      "Natural Pool stop",
      "Crew assistance and safety briefing"
    ],
    fr: [
      "Pick-up et retour hotel (confirme apres reservation)",
      "Open bar (boissons locales)",
      "Musique et ambiance de fete",
      "Stop snorkeling (zone recif)",
      "Arret Piscine Naturelle",
      "Assistance equipage et briefing securite"
    ]
  } as Record<Locale, string[]>
};

export const PARTY_BOAT_VARIANTS: PartyBoatVariant[] = [
  {
    slug: "party-boat-logistica-001",
    clusterId: "logistica",
    titles: {
      es: "Horarios reales de recogida para el Party Boat en Punta Cana", 
      en: "Real pick-up schedule for the Party Boat in Punta Cana", 
      fr: "Horaires reels de pick-up pour le Party Boat a Punta Cana", 
    },
    heroSubtitles: {
      es: "Recogida clara, regreso facil y todo confirmado antes de salir.", 
      en: "Clear pick-up, easy return, everything confirmed before you go.", 
      fr: "Pick-up clair, retour simple, tout confirme avant de partir.", 
    },
    metaDescriptions: {
      es: "Horarios, punto de encuentro y que llevar para tu salida en Party Boat. Reserva directa y sin sorpresas.", 
      en: "Pick-up timing, meeting point, and what to bring for your Party Boat. Book direct with no surprises.", 
      fr: "Horaires, point de rencontre et quoi apporter pour votre Party Boat. Reservation directe sans surprises.", 
    },
    bodyBlocks: {
      es: [
        "La recogida se coordina por lobby o punto designado, con hora confirmada tras la reserva.",
        "La salida incluye transporte ida y vuelta, briefing, snorkeling y parada en la Natural Pool con open bar.",
        "Te decimos exactamente que llevar, como vestirte y como evitar perder tiempo."
      ],
      en: [
        "Pick-up is coordinated at the lobby or designated point, with a confirmed time after booking.",
        "Departure includes round-trip transport, briefing, snorkeling, and a Natural Pool stop with open bar.",
        "We share exactly what to bring, how to dress, and how to avoid wasting time."
      ],
      fr: [
        "Le pick-up se fait au lobby ou au point designe, avec un horaire confirme apres reservation.",
        "Le depart inclut transport aller-retour, briefing, snorkeling et arret Natural Pool avec open bar.",
        "On te dit quoi apporter, comment t'habiller et comment eviter de perdre du temps."
      ]
    },
    faqs: {
      es: [{ q: "Donde es el punto exacto de recogida?", a: "Lo confirmamos por WhatsApp despues de reservar." }],
      en: [{ q: "Where is the exact pick-up point?", a: "We confirm it by WhatsApp after booking." }],
      fr: [{ q: "Ou est le point exact de pick-up?", a: "On confirme par WhatsApp apres reservation." }]
    },
    ctas: {
      es: ["Confirmar pick-up", "Ver disponibilidad"],
      en: ["Confirm pick-up", "Check availability"],
      fr: ["Confirmer pick-up", "Voir disponibilite"]
    }
  },
  {
    slug: "party-boat-logistica-002",
    clusterId: "logistica",
    titles: {
      es: "Salidas confirmadas del Party Boat con pick-up en hotel", 
      en: "Confirmed Party Boat departures with hotel pick-up", 
      fr: "Departs confirmes du Party Boat avec pick-up hotel", 
    },
    heroSubtitles: {
      es: "Te buscamos en el hotel y vas directo al check-in.", 
      en: "We pick you up at the hotel and go straight to check-in.", 
      fr: "On te prend a l'hotel et on va direct au check-in.", 
    },
    metaDescriptions: {
      es: "Salida organizada con transporte incluido, snorkel y Natural Pool. Todo coordinado y claro.", 
      en: "Organized departure with transport included, snorkel and Natural Pool. Clear, coordinated.", 
      fr: "Depart organise avec transport inclus, snorkel et Natural Pool. Clair et coordonne.", 
    },
    bodyBlocks: {
      es: [
        "Damos instrucciones claras del punto de pick-up y la hora exacta confirmada.",
        "La experiencia combina musica, bebidas, snorkeling y parada en aguas poco profundas para fotos.",
        "Ideal si quieres una excursion sin drama: bajas al lobby y listo."
      ],
      en: [
        "We give clear instructions for the pick-up point and the exact confirmed time.",
        "The experience combines music, drinks, snorkeling, and a shallow-water stop for photos.",
        "Ideal if you want a no-drama excursion: just head to the lobby."
      ],
      fr: [
        "On donne des instructions claires pour le point de pick-up et l'heure exacte confirmee.",
        "L'experience combine musique, boissons, snorkeling et arret en eaux peu profondes.",
        "Ideal si tu veux une excursion sans stress: descends au lobby."
      ]
    },
    faqs: {
      es: [{ q: "Cuanto dura la excursion con transporte?", a: "Normalmente es una experiencia de medio dia." }],
      en: [{ q: "How long is the tour with transport?", a: "It is typically a half-day experience." }],
      fr: [{ q: "Quelle est la duree avec transport?", a: "C'est generalement une demi-journee." }]
    },
    ctas: {
      es: ["Ver disponibilidad", "Reserva ahora"],
      en: ["Check availability", "Book now"],
      fr: ["Voir disponibilite", "Reserver"]
    }
  },
  {
    slug: "party-boat-logistica-003",
    clusterId: "logistica",
    titles: {
      es: "Como llegar al Party Boat sin perder tiempo en Punta Cana", 
      en: "How to get to the Party Boat without wasting time in Punta Cana", 
      fr: "Comment rejoindre le Party Boat sans perdre de temps a Punta Cana", 
    },
    heroSubtitles: {
      es: "Paso a paso: lobby, transporte, check-in y catamaran.", 
      en: "Step by step: lobby, transport, check-in, catamaran.", 
      fr: "Etape par etape: lobby, transport, check-in, catamaran.", 
    },
    metaDescriptions: {
      es: "Guia simple para llegar al Party Boat: tiempos, punto de encuentro y consejos utiles.", 
      en: "Simple guide to reach the Party Boat: timing, meeting point, and practical tips.", 
      fr: "Guide simple pour rejoindre le Party Boat: horaires, point de rencontre, conseils utiles.", 
    },
    bodyBlocks: {
      es: [
        "Te recogemos en el hotel y vas directo al check-in del catamaran.",
        "Incluye snorkeling, Natural Pool y open bar con musica y animacion.",
        "Consejo pro: llega 10 minutos antes al punto de recogida."
      ],
      en: [
        "We pick you up at the hotel and take you straight to catamaran check-in.",
        "Includes snorkeling, Natural Pool, and open bar with music and entertainment.",
        "Pro tip: arrive 10 minutes early at the pick-up point."
      ],
      fr: [
        "On vient te chercher a l'hotel et tu vas direct au check-in du catamaran.",
        "Inclut snorkeling, Natural Pool et open bar avec musique et animation.",
        "Conseil pro: arrive 10 minutes avant le pick-up."
      ]
    },
    faqs: {
      es: [{ q: "Puedo reservar si ya estoy en Punta Cana?", a: "Si, reservas y recibes hora confirmada." }],
      en: [{ q: "Can I book if I am already in Punta Cana?", a: "Yes, book and receive a confirmed time." }],
      fr: [{ q: "Je peux reserver si je suis deja a Punta Cana?", a: "Oui, vous recevez un horaire confirme." }]
    },
    ctas: {
      es: ["Confirmar pick-up", "Reservar"],
      en: ["Confirm pick-up", "Book"],
      fr: ["Confirmer pick-up", "Reserver"]
    }
  },
  {
    slug: "party-boat-nicho-exclusivo-004",
    clusterId: "nicho_exclusivo",
    titles: {
      es: "Party Boat solo adultos en Punta Cana: ambiente premium", 
      en: "Adults-only Party Boat in Punta Cana with a premium vibe", 
      fr: "Party Boat adults only a Punta Cana avec ambiance premium", 
    },
    heroSubtitles: {
      es: "Musica, open bar y ambiente adulto, sin enfoque familiar.", 
      en: "Music, open bar, adult vibe, no family focus.", 
      fr: "Musique, open bar, ambiance adulte, sans focus familial.", 
    },
    metaDescriptions: {
      es: "Salida solo adultos con open bar y snorkel. Un plan mas fino para parejas y grupos.", 
      en: "Adults-only departure with open bar and snorkel. A more refined plan for couples and groups.", 
      fr: "Sortie adults only avec open bar et snorkel. Plan plus raffine pour couples et groupes.", 
    },
    bodyBlocks: {
      es: [
        "Salida pensada para adultos que buscan un ambiente mas fino.",
        "Musica, cocteles, snorkel y Natural Pool en un mismo plan.",
        "Ideal para grupos 25-40, parejas o celebraciones privadas."
      ],
      en: [
        "A departure designed for adults who want a more refined vibe.",
        "Music, cocktails, snorkel, and Natural Pool in one plan.",
        "Ideal for 25-40 groups, couples, or private celebrations."
      ],
      fr: [
        "Sortie pensee pour adultes qui veulent une ambiance plus premium.",
        "Musique, cocktails, snorkel et Natural Pool dans un meme plan.",
        "Ideal pour groupes 25-40, couples ou celebrations privees."
      ]
    },
    faqs: {
      es: [{ q: "Que significa Adults Only?", a: "Ambiente pensado para adultos, sin enfoque familiar." }],
      en: [{ q: "What does adults-only mean?", a: "Adult-focused vibe, not family-oriented." }],
      fr: [{ q: "Que signifie adults only?", a: "Ambiance pour adultes, pas orientee familles." }]
    },
    ctas: {
      es: ["Reserva VIP", "Ver opciones premium"],
      en: ["Book VIP", "View premium options"],
      fr: ["Reserver VIP", "Options premium"]
    }
  },
  {
    slug: "party-boat-nicho-exclusivo-005",
    clusterId: "nicho_exclusivo",
    titles: {
      es: "Catamaran VIP con open bar en Punta Cana", 
      en: "VIP catamaran with open bar in Punta Cana", 
      fr: "Catamaran VIP avec open bar a Punta Cana", 
    },
    heroSubtitles: {
      es: "Servicio premium, musica y paradas en el mar.", 
      en: "Premium service, music, and sea stops.", 
      fr: "Service premium, musique et arrets en mer.", 
    },
    metaDescriptions: {
      es: "Una experiencia VIP con open bar, snorkel y Natural Pool, todo coordinado.", 
      en: "A VIP experience with open bar, snorkel, and Natural Pool, fully coordinated.", 
      fr: "Experience VIP avec open bar, snorkel et Natural Pool, bien coordonnee.", 
    },
    bodyBlocks: {
      es: [
        "Experiencia pensada para quienes buscan un nivel superior.",
        "Cocteles, musica, snorkel y paradas fotograficas.",
        "Servicio organizado y soporte antes y despues del tour."
      ],
      en: [
        "An experience for travelers who want a higher level.",
        "Cocktails, music, snorkel, and photo stops.",
        "Organized service and support before and after the tour."
      ],
      fr: [
        "Une experience pour ceux qui veulent un niveau superieur.",
        "Cocktails, musique, snorkel et stops photo.",
        "Service organise et support avant et apres la sortie."
      ]
    },
    faqs: {
      es: [{ q: "Hay bebidas premium?", a: "Open bar con bebidas locales seleccionadas." }],
      en: [{ q: "Are premium drinks included?", a: "Open bar with selected local drinks." }],
      fr: [{ q: "Les boissons premium sont incluses?", a: "Open bar avec boissons locales selectionnees." }]
    },
    ctas: {
      es: ["Reserva VIP", "Cotizar privado"],
      en: ["Book VIP", "Get private quote"],
      fr: ["Reserver VIP", "Devis prive"]
    }
  },
  {
    slug: "party-boat-seguridad-comparativa-006",
    clusterId: "seguridad_comparativa",
    titles: {
      es: "Precio directo del Party Boat en Punta Cana, sin comisiones", 
      en: "Direct Party Boat price in Punta Cana, no commissions", 
      fr: "Prix direct du Party Boat a Punta Cana, sans commissions", 
    },
    heroSubtitles: {
      es: "Reserva directa, pick-up confirmado y soporte real.", 
      en: "Book direct, confirmed pick-up, real support.", 
      fr: "Reservation directe, pick-up confirme, support reel.", 
    },
    metaDescriptions: {
      es: "Reserva directa con el mismo servicio, sin sobrecargos. Transparencia total.", 
      en: "Book direct with the same service, no markups. Full transparency.", 
      fr: "Reservation directe avec le meme service, sans surcout. Transparence totale.", 
    },
    bodyBlocks: {
      es: [
        "Muchos viajeros pagan de mas por comodidad. Aqui tienes el precio directo.",
        "Incluye snorkel, Natural Pool y open bar sin fees escondidos.",
        "Confirmacion clara, punto exacto y listo."
      ],
      en: [
        "Many travelers overpay for convenience. Here is the direct price.",
        "Includes snorkel, Natural Pool, and open bar with no hidden fees.",
        "Clear confirmation, exact pick-up point, done."
      ],
      fr: [
        "Beaucoup de voyageurs paient trop pour la commodite. Voici le prix direct.",
        "Inclut snorkel, Natural Pool et open bar sans frais caches.",
        "Confirmation claire, point exact, c'est tout."
      ]
    },
    faqs: {
      es: [{ q: "Por que reservar directo?", a: "Evitas comisiones y recibes soporte directo." }],
      en: [{ q: "Why book direct?", a: "You avoid commissions and get direct support." }],
      fr: [{ q: "Pourquoi reserver direct?", a: "Vous evitez les commissions et obtenez un support direct." }]
    },
    ctas: {
      es: ["Ver precio directo", "Reservar con garantia"],
      en: ["See direct price", "Book with guarantee"],
      fr: ["Prix direct", "Reserver garanti"]
    }
  },
  {
    slug: "party-boat-seguridad-comparativa-007",
    clusterId: "seguridad_comparativa",
    titles: {
      es: "Comparativa 2026 del Party Boat: que incluye de verdad", 
      en: "2026 Party Boat comparison: what is really included", 
      fr: "Comparatif 2026 Party Boat: ce qui est vraiment inclus", 
    },
    heroSubtitles: {
      es: "Lo importante en claro: transporte, open bar y paradas.", 
      en: "The essentials, clear: transport, open bar, and stops.", 
      fr: "L'essentiel, clair: transport, open bar et arrets.", 
    },
    metaDescriptions: {
      es: "Compara inclusiones reales y evita cargos ocultos. Reserva directa y clara.", 
      en: "Compare real inclusions and avoid hidden fees. Direct, clear booking.", 
      fr: "Comparez les vraies inclusions et evitez les frais caches. Reservation claire.", 
    },
    bodyBlocks: {
      es: [
        "Compara lo que incluye: transporte, open bar, snorkeling y Natural Pool.",
        "Reserva directa para evitar fees ocultos y tener confirmacion clara.",
        "Soporte rapido y seguimiento antes de salir."
      ],
      en: [
        "Compare inclusions: transport, open bar, snorkeling, and Natural Pool.",
        "Book direct to avoid hidden fees and get clear confirmation.",
        "Fast support and follow-up before departure."
      ],
      fr: [
        "Comparez les inclusions: transport, open bar, snorkeling et Natural Pool.",
        "Reserve direct pour eviter les frais caches et recevoir une confirmation claire.",
        "Support rapide avant le depart."
      ]
    },
    faqs: {
      es: [{ q: "Que debo comparar?", a: "Incluye transporte, open bar, snorkel y tiempos." }],
      en: [{ q: "What should I compare?", a: "Transport, open bar, snorkel, and timing." }],
      fr: [{ q: "Que comparer?", a: "Transport, open bar, snorkel et horaires." }]
    },
    ctas: {
      es: ["Comparar opciones", "Reservar"],
      en: ["Compare options", "Book"],
      fr: ["Comparer", "Reserver"]
    }
  },
  {
    slug: "party-boat-urgencia-008",
    clusterId: "urgencia_last_minute",
    titles: {
      es: "Plan para hoy? Party Boat con cupos limitados", 
      en: "Plan for today? Party Boat with limited spots", 
      fr: "Plan pour aujourd'hui? Party Boat avec places limitees", 
    },
    heroSubtitles: {
      es: "Reserva rapida y salida el mismo dia.", 
      en: "Fast booking and same-day departure.", 
      fr: "Reservation rapide et depart le jour meme.", 
    },
    metaDescriptions: {
      es: "Cupos para hoy con confirmacion rapida, transporte incluido y open bar.", 
      en: "Spots for today with fast confirmation, transport included, and open bar.", 
      fr: "Places pour aujourd'hui avec confirmation rapide, transport inclus et open bar.", 
    },
    bodyBlocks: {
      es: [
        "Plan perfecto si te despertaste con ganas de mar y musica.",
        "Reservas rapido, confirmamos pick-up y te llevamos directo al catamaran.",
        "Ideal para grupos, parejas y amigos sin complicarte."
      ],
      en: [
        "Perfect if you woke up craving ocean and music.",
        "Book fast, we confirm pick-up, and take you to the catamaran.",
        "Ideal for groups, couples, and friends with no hassle."
      ],
      fr: [
        "Parfait si tu te reveilles avec envie de mer et musique.",
        "Reservation rapide, pick-up confirme, direction catamaran.",
        "Ideal pour groupes, couples et amis sans stress."
      ]
    },
    faqs: {
      es: [{ q: "Se puede reservar el mismo dia?", a: "Si, si hay cupo disponible." }],
      en: [{ q: "Can I book the same day?", a: "Yes, if spots are available." }],
      fr: [{ q: "Je peux reserver le jour meme?", a: "Oui, si des places sont disponibles." }]
    },
    ctas: {
      es: ["Cupo hoy", "Reservar ahora"],
      en: ["Today spots", "Book now"],
      fr: ["Places aujourd'hui", "Reserver maintenant"]
    }
  },
  {
    slug: "party-boat-urgencia-009",
    clusterId: "urgencia_last_minute",
    titles: {
      es: "Reserva ahora y navega hoy en Punta Cana", 
      en: "Book now and sail today in Punta Cana", 
      fr: "Reserve maintenant et partez aujourd'hui a Punta Cana", 
    },
    heroSubtitles: {
      es: "Confirmacion inmediata y salida sin vueltas.", 
      en: "Instant confirmation and no-hassle departure.", 
      fr: "Confirmation immediate et depart sans stress.", 
    },
    metaDescriptions: {
      es: "Salida el mismo dia con pick-up coordinado y open bar incluido.", 
      en: "Same-day departure with coordinated pick-up and open bar included.", 
      fr: "Depart le jour meme avec pick-up coordonne et open bar inclus.", 
    },
    bodyBlocks: {
      es: [
        "Si estas listo hoy, te confirmamos en minutos.",
        "Pick-up coordinado y salida directa al catamaran.",
        "Open bar, musica y Natural Pool incluidos."
      ],
      en: [
        "If you are ready today, we confirm in minutes.",
        "Pick-up coordinated and direct departure to the catamaran.",
        "Open bar, music, and Natural Pool included."
      ],
      fr: [
        "Si tu es pret aujourd'hui, confirmation en quelques minutes.",
        "Pick-up coordonne et depart direct vers le catamaran.",
        "Open bar, musique et Natural Pool inclus."
      ]
    },
    faqs: {
      es: [{ q: "Hay disponibilidad hoy?", a: "Depende del cupo, consulta y confirmamos." }],
      en: [{ q: "Is there availability today?", a: "Depends on availability, ask and we confirm." }],
      fr: [{ q: "Y a-t-il des places aujourd'hui?", a: "Selon disponibilite, demandez et on confirme." }]
    },
    ctas: {
      es: ["Reservar ahora", "Confirmar cupo"],
      en: ["Book now", "Confirm spot"],
      fr: ["Reserver maintenant", "Confirmer place"]
    }
  },
  {
    slug: "party-boat-general-010",
    clusterId: "logistica",
    titles: {
      es: "Party Boat con snorkel y Piscina Natural", 
      en: "Party Boat with snorkel and Natural Pool", 
      fr: "Party Boat avec snorkel et Natural Pool", 
    },
    heroSubtitles: {
      es: "Musica, open bar y paradas en el mar Caribe.", 
      en: "Music, open bar, and stops in the Caribbean.", 
      fr: "Musique, open bar et arrets dans les Caraibes.", 
    },
    metaDescriptions: {
      es: "Excursion completa con snorkel, Natural Pool y open bar. Reserva directa.", 
      en: "Full excursion with snorkel, Natural Pool, and open bar. Book direct.", 
      fr: "Excursion complete avec snorkel, Natural Pool et open bar. Reservation directe.", 
    },
    bodyBlocks: {
      es: [
        "Disfruta el Caribe con musica, bebidas y snorkel guiado.",
        "Parada en aguas poco profundas para fotos y relax.",
        "Transporte incluido con confirmacion clara."
      ],
      en: [
        "Enjoy the Caribbean with music, drinks, and guided snorkel.",
        "Shallow-water stop for photos and relax.",
        "Transport included with clear confirmation."
      ],
      fr: [
        "Profitez des Caraibes avec musique, boissons et snorkel guide.",
        "Arret en eaux peu profondes pour photos et detente.",
        "Transport inclus avec confirmation claire."
      ]
    },
    faqs: {
      es: [{ q: "Incluye snorkel?", a: "Si, incluye equipo y guia." }],
      en: [{ q: "Is snorkel included?", a: "Yes, equipment and guide included." }],
      fr: [{ q: "Le snorkel est inclus?", a: "Oui, equipement et guide inclus." }]
    },
    ctas: {
      es: ["Reserva ahora", "Ver disponibilidad"],
      en: ["Book now", "Check availability"],
      fr: ["Reserver", "Voir disponibilite"]
    }
  },
  {
    slug: "party-boat-adults-only-011",
    clusterId: "nicho_exclusivo",
    titles: {
      es: "Adults Only Party Boat: fiesta solo adultos en Punta Cana", 
      en: "Adults Only Party Boat: adults-only party in Punta Cana", 
      fr: "Party Boat Adults Only: fete adultes a Punta Cana", 
    },
    heroSubtitles: {
      es: "Open bar, DJ y ambiente 18+ sin ruido de familias.", 
      en: "Open bar, DJ, and an 18+ vibe without family crowds.", 
      fr: "Open bar, DJ et ambiance 18+ sans foule familiale.", 
    },
    metaDescriptions: {
      es: "Salida solo adultos con musica, open bar y snorkel lejos de multitudes.", 
      en: "Adults-only departure with music, open bar, and snorkel away from crowds.", 
      fr: "Sortie adults only avec musique, open bar et snorkel loin des foules.", 
    },
    bodyBlocks: {
      es: [
        "Escapa de lo familiar: ambiente pensado solo para adultos.",
        "Open bar con bebidas seleccionadas, DJ en vivo y paradas para snorkel.",
        "Perfecto para parejas y grupos que buscan nivel y privacidad."
      ],
      en: [
        "Skip the family vibe: this is designed for adults only.",
        "Premium open bar, live DJ, and snorkel stops included.",
        "Ideal for couples and groups who want a higher level."
      ],
      fr: [
        "Oublie l'ambiance familiale: experience reservee aux adultes.",
        "Open bar premium, DJ live et stops snorkeling inclus.",
        "Ideal pour couples et groupes qui veulent plus de niveau."
      ]
    },
    faqs: {
      es: [{ q: "Es realmente solo adultos?", a: "Si, el ambiente esta pensado para mayores de 18 anos." }],
      en: [{ q: "Is it truly adults only?", a: "Yes, the vibe is designed for 18+ guests." }],
      fr: [{ q: "C'est vraiment adults only?", a: "Oui, l'ambiance est reservee aux 18+." }]
    },
    ctas: {
      es: ["Reserva VIP", "Ver opciones premium"],
      en: ["Book VIP", "View premium options"],
      fr: ["Reserver VIP", "Options premium"]
    }
  },
  {
    slug: "party-boat-bachelorette-private-012",
    clusterId: "nicho_exclusivo",
    titles: {
      es: "Bachelorette privada en barco: Punta Cana", 
      en: "Private bachelorette boat party in Punta Cana", 
      fr: "Bachelorette privee en bateau a Punta Cana", 
    },
    heroSubtitles: {
      es: "Charter privado y celebracion a tu medida.", 
      en: "Private charter and a celebration tailored to your group.", 
      fr: "Charter prive et celebration sur mesure.", 
    },
    metaDescriptions: {
      es: "Charter privado con musica, cocteles y parada en Natural Pool.", 
      en: "Private charter with music, cocktails, and a Natural Pool stop.", 
      fr: "Charter prive avec musique, cocktails et arret Natural Pool.", 
    },
    bodyBlocks: {
      es: [
        "Planificacion facil para la dama de honor: charter privado y opciones personalizadas.",
        "Cocteles, fotos, musica del grupo y paradas perfectas para celebrar.",
        "Traslado privado ida y vuelta desde Bavaro incluido."
      ],
      en: [
        "Easy planning for the maid of honor: private charter and custom options.",
        "Cocktails, photos, your music, and perfect celebration stops.",
        "Private round-trip transport from Bavaro included."
      ],
      fr: [
        "Organisation facile pour la temoin: charter prive et options sur mesure.",
        "Cocktails, photos, votre musique et arrets parfaits pour celebrer.",
        "Transport prive aller-retour depuis Bavaro inclus."
      ]
    },
    faqs: {
      es: [{ q: "Se puede personalizar decoracion o menu?", a: "Si, ofrecemos opciones de decoracion y catering." }],
      en: [{ q: "Can we customize decor or menu?", a: "Yes, we offer decoration and catering options." }],
      fr: [{ q: "Peut-on personnaliser deco ou menu?", a: "Oui, options deco et catering disponibles." }]
    },
    ctas: {
      es: ["Cotizar privado", "Reservar ahora"],
      en: ["Get private quote", "Book now"],
      fr: ["Devis prive", "Reserver"]
    }
  },
  {
    slug: "party-boat-singles-013",
    clusterId: "seguridad_comparativa",
    titles: {
      es: "Booze Cruise para solteros en Punta Cana", 
      en: "Booze Cruise for singles in Punta Cana", 
      fr: "Booze Cruise pour singles a Punta Cana", 
    },
    heroSubtitles: {
      es: "Ambiente social y seguro para conocer gente.", 
      en: "A social and safe vibe to meet people.", 
      fr: "Ambiance sociale et sure pour rencontrer du monde.", 
    },
    metaDescriptions: {
      es: "Salida para viajeros solteros con juegos, musica y equipo bilingue.", 
      en: "Singles-friendly departure with games, music, and bilingual crew.", 
      fr: "Sortie pour voyageurs solos avec jeux, musique et equipe bilingue.", 
    },
    bodyBlocks: {
      es: [
        "Viajas solo? Esta salida esta pensada para socializar sin presion.",
        "Juegos, musica y equipo bilingue para romper el hielo.",
        "Regresas con nuevos amigos y recuerdos reales."
      ],
      en: [
        "Traveling solo? This departure is designed to socialize without pressure.",
        "Games, music, and bilingual staff to break the ice.",
        "Leave with new friends and real memories."
      ],
      fr: [
        "Voyage solo? Cette sortie est faite pour socialiser sans pression.",
        "Jeux, musique et staff bilingue pour briser la glace.",
        "Tu repars avec de nouveaux amis et de vrais souvenirs."
      ]
    },
    faqs: {
      es: [{ q: "Es seguro para viajeros solos?", a: "Si, el staff esta enfocado en integrar y cuidar el grupo." }],
      en: [{ q: "Is it safe for solo travelers?", a: "Yes, staff focuses on integrating and supporting the group." }],
      fr: [{ q: "C'est sur pour les voyageurs solos?", a: "Oui, le staff integre et veille sur le groupe." }]
    },
    ctas: {
      es: ["Ver disponibilidad", "Reservar"],
      en: ["Check availability", "Book"],
      fr: ["Voir disponibilite", "Reserver"]
    }
  },
  {
    slug: "party-boat-last-minute-deals-014",
    clusterId: "urgencia_last_minute",
    titles: {
      es: "Ofertas last minute para Party Boat en Punta Cana", 
      en: "Last-minute Party Boat deals in Punta Cana", 
      fr: "Offres last minute Party Boat a Punta Cana", 
    },
    heroSubtitles: {
      es: "Cupos de ultimo minuto con confirmacion rapida.", 
      en: "Last-minute spots with fast confirmation.", 
      fr: "Places last minute avec confirmation rapide.", 
    },
    metaDescriptions: {
      es: "Ahorra con cupos de ultimo minuto: open bar, snorkel y transporte incluidos.", 
      en: "Save with last-minute spots: open bar, snorkel, and transport included.", 
      fr: "Economisez avec places last minute: open bar, snorkel et transport inclus.", 
    },
    bodyBlocks: {
      es: [
        "Si tienes flexibilidad, accede a cupos de ultimo minuto.",
        "Confirmacion por WhatsApp en minutos y salida el mismo dia.",
        "Pagas menos, celebras igual."
      ],
      en: [
        "If you are flexible, access last-minute spots.",
        "WhatsApp confirmation in minutes and same-day departure.",
        "Pay less, party the same."
      ],
      fr: [
        "Si tu es flexible, profite des places last minute.",
        "Confirmation WhatsApp en minutes et depart le jour meme.",
        "Tu payes moins, tu fais la fete pareil."
      ]
    },
    faqs: {
      es: [{ q: "Hay descuentos hoy?", a: "Depende del cupo, confirmamos en tiempo real." }],
      en: [{ q: "Any discounts today?", a: "Depends on availability, we confirm in real time." }],
      fr: [{ q: "Des promos aujourd'hui?", a: "Selon disponibilite, confirmation en temps reel." }]
    },
    ctas: {
      es: ["Cupo hoy", "Reservar ahora"],
      en: ["Today spots", "Book now"],
      fr: ["Places aujourd'hui", "Reserver maintenant"]
    }
  }

  {
    slug: "party-boat-estrella-015",
    clusterId: "seguridad_comparativa",
    titles: {
      es: "El Party Boat #1 de Punta Cana en 2026", 
      en: "#1 Party Boat in Punta Cana for 2026", 
      fr: "Le Party Boat #1 a Punta Cana pour 2026", 
    },
    heroSubtitles: {
      es: "Produccion completa, open bar premium y ambiente top en Bavaro.", 
      en: "Full production, premium open bar, and top vibe in Bavaro.", 
      fr: "Production complete, open bar premium et ambiance top a Bavaro.", 
    },
    metaDescriptions: {
      es: "Experiencia premiada con sonido pro, open bar premium y snorkel en arrecifes top.", 
      en: "Awarded experience with pro sound, premium open bar, and top reef snorkel.", 
      fr: "Experience primee avec son pro, open bar premium et snorkel sur recifs top.", 
    },
    bodyBlocks: {
      es: [
        "Mas de 5,000 resenas de 5 estrellas. Elegido por viajeros como la mejor experiencia de fiesta en el dia.",
        "Mientras otros ofrecen un paseo simple, aqui tienes una produccion completa con sonido pro y animacion total.",
        "Logistica impecable para que tu unica preocupacion sea disfrutar el sol y la musica."
      ],
      en: [
        "Over 5,000 five-star reviews. Chosen by travelers as the best daytime party experience.",
        "While others offer a simple ride, this is a full production with pro sound and top entertainment.",
        "Impeccable logistics so your only job is enjoying the sun and the music."
      ],
      fr: [
        "Plus de 5 000 avis 5 etoiles. Elu meilleure experience de fete en journee.",
        "Quand d'autres proposent une simple balade, ici c'est une production complete avec son pro.",
        "Logistique impeccable pour profiter du soleil et de la musique."
      ]
    },
    faqs: {
      es: [{ q: "Por que son el #1?", a: "Por consistencia en seguridad, calidad de bebidas y ambiente. Priorizamos comodidad." }],
      en: [{ q: "Why are you #1?", a: "Consistency in safety, drink quality, and vibe. We prioritize comfort." }],
      fr: [{ q: "Pourquoi etes-vous #1?", a: "Consistance en securite, qualite des boissons et ambiance. Confort prioritaire." }]
    },
    ctas: {
      es: ["Reserva el Tour #1 Ahora", "Cupos limitados"],
      en: ["Book the #1 Tour Now", "Limited spots"],
      fr: ["Reserver le tour #1", "Places limitees"]
    }
  }

];
