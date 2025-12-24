import { renderTourDetailContent, TourDetailSearchParams } from "../page";
import { prisma } from "@/lib/prisma";
import { TourDetailVariant } from "@/lib/tourVariants";

export async function generateStaticParams() {
  const variants = await prisma.tourVariant.findMany({
    where: {
      Tour: {
        status: "published"
      }
    },
    select: {
      variant: true,
      Tour: {
        select: {
          slug: true
        }
      }
    }
  });
  return variants.map((variantEntry) => ({
    slug: variantEntry.Tour.slug,
    variant: variantEntry.variant as TourDetailVariant
  }));
}

type TourDetailVariantProps = {
  params: {
    slug?: string;
    variant?: TourDetailVariant;
  };
  searchParams?: TourDetailSearchParams;
};

export default async function TourDetailVariantPage({
  params,
  searchParams
}: TourDetailVariantProps) {
  const { slug, variant } = params;
  return renderTourDetailContent({
    slug: slug ?? "",
    variant,
    searchParams
  });
}
