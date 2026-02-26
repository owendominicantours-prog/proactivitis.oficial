import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MIN_GROUP_SIZE = 4;

const groupKey = (slug: string) => {
  if (slug.startsWith("santo-domingo-")) return "santo-domingo";
  if (slug.startsWith("saona-")) return "saona";
  const parts = slug.split("-").filter(Boolean);
  return parts.slice(0, 2).join("-") || slug;
};

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [] as string[];
  try {
    const parsed = JSON.parse(gallery) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
};

async function getPoolForGroup(group: string) {
  const tokens = group.split("-").filter(Boolean);
  const sources = await prisma.tour.findMany({
    where: {
      OR: [
        ...tokens.map((token) => ({ slug: { contains: token, mode: "insensitive" as const } })),
        ...tokens.map((token) => ({ title: { contains: token, mode: "insensitive" as const } }))
      ]
    },
    select: { heroImage: true, gallery: true },
    take: 300
  });

  return Array.from(
    new Set(
      sources
        .flatMap((tour) => [tour.heroImage, ...parseGallery(tour.gallery)])
        .filter((img): img is string => Boolean(img))
    )
  );
}

async function main() {
  const seoOnly = await prisma.tour.findMany({
    where: { status: "seo_only" },
    select: { id: true, slug: true, heroImage: true },
    orderBy: { slug: "asc" }
  });

  const groups = new Map<string, typeof seoOnly>();
  for (const item of seoOnly) {
    const key = groupKey(item.slug);
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  let updated = 0;
  const summary: Array<{ group: string; count: number; beforeUniqueImages: number; poolSize: number; updated: number }> = [];

  for (const [group, list] of groups.entries()) {
    if (list.length < MIN_GROUP_SIZE) continue;
    const uniqueImages = new Set(list.map((item) => item.heroImage ?? ""));
    if (uniqueImages.size > 1) continue;

    const pool = await getPoolForGroup(group);
    if (!pool.length) continue;

    let groupUpdated = 0;
    for (let i = 0; i < list.length; i += 1) {
      const item = list[i];
      const nextImage = pool[i % pool.length];
      if (!nextImage || item.heroImage === nextImage) continue;
      await prisma.tour.update({
        where: { id: item.id },
        data: { heroImage: nextImage }
      });
      updated += 1;
      groupUpdated += 1;
    }

    summary.push({
      group,
      count: list.length,
      beforeUniqueImages: uniqueImages.size,
      poolSize: pool.length,
      updated: groupUpdated
    });
  }

  console.log(
    JSON.stringify(
      {
        totalSeoOnly: seoOnly.length,
        updated,
        groups: summary
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
