import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
};

export default async function LegacySeoLandingRedirect({ params, searchParams }: Props) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as { preview?: string })
  ]);
  const suffix = resolvedSearchParams.preview === "1" ? "?preview=1" : "";
  permanentRedirect(`/punta-cana/${slug}${suffix}`);
}
