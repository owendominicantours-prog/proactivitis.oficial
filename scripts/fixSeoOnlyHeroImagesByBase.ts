import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [] as string[];
  try {
    const parsed = JSON.parse(gallery) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
};

const uniqueImages = (hero?: string | null, gallery?: string | null) =>
  Array.from(new Set([hero, ...parseGallery(gallery)].filter((img): img is string => Boolean(img))));

const resolveBaseSlug = (slug: string) => {
  if (slug.startsWith("santo-domingo-")) return "excursion-de-un-dia-a-santo-domingo-desde-punta-cana";
  if (slug.startsWith("saona-")) return "tour-y-entrada-para-de-isla-saona-desde-punta-cana";

  const lower = slug.toLowerCase();

  if (
    lower.startsWith("higuey-") ||
    lower.includes("higuey") ||
    lower.includes("dominican-culture")
  ) {
    return "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana";
  }

  if (
    lower.includes("buggy") ||
    lower.includes("atv") ||
    lower.includes("macao")
  ) {
    return "tour-en-buggy-en-punta-cana";
  }

  if (
    lower.includes("party-boat") ||
    lower.includes("catamaran") ||
    lower.includes("snorkel") ||
    lower.includes("bavaro")
  ) {
    return "sunset-catamaran-snorkel";
  }

  return null;
};

async function main() {
  const seoOnly = await prisma.tour.findMany({
    where: { status: "seo_only" },
    select: { id: true, slug: true, heroImage: true },
    orderBy: { slug: "asc" }
  });

  const baseSlugSet = Array.from(new Set(seoOnly.map((tour) => resolveBaseSlug(tour.slug)).filter(Boolean))) as string[];

  const baseTours = await prisma.tour.findMany({
    where: { slug: { in: baseSlugSet } },
    select: { slug: true, heroImage: true, gallery: true }
  });

  const baseImagePool = new Map<string, string[]>();
  for (const base of baseTours) {
    const pool = uniqueImages(base.heroImage, base.gallery);
    if (pool.length) baseImagePool.set(base.slug, pool);
  }

  const grouped = new Map<string, typeof seoOnly>();
  for (const tour of seoOnly) {
    const baseSlug = resolveBaseSlug(tour.slug);
    if (!baseSlug) continue;
    const list = grouped.get(baseSlug) ?? [];
    list.push(tour);
    grouped.set(baseSlug, list);
  }

  let updated = 0;
  const summary: Array<{ baseSlug: string; variants: number; pool: number; updated: number }> = [];

  for (const [baseSlug, list] of grouped.entries()) {
    const pool = baseImagePool.get(baseSlug) ?? [];
    if (!pool.length) continue;
    let localUpdated = 0;
    for (let i = 0; i < list.length; i += 1) {
      const item = list[i];
      const nextImage = pool[i % pool.length];
      if (!nextImage || item.heroImage === nextImage) continue;
      await prisma.tour.update({
        where: { id: item.id },
        data: { heroImage: nextImage }
      });
      updated += 1;
      localUpdated += 1;
    }
    summary.push({
      baseSlug,
      variants: list.length,
      pool: pool.length,
      updated: localUpdated
    });
  }

  console.log(
    JSON.stringify(
      {
        seoOnlyTotal: seoOnly.length,
        basePools: Object.fromEntries(Array.from(baseImagePool.entries()).map(([k, v]) => [k, v.length])),
        updated,
        summary
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
