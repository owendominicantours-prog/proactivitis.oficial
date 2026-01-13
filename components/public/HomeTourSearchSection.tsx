import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import { Locale } from "@/lib/translations";
import HomeTourSearch from "@/components/public/HomeTourSearch";

let tourTranslationTableExists: boolean | null = null;

const checkTourTranslationTable = async () => {
  if (tourTranslationTableExists !== null) return tourTranslationTableExists;
  const result = await prisma.$queryRaw<
    { exists: boolean }[]
  >`SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'TourTranslation'
  ) AS "exists"`;
  tourTranslationTableExists = result[0]?.exists ?? false;
  return tourTranslationTableExists;
};

const fetchTourSearchItems = async (locale: Locale) => {
  const hasTranslations = await checkTourTranslationTable();
  const select: Prisma.TourSelect = {
    id: true,
    title: true,
    slug: true,
    heroImage: true,
    location: true
  };

  if (hasTranslations) {
    select.translations = {
      where: { locale },
      select: {
        title: true
      }
    };
  }

  return prisma.tour.findMany({
    where: {
      status: {
        not: "draft"
      },
      slug: { not: HIDDEN_TRANSFER_SLUG }
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select
  });
};

type Props = {
  locale: Locale;
};

export default async function HomeTourSearchSection({ locale }: Props) {
  const tours = await fetchTourSearchItems(locale);
  const searchItems = tours.map((tour) => ({
    id: tour.id,
    slug: tour.slug,
    title: tour.translations?.[0]?.title ?? tour.title,
    image: tour.heroImage,
    location: tour.location
  }));

  return <HomeTourSearch locale={locale} tours={searchItems} />;
}
