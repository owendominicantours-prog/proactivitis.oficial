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
      es: "A que hora pasa el transporte? Horarios de recogida del Party Boat en Punta Cana",
      en: "Pick-up Times in Punta Cana: Party Boat Transfer Guide",
      fr: "Horaires de pick-up a Punta Cana: guide Party Boat"
    },
    heroSubtitles: {
      es: "Pick-up confirmado y regreso sin estres. Todo claro antes de subir al boat.",
      en: "Confirmed pick-up and smooth return. Everything clear before you board.",
      fr: "Pick-up confirme et retour simple. Tout est clair avant l'embarquement."
    },
    metaDescriptions: {
      es: "Guia rapida de pick-up en Punta Cana: tiempos estimados, que llevar y como reservar directo sin comisiones.",
      en: "Quick pick-up guide in Punta Cana: estimated times, what to bring, and how to book direct with no hidden fees.",
      fr: "Guide rapide de pick-up a Punta Cana: temps estimes, quoi apporter, reservation directe sans frais caches."
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
      es: "Party Boat Punta Cana: salidas confirmadas con transporte incluido",
      en: "Party Boat Punta Cana: confirmed departures with hotel pick-up",
      fr: "Party Boat Punta Cana: departs confirmes avec pick-up hotel"
    },
    heroSubtitles: {
      es: "Te buscamos y te llevamos directo al check-in del catamaran.",
      en: "We pick you up and take you straight to catamaran check-in.",
      fr: "On vient te chercher et on t'emmene au check-in du catamaran."
    },
    metaDescriptions: {
      es: "Evita tours improvisados: salida real, transporte incluido, snorkel y Natural Pool con open bar.",
      en: "Skip random sellers: real departures, transport included, snorkel and Natural Pool with open bar.",
      fr: "Evite les vendeurs au hasard: departs reels, transport inclus, snorkel et Natural Pool."
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
      es: "Como llegar al Party Boat en Punta Cana (sin perder tiempo)",
      en: "How to reach the Party Boat in Punta Cana (no time wasted)",
      fr: "Comment rejoindre le Party Boat a Punta Cana (sans perdre du temps)"
    },
    heroSubtitles: {
      es: "Ruta simple: lobby, transporte, check-in, catamaran.",
      en: "Simple route: lobby, shuttle, check-in, catamaran.",
      fr: "Itineraire simple: lobby, navette, check-in, catamaran."
    },
    metaDescriptions: {
      es: "Guia practica: que esperar, tiempos estimados y consejos para llegar relajado al catamaran.",
      en: "Practical guide: what to expect, estimated times, and tips to arrive relaxed.",
      fr: "Guide pratique: a quoi s'attendre, temps estimes, conseils pour arriver detendu."
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
      es: "Adults Only en Punta Cana: Party Boat sin ambiente familiar",
      en: "Adults-only Party Boat in Punta Cana: no kids, premium vibe",
      fr: "Party Boat adults only a Punta Cana: sans enfants, ambiance premium"
    },
    heroSubtitles: {
      es: "Para adultos que quieren open bar y musica sin ruido de familias.",
      en: "For adults who want open bar and music without family crowds.",
      fr: "Pour adultes: open bar et musique sans ambiance familiale."
    },
    metaDescriptions: {
      es: "Boat party premium: mejores vibes, sin ninos, con transporte incluido y open bar.",
      en: "Premium boat party vibes: no kids, transport included, open bar.",
      fr: "Boat party premium: sans enfants, transport inclus, open bar."
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
      es: "Catamaran VIP con open bar premium en Punta Cana",
      en: "VIP catamaran with premium open bar in Punta Cana",
      fr: "Catamaran VIP avec open bar premium a Punta Cana"
    },
    heroSubtitles: {
      es: "Ambiente social con musica, open bar y servicio premium.",
      en: "Social vibe with music, open bar, and premium service.",
      fr: "Ambiance sociale, musique, open bar et service premium."
    },
    metaDescriptions: {
      es: "Boat party premium con open bar, snorkel y Natural Pool. Reserva directa.",
      en: "Premium boat party with open bar, snorkel, and Natural Pool. Book direct.",
      fr: "Boat party premium avec open bar, snorkel et Natural Pool. Reservation directe."
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
      es: "Precio directo del Party Boat en Punta Cana (sin intermediarios)",
      en: "Direct Party Boat price in Punta Cana (no middlemen)",
      fr: "Prix direct Party Boat a Punta Cana (sans intermediaires)"
    },
    heroSubtitles: {
      es: "Compra directo con pick-up confirmado y soporte real.",
      en: "Book direct with confirmed pick-up and real support.",
      fr: "Reserve direct avec pick-up confirme et support."
    },
    metaDescriptions: {
      es: "Comparativa real: reserva directa, sin comisiones ocultas, con el mismo servicio y transporte.",
      en: "Honest comparison: book direct, no hidden commissions, same service and transport.",
      fr: "Comparatif honnete: reserve direct, pas de commissions cachees, meme service et transport."
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
      es: "Comparativa 2026: cual es el mejor Party Boat de Punta Cana?",
      en: "2026 comparison: which Party Boat is best in Punta Cana?",
      fr: "Comparatif 2026: quel est le meilleur Party Boat a Punta Cana?"
    },
    heroSubtitles: {
      es: "Datos claros, precio directo y servicio con soporte real.",
      en: "Clear facts, direct price, and real support.",
      fr: "Faits clairs, prix direct et support reel."
    },
    metaDescriptions: {
      es: "Comparativa honesta: que incluye, como es la salida y por que conviene reservar directo.",
      en: "Honest comparison: inclusions, departure flow, and why direct booking helps.",
      fr: "Comparatif honnete: inclusions, depart, et pourquoi reserver direct."
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
      es: "Plan para hoy? Party Boat con cupos last minute en Punta Cana",
      en: "Looking for today? Party Boat last-minute spots in Punta Cana",
      fr: "Plan pour aujourd'hui? Party Boat last minute a Punta Cana"
    },
    heroSubtitles: {
      es: "Si quieres fiesta hoy, te lo resolvemos rapido.",
      en: "If you want to party today, we handle it fast.",
      fr: "Si tu veux faire la fete aujourd'hui, on gere vite."
    },
    metaDescriptions: {
      es: "Cupos limitados para hoy: snorkel, Natural Pool y open bar con transporte incluido.",
      en: "Limited spots for today: snorkel, Natural Pool, and open bar with transport included.",
      fr: "Places limitees aujourd'hui: snorkel, Natural Pool et open bar avec transport inclus."
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
      es: "Reserva ahora y sube hoy: Party Boat Punta Cana",
      en: "Book now and sail today: Party Boat Punta Cana",
      fr: "Reserve maintenant et partez aujourd'hui: Party Boat Punta Cana"
    },
    heroSubtitles: {
      es: "Reservas rapido, confirmacion inmediata, salida el mismo dia.",
      en: "Fast booking, instant confirmation, same-day departure.",
      fr: "Reservation rapide, confirmation immediate, depart le jour meme."
    },
    metaDescriptions: {
      es: "Oferta last minute con confirmacion rapida, open bar y snorkel incluidos.",
      en: "Last-minute offer with fast confirmation, open bar and snorkel included.",
      fr: "Offre last minute avec confirmation rapide, open bar et snorkel inclus."
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
      es: "Party Boat con snorkel y Piscina Natural en Punta Cana",
      en: "Party Boat with snorkel and Natural Pool in Punta Cana",
      fr: "Party Boat avec snorkel et Natural Pool a Punta Cana"
    },
    heroSubtitles: {
      es: "La combinacion perfecta: musica, open bar y paradas en el mar.",
      en: "The perfect combo: music, open bar, and sea stops.",
      fr: "Le combo parfait: musique, open bar et arrets en mer."
    },
    metaDescriptions: {
      es: "Excursion completa con musica, open bar, snorkel y parada en la Natural Pool. Reserva directa.",
      en: "Full excursion with music, open bar, snorkel, and Natural Pool stop. Book direct.",
      fr: "Excursion complete avec musique, open bar, snorkel et arret Natural Pool. Reservation directe."
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
  }
  ,
  {
    slug: "party-boat-adults-only-011",
    clusterId: "nicho_exclusivo",
    titles: {
      es: "Adults Only Party Boat Punta Cana: fiesta solo adultos",
      en: "Adults Only Party Boat Punta Cana: premium no-kids vibe",
      fr: "Party Boat Adults Only Punta Cana: ambiance premium sans enfants"
    },
    heroSubtitles: {
      es: "Ambiente exclusivo para mayores de 18 anos, open bar y musica nonstop.",
      en: "Exclusive 18+ crowd, open bar, and nonstop music.",
      fr: "Ambiance 18+ exclusive, open bar et musique continue."
    },
    metaDescriptions: {
      es: "Party Boat solo adultos en Punta Cana: open bar premium, DJ en vivo y snorkel lejos de multitudes.",
      en: "Adults-only party boat in Punta Cana: premium open bar, live DJ, and snorkel away from crowds.",
      fr: "Party boat adults only a Punta Cana: open bar premium, DJ live et snorkel loin des foules."
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
      es: "Private Bachelorette Boat Party Punta Cana: despedida en barco",
      en: "Private Bachelorette Boat Party Punta Cana: girls-only charter",
      fr: "Private Bachelorette Boat Party Punta Cana: charter prive entre filles"
    },
    heroSubtitles: {
      es: "Charter privado, musica personalizada y celebracion epica.",
      en: "Private charter, custom music, and an epic celebration.",
      fr: "Charter prive, musique personnalisee et celebration epique."
    },
    metaDescriptions: {
      es: "Despedida de soltera privada en Punta Cana: charter exclusivo, cocteles y parada en Natural Pool.",
      en: "Private bachelorette party in Punta Cana: exclusive charter, cocktails, and Natural Pool stop.",
      fr: "EVJF prive a Punta Cana: charter exclusif, cocktails et arret Natural Pool."
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
      es: "Best Booze Cruise for Singles Punta Cana: conoce gente",
      en: "Best Booze Cruise for Singles Punta Cana: meet new people",
      fr: "Best Booze Cruise pour singles Punta Cana: rencontrer du monde"
    },
    heroSubtitles: {
      es: "El punto social numero 1 para viajeros solteros.",
      en: "The #1 social spot for solo travelers.",
      fr: "Le spot social numero 1 pour voyageurs solos."
    },
    metaDescriptions: {
      es: "Booze Cruise para singles en Punta Cana: juegos, staff social y ambiente seguro para conocer gente.",
      en: "Singles booze cruise in Punta Cana: games, social staff, and a safe vibe to meet people.",
      fr: "Booze cruise pour singles a Punta Cana: jeux, staff social et ambiance sure."
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
      es: "Last minute boat party deals Punta Cana: cupos de hoy",
      en: "Last minute boat party deals Punta Cana: today spots",
      fr: "Last minute boat party deals Punta Cana: places du jour"
    },
    heroSubtitles: {
      es: "Ofertas de ultimo minuto con confirmacion rapida.",
      en: "Last-minute deals with fast confirmation.",
      fr: "Offres last minute avec confirmation rapide."
    },
    metaDescriptions: {
      es: "Descuentos last minute: open bar, snorkel y transporte con confirmacion inmediata.",
      en: "Last-minute discounts: open bar, snorkel, and transport with instant confirmation.",
      fr: "Promos last minute: open bar, snorkel et transport avec confirmation immediate."
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

];
