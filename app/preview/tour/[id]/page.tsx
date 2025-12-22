import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TourDetailShell, type TourWithSupplier } from "@/components/tours/TourDetailShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vista previa · Proactivitis Tours",
  robots: { index: false, follow: false }
};

export default async function PublicTourPreviewPage({ params }: { params: Promise<{ id?: string; slug?: string }> }) {
  const { id, slug } = await params;
  const lookupId = id ?? slug;
  if (!lookupId) {
    notFound();
  }

  const tour = await prisma.tour.findUnique({
    where: { id: lookupId },
    include: {
      SupplierProfile: {
        include: {
          User: true
        }
      }
    }
  });

  if (!tour) {
    notFound();
  }

  const tourWithSupplier: TourWithSupplier = {
    ...tour,
    supplier: {
      id: tour.SupplierProfile?.id ?? "",
      company: tour.SupplierProfile?.company ?? "",
      user: {
        id: tour.SupplierProfile?.User?.id ?? "",
        name: tour.SupplierProfile?.User?.name ?? null,
        email: tour.SupplierProfile?.User?.email ?? ""
      }
    }
  };

  return <TourDetailShell tour={tourWithSupplier} />;
}
