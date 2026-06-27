import { Suspense, type ReactNode } from "react";
import Script from "next/script";
import { PublicFooter } from "@/components/public/PublicFooter";
import PublicHeaderSwitch from "@/components/public/PublicHeaderSwitch";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import WhatsappFloatingChat from "@/components/shared/WhatsappFloatingChat";
import VisitorSalesChat from "@/components/shared/VisitorSalesChat";
import { getPriceValidUntil, PROACTIVITIS_EMAIL, PROACTIVITIS_LOGO, PROACTIVITIS_PHONE, PROACTIVITIS_URL } from "@/lib/seo";

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
    url: `${PROACTIVITIS_URL}/legal/refund-policy`,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 1,
    applicableCountry: "DO",
    returnFees: "https://schema.org/FreeReturn"
  }
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineBusiness",
      "@id": `${PROACTIVITIS_URL}/#organization`,
      name: "Proactivitis",
      url: `${PROACTIVITIS_URL}/`,
      logo: PROACTIVITIS_LOGO,
      image: `${PROACTIVITIS_URL}/icon.png`,
      description:
        "Plataforma de tours, traslados privados, rent a car y servicios turisticos en Republica Dominicana.",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios Proactivitis",
        itemListElement: [
          {
            ...OFFER_SERVICE_SCHEMA,
            itemOffered: {
              "@type": "Service",
              name: "Tours y Excursiones",
              url: `${PROACTIVITIS_URL}/tours`
            }
          },
          {
            ...OFFER_SERVICE_SCHEMA,
            itemOffered: {
              "@type": "Service",
              name: "Traslados Privados",
              url: `${PROACTIVITIS_URL}/traslado`
            }
          },
          {
            ...OFFER_SERVICE_SCHEMA,
            itemOffered: {
              "@type": "Service",
              name: "Rent a Car",
              url: `${PROACTIVITIS_URL}/rent-a-car`
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
  alternateName: "Proactivitis Travel",
  url: PROACTIVITIS_URL,
  logo: PROACTIVITIS_LOGO,
  image: `${PROACTIVITIS_URL}/icon.png`,
  telephone: PROACTIVITIS_PHONE,
  email: PROACTIVITIS_EMAIL,
  description:
    "Plataforma para reservar experiencias turisticas, traslados privados y servicios de viaje con soporte local.",
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
      url: `${PROACTIVITIS_URL}/traslado`,
      description: "Traslado de lujo y traslados de aeropuerto con estandar internacional."
    },
    {
      "@type": "WebPage",
      name: "Rent a Car",
      url: `${PROACTIVITIS_URL}/rent-a-car`,
      description: "Renta de vehiculos y asistencia para viajes en Republica Dominicana."
    },
    {
      "@type": "WebPage",
      name: "Destinos Globales",
      url: `${PROACTIVITIS_URL}/destinations`,
      description: "Guia de experiencias en los destinos mas importantes del mundo."
    }
  ]
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${PROACTIVITIS_URL}/#website`,
  url: `${PROACTIVITIS_URL}/`,
  name: "Proactivitis",
  inLanguage: ["es", "en", "fr"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${PROACTIVITIS_URL}/search?q={search_term_string}`,
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

          gtag('config', 'G-R3L9DE7KXL', {
            send_page_view: false,
            anonymize_ip: true
          });
          gtag('config', 'AW-17889405007');
        `}
      </Script>
      <div className="flex min-h-screen flex-col bg-transparent text-slate-900">
        <PageViewTracker />
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
