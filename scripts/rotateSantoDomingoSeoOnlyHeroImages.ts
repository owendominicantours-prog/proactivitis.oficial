import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_IMAGE = "/fototours/fotosimple.jpg";

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [] as string[];
  try {
    const parsed = JSON.parse(gallery) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
};

async function main() {
  const [baseTours, seoVariants] = await Promise.all([
    prisma.tour.findMany({
      where: {
        status: { in: ["published", "seo_only"] },
        NOT: { slug: { startsWith: "santo-domingo-" } }
      },
      select: { heroImage: true, gallery: true },
      take: 500
    }),
    prisma.tour.findMany({
      where: { status: "seo_only", slug: { startsWith: "santo-domingo-" } },
      select: { id: true, slug: true, heroImage: true },
      orderBy: { slug: "asc" }
    })
  ]);

  const imagePool = Array.from(
    new Set(
      baseTours
        .flatMap((tour) => [tour.heroImage, ...parseGallery(tour.gallery)])
        .filter((img): img is string => Boolean(img))
    )
  );

  if (!imagePool.length) {
    throw new Error("No se encontraron imagenes para rotar portadas.");
  }

  let updated = 0;
  for (let i = 0; i < seoVariants.length; i += 1) {
    const variant = seoVariants[i];
    const nextImage = imagePool[i % imagePool.length] ?? DEFAULT_IMAGE;
    if (variant.heroImage === nextImage) continue;
    await prisma.tour.update({
      where: { id: variant.id },
      data: { heroImage: nextImage }
    });
    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        variants: seoVariants.length,
        poolSize: imagePool.length,
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
