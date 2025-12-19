import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { PublicAuthButtons } from "@/components/public/PublicAuthButtons";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNavMenu } from "@/components/public/PublicNav";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://www.proactivitis.com/#organization","name":"Proactivitis","url":"https://www.proactivitis.com/","description":"Creado por locales para viajeros globales. Proactivitis nació en el Caribe ayudando visitantes y creció hasta convertirse en una plataforma que conecta viajeros, proveedores y agencias con reservas, notificaciones, pagos y herramientas operativas.","foundingLocation":{"@type":"Place","name":"Caribbean"},"knowsAbout":["Experiencias locales","Tours y actividades","Plataformas de reservas","Tecnología de viajes","Pagos y reservaciones","Gestión de proveedores"],"contactPoint":{"@type":"ContactPoint","contactType":"Atención al Cliente","email":"info@proactivitis.com","availableLanguage":["es","en"]},"logo":{"@type":"ImageObject","url":"https://www.proactivitis.com/logo.png","width":512,"height":512}},{"@type":"WebSite","@id":"https://www.proactivitis.com/#website","url":"https://www.proactivitis.com/","name":"Proactivitis","publisher":{"@id":"https://www.proactivitis.com/#organization"},"inLanguage":["es"]},{"@type":"AboutPage","@id":"https://www.proactivitis.com/about#webpage","url":"https://www.proactivitis.com/about","name":"Acerca de Proactivitis","isPartOf":{"@id":"https://www.proactivitis.com/#website"},"about":{"@id":"https://www.proactivitis.com/#organization"},"inLanguage":["es"],"description":"Proactivitis nació en el Caribe para traer claridad, operaciones locales y pensamiento de producto moderno a experiencias de viaje globales."}]}`
        }}
      />
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Proactivitis" width="140" height="32" className="object-contain" />
          </Link>
          <div className="flex flex-1 items-center justify-center md:justify-start">
            <PublicNavMenu />
          </div>
          <div className="flex items-center">
            <PublicAuthButtons />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <PublicFooter />
    </div>
  );
}
