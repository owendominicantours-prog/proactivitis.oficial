"use client";

import Image from "next/image";

type HonorClientPublic = {
  id: string;
  fullName: string;
  vipTitle: string;
  message: string;
  photoUrl: string | null;
};

type HonorClientsPageProps = {
  clients: HonorClientPublic[];
};

export default function HonorClientsPage({ clients }: HonorClientsPageProps) {
  const fallback = "/fototours/fotosimple.jpg";
  const vipMembers = clients.length;
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cliente de Honor Proactivitis",
    numberOfItems: clients.length,
    itemListElement: clients.map((client, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: client.fullName,
        description: client.vipTitle
      }
    }))
  };

  return (
    <div className="relative isolate overflow-hidden bg-[#070707] text-[#f8e9bb]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,210,94,0.26),transparent_56%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,215,120,0.08),transparent_35%,transparent_65%,rgba(255,215,120,0.08))]" />

      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#c8a85a]/55 bg-black/50 p-8 shadow-[0_0_80px_rgba(255,210,110,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.44em] text-[#d6b36d]">Elite Members</p>
          <h1 className="mt-3 text-4xl font-black uppercase leading-tight text-[#fff4d4] sm:text-5xl">
            Cliente De Honor
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-[#f6e6bf]/88 sm:text-base">
            Reconociendo a los clientes que creyeron en nosotros desde el principio.
          </p>
          <div className="mt-6 inline-flex items-center rounded-full border border-[#d2ad62] bg-[#f0c778]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#ffe8a9]">
            {vipMembers} miembros de honor activos
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {clients.length === 0 ? (
          <div className="rounded-3xl border border-[#ad8644]/40 bg-black/45 p-10 text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-[#d6b36d]">Seccion exclusiva en actualizacion</p>
            <p className="mt-4 text-base text-[#f7e8c1]/90">
              Proximamente publicaremos nuevos clientes de honor.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client, index) => (
              <article
                key={client.id}
                className="vip-card relative overflow-hidden rounded-3xl border border-[#d6b36d]/35 bg-gradient-to-b from-[#1a1307] via-[#0d0d0c] to-[#050505] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,226,156,0.26),transparent_40%)]" />
                <div className="relative">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#d9b975]/75 bg-black">
                      <Image
                        src={client.photoUrl || fallback}
                        alt={client.fullName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.36em] text-[#caa258]">Insignia VIP</p>
                      <h2 className="mt-1 text-xl font-bold text-[#fff2ca]">{client.fullName}</h2>
                    </div>
                  </div>

                  <div className="mt-5 inline-flex items-center rounded-full border border-[#d2ad62] bg-[#f7ca73]/12 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#fce5ac]">
                    {client.vipTitle}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#efe0b7]/92">{client.message}</p>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#ba9754]">
                    Gracias por confiar en Proactivitis
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .vip-card {
          animation: vipFadeIn 0.55s ease both;
        }
        .vip-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          border: 1px solid rgba(247, 210, 131, 0.15);
          box-shadow: inset 0 0 32px rgba(247, 210, 131, 0.05);
          pointer-events: none;
        }
        @keyframes vipFadeIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
            filter: blur(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
}
