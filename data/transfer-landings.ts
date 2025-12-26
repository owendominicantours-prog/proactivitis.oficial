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
];

export const findLandingBySlug = (slug: string) => transferLandings.find((landing) => landing.landingSlug === slug);
export const allLandings = () => transferLandings;
