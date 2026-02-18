import type { Locale } from "@/lib/translations";

export type TourMarketIntent = {
  id: string;
  keyword: Record<Locale, string>;
  heroPrefix: Record<Locale, string>;
  angle: Record<Locale, string>;
};

export const TOUR_MARKET_INTENTS: TourMarketIntent[] = [
  {
    id: "best-tour-punta-cana",
    keyword: { es: "mejor tour en Punta Cana", en: "best tour in punta cana", fr: "meilleur tour a punta cana" },
    heroPrefix: { es: "Mejor opcion", en: "Top choice", fr: "Meilleur choix" },
    angle: {
      es: "Recomendado para viajeros que quieren una experiencia segura y bien organizada.",
      en: "Recommended for travelers who want a safe and well-organized experience.",
      fr: "Recommande aux voyageurs qui veulent une experience sure et bien organisee."
    }
  },
  {
    id: "tour-with-hotel-pickup",
    keyword: { es: "tour con recogida en hotel Punta Cana", en: "tour with hotel pickup punta cana", fr: "tour avec pickup hotel punta cana" },
    heroPrefix: { es: "Pickup incluido", en: "Hotel pickup included", fr: "Pickup hotel inclus" },
    angle: {
      es: "Ideal si quieres reservar sin complicaciones de transporte.",
      en: "Perfect if you want to book without transportation hassles.",
      fr: "Ideal si vous voulez reserver sans complications de transport."
    }
  },
  {
    id: "family-friendly-tour",
    keyword: { es: "tour familiar punta cana", en: "family friendly tour punta cana", fr: "tour famille punta cana" },
    heroPrefix: { es: "Plan familiar", en: "Family plan", fr: "Plan famille" },
    angle: {
      es: "Pensado para familias con ritmo comodo y logistica clara.",
      en: "Designed for families with comfortable pace and clear logistics.",
      fr: "Concu pour les familles avec un rythme confortable et une logistique claire."
    }
  },
  {
    id: "private-tour",
    keyword: { es: "tour privado punta cana", en: "private tour punta cana", fr: "tour prive punta cana" },
    heroPrefix: { es: "Experiencia privada", en: "Private experience", fr: "Experience privee" },
    angle: {
      es: "Para quienes prefieren privacidad total y servicio personalizado.",
      en: "For travelers who prefer full privacy and personalized service.",
      fr: "Pour les voyageurs qui preferent une experience privee et personnalisee."
    }
  },
  {
    id: "small-group-tour",
    keyword: { es: "tour grupo pequeno punta cana", en: "small group tour punta cana", fr: "tour petit groupe punta cana" },
    heroPrefix: { es: "Grupo pequeno", en: "Small-group option", fr: "Option petit groupe" },
    angle: {
      es: "Menos personas, mejor atencion y experiencia mas fluida.",
      en: "Fewer people, better attention, and a smoother experience.",
      fr: "Moins de personnes, meilleure attention et experience plus fluide."
    }
  },
  {
    id: "last-minute-tour",
    keyword: { es: "tour de ultima hora punta cana", en: "last minute tour punta cana", fr: "tour derniere minute punta cana" },
    heroPrefix: { es: "Reserva hoy", en: "Book today", fr: "Reserve aujourd hui" },
    angle: {
      es: "Confirmacion rapida para viajeros que deciden sobre la marcha.",
      en: "Fast confirmation for travelers booking on short notice.",
      fr: "Confirmation rapide pour les voyageurs qui reservent a la derniere minute."
    }
  },
  {
    id: "couples-tour",
    keyword: { es: "tour para parejas punta cana", en: "couples tour punta cana", fr: "tour couples punta cana" },
    heroPrefix: { es: "Plan para parejas", en: "Couples plan", fr: "Plan couples" },
    angle: {
      es: "Perfecto para escapadas con ambiente premium y tiempos bien coordinados.",
      en: "Perfect for couple getaways with premium atmosphere and smooth timing.",
      fr: "Parfait pour les escapades en couple avec ambiance premium."
    }
  },
  {
    id: "luxury-tour",
    keyword: { es: "tour de lujo punta cana", en: "luxury tour punta cana", fr: "tour de luxe punta cana" },
    heroPrefix: { es: "Version premium", en: "Luxury option", fr: "Option luxe" },
    angle: {
      es: "Para clientes que priorizan calidad, confort y servicio VIP.",
      en: "For travelers who prioritize quality, comfort, and VIP service.",
      fr: "Pour les clients qui priorisent qualite, confort et service VIP."
    }
  },
  {
    id: "adventure-tour",
    keyword: { es: "tour de aventura punta cana", en: "adventure tour punta cana", fr: "tour aventure punta cana" },
    heroPrefix: { es: "Aventura real", en: "Real adventure", fr: "Aventure reelle" },
    angle: {
      es: "Ideal para viajeros que buscan adrenalina y actividad al aire libre.",
      en: "Great for travelers looking for adrenaline and outdoor action.",
      fr: "Ideal pour les voyageurs qui recherchent adrenaline et activites outdoor."
    }
  },
  {
    id: "all-inclusive-tour",
    keyword: { es: "tour todo incluido punta cana", en: "all inclusive tour punta cana", fr: "tour tout compris punta cana" },
    heroPrefix: { es: "Todo incluido", en: "All-inclusive option", fr: "Option tout compris" },
    angle: {
      es: "Menos friccion y mejor conversion para clientes que quieren precio cerrado.",
      en: "Lower friction and better conversion for travelers who want fixed pricing.",
      fr: "Moins de friction pour les clients qui veulent un prix ferme."
    }
  },
  {
    id: "morning-tour",
    keyword: { es: "tour por la manana punta cana", en: "morning tour punta cana", fr: "tour matin punta cana" },
    heroPrefix: { es: "Salida temprana", en: "Morning departure", fr: "Depart matin" },
    angle: {
      es: "Ideal para aprovechar el dia y regresar temprano al hotel.",
      en: "Perfect to maximize your day and return early to the resort.",
      fr: "Ideal pour profiter de la journee et rentrer tot a l hotel."
    }
  },
  {
    id: "afternoon-tour",
    keyword: { es: "tour por la tarde punta cana", en: "afternoon tour punta cana", fr: "tour apres-midi punta cana" },
    heroPrefix: { es: "Salida por la tarde", en: "Afternoon departure", fr: "Depart apres-midi" },
    angle: {
      es: "Buena opcion para viajeros que llegan tarde o quieren descanso previo.",
      en: "Great option for travelers arriving late or preferring a relaxed morning.",
      fr: "Bonne option pour les voyageurs arrivant tard ou voulant se reposer."
    }
  },
  {
    id: "sunset-tour",
    keyword: { es: "tour al atardecer punta cana", en: "sunset tour punta cana", fr: "tour coucher de soleil punta cana" },
    heroPrefix: { es: "Atardecer en Punta Cana", en: "Sunset in Punta Cana", fr: "Coucher de soleil a Punta Cana" },
    angle: {
      es: "Una experiencia visual potente con alto valor percibido.",
      en: "Strong visual experience with high perceived value.",
      fr: "Experience visuelle forte avec grande valeur percue."
    }
  },
  {
    id: "budget-tour",
    keyword: { es: "tour economico punta cana", en: "budget tour punta cana", fr: "tour economique punta cana" },
    heroPrefix: { es: "Mejor precio", en: "Best value", fr: "Meilleur prix" },
    angle: {
      es: "Para clientes que comparan precio, sin perder seguridad operativa.",
      en: "For price-sensitive travelers without sacrificing operational safety.",
      fr: "Pour les clients sensibles au prix sans perdre la securite."
    }
  },
  {
    id: "vip-tour",
    keyword: { es: "tour vip punta cana", en: "vip tour punta cana", fr: "tour vip punta cana" },
    heroPrefix: { es: "Edicion VIP", en: "VIP edition", fr: "Edition VIP" },
    angle: {
      es: "Enfocado en servicio premium y experiencia diferenciada.",
      en: "Focused on premium service and differentiated experience.",
      fr: "Concentre sur un service premium et une experience differenciee."
    }
  },
  {
    id: "instagrammable-tour",
    keyword: { es: "tour instagram punta cana", en: "instagrammable tour punta cana", fr: "tour instagrammable punta cana" },
    heroPrefix: { es: "Tour fotogenico", en: "Photo-ready tour", fr: "Tour photogenique" },
    angle: {
      es: "Ideal para contenido social con spots visuales fuertes.",
      en: "Ideal for social content with highly visual spots.",
      fr: "Ideal pour du contenu social avec des spots tres visuels."
    }
  },
  {
    id: "multilingual-tour",
    keyword: { es: "tour en ingles espanol punta cana", en: "multilingual tour punta cana", fr: "tour multilingue punta cana" },
    heroPrefix: { es: "Guias multilingues", en: "Multilingual guides", fr: "Guides multilingues" },
    angle: {
      es: "Mayor confianza para viajeros internacionales.",
      en: "Higher confidence for international travelers.",
      fr: "Meilleure confiance pour les voyageurs internationaux."
    }
  },
  {
    id: "hotel-resort-tour",
    keyword: { es: "tour desde resort punta cana", en: "tour from resort punta cana", fr: "tour depuis resort punta cana" },
    heroPrefix: { es: "Desde tu resort", en: "From your resort", fr: "Depuis votre resort" },
    angle: {
      es: "Pickup coordinado desde hoteles para reducir friccion.",
      en: "Hotel pickup coordination to reduce booking friction.",
      fr: "Pickup hotel coordonne pour reduire la friction."
    }
  },
  {
    id: "airport-to-tour-plan",
    keyword: { es: "plan tour tras llegada punta cana", en: "post-arrival tour plan punta cana", fr: "plan tour apres arrivee punta cana" },
    heroPrefix: { es: "Plan post-llegada", en: "Post-arrival plan", fr: "Plan apres arrivee" },
    angle: {
      es: "Conecta traslado + tour para cerrar venta completa.",
      en: "Connect transfer + tour to close full-trip sales.",
      fr: "Reliez transfert + tour pour conclure une vente complete."
    }
  },
  {
    id: "cruise-guest-tour",
    keyword: { es: "tour para cruceristas punta cana", en: "cruise guest tour punta cana", fr: "tour croisiere punta cana" },
    heroPrefix: { es: "Para cruceristas", en: "For cruise guests", fr: "Pour croisiere" },
    angle: {
      es: "Horarios y logistica pensados para tiempo limitado en destino.",
      en: "Timing and logistics optimized for limited time in destination.",
      fr: "Horaires et logistique optimises pour un temps limite."
    }
  },
  {
    id: "rainy-day-tour",
    keyword: { es: "tour para dia nublado punta cana", en: "rainy day tour punta cana", fr: "tour jour de pluie punta cana" },
    heroPrefix: { es: "Plan alterno", en: "Backup plan", fr: "Plan alternatif" },
    angle: {
      es: "Opciones robustas para mantener ventas incluso con clima variable.",
      en: "Strong alternatives to keep sales moving in variable weather.",
      fr: "Alternatives solides pour maintenir les ventes meme avec meteo variable."
    }
  },
  {
    id: "first-time-tour",
    keyword: { es: "primer tour en punta cana", en: "first time tour punta cana", fr: "premier tour punta cana" },
    heroPrefix: { es: "Primera vez", en: "First-time traveler", fr: "Premiere visite" },
    angle: {
      es: "Diseñado para quienes visitan Punta Cana por primera vez.",
      en: "Designed for travelers visiting Punta Cana for the first time.",
      fr: "Concu pour les voyageurs qui visitent Punta Cana pour la premiere fois."
    }
  },
  {
    id: "repeat-visitor-tour",
    keyword: { es: "tour diferente punta cana", en: "different tour punta cana", fr: "tour different punta cana" },
    heroPrefix: { es: "Para viajeros recurrentes", en: "For repeat visitors", fr: "Pour voyageurs recurrent" },
    angle: {
      es: "Enfoque en experiencias menos obvias para cliente repetidor.",
      en: "Focus on less-obvious experiences for repeat travelers.",
      fr: "Focus sur des experiences moins evidentes pour clients recurrents."
    }
  },
  {
    id: "premium-service-tour",
    keyword: { es: "tour servicio premium punta cana", en: "premium service tour punta cana", fr: "tour service premium punta cana" },
    heroPrefix: { es: "Servicio premium", en: "Premium service", fr: "Service premium" },
    angle: {
      es: "Orientado a clientes que valoran operacion impecable.",
      en: "Designed for travelers who value flawless operations.",
      fr: "Oriente clients qui privilegient une operation sans fallas."
    }
  },
  {
    id: "safe-tour-option",
    keyword: { es: "tour seguro punta cana", en: "safe tour punta cana", fr: "tour securise punta cana" },
    heroPrefix: { es: "Opcion segura", en: "Safe option", fr: "Option securisee" },
    angle: {
      es: "Priorizamos operadores verificados y protocolos claros.",
      en: "We prioritize verified operators and clear protocols.",
      fr: "Nous priorisons des operateurs verifies et des protocoles clairs."
    }
  },
  {
    id: "value-for-money-tour",
    keyword: { es: "tour mejor relacion calidad precio punta cana", en: "best value tour punta cana", fr: "meilleur rapport qualite prix tour punta cana" },
    heroPrefix: { es: "Mejor valor", en: "Best value", fr: "Meilleur rapport qualite-prix" },
    angle: {
      es: "Balance ideal entre precio competitivo y experiencia de calidad.",
      en: "Ideal balance between competitive price and quality experience.",
      fr: "Equilibre ideal entre prix competitif et experience de qualite."
    }
  },
  {
    id: "express-booking-tour",
    keyword: { es: "reserva rapida tour punta cana", en: "fast booking tour punta cana", fr: "reservation rapide tour punta cana" },
    heroPrefix: { es: "Reserva express", en: "Express booking", fr: "Reservation express" },
    angle: {
      es: "Pensado para cerrar ventas rapido desde movil.",
      en: "Built for fast mobile conversion and quick bookings.",
      fr: "Concu pour une conversion mobile rapide."
    }
  },
  {
    id: "whatsapp-confirmed-tour",
    keyword: { es: "tour confirmado por whatsapp punta cana", en: "whatsapp confirmed tour punta cana", fr: "tour confirme whatsapp punta cana" },
    heroPrefix: { es: "Confirmacion por WhatsApp", en: "WhatsApp confirmation", fr: "Confirmation WhatsApp" },
    angle: {
      es: "Confianza inmediata con soporte en tiempo real.",
      en: "Instant trust with real-time support.",
      fr: "Confiance immediate avec support en temps reel."
    }
  },
  {
    id: "airport-transfer-plus-tour",
    keyword: { es: "traslado + tour punta cana", en: "transfer plus tour punta cana", fr: "transfert + tour punta cana" },
    heroPrefix: { es: "Combo traslado + tour", en: "Transfer + tour combo", fr: "Combo transfert + tour" },
    angle: {
      es: "Maximiza conversion ofreciendo movilidad y experiencia en un mismo flujo.",
      en: "Maximize conversion by selling mobility and experience in one flow.",
      fr: "Maximisez la conversion en vendant mobilite et experience ensemble."
    }
  },
  {
    id: "top-rated-tour",
    keyword: { es: "tour mejor valorado punta cana", en: "top rated tour punta cana", fr: "tour mieux note punta cana" },
    heroPrefix: { es: "Alta valoracion", en: "Top rated", fr: "Tres bien note" },
    angle: {
      es: "Basado en lo que mas reservan y recomiendan los viajeros.",
      en: "Built around what travelers book and recommend most.",
      fr: "Base sur ce que les voyageurs reservent et recommandent le plus."
    }
  }
];

export const TOUR_MARKET_INTENT_COUNT = TOUR_MARKET_INTENTS.length;

export const buildTourMarketVariantSlug = (tourSlug: string, intentId: string) =>
  `${tourSlug}--mkt-${intentId}`;

export const parseTourMarketVariantSlug = (variantSlug: string) => {
  const marker = "--mkt-";
  const index = variantSlug.indexOf(marker);
  if (index <= 0) return null;
  const tourSlug = variantSlug.slice(0, index).trim();
  const intentId = variantSlug.slice(index + marker.length).trim();
  if (!tourSlug || !intentId) return null;
  const intent = TOUR_MARKET_INTENTS.find((item) => item.id === intentId);
  if (!intent) return null;
  return { tourSlug, intent };
};
