import { type ReactNode } from "react";
import Script from "next/script";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import WhatsappFloatingChat from "@/components/shared/WhatsappFloatingChat";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-R3L9DE7KXL"
        strategy="lazyOnload"
      />
      <Script id="gtag-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-R3L9DE7KXL');
        `}
      </Script>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{"@context":"https://schema.org","@graph":[{"@type":"OnlineBusiness","@id":"https://proactivitis.com/#organization","name":"Proactivitis","url":"https://proactivitis.com/","logo":"https://proactivitis.com/logo.png","description":"Plataforma global de gestión turística: Soluciones de traslados y tours para Clientes, Agencias de Viajes y Suplidores.","hasOfferCatalog":{"@type":"OfferCatalog","name":"Servicios Proactivitis","itemListElement":[{"@type":"Offer","itemOffered":{"@type":"Service","name":"Tours y Excursiones","url":"https://proactivitis.com/tours"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Traslados Privados","url":"https://proactivitis.com/traslado"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Portal para Agencias y Suplidores","url":"https://proactivitis.com/become-a-supplier"}}]}}]}`
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
          "url": "https://proactivitis.com/traslado",
          "description": "Traslado de lujo y traslados de aeropuerto con estándar internacional."
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
      <PublicHeader />

      <main className="flex-1">{children}</main>

      <WhatsappFloatingChat />
      <PublicFooter />
    </div>
    </>
  );
}
