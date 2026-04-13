import { Suspense, type ReactNode } from "react";
import Script from "next/script";
import { PublicFooter } from "@/components/public/PublicFooter";
import PublicHeaderSwitch from "@/components/public/PublicHeaderSwitch";
import WhatsappFloatingChat from "@/components/shared/WhatsappFloatingChat";
import VisitorSalesChat from "@/components/shared/VisitorSalesChat";
import { getPriceValidUntil, PROACTIVITIS_PHONE } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/site-config";

const OFFER_SERVICE_SCHEMA = {
  "@type": "Offer",
  priceValidUntil: getPriceValidUntil(),
  shippingDetails: {
    "@type": "OfferShippingDetails",
    doesNotShip: true,
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "DO"
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "d"
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "d"
      }
    }
  },
  hasMerchantReturnPolicy: {
    "@type": "MerchantReturnPolicy",
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    applicableCountry: "DO",
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn"
  }
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineBusiness",
      "@id": `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.name,
      url: `${SITE_CONFIG.url}/`,
      logo: `${SITE_CONFIG.url}${SITE_CONFIG.logoSrc}`,
      image: `${SITE_CONFIG.url}/icon.png`,
      description:
        SITE_CONFIG.variant === "funjet"
          ? "Venta directa de tours y traslados en Punta Cana con atencion comercial inmediata."
          : "Plataforma global de gestion turistica: Soluciones de traslados y tours para Clientes, Agencias de Viajes y Suplidores.",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: SITE_CONFIG.variant === "funjet" ? "Servicios Funjet" : "Servicios Proactivitis",
        itemListElement: [
          {
            ...OFFER_SERVICE_SCHEMA,
            itemOffered: {
              "@type": "Service",
              name: "Tours y Excursiones",
              url: `${SITE_CONFIG.url}/tours`
            }
          },
          {
            ...OFFER_SERVICE_SCHEMA,
            itemOffered: {
              "@type": "Service",
              name: "Traslados Privados",
              url: `${SITE_CONFIG.url}/traslado`
            }
          },
          ...(SITE_CONFIG.variant === "funjet"
            ? []
            : [
                {
                  ...OFFER_SERVICE_SCHEMA,
                  itemOffered: {
                    "@type": "Service",
                    name: "Portal para Agencias y Suplidores",
                    url: `${SITE_CONFIG.url}/become-a-supplier`
                  }
                }
              ])
        ]
      }
    }
  ]
};

const TRAVEL_AGENCY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: SITE_CONFIG.name,
  alternateName: SITE_CONFIG.siteName,
  url: SITE_CONFIG.url,
  logo: `${SITE_CONFIG.url}${SITE_CONFIG.logoSrc}`,
  image: `${SITE_CONFIG.url}/icon.png`,
  telephone: SITE_CONFIG.phone || PROACTIVITIS_PHONE,
  email: SITE_CONFIG.email,
  description:
    SITE_CONFIG.variant === "funjet"
      ? "Agencia de venta directa especializada en tours y traslados en Punta Cana."
      : "Plataforma lider en la gestion de experiencias turisticas y traslados privados a nivel global.",
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
      url: `${SITE_CONFIG.url}/traslado`,
      description: "Traslado de lujo y traslados de aeropuerto con estandar internacional."
    },
    ...(SITE_CONFIG.variant === "funjet"
      ? []
      : [
          {
            "@type": "WebPage",
            name: "Programa de Partners",
            url: `${SITE_CONFIG.url}/become-a-supplier`,
            description: "Unase a la red de especialistas locales certificados por Proactivitis."
          }
        ]),
    {
      "@type": "WebPage",
      name: "Destinos Globales",
      url: `${SITE_CONFIG.url}/destinations`,
      description: "Guia de experiencias en los destinos mas importantes del mundo."
    }
  ]
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_CONFIG.url}/#website`,
  url: `${SITE_CONFIG.url}/`,
  name: SITE_CONFIG.siteName,
  inLanguage: ["es", "en", "fr"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_CONFIG.url}/search?q={search_term_string}`,
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
      <div className="flex min-h-screen flex-col bg-transparent text-slate-900">
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
