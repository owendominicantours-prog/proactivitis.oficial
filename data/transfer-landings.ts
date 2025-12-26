export type TransferLandingData = {
  landingSlug: string;
  reverseSlug: string;
  hotelSlug: string;
  hotelName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  heroImage: string;
  heroImageAlt: string;
  priceFrom: number;
  priceDetails: string[];
  longCopy: string[];
  trustBadges: string[];
  faq: { question: string; answer: string }[];
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  canonical?: string;
};

const buildLongCopy = (hotelName: string) => [
  `Conectamos Punta Cana International Airport (PUJ) con ${hotelName} en un servicio privado que anticipa cada detalle de tu llegada. Nuestro equipo local planifica el pick-up a tu hora de aterrizaje, utiliza el estado del vuelo en tiempo real y te recibe con un cartel que lleva tu nombre y el logo de Proactivitis. Mientras recorres los últimos minutos de la carretera hacia el hotel, puedes elegir relajarte con música, revisar los itinerarios en tu celular gracias al Wi-Fi a bordo o simplemente disfrutar del aire acondicionado constante y los maleteros espaciosos para cada maleta, incluida la de mano.`,
  `Hacemos que el transporte sea parte de la experiencia, no un trámite. Antes de tu viaje, confirmamos el tipo de vehículo ideal para tu grupo —sedanes elegantes para parejas, SUVs para familias con niños o minibuses para bodas y eventos—, y te dejamos claro cuánto cuesta sin cargos ocultos. Nuestro personal bilingüe te acompaña por pasos: te avisan cuándo el chofer está listo, vigilan la llegada de tu vuelo y se comunican contigo si necesitas reprogramar la hora. Además, incluimos 60 minutos de espera gratis en el aeropuerto, por si te demoras con migración o esperas maletas adicionales.`,
  `El recorrido desde PUJ hasta ${hotelName} es siempre seguro. Tus conductores son profesionales certificados, pasan controles de experiencia y reciben formación continua. Tienen contacto directo con nuestro centro de operaciones en Punta Cana, así pueden ayudarte con recomendaciones, avisos al hotel y asistencia 24/7. Si hay tráfico o mal tiempo, replanificamos sobre la marcha para mantener tu itinerario sin penalizaciones. Además, cada vehículo cuenta con seguro de pasajeros, botellas de agua y desinfectantes, para que llegues fresco y listo para tu descanso.`,
  `Compartimos el dato de que la mayoría de nuestros clientes vuelan con maletas de mano y equipaje grande, por eso diseñamos rutas eficientes con pasos claros de salida y llegada. Te mostramos el clima estimado, la distancia y el tiempo en ruta y te conectamos con tu concierge del hotel si tienes solicitudes especiales: desde una cuna adicional hasta un check-in prioritario. Gracias a nuestra plataforma, no importa si cambias la hora de llegada a último momento: ajustamos el pickup y te enviamos la confirmación final con un mensaje de texto y correo electrónico.`,
  `Reservar desde aquí te da prioridad inmediata. Una vez seleccionas la fecha/hora y el número de pasajeros, las tarjetas de vehículos se actualizan con el precio exacto y puedes comparar sedanes, vans y minibuses sin salir de la página. Todos los precios incluyen chofer bilingüe, asistencia en español e inglés y un servicio privado sin esperas en el aeropuerto. Con nuestro enfoque humanizado, cada traslado se siente como un concierge personal desde el instante en que pisas el aeropuerto.`,
  `Pensamos que el primer trayecto debe marcar la diferencia. Por eso detallamos tu ruta hasta ${hotelName} con señalización precisa, te entregamos un número directo de soporte y dejamos avanzar sin sorpresas. Nuestro equipo mantiene registros de tráfico y clima para evitar contratiempos y te recuerda una hora antes del pick-up para que organices tu salida del avión sin presión. Además, coordinamos con el hotel para avisar de tu llegada y que tu habitación esté lista al instante.`
];

const buildFaq = (hotelName: string) => [
  {
    question: "¿Mi chofer espera si el vuelo se retrasa?",
    answer: `Sí, monitoreamos tu vuelo hacia ${hotelName} y mantenemos al conductor informado para que te espere con 60 minutos de cortesía.`
  },
  {
    question: "¿Puedo agregar paradas durante el camino?",
    answer: `Claro, avísanos en el momento de la reserva y coordinamos paradas rápidas sin afectar la llegada al ${hotelName}.`
  },
  {
    question: "¿Incluye transporte de equipaje completo?",
    answer: `Todos nuestros vehículos tienen espacio suficiente para maletas grandes y de mano; solo indícanos cuántas llevas y te asignamos el vehículo adecuado para llegar a ${hotelName}.`
  }
];

export const transferLandings: TransferLandingData[] = [
  {
    landingSlug: "punta-cana-international-airport-to-hard-rock-hotel-punta-cana",
    reverseSlug: "hard-rock-hotel-punta-cana-to-punta-cana-international-airport",
    hotelSlug: "hard-rock-hotel-punta-cana",
    hotelName: "Hard Rock Hotel & Casino Punta Cana",
    heroTitle: "Punta Cana International Airport (PUJ) → Hard Rock Hotel & Casino Punta Cana",
    heroSubtitle: "Traslado privado con chofer bilingüe, Wi-Fi y servicio premium desde la terminal de PUJ hasta el lobby del resort.",
    heroTagline: "Servicio 5 estrellas para llegar con ritmo rockero",
    heroImage: "/transfer/mini van.png",
    heroImageAlt: "Mini van premium en la autopista Punta Cana",
    priceFrom: 45,
    priceDetails: [
      "Confirmación inmediata con conductor asignado",
      "Espera gratuita de 60 minutos en el aeropuerto",
      "Botellas de agua y Wi-Fi incluidos"
    ],
    longCopy: buildLongCopy("Hard Rock Hotel & Casino Punta Cana"),
    trustBadges: ["Servicio privado garantizado", "Chofer bilingüe | Wi-Fi a bordo", "Cancelación flexible 24h"],
    faq: [
      {
        question: "¿Mi chofer llega si mi vuelo se retrasa?",
        answer: "Sí, monitorizamos el número de vuelo en tiempo real y ajustamos la llegada sin costo adicional, con 60 minutos de espera gratuita."
      },
      {
        question: "¿Puedo agregar paradas intermedias?",
        answer: "Claro; solo avísanos al reservar y coordinamos la mejor ruta con cargo adicional por distancia."
      },
      {
        question: "¿Se cargan maletas grandes?",
        answer: "Todos nuestros vehículos tienen espacio para equipaje grande y caben hasta cuatro maletas por vehículo grande."
      }
    ],
    seoTitle: "Transfer privado PUJ a Hard Rock Hotel Punta Cana | Proactivitis",
    metaDescription:
      "Reserva tu traslado privado desde Punta Cana International Airport (PUJ) hasta Hard Rock Hotel & Casino Punta Cana con chofer bilingüe, confirmación inmediata y vehículos premium.",
    keywords: ["PUJ Hard Rock transfer", "transfer privado Punta Cana Hard Rock", "hard rock hotel transfer punta cana"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-hard-rock-hotel-punta-cana"
  },
  {
    landingSlug: "punta-cana-international-airport-to-barcelo-bavaro-palace",
    reverseSlug: "barcelo-bavaro-palace-to-punta-cana-international-airport",
    hotelSlug: "barcelo-bavaro-palace",
    hotelName: "Barceló Bávaro Palace",
    heroTitle: "Punta Cana International Airport (PUJ) → Barceló Bávaro Palace",
    heroSubtitle:
      "Van privada con atención de concierge y equipaje seguro desde el aeropuerto hasta la playa dorada del Bávaro Palace.",
    heroTagline: "Ideal para familias y grupos que buscan tranquilidad antes del check-in",
    heroImage: "/transfer/sedan.png",
    heroImageAlt: "Sedan ejecutivo frente a la playa de Bávaro",
    priceFrom: 42,
    priceDetails: [
      "Guías locales que manejan la logística",
      "Puerta a puerta, sin esperas en migración",
      "Chofer certificado y seguro de pasajeros"
    ],
    longCopy: buildLongCopy("Barceló Bávaro Palace"),
    trustBadges: ["Confirmación inmediata", "Vehículos certificados sanitariamente", "Soporte 24/7 en español e inglés"],
    faq: [
      {
        question: "¿Puedo pagar en efectivo o tarjeta?",
        answer: "Aceptamos tarjetas Stripe, Apple Pay o efectivo; puedes indicar el método en la reserva."
      },
      {
        question: "¿Los vehículos tienen aire acondicionado?",
        answer: "Todos los traslados incluyen aire acondicionado y mantienen el confort en la ruta hacia el hotel."
      },
      {
        question: "¿Qué tan rápido llega el chofer después de aterrizar?",
        answer: "El chofer te espera con cartel en la zona de salida, y el inicio efectivo del traslado es inmediato tras recoger tu equipaje."
      }
    ],
    seoTitle: "Transfer privado PUJ a Barceló Bávaro Palace | Proactivitis",
    metaDescription:
      "Traslado premium desde Punta Cana International Airport (PUJ) hasta Barceló Bávaro Palace, con chofer bilingüe, confirmación instantánea y vans familiares.",
    keywords: ["transfer PUJ Bávaro Palace", "Punta Cana airport to Barceló transfer", "transfer privado Barceló Bávaro"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-barcelo-bavaro-palace"
  },
  {
    landingSlug: "punta-cana-international-airport-to-riu-republica",
    reverseSlug: "riu-republica-to-punta-cana-international-airport",
    hotelSlug: "riu-republica",
    hotelName: "Riu República",
    heroTitle: "Punta Cana International Airport (PUJ) → Riu República",
    heroSubtitle:
      "Mini vans y buses VIP para grupos numerosos, con tarifas transparentes y chofer bilingüe desde la terminal de PUJ.",
    heroTagline: "Perfecto para bodas, corporativos y familias numerosas",
    heroImage: "/transfer/suv.png",
    heroImageAlt: "Camino al Riu República con SUV",
    priceFrom: 40,
    priceDetails: [
      "Vehículos equipados con Wi-Fi y carga para maletas",
      "Atención directa con nuestro soporte en Punta Cana",
      "Reservas confirmadas en minutos"
    ],
    longCopy: buildLongCopy("Riu República"),
    trustBadges: ["Grupo privado garantizado", "Soporte en vivo 24/7", "Vehículos sanitizados"],
    faq: [
      {
        question: "¿Qué sucede si necesito más vehículos?",
        answer: "Agrega más traslados en la misma reserva y confirmamos cada unidad con su conductor asignado."
      },
      {
        question: "¿Ofrecen transporte de larga distancia?",
        answer: "Claro, podemos organizar traslados hacia Santo Domingo o Punta Cana con previo aviso."
      },
      {
        question: "¿Incluyen 24/7 support?",
        answer: "Sí, nuestro call center responde durante todo el viaje y te conecta con el equipo local."
      }
    ],
    seoTitle: "Transfer privado PUJ a Riu República | Proactivitis",
    metaDescription:
      "Traslado privado desde Punta Cana International Airport (PUJ) hasta Riu República con minibuses, soporte en vivo y confirmación inmediata.",
    keywords: ["PUJ Riu República transfer", "transfer privado Riu República", "Punta Cana airport transport Riu"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-riu-republica"
  }
  ,
  {
    landingSlug: "punta-cana-international-airport-to-lopesan-costa-bavaro",
    reverseSlug: "lopesan-costa-bavaro-to-punta-cana-international-airport",
    hotelSlug: "lopesan-costa-bavaro",
    hotelName: "Lopesan Costa Bávaro Resort",
    heroTitle: "Punta Cana International Airport (PUJ) → Lopesan Costa Bávaro Resort",
    heroSubtitle: "Traslado panorámico con conductor bilingüe hasta la entrada rodeada por palmeras del resort.",
    heroTagline: "Comodidad premium para lunas de miel y bodas privadas",
    heroImage: "/transfer/mini van.png",
    heroImageAlt: "Mini van premium frente a Lopesan Costa Bávaro",
    priceFrom: 48,
    priceDetails: [
      "Chofer bilingüe y concierge local esperando en la puerta",
      "Ruta directa sin escalas ni transfers intermedios",
      "Actualización del estado del vuelo en tiempo real"
    ],
    longCopy: buildLongCopy("Lopesan Costa Bávaro Resort"),
    trustBadges: ["Servicio privado garantizado", "Chofer bilingüe | Wi-Fi a bordo", "Cancelación flexible 24h"],
    faq: buildFaq("Lopesan Costa Bávaro Resort"),
    seoTitle: "Transfer privado PUJ a Lopesan Costa Bávaro Resort | Proactivitis",
    metaDescription:
      "Reserva tu traslado privado desde Punta Cana International Airport (PUJ) hasta Lopesan Costa Bávaro Resort con chofer bilingüe, atención para bodas y confirmación instantánea.",
    keywords: ["PUJ lopesan costa bavaro transfer", "transfer privado Lopesan Costa Bávaro", "Lopesan Costa Bávaro PUJ"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-lopesan-costa-bavaro"
  },
  {
    landingSlug: "punta-cana-international-airport-to-hyatt-ziva-cap-cana",
    reverseSlug: "hyatt-ziva-cap-cana-to-punta-cana-international-airport",
    hotelSlug: "hyatt-ziva-cap-cana",
    hotelName: "Hyatt Ziva Cap Cana",
    heroTitle: "Punta Cana International Airport (PUJ) → Hyatt Ziva Cap Cana",
    heroSubtitle: "Llegada VIP con chofer elegido para tus familias y suites frente a la marina de Cap Cana.",
    heroTagline: "Cap Cana sin preocupaciones",
    heroImage: "/transfer/sedan.png",
    heroImageAlt: "Sedan en Cap Cana con vista al mar",
    priceFrom: 52,
    priceDetails: [
      "Coordinación directa con el concierge del hotel",
      "Control de vuelos y espera gratuita de 60 minutos",
      "Vehículo climatizado con espacio de maletas"
    ],
    longCopy: buildLongCopy("Hyatt Ziva Cap Cana"),
    trustBadges: ["Servicio privado garantizado", "Chofer bilingüe | Wi-Fi a bordo", "Cancelación flexible 24h"],
    faq: buildFaq("Hyatt Ziva Cap Cana"),
    seoTitle: "Transfer privado PUJ a Hyatt Ziva Cap Cana | Proactivitis",
    metaDescription:
      "Traslado premium desde Punta Cana International Airport (PUJ) hasta Hyatt Ziva Cap Cana con conductor bilingüe, asistencia 24/7 y vehículos equipados.",
    keywords: ["PUJ Hyatt Ziva transfer", "Hyatt Ziva Cap Cana private transfer", "transfer privado Cap Cana"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-hyatt-ziva-cap-cana"
  },
  {
    landingSlug: "punta-cana-international-airport-to-hyatt-zilara-cap-cana",
    reverseSlug: "hyatt-zilara-cap-cana-to-punta-cana-international-airport",
    hotelSlug: "hyatt-zilara-cap-cana",
    hotelName: "Hyatt Zilara Cap Cana",
    heroTitle: "Punta Cana International Airport (PUJ) → Hyatt Zilara Cap Cana",
    heroSubtitle: "Traslado exclusivo para adultos con servicio de concierge e imagen premium durante el trayecto.",
    heroTagline: "Vive Cap Cana sin esperas ni complicaciones",
    heroImage: "/transfer/suv.png",
    heroImageAlt: "SUV entrando a Hyatt Zilara Cap Cana",
    priceFrom: 52,
    priceDetails: [
      "Chofer bilingüe con botella de agua de cortesía",
      "Espacio para equipaje y artículos personales",
      "Llegada directa al lobby sin paradas extra"
    ],
    longCopy: buildLongCopy("Hyatt Zilara Cap Cana"),
    trustBadges: ["Servicio privado garantizado", "Chofer bilingüe | Wi-Fi a bordo", "Cancelación flexible 24h"],
    faq: buildFaq("Hyatt Zilara Cap Cana"),
    seoTitle: "Transfer privado PUJ a Hyatt Zilara Cap Cana | Proactivitis",
    metaDescription:
      "Reserva tu traslado privado desde Punta Cana International Airport (PUJ) hasta Hyatt Zilara Cap Cana con vehículo premium, chofer bilingüe y confirmación en minutos.",
    keywords: ["PUJ Hyatt Zilara transfer", "Hyatt Zilara private transfer", "Cap Cana transfer PUJ"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-hyatt-zilara-cap-cana"
  },
  {
    landingSlug: "punta-cana-international-airport-to-majestic-colonial",
    reverseSlug: "majestic-colonial-to-punta-cana-international-airport",
    hotelSlug: "majestic-colonial",
    hotelName: "Majestic Colonial Punta Cana",
    heroTitle: "Punta Cana International Airport (PUJ) → Majestic Colonial Punta Cana",
    heroSubtitle: "Transporte elegante que combina historia con playa, cobrando solo el tiempo real de viaje.",
    heroTagline: "Entrada con estilo a tu suite Colonial",
    heroImage: "/transfer/sedan.png",
    heroImageAlt: "Sedan llegando a Majestic Colonial Punta Cana",
    priceFrom: 42,
    priceDetails: [
      "Coordinación con concierge y servicio de bienvenida",
      "Chofer experto en la zona de Bávaro",
      "Vehículos con Wi-Fi y aire acondicionado constante"
    ],
    longCopy: buildLongCopy("Majestic Colonial Punta Cana"),
    trustBadges: ["Servicio privado garantizado", "Chofer bilingüe | Wi-Fi a bordo", "Cancelación flexible 24h"],
    faq: buildFaq("Majestic Colonial Punta Cana"),
    seoTitle: "Transfer privado PUJ a Majestic Colonial Punta Cana | Proactivitis",
    metaDescription:
      "Traslado privado desde Punta Cana International Airport (PUJ) hasta Majestic Colonial Punta Cana con chofer bilingüe, confirmación inmediata y vehículos premium.",
    keywords: ["PUJ Majestic Colonial transfer", "Majestic Colonial Punta Cana private transfer", "transfer privado Majestic Colonial"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-majestic-colonial"
  },
  {
    landingSlug: "punta-cana-international-airport-to-majestic-elegance",
    reverseSlug: "majestic-elegance-to-punta-cana-international-airport",
    hotelSlug: "majestic-elegance",
    hotelName: "Majestic Elegance Punta Cana",
    heroTitle: "Punta Cana International Airport (PUJ) → Majestic Elegance Punta Cana",
    heroSubtitle: "Traslado sofisticado para parejas y familias con minibar, snacks y asistencia continua.",
    heroTagline: "Arriba con elegancia",
    heroImage: "/transfer/mini van.png",
    heroImageAlt: "Mini van premium junto a Majestic Elegance",
    priceFrom: 42,
    priceDetails: [
      "Chofer bilingüe con ruta optimizada",
      "Espera incluida y coordinación con la recepción",
      "Actualizaciones por WhatsApp del chofer asignado"
    ],
    longCopy: buildLongCopy("Majestic Elegance Punta Cana"),
    trustBadges: ["Servicio privado garantizado", "Chofer bilingüe | Wi-Fi a bordo", "Cancelación flexible 24h"],
    faq: buildFaq("Majestic Elegance Punta Cana"),
    seoTitle: "Transfer privado PUJ a Majestic Elegance Punta Cana | Proactivitis",
    metaDescription:
      "Reserva tu traslado privado desde Punta Cana International Airport (PUJ) hasta Majestic Elegance Punta Cana con conductor bilingüe, Wi-Fi y confirmación inmediata.",
    keywords: ["PUJ Majestic Elegance transfer", "Majestic Elegance transfer Punta Cana", "transfer Majestic Elegance"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-majestic-elegance"
  },
  {
    landingSlug: "punta-cana-international-airport-to-majestic-mirage",
    reverseSlug: "majestic-mirage-to-punta-cana-international-airport",
    hotelSlug: "majestic-mirage",
    hotelName: "Majestic Mirage Punta Cana",
    heroTitle: "Punta Cana International Airport (PUJ) → Majestic Mirage Punta Cana",
    heroSubtitle: "Vans premium y minibuses para grupos grandes con llegada directa a la laguna y el club de playa.",
    heroTagline: "Gran apertura a las playas más exclusivas",
    heroImage: "/transfer/suv.png",
    heroImageAlt: "SUV frente al Majestic Mirage Grand Resort",
    priceFrom: 44,
    priceDetails: [
      "Chofer bilingüe con entrenamiento en grupales",
      "Maletero amplio y música personalizada",
      "Ruta supervisada para evitar congestión"
    ],
    longCopy: buildLongCopy("Majestic Mirage Punta Cana"),
    trustBadges: ["Servicio privado garantizado", "Chofer bilingüe | Wi-Fi a bordo", "Cancelación flexible 24h"],
    faq: buildFaq("Majestic Mirage Punta Cana"),
    seoTitle: "Transfer privado PUJ a Majestic Mirage Punta Cana | Proactivitis",
    metaDescription:
      "Traslado privado desde Punta Cana International Airport (PUJ) hasta Majestic Mirage Punta Cana con chofer bilingüe, minibuses y confirmación inmediata.",
    keywords: ["Majestic Mirage transfer", "PUJ Majestic Mirage transfer", "transfer Majestic Mirage"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-majestic-mirage"
  },
  {
    landingSlug: "punta-cana-international-airport-to-iberostar-grand-bavaro",
    reverseSlug: "iberostar-grand-bavaro-to-punta-cana-international-airport",
    hotelSlug: "iberostar-grand-bavaro",
    hotelName: "Iberostar Grand Bávaro",
    heroTitle: "Punta Cana International Airport (PUJ) → Iberostar Grand Bávaro",
    heroSubtitle: "Llega en sedán o SUV premium con chófer atento para huéspedes del hotel más exclusivo de Bávaro.",
    heroTagline: "Lujo total desde la pista hasta el lobby",
    heroImage: "/transfer/sedan.png",
    heroImageAlt: "Sedan frente al Iberostar Grand Bávaro",
    priceFrom: 45,
    priceDetails: [
      "Servicio privado con bebidas frías de cortesía",
      "Chofer bilingüe con experiencia en el resort",
      "Sin esperas en migración y con soporte 24/7"
    ],
    longCopy: buildLongCopy("Iberostar Grand Bávaro"),
    trustBadges: ["Servicio privado garantizado", "Chofer bilingüe | Wi-Fi a bordo", "Cancelación flexible 24h"],
    faq: buildFaq("Iberostar Grand Bávaro"),
    seoTitle: "Transfer privado PUJ a Iberostar Grand Bávaro | Proactivitis",
    metaDescription:
      "Reserva tu traslado privado desde Punta Cana International Airport (PUJ) hasta Iberostar Grand Bávaro con vehículo premium, asistencia 24/7 y confirmación rápida.",
    keywords: ["Iberostar Grand Bávaro transfer", "PUJ Iberostar transfer", "transfer privado Iberostar Grand"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-iberostar-grand-bavaro"
  },
  {
    landingSlug: "punta-cana-international-airport-to-bahia-principe-grand-punta-cana",
    reverseSlug: "bahia-principe-grand-punta-cana-to-punta-cana-international-airport",
    hotelSlug: "bahia-principe-grand-punta-cana",
    hotelName: "Bahia Principe Grand Punta Cana",
    heroTitle: "Punta Cana International Airport (PUJ) → Bahia Principe Grand Punta Cana",
    heroSubtitle: "Transporte de cortesía para familias numerosas con maletero reforzado y tiempo de espera extendido.",
    heroTagline: "Todo incluido, incluso la llegada",
    heroImage: "/transfer/mini van.png",
    heroImageAlt: "Mini van frente al Bahia Principe Grand Punta Cana",
    priceFrom: 40,
    priceDetails: [
      "Vehículos espaciosos para familia y equipaje",
      "Chofer bilingüe con experiencia en grupos grandes",
      "Actualización inmediata del estado del vuelo"
    ],
    longCopy: buildLongCopy("Bahia Principe Grand Punta Cana"),
    trustBadges: ["Servicio privado garantizado", "Chofer bilingüe | Wi-Fi a bordo", "Cancelación flexible 24h"],
    faq: buildFaq("Bahia Principe Grand Punta Cana"),
    seoTitle: "Transfer privado PUJ a Bahia Principe Grand Punta Cana | Proactivitis",
    metaDescription:
      "Traslado privado desde Punta Cana International Airport (PUJ) hasta Bahia Principe Grand Punta Cana con minibuses y confirmación inmediata para grupos grandes.",
    keywords: ["PUJ Bahia Principe Grand transfer", "transfer privado Bahia Principe Grand", "Bahia Principe Grand Punta Cana transfer"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-bahia-principe-grand-punta-cana"
  },
  {
    landingSlug: "punta-cana-international-airport-to-bahia-principe-luxury-ambar",
    reverseSlug: "bahia-principe-luxury-ambar-to-punta-cana-international-airport",
    hotelSlug: "bahia-principe-luxury-ambar",
    hotelName: "Bahia Principe Luxury Ambar",
    heroTitle: "Punta Cana International Airport (PUJ) → Bahia Principe Luxury Ambar",
    heroSubtitle: "Servicio premium para viajeros que buscan confort y privacidad desde la terminal hasta la villa.",
    heroTagline: "Elegancia con cada kilómetro",
    heroImage: "/transfer/suv.png",
    heroImageAlt: "SUV de lujo frente al Bahia Principe Luxury Ambar",
    priceFrom: 40,
    priceDetails: [
      "Vehículo equipado con Wi-Fi y cargadores",
      "Chofer bilingüe con experiencia VIP",
      "Llegada prioritaria y asistencia personalizada"
    ],
    longCopy: buildLongCopy("Bahia Principe Luxury Ambar"),
    trustBadges: ["Servicio privado garantizado", "Chofer bilingüe | Wi-Fi a bordo", "Cancelación flexible 24h"],
    faq: buildFaq("Bahia Principe Luxury Ambar"),
    seoTitle: "Transfer privado PUJ a Bahia Principe Luxury Ambar | Proactivitis",
    metaDescription:
      "Reserva tu traslado premium desde Punta Cana International Airport (PUJ) hasta Bahia Principe Luxury Ambar con vehículo equipado y chofer bilingüe.",
    keywords: ["Bahia Principe Luxury Ambar transfer", "PUJ Bahia Principe Luxury Ambar", "transfer premium Bahia Principe"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-bahia-principe-luxury-ambar"
  },
  {
    landingSlug: "punta-cana-international-airport-to-bahia-principe-luxury-esmeralda",
    reverseSlug: "bahia-principe-luxury-esmeralda-to-punta-cana-international-airport",
    hotelSlug: "bahia-principe-luxury-esmeralda",
    hotelName: "Bahia Principe Luxury Esmeralda",
    heroTitle: "Punta Cana International Airport (PUJ) → Bahia Principe Luxury Esmeralda",
    heroSubtitle: "Llega con estilo a este resort adults-only con opciones culinarias exclusivas y spa en el mismo complejo.",
    heroTagline: "Spa, gourmet y traslado premium",
    heroImage: "/transfer/sedan.png",
    heroImageAlt: "Sedan frente al Bahia Principe Luxury Esmeralda",
    priceFrom: 40,
    priceDetails: [
      "Chofer bilingüe con protocolo de bienvenida",
      "Vehículos con Wi-Fi y fruta fresca",
      "Ruta optimizada para evitar tráfico en la zona hotelera"
    ],
    longCopy: buildLongCopy("Bahia Principe Luxury Esmeralda"),
    trustBadges: ["Servicio privado garantizado", "Chofer bilingüe | Wi-Fi a bordo", "Cancelación flexible 24h"],
    faq: buildFaq("Bahia Principe Luxury Esmeralda"),
    seoTitle: "Transfer privado PUJ a Bahia Principe Luxury Esmeralda | Proactivitis",
    metaDescription:
      "Traslado privado desde Punta Cana International Airport (PUJ) hasta Bahia Principe Luxury Esmeralda con chofer bilingüe y atención premium.",
    keywords: ["Bahia Principe Luxury Esmeralda transfer", "transfer PUJ Bahia Principe Luxury Esmeralda", "PUJ Bahia Principe Luxury transfer"],
    canonical: "https://proactivitis.com/transfer/punta-cana-international-airport-to-bahia-principe-luxury-esmeralda"
  }
];

export const findLandingBySlug = (slug: string) => transferLandings.find((landing) => landing.landingSlug === slug);
export const allLandings = () => transferLandings;
