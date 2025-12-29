import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { authOptions } from "@/lib/auth";
import { MinisiteTourGrid } from "@/components/minisite/MinisiteTourGrid";

export const dynamic = "force-dynamic";

type Params = {
  supplierSlug: string;
};

const THEMES: Record<
  number,
  {
    hero: string;
    accent: string;
    button: string;
    card: string;
  }
> = {
  1: {
    hero: "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800",
    accent: "bg-gradient-to-r from-rose-500 to-orange-500 text-white",
    button: "bg-rose-500 hover:bg-rose-600 text-white",
    card: "bg-white/90 border border-white/20 text-slate-900"
  },
  2: {
    hero: "bg-gradient-to-br from-amber-700 via-amber-600 to-amber-500",
    accent: "bg-gradient-to-r from-amber-500 to-emerald-500 text-white",
    button: "bg-amber-500 hover:bg-amber-600 text-slate-900",
    card: "bg-white/90 border border-white/30 text-slate-900"
  },
  3: {
    hero: "bg-gradient-to-br from-cyan-500 via-emerald-500 to-emerald-400",
    accent: "bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-900",
    button: "bg-cyan-500 hover:bg-cyan-600 text-white",
    card: "bg-white/90 border border-white/30 text-slate-900"
  },
  4: {
    hero: "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400",
    accent: "bg-gradient-to-r from-slate-500 to-slate-900 text-white",
    button: "bg-slate-900 hover:bg-slate-800 text-white",
    card: "bg-white border border-slate-200 text-slate-900"
  },
  5: {
    hero: "bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900",
    accent: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
    button: "bg-indigo-500 hover:bg-indigo-600 text-white",
    card: "bg-white/5 border border-white/20 text-white"
  }
} as const;

const FAQ_ITEMS = [
  {
    question: "¿Cuándo confirmo la reserva?",
    answer: "Tus tours se confirman una vez que completes el pago seguro y recibes el voucher en WhatsApp."
  },
  {
    question: "¿Incluyen traslado?",
    answer: "Cada tour detalla si incluye traslado y dónde es el punto de encuentro principal."
  },
  {
    question: "¿Puedo pagar con tarjeta?",
    answer: "Aceptamos Visa, MasterCard y transferencias. El pago se procesa dentro de Proactivitis."
  },
  {
    question: "¿Qué pasa si llueve?",
    answer: "Te contactamos 24/7 para reprogramar o ofrecerte alternativas si el clima cambia."
  },
  {
    question: "¿Puedo aumentar el grupo?",
    answer: "Puedes sumar personas si hay disponibilidad, siempre que nos confirmes con anticipación."
  }
];

const TRUST_BADGES = ["Secure payment", "Free cancellation", "24/7 WhatsApp"];

const WHY_BOOK_LIST = [
  { title: "Private experiences", detail: "Grupos pequeños, atención personalizada y seguridad total." },
  { title: "Local guides", detail: "Guías certificados que conocen cada detalle del destino." },
  { title: "Instant support", detail: "Comunicación directa por WhatsApp, sin esperas." }
];

const MARKETING_BENEFITS = [
  "Landing brandable en dominio Proactivitis",
  "Tours aprobados muestran disponibilidad real",
  "WhatsApp directo y CTA “Book now”",
  "Control completo desde tu panel"
];


type PageProps = {
  params: Promise<Params>;
  searchParams?: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: "Supplier Minisite",
    description: "Landing oficial del proveedor dentro de Proactivitis con tours aprobados.",
    metadataBase: new URL(PROACTIVITIS_URL),
    robots: { index: false, follow: true },
    alternates: { canonical: `${PROACTIVITIS_URL}/tours` }
  };
}

export default async function SupplierMinisitePublicPage({ params, searchParams }: PageProps) {
  const resolved = await params;
  const slugParam = resolved.supplierSlug;
  if (!slugParam) return notFound();

  const resolvedSearch = searchParams ? await searchParams : {};
  const previewMode = resolvedSearch.preview === "1";
  const session = previewMode ? await getServerSession(authOptions) : null;
  const ownerId = session?.user?.id;

  const minisite = await prisma.supplierMinisite.findUnique({
    where: { slug: slugParam },
    include: {
      Supplier: {
        include: {
          User: true
        }
      }
    }
  });

  if (!minisite) return notFound();

  const tours = await prisma.tour.findMany({
    where: {
      supplierId: minisite.supplierId,
      status: "published"
    },
    orderBy: { createdAt: "desc" },
    select: {
      title: true,
      slug: true,
      heroImage: true,
      price: true,
      duration: true
    }
  });

  const theme = THEMES[minisite.themeId] ?? THEMES[1];
  const whatsappLink = minisite.whatsapp ? `https://wa.me/${minisite.whatsapp}` : undefined;
  const isOwner = !!ownerId && minisite.Supplier.userId === ownerId;
  const allowPreview = previewMode && isOwner;
  const eligible = minisite.isActive && minisite.Supplier.productsEnabled && tours.length > 0;
  
  if (!minisite.isActive && !allowPreview) return notFound();
  if (!minisite.Supplier.productsEnabled && !allowPreview) return notFound();
  const showMarketing = !eligible && !allowPreview;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className={`${theme.hero} text-white`}>
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-16">
          <div className="flex items-center gap-4">
            {minisite.logoUrl ? (
              <Image
                src={minisite.logoUrl}
                alt={`${minisite.brandName} logo`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white bg-white/20 text-xs uppercase tracking-[0.3em]">
                {minisite.brandName?.[0] ?? "P"}
              </div>
            )}
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Supplier Minisite</p>
              <h1 className="text-4xl font-semibold">{minisite.brandName}</h1>
            </div>
          </div>
          {minisite.bio && <p className="max-w-3xl text-lg text-white/90 line-clamp-2">{minisite.bio}</p>}
          <div className="flex flex-wrap items-center gap-3">
            {TRUST_BADGES.map((badge) => (
              <span key={badge} className="rounded-full border border-white/30 px-4 py-1 text-xs uppercase tracking-[0.3em]">
                {badge}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                className={`${theme.button} inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg`}
              >
                WhatsApp
              </a>
            ) : (
              <span className={`${theme.button} inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold opacity-60`}>
                WhatsApp
              </span>
            )}
            <a href="#tours" className={`${theme.accent} inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold`}>
              View tours
            </a>
          </div>
          {allowPreview && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
              Preview mode activo
            </div>
          )}
        </div>
      </div>

      {showMarketing && (
        <section className="mx-auto max-w-6xl space-y-4 px-6 py-16">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Supplier Minisite</p>
            <h2 className="text-3xl font-semibold text-slate-900">Tu landing está casi lista</h2>
            <p className="mt-2 text-sm text-slate-500">
              {minisite.Supplier.productsEnabled
                ? "Aún no se ha publicado ningún tour aprobado; publica uno para mostrarlo aquí."
                : "Activa tus productos con operaciones y prepara tus tours para enviarlos a Proactivitis."}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {MARKETING_BENEFITS.map((benefit) => (
                <div key={benefit} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                  {benefit}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={
                  minisite.Supplier.productsEnabled
                    ? "/supplier/tours"
                    : "https://wa.me/+18093949877?text=Quiero+activar+productos+del+minisite"
                }
                className="primary-btn text-xs"
              >
                {minisite.Supplier.productsEnabled ? "Publicar un tour" : "Activate products"}
              </a>
              <Link href="/contact" className="text-xs font-semibold text-slate-800 underline">
                Contacta al equipo Proactivitis
              </Link>
            </div>
          </div>
        </section>
      )}

      <section id="tours" className="mx-auto max-w-6xl space-y-6 px-6 py-16">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Top tours</p>
          <h2 className="text-3xl font-semibold text-slate-900">Experiencias aprobadas</h2>
          <p className="text-sm text-slate-500">Solo tours publicados y aprobados de este proveedor.</p>
        </header>
        {eligible || allowPreview ? (
          <MinisiteTourGrid minisiteSlug={minisite.slug} theme={theme} tours={tours} />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            {allowPreview
              ? "Preview active: aún no tienes tours publicados en vivo."
              : "Los tours aparecerán aquí una vez que estén aprobados y el minisite esté activo."}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-6 py-16">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Why book with us?</p>
          <h2 className="text-3xl font-semibold text-slate-900">Nos enfocamos en lo que importa</h2>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {WHY_BOOK_LIST.map((item) => (
            <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-6 py-16">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">FAQ</p>
          <h2 className="text-3xl font-semibold text-slate-900">Respuestas rápidas</h2>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ_ITEMS.map((faq) => (
            <article key={faq.question} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{faq.question}</p>
              <p className="mt-2 text-sm text-slate-500">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-6 py-16">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Contact</p>
          <h2 className="text-3xl font-semibold text-slate-900">Conecta en segundos</h2>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">WhatsApp</p>
            {whatsappLink ? (
              <a href={whatsappLink} className="text-lg font-semibold text-slate-900">
                {minisite.whatsapp}
              </a>
            ) : (
              <p className="text-lg font-semibold text-slate-900">Sin número</p>
            )}
            <p className="mt-3 text-sm text-slate-500">También puedes escribir para recibir atención instantánea.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <p className="text-sm text-slate-500">Email</p>
            {minisite.email ? (
              <a href={`mailto:${minisite.email}`} className="text-lg font-semibold text-slate-900">
                {minisite.email}
              </a>
            ) : (
              <p className="text-lg font-semibold text-slate-900">Sin correo</p>
            )}
            <p className="text-sm text-slate-500">Teléfono</p>
            {minisite.phone ? (
              <a href={`tel:${minisite.phone}`} className="text-lg font-semibold text-slate-900">
                {minisite.phone}
              </a>
            ) : (
              <p className="text-lg font-semibold text-slate-900">Sin teléfono</p>
            )}
            <a
              href={whatsappLink ?? "#tours"}
              className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold ${theme.button}`}
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-xs uppercase tracking-[0.3em] text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            {minisite.brandName} · {new Date().getFullYear()} · Powered by{" "}
            <Link href={PROACTIVITIS_URL} className="font-semibold text-slate-900">
              Proactivitis
            </Link>
          </p>
          <div className="flex gap-3">
            <Link href="/terms" className="hover:text-slate-800">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-800">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
