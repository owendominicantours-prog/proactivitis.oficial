import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { slugifyBlog } from "../lib/blog";

const prisma = new PrismaClient();

type BlogAngle = {
  key: string;
  titleSuffix: string;
  excerptLead: string;
  h2a: string;
  h2b: string;
  h2c: string;
  ctaLine: string;
};

const BLOG_ANGLES: BlogAngle[] = [
  {
    key: "precio-real",
    titleSuffix: "Precio Real 2026: que incluye y como reservar mejor",
    excerptLead: "Guia de precio real con costos, inclusiones y recomendaciones para reservar sin sorpresas.",
    h2a: "Precio real y como leer una cotizacion correctamente",
    h2b: "Que suele estar incluido y que debes confirmar",
    h2c: "Errores comunes al reservar y como evitarlos",
    ctaLine: "Revisa disponibilidad por fecha y confirma el precio final para tu grupo antes de pagar."
  },
  {
    key: "vale-la-pena",
    titleSuffix: "Vale la pena? Analisis honesto para viajeros",
    excerptLead: "Analisis practico para saber si esta excursion encaja con tu estilo de viaje.",
    h2a: "Para quien si vale la pena esta experiencia",
    h2b: "Para quien quizas no es la mejor opcion",
    h2c: "Como decidir en 5 minutos sin perder dinero",
    ctaLine: "Si tu fecha ya esta definida, reserva con confirmacion inmediata para asegurar cupo."
  },
  {
    key: "familias",
    titleSuffix: "Para familias: edades, ritmo y consejos utiles",
    excerptLead: "Consejos claros para familias: ritmo, logistica y comodidad durante toda la actividad.",
    h2a: "Ritmo de la experiencia para familias y ninos",
    h2b: "Que llevar para evitar estres durante el dia",
    h2c: "Como elegir horario y temporada para mejor experiencia",
    ctaLine: "Pide una recomendacion por edades antes de reservar para elegir la modalidad correcta."
  },
  {
    key: "parejas",
    titleSuffix: "Para parejas: como convertirlo en un dia premium",
    excerptLead: "Ideas para parejas que buscan una experiencia memorable y bien organizada.",
    h2a: "Que hace esta excursion atractiva para parejas",
    h2b: "Opciones para una experiencia mas privada",
    h2c: "Momentos clave para fotos y recuerdos",
    ctaLine: "Reserva con antelacion y solicita recomendaciones para una experiencia mas romantica."
  },
  {
    key: "itinerario",
    titleSuffix: "Itinerario completo paso a paso",
    excerptLead: "Desglose de horarios, paradas y dinamica para que sepas exactamente como sera el dia.",
    h2a: "Como inicia la experiencia desde el pickup",
    h2b: "Bloques del recorrido y tiempos estimados",
    h2c: "Que esperar al cierre del tour",
    ctaLine: "Confirma tu hotel y hora de recogida para recibir un plan ajustado a tu ruta."
  },
  {
    key: "seguridad",
    titleSuffix: "Seguridad y recomendaciones clave antes de salir",
    excerptLead: "Todo lo importante sobre seguridad, requisitos y preparacion previa.",
    h2a: "Medidas de seguridad y acompanamiento",
    h2b: "Requisitos fisicos y recomendaciones medicas",
    h2c: "Checklist rapido para un dia seguro",
    ctaLine: "Si tienes dudas de salud o movilidad, consulta antes de reservar y evita imprevistos."
  },
  {
    key: "que-llevar",
    titleSuffix: "Que llevar: lista practica para disfrutar al maximo",
    excerptLead: "Lista concreta para no olvidar lo esencial y aprovechar toda la excursion.",
    h2a: "Ropa y accesorios recomendados",
    h2b: "Documentos, pagos y extras utiles",
    h2c: "Que no llevar para viajar mas comodo",
    ctaLine: "Con una preparacion simple puedes mejorar mucho la experiencia general del tour."
  },
  {
    key: "mejor-temporada",
    titleSuffix: "Mejor temporada y horarios recomendados",
    excerptLead: "Como elegir el mejor momento del ano para vivir esta experiencia con menos friccion.",
    h2a: "Temporadas altas y bajas: que cambia",
    h2b: "Horarios con mejor dinamica para el recorrido",
    h2c: "Como balancear clima, trafico y demanda",
    ctaLine: "Si viajas en temporada alta, reserva temprano para evitar quedarte sin disponibilidad."
  },
  {
    key: "comparativa",
    titleSuffix: "Comparativa: opciones similares y como elegir bien",
    excerptLead: "Comparativa simple para elegir entre alternativas sin perder tiempo.",
    h2a: "En que se diferencia esta excursion frente a otras",
    h2b: "Que tipo de viajero obtiene mejor resultado",
    h2c: "Criterios de decision: precio, tiempo y experiencia",
    ctaLine: "La mejor opcion es la que encaja con tu presupuesto, energia y tiempo real de viaje."
  },
  {
    key: "faq",
    titleSuffix: "Preguntas frecuentes respondidas de forma clara",
    excerptLead: "Respuestas directas a dudas frecuentes antes de reservar: precio, duracion, pickup y mas.",
    h2a: "Dudas sobre precio, duracion y modalidad",
    h2b: "Dudas sobre recogida y logistica",
    h2c: "Dudas sobre cambios, clima y recomendacion final",
    ctaLine: "Si aun tienes preguntas, escribe por WhatsApp y recibe confirmacion segun tu hotel y fecha."
  }
];

const cleanText = (value: string | null | undefined) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const parseImages = (heroImage?: string | null, gallery?: string | null) => {
  const set = new Set<string>();
  if (heroImage && cleanText(heroImage)) set.add(cleanText(heroImage));
  if (gallery && cleanText(gallery)) {
    const raw = cleanText(gallery);
    try {
      if (raw.startsWith("[") && raw.endsWith("]")) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const url = cleanText(String(item ?? ""));
            if (url.startsWith("http") || url.startsWith("/")) set.add(url);
          }
        }
      } else {
        raw
          .split(",")
          .map((item) => cleanText(item))
          .filter(Boolean)
          .forEach((item) => set.add(item));
      }
    } catch {
      raw
        .split(",")
        .map((item) => cleanText(item))
        .filter(Boolean)
        .forEach((item) => set.add(item));
    }
  }
  const images = Array.from(set).filter((url) => url.startsWith("http") || url.startsWith("/"));
  return images.length ? images : ["/tours/default.jpg"];
};

const numberFormat = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? `$${value.toFixed(0)} USD` : "Precio segun opcion";

const toHtml = ({
  tourTitle,
  tourSlug,
  destinationLabel,
  duration,
  priceText,
  description,
  angle
}: {
  tourTitle: string;
  tourSlug: string;
  destinationLabel: string;
  duration: string;
  priceText: string;
  description: string;
  angle: BlogAngle;
}) => `
<h1>${tourTitle} en ${destinationLabel}: ${angle.titleSuffix}</h1>
<p>${description}</p>
<p><strong>Resumen rapido:</strong> Duracion estimada ${duration}. Precio base referencial ${priceText}. Operacion con confirmacion segun disponibilidad.</p>

<h2>${angle.h2a}</h2>
<p>Las busquedas de viajeros para ${destinationLabel} suelen concentrarse en precio final, calidad real de la experiencia y facilidad para reservar. Para tomar una buena decision, compara el valor total (incluye y no incluye), la duracion efectiva del tour y la logistica de recogida.</p>

<h2>${angle.h2b}</h2>
<p>Antes de confirmar, valida detalles importantes: punto y hora de recogida, politica de cambios, requisitos de edad o condicion fisica, y recomendaciones de vestimenta. Esta verificacion reduce fricciones y mejora la experiencia completa.</p>

<h2>${angle.h2c}</h2>
<p>Una forma simple de decidir es revisar tres variables: tiempo disponible, nivel de energia del grupo y presupuesto por persona. Si las tres encajan, normalmente tendras un resultado superior y sin sorpresas.</p>

<h3>Consejo Proactivitis</h3>
<p>${angle.ctaLine}</p>

<p><a href="/tours">Ver mas excursiones en ${destinationLabel}</a> | <a href="/tours/${tourSlug}">Ver detalles del tour</a></p>
`;

const getArgValue = (name: string) => {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.slice(name.length + 3) : null;
};

async function main() {
  const perTourRaw = Number(getArgValue("perTour") ?? "10");
  const perTour = Number.isFinite(perTourRaw) && perTourRaw > 0 ? Math.min(10, Math.floor(perTourRaw)) : 10;
  const limitRaw = Number(getArgValue("limit") ?? "0");
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : null;
  const dryRun = process.argv.includes("--dry-run");

  const tours = await prisma.tour.findMany({
    where: {
      status: { equals: "PUBLISHED", mode: "insensitive" },
      NOT: [
        { slug: { contains: "transfer", mode: "insensitive" } },
        { title: { contains: "transfer", mode: "insensitive" } },
        { category: { contains: "transfer", mode: "insensitive" } }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      shortDescription: true,
      price: true,
      duration: true,
      location: true,
      heroImage: true,
      gallery: true,
      destination: { select: { name: true } },
      country: { select: { name: true } }
    },
    orderBy: { title: "asc" },
    ...(limit ? { take: limit } : {})
  });

  const now = new Date();
  let created = 0;
  let skipped = 0;

  for (const tour of tours) {
    const destinationLabel = cleanText(tour.destination?.name) || cleanText(tour.location) || cleanText(tour.country?.name) || "Punta Cana";
    const sourceDescription =
      cleanText(tour.shortDescription) ||
      cleanText(tour.description).slice(0, 320) ||
      `Guia profesional para reservar ${tour.title} en ${destinationLabel} con mejor contexto de precio y logistica.`;
    const images = parseImages(tour.heroImage, tour.gallery);

    for (let idx = 0; idx < perTour; idx += 1) {
      const angle = BLOG_ANGLES[idx];
      const title = `${tour.title}: ${angle.titleSuffix}`;
      const slug = slugifyBlog(`${tour.slug}-${angle.key}`) || `${tour.slug}-${angle.key}`;
      const excerpt = `${angle.excerptLead} ${tour.title} en ${destinationLabel}.`;
      const coverImage = images[idx % images.length];
      const contentHtml = toHtml({
        tourTitle: tour.title,
        tourSlug: tour.slug,
        destinationLabel,
        duration: cleanText(tour.duration) || "Duracion variable segun modalidad",
        priceText: numberFormat(tour.price),
        description: sourceDescription,
        angle
      });

      const exists = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
      if (exists) {
        skipped += 1;
        continue;
      }

      if (dryRun) {
        console.log(`[DRY] ${slug}`);
        continue;
      }

      const postId = randomUUID();
      await prisma.blogPost.create({
        data: {
          id: postId,
          title,
          slug,
          excerpt,
          coverImage,
          contentHtml,
          status: "PUBLISHED",
          publishedAt: now,
          tours: {
            create: [{ tourId: tour.id }]
          }
        }
      });
      created += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        toursProcessed: tours.length,
        perTour,
        created,
        skippedExisting: skipped,
        dryRun
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
