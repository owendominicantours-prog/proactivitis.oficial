import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { slugifyBlog } from "../lib/blog";

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
    excerpt: string;
    intro: string;
    buyerIntent: string;
    ctaLabel: string;
    ctaHref: string;
    ctaSupportHref: string;
  }
> = {
  resorts: {
    titlePrefix: "Review de resort",
    excerpt: "Guia comercial para evaluar resort, ubicacion, ventajas y mejor forma de reserva.",
    intro: "Las busquedas por nombre de resort tienen intencion de reserva alta. El objetivo es resolver dudas clave y mover al usuario a accion.",
    buyerIntent:
      "Este contenido optimiza conversion: compara valor, logistica y experiencia real para cerrar hotel + traslados + actividades.",
    ctaLabel: "Ver hoteles y resorts",
    ctaHref: "/hoteles",
    ctaSupportHref: "/traslado"
  },
  excursiones: {
    titlePrefix: "Guia de excursion",
    excerpt: "Enfoque orientado a venta: precio, modalidad, duracion y recomendacion para reservar mejor.",
    intro: "En excursiones de larga cola, la confianza y la claridad comercial son decisivas para la conversion.",
    buyerIntent:
      "Esta pagina responde la duda concreta y empuja al usuario al siguiente paso: cotizar o reservar con soporte inmediato.",
    ctaLabel: "Reservar excursiones",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  zonas: {
    titlePrefix: "Guia por zona",
    excerpt: "Mapa comercial de zonas, servicios y recomendaciones para alojarte y moverte mejor.",
    intro: "Las busquedas por zonas y calles ayudan a decidir donde quedarse y como planificar traslados sin errores.",
    buyerIntent:
      "La estrategia es convertir informacion de ubicacion en reservas reales de hotel, transporte y tours.",
    ctaLabel: "Ver opciones por zona",
    ctaHref: "/hoteles",
    ctaSupportHref: "/traslado"
  },
  logistica: {
    titlePrefix: "Guia tecnica de viaje",
    excerpt: "Informacion operativa de aeropuerto, transporte, conectividad y servicios para turistas.",
    intro: "La logistica avanzada puede bloquear la compra. Este contenido elimina friccion y acelera decisiones.",
    buyerIntent:
      "Resolviendo dudas tecnicas primero, se incrementa el cierre de reservas en traslados, hoteles y excursiones.",
    ctaLabel: "Cotizar traslado ahora",
    ctaHref: "/traslado",
    ctaSupportHref: "/tours"
  },
  gastronomia: {
    titlePrefix: "Guia de ocio",
    excerpt: "Restaurantes, bares y cafes con enfoque de experiencia y venta cruzada de servicios.",
    intro: "Las busquedas de ocio son una oportunidad comercial para construir itinerarios completos de viaje.",
    buyerIntent:
      "Convertimos una consulta de comida o nightlife en plan completo con movilidad y actividades reservadas.",
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

const buildContentHtml = (keyword: string, cluster: Cluster) => {
  const cfg = CLUSTER_CONFIG[cluster];
  return `
<h1>${keyword}</h1>
<p>${cfg.intro}</p>
<p>${cfg.buyerIntent}</p>

<h2>Puntos clave antes de reservar</h2>
<ul>
  <li>Confirma ubicacion exacta y tiempos de traslado.</li>
  <li>Valida disponibilidad real para tu fecha de viaje.</li>
  <li>Compara valor final en USD y servicios incluidos.</li>
  <li>Define si necesitas soporte por WhatsApp para cerrar rapido.</li>
</ul>

<h2>Recomendacion comercial</h2>
<p>Para ${keyword}, la mejor ruta es asegurar primero disponibilidad y logistica, y luego cerrar servicios complementarios para maximizar experiencia y eficiencia.</p>

<h2>Plan de accion Proactivitis</h2>
<p>Trabajamos con enfoque de conversion y soporte en vivo para ayudarte a decidir y reservar sin complicaciones.</p>

<p><a href="${cfg.ctaHref}">${cfg.ctaLabel}</a> | <a href="${cfg.ctaSupportHref}">Soporte de movilidad</a></p>
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
  const images = tourImages
    .map((item) => (item.heroImage ?? "").trim())
    .filter(Boolean);
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

