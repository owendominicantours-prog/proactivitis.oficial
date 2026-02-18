import type { Locale } from "@/lib/translations";

export type TransferQuestionSalesLanding = {
  slug: string;
  question: Record<Locale, string>;
  shortAnswer: Record<Locale, string>;
  salesBody: Record<Locale, string>;
  seoTitle: Record<Locale, string>;
  seoDescription: Record<Locale, string>;
  keywords: string[];
};

export const TRANSFER_QUESTION_SALES_LANDINGS: TransferQuestionSalesLanding[] = [
  {
    slug: "is-premium-transfers-punta-cana-legit",
    question: {
      es: "Is premium transfers punta cana legit?",
      en: "Is premium transfers punta cana legit?",
      fr: "Is premium transfers punta cana legit?"
    },
    shortAnswer: {
      es: "Si, siempre que reserves con operador verificado, precios claros y soporte real antes y despues del vuelo.",
      en: "Yes, if you book with a verified operator that offers transparent pricing and real support before and after landing.",
      fr: "Oui, si vous reservez avec un operateur verifie qui offre des prix clairs et un vrai support avant et apres l arrivee."
    },
    salesBody: {
      es: "Nuestra recomendacion comercial: reserva transfer premium con confirmacion inmediata, seguimiento de vuelo y opcion de tours con pickup en hotel para resolver todo en una sola compra.",
      en: "Our commercial recommendation: book a premium transfer with instant confirmation, flight tracking, and optional hotel-pickup tours in one single purchase.",
      fr: "Notre recommandation commerciale: reservez un transfert premium avec confirmation immediate, suivi du vol et option tours avec pickup hotel en un seul achat."
    },
    seoTitle: {
      es: "Is premium transfers punta cana legit? Guia real para reservar seguro",
      en: "Is premium transfers punta cana legit? Real guide to book safely",
      fr: "Is premium transfers punta cana legit? Guide reel pour reserver en securite"
    },
    seoDescription: {
      es: "Respuesta clara a si los premium transfers en Punta Cana son legitimos y como reservar traslado + tours con operador confiable.",
      en: "Clear answer to whether premium transfers in Punta Cana are legit and how to book transfer + tours with a trusted operator.",
      fr: "Reponse claire sur la legitimite des premium transfers a Punta Cana et comment reserver transfert + tours avec un operateur fiable."
    },
    keywords: ["is premium transfers punta cana legit", "punta cana vip transfer", "private transfer punta cana"]
  },
  {
    slug: "how-much-are-airport-transfers-in-punta-cana",
    question: {
      es: "How much are airport transfers in Punta Cana?",
      en: "How much are airport transfers in Punta Cana?",
      fr: "How much are airport transfers in Punta Cana?"
    },
    shortAnswer: {
      es: "Depende de zona, tipo de vehiculo y si reservas ida y vuelta. Lo importante es precio fijo y sin cargos sorpresa.",
      en: "It depends on zone, vehicle class, and round-trip setup. The key is fixed pricing with no hidden charges.",
      fr: "Cela depend de la zone, du vehicule et de l option aller-retour. L essentiel est un tarif fixe sans frais caches."
    },
    salesBody: {
      es: "Convierte mejor cuando vendes valor: traslado privado + tours con pickup desde hotel, todo confirmado por WhatsApp.",
      en: "Conversion is stronger when you sell value: private transfer + hotel pickup tours, all confirmed on WhatsApp.",
      fr: "La conversion est plus forte quand vous vendez la valeur: transfert prive + tours avec pickup hotel, tout confirme par WhatsApp."
    },
    seoTitle: {
      es: "How much are airport transfers in Punta Cana? Tarifas y estrategia inteligente",
      en: "How much are airport transfers in Punta Cana? Rates and smart booking strategy",
      fr: "How much are airport transfers in Punta Cana? Tarifs et strategie de reservation"
    },
    seoDescription: {
      es: "Cuanto cuesta un transfer en Punta Cana, cuando conviene reservar y como combinar traslado con tours para ahorrar tiempo.",
      en: "How much transfers cost in Punta Cana, when to book, and how to combine transfer with tours to save time.",
      fr: "Combien coute un transfert a Punta Cana, quand reserver et comment combiner transfert + tours pour gagner du temps."
    },
    keywords: ["how much are airport transfers in punta cana", "puj transfer price", "punta cana airport transfer cost"]
  },
  {
    slug: "can-i-use-uber-in-punta-cana-airport",
    question: {
      es: "Can I use Uber in Punta Cana Airport?",
      en: "Can I use Uber in Punta Cana Airport?",
      fr: "Can I use Uber in Punta Cana Airport?"
    },
    shortAnswer: {
      es: "Puede variar por zona y hora. Para evitar friccion al salir del aeropuerto, un transfer reservado suele ser mas predecible.",
      en: "Availability can vary by area and timing. For smoother airport exit, pre-booked transfer is typically more predictable.",
      fr: "La disponibilite peut varier selon la zone et l horaire. Pour une sortie aeroport sans friction, un transfert reserve est souvent plus fiable."
    },
    salesBody: {
      es: "Nuestro enfoque de venta: seguridad operativa primero. Confirmas chofer, punto de encuentro y pickup hotel antes de aterrizar.",
      en: "Our sales angle: operational certainty first. Driver, meeting point, and hotel drop-off are confirmed before touchdown.",
      fr: "Notre angle commercial: fiabilite operationnelle d abord. Chauffeur, point de rencontre et drop-off hotel confirmes avant l atterrissage."
    },
    seoTitle: {
      es: "Can I use Uber in Punta Cana Airport? Mejor alternativa para llegar al hotel",
      en: "Can I use Uber in Punta Cana Airport? Better option to reach your hotel",
      fr: "Can I use Uber in Punta Cana Airport? Meilleure option pour rejoindre votre hotel"
    },
    seoDescription: {
      es: "Guia clara sobre Uber en PUJ y por que muchos viajeros prefieren transfer privado confirmado con precio fijo.",
      en: "Clear guide on Uber at PUJ and why many travelers prefer fixed-price confirmed private transfer.",
      fr: "Guide clair sur Uber a PUJ et pourquoi beaucoup de voyageurs preferent un transfert prive confirme a tarif fixe."
    },
    keywords: ["can i use uber in punta cana airport", "puj airport transportation", "private transfer punta cana airport"]
  },
  {
    slug: "how-much-is-the-vip-at-punta-cana-airport",
    question: {
      es: "How much is the VIP at the Punta Cana Airport?",
      en: "How much is the VIP at the Punta Cana Airport?",
      fr: "How much is the VIP at the Punta Cana Airport?"
    },
    shortAnswer: {
      es: "Los servicios VIP cambian por temporada y proveedor. Lo mas estable es asegurar transporte premium fuera del aeropuerto.",
      en: "VIP airport services vary by season and provider. The most stable premium move is securing private transport outside terminal.",
      fr: "Les services VIP aeroport varient selon la saison et le fournisseur. Le choix premium le plus stable est le transport prive hors terminal."
    },
    salesBody: {
      es: "Posicion comercial: si ya pagas VIP, protege la experiencia con Cadillac/Suburban y continuidad hasta hotel y tours.",
      en: "Commercial angle: if you already pay for VIP, protect the experience with Cadillac/Suburban continuity to hotel and tours.",
      fr: "Angle commercial: si vous payez deja le VIP, protegez l experience avec Cadillac/Suburban jusqu a l hotel et aux tours."
    },
    seoTitle: {
      es: "How much is the VIP at Punta Cana Airport? Y como extender el nivel VIP al traslado",
      en: "How much is the VIP at Punta Cana Airport? And how to extend VIP to transfer",
      fr: "How much is the VIP at Punta Cana Airport? Et comment prolonger le niveau VIP au transfert"
    },
    seoDescription: {
      es: "Costos VIP en PUJ y recomendacion profesional para mantener nivel premium en el traslado al hotel.",
      en: "VIP costs at PUJ and professional recommendation to keep premium level on your hotel transfer.",
      fr: "Couts VIP a PUJ et recommandation pro pour maintenir le niveau premium sur le transfert hotel."
    },
    keywords: ["how much is the vip at punta cana airport", "punta cana vip service", "vip transfer punta cana"]
  },
  {
    slug: "is-10-usd-a-good-tip-in-dominican-republic",
    question: {
      es: "Is $10 USD a good tip in the Dominican Republic?",
      en: "Is $10 USD a good tip in the Dominican Republic?",
      fr: "Is $10 USD a good tip in the Dominican Republic?"
    },
    shortAnswer: {
      es: "Si, suele considerarse una buena propina para un servicio correcto en turismo.",
      en: "Yes, it is usually considered a good tip for proper tourism service.",
      fr: "Oui, c est generalement un bon pourboire pour un service correct dans le tourisme."
    },
    salesBody: {
      es: "Mejor estrategia: primero asegura servicio premium (puntualidad, seguridad, asistencia) y luego define propina por calidad real.",
      en: "Best strategy: secure premium service first (punctuality, safety, assistance) then tip according to actual quality.",
      fr: "Meilleure strategie: assurez d abord un service premium (ponctualite, securite, assistance), puis ajustez le pourboire selon la qualite."
    },
    seoTitle: {
      es: "Is $10 USD a good tip in the Dominican Republic? Guia rapida para viajeros",
      en: "Is $10 USD a good tip in the Dominican Republic? Quick guide for travelers",
      fr: "Is $10 USD a good tip in the Dominican Republic? Guide rapide pour voyageurs"
    },
    seoDescription: {
      es: "Cuanto dar de propina en Republica Dominicana y como asegurar un traslado confiable antes de pensar en extras.",
      en: "How much to tip in Dominican Republic and how to secure reliable transfer before extras.",
      fr: "Combien laisser en pourboire en Republique Dominicaine et comment garantir un transfert fiable avant les extras."
    },
    keywords: ["is $10 usd a good tip in the dominican republic", "punta cana transfer tips", "dominican republic tipping guide"]
  },
  {
    slug: "is-punta-cana-transfer-reliable",
    question: {
      es: "Is Punta Cana transfer reliable?",
      en: "Is Punta Cana transfer reliable?",
      fr: "Is Punta Cana transfer reliable?"
    },
    shortAnswer: {
      es: "Si, cuando reservas con proveedor validado, seguimiento de vuelo y protocolo de confirmacion previo.",
      en: "Yes, when booked with validated provider, flight tracking, and pre-arrival confirmation protocol.",
      fr: "Oui, lorsque vous reservez avec un fournisseur valide, suivi de vol et protocole de confirmation avant arrivee."
    },
    salesBody: {
      es: "Para vender mas: ofrece prueba social, ruta clara, punto de encuentro exacto y opcion de tours posteriores con pickup.",
      en: "To sell more: provide social proof, clear route, exact meeting point, and optional post-transfer tours with pickup.",
      fr: "Pour vendre plus: montrez preuve sociale, trajet clair, point de rencontre exact et option tours apres transfert avec pickup."
    },
    seoTitle: {
      es: "Is Punta Cana transfer reliable? Como elegir proveedor confiable",
      en: "Is Punta Cana transfer reliable? How to choose a trusted provider",
      fr: "Is Punta Cana transfer reliable? Comment choisir un fournisseur fiable"
    },
    seoDescription: {
      es: "Checklist real para validar si un transfer en Punta Cana es confiable y como reservar sin riesgo operativo.",
      en: "Real checklist to validate if a Punta Cana transfer is reliable and how to book with lower risk.",
      fr: "Checklist reel pour verifier si un transfert a Punta Cana est fiable et reserver avec moins de risque."
    },
    keywords: ["is punta cana transfer reliable", "reliable punta cana airport transfer", "best transfer company punta cana"]
  },
  {
    slug: "is-100-a-lot-of-money-in-dominican-republic",
    question: {
      es: "Is $100 a lot of money in the Dominican Republic?",
      en: "Is $100 a lot of money in the Dominican Republic?",
      fr: "Is $100 a lot of money in the Dominican Republic?"
    },
    shortAnswer: {
      es: "Depende del tipo de experiencia. En turismo premium, $100 puede cubrir parte de traslados o actividades, no todo el viaje.",
      en: "It depends on your experience level. In premium travel, $100 may cover part of transfers or activities, not the full trip.",
      fr: "Cela depend du niveau d experience. En voyage premium, 100 USD peut couvrir une partie des transferts ou activites, pas tout le voyage."
    },
    salesBody: {
      es: "En venta consultiva funciona mejor: dividir presupuesto entre traslado seguro y tours de alto valor con recogida incluida.",
      en: "Consultative selling works better: split budget between reliable transfer and high-value tours with pickup included.",
      fr: "La vente consultative fonctionne mieux: repartir le budget entre transfert fiable et tours a forte valeur avec pickup inclus."
    },
    seoTitle: {
      es: "Is $100 a lot of money in the Dominican Republic? Planifica mejor traslado y tours",
      en: "Is $100 a lot of money in the Dominican Republic? Plan transfer and tours better",
      fr: "Is $100 a lot of money in the Dominican Republic? Mieux planifier transfert et tours"
    },
    seoDescription: {
      es: "Como rendir mejor el presupuesto en Punta Cana con estrategia de traslado privado y actividades optimizadas.",
      en: "How to make your budget perform better in Punta Cana with smart private transfer and activity planning.",
      fr: "Comment optimiser le budget a Punta Cana avec strategie transfert prive et activites optimisees."
    },
    keywords: ["is $100 a lot of money in the dominican republic", "punta cana budget transfer", "tour and transfer package punta cana"]
  },
  {
    slug: "is-it-cheaper-to-book-airport-transfers-in-advance",
    question: {
      es: "Is it cheaper to book airport transfers in advance?",
      en: "Is it cheaper to book airport transfers in advance?",
      fr: "Is it cheaper to book airport transfers in advance?"
    },
    shortAnswer: {
      es: "Normalmente si. Reservar antes te da mejor tarifa, disponibilidad y menos friccion al llegar.",
      en: "Usually yes. Booking in advance gives better rate, availability, and less friction on arrival.",
      fr: "Generalement oui. Reserver a l avance donne meilleur tarif, disponibilite et moins de friction a l arrivee."
    },
    salesBody: {
      es: "En conversion digital, pre-booking gana porque permite vender bundle: aeropuerto + hotel + tours desde el primer contacto.",
      en: "In digital conversion, pre-booking wins because you can sell bundles: airport + hotel + tours from first contact.",
      fr: "En conversion digitale, la reservation anticipee gagne car vous pouvez vendre un bundle: aeroport + hotel + tours des le premier contact."
    },
    seoTitle: {
      es: "Is it cheaper to book airport transfers in advance? Respuesta corta: casi siempre si",
      en: "Is it cheaper to book airport transfers in advance? Short answer: almost always yes",
      fr: "Is it cheaper to book airport transfers in advance? Reponse courte: presque toujours oui"
    },
    seoDescription: {
      es: "Ventajas reales de reservar transfer con antelacion y como aprovechar para cerrar tambien tours con pickup.",
      en: "Real advantages of booking transfer in advance and how to also close tours with hotel pickup.",
      fr: "Avantages reels de reserver le transfert a l avance et comment aussi vendre des tours avec pickup hotel."
    },
    keywords: ["is it cheaper to book airport transfers in advance", "book punta cana transfer in advance", "airport transfer pre booking punta cana"]
  }
];

export const transferQuestionSalesLandingSlugs = TRANSFER_QUESTION_SALES_LANDINGS.map((item) => item.slug);

export const findTransferQuestionSalesLandingBySlug = (slug: string) =>
  TRANSFER_QUESTION_SALES_LANDINGS.find((item) => item.slug === slug);

