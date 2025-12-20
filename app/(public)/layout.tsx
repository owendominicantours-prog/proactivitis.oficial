import type { ReactNode } from "react";
import Link from "next/link";
import { PublicAuthButtons } from "@/components/public/PublicAuthButtons";
import { PublicCurrencyLanguage } from "@/components/public/PublicCurrencyLanguage";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeaderSearch } from "@/components/public/PublicHeaderSearch";
import { PublicWishlistButton } from "@/components/public/PublicWishlistButton";
import { Header } from "@/components/shared/Header";

const publicNavLinks = [
  { label: "Inicio", href: "/" },
  { label: "Tours", href: "/tours" },
  { label: "Destinos", href: "/destinations" },
  { label: "Contacto", href: "/contact" }
];

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://www.proactivitis.com/#organization","name":"Proactivitis","url":"https://www.proactivitis.com/","description":"Creado por locales para viajeros globales. Proactivitis nació en el Caribe ayudando visitantes y creció hasta convertirse en una plataforma que conecta viajeros, proveedores y agencias con reservas, notificaciones, pagos y herramientas operativas.","foundingLocation":{"@type":"Place","name":"Caribbean"},"knowsAbout":["Experiencias locales","Tours y actividades","Plataformas de reservas","Tecnología de viajes","Pagos y reservaciones","Gestión de proveedores"],"contactPoint":{"@type":"ContactPoint","contactType":"Atención al Cliente","email":"info@proactivitis.com","availableLanguage":["es","en"]},"logo":{"@type":"ImageObject","url":"https://www.proactivitis.com/logo.png","width":512,"height":512}},{"@type":"WebSite","@id":"https://www.proactivitis.com/#website","url":"https://www.proactivitis.com/","name":"Proactivitis","publisher":{"@id":"https://www.proactivitis.com/#organization"},"inLanguage":["es"]},{"@type":"AboutPage","@id":"https://www.proactivitis.com/about#webpage","url":"https://www.proactivitis.com/about","name":"Acerca de Proactivitis","isPartOf":{"@id":"https://www.proactivitis.com/#website"},"about":{"@id":"https://www.proactivitis.com/#organization"},"inLanguage":["es"],"description":"Proactivitis nació en el Caribe para traer claridad, operaciones locales y pensamiento de producto moderno a experiencias de viaje globales."}]}`
        }}
      />
      <Header
        navItems={publicNavLinks}
        rightSlot={
          <div className="flex items-center gap-3">
            <PublicHeaderSearch />
            <PublicCurrencyLanguage />
            <PublicWishlistButton />
            <Link
              href="/tours"
              className="rounded-full border border-slate-200 bg-slate-900 px-4 py-1 text-[11px] font-black uppercase tracking-[0.3em] text-white transition hover:border-slate-800 hover:bg-slate-800"
            >
              Explorar
            </Link>
            <PublicAuthButtons />
          </div>
        }
      />

      <main className="flex-1 pt-16">{children}</main>

      <PublicFooter />
    </div>
  );
}
