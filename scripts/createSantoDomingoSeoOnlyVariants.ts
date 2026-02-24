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

