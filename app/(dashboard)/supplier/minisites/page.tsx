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
  const marketingBenefits = [
    "Landing en dominio Proactivitis con diseño premium",
    "Tus tours aprobados aparecen automáticamente",
    "WhatsApp + botón de llamadas directo",
    "Control total desde tu panel de proveedor"
  ];
  const previewSlug = supplier.minisite?.slug ?? initialData?.slug ?? baseSlug;
  const previewUrl = `${PROACTIVITIS_URL}/s/${previewSlug}?preview=1`;

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
        <div className="flex flex-wrap gap-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className={`primary-btn text-xs ${!previewSlug ? "pointer-events-none opacity-40" : ""}`}
          >
            Preview minisite
          </a>
          <span className="text-xs text-slate-500">
            {previewSlug ? "Abre el minisite en modo preview (propietario)" : "Guarda para generar la URL y habilitar la vista previa"}
          </span>
        </div>
      </header>

      {!eligible && (
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Tu minisite necesita un pequeño impulso</p>
          <p className="mt-2 text-sm text-slate-500">
            Activa productos y publica al menos un tour para habilitar la landing premium.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {marketingBenefits.map((benefit) => (
              <div key={benefit} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                {benefit}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`mailto:info@proactivitis.com?subject=Minisite%20Activation%20Request&body=Hello%20Proactivitis%2C%20I%20want%20to%20activate%20my%20minisite.%20My%20supplier%20ID%20is%3A%20${supplier.id}%20and%20my%20company%20name%20is%3A%20${encodeURIComponent(
                supplier.company ?? ""
              )}`}
              className="primary-btn text-xs"
            >
              Request activation
            </a>
            <Link href="/supplier/tours" className="text-xs font-semibold text-slate-800 underline">
              Ver mis tours
            </Link>
          </div>
          <p className="mt-2 text-xs text-slate-500">Activation is available only for partners.</p>
        </section>
      )}

      {eligible && (
        <SupplierMinisiteWizard
          supplierName={supplier.company ?? session.user?.name ?? "Proveedor Proactivitis"}
          baseSlug={baseSlug}
          baseUrl={PROACTIVITIS_URL}
          initial={initialData}
          approvedTours={approvedTours}
        />
      )}
    </main>
  );
}
