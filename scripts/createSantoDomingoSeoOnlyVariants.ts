import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

type SeoVariant = {
  slugSuffix: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  keywords: string[];
};

const SEO_VARIANTS: SeoVariant[] = [
  {
    slugSuffix: "tour-zona-colonial",
    title: "Tour Zona Colonial de Santo Domingo desde Punta Cana",
    subtitle: "Historia colonial, plazas emblematicas y paradas culturales",
    shortDescription: "Experiencia cultural en Santo Domingo con enfoque en la Zona Colonial, entradas y logistica desde Punta Cana.",
    keywords: ["zona colonial", "alcazar de colon", "catedral primada"]
  },
  {
    slugSuffix: "tres-ojos-y-zona-colonial",
    title: "Los Tres Ojos y Zona Colonial: Excursion Santo Domingo",
    subtitle: "Naturaleza subterranea y patrimonio historico en un solo dia",
    shortDescription: "Combina el Parque Nacional Los Tres Ojos con una ruta guiada por el centro historico de Santo Domingo.",
    keywords: ["los tres ojos", "santo domingo day trip", "cuevas"]
  },
  {
    slugSuffix: "santo-domingo-panoramico",
    title: "Santo Domingo Panoramico con Guia Local",
    subtitle: "Recorrido completo por iconos historicos y zonas modernas",
    shortDescription: "Recorrido panoramico por Santo Domingo con guia profesional y organizacion puerta a puerta.",
    keywords: ["santo domingo panoramico", "city tour", "malecon"]
  },
  {
    slugSuffix: "santo-domingo-premium-cultural",
    title: "Santo Domingo Premium Cultural desde Punta Cana",
    subtitle: "Servicio organizado con enfoque en cultura, historia y confort",
    shortDescription: "Version premium para viajeros que desean vivir Santo Domingo con tiempos bien coordinados y paradas clave.",
    keywords: ["premium santo domingo", "cultural tour", "colonial zone"]
  },
  {
    slugSuffix: "alcazar-colon-catedral",
    title: "Alcazar de Colon y Catedral Primada: Tour Santo Domingo",
    subtitle: "Ruta historica por monumentos esenciales de la ciudad",
    shortDescription: "Visita guiada a los principales monumentos de Santo Domingo con salida desde Punta Cana.",
    keywords: ["alcazar de colon", "catedral primada", "primeras americas"]
  },
  {
    slugSuffix: "santo-domingo-familias",
    title: "Excursion Santo Domingo para Familias",
    subtitle: "Itinerario cultural comodo para adultos y ninos",
    shortDescription: "Ruta familiar a Santo Domingo con tiempos optimizados y asistencia local en cada parada.",
    keywords: ["santo domingo familias", "tour familiar", "excursion cultural"]
  },
  {
    slugSuffix: "santo-domingo-grupos",
    title: "Santo Domingo para Grupos y Viajes Compartidos",
    subtitle: "Ideal para grupos que buscan historia, fotos y cultura local",
    shortDescription: "Salida grupal a Santo Domingo con acompanamiento, logistica eficiente y experiencia historica completa.",
    keywords: ["santo domingo grupos", "excursion para grupos", "day trip"]
  },
  {
    slugSuffix: "city-tour-santo-domingo-desde-punta-cana",
    title: "City Tour Santo Domingo desde Punta Cana",
    subtitle: "Una jornada completa por la capital mas historica del Caribe",
    shortDescription: "City tour con visitas patrimoniales, guia profesional y transporte coordinado desde Punta Cana.",
    keywords: ["city tour santo domingo", "from punta cana", "historical"]
  },
  {
    slugSuffix: "santo-domingo-historia-viva",
    title: "Santo Domingo Historia Viva: Tour de Dia Completo",
    subtitle: "Arquitectura colonial, cultura dominicana y puntos iconicos",
    shortDescription: "Conoce la historia viva de Santo Domingo en una excursion de dia completo con soporte local.",
    keywords: ["historia viva", "patrimonio unesco", "santo domingo"]
  },
  {
    slugSuffix: "tres-ojos-experiencia-cultural",
    title: "Los Tres Ojos + Experiencia Cultural en Santo Domingo",
    subtitle: "Aventura natural y legado historico en una sola excursion",
    shortDescription: "Explora cuevas y lagunas de Los Tres Ojos junto al patrimonio historico de Santo Domingo.",
    keywords: ["tres ojos", "parque nacional", "experiencia cultural"]
  },
  {
    slugSuffix: "santo-domingo-colonial-unesco",
    title: "Zona Colonial UNESCO: Excursion a Santo Domingo",
    subtitle: "Ruta guiada por el primer centro historico de America",
    shortDescription: "Visita a la Zona Colonial declarada Patrimonio de la Humanidad con salida desde Punta Cana.",
    keywords: ["unesco", "zona colonial", "santo domingo"]
  },
  {
    slugSuffix: "santo-domingo-esencial",
    title: "Santo Domingo Esencial desde Punta Cana",
    subtitle: "Todo lo imprescindible de la capital en un dia",
    shortDescription: "Version esencial con los lugares que no pueden faltar en una visita a Santo Domingo.",
    keywords: ["esencial", "capital dominicana", "day excursion"]
  },
  {
    slugSuffix: "malecon-y-centro-historico",
    title: "Malecon y Centro Historico: Tour Santo Domingo",
    subtitle: "Ruta urbana con vistas costeras y patrimonio colonial",
    shortDescription: "Combina el Malecon con el casco historico en una excursion organizada desde Punta Cana.",
    keywords: ["malecon santo domingo", "centro historico", "tour urbano"]
  },
  {
    slugSuffix: "cultura-y-gastronomia-local",
    title: "Santo Domingo Cultura y Gastronomia Local",
    subtitle: "Historia, sabores dominicanos y recorridos guiados",
    shortDescription: "Experiencia cultural con paradas estrategicas y ambiente local en Santo Domingo.",
    keywords: ["gastronomia", "cultura dominicana", "santo domingo"]
  },
  {
    slugSuffix: "tour-para-parejas",
    title: "Santo Domingo para Parejas: Dia Cultural",
    subtitle: "Itinerario romantico entre plazas, monumentos y miradores",
    shortDescription: "Alternativa para parejas que desean un plan cultural completo desde Punta Cana.",
    keywords: ["parejas", "romantico", "zona colonial"]
  },
  {
    slugSuffix: "tour-vip-dia-completo",
    title: "Santo Domingo VIP Dia Completo",
    subtitle: "Servicio premium con enfoque en comodidad y tiempos optimos",
    shortDescription: "Version VIP para viajeros que buscan una excursion mas comoda y bien coordinada.",
    keywords: ["vip", "day trip", "premium city tour"]
  },
  {
    slugSuffix: "primer-viaje-a-santo-domingo",
    title: "Primer Viaje a Santo Domingo desde Punta Cana",
    subtitle: "Ideal para conocer lo esencial de la capital en una jornada",
    shortDescription: "Recorrido recomendado para primera visita con guia local y logistica puerta a puerta.",
    keywords: ["primera vez", "capital", "excursion santo domingo"]
  },
  {
    slugSuffix: "historia-colonial-completa",
    title: "Historia Colonial Completa en Santo Domingo",
    subtitle: "Monumentos clave y narrativa historica profesional",
    shortDescription: "Tour enfocado en legado colonial y puntos iconicos del centro historico.",
    keywords: ["historia colonial", "monumentos", "zona colonial"]
  },
  {
    slugSuffix: "rutas-fotograficas-santo-domingo",
    title: "Rutas Fotograficas en Santo Domingo",
    subtitle: "Paradas visuales en plazas, calles y edificios historicos",
    shortDescription: "Disenado para viajeros que quieren fotos memorables y recorrido cultural.",
    keywords: ["fotografia", "spots", "santo domingo fotos"]
  },
  {
    slugSuffix: "patrimonio-y-arquitectura",
    title: "Patrimonio y Arquitectura de Santo Domingo",
    subtitle: "Explora estilos coloniales y edificios representativos",
    shortDescription: "Recorrido guiado por arquitectura historica y lugares de alto valor patrimonial.",
    keywords: ["arquitectura", "patrimonio", "colonial city"]
  },
  {
    slugSuffix: "santo-domingo-con-entradas",
    title: "Santo Domingo con Entradas Incluidas",
    subtitle: "Tour cultural con acceso a puntos destacados",
    shortDescription: "Incluye accesos y organizacion completa para conocer Santo Domingo sin complicaciones.",
    keywords: ["entradas incluidas", "city tour", "santo domingo"]
  },
  {
    slugSuffix: "excursion-cultural-sin-estres",
    title: "Excursion Cultural sin Estres a Santo Domingo",
    subtitle: "Operacion clara, tiempos definidos y soporte local",
    shortDescription: "Pensada para quienes quieren una salida cultural comoda y bien asistida.",
    keywords: ["sin estres", "logistica", "excursion cultural"]
  },
  {
    slugSuffix: "tour-unesco-con-guia",
    title: "Tour UNESCO en Santo Domingo con Guia",
    subtitle: "Zona Colonial declarada Patrimonio de la Humanidad",
    shortDescription: "Recorrido UNESCO con contexto historico y paradas de alto interes cultural.",
    keywords: ["unesco", "guia", "zona colonial"]
  },
  {
    slugSuffix: "escapada-cultural-desde-punta-cana",
    title: "Escapada Cultural a Santo Domingo desde Punta Cana",
    subtitle: "Una salida de dia completo para cambiar de ritmo",
    shortDescription: "Perfecta para combinar playa con una jornada historica en la capital.",
    keywords: ["escapada", "desde punta cana", "day trip"]
  },
  {
    slugSuffix: "santo-domingo-imperdible",
    title: "Santo Domingo Imperdible: Tour de Dia",
    subtitle: "Los lugares mas buscados en una sola ruta",
    shortDescription: "Version orientada a viajeros que quieren cubrir lo mas importante en poco tiempo.",
    keywords: ["imperdible", "top places", "city highlights"]
  },
  {
    slugSuffix: "ruta-educativa-familiar",
    title: "Ruta Educativa Familiar en Santo Domingo",
    subtitle: "Historia dominicana explicada de forma simple y dinamica",
    shortDescription: "Alternativa familiar para aprender y disfrutar la capital en un mismo dia.",
    keywords: ["educativo", "familias", "historia dominicana"]
  },
  {
    slugSuffix: "santo-domingo-con-paradas-clave",
    title: "Santo Domingo con Paradas Clave",
    subtitle: "Recorrido optimizado por sitios de mayor interes",
    shortDescription: "Itinerario con paradas seleccionadas para maximizar tiempo y experiencia.",
    keywords: ["paradas clave", "itinerario", "santo domingo"]
  },
  {
    slugSuffix: "city-tour-completo-capital-rd",
    title: "City Tour Completo por la Capital de RD",
    subtitle: "Recorrido integral por historia, cultura y vistas urbanas",
    shortDescription: "Experiencia completa de Santo Domingo para visitantes que buscan contexto y contenido.",
    keywords: ["capital rd", "city tour completo", "cultura"]
  },
  {
    slugSuffix: "santo-domingo-cultural-premium",
    title: "Santo Domingo Cultural Premium",
    subtitle: "Una experiencia cuidada para viajeros exigentes",
    shortDescription: "Formato premium con enfoque en calidad de ruta, asistencia y tiempos eficientes.",
    keywords: ["cultural premium", "viajeros exigentes", "santo domingo"]
  },
  {
    slugSuffix: "tour-dia-historia-y-ciudad",
    title: "Tour de Dia: Historia y Ciudad en Santo Domingo",
    subtitle: "Legado colonial y vida urbana actual",
    shortDescription: "Combina historia del Nuevo Mundo con la dinamica moderna de Santo Domingo.",
    keywords: ["historia y ciudad", "dia completo", "santo domingo tour"]
  }
];

const makeSeoDescription = (title: string, subtitle: string, sourceDescription: string, keywords: string[]) => {
  const cleanSource = sourceDescription.replace(/\s+/g, " ").trim();
  const lead =
    `${title}. ${subtitle}. Esta alternativa SEO mantiene la misma operacion, precio y nivel de servicio del producto base, ` +
    `con enfoque en viajeros que buscan ${keywords.join(", ")}.`;
  const body =
    " Incluye coordinacion de transporte, asistencia local y recorrido estructurado por los puntos mas relevantes de Santo Domingo. " +
    "Ideal para quienes desean reservar online con confirmacion clara y una experiencia cultural bien organizada.";
  return `${lead}${body} ${cleanSource}`.slice(0, 3000);
};

async function main() {
  const source = await prisma.tour.findFirst({
    where: {
      status: "published",
      OR: [
        { slug: "excursion-de-un-dia-a-santo-domingo-desde-punta-cana" },
        { title: { contains: "Santo Domingo", mode: "insensitive" } }
      ]
    },
    include: {
      options: true
    },
    orderBy: { createdAt: "asc" }
  });

  if (!source) {
    throw new Error("No se encontro un tour base de Santo Domingo publicado.");
  }

  const sharedHero = source.heroImage;
  const sharedGallery = source.gallery;

  let created = 0;
  let skipped = 0;

  for (const variant of SEO_VARIANTS) {
    const slug = `santo-domingo-${variant.slugSuffix}`;
    const exists = await prisma.tour.findUnique({ where: { slug }, select: { id: true } });
    if (exists) {
      skipped += 1;
      continue;
    }

    const createdTour = await prisma.tour.create({
      data: {
        id: randomUUID(),
        title: variant.title,
        slug,
        productId: randomUUID(),
        price: source.price,
        priceChild: source.priceChild,
        priceYouth: source.priceYouth,
        duration: source.duration,
        description: makeSeoDescription(variant.title, variant.subtitle, source.description, variant.keywords),
        subtitle: variant.subtitle,
        shortDescription: variant.shortDescription,
        category: source.category,
        physicalLevel: source.physicalLevel,
        minAge: source.minAge,
        accessibility: source.accessibility,
        confirmationType: source.confirmationType,
        timeOptions: source.timeOptions,
        operatingDays: source.operatingDays,
        blackoutDates: source.blackoutDates,
        capacity: source.capacity,
        meetingPoint: source.meetingPoint,
        meetingInstructions: source.meetingInstructions,
        pickup: source.pickup,
        requirements: source.requirements,
        cancellationPolicy: source.cancellationPolicy,
        terms: source.terms,
        highlights: source.highlights ?? undefined,
        language: source.language,
        includes: source.includes,
        includesList: source.includesList ?? undefined,
        notIncludedList: source.notIncludedList ?? undefined,
        location: "Santo Domingo",
        supplierId: source.supplierId,
        featured: false,
        status: "seo_only",
        adminNote: `SEO_ONLY_VARIANT based_on:${source.slug}`,
        gallery: sharedGallery,
        heroImage: sharedHero,
        departureDestinationId: source.departureDestinationId ?? undefined,
        platformSharePercent: source.platformSharePercent,
        countryId: source.countryId,
        destinationId: source.destinationId ?? undefined,
        microZoneId: source.microZoneId ?? undefined
      }
    });

    if (source.options.length) {
      await prisma.tourOption.createMany({
        data: source.options.map((option) => ({
          id: randomUUID(),
          tourId: createdTour.id,
          name: option.name,
          type: option.type,
          description: option.description,
          pricePerPerson: option.pricePerPerson,
          basePrice: option.basePrice,
          baseCapacity: option.baseCapacity,
          extraPricePerPerson: option.extraPricePerPerson,
          pickupTimes: option.pickupTimes ?? undefined,
          isDefault: option.isDefault,
          active: option.active,
          sortOrder: option.sortOrder
        }))
      });
    }

    created += 1;
  }

  console.log(
    JSON.stringify(
      {
        sourceSlug: source.slug,
        sourcePrice: source.price,
        created,
        skipped,
        status: "seo_only",
        sampleUrl: created > 0 ? "https://proactivitis.com/tours/santo-domingo-tour-zona-colonial" : null
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
