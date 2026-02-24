import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { slugifyBlog } from "../lib/blog";
import { buildSeoBlogDraft } from "./seoBlogWriter";

const prisma = new PrismaClient();

type Cluster = "hoteles" | "playas" | "excursiones" | "logistica" | "gastronomia" | "seguridad";

type KeywordEntry = {
  keyword: string;
  cluster: Cluster;
};

const KEYWORDS: KeywordEntry[] = [
  { keyword: "Hoteles Punta Cana todo incluido", cluster: "hoteles" },
  { keyword: "Mejores resorts Punta Cana 2026", cluster: "hoteles" },
  { keyword: "Resorts solo adultos Punta Cana", cluster: "hoteles" },
  { keyword: "Hoteles familiares con parque acuatico", cluster: "hoteles" },
  { keyword: "Villas de lujo en Cap Cana", cluster: "hoteles" },
  { keyword: "Apartamentos en alquiler Bavaro", cluster: "hoteles" },
  { keyword: "Airbnb Punta Cana playa", cluster: "hoteles" },
  { keyword: "Hard Rock Hotel Punta Cana ofertas", cluster: "hoteles" },
  { keyword: "Barcelo Bavaro Palace precios", cluster: "hoteles" },
  { keyword: "Riu Republica opiniones", cluster: "hoteles" },
  { keyword: "Majestic Elegance Punta Cana", cluster: "hoteles" },
  { keyword: "Hyatt Ziva vs Zilara Cap Cana", cluster: "hoteles" },
  { keyword: "Grand Bavaro Princess reviews", cluster: "hoteles" },
  { keyword: "Excellence Punta Cana booking", cluster: "hoteles" },
  { keyword: "Sanctuary Cap Cana bodas", cluster: "hoteles" },
  { keyword: "Lopesan Costa Bavaro tarifas", cluster: "hoteles" },
  { keyword: "Hoteles con piscina privada en la habitacion", cluster: "hoteles" },
  { keyword: "Resorts de lujo en Uvero Alto", cluster: "hoteles" },
  { keyword: "Hoteles economicos en el Cortecito", cluster: "hoteles" },
  { keyword: "Resorts con campo de golf Punta Cana", cluster: "hoteles" },
  { keyword: "Playa Bavaro ubicacion", cluster: "playas" },
  { keyword: "Como llegar a Playa Macao", cluster: "playas" },
  { keyword: "Playa Juanillo Cap Cana acceso", cluster: "playas" },
  { keyword: "Arena Gorda Beach resorts", cluster: "playas" },
  { keyword: "Playa Blanca Punta Cana restaurante", cluster: "playas" },
  { keyword: "Cabeza de Toro actividades", cluster: "playas" },
  { keyword: "Miches Republica Dominicana hoteles", cluster: "playas" },
  { keyword: "Playa Esmeralda tours", cluster: "playas" },
  { keyword: "Isla Saona excursion premium", cluster: "playas" },
  { keyword: "Isla Catalina buceo y snorkel", cluster: "playas" },
  { keyword: "Mejores playas sin sargazo 2026", cluster: "playas" },
  { keyword: "Estado del tiempo playas Punta Cana", cluster: "playas" },
  { keyword: "Camaras en vivo playas Punta Cana", cluster: "playas" },
  { keyword: "Scape Park Hoyo Azul tickets", cluster: "excursiones" },
  { keyword: "Boletos Coco Bongo Punta Cana", cluster: "excursiones" },
  { keyword: "Excursion Buggies Punta Cana precios", cluster: "excursiones" },
  { keyword: "Nado con delfines Dolphin Discovery", cluster: "excursiones" },
  { keyword: "Catamaran privado Punta Cana", cluster: "excursiones" },
  { keyword: "Tour Montana Redonda Miches", cluster: "excursiones" },
  { keyword: "Salto del Limon desde Punta Cana", cluster: "excursiones" },
  { keyword: "Tour Ciudad Colonial Santo Domingo", cluster: "excursiones" },
  { keyword: "Snorkeling en arrecifes de Bavaro", cluster: "excursiones" },
  { keyword: "Parasailing Punta Cana ofertas", cluster: "excursiones" },
  { keyword: "Pesca de altura Punta Cana", cluster: "excursiones" },
  { keyword: "Zip line adventure Punta Cana", cluster: "excursiones" },
  { keyword: "Monkeyland Punta Cana reviews", cluster: "excursiones" },
  { keyword: "Safari cultural Republica Dominicana", cluster: "excursiones" },
  { keyword: "Party boat Punta Cana barra libre", cluster: "excursiones" },
  { keyword: "Vuelos baratos a Punta Cana PUJ", cluster: "logistica" },
  { keyword: "Traslados aeropuerto Punta Cana a hotel", cluster: "logistica" },
  { keyword: "Alquiler de carros Aeropuerto Punta Cana", cluster: "logistica" },
  { keyword: "Uber en Punta Cana disponibilidad", cluster: "logistica" },
  { keyword: "Tiempo de traslado PUJ a Uvero Alto", cluster: "logistica" },
  { keyword: "Requisitos entrada Republica Dominicana 2026", cluster: "logistica" },
  { keyword: "E-ticket Republica Dominicana formulario", cluster: "logistica" },
  { keyword: "Aduana Punta Cana reglamentos", cluster: "logistica" },
  { keyword: "Parking Aeropuerto Punta Cana", cluster: "logistica" },
  { keyword: "Vuelos directos Madrid Punta Cana", cluster: "logistica" },
  { keyword: "Vuelos baratos Miami Punta Cana", cluster: "logistica" },
  { keyword: "Aerolineas low cost Punta Cana", cluster: "logistica" },
  { keyword: "Mejores restaurantes en Bavaro", cluster: "gastronomia" },
  { keyword: "Jellyfish Restaurant reserva", cluster: "gastronomia" },
  { keyword: "Restaurante Bachata Rosa Juan Luis Guerra", cluster: "gastronomia" },
  { keyword: "Cena romantica en la playa Punta Cana", cluster: "gastronomia" },
  { keyword: "Comida tipica dominicana Punta Cana", cluster: "gastronomia" },
  { keyword: "Discoteca Imagine Cave tickets", cluster: "gastronomia" },
  { keyword: "Oro Nightclub Hard Rock", cluster: "gastronomia" },
  { keyword: "Bares frente al mar Los Corales", cluster: "gastronomia" },
  { keyword: "Mariscos frescos Punta Cana", cluster: "gastronomia" },
  { keyword: "Restaurante Noah Bavaro menu", cluster: "gastronomia" },
  { keyword: "Mejor epoca para viajar a Punta Cana", cluster: "seguridad" },
  { keyword: "Clima en Punta Cana en septiembre", cluster: "seguridad" },
  { keyword: "Temporada de huracanes Punta Cana 2026", cluster: "seguridad" },
  { keyword: "Es seguro salir del hotel en Punta Cana", cluster: "seguridad" },
  { keyword: "Cambio de moneda DOP a USD Punta Cana", cluster: "seguridad" },
  { keyword: "Cajeros automaticos en Bavaro", cluster: "seguridad" },
  { keyword: "Hospitales privados Punta Cana", cluster: "seguridad" },
  { keyword: "Farmacias 24 horas Punta Cana", cluster: "seguridad" },
  { keyword: "Internet y tarjetas SIM Punta Cana", cluster: "seguridad" },
  { keyword: "Propinas en resorts todo incluido", cluster: "seguridad" }
];

const CLUSTER_CONFIG: Record<
  Cluster,
  {
    titlePrefix: string;
    excerptLead: string;
    intro: string;
    planning: string;
    practicalBlockTitle: string;
    practicalTips: string[];
    mistakesTitle: string;
    mistakes: string[];
    close: string;
    ctaLabel: string;
    ctaHref: string;
    ctaSupportHref: string;
  }
> = {
  hoteles: {
    titlePrefix: "Guia actualizada",
    excerptLead: "Comparativa clara para elegir hotel segun zona, estilo de viaje y presupuesto.",
    intro:
      "Si estas comparando hoteles en Punta Cana, lo mas util es separar por zonas y por tipo de viaje: familiar, parejas o solo adultos.",
    planning:
      "Antes de reservar, revisa no solo la habitacion, sino tambien distancia desde el aeropuerto, facilidades del resort y acceso a excursiones.",
    practicalBlockTitle: "Como elegir alojamiento sin equivocarte",
    practicalTips: [
      "Bavaro para oferta amplia y buena conectividad.",
      "Cap Cana para ambiente premium y mas tranquilidad.",
      "Uvero Alto para resorts grandes y playa relajada.",
      "Confirma transporte ida y vuelta antes de pagar."
    ],
    mistakesTitle: "Errores comunes al reservar hotel",
    mistakes: [
      "Reservar por impulso sin comparar la zona.",
      "No revisar cargos extras del resort.",
      "Elegir hotel sin plan de movilidad."
    ],
    close:
      "Cuando eliges el hotel correcto para tu perfil, el viaje fluye mejor y evitas cambios costosos en destino.",
    ctaLabel: "Ver hoteles y resorts",
    ctaHref: "/hoteles",
    ctaSupportHref: "/traslado"
  },
  playas: {
    titlePrefix: "Guia de destino",
    excerptLead: "Acceso, ambiente y recomendaciones para disfrutar las mejores playas sin perder tiempo.",
    intro:
      "Cada playa en Punta Cana tiene un estilo distinto. Algunas son perfectas para relax y otras para aventura o deportes acuaticos.",
    planning:
      "Elegir bien la playa te ayuda a decidir hotel, excursiones y tipo de transporte desde el primer dia.",
    practicalBlockTitle: "Puntos practicos para aprovechar mejor la playa",
    practicalTips: [
      "Macao para oleaje y ambiente natural.",
      "Bavaro para combinar playa + actividades.",
      "Juanillo para experiencia mas exclusiva.",
      "Lleva siempre protector solar y agua adicional."
    ],
    mistakesTitle: "Errores frecuentes en dias de playa",
    mistakes: [
      "Ir sin revisar condiciones del mar.",
      "No confirmar transporte de regreso.",
      "Planear demasiadas actividades en una sola tarde."
    ],
    close:
      "Con una playa bien elegida y una logistica clara, el dia rinde mucho mas y se disfruta sin improvisacion.",
    ctaLabel: "Ver excursiones de playa",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  excursiones: {
    titlePrefix: "Reserva inteligente",
    excerptLead: "Guia completa para elegir excursion segun tiempo, presupuesto y estilo de viaje.",
    intro:
      "Punta Cana tiene excursiones muy distintas entre si. Elegir bien depende de tu energia, tiempo disponible y ubicacion del hotel.",
    planning:
      "La mejor decision no siempre es el tour mas largo; es el que encaja con tu agenda real y con la logistica de tu grupo.",
    practicalBlockTitle: "Como escoger la excursion correcta",
    practicalTips: [
      "Define si buscas aventura, mar o actividad cultural.",
      "Revisa horario de salida y retorno real.",
      "Confirma si incluye transporte y comidas.",
      "Reserva con antelacion en temporada alta."
    ],
    mistakesTitle: "Errores frecuentes al reservar excursiones",
    mistakes: [
      "Escoger por moda sin ver si aplica a tu grupo.",
      "No revisar nivel fisico requerido.",
      "No dejar margen entre tours consecutivos."
    ],
    close:
      "Una excursion bien elegida te da mejor experiencia y evita cancelaciones o cambios de ultimo minuto.",
    ctaLabel: "Reservar excursiones",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  logistica: {
    titlePrefix: "Planificacion de viaje",
    excerptLead: "Guia util de vuelos, entradas al pais y traslados para viajar sin fricciones.",
    intro:
      "Las dudas de logistica son normales y, si se resuelven a tiempo, tu viaje se vuelve mucho mas comodo desde el aeropuerto.",
    planning:
      "Organizar traslado, documentos y horarios de llegada evita perdidas de tiempo y te ayuda a arrancar vacaciones sin estres.",
    practicalBlockTitle: "Base logistica para un viaje fluido",
    practicalTips: [
      "Completa requisitos de entrada antes de volar.",
      "Confirma numero de vuelo y hora de aterrizaje.",
      "Coordina traslado segun zona del hotel.",
      "Guarda contactos de soporte y reservas en el movil."
    ],
    mistakesTitle: "Errores logísticos que te pueden costar tiempo",
    mistakes: [
      "Llegar sin plan de transporte definido.",
      "No validar terminal o punto de encuentro.",
      "Asumir tiempos de traslado sin confirmarlos."
    ],
    close:
      "Con logistica bien cerrada, todo lo demas se vuelve mas facil: check-in rapido, actividades puntuales y mejor uso del tiempo.",
    ctaLabel: "Cotizar traslado",
    ctaHref: "/traslado",
    ctaSupportHref: "/tours"
  },
  gastronomia: {
    titlePrefix: "Guia de experiencias",
    excerptLead: "Recomendaciones reales de restaurantes, bares y planes para disfrutar mejor tus noches.",
    intro:
      "Comer bien en Punta Cana no depende solo del restaurante, tambien de la zona y del plan que lleves para moverte con comodidad.",
    planning:
      "Si combinas gastronomia con una buena ruta de transporte, puedes disfrutar cenas y nightlife sin preocupaciones.",
    practicalBlockTitle: "Como planear salidas gastronomicas",
    practicalTips: [
      "Reserva en restaurantes demandados con antelacion.",
      "Confirma horarios de regreso al hotel.",
      "Combina una cena con actividad cercana para optimizar tiempo.",
      "Lleva presupuesto definido para evitar gastos impulsivos."
    ],
    mistakesTitle: "Errores comunes en planes nocturnos",
    mistakes: [
      "Salir sin transporte de retorno confirmado.",
      "No revisar ubicacion real del lugar.",
      "Subestimar tiempos de traslado nocturno."
    ],
    close:
      "Un plan gastronomico bien armado convierte una cena en una experiencia completa y sin contratiempos.",
    ctaLabel: "Ver experiencias en Punta Cana",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  seguridad: {
    titlePrefix: "Guia de confianza",
    excerptLead: "Respuestas claras de clima, seguridad y servicios para viajar con tranquilidad.",
    intro:
      "Antes de reservar, muchas personas quieren validar temas de seguridad y condiciones de viaje. Esa informacion bien explicada da tranquilidad real.",
    planning:
      "Conocer clima, salud y servicios basicos de la zona te permite planificar mejor y evitar imprevistos durante el viaje.",
    practicalBlockTitle: "Recomendaciones para viajar con tranquilidad",
    practicalTips: [
      "Revisa pronostico de clima por fecha de viaje.",
      "Guarda contactos de emergencias locales.",
      "Confirma cobertura de seguro medico internacional.",
      "Usa transporte formal para traslados largos."
    ],
    mistakesTitle: "Errores que aumentan el riesgo en viaje",
    mistakes: [
      "No informarte sobre zonas y horarios.",
      "Confiar solo en recomendaciones no verificadas.",
      "No tener plan B de transporte o salud."
    ],
    close:
      "Cuando viajas con informacion confiable, tomas mejores decisiones y disfrutas Punta Cana con mucha mas seguridad.",
    ctaLabel: "Planificar viaje y reservas",
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

async function main() {
  const tourImages = await prisma.tour.findMany({
    where: {
      status: { equals: "PUBLISHED", mode: "insensitive" },
      heroImage: { not: null }
    },
    select: { heroImage: true },
    orderBy: { title: "asc" }
  });
  const images = tourImages
    .map((item) => (item.heroImage ?? "").trim())
    .filter(Boolean);
  const fallbackImage = "/tours/default.jpg";

  let created = 0;
  let updated = 0;
  const now = new Date();

  for (let i = 0; i < KEYWORDS.length; i += 1) {
    const entry = KEYWORDS[i];
    const keyword = normalize(entry.keyword);
    const slug = `seo-${slugifyBlog(keyword)}`;
    const cfg = CLUSTER_CONFIG[entry.cluster];
    const { title, excerpt, contentHtml } = buildSeoBlogDraft(keyword, cfg, {
      label: cfg.ctaLabel,
      href: cfg.ctaHref,
      supportLabel: "Ver soporte de movilidad",
      supportHref: cfg.ctaSupportHref
    });
    const coverImage = images.length ? images[i % images.length] : fallbackImage;
    const exists = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (exists) {
      await prisma.blogPost.update({
        where: { id: exists.id },
        data: {
          title,
          excerpt,
          coverImage,
          contentHtml,
          status: "PUBLISHED"
        }
      });
      updated += 1;
    } else {
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
  }

  console.log(
    JSON.stringify(
      {
        totalKeywords: KEYWORDS.length,
        created,
        updated
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
