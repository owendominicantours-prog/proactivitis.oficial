import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { TourCard } from "@/components/public/TourCard";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import { Locale, translate } from "@/lib/translations";
import { getTourReviewSummaryForTours } from "@/lib/tourReviews";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

const fetchFeaturedTours = async (
  locale: Locale,
  filters?: { countries?: string[]; destinations?: string[] }
) => {
  const hasTranslations = await checkTourTranslationTable();
  const select: Prisma.TourSelect = {
    id: true,
    title: true,
    slug: true,
    price: true,
    shortDescription: true,
    heroImage: true,
    location: true,
    duration: true,
    capacity: true
  };

  if (hasTranslations) {
    select.translations = {
      where: { locale },
      select: {
        locale: true,
        title: true,
        shortDescription: true,
        description: true
      }
    };
  }

  const where: Prisma.TourWhereInput = {
    status: {
      not: "draft"
    },
    slug: { not: HIDDEN_TRANSFER_SLUG }
  };

  if (filters?.countries?.length || filters?.destinations?.length) {
    where.departureDestination = {
      is: {
        ...(filters.countries?.length ? { country: { slug: { in: filters.countries } } } : {}),
        ...(filters.destinations?.length ? { slug: { in: filters.destinations } } : {})
      }
    };
  }

  return prisma.tour.findMany({
    where,
    orderBy: [
      { featured: "desc" },
      { createdAt: "desc" }
    ],
    take: 6,
    select
  });
};

const formatDurationValue = (value?: string | null) => {
  if (!value) return "4 horas";
  try {
    const parsed = JSON.parse(value);
    if (parsed?.value && parsed?.unit) {
      return `${parsed.value} ${parsed.unit}`;
    }
  } catch {
    // ignore
  }
  return value;
};

const selectRotatingTours = (tours: Awaited<ReturnType<typeof fetchFeaturedTours>>) => {
  if (!tours.length) return [];
  const copy = [...tours];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(3, copy.length));
};

type Props = {
  locale: Locale;
};

export default async function FeaturedToursSection({ locale }: Props) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | null)?.id ?? null;
  const preference = userId
    ? await prisma.customerPreference.findUnique({
        where: { userId },
        select: { preferredCountries: true, preferredDestinations: true, completedAt: true, discountEligible: true, discountRedeemedAt: true }
      })
    : null;
  const preferredCountries = (preference?.preferredCountries as string[] | undefined) ?? [];
  const preferredDestinations = (preference?.preferredDestinations as string[] | undefined) ?? [];
  const discountPercent =
    preference?.completedAt && preference?.discountEligible && !preference?.discountRedeemedAt ? 10 : 0;

  const tours = await fetchFeaturedTours(locale, {
    countries: preferredCountries,
    destinations: preferredDestinations
  });
  const displayedTours = selectRotatingTours(tours);
  const reviewSummary = await getTourReviewSummaryForTours(tours.map((tour) => tour.id));

  if (!tours.length) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-[0_35px_80px_rgba(15,23,42,0.12)]">
        <p className="text-lg font-semibold text-slate-900">{translate(locale, "featured.tours.empty.title")}</p>
        <p>{translate(locale, "featured.tours.empty.body")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {displayedTours.map((tour) => (
        <TourCard
          key={tour.id}
          slug={tour.slug}
          title={
            tour.translations?.[0]?.title ??
            tour.title
          }
          location={tour.location ?? "Destino Premium"}
          zone={tour.location ? tour.location.split(",")[0] : "Punta Cana"}
          price={tour.price}
          image={tour.heroImage ?? "/fototours/fototour.jpeg"}
          description={
            tour.translations?.[0]?.shortDescription ??
            tour.translations?.[0]?.description ??
            tour.shortDescription ??
            undefined
          }
          tags={[translate(locale, "tour.card.tag.topExperience")]}
          rating={reviewSummary[tour.id]?.average ?? 0}
          reviewCount={reviewSummary[tour.id]?.count ?? 0}
          discountPercent={discountPercent}
          maxPax={tour.capacity ?? 15}
          duration={formatDurationValue(tour.duration)}
          pickupIncluded={true}
        />
      ))}
    </div>
  );
}
