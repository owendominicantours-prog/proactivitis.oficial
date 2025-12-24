import { renderTourDetailContent, TourDetailVariant, TourDetailSearchParams } from "../page";

const variantTargets: { slug: string; variants: TourDetailVariant[] }[] = [
  { slug: "sunset-catamaran-snorkel", variants: ["party", "family", "cruise"] }
];

export async function generateStaticParams() {
  return variantTargets.flatMap(({ slug, variants }) =>
    variants.map((variant) => ({ slug, variant }))
  );
}

type TourDetailVariantProps = {
  params: {
    slug?: string;
    variant?: TourDetailVariant;
  };
  searchParams?: Promise<TourDetailSearchParams>;
};

export default async function TourDetailVariantPage({
  params,
  searchParams
}: TourDetailVariantProps) {
  return renderTourDetailContent({
    slug: params.slug ?? "",
    variant: params.variant,
    searchParams
  });
}
