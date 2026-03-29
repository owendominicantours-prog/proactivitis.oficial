import { getServerSession } from "next-auth";

import { TourCatalog, type AgencyTourSummary } from "@/components/agency/TourCatalog";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AgencyTourCatalogPage() {
  const session = await getServerSession(authOptions);

  const [tours, agencyProfile] = await Promise.all([
    prisma.tour.findMany({
      where: { status: "published" },
      include: {
        SupplierProfile: {
          select: {
            company: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    session?.user?.id
      ? prisma.agencyProfile.findUnique({
          where: { userId: session.user.id },
          select: { commissionPercent: true }
        })
      : Promise.resolve(null)
  ]);

  const commissionPercent = agencyProfile?.commissionPercent ?? 20;

  const simplified: AgencyTourSummary[] = tours.map((tour) => ({
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    price: tour.price,
    location: tour.location,
    supplier: tour.SupplierProfile?.company ?? "Proveedor",
    heroImage: tour.heroImage ?? "/fototours/fototour.jpeg",
    commissionPercent
  }));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Catalogo de tours</h1>
          <p className="text-sm text-slate-500">
            Revisa los tours publicados, calcula tu neto real y abre el flujo de reserva para vender como agencia.
          </p>
        </div>
      </div>
      <TourCatalog tours={simplified} />
    </section>
  );
}
