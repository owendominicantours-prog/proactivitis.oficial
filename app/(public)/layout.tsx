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
  { label: "Traslado", href: "/traslado" },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "Proactivitis",
  "alternateName": "Proactivitis Global",
  "url": "https://proactivitis.com",
  "logo": "https://proactivitis.com/logo.png",
  "telephone": "+1-809-394-9877",
  "email": "info@proactivitis.com",
  "description": "Plataforma líder en la gestión de experiencias turísticas y traslados privados a nivel global.",
  "areaServed": {
    "@type": "Country",
    "name": "Worldwide"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "DO"
  },
  "hasPart": [
    {
      "@type": "WebPage",
      "name": "Traslados Privados",
      "url": "https://proactivitis.com/transfers",
      "description": "Transporte de lujo y traslados de aeropuerto con estándar internacional."
    },
    {
      "@type": "WebPage",
      "name": "Programa de Partners",
      "url": "https://proactivitis.com/become-a-supplier",
      "description": "Únase a la red de especialistas locales certificados por Proactivitis."
    },
    {
      "@type": "WebPage",
      "name": "Destinos Globales",
      "url": "https://proactivitis.com/destinations",
      "description": "Guía de experiencias en los destinos más importantes del mundo."
    }
  ]
}`
        }}
      />
      <Header
        navItems={publicNavLinks}
        rightSlot={
          <div className="flex items-center gap-3">
            <PublicHeaderSearch />
            <PublicCurrencyLanguage />
            <PublicWishlistButton />
            <PublicAuthButtons />
          </div>
        }
      />

      <main className="flex-1">{children}</main>

      <PublicFooter />
    </div>
  );
}
