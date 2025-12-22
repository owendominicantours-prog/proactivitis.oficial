import { prisma } from "@/lib/prisma";
import { SupplierTourCreateForm, type SavedDraft } from "@/components/supplier/SupplierTourCreateForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Necesitamos datos frescos para el selector de países/destinos
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SupplierTourCreatePageProps = {
  searchParams?: Promise<{
    draftId?: string;
  }>;
};

export default async function SupplierTourCreatePage({ searchParams }: SupplierTourCreatePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const draftId = resolvedSearchParams?.draftId;
  const countries = await prisma.country.findMany({
    select: { id: true, name: true, slug: true }
  });

  const destinations = await prisma.destination.findMany({
    select: { id: true, name: true, slug: true, countryId: true }
  });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Accede para crear tours.</div>;
  }

  const supplier = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplier) {
    return (
      <div className="py-10 text-center text-sm text-slate-600">
        No hay un perfil de supplier asociado a esta cuenta.
      </div>
    );
  }

  const readDraft = (record: { id: string; draftKey: string; data: unknown } | null): SavedDraft | undefined => {
    if (!record) return undefined;
    const parsed = typeof record.data === "object" && record.data !== null ? (record.data as SavedDraft) : {};
    return { id: record.id, draftKey: record.draftKey, ...parsed };
  };

  let initialDraft: SavedDraft | undefined;
  if (draftId) {
    const draftRecord = await prisma.tourDraft.findUnique({ where: { id: draftId } });
    if (draftRecord && draftRecord.supplierId === supplier.id) {
      initialDraft = readDraft(draftRecord);
    }
  }
  if (!initialDraft) {
    const fallback = await prisma.tourDraft.findFirst({
      where: { supplierId: supplier.id },
      orderBy: { updatedAt: "desc" }
    });
    if (fallback) {
      initialDraft = readDraft(fallback);
    }
  }

  return (
    <div className="px-4 py-6 md:px-6">
      <SupplierTourCreateForm
        countries={countries}
        destinations={destinations}
        initialDraft={initialDraft}
      />
    </div>
  );
}
