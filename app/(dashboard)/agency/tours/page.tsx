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
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
    }),
    session?.user?.id
      ? prisma.agencyProfile.findUnique({
          where: { userId: session.user.id },
          select: { commissionPercent: true, companyName: true }
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
    duration: tour.duration,
    commissionPercent
  }));

  return (
    <section className="space-y-5">
      <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Panel comercial</p>
            <h1 className="mt-3 text-3xl font-semibold">Catalogo de tours para venta de agencia</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              Busca rapido, calcula lo que paga la agencia y abre el checkout correcto para cerrar reservas sin salir de
              tu operacion diaria.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Agencia activa</p>
            <p className="mt-2 text-lg font-semibold">
              {agencyProfile?.companyName ?? session?.user?.name ?? "Tu agencia"}
            </p>
            <p className="mt-1 text-slate-300">Comision directa configurada: {commissionPercent}%</p>
          </div>
        </div>
      </div>

      <TourCatalog tours={simplified} />
    </section>
  );
}
