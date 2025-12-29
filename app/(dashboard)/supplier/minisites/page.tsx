import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/supplierTours";
import Link from "next/link";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { SupplierMinisiteWizard } from "@/components/supplier/SupplierMinisiteWizard";

export const dynamic = "force-dynamic";

export default async function SupplierMinisiteDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 shadow-sm">
        Inicia sesión para administrar tus mini sitios.
      </div>
    );
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: session.user.id },
    include: { User: true, minisite: true }
  });

  if (!supplier) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 shadow-sm">
        No existe un perfil de proveedor asociado a esta cuenta.
      </div>
    );
  }

  const approvedTours = await prisma.tour.count({
    where: {
      supplierId: supplier.id,
      status: "published"
    }
  });

  const baseSlug = slugify(supplier.company ?? supplier.User?.name ?? supplier.id) || supplier.id;

  const initialData = supplier.minisite
    ? {
        slug: supplier.minisite.slug,
        themeId: supplier.minisite.themeId,
        brandName: supplier.minisite.brandName,
        logoUrl: supplier.minisite.logoUrl ?? undefined,
        whatsapp: supplier.minisite.whatsapp ?? undefined,
        phone: supplier.minisite.phone ?? undefined,
        email: supplier.minisite.email ?? undefined,
        bio: supplier.minisite.bio ?? undefined,
        isActive: supplier.minisite.isActive
      }
    : undefined;

  const eligible = supplier.productsEnabled && approvedTours > 0;

  return (
    <main className="space-y-6 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Supplier Minisites</p>
        <h1 className="text-3xl font-semibold text-slate-900">Crea tu landing en https://proactivitis.com/s/</h1>
        <p className="text-sm text-slate-500">
          Cada minisite muestra tus tours aprobados, contacto directo y branding propio. No afecta el SEO global y solo se activa cuando tú lo decides.
        </p>
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
          <Link href="/supplier/profile" className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
            Only approved products
          </Link>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
            Instant WhatsApp bookings
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
            Hosted on Proactivitis
          </span>
        </div>
      </header>

      {!eligible && (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
          <p className="text-lg font-semibold text-rose-700">Mini sitio aún no disponible</p>
          {!supplier.productsEnabled && (
            <p className="mt-2">
              Solo los proveedores con productos habilitados pueden crear minisites. Contacta a operaciones para activar <strong>productsEnabled</strong>.
            </p>
          )}
          {supplier.productsEnabled && approvedTours === 0 && (
            <p className="mt-2">
              Publica al menos un tour aprobado para desbloquear el minisite. Ve a{" "}
              <Link className="font-semibold text-rose-700 underline" href="/supplier/tours">
                Mis tours
              </Link>{" "}
              para enviar uno.
            </p>
          )}
        </section>
      )}

      {eligible && (
        <SupplierMinisiteWizard
          supplierName={supplier.company ?? session.user.name ?? "Proveedor Proactivitis"}
          baseSlug={baseSlug}
          baseUrl={PROACTIVITIS_URL}
          initial={initialData}
          approvedTours={approvedTours}
        />
      )}
    </main>
  );
}
