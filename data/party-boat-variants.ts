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
    slug: "party-boat-logistica-hard-rock-punta-cana-001",
    clusterId: "logistica",
    titles: {
      es: "A que hora pasa el transporte? Horarios de recogida del Party Boat en Hard Rock Punta Cana",
      en: "Pick-up Times from Hard Rock Punta Cana: Party Boat Transfer Guide",
      fr: "Horaires de pick-up depuis Hard Rock Punta Cana: Guide Party Boat"
    },
    heroSubtitles: {
      es: "Pick-up confirmado desde el lobby del Hard Rock y regreso sin estres.",
      en: "Confirmed lobby pick-up plus smooth return - no guessing.",
      fr: "Pick-up confirme au lobby et retour simple, sans stress."
    },
    metaDescriptions: {
      es: "Guia rapida para salir al Party Boat desde Hard Rock Punta Cana: pick-up, tiempos estimados, que llevar y como reservar sin comisiones.",
      en: "Your simple guide: Hard Rock pick-up, estimated times, what to bring, and how to book direct (no hidden fees).",
      fr: "Guide simple: pick-up Hard Rock, temps estimes, quoi apporter, et reservation directe sans frais caches."
    },
    bodyBlocks: {
      es: [
        "Desde Hard Rock Punta Cana la recogida se coordina por lobby o punto designado, con hora confirmada tras la reserva.",
        "La salida incluye transporte ida y vuelta, briefing, snorkeling y parada en la Natural Pool con open bar.",
        "Te decimos exactamente que llevar, como vestirte y como evitar perder tiempo en el resort."
      ],
      en: [
        "From Hard Rock Punta Cana, pick-up is coordinated at the lobby or a designated spot, with a confirmed time after booking.",
        "The departure includes round-trip transport, briefing, snorkeling, and a Natural Pool stop with open bar.",
        "We share exactly what to bring, how to dress, and how to avoid wasting time at the resort."
      ],
      fr: [
        "Depuis Hard Rock Punta Cana, le pick-up se fait au lobby ou au point designe, avec horaire confirme apres reservation.",
        "Le depart inclut transport aller-retour, briefing, snorkeling et arret Natural Pool avec open bar.",
        "On te dit quoi apporter, comment t'habiller et comment eviter de perdre du temps a l'hotel."
      ]
    },
    faqs: {
      es: [
        {
          q: "Donde es el punto exacto de recogida en Hard Rock?",
          a: "Normalmente es el lobby o un punto designado. Te confirmamos el lugar exacto por WhatsApp despues de reservar."
        }
      ],
      en: [
        {
          q: "Where exactly is the pick-up point at Hard Rock?",
          a: "Usually the lobby or a designated spot. We confirm the exact location via WhatsApp after booking."
        }
      ],
      fr: [
        {
          q: "Ou est le point de pick-up a Hard Rock?",
          a: "Generalement au lobby ou un point designe. Confirmation par WhatsApp apres reservation."
        }
      ]
    },
    ctas: {
      es: ["Confirmar pick-up", "Ver disponibilidad"],
      en: ["Confirm pick-up", "Check availability"],
      fr: ["Confirmer pick-up", "Voir disponibilite"]
    }
  },
  {
    slug: "party-boat-logistica-hard-rock-punta-cana-002",
    clusterId: "logistica",
    titles: {
      es: "Party Boat Punta Cana: salidas confirmadas desde Hard Rock (pick-up en el lobby)",
      en: "Party Boat from Hard Rock Punta Cana: Confirmed Departures and Lobby Pick-up",
      fr: "Party Boat depuis Hard Rock Punta Cana: departs confirmes et pick-up lobby"
    },
    heroSubtitles: {
      es: "Te buscamos en tu hotel y te llevamos directo al boat check-in.",
      en: "We pick you up and take you straight to the boat check-in.",
      fr: "On vient te chercher et on t'emmene au check-in du bateau."
    },
    metaDescriptions: {
      es: "Evita tours improvisados: salida real, transporte incluido, snorkel y Natural Pool con open bar. Desde Hard Rock, facil y rapido.",
      en: "Skip random beach sellers: real departures, transport included, snorkel and Natural Pool with open bar. Easy from Hard Rock.",
      fr: "Evite les vendeurs sur la plage: departs reels, transport inclus, snorkel et Natural Pool avec open bar. Facile depuis Hard Rock."
    },
    bodyBlocks: {
      es: [
        "Hard Rock es grande: por eso damos instrucciones claras del punto de pick-up y la hora exacta confirmada.",
        "La experiencia combina musica, bebidas, snorkeling y parada en aguas poco profundas para fotos y relax.",
        "Ideal si quieres una excursion sin drama: tu solo bajas al lobby y listo."
      ],
      en: [
        "Hard Rock is huge, so we give clear instructions for the pick-up point and the exact confirmed time.",
        "The experience combines music, drinks, snorkeling, and a shallow-water stop for photos and relax.",
        "Ideal if you want a no-drama excursion: just walk to the lobby and you are set."
      ],
      fr: [
        "Hard Rock est immense, donc on donne des instructions claires pour le point de pick-up et l'heure exacte confirmee.",
        "L'experience combine musique, boissons, snorkeling et arret en eaux peu profondes pour photos et relax.",
        "Ideal si tu veux une excursion sans stress: tu descends au lobby et c'est tout."
      ]
    },
    faqs: {
      es: [
        {
          q: "Cuanto dura la excursion completa con transporte?",
          a: "Depende del punto de salida, pero normalmente es una experiencia de medio dia con ida y vuelta incluida."
        }
      ],
      en: [
        {
          q: "How long is the full experience including transport?",
          a: "It varies by departure point, but it is typically a half-day tour including round-trip transport."
        }
      ],
      fr: [
        {
          q: "Quelle est la duree totale avec transport?",
          a: "Cela depend, mais c'est generalement une excursion d'une demi-journee avec transport aller-retour."
        }
      ]
    },
    ctas: {
      es: ["Ver disponibilidad", "Reserva ahora"],
      en: ["Check availability", "Book now"],
      fr: ["Voir disponibilite", "Reserver"]
    }
  },
  {
    slug: "party-boat-logistica-hard-rock-punta-cana-003",
    clusterId: "logistica",
    titles: {
      es: "Como llegar al Party Boat desde Hard Rock Punta Cana (sin perder tiempo)",
      en: "How to Reach the Party Boat from Hard Rock Punta Cana (No Time Wasted)",
      fr: "Comment rejoindre le Party Boat depuis Hard Rock (sans perdre du temps)"
    },
    heroSubtitles: {
      es: "Ruta simple: lobby, transporte, check-in, catamaran.",
      en: "Simple route: lobby, shuttle, check-in, catamaran.",
      fr: "Itineraire simple: lobby, navette, check-in, catamaran."
    },
    metaDescriptions: {
      es: "Guia practica para huespedes del Hard Rock: que esperar, tiempos estimados y consejos para llegar relajado al catamaran.",
      en: "Practical guide for Hard Rock guests: what to expect, estimated times, and tips to arrive relaxed.",
      fr: "Guide pratique pour clients Hard Rock: a quoi s'attendre, temps estimes, conseils pour arriver detendu."
    },
    bodyBlocks: {
      es: [
        "Te recogemos en el hotel (lobby o punto indicado) y vas directo al check-in del catamaran.",
        "La excursion incluye snorkeling, Natural Pool y open bar con musica y animacion.",
        "Consejo pro: llega 10 minutos antes al punto de recogida para evitar retrasos."
      ],
      en: [
        "We pick you up at the hotel (lobby or assigned point) and take you straight to catamaran check-in.",
        "The excursion includes snorkeling, Natural Pool, and open bar with music and entertainment.",
        "Pro tip: arrive 10 minutes early at the pick-up point to avoid delays."
      ],
      fr: [
        "On vient te chercher a l'hotel (lobby ou point indique) et tu vas direct au check-in du catamaran.",
        "L'excursion inclut snorkeling, Natural Pool et open bar avec musique et animation.",
        "Conseil pro: arrive 10 minutes avant le pick-up pour eviter les retards."
      ]
    },
    faqs: {
      es: [
        {
          q: "Puedo reservar si ya estoy en el hotel?",
          a: "Si. Este es el mejor momento: reservas y recibes hora de recogida confirmada."
        }
      ],
      en: [
        {
          q: "Can I book if I am already at the hotel?",
          a: "Yes. It is the best time: you book and receive a confirmed pick-up time."
        }
      ],
      fr: [
        {
          q: "Je peux reserver depuis l'hotel?",
          a: "Oui, c'est ideal: tu reserves et tu recois un horaire confirme."
        }
      ]
    },
    ctas: {
      es: ["Confirmar pick-up", "Reservar"],
      en: ["Confirm pick-up", "Book"],
      fr: ["Confirmer pick-up", "Reserver"]
    }
  },
  {
    slug: "party-boat-nicho_exclusivo-hard-rock-punta-cana-004",
    clusterId: "nicho_exclusivo",
    titles: {
      es: "Adults Only desde Hard Rock: Party Boat sin ambiente familiar (nivel premium)",
      en: "Adults Only Party Boat from Hard Rock: No Kids, Just Premium Vibes",
      fr: "Party Boat Adults Only depuis Hard Rock: Sans enfants, ambiance premium"
    },
    heroSubtitles: {
      es: "Para adultos que quieren open bar y musica sin ruido de familias.",
      en: "For adults who want open bar and music without family crowds.",
      fr: "Pour adultes: open bar et musique sans ambiance familiale."
    },
    metaDescriptions: {
      es: "Opcion exclusiva para huespedes del Hard Rock: boat party premium, mejores vibes, sin ninos, con transporte incluido.",
      en: "Exclusive option for Hard Rock guests: premium boat party vibes, no kids, transport included.",
      fr: "Option exclusive Hard Rock: boat party premium, sans enfants, transport inclus."
    },
    bodyBlocks: {
      es: [
        "Si estas en Hard Rock y quieres algo mas fino, esta salida esta pensada para adultos.",
        "Ambiente social, musica, cocteles y paradas para snorkel y Natural Pool.",
        "Ideal para grupos 25-40, parejas o despedidas que buscan nivel."
      ],
      en: [
        "If you are at Hard Rock and want something more refined, this departure is designed for adults.",
        "Social vibe, music, cocktails, plus snorkeling and Natural Pool stops.",
        "Ideal for 25-40 groups, couples, or celebrations that want a higher level."
      ],
      fr: [
        "Si tu es a Hard Rock et tu veux quelque chose de plus premium, cette sortie est pour adultes.",
        "Ambiance sociale, musique, cocktails, plus stops snorkeling et Natural Pool.",
        "Ideal pour groupes 25-40, couples ou celebrations haut de gamme."
      ]
    },
    faqs: {
      es: [
        {
          q: "Que significa Adults Only en esta experiencia?",
          a: "Que el ambiente esta diseno para adultos: musica, ritmo y grupo similar, no enfoque familiar."
        }
      ],
      en: [
        {
          q: "What does Adults Only mean here?",
          a: "The vibe is designed for adults: music, energy, and similar crowd, not family focused."
        }
      ],
      fr: [
        {
          q: "Que veut dire Adults Only ici?",
          a: "Ambiance pensee pour adultes: musique, energie, public similaire, pas oriente familles."
        }
      ]
    },
    ctas: {
      es: ["Reserva VIP", "Ver opciones premium"],
      en: ["Book VIP", "View premium options"],
      fr: ["Reserver VIP", "Options premium"]
    }
  },
  {
    slug: "party-boat-seguridad_comparativa-hard-rock-punta-cana-005",
    clusterId: "seguridad_comparativa",
    titles: {
      es: "No pagues comision del lobby: precio directo del Party Boat desde Hard Rock Punta Cana",
      en: "Do not pay lobby commission: direct Party Boat price from Hard Rock Punta Cana",
      fr: "Ne paie pas la commission du lobby: prix direct Party Boat depuis Hard Rock"
    },
    heroSubtitles: {
      es: "Compra directo, sin intermediarios, con pick-up confirmado.",
      en: "Book direct, no middlemen, with confirmed pick-up.",
      fr: "Reserve direct, sans intermediaires, pick-up confirme."
    },
    metaDescriptions: {
      es: "Comparativa real: por que pagar en el hotel sale mas caro. Reserva directo el Party Boat desde Hard Rock con garantia y soporte.",
      en: "Honest comparison: why hotel desks cost more. Book direct from Hard Rock with support and guarantee.",
      fr: "Comparatif honnete: pourquoi l'hotel coute plus cher. Reserve direct avec support et garantie."
    },
    bodyBlocks: {
      es: [
        "Muchos huespedes pagan de mas por comodidad. Nosotros te damos el precio directo y el mismo pick-up.",
        "Incluye snorkel, Natural Pool y open bar, sin sorpresas ni fees escondidos.",
        "Te atendemos por WhatsApp: confirmacion clara, punto exacto y listo."
      ],
      en: [
        "Many guests pay extra for convenience. We give you direct pricing and the same pick-up.",
        "Includes snorkel, Natural Pool, and open bar, with no surprises or hidden fees.",
        "We assist via WhatsApp: clear confirmation, exact pick-up point, done."
      ],
      fr: [
        "Beaucoup de clients paient plus pour la commodite. Nous offrons le prix direct et le meme pick-up.",
        "Inclut snorkel, Natural Pool et open bar, sans surprises ni frais caches.",
        "Assistance WhatsApp: confirmation claire, point exact, c'est tout."
      ]
    },
    faqs: {
      es: [
        {
          q: "Por que el precio del hotel suele ser mas alto?",
          a: "Porque muchas veces incluyen comisiones de intermediacion. Directo suele ser mejor precio."
        }
      ],
      en: [
        {
          q: "Why is the hotel desk price usually higher?",
          a: "Because they often add intermediary commissions. Direct booking is usually better priced."
        }
      ],
      fr: [
        {
          q: "Pourquoi l'hotel est plus cher?",
          a: "Souvent a cause des commissions. La reservation directe est generalement moins chere."
        }
      ]
    },
    ctas: {
      es: ["Ver precio directo", "Reservar con garantia"],
      en: ["See direct price", "Book with guarantee"],
      fr: ["Prix direct", "Reserver garanti"]
    }
  },
  {
    slug: "party-boat-urgencia_last_minute-hard-rock-punta-cana-006",
    clusterId: "urgencia_last_minute",
    titles: {
      es: "Plan para hoy? Party Boat desde Hard Rock con cupos last minute (pick-up rapido)",
      en: "Looking for today? Party Boat from Hard Rock with last-minute spots (fast pick-up)",
      fr: "Plan pour aujourd'hui? Party Boat depuis Hard Rock (places last minute)"
    },
    heroSubtitles: {
      es: "Si estas en el Hard Rock y quieres fiesta hoy, te lo resolvemos.",
      en: "At Hard Rock and want to party today? We got you.",
      fr: "A Hard Rock et envie de fete aujourd'hui? On s'occupe de tout."
    },
    metaDescriptions: {
      es: "Cupos limitados para hoy: snorkel, Natural Pool y open bar con transporte incluido desde Hard Rock Punta Cana.",
      en: "Limited spots for today: snorkel, Natural Pool and open bar with transport from Hard Rock Punta Cana.",
      fr: "Places limitees aujourd'hui: snorkel, Natural Pool et open bar avec transport depuis Hard Rock."
    },
    bodyBlocks: {
      es: [
        "Este es el plan perfecto si te despertaste con ganas de mar y musica.",
        "Reservas rapido, confirmamos pick-up y te llevamos directo al catamaran.",
        "Ideal para grupos, parejas y amigos, sin complicarte en el resort."
      ],
      en: [
        "Perfect plan if you woke up wanting ocean and music.",
        "Book fast, we confirm pick-up, and take you straight to the catamaran.",
        "Ideal for groups, couples, and friends, no hassle at the resort."
      ],
      fr: [
        "Plan parfait si tu te reveilles avec envie de mer et musique.",
        "Reservation rapide, pick-up confirme, direction catamaran.",
        "Ideal pour groupes, couples et amis, sans stress a l'hotel."
      ]
    },
    faqs: {
      es: [
        {
          q: "Se puede reservar el mismo dia?",
          a: "Si, mientras haya cupo. Escribenos y te confirmamos disponibilidad inmediata."
        }
      ],
      en: [
        {
          q: "Can I book the same day?",
          a: "Yes, as long as spots are available. Message us and we confirm instantly."
        }
      ],
      fr: [
        {
          q: "Je peux reserver le jour meme?",
          a: "Oui, si places disponibles. Ecris-nous et on confirme tout de suite."
        }
      ]
    },
    ctas: {
      es: ["Cupo hoy", "Reservar ahora"],
      en: ["Today spots", "Book now"],
      fr: ["Places aujourd'hui", "Reserver maintenant"]
    }
  }
];
