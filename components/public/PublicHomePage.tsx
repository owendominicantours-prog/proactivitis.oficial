import Image from "next/image";
import Link from "next/link";
import FeaturedToursSection from "@/components/public/FeaturedToursSection";
import { HomeAboutContent } from "@/components/public/HomeAboutContent";
import { HomeHeroContent } from "@/components/public/HomeHeroContent";
import { HomeHeroCarousel } from "@/components/public/HomeHeroCarousel";
import { HomeRecommendedHeader } from "@/components/public/HomeRecommendedHeader";
import HomeTourSearchSection from "@/components/public/HomeTourSearchSection";
import HomeTransferTicker from "@/components/public/HomeTransferTicker";
import { Locale, translate } from "@/lib/translations";
import { getHomeContentOverrides } from "@/lib/siteContent";
import { getPriceValidUntil, PROACTIVITIS_URL } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import { localizedCountryName, localizedDestinationName } from "@/lib/localizedPlaces";
import {
  BedDouble,
  Building2,
  CalendarCheck,
  Car,
  Compass,
  CreditCard,
  Globe2,
  MapPinned,
  MessageCircle,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Tags
} from "lucide-react";

type PublicHomePageProps = {
  locale: Locale;
};

export default async function PublicHomePage({ locale }: PublicHomePageProps) {
  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);
  const transferHref = locale === "es" ? "/traslado" : `/${locale}/traslado`;
  const homeOverrides = await getHomeContentOverrides(locale);
  const transferBannerImage =
    homeOverrides.transferBanner?.backgroundImage ??
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/transfer/banner%20%20%20%20transfer.jpeg";
  const priceValidUntil = getPriceValidUntil();
  const localePrefix = locale === "es" ? "" : `/${locale}`;
  const localePath = (path: string) => `${localePrefix}${path}`;
  const toursQueryHref = (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return `${localePath("/tours")}${query ? `?${query}` : ""}`;
  };
  const localizedPath = (path: string) => `${PROACTIVITIS_URL}${locale === "es" ? path : `/${locale}${path}`}`;
  const rentCarHref = localePath("/rent-a-car");
  const hotelsHref = locale === "es" ? "/hoteles" : `/${locale}/hotels`;
  const proDiscoveryHref = localePath("/prodiscovery");
  const tripStartCards = [
    {
      icon: Compass,
      href: localePath("/tours"),
      label:
        locale === "es"
          ? "Tours y experiencias"
          : locale === "fr"
            ? "Tours et experiences"
            : "Tours and experiences",
      title:
        locale === "es"
          ? "Encuentra actividades reales"
          : locale === "fr"
            ? "Trouvez des activites reelles"
            : "Find real activities",
      body:
        locale === "es"
          ? "Actividades, entradas, aventura, cultura y planes privados en los destinos activos."
          : locale === "fr"
            ? "Activites, billets, aventure, culture et plans prives dans les destinations actives."
            : "Activities, tickets, adventure, culture, and private plans in active destinations."
    },
    {
      icon: Car,
      href: transferHref,
      label:
        locale === "es"
          ? "Traslado privado"
          : locale === "fr"
            ? "Transfert prive"
            : "Private transfer",
      title:
        locale === "es"
          ? "Llega sin negociar en el aeropuerto"
          : locale === "fr"
            ? "Arrivez sans negocier a l aeroport"
            : "Arrive without airport negotiation",
      body:
        locale === "es"
          ? "Busca hotel, aeropuerto o zona y ve el precio antes de reservar."
          : locale === "fr"
            ? "Cherchez hotel, aeroport ou zone et voyez le prix avant de reserver."
            : "Search hotel, airport, or area and see the price before booking."
    },
    {
      icon: MapPinned,
      href: localePath("/destinos"),
      label:
        locale === "es"
          ? "Destinos disponibles"
          : locale === "fr"
            ? "Destinations disponibles"
            : "Available destinations",
      title:
        locale === "es"
          ? "Planifica por destino"
          : locale === "fr"
            ? "Planifiez par destination"
            : "Plan by destination",
      body:
        locale === "es"
          ? "Explora ciudades, playas, islas y zonas con servicios disponibles."
          : locale === "fr"
            ? "Explorez villes, plages, iles et zones avec services disponibles."
            : "Explore cities, beaches, islands, and areas with available services."
    }
  ];
  const serviceCards = [
    {
      icon: Compass,
      href: localePath("/tours"),
      label: locale === "es" ? "Tours" : locale === "fr" ? "Tours" : "Tours",
      title:
        locale === "es"
          ? "Experiencias y actividades"
          : locale === "fr"
            ? "Experiences et activites"
            : "Experiences and activities",
      body:
        locale === "es"
          ? "Tours, excursiones, entradas, aventura, cultura y planes privados."
          : locale === "fr"
            ? "Tours, excursions, billets, aventure, culture et plans prives."
            : "Tours, day trips, tickets, adventure, culture, and private plans."
    },
    {
      icon: Plane,
      href: transferHref,
      label: locale === "es" ? "Traslados" : locale === "fr" ? "Transferts" : "Transfers",
      title:
        locale === "es"
          ? "Llegada y rutas privadas"
          : locale === "fr"
            ? "Arrivee et routes privees"
            : "Arrival and private routes",
      body:
        locale === "es"
          ? "Aeropuerto, hotel, ida y vuelta, grupos y rutas entre zonas."
          : locale === "fr"
            ? "Aeroport, hotel, aller-retour, groupes et routes entre zones."
            : "Airport, hotel, round trip, groups, and routes between areas."
    },
    {
      icon: Car,
      href: rentCarHref,
      label: "Rent a car",
      title:
        locale === "es"
          ? "Vehiculos para moverte"
          : locale === "fr"
            ? "Vehicules pour bouger"
            : "Vehicles to move around",
      body:
        locale === "es"
          ? "Opciones por zona, categoria y tipo de viaje con soporte antes de la entrega."
          : locale === "fr"
            ? "Options par zone, categorie et type de voyage avec support avant livraison."
            : "Options by area, category, and trip style with support before handoff."
    },
    {
      icon: BedDouble,
      href: hotelsHref,
      label: locale === "es" ? "Alojamiento" : locale === "fr" ? "Hebergement" : "Accommodation",
      title:
        locale === "es"
          ? "Hoteles y zonas para quedarte"
          : locale === "fr"
            ? "Hotels et zones ou sejourner"
            : "Hotels and areas to stay",
      body:
        locale === "es"
          ? "Guias de hoteles, cosas que hacer cerca y conexiones con tours y traslados."
          : locale === "fr"
            ? "Guides d hotels, choses a faire autour et connexions avec tours et transferts."
          : "Hotel guides, nearby things to do, and connections to tours and transfers."
    },
    {
      icon: Sparkles,
      href: proDiscoveryHref,
      label: "ProDiscovery",
      title:
        locale === "es"
          ? "Comparar lo mejor por zona"
          : locale === "fr"
            ? "Comparer le meilleur par zone"
            : "Compare the best by area",
      body:
        locale === "es"
          ? "Guias y rankings para descubrir opciones fuertes sin depender de un solo destino."
          : locale === "fr"
            ? "Guides et classements pour decouvrir des options fortes sans un seul lieu."
            : "Guides and rankings to discover strong options beyond one destination."
    },
    {
      icon: Building2,
      href: "/become-a-supplier",
      label: locale === "es" ? "Partners" : locale === "fr" ? "Partenaires" : "Partners",
      title:
        locale === "es"
          ? "Agencias y suplidores"
          : locale === "fr"
            ? "Agences et fournisseurs"
            : "Agencies and suppliers",
      body:
        locale === "es"
          ? "Un ecosistema para vender, operar y conectar servicios de viaje."
          : locale === "fr"
            ? "Un ecosysteme pour vendre, operer et connecter des services de voyage."
            : "An ecosystem to sell, operate, and connect travel services."
    }
  ];
  const trustNotes = [
    {
      icon: ShieldCheck,
      text:
        locale === "es"
          ? "Proveedores verificados"
          : locale === "fr"
            ? "Prestataires verifies"
            : "Verified providers"
    },
    {
      icon: MessageCircle,
      text:
        locale === "es"
          ? "Soporte humano por WhatsApp"
          : locale === "fr"
            ? "Support humain par WhatsApp"
            : "Human WhatsApp support"
    },
    {
      icon: CreditCard,
      text:
        locale === "es"
          ? "Pago protegido"
          : locale === "fr"
            ? "Paiement protege"
            : "Protected payment"
    }
  ];
  const steps = [
    {
      icon: Search,
      title:
        locale === "es"
          ? "Busca lo que quieres vivir"
          : locale === "fr"
            ? "Cherchez ce que vous voulez vivre"
            : "Search what you want to experience",
      body:
        locale === "es"
          ? "Tours, traslados o zonas populares con precios y detalles claros."
          : locale === "fr"
            ? "Tours, transferts ou zones populaires avec prix et details clairs."
            : "Tours, transfers, or popular areas with clear prices and details."
    },
    {
      icon: CalendarCheck,
      title:
        locale === "es"
          ? "Reserva sin fricción"
          : locale === "fr"
            ? "Reservez sans friction"
            : "Book without friction",
      body:
        locale === "es"
          ? "Elige fecha, pasajeros y preferencias desde una experiencia simple."
          : locale === "fr"
            ? "Choisissez date, passagers et preferences dans une experience simple."
            : "Choose date, passengers, and preferences in a simple flow."
    },
    {
      icon: Sparkles,
      title:
        locale === "es"
          ? "Viaja con apoyo local"
          : locale === "fr"
            ? "Voyagez avec support local"
            : "Travel with local support",
      body:
        locale === "es"
          ? "Confirmación, asistencia y coordinación humana cuando la necesitas."
          : locale === "fr"
            ? "Confirmation, assistance et coordination humaine quand vous en avez besoin."
            : "Confirmation, assistance, and human coordination when you need it."
    }
  ];

  const [publishedTours, tourRatingAgg, transferRatingAgg] = await Promise.all([
    prisma.tour.findMany({
      where: {
        status: { in: ["published", "seo_only"] },
        slug: { not: HIDDEN_TRANSFER_SLUG }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        price: true,
        shortDescription: true,
        category: true,
        location: true,
        country: { select: { name: true, slug: true } },
        destination: {
          select: {
            name: true,
            slug: true,
            country: { select: { name: true, slug: true } }
          }
        },
        departureDestination: {
          select: {
            name: true,
            slug: true,
            country: { select: { name: true, slug: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.tourReview.groupBy({
      by: ["tourId"],
      where: { status: "APPROVED" },
      _avg: { rating: true },
      _count: { rating: true }
    }),
    prisma.transferReview.groupBy({
      by: ["transferLandingSlug"],
      where: { status: "APPROVED", transferLandingSlug: { not: null } },
      _avg: { rating: true },
      _count: { rating: true }
    })
  ]);
  const transferLandings = allLandings();
  const uniquePublishedTours = Array.from(
    new Map(publishedTours.map((tour) => [tour.slug, tour])).values()
  );
  const uniqueTransferLandings = Array.from(
    new Map(transferLandings.map((landing) => [landing.landingSlug, landing])).values()
  );
  const tourRatingMap = new Map(
    tourRatingAgg.map((row) => [
      row.tourId,
      {
        rating: Number(row._avg.rating ?? 0),
        count: row._count.rating
      }
    ])
  );
  const transferRatingMap = new Map(
    transferRatingAgg
      .filter((row) => row.transferLandingSlug)
      .map((row) => [
        row.transferLandingSlug as string,
        {
          rating: Number(row._avg.rating ?? 0),
          count: row._count.rating
        }
      ])
  );
  const visibleHomeTours = uniquePublishedTours.filter((tour) => tour.status === "published");
  const destinationMap = new Map<
    string,
    {
      name: string;
      countryName?: string;
      href: string;
      count: number;
      category?: string | null;
      location?: string | null;
    }
  >();

  for (const tour of visibleHomeTours) {
    const destination = tour.departureDestination ?? tour.destination;
    const country = destination?.country ?? tour.country;
    const countrySlug = country?.slug;
    const countryName = country ? localizedCountryName(country, locale) : undefined;
    const destinationName = destination ? localizedDestinationName(destination, locale) : null;
    const fallbackName = tour.location?.split(",")[0]?.trim() || countryName || tour.location || "Proactivitis";
    const key = destination && countrySlug ? `${countrySlug}:${destination.slug}` : countrySlug ? `country:${countrySlug}` : fallbackName;
    const href =
      destination && countrySlug
        ? toursQueryHref({ country: countrySlug, destination: destination.slug })
        : countrySlug
          ? toursQueryHref({ country: countrySlug })
          : localePath("/tours");
    const current = destinationMap.get(key);
    if (current) {
      current.count += 1;
      if (!current.category && tour.category) current.category = tour.category;
      continue;
    }
    destinationMap.set(key, {
      name: destinationName ?? fallbackName,
      countryName,
      href,
      count: 1,
      category: tour.category,
      location: tour.location
    });
  }

  const destinationCards = Array.from(destinationMap.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8);

  const categoryMap = new Map<string, { name: string; count: number; sampleDestination?: string }>();
  for (const tour of visibleHomeTours) {
    const category = tour.category?.trim();
    if (!category) continue;
    const current = categoryMap.get(category.toLowerCase());
    const destination = tour.departureDestination ?? tour.destination;
    const sampleDestination = destination ? localizedDestinationName(destination, locale) : tour.location?.split(",")[0]?.trim();
    if (current) {
      current.count += 1;
      if (!current.sampleDestination && sampleDestination) current.sampleDestination = sampleDestination;
      continue;
    }
    categoryMap.set(category.toLowerCase(), { name: category, count: 1, sampleDestination });
  }

  const categoryCards = Array.from(categoryMap.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8);

  const inventoryStats = [
    {
      label:
        locale === "es"
          ? "Tours activos"
          : locale === "fr"
            ? "Tours actifs"
            : "Active tours",
      value: visibleHomeTours.length
    },
    {
      label:
        locale === "es"
          ? "Destinos conectados"
          : locale === "fr"
            ? "Destinations connectees"
            : "Connected destinations",
      value: destinationMap.size
    },
    {
      label:
        locale === "es"
          ? "Categorias vivas"
          : locale === "fr"
            ? "Categories actives"
            : "Live categories",
      value: categoryMap.size
    }
  ];

  const tourCatalogItems = uniquePublishedTours.map((tour, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: tour.title,
    url: localizedPath(`/tours/${tour.slug}`)
  }));

  const transferCatalogItems = uniqueTransferLandings.map((landing, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: landing.heroTitle,
    url: localizedPath(`/transfer/${landing.landingSlug}`)
  }));
  const tourProducts = uniquePublishedTours.map((tour) => {
    const ratingData = tourRatingMap.get(tour.id);
    const ratingValue = Number((ratingData?.rating && ratingData.rating > 0 ? ratingData.rating : 5).toFixed(1));
    const reviewCount = ratingData?.count && ratingData.count > 0 ? ratingData.count : 1;
    return {
      "@type": "Product",
      "@id": `${localizedPath(`/tours/${tour.slug}`)}#product`,
      name: tour.title,
      description:
        tour.shortDescription ||
        (locale === "es"
          ? "Excursion en Republica Dominicana con reserva inmediata."
          : locale === "fr"
            ? "Excursion en Republique dominicaine avec reservation immediate."
            : "Dominican Republic excursion with instant booking."),
      url: localizedPath(`/tours/${tour.slug}`),
      image: `${PROACTIVITIS_URL}/fototours/fotosimple.jpg`,
      brand: {
        "@type": "Brand",
        name: "Proactivitis"
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        reviewCount
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: tour.price,
        priceValidUntil,
        availability: "https://schema.org/InStock",
        url: localizedPath(`/tours/${tour.slug}`),
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
      }
    };
  });

  const transferProducts = uniqueTransferLandings.map((landing) => {
    const ratingData = transferRatingMap.get(landing.landingSlug);
    const ratingValue = Number((ratingData?.rating && ratingData.rating > 0 ? ratingData.rating : 5).toFixed(1));
    const reviewCount = ratingData?.count && ratingData.count > 0 ? ratingData.count : 1;
    return {
      "@type": "Product",
      "@id": `${localizedPath(`/transfer/${landing.landingSlug}`)}#product`,
      name: landing.heroTitle,
      description: landing.heroSubtitle || landing.metaDescription,
      url: localizedPath(`/transfer/${landing.landingSlug}`),
      image: `${PROACTIVITIS_URL}${landing.heroImage}`,
      brand: {
        "@type": "Brand",
        name: "Proactivitis"
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        reviewCount
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: Math.round(landing.priceFrom),
        priceValidUntil,
        availability: "https://schema.org/InStock",
        url: localizedPath(`/transfer/${landing.landingSlug}`),
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
      }
    };
  });

  const corePublicPages = [
    { path: "/", name: locale === "es" ? "Inicio" : locale === "fr" ? "Accueil" : "Home" },
    { path: "/tours", name: locale === "es" ? "Tours" : locale === "fr" ? "Excursions" : "Tours" },
    { path: "/traslado", name: locale === "es" ? "Traslados" : locale === "fr" ? "Transferts" : "Transfers" },
    {
      path: "/destinos",
      name: locale === "es" ? "Destinos" : locale === "fr" ? "Destinations" : "Destinations"
    },
    { path: "/prodiscovery", name: "ProDiscovery" },
    { path: "/rent-a-car", name: "Rent a car" },
    { path: "/news", name: locale === "es" ? "Noticias" : locale === "fr" ? "Actualites" : "News" },
    {
      path: locale === "es" ? "/hoteles" : "/hotels",
      name: locale === "es" ? "Hoteles" : locale === "fr" ? "Hotels" : "Hotels"
    },
    { path: "/agency-program", name: locale === "fr" ? "Programme agences" : "Agency Program" }
  ];

  const allPublicPageUrls = Array.from(
    new Set([
      ...corePublicPages.map((page) => localizedPath(page.path)),
      ...uniquePublishedTours.map((tour) => localizedPath(`/tours/${tour.slug}`)),
      ...uniqueTransferLandings.map((landing) => localizedPath(`/transfer/${landing.landingSlug}`))
    ])
  );

  const allPublicPageItems = allPublicPageUrls.map((url, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: url.replace(`${PROACTIVITIS_URL}${localePrefix}`, "") || "/",
    url
  }));

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineBusiness",
        "@id": "https://proactivitis.com/#organization",
        name: "Proactivitis",
        url: "https://proactivitis.com/",
        logo: "https://proactivitis.com/logo.png",
        description: translate(locale, "home.schema.description"),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Servicios Proactivitis",
          itemListElement: [
            {
              "@type": "Offer",
              priceValidUntil,
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
              },
              itemOffered: {
                "@type": "Service",
                name: "Tours y Excursiones",
                url: "https://proactivitis.com/tours"
              }
            },
            {
              "@type": "Offer",
              priceValidUntil,
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
              },
              itemOffered: {
                "@type": "Service",
                name: "Traslados Privados",
                url: "https://proactivitis.com/traslado"
              }
            },
            {
              "@type": "Offer",
              priceValidUntil,
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
              },
              itemOffered: {
                "@type": "Service",
                name: "Portal para Agencias y Suplidores",
                url: "https://proactivitis.com/become-a-supplier"
              }
            }
          ]
        }
      },
      {
        "@type": "WebPage",
        "@id": `${localizedPath("/")}#webpage`,
        url: localizedPath("/"),
        name: locale === "es" ? "Inicio Proactivitis" : locale === "fr" ? "Accueil Proactivitis" : "Proactivitis Home",
        isPartOf: {
          "@id": `${PROACTIVITIS_URL}/#website`
        },
        about: {
          "@id": "https://proactivitis.com/#organization"
        }
      },
      {
        "@type": "ItemList",
        "@id": `${localizedPath("/")}#tour-catalog`,
        name: locale === "es" ? "Catalogo completo de tours" : locale === "fr" ? "Catalogue complet des excursions" : "Complete tours catalog",
        numberOfItems: tourCatalogItems.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: tourCatalogItems
      },
      {
        "@type": "ItemList",
        "@id": `${localizedPath("/")}#transfer-catalog`,
        name: locale === "es" ? "Catalogo completo de traslados" : locale === "fr" ? "Catalogue complet des transferts" : "Complete transfers catalog",
        numberOfItems: transferCatalogItems.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: transferCatalogItems
      },
      {
        "@type": "ItemList",
        "@id": `${localizedPath("/")}#public-pages`,
        name: locale === "es" ? "Paginas publicas Proactivitis" : locale === "fr" ? "Pages publiques Proactivitis" : "Proactivitis public pages",
        numberOfItems: allPublicPageItems.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: allPublicPageItems
      },
      {
        "@type": "ItemList",
        "@id": `${localizedPath("/")}#product-catalog`,
        name: locale === "es" ? "Catalogo de productos Proactivitis" : locale === "fr" ? "Catalogue de produits Proactivitis" : "Proactivitis product catalog",
        numberOfItems: tourProducts.length + transferProducts.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: [...tourProducts, ...transferProducts].map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: product
        }))
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: translate(locale, "home.schema.faq.question.booking"),
            acceptedAnswer: {
              "@type": "Answer",
              text: translate(locale, "home.schema.faq.answer.booking")
            }
          },
          {
            "@type": "Question",
            name: translate(locale, "home.schema.faq.question.agencies"),
            acceptedAnswer: {
              "@type": "Answer",
              text: translate(locale, "home.schema.faq.answer.agencies")
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-slate-50 text-slate-900 overflow-x-hidden">
      <HomeHeroCarousel>
        <HomeHeroContent locale={locale} overrides={homeOverrides.hero} />
      </HomeHeroCarousel>

      <section className="relative z-10 -mt-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
          <div className="grid gap-px bg-slate-200/70 md:grid-cols-3">
            {tripStartCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex min-h-[190px] flex-col justify-between bg-white p-6 transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100 transition group-hover:-translate-y-0.5 group-hover:bg-sky-600 group-hover:text-white">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
                      {card.label}
                    </span>
                  </div>
                  <div className="mt-6 space-y-2">
                    <h2 className="text-xl font-black leading-tight text-slate-950">{card.title}</h2>
                    <p className="text-sm font-medium leading-6 text-slate-600">{card.body}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
            {trustNotes.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.text} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <Icon className="h-4 w-4 text-emerald-600" aria-hidden />
                  {item.text}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className="travel-surface">
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-12 sm:px-6">
          <HomeRecommendedHeader locale={locale} overrides={homeOverrides.recommended} />
          <HomeTourSearchSection locale={locale} />
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {locale === "es"
                    ? "Plataforma de viaje"
                    : locale === "fr"
                      ? "Plateforme de voyage"
                      : "Travel platform"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {locale === "es"
                    ? "Todo el viaje conectado desde una sola busqueda"
                    : locale === "fr"
                      ? "Tout le voyage connecte depuis une seule recherche"
                      : "The whole trip connected from one search"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {inventoryStats.map((stat) => (
                  <span
                    key={stat.label}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    {stat.value.toLocaleString()} {stat.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {serviceCards.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-700 ring-1 ring-slate-200">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{service.label}</p>
                    <h3 className="mt-2 text-base font-black leading-tight text-slate-950">{service.title}</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{service.body}</p>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-sm">
            <FeaturedToursSection locale={locale} />
          </div>
          {destinationCards.length ? (
            <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    {locale === "es"
                      ? "Actividades donde vayas"
                      : locale === "fr"
                        ? "Activites ou vous allez"
                        : "Activities wherever you go"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    {locale === "es"
                      ? "Descubre experiencias segun el destino disponible"
                      : locale === "fr"
                        ? "Decouvrez les experiences selon la destination"
                        : "Discover experiences by available destination"}
                  </h2>
                </div>
                <Link
                  href={localePath("/tours")}
                  className="w-fit rounded-full border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300"
                >
                  {locale === "es" ? "Ver todo" : locale === "fr" ? "Tout voir" : "See all"}
                </Link>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {destinationCards.map((item) => (
                  <Link
                    key={`${item.name}-${item.countryName ?? ""}`}
                    href={item.href}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-700 ring-1 ring-slate-200">
                        <Globe2 className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
                        {item.count} {locale === "es" ? "planes" : locale === "fr" ? "plans" : "plans"}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-black leading-tight text-slate-950">{item.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{item.countryName ?? item.location}</p>
                    {item.category ? <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{item.category}</p> : null}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {categoryCards.length ? (
            <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {locale === "es" ? "Categorias activas" : locale === "fr" ? "Categories actives" : "Active categories"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                {locale === "es"
                  ? "Explora por tipo de experiencia"
                  : locale === "fr"
                    ? "Explorez par type d experience"
                    : "Explore by experience type"}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {categoryCards.map((item) => (
                  <Link
                    key={item.name}
                    href={toursQueryHref({ category: item.name })}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-sky-700 ring-1 ring-slate-200">
                      <Tags className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="mt-4 block text-lg font-black leading-tight text-slate-950">{item.name}</span>
                    <span className="mt-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {item.count} {locale === "es" ? "opciones" : locale === "fr" ? "options" : "options"}
                    </span>
                    {item.sampleDestination ? <span className="mt-2 block text-xs text-slate-500">{item.sampleDestination}</span> : null}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.6fr] lg:items-stretch">
            <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-7 text-white shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-sky-300">
                {locale === "es" ? "Cómo funciona" : locale === "fr" ? "Comment ça marche" : "How it works"}
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight">
                {locale === "es"
                  ? "Menos dudas. Más viaje."
                  : locale === "fr"
                    ? "Moins de doute. Plus de voyage."
                    : "Less doubt. More travel."}
              </h2>
              <p className="mt-4 text-sm font-medium leading-6 text-white/75">
                {locale === "es"
                  ? "Decide rápido: vive una experiencia, coordina tu traslado o explora por zona."
                  : locale === "fr"
                    ? "Decidez vite: vivez une experience, coordonnez votre transfert ou explorez par zone."
                    : "Decide quickly: book an experience, coordinate your transfer, or explore by area."}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.title}
                    className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-black leading-tight text-slate-950">{step.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{step.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="travel-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <div
            className="relative flex min-h-[280px] items-center overflow-hidden rounded-3xl border border-slate-100 shadow-sm"
            style={{
              backgroundImage: `url('${transferBannerImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 bg-slate-900/55 md:bg-slate-900/65" />
            <div className="relative z-10 w-full space-y-6 px-6 py-10 text-center text-white md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
              {homeOverrides.transferBanner?.label ?? t("home.transferBanner.label")}
            </p>
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              {homeOverrides.transferBanner?.title ?? t("home.transferBanner.title")}
            </h2>
            <p className="text-sm text-white/90 md:text-base">
              {homeOverrides.transferBanner?.description ?? t("home.transferBanner.description")}
            </p>
            <HomeTransferTicker locale={locale} />
            <div className="botones-banner justify-center md:justify-start">
              <Link href={transferHref} className="boton-verde">
                {homeOverrides.transferBanner?.cta ?? t("home.transferBanner.cta")}
              </Link>
            </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-[32px] bg-slate-900">
            <Image
              src="/mini-portada.png"
              alt="Grupo de viajeros felices"
              width={900}
              height={600}
              className="object-cover"
              priority
            />
          </div>
          <div className="space-y-4">
            <HomeAboutContent locale={locale} overrides={homeOverrides.about} />
          </div>
        </div>
      </section>
      <section className="sr-only">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </section>
    </div>
  );
}
