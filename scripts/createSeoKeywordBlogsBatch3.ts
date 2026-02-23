import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { slugifyBlog } from "../lib/blog";

const prisma = new PrismaClient();

type Cluster =
  | "comparativas"
  | "luxury"
  | "deportes"
  | "golf"
  | "foto"
  | "movilidad"
  | "compras"
  | "salud"
  | "inversion"
  | "nightlife"
  | "familiar"
  | "global"
  | "conversion";

type KeywordEntry = {
  keyword: string;
  cluster: Cluster;
};

const KEYWORDS: KeywordEntry[] = [
  { keyword: "Punta Cana o Puerto Plata para familias", cluster: "comparativas" },
  { keyword: "Diferencia entre Bavaro y Cap Cana", cluster: "comparativas" },
  { keyword: "Es mejor Riu o Iberostar en Punta Cana", cluster: "comparativas" },
  { keyword: "Consejos para viajar a Punta Cana con bebes", cluster: "comparativas" },
  { keyword: "Que ropa llevar a Punta Cana en diciembre", cluster: "comparativas" },
  { keyword: "Presupuesto diario para comer en Punta Cana", cluster: "comparativas" },
  { keyword: "Se puede beber agua del grifo en Punta Cana", cluster: "comparativas" },
  { keyword: "Evitar estafas en excursiones Punta Cana", cluster: "comparativas" },
  { keyword: "Como regatear en los mercados de artesania", cluster: "comparativas" },
  { keyword: "Mejores meses para evitar el sargazo", cluster: "comparativas" },
  { keyword: "Cuantos dias se necesitan para ver Punta Cana", cluster: "comparativas" },
  { keyword: "Opiniones sobre paquetes de viaje Expedia Punta Cana", cluster: "comparativas" },
  { keyword: "Mejores tarjetas de credito para viajar al Caribe", cluster: "comparativas" },
  { keyword: "Punta Cana vs Cancun vs Tulum 2026", cluster: "comparativas" },
  { keyword: "Vale la pena el Club VIP de los hoteles", cluster: "comparativas" },
  { keyword: "Como reservar cenas en los hoteles todo incluido", cluster: "comparativas" },
  { keyword: "Dress code en restaurantes de lujo Punta Cana", cluster: "comparativas" },
  { keyword: "Alquilar coche o usar Uber en Punta Cana", cluster: "comparativas" },
  { keyword: "Excursiones recomendadas para mayores de 60", cluster: "comparativas" },
  { keyword: "Bodas de destino en Punta Cana costos", cluster: "comparativas" },
  { keyword: "Alquiler de villas privadas en Casa de Campo cerca de PC", cluster: "luxury" },
  { keyword: "Inversion inmobiliaria en Punta Cana 2026", cluster: "luxury" },
  { keyword: "Proyectos de apartamentos en preventa Punta Cana", cluster: "luxury" },
  { keyword: "Campos de golf de clase mundial Corales y Punta Espada", cluster: "luxury" },
  { keyword: "Torneo de Golf PGA Tour Corales Puntacana", cluster: "luxury" },
  { keyword: "Spa de lujo Six Senses Punta Cana", cluster: "luxury" },
  { keyword: "Retiros de yoga en Punta Cana", cluster: "luxury" },
  { keyword: "Eventos corporativos y convenciones Punta Cana", cluster: "luxury" },
  { keyword: "Alquiler de jets privados Punta Cana", cluster: "luxury" },
  { keyword: "Helipuertos en hoteles de Punta Cana", cluster: "luxury" },
  { keyword: "Kitesurf en Playa Blanca Punta Cana cursos", cluster: "deportes" },
  { keyword: "Mejores puntos de buceo en Bavaro 2026", cluster: "deportes" },
  { keyword: "Alquiler de equipos de Snorkel en Cabeza de Toro", cluster: "deportes" },
  { keyword: "Deep Sea Fishing Punta Cana charters privados", cluster: "deportes" },
  { keyword: "Torneo de pesca Marlin Azul Cap Cana", cluster: "deportes" },
  { keyword: "Clases de Surf en Playa Macao precios", cluster: "deportes" },
  { keyword: "Windsurf en los hoteles de Uvero Alto", cluster: "deportes" },
  { keyword: "Alquiler de Hobie Cat en resorts Riu", cluster: "deportes" },
  { keyword: "Kayak transparente Punta Cana fotos", cluster: "deportes" },
  { keyword: "Excursion de buceo al barco hundido Astron", cluster: "deportes" },
  { keyword: "Certificacion PADI en Punta Cana escuelas", cluster: "deportes" },
  { keyword: "Flyboard Punta Cana experiencia", cluster: "deportes" },
  { keyword: "Wakeboarding en el lago de Downtown", cluster: "deportes" },
  { keyword: "Paddle Board yoga en la laguna", cluster: "deportes" },
  { keyword: "Encuentro con mantarrayas y tiburones Stingray Bay", cluster: "deportes" },
  { keyword: "Green fees Punta Espada Golf Club", cluster: "golf" },
  { keyword: "Corales Golf Course tarifas 2026", cluster: "golf" },
  { keyword: "La Cana Golf Club 27 hoyos", cluster: "golf" },
  { keyword: "Cocotal Golf & Country Club membresias", cluster: "golf" },
  { keyword: "Hard Rock Golf Club at Cana Bay", cluster: "golf" },
  { keyword: "Iberostar Bavaro Golf Club campo", cluster: "golf" },
  { keyword: "Dye Fore Golf Course Casa de Campo", cluster: "golf" },
  { keyword: "Teeth of the Dog excursion desde Punta Cana", cluster: "golf" },
  { keyword: "Academias de golf en Punta Cana para ninos", cluster: "golf" },
  { keyword: "Torneos de tenis en los hoteles de Cap Cana", cluster: "golf" },
  { keyword: "Fotografos de bodas en Punta Cana precios", cluster: "foto" },
  { keyword: "Sesion de fotos Trash the Dress en la playa", cluster: "foto" },
  { keyword: "Mejores lugares para fotos de Instagram en Punta Cana", cluster: "foto" },
  { keyword: "Paquetes de renovacion de votos matrimoniales", cluster: "foto" },
  { keyword: "Bodas civiles en Republica Dominicana requisitos", cluster: "foto" },
  { keyword: "Alquiler de vestidos para fotos en la playa", cluster: "foto" },
  { keyword: "Maquillistas profesionales para novias en Bavaro", cluster: "foto" },
  { keyword: "Decoracion de eventos corporativos Punta Cana", cluster: "foto" },
  { keyword: "Alquiler de drones para eventos en el Caribe", cluster: "foto" },
  { keyword: "Video de boda con tomas aereas Punta Cana", cluster: "foto" },
  { keyword: "Como ir de Punta Cana a Samana en bus", cluster: "movilidad" },
  { keyword: "Transporte Espinal de Punta Cana a Santiago", cluster: "movilidad" },
  { keyword: "Expreso Bavaro horarios 2026", cluster: "movilidad" },
  { keyword: "Parada de guaguas en Veron", cluster: "movilidad" },
  { keyword: "Alquiler de scooters en El Cortecito", cluster: "movilidad" },
  { keyword: "Motoconcho en Bavaro precios y seguridad", cluster: "movilidad" },
  { keyword: "Taxis de Cap Cana tarifas fijas", cluster: "movilidad" },
  { keyword: "Estaciones de carga electrica en Punta Cana Tesla Evergo", cluster: "movilidad" },
  { keyword: "Gasolineras Sunix y Shell en el Boulevard Turistico", cluster: "movilidad" },
  { keyword: "Tiempo de conduccion Punta Cana a Bayahibe", cluster: "movilidad" },
  { keyword: "Tiendas de lujo en BlueMall Puntacana", cluster: "compras" },
  { keyword: "Supermercado Nacional Punta Cana productos", cluster: "compras" },
  { keyword: "Farmacia Los Hidalgos Bavaro", cluster: "compras" },
  { keyword: "Comprar puros dominicanos autenticos Arturo Fuente", cluster: "compras" },
  { keyword: "Tiendas de souvenirs en Bibijagua precios", cluster: "compras" },
  { keyword: "Comprar Larimar y Ambar en Punta Cana consejos", cluster: "compras" },
  { keyword: "Ron Dominicano Brugal Barcelo Bermudez donde comprar", cluster: "compras" },
  { keyword: "Ropa de playa y trajes de bano en tiendas locales", cluster: "compras" },
  { keyword: "Opticas y servicios dentales en Punta Cana", cluster: "compras" },
  { keyword: "Salones de belleza y peluquerias en Bavaro", cluster: "compras" },
  { keyword: "Centro Medico Punta Cana emergencias", cluster: "salud" },
  { keyword: "Hospital IMG Boulevard Turistico", cluster: "salud" },
  { keyword: "Seguro de salud internacional aceptado en RD", cluster: "salud" },
  { keyword: "Clinicas dentales para turismo medico en Punta Cana", cluster: "salud" },
  { keyword: "Laboratorios para pruebas COVID o gripe en el hotel", cluster: "salud" },
  { keyword: "Hay mosquitos en Punta Cana en verano", cluster: "salud" },
  { keyword: "Mejores repelentes para el Caribe", cluster: "salud" },
  { keyword: "Proteccion solar recomendada biodegradable", cluster: "salud" },
  { keyword: "Numeros de emergencia Republica Dominicana 911", cluster: "salud" },
  { keyword: "Policia Turistica CESTUR Punta Cana oficinas", cluster: "salud" },
  { keyword: "Apartamentos en venta en Punta Cana 2026", cluster: "inversion" },
  { keyword: "Invertir en Cana Bay Hard Rock Golf", cluster: "inversion" },
  { keyword: "Proyectos inmobiliarios en Vista Cana", cluster: "inversion" },
  { keyword: "Ley de Confotur beneficios fiscales RD", cluster: "inversion" },
  { keyword: "Administradores de propiedades en Bavaro Property Management", cluster: "inversion" },
  { keyword: "Rentabilidad de alquiler corto plazo Airbnb Punta Cana", cluster: "inversion" },
  { keyword: "Comprar terrenos en Playa Macao", cluster: "inversion" },
  { keyword: "Notarios y abogados inmobiliarios en Punta Cana", cluster: "inversion" },
  { keyword: "Prestamos hipotecarios para extranjeros en RD", cluster: "inversion" },
  { keyword: "Condominios con acceso a club de playa", cluster: "inversion" },
  { keyword: "Discoteca Pacha Punta Cana Riu", cluster: "nightlife" },
  { keyword: "Drink Point Friusa ambiente local", cluster: "nightlife" },
  { keyword: "Onno’s Eat & Drink Bavaro happy hour", cluster: "nightlife" },
  { keyword: "Soles Chill Out Bar Los Corales", cluster: "nightlife" },
  { keyword: "Restaurantes con musica en vivo Punta Cana", cluster: "nightlife" },
  { keyword: "Shows de noche en hoteles Iberostar", cluster: "nightlife" },
  { keyword: "Casinos abiertos 24 horas en Punta Cana", cluster: "nightlife" },
  { keyword: "Torneos de Poker en Hard Rock Casino", cluster: "nightlife" },
  { keyword: "Eventos de musica electronica Punta Cana 2026", cluster: "nightlife" },
  { keyword: "Conciertos en el Anfiteatro de BlueMall", cluster: "nightlife" },
  { keyword: "Viajar a Punta Cana con ninos de 2 anos", cluster: "familiar" },
  { keyword: "Hoteles con cunas y servicio de ninera", cluster: "familiar" },
  { keyword: "Mejores parques acuaticos dentro de hoteles", cluster: "familiar" },
  { keyword: "Actividades para adolescentes en Punta Cana", cluster: "familiar" },
  { keyword: "Resorts accesibles para personas en silla de ruedas", cluster: "familiar" },
  { keyword: "Menus para celiacos en hoteles todo incluido", cluster: "familiar" },
  { keyword: "Hoteles con opciones veganas y vegetarianas", cluster: "familiar" },
  { keyword: "Clubes de ninos Kids Club con mejores actividades", cluster: "familiar" },
  { keyword: "Viajes de graduacion a Punta Cana paquetes", cluster: "familiar" },
  { keyword: "Resorts tranquilos para personas mayores", cluster: "familiar" },
  { keyword: "Punta Cana vs Cancun cual es mas barato", cluster: "global" },
  { keyword: "Es mejor la playa de Aruba o Punta Cana", cluster: "global" },
  { keyword: "Punta Cana vs Riviera Maya para luna de miel", cluster: "global" },
  { keyword: "Comparativa Hoteles Riu vs Iberostar vs Bahia Principe", cluster: "global" },
  { keyword: "Diferencia entre Uvero Alto y Playa Bavaro", cluster: "global" },
  { keyword: "Vale la pena pagar Cap Cana o quedarse en Bavaro", cluster: "global" },
  { keyword: "Punta Cana vs Jamaica seguridad 2026", cluster: "global" },
  { keyword: "Mejores destinos del Caribe para 2026", cluster: "global" },
  { keyword: "Codigo promocional hoteles Punta Cana", cluster: "conversion" },
  { keyword: "Ofertas Flash viaje Punta Cana todo incluido", cluster: "conversion" },
  { keyword: "Paquetes vuelo hotel Republica Dominicana", cluster: "conversion" },
  { keyword: "Reserva ahora paga despues Punta Cana", cluster: "conversion" },
  { keyword: "Descuentos para residentes dominicanos en hoteles", cluster: "conversion" },
  { keyword: "Grupos de Facebook para viajeros a Punta Cana", cluster: "conversion" },
  { keyword: "Black Friday ofertas Punta Cana 2026", cluster: "conversion" },
  { keyword: "Cyber Monday viajes al Caribe", cluster: "conversion" },
  { keyword: "Errores de precio vuelos Punta Cana", cluster: "conversion" },
  { keyword: "Ultimo minuto resorts Punta Cana hoy", cluster: "conversion" }
];

const CLUSTER_CONFIG: Record<
  Cluster,
  {
    titlePrefix: string;
    excerpt: string;
    intro: string;
    buyerIntent: string;
    ctaLabel: string;
    ctaHref: string;
    ctaSupportHref: string;
  }
> = {
  comparativas: {
    titlePrefix: "Comparativa de viaje",
    excerpt: "Analisis de decision para viajeros con enfoque de conversion.",
    intro: "Este tipo de busqueda implica duda antes de comprar. El objetivo es resolver objeciones y cerrar con una recomendacion concreta.",
    buyerIntent: "Comparar bien reduce errores y acelera la reserva de hotel, excursiones y traslados.",
    ctaLabel: "Ver tours recomendados",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  luxury: {
    titlePrefix: "Guia premium",
    excerpt: "Contenido high-end orientado a clientes de lujo en Punta Cana.",
    intro: "Las keywords premium requieren posicionamiento de autoridad y propuestas de valor superiores.",
    buyerIntent: "Convertimos interes de lujo en itinerarios privados y reservas de alto ticket.",
    ctaLabel: "Explorar experiencias premium",
    ctaHref: "/punta-cana/premium-transfer-services",
    ctaSupportHref: "/hoteles"
  },
  deportes: {
    titlePrefix: "Guia de actividad",
    excerpt: "Respuesta directa para deportes y actividades acuaticas con intencion de reserva.",
    intro: "Las busquedas tecnicas de deporte suelen estar en fase de compra, no solo inspiracion.",
    buyerIntent: "Al aclarar requisitos y beneficios, mejoramos conversion en actividades especializadas.",
    ctaLabel: "Reservar actividades",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  golf: {
    titlePrefix: "Guia de golf",
    excerpt: "Informacion de campos, tarifas y valor para turismo deportivo de elite.",
    intro: "El golf en Punta Cana es mercado premium con alta intencion de gasto.",
    buyerIntent: "Combinamos informacion precisa con oferta comercial para cerrar reservas de alto valor.",
    ctaLabel: "Ver experiencias y traslados",
    ctaHref: "/tours",
    ctaSupportHref: "/punta-cana/premium-transfer-services"
  },
  foto: {
    titlePrefix: "Guia visual y eventos",
    excerpt: "Contenido para bodas, fotografia y eventos con enfoque en conversion.",
    intro: "Este segmento responde mejor cuando hay pasos claros de planificacion y logistica.",
    buyerIntent: "Transformamos consultas visuales en paquetes completos con movilidad y soporte.",
    ctaLabel: "Planificar experiencia",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  movilidad: {
    titlePrefix: "Movilidad y rutas",
    excerpt: "Informacion practica de transporte interno y conexiones regionales.",
    intro: "Resolver movilidad reduce friccion y aumenta conversion en servicios complementarios.",
    buyerIntent: "Cuando el cliente entiende como moverse, compra mas rapido actividades y hoteles.",
    ctaLabel: "Cotizar traslado",
    ctaHref: "/traslado",
    ctaSupportHref: "/tours"
  },
  compras: {
    titlePrefix: "Guia de compras y servicios",
    excerpt: "Recomendaciones de vida diaria para turistas con orientacion de venta cruzada.",
    intro: "Las busquedas de compras y servicios crean oportunidades para extender tiempo y gasto en destino.",
    buyerIntent: "Convertimos dudas operativas en planes de viaje completos y reservas seguras.",
    ctaLabel: "Ver actividades cercanas",
    ctaHref: "/tours",
    ctaSupportHref: "/hoteles"
  },
  salud: {
    titlePrefix: "Guia de salud y seguridad",
    excerpt: "Respuestas practicas de seguridad y asistencia medica para viajeros.",
    intro: "Cuando se resuelven dudas de salud, el cliente avanza con mayor confianza hacia la reserva.",
    buyerIntent: "La confianza sanitaria impulsa conversion en hoteles, tours y traslados.",
    ctaLabel: "Plan de viaje seguro",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  inversion: {
    titlePrefix: "Guia inmobiliaria",
    excerpt: "Contenido de inversion y real estate con enfoque en demanda internacional.",
    intro: "Este nicho requiere precision comercial y contexto local para convertir consultas en leads calificados.",
    buyerIntent: "Posicionamos autoridad local para captar interesados en inversion y estancias prolongadas.",
    ctaLabel: "Conocer zonas y servicios",
    ctaHref: "/hoteles",
    ctaSupportHref: "/traslado"
  },
  nightlife: {
    titlePrefix: "Guia nightlife",
    excerpt: "Vida nocturna y entretenimiento con enfoque en conversion turistica.",
    intro: "Los usuarios que buscan nightlife suelen estar listos para comprar experiencias y movilidad nocturna.",
    buyerIntent: "Alineamos ocio + logistica para cerrar reservas de manera inmediata.",
    ctaLabel: "Reservar experiencias",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  familiar: {
    titlePrefix: "Guia familiar",
    excerpt: "Contenido para familias, edades y necesidades especiales con enfoque de compra.",
    intro: "El turismo familiar convierte mejor cuando se responde con claridad sobre comodidad y seguridad.",
    buyerIntent: "Reducimos incertidumbre y facilitamos reserva integral para todo el grupo.",
    ctaLabel: "Ver opciones familiares",
    ctaHref: "/hoteles",
    ctaSupportHref: "/tours"
  },
  global: {
    titlePrefix: "Comparativa global",
    excerpt: "Comparativas directas del Caribe para capturar demanda de eleccion de destino.",
    intro: "Estas keywords compiten fuerte en SERP; requieren posicionamiento claro de valor diferencial.",
    buyerIntent: "Mostramos por que Punta Cana es una decision rentable para cerrar conversion.",
    ctaLabel: "Descubrir Punta Cana",
    ctaHref: "/tours",
    ctaSupportHref: "/hoteles"
  },
  conversion: {
    titlePrefix: "Oferta y conversion",
    excerpt: "Keywords transaccionales para activar compra inmediata en viajes a Punta Cana.",
    intro: "Este contenido esta orientado a capturar usuarios listos para comprar o comparar oferta final.",
    buyerIntent: "El foco es accion: descuentos, urgencia y cierre de reservas sin friccion.",
    ctaLabel: "Reservar ahora",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  }
};

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const buildContentHtml = (keyword: string, cluster: Cluster) => {
  const cfg = CLUSTER_CONFIG[cluster];
  return `
<h1>${keyword}</h1>
<p>${cfg.intro}</p>
<p>${cfg.buyerIntent}</p>

<h2>Checklist de decision</h2>
<ul>
  <li>Define objetivo del viaje y presupuesto final en USD.</li>
  <li>Confirma zona, tiempos de traslado y disponibilidad real.</li>
  <li>Compara valor total, no solo precio inicial.</li>
  <li>Cierra servicios clave con soporte por WhatsApp.</li>
</ul>

<h2>Recomendacion Proactivitis</h2>
<p>Para ${keyword}, la estrategia mas efectiva es ordenar primero logistica y luego cerrar actividades y alojamiento segun tu perfil de viaje.</p>

<h2>Siguiente paso</h2>
<p><a href="${cfg.ctaHref}">${cfg.ctaLabel}</a> | <a href="${cfg.ctaSupportHref}">Ver soporte complementario</a></p>
`;
};

async function main() {
  const tourImages = await prisma.tour.findMany({
    where: {
      status: { equals: "PUBLISHED", mode: "insensitive" },
      heroImage: { not: null }
    },
    select: { heroImage: true },
    orderBy: { title: "asc" }
  });
  const images = tourImages.map((item) => (item.heroImage ?? "").trim()).filter(Boolean);
  const fallbackImage = "/tours/default.jpg";

  let created = 0;
  let skipped = 0;
  const now = new Date();

  for (let i = 0; i < KEYWORDS.length; i += 1) {
    const entry = KEYWORDS[i];
    const keyword = normalize(entry.keyword);
    const slug = `seo-${slugifyBlog(keyword)}`;
    const exists = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (exists) {
      skipped += 1;
      continue;
    }

    const cfg = CLUSTER_CONFIG[entry.cluster];
    const title = `${cfg.titlePrefix}: ${keyword}`;
    const excerpt = `${cfg.excerpt} Keyword objetivo: ${keyword}.`;
    const coverImage = images.length ? images[i % images.length] : fallbackImage;
    const contentHtml = buildContentHtml(keyword, entry.cluster);

    await prisma.blogPost.create({
      data: {
        id: randomUUID(),
        title,
        slug,
        excerpt,
        coverImage,
        contentHtml,
        status: "PUBLISHED",
        publishedAt: now
      }
    });
    created += 1;
  }

  console.log(
    JSON.stringify(
      {
        totalKeywords: KEYWORDS.length,
        created,
        skippedExisting: skipped
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

