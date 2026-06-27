import Link from "next/link";

export type LegalPolicySection = {
  title: string;
  body: string[];
};

type LegalPolicyPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalPolicySection[];
  jsonLdType?: "WebPage" | "PrivacyPolicy";
  canonicalPath: string;
};

const supportEmail = "info@proactivitis.com";

export function LegalPolicyPage({
  eyebrow = "Legal",
  title,
  description,
  updatedAt,
  sections,
  jsonLdType = "WebPage",
  canonicalPath
}: LegalPolicyPageProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": jsonLdType,
    name: title,
    url: `https://proactivitis.com${canonicalPath}`,
    description,
    publisher: {
      "@type": "Organization",
      name: "Proactivitis",
      url: "https://proactivitis.com"
    }
  };

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-sky-700">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
          <p className="mt-3 text-sm font-semibold text-slate-500">Ultima actualizacion: {updatedAt}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-950">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-400">Contacto</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Soporte Proactivitis</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Para reservas, pagos, politicas o solicitudes legales, usa los canales oficiales.
            </p>
            <div className="mt-4 space-y-2">
              <Link
                href="/contact"
                className="flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Contactar soporte
              </Link>
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                {supportEmail}
              </a>
            </div>
          </aside>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
