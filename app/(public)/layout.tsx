import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { PublicAuthButtons } from "@/components/public/PublicAuthButtons";
import { PublicCurrencyLanguage } from "@/components/public/PublicCurrencyLanguage";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeaderSearch } from "@/components/public/PublicHeaderSearch";
import { PublicNavMenu } from "@/components/public/PublicNav";
import { PublicWishlistButton } from "@/components/public/PublicWishlistButton";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://www.proactivitis.com/#organization","name":"Proactivitis","url":"https://www.proactivitis.com/","description":"Creado por locales para viajeros globales. Proactivitis nació en el Caribe ayudando visitantes y creció hasta convertirse en una plataforma que conecta viajeros, proveedores y agencias con reservas, notificaciones, pagos y herramientas operativas.","foundingLocation":{"@type":"Place","name":"Caribbean"},"knowsAbout":["Experiencias locales","Tours y actividades","Plataformas de reservas","Tecnología de viajes","Pagos y reservaciones","Gestión de proveedores"],"contactPoint":{"@type":"ContactPoint","contactType":"Atención al Cliente","email":"info@proactivitis.com","availableLanguage":["es","en"]},"logo":{"@type":"ImageObject","url":"https://www.proactivitis.com/logo.png","width":512,"height":512}},{"@type":"WebSite","@id":"https://www.proactivitis.com/#website","url":"https://www.proactivitis.com/","name":"Proactivitis","publisher":{"@id":"https://www.proactivitis.com/#organization"},"inLanguage":["es"]},{"@type":"AboutPage","@id":"https://www.proactivitis.com/about#webpage","url":"https://www.proactivitis.com/about","name":"Acerca de Proactivitis","isPartOf":{"@id":"https://www.proactivitis.com/#website"},"about":{"@id":"https://www.proactivitis.com/#organization"},"inLanguage":["es"],"description":"Proactivitis nació en el Caribe para traer claridad, operaciones locales y pensamiento de producto moderno a experiencias de viaje globales."}]}`
        }}
      />
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Proactivitis" width={140} height={32} className="object-contain" />
          </Link>
          <div className="flex flex-1 items-center justify-center">
            <PublicNavMenu />
          </div>
          <div className="flex items-center gap-3">
            <PublicWishlistButton />
            <Link
              href="/tours"
              className="rounded-full border border-slate-200 bg-slate-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-slate-800 hover:bg-slate-800"
            >
              Explorar ahora
            </Link>
            <PublicAuthButtons />
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 pb-4 md:justify-between">
          <PublicHeaderSearch />
          <div className="hidden items-center gap-3 md:flex">
            <PublicCurrencyLanguage />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <PublicFooter />
    </div>
  );
}
