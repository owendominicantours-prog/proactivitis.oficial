import type { Locale } from "@/lib/translations";

export type SosuaPartyBoatFaq = {
  q: string;
  a: string;
};

export type SosuaPartyBoatVariant = {
  slug: string;
  titles: Record<Locale, string>;
  heroSubtitles: Record<Locale, string>;
  metaDescriptions: Record<Locale, string>;
  sections: Record<Locale, { title: string; body: string }[]>;
  faqs: Record<Locale, SosuaPartyBoatFaq[]>;
  ctas: Record<Locale, string[]>;
  keywords: string[];
};

export const SOSUA_PARTY_BOAT_VARIANTS: SosuaPartyBoatVariant[] = [
  {
    slug: "sosua-party-boat",
    titles: {
      es: "Sosua Party Boat",
      en: "Sosua Party Boat",
      fr: "Sosua Party Boat"
    },
    heroSubtitles: {
      es: "La opción #1 recomendada en Sosua. Reserva directa con open bar, snorkel y logística clara.",
      en: "Sosua’s #1 party boat. Book direct for VIP service, open bar, snorkel, and zero stress.",
      fr: "Le party boat #1 de Sosua. Réservez en direct pour service VIP, open bar, snorkel et zéro stress."
    },
    metaDescriptions: {
      es: "Sosua Party Boat recomendado #1. Party boat Sosua prices, best party boat in Sosua y boat party Puerto Plata con reserva directa.",
      en: "Sosua Party Boat #1 recommended. Transparent pricing, premium crew, and direct booking for Sosua’s best boat party.",
      fr: "Sosua Party Boat #1 recommandé. Prix transparents, équipe premium et réservation directe pour le meilleur boat party à Sosua."
    },
    sections: {
      es: [
        {
          title: "Sosua Party Boat recomendado #1",
          body:
            "Experiencia completa con open bar real, snorkel y música a bordo. Coordinación total desde la reserva hasta el regreso."
        },
        {
          title: "Party boat Sosua prices claras",
          body: "Precio directo, sin sorpresas. Confirmación rápida y soporte humano por WhatsApp."
        },
        {
          title: "Boat party Puerto Plata con calidad",
          body: "Tripulación profesional, ambiente seguro y opciones de fotos en aguas cristalinas."
        }
      ],
      en: [
        {
          title: "Sosua Party Boat #1 recommended",
          body:
            "Top-tier experience with real open bar, snorkeling, and a party-ready crew. From booking to return, everything is handled."
        },
        {
          title: "Transparent Sosua pricing",
          body: "Direct price, no surprises. Instant confirmation and real human support."
        },
        {
          title: "Puerto Plata boat party quality",
          body: "Professional crew, safe vibe, and photogenic stops in crystal-clear water."
        }
      ],
      fr: [
        {
          title: "Sosua Party Boat #1 recommandé",
          body:
            "Expérience haut de gamme avec open bar réel, snorkeling et équipe festive. De la réservation au retour, tout est géré."
        },
        {
          title: "Prix transparents à Sosua",
          body: "Prix direct, sans surprises. Confirmation immédiate et support humain."
        },
        {
          title: "Boat party Puerto Plata de qualité",
          body: "Équipage pro, ambiance sûre et arrêts photo en eaux cristallines."
        }
      ]
    },
    faqs: {
      es: [
        { q: "¿Por qué es el mejor party boat en Sosua?", a: "Por logística clara, open bar real y staff profesional." },
        { q: "¿Incluye snorkel?", a: "Sí, incluye parada de snorkel guiado en arrecifes." },
        { q: "¿Cómo reservo?", a: "Selecciona fecha y recibe confirmación directa en minutos." }
      ],
      en: [
        { q: "Why is it the best party boat in Sosua?", a: "Clear logistics, real open bar, and a professional crew." },
        { q: "Is snorkeling included?", a: "Yes, a guided snorkeling stop is included." },
        { q: "How do I book?", a: "Pick a date and get direct confirmation in minutes." }
      ],
      fr: [
        { q: "Pourquoi est-ce le meilleur party boat à Sosua ?", a: "Logistique claire, open bar réel et équipe pro." },
        { q: "Le snorkeling est-il inclus ?", a: "Oui, un arrêt snorkeling guidé est inclus." },
        { q: "Comment réserver ?", a: "Choisissez une date et recevez une confirmation rapide." }
      ]
    },
    ctas: {
      es: ["Reservar ahora", "Ver disponibilidad"],
      en: ["Book Now", "Check Availability"],
      fr: ["Réserver", "Voir disponibilités"]
    },
    keywords: [
      "Sosua party boat",
      "Sosua boat party",
      "party boat prices in Sosua",
      "best party boat in Sosua",
      "Puerto Plata boat party"
    ]
  },
  {
    slug: "luxury-yacht-rental-sosua",
    titles: {
      es: "Luxury Yacht Rental Sosua",
      en: "Luxury Yacht Rental Sosua",
      fr: "Luxury Yacht Rental Sosua"
    },
    heroSubtitles: {
      es: "Lujo total con champagne, catering premium y tripulación dedicada para tu grupo privado.",
      en: "Ultra-luxury private yacht with champagne, premium catering, and a dedicated crew.",
      fr: "Yacht privé ultra-luxe avec champagne, catering premium et équipage dédié."
    },
    metaDescriptions: {
      es: "Luxury Yacht Rental Sosua con private yacht charter Sosua, VIP party boat Sosua y luxury catamaran Sosua.",
      en: "Luxury yacht rental in Sosua with private charter, VIP service, and a premium catamaran experience.",
      fr: "Location de yacht de luxe à Sosua avec charter privé, service VIP et expérience catamaran premium."
    },
    sections: {
      es: [
        { title: "Private yacht charter Sosua", body: "Barco privado con tripulación dedicada, horarios personalizados y experiencia exclusiva." },
        { title: "VIP party boat Sosua", body: "Open bar premium, champagne y atención personalizada para grupos exigentes." },
        { title: "Luxury catamaran Sosua", body: "Espacios cómodos, música seleccionada y catering premium disponible." }
      ],
      en: [
        { title: "Private yacht charter Sosua", body: "Private yacht with dedicated crew, custom schedule, and exclusive experience." },
        { title: "VIP party boat Sosua", body: "Premium open bar, champagne, and white-glove service for elite groups." },
        { title: "Luxury catamaran Sosua", body: "Spacious comfort, curated music, and high-end catering on request." }
      ],
      fr: [
        { title: "Private yacht charter Sosua", body: "Yacht privé, équipage dédié, horaires sur mesure et expérience exclusive." },
        { title: "VIP party boat Sosua", body: "Open bar premium, champagne et service haut de gamme pour groupes exigeants." },
        { title: "Luxury catamaran Sosua", body: "Confort, musique choisie et catering premium sur demande." }
      ]
    },
    faqs: {
      es: [
        { q: "¿Se puede personalizar el menú?", a: "Sí, ofrecemos opciones de catering premium bajo reserva." },
        { q: "¿Es 100% privado?", a: "Sí, el barco es exclusivo para tu grupo." },
        { q: "¿Incluye open bar premium?", a: "Incluye bebidas premium y opciones especiales." }
      ],
      en: [
        { q: "Can we customize the menu?", a: "Yes, premium catering options are available on request." },
        { q: "Is it 100% private?", a: "Yes, the boat is exclusive for your group." },
        { q: "Is premium open bar included?", a: "Premium drinks and special options are included." }
      ],
      fr: [
        { q: "Peut-on personnaliser le menu ?", a: "Oui, options de catering premium sur demande." },
        { q: "C’est 100% privé ?", a: "Oui, le bateau est exclusif pour votre groupe." },
        { q: "Open bar premium inclus ?", a: "Oui, boissons premium et options spéciales incluses." }
      ]
    },
    ctas: {
      es: ["Cotizar lujo", "Reservar VIP"],
      en: ["Get Luxury Quote", "Book VIP"],
      fr: ["Devis luxe", "Réserver VIP"]
    },
    keywords: [
      "luxury yacht rental in Sosua",
      "private yacht charter Sosua",
      "VIP party boat Sosua",
      "luxury catamaran in Sosua"
    ]
  },
  {
    slug: "sosua-bachelor-party-boat",
    titles: {
      es: "Sosua Bachelor Party Boat",
      en: "Sosua Bachelor Party Boat",
      fr: "Sosua Bachelor Party Boat"
    },
    heroSubtitles: {
      es: "Paquetes para despedidas con DJ, bebidas ilimitadas y seguridad completa.",
      en: "Epic bachelor party packages with DJ, unlimited drinks, and full security.",
      fr: "Packages d’enterrement épiques avec DJ, boissons illimitées et sécurité complète."
    },
    metaDescriptions: {
      es: "Sosua Bachelor Party Boat con Sosua bachelorette party ideas, stag do boat party Sosua y group party boat Sosua.",
      en: "Sosua bachelor party boat with bachelorette ideas, stag-do options, and group party boat packages.",
      fr: "Boat party pour enterrement à Sosua avec options EVJF/EVG et packs pour groupes."
    },
    sections: {
      es: [
        { title: "Group party boat Sosua", body: "Paquetes para grupos con música, open bar y staff enfocado en seguridad." },
        { title: "Sosua bachelorette party ideas", body: "Decoración, playlist personalizada y coordinación previa con el equipo." },
        { title: "Stag do boat party Sosua", body: "Ambiente adulto, DJ y experiencia lista para celebrar sin estrés." }
      ],
      en: [
        { title: "Group party boat Sosua", body: "High-energy group packages with open bar and a security-first team." },
        { title: "Sosua bachelorette party ideas", body: "Custom decor, curated playlists, and pre-planned logistics." },
        { title: "Stag do boat party Sosua", body: "Adult-only vibe, DJ on request, and a no-stress celebration." }
      ],
      fr: [
        { title: "Group party boat Sosua", body: "Packages pour groupes avec open bar et équipe orientée sécurité." },
        { title: "Sosua bachelorette party ideas", body: "Décor sur mesure, playlists et logistique anticipée." },
        { title: "Stag do boat party Sosua", body: "Ambiance adulte, DJ sur demande et fête sans stress." }
      ]
    },
    faqs: {
      es: [
        { q: "¿Hay opciones con DJ?", a: "Sí, puedes solicitar DJ y playlist personalizada." },
        { q: "¿Incluye bebidas ilimitadas?", a: "Sí, open bar durante la salida." },
        { q: "¿Es seguro para grupos grandes?", a: "Sí, contamos con staff y protocolos de seguridad." }
      ],
      en: [
        { q: "Is a DJ available?", a: "Yes, you can request a DJ and custom playlist." },
        { q: "Are unlimited drinks included?", a: "Yes, open bar during the trip." },
        { q: "Is it safe for large groups?", a: "Yes, we have staff and safety protocols." }
      ],
      fr: [
        { q: "DJ disponible ?", a: "Oui, DJ et playlist personnalisée sur demande." },
        { q: "Boissons illimitées ?", a: "Oui, open bar pendant la sortie." },
        { q: "Sécurisé pour grands groupes ?", a: "Oui, équipe et protocoles de sécurité." }
      ]
    },
    ctas: {
      es: ["Reservar despedida", "Cotizar grupo"],
      en: ["Book the Party", "Get Group Quote"],
      fr: ["Réserver", "Devis groupe"]
    },
    keywords: [
      "Sosua bachelor party boat",
      "Sosua bachelorette party boat",
      "stag do boat party Sosua",
      "group party boat in Sosua"
    ]
  },
  {
    slug: "cheap-party-boat-sosua",
    titles: {
      es: "Cheap Party Boat Sosua",
      en: "Cheap Party Boat Sosua",
      fr: "Cheap Party Boat Sosua"
    },
    heroSubtitles: {
      es: "El mejor precio garantizado para grupos pequeños y salidas compartidas.",
      en: "Best price guaranteed without sacrificing service or fun.",
      fr: "Meilleur prix garanti sans sacrifier le service ni l’ambiance."
    },
    metaDescriptions: {
      es: "Cheap Party Boat Sosua con affordable boat rental Sosua, Sosua boat tour shared y party boat Sosua deals.",
      en: "Cheap party boat in Sosua with shared tours, affordable pricing, and limited-time deals.",
      fr: "Boat party pas cher à Sosua avec sorties partagées, tarifs abordables et offres limitées."
    },
    sections: {
      es: [
        { title: "Affordable boat rental Sosua", body: "Opciones económicas sin perder calidad en servicio." },
        { title: "Sosua boat tour shared", body: "Salida compartida ideal para viajeros que buscan buen precio." },
        { title: "Party boat Sosua deals", body: "Promociones en fechas específicas y confirmación rápida." }
      ],
      en: [
        { title: "Affordable boat rental Sosua", body: "Budget-smart options with real service and real open bar." },
        { title: "Sosua boat tour shared", body: "Shared trips for travelers who want value without compromise." },
        { title: "Party boat Sosua deals", body: "Limited deals on select dates with instant confirmation." }
      ],
      fr: [
        { title: "Affordable boat rental Sosua", body: "Options économiques avec service réel et open bar." },
        { title: "Sosua boat tour shared", body: "Sorties partagées pour voyageurs en quête de valeur." },
        { title: "Party boat Sosua deals", body: "Offres limitées avec confirmation rapide." }
      ]
    },
    faqs: {
      es: [
        { q: "¿Es compartido?", a: "Sí, hay opciones compartidas para mejor precio." },
        { q: "¿Incluye open bar?", a: "Sí, open bar con bebidas locales." },
        { q: "¿Qué días hay ofertas?", a: "Depende de disponibilidad; confirma por WhatsApp." }
      ],
      en: [
        { q: "Is it shared?", a: "Yes, shared options for a better price." },
        { q: "Is open bar included?", a: "Yes, open bar with local drinks." },
        { q: "What days have deals?", a: "Depends on availability; confirm via WhatsApp." }
      ],
      fr: [
        { q: "C’est partagé ?", a: "Oui, options partagées pour meilleur prix." },
        { q: "Open bar inclus ?", a: "Oui, open bar avec boissons locales." },
        { q: "Quels jours en promo ?", a: "Selon disponibilité; confirmation WhatsApp." }
      ]
    },
    ctas: {
      es: ["Ver ofertas", "Reservar económico"],
      en: ["See Deals", "Book the Best Price"],
      fr: ["Voir promos", "Réserver meilleur prix"]
    },
    keywords: [
      "cheap party boat Sosua",
      "affordable boat rental in Sosua",
      "shared boat tour Sosua",
      "party boat deals in Sosua"
    ]
  },
  {
    slug: "sosua-snorkeling-and-party-boat",
    titles: {
      es: "Sosua Snorkeling and Party Boat",
      en: "Sosua Snorkeling and Party Boat",
      fr: "Sosua Snorkeling and Party Boat"
    },
    heroSubtitles: {
      es: "Fiesta y aventura en un solo plan con snorkel, open bar y vistas del Caribe.",
      en: "High-energy party + crystal-clear snorkeling in one powerful experience.",
      fr: "Fête intense + snorkeling en eaux cristallines dans une seule expérience."
    },
    metaDescriptions: {
      es: "Sosua snorkeling and party boat con catamaran tour Sosua with open bar, Sosua bay boat trip y snorkel cruise Sosua.",
      en: "Sosua snorkeling and party boat with open bar, catamaran cruise, and bay stops.",
      fr: "Sortie snorkeling & boat party à Sosua avec open bar, catamaran et arrêts dans la baie."
    },
    sections: {
      es: [
        { title: "Catamaran tour Sosua with open bar", body: "Combina snorkel, música y open bar en una salida completa." },
        { title: "Sosua bay boat trip", body: "Recorre la bahía con paradas para fotos y ambiente relajado." },
        { title: "Snorkel cruise Sosua", body: "Parada guiada para ver arrecifes y vida marina." }
      ],
      en: [
        { title: "Catamaran tour Sosua with open bar", body: "Snorkel, music, and open bar in one premium trip." },
        { title: "Sosua bay boat trip", body: "Cruise the bay with photo stops and a curated vibe." },
        { title: "Snorkel cruise Sosua", body: "Guided reef stop with quality gear and crew." }
      ],
      fr: [
        { title: "Catamaran tour Sosua with open bar", body: "Snorkel, musique et open bar dans une sortie premium." },
        { title: "Sosua bay boat trip", body: "Balade avec arrêts photo et ambiance soignée." },
        { title: "Snorkel cruise Sosua", body: "Arrêt guidé récif avec équipement de qualité." }
      ]
    },
    faqs: {
      es: [
        { q: "¿El snorkel es guiado?", a: "Sí, con equipo y guía incluido." },
        { q: "¿Es apto para familias?", a: "Sí, es una mezcla de aventura y diversión." },
        { q: "¿Qué debo llevar?", a: "Traje de baño, toalla y protector solar." }
      ],
      en: [
        { q: "Is snorkeling guided?", a: "Yes, gear and guide included." },
        { q: "Is it family friendly?", a: "Yes, it blends adventure and fun." },
        { q: "What should I bring?", a: "Swimsuit, towel, and sunscreen." }
      ],
      fr: [
        { q: "Le snorkeling est-il guidé ?", a: "Oui, équipement et guide inclus." },
        { q: "Adapté aux familles ?", a: "Oui, aventure et fun réunis." },
        { q: "Que faut-il apporter ?", a: "Maillot, serviette et crème solaire." }
      ]
    },
    ctas: {
      es: ["Reservar snorkel", "Ver horarios"],
      en: ["Book Snorkeling", "See Schedule"],
      fr: ["Réserver snorkeling", "Voir horaires"]
    },
    keywords: [
      "Sosua snorkeling and party boat",
      "Sosua catamaran tour with open bar",
      "Sosua bay boat trip",
      "snorkel cruise in Sosua"
    ]
  },
  {
    slug: "sosua-sunset-boat-party",
    titles: {
      es: "Sosua Sunset Boat Party",
      en: "Sosua Sunset Boat Party",
      fr: "Sosua Sunset Boat Party"
    },
    heroSubtitles: {
      es: "Salida al atardecer con música, open bar y ambiente romántico.",
      en: "Golden-hour cruise with open bar, music, and premium sunset views.",
      fr: "Croisière golden hour avec open bar, musique et coucher de soleil premium."
    },
    metaDescriptions: {
      es: "Sosua sunset boat party con sunset cruise Sosua beach, evening boat party Sosua y romantic sunset boat Puerto Plata.",
      en: "Sosua sunset boat party with golden-hour cruise, evening vibes, and romantic sunset views.",
      fr: "Boat party au coucher du soleil à Sosua avec ambiance soirée et vues romantiques."
    },
    sections: {
      es: [
        { title: "Sunset cruise Sosua beach", body: "Disfruta el atardecer con bebidas frías y música suave." },
        { title: "Evening boat party Sosua", body: "Pre-party ideal para empezar la noche con amigos." },
        { title: "Romantic sunset boat Puerto Plata", body: "Plan perfecto para parejas y celebraciones íntimas." }
      ],
      en: [
        { title: "Sunset cruise Sosua beach", body: "Stunning sunset views with premium drinks and music." },
        { title: "Evening boat party Sosua", body: "The perfect pre-party for high-energy nights." },
        { title: "Romantic sunset boat Puerto Plata", body: "Ideal for couples and luxury celebrations." }
      ],
      fr: [
        { title: "Sunset cruise Sosua beach", body: "Coucher de soleil spectaculaire avec boissons premium." },
        { title: "Evening boat party Sosua", body: "Pré-soirée parfaite avant une grande nuit." },
        { title: "Romantic sunset boat Puerto Plata", body: "Idéal pour couples et célébrations luxe." }
      ]
    },
    faqs: {
      es: [
        { q: "¿A qué hora sale?", a: "Generalmente alrededor de las 5:00 PM." },
        { q: "¿Incluye open bar?", a: "Sí, bebidas locales incluidas." },
        { q: "¿Se puede reservar en pareja?", a: "Sí, es ideal para parejas." }
      ],
      en: [
        { q: "What time does it leave?", a: "Usually around 5:00 PM." },
        { q: "Is open bar included?", a: "Yes, local drinks included." },
        { q: "Can couples book?", a: "Yes, perfect for couples." }
      ],
      fr: [
        { q: "À quelle heure le départ ?", a: "Généralement vers 17h." },
        { q: "Open bar inclus ?", a: "Oui, boissons locales incluses." },
        { q: "Peut-on réserver en couple ?", a: "Oui, idéal pour couples." }
      ]
    },
    ctas: {
      es: ["Reservar sunset", "Ver disponibilidad"],
      en: ["Book Sunset", "Check Availability"],
      fr: ["Réserver sunset", "Voir disponibilités"]
    },
    keywords: [
      "Sosua sunset boat party",
      "sunset cruise in Sosua",
      "evening boat party Sosua",
      "romantic sunset cruise Puerto Plata"
    ]
  },
  {
    slug: "private-boat-hire-sosua",
    titles: {
      es: "Private Boat Hire Sosua",
      en: "Private Boat Hire Sosua",
      fr: "Private Boat Hire Sosua"
    },
    heroSubtitles: {
      es: "Alquila el barco solo para tu grupo con personalización total.",
      en: "Exclusive private charter with total customization for your group.",
      fr: "Charter privé exclusif avec personnalisation totale pour votre groupe."
    },
    metaDescriptions: {
      es: "Private boat hire Sosua con birthday party boat Sosua, corporate boat events Sosua y private catamaran Sosua beach.",
      en: "Private boat hire in Sosua for birthdays, corporate events, and private catamaran experiences.",
      fr: "Location privée à Sosua pour anniversaires, événements corporate et catamaran privé."
    },
    sections: {
      es: [
        { title: "Birthday party boat Sosua", body: "Decoración, música y logística personalizada para cumpleaños." },
        { title: "Corporate boat events Sosua", body: "Eventos corporativos con servicio premium y coordinación completa." },
        { title: "Private catamaran Sosua beach", body: "Experiencia privada con horarios a tu medida." }
      ],
      en: [
        { title: "Birthday party boat Sosua", body: "Premium decor, music, and custom logistics for birthdays." },
        { title: "Corporate boat events Sosua", body: "Executive-ready events with premium service and coordination." },
        { title: "Private catamaran Sosua beach", body: "Your boat, your schedule, your rules." }
      ],
      fr: [
        { title: "Birthday party boat Sosua", body: "Décor premium, musique et logistique sur mesure." },
        { title: "Corporate boat events Sosua", body: "Événements corporate avec service premium et coordination totale." },
        { title: "Private catamaran Sosua beach", body: "Votre bateau, votre horaire, vos règles." }
      ]
    },
    faqs: {
      es: [
        { q: "¿Se puede personalizar el evento?", a: "Sí, adaptamos música, comida y horario." },
        { q: "¿Incluye catering?", a: "Opcional bajo reserva previa." },
        { q: "¿Cuántas personas caben?", a: "Depende del barco y la opción seleccionada." }
      ],
      en: [
        { q: "Can the event be customized?", a: "Yes, we adapt music, food, and schedule." },
        { q: "Is catering included?", a: "Optional with prior booking." },
        { q: "How many people can fit?", a: "Depends on the boat and option." }
      ],
      fr: [
        { q: "Peut-on personnaliser l’événement ?", a: "Oui, musique, nourriture et horaire adaptés." },
        { q: "Catering inclus ?", a: "Optionnel sur réservation." },
        { q: "Combien de personnes ?", a: "Selon le bateau et l’option." }
      ]
    },
    ctas: {
      es: ["Cotizar privado", "Reservar evento"],
      en: ["Get Private Quote", "Book Event"],
      fr: ["Devis privé", "Réserver événement"]
    },
    keywords: [
      "private boat hire Sosua",
      "birthday party boat Sosua",
      "corporate boat events Sosua",
      "private catamaran Sosua"
    ]
  },
  {
    slug: "best-boat-tours-in-sosua-review",
    titles: {
      es: "Best Boat Tours in Sosua Review",
      en: "Best Boat Tours in Sosua Review",
      fr: "Best Boat Tours in Sosua Review"
    },
    heroSubtitles: {
      es: "Comparativa honesta con los mejores boat tours en Sosua. Nuestra opción #1.",
      en: "Honest comparison of the best boat tours in Sosua. Our option wins on value.",
      fr: "Comparatif honnête des meilleurs boat tours à Sosua. Notre option domine en valeur."
    },
    metaDescriptions: {
      es: "Best boat tours in Sosua review con Sosua party boat vs catamaran, top rated boat rentals Sosua y Puerto Plata boat party reviews.",
      en: "Best boat tours in Sosua review with comparisons, top-rated rentals, and real traveler feedback.",
      fr: "Avis des meilleurs boat tours à Sosua avec comparatifs, locations top notées et retours réels."
    },
    sections: {
      es: [
        { title: "Sosua party boat vs catamaran", body: "Comparativa clara de duración, inclusiones y logística." },
        { title: "Top rated boat rentals Sosua", body: "Reseñas y experiencias reales de viajeros." },
        { title: "Puerto Plata boat party reviews", body: "Qué dicen los viajeros sobre calidad-precio y servicio." }
      ],
      en: [
        { title: "Sosua party boat vs catamaran", body: "Side-by-side comparison of duration, inclusions, and logistics." },
        { title: "Top rated boat rentals Sosua", body: "Real reviews, real results, real value." },
        { title: "Puerto Plata boat party reviews", body: "Why travelers rank us #1 for price vs quality." }
      ],
      fr: [
        { title: "Sosua party boat vs catamaran", body: "Comparatif clair durée, inclusions et logistique." },
        { title: "Top rated boat rentals Sosua", body: "Avis réels et retours concrets." },
        { title: "Puerto Plata boat party reviews", body: "Pourquoi nous sommes #1 en qualité-prix." }
      ]
    },
    faqs: {
      es: [
        { q: "¿Por qué somos la opción #1?", a: "Por consistencia en calidad, logística y soporte." },
        { q: "¿Qué incluye?", a: "Open bar, snorkel y coordinación total." },
        { q: "¿Cómo comparar opciones?", a: "Revisa inclusiones y confirma puntos de salida." }
      ],
      en: [
        { q: "Why are we #1?", a: "Consistency in quality, logistics, and support." },
        { q: "What’s included?", a: "Open bar, snorkeling, and full coordination." },
        { q: "How to compare options?", a: "Check inclusions and confirm meeting points." }
      ],
      fr: [
        { q: "Pourquoi sommes-nous #1 ?", a: "Qualité, logistique et support constants." },
        { q: "Qu’est-ce qui est inclus ?", a: "Open bar, snorkeling et coordination complète." },
        { q: "Comment comparer ?", a: "Vérifiez les inclusions et points de départ." }
      ]
    },
    ctas: {
      es: ["Ver comparativa", "Reservar #1"],
      en: ["See Comparison", "Book #1"],
      fr: ["Voir comparatif", "Réserver #1"]
    },
    keywords: [
      "best boat tours in Sosua",
      "Sosua party boat vs catamaran",
      "top rated boat rentals in Sosua",
      "Puerto Plata boat party reviews"
    ]
  },
  {
    slug: "last-minute-boat-rental-sosua",
    titles: {
      es: "Last Minute Boat Rental Sosua",
      en: "Last Minute Boat Rental Sosua",
      fr: "Last Minute Boat Rental Sosua"
    },
    heroSubtitles: {
      es: "Reserva hoy mismo con confirmación rápida vía WhatsApp.",
      en: "Book today. Fast WhatsApp confirmation and real-time availability.",
      fr: "Réservez aujourd’hui. Confirmation WhatsApp rapide et disponibilité en temps réel."
    },
    metaDescriptions: {
      es: "Last minute boat rental Sosua con book boat Sosua today, same day party boat Sosua y available boat rentals Sosua.",
      en: "Last-minute boat rental in Sosua with same-day options and fast WhatsApp confirmation.",
      fr: "Location de bateau dernière minute à Sosua avec options le jour même et confirmation rapide."
    },
    sections: {
      es: [
        { title: "Book boat Sosua today", body: "Confirmamos cupo en minutos y coordinamos pick-up." },
        { title: "Same day party boat Sosua", body: "Ideal para planes de último minuto con salida el mismo día." },
        { title: "Available boat rentals Sosua", body: "Disponibilidad en tiempo real y soporte directo." }
      ],
      en: [
        { title: "Book boat Sosua today", body: "We confirm in minutes and lock your spot fast." },
        { title: "Same day party boat Sosua", body: "Last-minute plans? We move fast and deliver." },
        { title: "Available boat rentals Sosua", body: "Live availability and direct human support." }
      ],
      fr: [
        { title: "Book boat Sosua today", body: "Confirmation en minutes et place sécurisée." },
        { title: "Same day party boat Sosua", body: "Dernière minute? On s’occupe de tout." },
        { title: "Available boat rentals Sosua", body: "Disponibilité en temps réel et support direct." }
      ]
    },
    faqs: {
      es: [
        { q: "¿Hay cupo hoy?", a: "Depende de disponibilidad; confirmamos en minutos." },
        { q: "¿Cómo se confirma?", a: "Por WhatsApp con datos de la reserva." },
        { q: "¿Incluye pick-up?", a: "Sí, coordinamos tras confirmar." }
      ],
      en: [
        { q: "Is there availability today?", a: "Depends on availability; we confirm fast." },
        { q: "How is it confirmed?", a: "Via WhatsApp with your booking details." },
        { q: "Is pick-up included?", a: "Yes, coordinated after confirmation." }
      ],
      fr: [
        { q: "Disponibilité aujourd’hui ?", a: "Selon disponibilité; confirmation rapide." },
        { q: "Comment confirmer ?", a: "Via WhatsApp avec les détails de réservation." },
        { q: "Pick-up inclus ?", a: "Oui, après confirmation." }
      ]
    },
    ctas: {
      es: ["Reservar hoy", "Confirmar cupo"],
      en: ["Book Today", "Confirm Spot"],
      fr: ["Réserver aujourd’hui", "Confirmer place"]
    },
    keywords: [
      "last minute boat rental Sosua",
      "book a boat in Sosua today",
      "same day party boat Sosua",
      "available boat rentals Sosua"
    ]
  },
  {
    slug: "puerto-plata-party-boat",
    titles: {
      es: "Puerto Plata Party Boat",
      en: "Puerto Plata Party Boat",
      fr: "Puerto Plata Party Boat"
    },
    heroSubtitles: {
      es: "Capturamos a los viajeros de cruceros en Amber Cove y Taino Bay.",
      en: "Perfect for cruise guests from Amber Cove and Taino Bay.",
      fr: "Parfait pour les croisiéristes d’Amber Cove et Taino Bay."
    },
    metaDescriptions: {
      es: "Puerto Plata party boat con party boat from Amber Cove, Taino Bay boat excursions y boat trips near Puerto Plata.",
      en: "Puerto Plata party boat for Amber Cove and Taino Bay cruise guests with nearby boat trips.",
      fr: "Boat party à Puerto Plata pour les croisiéristes d’Amber Cove et Taino Bay."
    },
    sections: {
      es: [
        { title: "Party boat from Amber Cove", body: "Recogida coordinada para cruceristas con horarios claros." },
        { title: "Taino Bay boat excursions", body: "Experiencia completa en barco con open bar y snorkel." },
        { title: "Boat trips near Puerto Plata", body: "Opciones rápidas y confiables cerca del puerto." }
      ],
      en: [
        { title: "Party boat from Amber Cove", body: "Cruise-friendly pick-up with precise timing." },
        { title: "Taino Bay boat excursions", body: "Full experience with open bar, snorkeling, and real service." },
        { title: "Boat trips near Puerto Plata", body: "Fast, reliable departures close to port." }
      ],
      fr: [
        { title: "Party boat from Amber Cove", body: "Pick-up croisiéristes avec horaires précis." },
        { title: "Taino Bay boat excursions", body: "Expérience complète avec open bar et snorkeling." },
        { title: "Boat trips near Puerto Plata", body: "Départs rapides et fiables près du port." }
      ]
    },
    faqs: {
      es: [
        { q: "¿Cuánto dura la salida?", a: "Aproximadamente 4 horas, según logística." },
        { q: "¿Incluye transporte desde el puerto?", a: "Sí, coordinamos pick-up para cruceristas." },
        { q: "¿Se puede reservar con poco tiempo?", a: "Sí, confirmamos según disponibilidad." }
      ],
      en: [
        { q: "How long is the trip?", a: "About 4 hours depending on logistics." },
        { q: "Is port pick-up included?", a: "Yes, we coordinate pick-up for cruise guests." },
        { q: "Can I book last minute?", a: "Yes, based on availability." }
      ],
      fr: [
        { q: "Durée de la sortie ?", a: "Environ 4 heures selon la logistique." },
        { q: "Pick-up au port inclus ?", a: "Oui, pour croisiéristes." },
        { q: "Réservation de dernière minute ?", a: "Oui, selon disponibilité." }
      ]
    },
    ctas: {
      es: ["Reservar puerto", "Consultar horarios"],
      en: ["Book from Port", "Check Schedule"],
      fr: ["Réserver au port", "Voir horaires"]
    },
    keywords: [
      "Puerto Plata party boat",
      "party boat from Amber Cove",
      "Taino Bay boat excursions",
      "boat trips near Puerto Plata"
    ]
  }
];
