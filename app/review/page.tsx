import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import PublicServiceReviewForm from "@/components/public/PublicServiceReviewForm";

type SearchParams = Record<string, string | string[] | undefined>;

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const metadata = {
  title: "Dejar reseña | Proactivitis",
  description: "Comparte tu experiencia de tour o transfer en Proactivitis."
};

export default async function PublicReviewPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearch = (await searchParams) ?? {};
  const initialTypeParam = readParam(resolvedSearch.type);
  const initialType = initialTypeParam === "transfer" ? "transfer" : "tour";
  const initialTourId = readParam(resolvedSearch.tourId) ?? undefined;
  const initialTransferSlug = readParam(resolvedSearch.transferSlug) ?? undefined;

  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    select: { id: true, title: true },
    orderBy: { title: "asc" }
  });

  const staticTransfers = allLandings().map((item) => ({
    slug: item.landingSlug,
    label: `${item.hotelName} (${item.landingSlug})`
  }));

  let dynamicTransfers: { slug: string; label: string }[] = [];
  try {
    const combos = await getDynamicTransferLandingCombos();
    dynamicTransfers = combos.map((item) => ({
      slug: item.landingSlug,
      label: `${item.originName} -> ${item.destinationName}`
    }));
  } catch {
    dynamicTransfers = [];
  }

  const transferMap = new Map<string, string>();
  [...dynamicTransfers, ...staticTransfers].forEach((item) => {
    if (!transferMap.has(item.slug)) {
      transferMap.set(item.slug, item.label);
    }
  });
  const transferOptions = Array.from(transferMap.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reseñas verificadas</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Comparte tu experiencia</h1>
          <p className="mt-2 text-sm text-slate-600">
            Usa este enlace para enviar tu reseña de tour o transfer. Tu comentario se publica después de aprobación.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
          >
            Volver al inicio
          </Link>
        </section>

        <PublicServiceReviewForm
          tours={tours}
          transferOptions={transferOptions}
          initialType={initialType}
          initialTourId={initialTourId}
          initialTransferSlug={initialTransferSlug}
        />
      </div>
    </main>
  );
}
