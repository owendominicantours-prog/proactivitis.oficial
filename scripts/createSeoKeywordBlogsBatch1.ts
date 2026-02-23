import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { slugifyBlog } from "../lib/blog";

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
    excerpt: string;
    intro: string;
    buyerIntent: string;
    ctaLabel: string;
    ctaHref: string;
    ctaSupportHref: string;
  }
> = {
  hoteles: {
    titlePrefix: "Guia actualizada",
    excerpt: "Analisis profesional para elegir alojamiento y reservar con mejor estrategia de precio y ubicacion.",
    intro: "Si estas comparando hoteles en Punta Cana, lo mas importante es filtrar por zona, tipo de viaje y logistica real de traslados y excursiones.",
    buyerIntent:
      "La intencion de esta busqueda es de reserva o comparacion avanzada. Por eso te mostramos criterios claros para decidir con confianza y cerrar la compra sin friccion.",
    ctaLabel: "Ver hoteles y resorts",
    ctaHref: "/hoteles",
    ctaSupportHref: "/traslado"
  },
  playas: {
    titlePrefix: "Guia de destino",
    excerpt: "Ubicacion, acceso, recomendaciones y opciones premium para disfrutar playa sin errores de planificacion.",
    intro: "Las busquedas sobre playas en Punta Cana suelen terminar en una decision de excursion, transfer o seleccion de hotel por zona.",
    buyerIntent:
      "Aqui convertimos la busqueda informativa en una decision de compra inteligente: como llegar, cuando ir y que servicios reservar antes.",
    ctaLabel: "Ver excursiones de playa",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  excursiones: {
    titlePrefix: "Reserva inteligente",
    excerpt: "Todo lo que necesitas para elegir excursion, comparar opciones y reservar con mejor conversion.",
    intro: "Cuando alguien busca una actividad especifica, ya tiene alta intencion de compra. La diferencia esta en elegir bien la modalidad y asegurar disponibilidad.",
    buyerIntent:
      "Este contenido esta optimizado para cierre comercial: precios orientativos, consejos de seleccion y paso final para reservar rapido.",
    ctaLabel: "Reservar excursiones",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  logistica: {
    titlePrefix: "Planificacion de viaje",
    excerpt: "Informacion practica de vuelos, traslados y entrada al pais con enfoque de conversion.",
    intro: "Las dudas de logistica pueden frenar una reserva. Por eso respondemos con un marco claro para que el cliente avance a pago.",
    buyerIntent:
      "La mejor estrategia comercial es resolver fricciones de viaje y despues llevar al cliente a traslados y excursiones listas para su fecha.",
    ctaLabel: "Cotizar traslado",
    ctaHref: "/traslado",
    ctaSupportHref: "/tours"
  },
  gastronomia: {
    titlePrefix: "Experiencias para vender mejor",
    excerpt: "Recomendaciones de gastronomia y nightlife conectadas a reservas de tours y movilidad.",
    intro: "La intencion gastronomica en Punta Cana suele abrir venta cruzada de traslados nocturnos, experiencias premium y paquetes de actividades.",
    buyerIntent:
      "Este enfoque transforma una busqueda de restaurante o bar en itinerario completo con servicios ya reservados.",
    ctaLabel: "Ver experiencias en Punta Cana",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  seguridad: {
    titlePrefix: "Guia de confianza",
    excerpt: "Respuestas claras sobre clima, seguridad y servicios esenciales para tomar decisiones con seguridad.",
    intro: "Las busquedas de seguridad y temporada son decisivas antes de reservar. Si resolvemos estas dudas, sube la conversion.",
    buyerIntent:
      "Este contenido elimina objeciones y conduce al siguiente paso comercial: confirmar transfer, hotel y excursiones.",
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

const buildContentHtml = (keyword: string, cluster: Cluster) => {
  const cfg = CLUSTER_CONFIG[cluster];
  return `
<h1>${keyword}</h1>
<p>${cfg.intro}</p>
<p>${cfg.buyerIntent}</p>

<h2>Lo que debes revisar antes de reservar</h2>
<ul>
  <li>Fecha exacta de viaje y nivel de demanda de la temporada.</li>
  <li>Ubicacion real para optimizar tiempos de traslado.</li>
  <li>Presupuesto total en USD con costos transparentes.</li>
  <li>Flexibilidad para combinar hotel, transfer y excursiones.</li>
</ul>

<h2>Como convertir esta busqueda en una reserva efectiva</h2>
<p>Para ${keyword}, la ruta recomendada es confirmar primero disponibilidad, luego asegurar la logistica (traslados) y cerrar actividades con mejor relacion valor-precio.</p>

<h2>Estrategia Proactivitis</h2>
<p>Trabajamos con enfoque de venta asistida: menos friccion, mejores decisiones y cierre rapido por WhatsApp con soporte en tiempo real.</p>

<p><a href="${cfg.ctaHref}">${cfg.ctaLabel}</a> | <a href="${cfg.ctaSupportHref}">Ver soporte de movilidad</a></p>
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

