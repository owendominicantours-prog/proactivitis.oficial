import { Suspense, type ReactNode } from "react";
import Script from "next/script";
import { PublicFooter } from "@/components/public/PublicFooter";
import PublicHeaderSwitch from "@/components/public/PublicHeaderSwitch";
import WhatsappFloatingChat from "@/components/shared/WhatsappFloatingChat";
import VisitorSalesChat from "@/components/shared/VisitorSalesChat";
import { getPriceValidUntil } from "@/lib/seo";

const OFFER_SERVICE_SCHEMA = {
  "@type": "Offer",
  priceValidUntil: getPriceValidUntil(),
  shippingDetails: {
    "@type": "OfferShippingDetails",
    doesNotShip: true,
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "DO"
    }
  },
  hasMerchantReturnPolicy: {
    "@type": "MerchantReturnPolicy",
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    applicableCountry: "DO"
  }
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineBusiness",
      "@id": "https://proactivitis.com/#organization",
      name: "Proactivitis",
      url: "https://proactivitis.com/",
      logo: "https://proactivitis.com/logo.png",
      image: "https://proactivitis.com/icon.png",
      description:
        "Plataforma global de gestion turistica: Soluciones de traslados y tours para Clientes, Agencias de Viajes y Suplidores.",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios Proactivitis",
        itemListElement: [
          {
            ...OFFER_SERVICE_SCHEMA,
            itemOffered: {
              "@type": "Service",
              name: "Tours y Excursiones",
              url: "https://proactivitis.com/tours"
            }
          },
          {
            ...OFFER_SERVICE_SCHEMA,
            itemOffered: {
              "@type": "Service",
              name: "Traslados Privados",
              url: "https://proactivitis.com/traslado"
            }
          },
          {
            ...OFFER_SERVICE_SCHEMA,
            itemOffered: {
              "@type": "Service",
              name: "Portal para Agencias y Suplidores",
              url: "https://proactivitis.com/become-a-supplier"
            }
          }
        ]
      }
    }
  ]
};

const TRAVEL_AGENCY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Proactivitis",
  alternateName: "Proactivitis Global",
  url: "https://proactivitis.com",
  logo: "https://proactivitis.com/logo.png",
  image: "https://proactivitis.com/icon.png",
  telephone: "+1-809-394-9877",
  email: "info@proactivitis.com",
  description:
    "Plataforma lider en la gestion de experiencias turisticas y traslados privados a nivel global.",
  areaServed: {
    "@type": "Country",
    name: "Worldwide"
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "DO"
  },
  hasPart: [
    {
      "@type": "WebPage",
      name: "Traslados Privados",
      url: "https://proactivitis.com/traslado",
      description: "Traslado de lujo y traslados de aeropuerto con estandar internacional."
    },
    {
      "@type": "WebPage",
      name: "Programa de Partners",
      url: "https://proactivitis.com/become-a-supplier",
      description: "Unase a la red de especialistas locales certificados por Proactivitis."
    },
    {
      "@type": "WebPage",
      name: "Destinos Globales",
      url: "https://proactivitis.com/destinations",
      description: "Guia de experiencias en los destinos mas importantes del mundo."
    }
  ]
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://proactivitis.com/#website",
  url: "https://proactivitis.com/",
  name: "Proactivitis",
  inLanguage: ["es", "en", "fr"],
  potentialAction: {
    "@type": "SearchAction",
    target: "https://proactivitis.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-R3L9DE7KXL" strategy="lazyOnload" />
      <Script id="gtag-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-R3L9DE7KXL');
          gtag('config', 'AW-17889405007');
        `}
      </Script>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_SCHEMA)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(TRAVEL_AGENCY_SCHEMA)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(WEBSITE_SCHEMA)
          }}
        />
        <PublicHeaderSwitch />

        <main className="flex-1">{children}</main>

        <Suspense fallback={null}>
          <VisitorSalesChat />
          <WhatsappFloatingChat />
        </Suspense>
        <PublicFooter />
      </div>
    </>
  );
}
