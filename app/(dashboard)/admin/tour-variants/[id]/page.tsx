import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import TourVariantForm from "@/components/admin/TourVariantForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditTourVariantPage({ params }: Props) {
  const { id } = await params;
  let variant = null;
  try {
    variant = await prisma.tourVariant.findUnique({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2021" || error.code === "P2022")
    ) {
      return notFound();
    }
    throw error;
  }
  if (!variant) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Variantes</p>
        <h1 className="text-2xl font-semibold text-slate-900">Editar variante</h1>
        <p className="text-sm text-slate-500">{variant.slug}</p>
      </div>
      <TourVariantForm variant={variant} />
    </div>
  );
}
