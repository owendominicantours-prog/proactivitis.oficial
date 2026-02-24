import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { slugifyBlog } from "../lib/blog";
import { buildSeoBlogDraft } from "./seoBlogWriter";

const prisma = new PrismaClient();

type Cluster = "resorts" | "excursiones" | "zonas" | "logistica" | "gastronomia";

type KeywordEntry = {
  keyword: string;
  cluster: Cluster;
};

const KEYWORDS: KeywordEntry[] = [
  { keyword: "Paradisus Palma Real Golf & Spa Resort", cluster: "resorts" },
  { keyword: "Melia Punta Cana Beach Solo Adultos", cluster: "resorts" },
  { keyword: "Garden Suites by Melia", cluster: "resorts" },
  { keyword: "Falcon’s Resort by Melia Katmandu Park", cluster: "resorts" },
  { keyword: "Iberostar Grand Bavaro", cluster: "resorts" },
  { keyword: "Iberostar Selection Bavaro Suites", cluster: "resorts" },
  { keyword: "Iberostar Dominicana ofertas", cluster: "resorts" },
  { keyword: "Bahia Principe Luxury Esmeralda", cluster: "resorts" },
  { keyword: "Bahia Principe Grand Aquamarine", cluster: "resorts" },
  { keyword: "Bahia Principe Fantasia Punta Cana Castillo", cluster: "resorts" },
  { keyword: "Royalton Punta Cana An Autograph Collection", cluster: "resorts" },
  { keyword: "Royalton Chic Punta Cana Solo Adultos", cluster: "resorts" },
  { keyword: "Hideaway at Royalton Punta Cana", cluster: "resorts" },
  { keyword: "Memories Splash Punta Cana Parque acuatico", cluster: "resorts" },
  { keyword: "Majestic Colonial Punta Cana", cluster: "resorts" },
  { keyword: "Majestic Mirage Punta Cana Club", cluster: "resorts" },
  { keyword: "Riu Palace Bavaro", cluster: "resorts" },
  { keyword: "Riu Palace Punta Cana", cluster: "resorts" },
  { keyword: "Riu Palace Macao Solo Adultos renovado", cluster: "resorts" },
  { keyword: "Riu Bambu familiar", cluster: "resorts" },
  { keyword: "Riu Naiboa economico", cluster: "resorts" },
  { keyword: "Ocean Blue & Sand Beach Resort", cluster: "resorts" },
  { keyword: "Ocean El Faro El Beso", cluster: "resorts" },
  { keyword: "Catalonia Royal Bavaro", cluster: "resorts" },
  { keyword: "Catalonia Punta Cana Golf & Casino", cluster: "resorts" },
  { keyword: "Dreams Royal Beach Punta Cana", cluster: "resorts" },
  { keyword: "Dreams Onyx Resort & Spa", cluster: "resorts" },
  { keyword: "Dreams Flora Resort & Spa", cluster: "resorts" },
  { keyword: "Breathless Punta Cana Resort & Spa", cluster: "resorts" },
  { keyword: "Now Larimar Punta Cana Rebranding", cluster: "resorts" },
  { keyword: "Sunscape Coco Punta Cana", cluster: "resorts" },
  { keyword: "Grand Sirenis Punta Cana Resort", cluster: "resorts" },
  { keyword: "Serenade Punta Cana Beach & Spa", cluster: "resorts" },
  { keyword: "Radisson Blu Punta Cana", cluster: "resorts" },
  { keyword: "Be Live Collection Punta Cana", cluster: "resorts" },
  { keyword: "Vista Sol Punta Cana Beach Resort", cluster: "resorts" },
  { keyword: "Occidental Caribe Antiguo Barcelo Premium", cluster: "resorts" },
  { keyword: "Occidental Punta Cana", cluster: "resorts" },
  { keyword: "VIK Hotel Arena Blanca", cluster: "resorts" },
  { keyword: "Whala Bavaro", cluster: "resorts" },
  { keyword: "Tour en helicoptero Punta Cana precios", cluster: "excursiones" },
  { keyword: "Avistamiento de ballenas en Samana enero marzo", cluster: "excursiones" },
  { keyword: "Excursion a Cayo Levantado Isla Bacardi", cluster: "excursiones" },
  { keyword: "Buggy aventura dunas de Macao", cluster: "excursiones" },
  { keyword: "Polaris 4x4 tour Punta Cana", cluster: "excursiones" },
  { keyword: "Safari en camion monstruo Republica Dominicana", cluster: "excursiones" },
  { keyword: "Snorkel en la piscina natural de Bavaro", cluster: "excursiones" },
  { keyword: "Seaquarium Punta Cana caminar bajo el agua", cluster: "excursiones" },
  { keyword: "Marinarium Snorkeling Cruise", cluster: "excursiones" },
  { keyword: "Crucero al atardecer en catamaran", cluster: "excursiones" },
  { keyword: "Pesca privada en Punta Cana Charters", cluster: "excursiones" },
  { keyword: "Alquiler de yates de lujo en Cap Cana", cluster: "excursiones" },
  { keyword: "Tour a la Cascada Limon y Las Terrenas", cluster: "excursiones" },
  { keyword: "Excursion de un dia a Isla Saona en lancha rapida", cluster: "excursiones" },
  { keyword: "Visita a la Basilica de Higuey", cluster: "excursiones" },
  { keyword: "Tour de compras al BlueMall y Downtown", cluster: "excursiones" },
  { keyword: "Visita a la fabrica de cigarros y ron", cluster: "excursiones" },
  { keyword: "Tour gastronomico callejero en Bavaro", cluster: "excursiones" },
  { keyword: "Kayak en los manglares de Punta Cana", cluster: "excursiones" },
  { keyword: "Paddle boarding en Playa Blanca", cluster: "excursiones" },
  { keyword: "Apartamentos en Cocotal Golf & Country Club", cluster: "zonas" },
  { keyword: "Alquiler vacacional en El Cortecito", cluster: "zonas" },
  { keyword: "Playa de los Corales restaurantes", cluster: "zonas" },
  { keyword: "Como llegar a Miches desde Punta Cana", cluster: "zonas" },
  { keyword: "Hoteles en Playa Esmeralda Miches", cluster: "zonas" },
  { keyword: "Marina de Cap Cana alquiler de amarres", cluster: "zonas" },
  { keyword: "Residencial Cana Bay Hard Rock Golf", cluster: "zonas" },
  { keyword: "Puntacana Resort & Club villas", cluster: "zonas" },
  { keyword: "Ciudad Las Canas servicios", cluster: "zonas" },
  { keyword: "Pueblo Bavaro ubicacion y seguridad", cluster: "zonas" },
  { keyword: "Cruce de Veron farmacias", cluster: "zonas" },
  { keyword: "Plaza San Juan Shopping Center", cluster: "zonas" },
  { keyword: "Palma Real Shopping Village tiendas", cluster: "zonas" },
  { keyword: "Boulevard Turistico del Este mapa", cluster: "zonas" },
  { keyword: "Friusa Bavaro servicios locales", cluster: "zonas" },
  { keyword: "Cabeza de Toro Beach Club", cluster: "zonas" },
  { keyword: "Playa Bibijagua souvenirs", cluster: "zonas" },
  { keyword: "Jellyfish Beach Club eventos", cluster: "zonas" },
  { keyword: "Pearl Beach Club Punta Cana", cluster: "zonas" },
  { keyword: "Playa Palmera Miches", cluster: "zonas" },
  { keyword: "Rastreo de vuelos aeropuerto Punta Cana PUJ", cluster: "logistica" },
  { keyword: "Salidas y llegadas Aeropuerto Internacional Punta Cana", cluster: "logistica" },
  { keyword: "Terminal A vs Terminal B Punta Cana", cluster: "logistica" },
  { keyword: "VIP Lounge Aeropuerto Punta Cana piscina", cluster: "logistica" },
  { keyword: "Fast Track Punta Cana Airport precios", cluster: "logistica" },
  { keyword: "Transporte privado Aeropuerto a Miches", cluster: "logistica" },
  { keyword: "Traslado hotel a Santo Domingo precio taxi", cluster: "logistica" },
  { keyword: "Alquiler de jeeps en Punta Cana", cluster: "logistica" },
  { keyword: "Seguro medico para turistas Republica Dominicana", cluster: "logistica" },
  { keyword: "Clinica Punta Cana IMG Hospital telefonos", cluster: "logistica" },
  { keyword: "Farmacia Carol Bavaro domicilio", cluster: "logistica" },
  { keyword: "Supermercado Jumbo Punta Cana ofertas", cluster: "logistica" },
  { keyword: "Supermercado Pola Bavaro", cluster: "logistica" },
  { keyword: "Bancos en Punta Cana Banreservas Popular", cluster: "logistica" },
  { keyword: "Cajeros que aceptan tarjetas internacionales", cluster: "logistica" },
  { keyword: "Como comprar una tarjeta SIM en Punta Cana Claro Altice", cluster: "logistica" },
  { keyword: "Wi Fi portatil para turistas en Republica Dominicana", cluster: "logistica" },
  { keyword: "Adaptadores de corriente para Republica Dominicana", cluster: "logistica" },
  { keyword: "Voltaje en Punta Cana para europeos", cluster: "logistica" },
  { keyword: "Mejores aplicaciones para moverse en Punta Cana", cluster: "logistica" },
  { keyword: "Restaurante La Yola Punta Cana", cluster: "gastronomia" },
  { keyword: "Playa Blanca Restaurant menu", cluster: "gastronomia" },
  { keyword: "Captain Cook El Cortecito mariscos", cluster: "gastronomia" },
  { keyword: "Onno’s Bavaro vida nocturna", cluster: "gastronomia" },
  { keyword: "Drink Point Bavaro musica dominicana", cluster: "gastronomia" },
  { keyword: "Kan Drink House Veron", cluster: "gastronomia" },
  { keyword: "Wacamole Bavaro comida mexicana", cluster: "gastronomia" },
  { keyword: "Citrus Restaurant Los Corales", cluster: "gastronomia" },
  { keyword: "Pastrata Mexican Restaurant", cluster: "gastronomia" },
  { keyword: "Nam Nam Bavaro hamburguesas", cluster: "gastronomia" },
  { keyword: "Dolce Italia Punta Cana", cluster: "gastronomia" },
  { keyword: "Bella Napoli Pizza Bavaro", cluster: "gastronomia" },
  { keyword: "Restaurante Herman 301", cluster: "gastronomia" },
  { keyword: "Lorenzillo’s Punta Cana Langosta", cluster: "gastronomia" },
  { keyword: "La Cava Cap Cana vinos", cluster: "gastronomia" },
  { keyword: "Api Beach Cap Cana brunch", cluster: "gastronomia" },
  { keyword: "Coffee Guide Punta Cana", cluster: "gastronomia" },
  { keyword: "Heladerias en Downtown Punta Cana", cluster: "gastronomia" },
  { keyword: "Pastelerias francesas en Bavaro", cluster: "gastronomia" },
  { keyword: "Comida a domicilio en Punta Cana PedidosYa", cluster: "gastronomia" }
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
  resorts: {
    titlePrefix: "Review de resort",
    excerptLead: "Analisis completo del resort para decidir con criterio real de viaje.",
    intro:
      "Cuando buscas un resort especifico, normalmente ya estas cerca de reservar. La clave es validar si ese hotel encaja contigo.",
    planning:
      "No todos los resorts sirven para el mismo perfil. Conviene revisar ubicacion, ambiente, servicios y conexion con excursiones.",
    practicalBlockTitle: "Como evaluar un resort antes de pagar",
    practicalTips: [
      "Define si prefieres ambiente familiar, parejas o solo adultos.",
      "Revisa distancia entre resort y actividades principales.",
      "Confirma politica de cancelacion y cambios de fecha.",
      "Valida costos adicionales de restaurantes o experiencias premium."
    ],
    mistakesTitle: "Errores comunes al comparar resorts",
    mistakes: [
      "Elegir solo por foto sin revisar zona.",
      "No confirmar que incluye la tarifa final.",
      "Ignorar el tiempo real de traslados."
    ],
    close:
      "Un resort bien elegido hace que todo el viaje funcione mejor: descanso, movilidad y excursiones sin fricciones.",
    ctaLabel: "Ver hoteles y resorts",
    ctaHref: "/hoteles",
    ctaSupportHref: "/traslado"
  },
  excursiones: {
    titlePrefix: "Guia de excursion",
    excerptLead: "Informacion util para escoger modalidad, duracion y nivel de experiencia.",
    intro:
      "Las excursiones en Punta Cana tienen formatos distintos. Elegir la correcta depende de tu plan, no solo del nombre del tour.",
    planning:
      "Si defines bien horarios, nivel de actividad y punto de salida, la experiencia mejora y reduces cancelaciones de ultimo minuto.",
    practicalBlockTitle: "Checklist para elegir excursion",
    practicalTips: [
      "Confirma si la actividad es medio dia o dia completo.",
      "Valida inclusiones: transporte, alimentos y equipos.",
      "Revisa restricciones por edad o condicion fisica.",
      "Reserva temprano en fechas de alta demanda."
    ],
    mistakesTitle: "Errores frecuentes en tours",
    mistakes: [
      "No leer condiciones de la modalidad elegida.",
      "Reservar sin revisar distancia desde tu hotel.",
      "Hacer dos actividades intensas el mismo dia."
    ],
    close:
      "Cuando eliges una excursion alineada a tu ritmo, se disfruta mas y el viaje se siente mucho mas equilibrado.",
    ctaLabel: "Reservar excursiones",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  zonas: {
    titlePrefix: "Guia por zona",
    excerptLead: "Mapa real de zonas y servicios para hospedarte y moverte con seguridad.",
    intro:
      "Conocer bien las zonas de Punta Cana te ayuda a elegir hotel, calcular trayectos y evitar tiempos muertos.",
    planning:
      "Antes de decidir alojamiento, conviene entender que ofrece cada area y como afecta tu presupuesto diario.",
    practicalBlockTitle: "Que revisar al elegir una zona",
    practicalTips: [
      "Distancia al aeropuerto y principales playas.",
      "Tipo de ambiente: tranquilo, familiar o social.",
      "Acceso a restaurantes, supermercados y servicios.",
      "Opciones de transporte para moverte sin depender del azar."
    ],
    mistakesTitle: "Errores tipicos por desconocer la zona",
    mistakes: [
      "Elegir hotel sin revisar ubicacion exacta.",
      "Subestimar costos de transporte diario.",
      "No validar horarios de movilidad nocturna."
    ],
    close:
      "Elegir bien la zona te ahorra dinero, reduce estres y mejora todo tu itinerario.",
    ctaLabel: "Ver opciones por zona",
    ctaHref: "/hoteles",
    ctaSupportHref: "/traslado"
  },
  logistica: {
    titlePrefix: "Guia tecnica de viaje",
    excerptLead: "Guia operativa de aeropuerto, rutas y servicios utiles para turistas.",
    intro:
      "Una buena logistica marca la diferencia entre un viaje fluido y uno lleno de retrasos. Aqui va lo esencial para organizarte mejor.",
    planning:
      "Confirmar vuelos, terminal, traslados y tiempos reales evita sorpresas en llegada y salida.",
    practicalBlockTitle: "Base logistica recomendada",
    practicalTips: [
      "Confirma terminal y punto de encuentro al aterrizar.",
      "Define traslado privado o compartido segun presupuesto.",
      "Guarda opciones de transporte de respaldo.",
      "Ten a mano documentos y reservas offline."
    ],
    mistakesTitle: "Errores comunes en logistica de viaje",
    mistakes: [
      "Llegar sin transporte reservado.",
      "No revisar tiempos en rutas largas.",
      "Confiar solo en una opcion de movilidad."
    ],
    close:
      "Con logistica clara, se aprovecha mejor cada dia de viaje y se reduce el desgaste desde el primer traslado.",
    ctaLabel: "Cotizar traslado ahora",
    ctaHref: "/traslado",
    ctaSupportHref: "/tours"
  },
  gastronomia: {
    titlePrefix: "Guia de ocio",
    excerptLead: "Recomendaciones reales para comer y salir en Punta Cana con buena planificacion.",
    intro:
      "La experiencia gastronomica cambia mucho segun la zona y el horario. Elegir bien te ayuda a disfrutar mas y gastar mejor.",
    planning:
      "Combinar restaurantes con un plan de movilidad claro evita esperas largas y cierres de noche complicados.",
    practicalBlockTitle: "Como organizar salidas de comida y nightlife",
    practicalTips: [
      "Reserva en lugares demandados con anticipacion.",
      "Revisa distancia entre hotel y restaurante.",
      "Confirma opciones de transporte para regreso seguro.",
      "Agrupa planes por zona para optimizar tiempos."
    ],
    mistakesTitle: "Errores comunes en planes de ocio",
    mistakes: [
      "No verificar ubicacion exacta del local.",
      "Salir sin plan de retorno nocturno.",
      "Elegir por tendencia sin revisar si encaja contigo."
    ],
    close:
      "Una salida bien planificada se disfruta mas y evita gastos innecesarios durante la noche.",
    ctaLabel: "Ver experiencias",
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
      supportLabel: "Soporte de movilidad",
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
