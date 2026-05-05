import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BlogShareButtons from "@/components/blog/BlogShareButtons";
import BlogCommentForm from "@/components/blog/BlogCommentForm";
import { TourCard } from "@/components/public/TourCard";
import BlogReadingProgress from "@/components/blog/BlogReadingProgress";
import BlogArticleTools from "@/components/blog/BlogArticleTools";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BlogLibraryClient from "@/components/blog/BlogLibraryClient";
import type { ReactNode } from "react";

const BASE_URL = "https://proactivitis.com";
const EDITORIAL_AUTHOR_NAME = "Departamento de Inteligencia Editorial Proactivitis";
const EDITORIAL_AUTHOR_URL = `${BASE_URL}/en/editorial-team`;
const EDITORIAL_AUTHOR_SCHEMA = {
  "@type": "Organization",
  "@id": `${EDITORIAL_AUTHOR_URL}#editorial-organization`,
  name: EDITORIAL_AUTHOR_NAME,
  url: EDITORIAL_AUTHOR_URL
};

type StaticBlogTranslation = {
  title: string;
  excerpt: string;
  contentHtml: string;
};

type StaticBlogPost = {
  id: string;
  slug: string;
  coverImage?: string;
  publishedAt: Date;
  translations: Record<"es" | "en" | "fr", StaticBlogTranslation>;
};

const STATIC_POSTS: StaticBlogPost[] = [
  {
    id: "punta-cana-travel-guide-2026",
    slug: "punta-cana-travel-guide-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-01T12:00:00Z"),
    translations: {
      es: {
        title: "Guia de viaje Punta Cana 2026: que hacer, que revisar y cuanto tiempo quedarse",
        excerpt:
          "La guia practica 2026 para entender Punta Cana: traslados, excursiones top, precios reales y consejos para evitar sobrecostos.",
        contentHtml: `
          <p>Punta Cana sigue siendo el destino numero uno del Caribe para quienes buscan playa, seguridad y experiencias bien organizadas. En 2026 la demanda crece, los hoteles suben tarifas y el mayor dolor del viajero es la logistica. Esta guia resume lo esencial para decidir rapido: que hacer, que reservar con tiempo y como moverte sin sorpresas.</p>
          <h2>1. Punto de partida: traslados privados desde PUJ</h2>
          <p>La decision que mas impacta tu experiencia es el traslado. Un transporte privado reduce esperas, te evita colas y te deja en el lobby sin negociaciones. Si llegas en un vuelo internacional, el pick-up confirmado con tracking de vuelo evita cargos inesperados. Nuestra recomendacion es reservar el traslado antes de viajar y confirmar el hotel exacto y el horario de salida.</p>
          <p>Si viajas en pareja o en familia, un SUV o minivan privada es mas comoda y evita depender de otros viajeros. Para quienes se hospedan en Bavaro, Cap Cana o Uvero Alto, el tiempo promedio de traslado oscila entre 20 y 45 minutos dependiendo del hotel.</p>
          <h2>2. Las excursiones mas buscadas en Punta Cana 2026</h2>
          <p>El top de experiencias no cambia, pero el orden de prioridad si. En 2026 los viajeros buscan tours con picks-up claros y actividades completas. Estas son las favoritas:</p>
          <ul>
            <li><strong>Isla Saona</strong>: el clasico que siempre funciona, ideal para quienes quieren playa, catamaran y fotos de postal.</li>
            <li><strong>Buggy y ATV</strong>: aventura con barro, cueva y parada en playa Macao.</li>
            <li><strong>Party Boat / Catamaran</strong>: open bar + snorkeling + piscina natural para grupos y adultos.</li>
            <li><strong>Parasailing</strong>: vistas desde 150-200 pies sobre Bavaro.</li>
            <li><strong>Santo Domingo</strong>: historia real, zona colonial y logistica de un dia completo.</li>
          </ul>
          <p>Si solo tienes 3-4 dias, combina una excursion de playa (Saona o Catamaran) con una de aventura (Buggy o ATV). Eso te da variedad sin perder tiempo en traslados largos.</p>
          <h2>3. Cuanto tiempo quedarse y como armar un itinerario</h2>
          <p>Lo ideal para Punta Cana en 2026 son 4 a 6 dias. Menos de eso se siente apurado. Un itinerario simple que funciona:</p>
          <ul>
            <li><strong>Dia 1:</strong> llegada + traslado privado + descanso.</li>
            <li><strong>Dia 2:</strong> isla o catamaran (actividad acuática).</li>
            <li><strong>Dia 3:</strong> buggy/ATV o safari cultural.</li>
            <li><strong>Dia 4:</strong> playa libre + compras o spa.</li>
            <li><strong>Dia 5 (opcional):</strong> Santo Domingo o Samana si quieres historia o ballenas.</li>
          </ul>
          <h2>4. Precios reales y como evitar sobrecostos</h2>
          <p>El error mas comun es comprar en mostradores del hotel sin comparar. En 2026 los precios suben, pero un proveedor directo te da tarifa fija y evita comisiones. Asegurate de ver:</p>
          <ul>
            <li>Precio total con impuestos y combustible incluidos.</li>
            <li>Politica de cancelacion (ideal: 24h sin cargos).</li>
            <li>Confirmacion inmediata por WhatsApp o email.</li>
          </ul>
          <h2>5. Recomendaciones finales</h2>
          <p>Reserva primero el traslado y luego 2-3 excursiones clave. Evita saturarte con actividades diarias si viajas en familia. Si viajas en pareja, prioriza experiencias con menos grupos y mas tiempo libre.</p>
          <p>¿Listo para organizar tu viaje? Mira las opciones de <a href="/tours">tours en Punta Cana</a> o reserva tu <a href="/traslado">traslado privado</a> con confirmacion inmediata.</p>
        `
      },
      en: {
        title: "Punta Cana Travel Guide 2026: what to do, what to compare, and how long to stay",
        excerpt:
          "Your 2026 planning guide for Punta Cana: transfers, top tours, real prices, and tips to avoid extra fees.",
        contentHtml: `
          <p>Punta Cana remains the #1 Caribbean destination for travelers who want beaches, safety, and well-run experiences. In 2026 demand is higher and logistics matter more. This guide covers what to do, what to book early, and how to move around without surprises.</p>
          <h2>1. Start with private transfers from PUJ</h2>
          <p>Private airport transfers save time and keep your arrival smooth. Flight tracking and confirmed pick-up reduce stress and extra charges. Book before you travel and confirm the exact hotel and arrival time.</p>
          <p>For couples and families, a private SUV or minivan is more comfortable and avoids waiting for other travelers. Typical transfer time is 20-45 minutes depending on your resort zone.</p>
          <h2>2. Top tours in Punta Cana for 2026</h2>
          <p>These experiences keep ranking because they deliver value:</p>
          <ul>
            <li><strong>Saona Island</strong>: classic beach day with catamaran vibes.</li>
            <li><strong>Buggy & ATV</strong>: off-road adventure, cave stop, and Macao Beach.</li>
            <li><strong>Party Boat / Catamaran</strong>: open bar + snorkeling + natural pool.</li>
            <li><strong>Parasailing</strong>: aerial views over Bavaro.</li>
            <li><strong>Santo Domingo</strong>: history and colonial city for a full-day trip.</li>
          </ul>
          <h2>3. How many days to stay</h2>
          <p>Four to six days is the sweet spot. A simple plan:</p>
          <ul>
            <li><strong>Day 1:</strong> arrival + private transfer.</li>
            <li><strong>Day 2:</strong> island or catamaran.</li>
            <li><strong>Day 3:</strong> buggy/ATV or cultural safari.</li>
            <li><strong>Day 4:</strong> beach + local market.</li>
            <li><strong>Day 5 (optional):</strong> Santo Domingo or Samana.</li>
          </ul>
          <h2>4. Real prices and how to avoid overpaying</h2>
          <p>Hotel desks often add commissions. Book direct to lock a fixed price and clear policy.</p>
          <ul>
            <li>Fixed total price.</li>
            <li>24h free cancellation is ideal.</li>
            <li>Instant confirmation via WhatsApp or email.</li>
          </ul>
          <h2>5. Final recommendations</h2>
          <p>Book your transfer first and then 2-3 key tours. If you travel with family, leave room for free beach days. If you want premium vibes, choose smaller group options.</p>
          <p>Explore <a href="/en/tours">Punta Cana tours</a> or reserve a <a href="/en/traslado">private transfer</a> with instant confirmation.</p>
        `
      },
      fr: {
        title: "Guide de voyage Punta Cana 2026: que faire, que reserver, et combien de jours rester",
        excerpt:
          "Guide 2026 pour planifier Punta Cana: transferts, meilleures excursions, prix reels et conseils pour eviter les frais.",
        contentHtml: `
          <p>Punta Cana reste la destination numero 1 des Caraibes pour la plage, la securite et les activites bien organisees. En 2026 la demande augmente, donc la logistique est essentielle. Ce guide explique quoi faire, quoi reserver et comment se deplacer sans surprises.</p>
          <h2>1. Commencez par le transfert prive depuis PUJ</h2>
          <p>Un transfert prive evite les attentes et garantit une arrivee fluide. Le suivi de vol et le pick-up confirme reduisent le stress. Reserve avant le voyage et confirme l'hotel.</p>
          <p>Pour les couples et familles, un SUV prive ou un minivan est plus confortable. Le temps de transfert varie entre 20 et 45 minutes selon la zone.</p>
          <h2>2. Top excursions a Punta Cana en 2026</h2>
          <ul>
            <li><strong>Isla Saona</strong>: journee plage et catamaran.</li>
            <li><strong>Buggy & ATV</strong>: aventure, grotte et plage Macao.</li>
            <li><strong>Party Boat / Catamaran</strong>: open bar + snorkeling + piscine naturelle.</li>
            <li><strong>Parasailing</strong>: vues aeriennes sur Bavaro.</li>
            <li><strong>Santo Domingo</strong>: histoire et ville coloniale.</li>
          </ul>
          <h2>3. Combien de jours rester</h2>
          <p>Quatre a six jours est ideal. Exemple:</p>
          <ul>
            <li><strong>Jour 1:</strong> arrivee + transfert prive.</li>
            <li><strong>Jour 2:</strong> ile ou catamaran.</li>
            <li><strong>Jour 3:</strong> buggy/ATV ou safari culturel.</li>
            <li><strong>Jour 4:</strong> plage + marche local.</li>
            <li><strong>Jour 5 (optionnel):</strong> Santo Domingo ou Samana.</li>
          </ul>
          <h2>4. Prix reels et comment eviter de payer trop</h2>
          <p>Les comptoirs d'hotel ajoutent souvent des commissions. Une reservation directe est plus claire.</p>
          <ul>
            <li>Prix fixe.</li>
            <li>Annulation gratuite 24h.</li>
            <li>Confirmation rapide par WhatsApp ou email.</li>
          </ul>
          <h2>5. Recommandations finales</h2>
          <p>Reservez d'abord votre transfert puis 2-3 excursions. Si vous voyagez en famille, gardez du temps libre.</p>
          <p>Voir les <a href="/fr/tours">excursions a Punta Cana</a> ou reserver un <a href="/fr/traslado">transfert prive</a>.</p>
        `
      }
    }
  }
  ,
  {
    id: "top-attractions-punta-cana-2026",
    slug: "top-attractions-punta-cana-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-02T12:00:00Z"),
    translations: {
      es: {
        title: "Top attractions in Punta Cana 2026: guia rapida con datos utiles",
        excerpt:
          "Las atracciones mas buscadas en Punta Cana 2026 y como comparar opciones sin sobrecostos.",
        contentHtml: `
          <p>Esta lista resume las atracciones que mas buscan los viajeros en 2026 y lo que conviene reservar con tiempo para evitar alzas de precio.</p>
          <h2>1. Isla Saona</h2>
          <p>El tour mas fotografiado del Caribe. Ideal para playa, catamaran y piscina natural.</p>
          <h2>2. Party Boat / Catamaran</h2>
          <p>Open bar + snorkeling + musica. Perfecto para grupos y adultos.</p>
          <h2>3. Buggy y ATV</h2>
          <p>La aventura de barro con parada en cueva y playa Macao.</p>
          <h2>4. Parasailing</h2>
          <p>Vistas aereas de Bavaro con vuelos de 10-12 minutos.</p>
          <h2>5. Santo Domingo</h2>
          <p>Historia real y zona colonial en un dia completo.</p>
          <p>Reserva directo para asegurar precio fijo y confirmacion inmediata: <a href="/tours">tours en Punta Cana</a> y <a href="/traslado">traslados privados</a>.</p>
        `
      },
      en: {
        title: "Top attractions in Punta Cana 2026: quick guide with planning data",
        excerpt:
          "The most searched Punta Cana attractions for 2026 and how to compare options before overpaying.",
        contentHtml: `
          <p>Here are the top attractions travelers search for in 2026, plus what to book early to avoid price spikes.</p>
          <h2>1. Saona Island</h2>
          <p>Classic beach day with catamaran and natural pool.</p>
          <h2>2. Party Boat / Catamaran</h2>
          <p>Open bar + snorkeling + music. Great for groups.</p>
          <h2>3. Buggy & ATV</h2>
          <p>Off-road adventure with cave and Macao Beach.</p>
          <h2>4. Parasailing</h2>
          <p>Best aerial views over Bavaro.</p>
          <h2>5. Santo Domingo</h2>
          <p>History-focused full day trip to the capital.</p>
          <p>Book direct for fixed rates: <a href="/en/tours">Punta Cana tours</a> and <a href="/en/traslado">private transfers</a>.</p>
        `
      },
      fr: {
        title: "Top attractions a Punta Cana 2026: guide rapide et donnees utiles",
        excerpt:
          "Les attractions les plus recherchees a Punta Cana en 2026 et comment comparer les options.",
        contentHtml: `
          <p>Voici les attractions les plus recherchees en 2026, et celles a reserver a l'avance.</p>
          <h2>1. Isla Saona</h2>
          <p>Journee plage avec catamaran et piscine naturelle.</p>
          <h2>2. Party Boat / Catamaran</h2>
          <p>Open bar + snorkeling + musique.</p>
          <h2>3. Buggy & ATV</h2>
          <p>Aventure tout-terrain avec grotte et plage Macao.</p>
          <h2>4. Parasailing</h2>
          <p>Meilleures vues aeriennes sur Bavaro.</p>
          <h2>5. Santo Domingo</h2>
          <p>Excursion historique a la capitale.</p>
          <p>Reservation directe: <a href="/fr/tours">excursions</a> et <a href="/fr/traslado">transferts prives</a>.</p>
        `
      }
    }
  },
  {
    id: "punta-cana-airport-transfer-guide-2026",
    slug: "punta-cana-airport-transfer-guide-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-03T12:00:00Z"),
    translations: {
      es: {
        title: "Guia de traslados aeropuerto PUJ 2026: tiempos, zonas y costos",
        excerpt:
          "Todo lo que debes saber para moverte desde el aeropuerto PUJ a Bavaro, Cap Cana y Uvero Alto.",
        contentHtml: `
          <p>En 2026 la demanda sube y los traslados son la primera decision clave. Esta guia resume tiempos promedio y zonas principales.</p>
          <h2>Zonas mas comunes</h2>
          <ul>
            <li>Bavaro: 20-30 minutos</li>
            <li>Cap Cana: 20-30 minutos</li>
            <li>Uvero Alto: 40-55 minutos</li>
          </ul>
          <p>Reserva privado para evitar esperas y cargos sorpresa. <a href="/traslado">Ver traslados privados</a>.</p>
        `
      },
      en: {
        title: "PUJ airport transfer guide 2026: times, zones, and costs",
        excerpt:
          "What to expect when transferring from PUJ to Bavaro, Cap Cana, and Uvero Alto.",
        contentHtml: `
          <p>Transfers are the first big decision. Here are typical times by zone.</p>
          <h2>Main zones</h2>
          <ul>
            <li>Bavaro: 20-30 minutes</li>
            <li>Cap Cana: 20-30 minutes</li>
            <li>Uvero Alto: 40-55 minutes</li>
          </ul>
          <p>Book private to avoid delays: <a href="/en/traslado">private transfers</a>.</p>
        `
      },
      fr: {
        title: "Guide des transferts PUJ 2026: temps, zones et couts",
        excerpt:
          "Ce qu'il faut savoir pour aller de PUJ a Bavaro, Cap Cana et Uvero Alto.",
        contentHtml: `
          <p>Le transfert est la premiere decision cle. Voici les temps moyens.</p>
          <h2>Zones principales</h2>
          <ul>
            <li>Bavaro: 20-30 minutes</li>
            <li>Cap Cana: 20-30 minutes</li>
            <li>Uvero Alto: 40-55 minutes</li>
          </ul>
          <p>Reservez prive: <a href="/fr/traslado">transferts prives</a>.</p>
        `
      }
    }
  },
  {
    id: "punta-cana-what-to-pack-2026",
    slug: "punta-cana-what-to-pack-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-04T12:00:00Z"),
    translations: {
      es: {
        title: "Que llevar a Punta Cana en 2026: checklist rapido",
        excerpt: "Documentos, ropa y tips para excursiones acuaticas y aventura.",
        contentHtml: `
          <p>Checklist rapido para viajeros que reservan tours y traslados.</p>
          <ul>
            <li>Protector solar y repelente.</li>
            <li>Zapatos para agua y toalla ligera.</li>
            <li>Documento y copia digital.</li>
            <li>Dinero en efectivo para extras.</li>
          </ul>
          <p>Combina tu lista con tus reservas: <a href="/tours">ver tours</a>.</p>
        `
      },
      en: {
        title: "What to pack for Punta Cana 2026: quick checklist",
        excerpt: "Docs, clothes, and tips for beach and adventure tours.",
        contentHtml: `
          <p>Quick list for travelers booking tours and transfers.</p>
          <ul>
            <li>Sunblock and repellent.</li>
            <li>Water shoes and light towel.</li>
            <li>Passport copy.</li>
            <li>Cash for extras.</li>
          </ul>
          <p>Plan your activities: <a href="/en/tours">see tours</a>.</p>
        `
      },
      fr: {
        title: "Que mettre dans sa valise pour Punta Cana 2026",
        excerpt: "Documents, vetements et astuces pour les excursions.",
        contentHtml: `
          <p>Checklist rapide pour voyages et excursions.</p>
          <ul>
            <li>Creme solaire et anti-moustiques.</li>
            <li>Chaussures d'eau et serviette.</li>
            <li>Copie du passeport.</li>
            <li>Cash pour extras.</li>
          </ul>
          <p>Voir les activites: <a href="/fr/tours">excursions</a>.</p>
        `
      }
    }
  },
  {
    id: "punta-cana-best-beaches-2026",
    slug: "punta-cana-best-beaches-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-05T12:00:00Z"),
    translations: {
      es: {
        title: "Las mejores playas de Punta Cana 2026 y como llegar",
        excerpt: "Bavaro, Macao y Cap Cana con tips de acceso y tours cercanos.",
        contentHtml: `
          <p>Las playas mas recomendadas en 2026:</p>
          <ul>
            <li>Bavaro: acceso facil y muchos hoteles.</li>
            <li>Macao: mas natural, ideal para buggy.</li>
            <li>Cap Cana: ambiente premium y mar calmo.</li>
          </ul>
          <p>Reserva experiencias cerca de cada playa: <a href="/tours">tours en Punta Cana</a>.</p>
        `
      },
      en: {
        title: "Best Punta Cana beaches 2026 and how to get there",
        excerpt: "Bavaro, Macao, and Cap Cana with access tips and nearby tours.",
        contentHtml: `
          <p>Top beaches for 2026:</p>
          <ul>
            <li>Bavaro: easy access and many resorts.</li>
            <li>Macao: more natural, great for buggy tours.</li>
            <li>Cap Cana: premium vibe and calm water.</li>
          </ul>
          <p>Find tours nearby: <a href="/en/tours">Punta Cana tours</a>.</p>
        `
      },
      fr: {
        title: "Meilleures plages de Punta Cana 2026",
        excerpt: "Bavaro, Macao et Cap Cana avec conseils d'acces.",
        contentHtml: `
          <p>Plages top en 2026:</p>
          <ul>
            <li>Bavaro: acces facile.</li>
            <li>Macao: nature et buggy.</li>
            <li>Cap Cana: ambiance premium.</li>
          </ul>
          <p>Excursions proches: <a href="/fr/tours">voir les tours</a>.</p>
        `
      }
    }
  },
  {
    id: "punta-cana-family-trips-2026",
    slug: "punta-cana-family-trips-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-06T12:00:00Z"),
    translations: {
      es: {
        title: "Punta Cana en familia 2026: tours seguros y traslados comodos",
        excerpt: "Actividades para ninos, horarios suaves y traslados privados.",
        contentHtml: `
          <p>Si viajas en familia, prioriza tours con recogida clara y tiempos moderados.</p>
          <ul>
            <li>Isla Saona con catamaran y playa.</li>
            <li>Parasailing en horarios de la manana.</li>
            <li>City tours con paradas cortas.</li>
          </ul>
          <p>Traslados privados facilitan todo: <a href="/traslado">ver opciones</a>.</p>
        `
      },
      en: {
        title: "Punta Cana with family 2026: safe tours and easy transfers",
        excerpt: "Family-friendly activities and private transfer tips.",
        contentHtml: `
          <p>For families, choose tours with clear pick-up and moderate timing.</p>
          <ul>
            <li>Saona Island beach day.</li>
            <li>Morning parasailing.</li>
            <li>City tour with short stops.</li>
          </ul>
          <p>Private transfers make it smoother: <a href="/en/traslado">see options</a>.</p>
        `
      },
      fr: {
        title: "Punta Cana en famille 2026: tours securises et transferts",
        excerpt: "Activites famille et conseils de transport prive.",
        contentHtml: `
          <p>Pour les familles, choisissez des tours courts avec pick-up clair.</p>
          <ul>
            <li>Isla Saona.</li>
            <li>Parasailing le matin.</li>
            <li>City tour.</li>
          </ul>
          <p>Transferts prives: <a href="/fr/traslado">voir options</a>.</p>
        `
      }
    }
  },
  {
    id: "punta-cana-nightlife-guide-2026",
    slug: "punta-cana-nightlife-guide-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-07T12:00:00Z"),
    translations: {
      es: {
        title: "Vida nocturna en Punta Cana 2026: opciones reales",
        excerpt: "Party boat, bares y planes nocturnos con reservas seguras.",
        contentHtml: `
          <p>La vida nocturna en Punta Cana incluye catamaranes, bares y shows.</p>
          <ul>
            <li>Party boat con open bar.</li>
            <li>Shows locales en hoteles.</li>
            <li>Bares en Bavaro.</li>
          </ul>
          <p>Reserva el party boat con antelacion: <a href="/tours">ver tours</a>.</p>
        `
      },
      en: {
        title: "Punta Cana nightlife 2026: real options",
        excerpt: "Party boat, bars, and safe bookings.",
        contentHtml: `
          <p>Nightlife includes catamarans, hotel shows, and Bavaro bars.</p>
          <ul>
            <li>Party boat with open bar.</li>
            <li>Resort shows.</li>
            <li>Bavaro bars.</li>
          </ul>
          <p>Book the party boat early: <a href="/en/tours">see tours</a>.</p>
        `
      },
      fr: {
        title: "Vie nocturne a Punta Cana 2026",
        excerpt: "Party boat, bars et reservations securisees.",
        contentHtml: `
          <p>Soirees: catamaran, shows d'hotel, bars a Bavaro.</p>
          <ul>
            <li>Party boat avec open bar.</li>
            <li>Shows locaux.</li>
            <li>Bars.</li>
          </ul>
          <p>Reservez le party boat: <a href="/fr/tours">voir les tours</a>.</p>
        `
      }
    }
  },
  {
    id: "punta-cana-weather-2026",
    slug: "punta-cana-weather-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-08T12:00:00Z"),
    translations: {
      es: {
        title: "Clima en Punta Cana 2026: temporadas y mejores meses",
        excerpt: "Que meses son mas secos y como planificar tours.",
        contentHtml: `
          <p>La temporada mas seca va de diciembre a abril. En verano hay mas lluvia pero tambien mejores precios.</p>
          <p>Si viajas en temporada alta, reserva tours y traslados antes de llegar.</p>
          <p>Explora opciones: <a href="/tours">tours</a> y <a href="/traslado">traslados</a>.</p>
        `
      },
      en: {
        title: "Punta Cana weather 2026: seasons and best months",
        excerpt: "Dry season tips and how to plan tours.",
        contentHtml: `
          <p>Dry season runs December to April. Summer has more rain but better prices.</p>
          <p>Book tours and transfers early in peak season.</p>
          <p>See options: <a href="/en/tours">tours</a> and <a href="/en/traslado">transfers</a>.</p>
        `
      },
      fr: {
        title: "Meteo Punta Cana 2026: saisons et meilleurs mois",
        excerpt: "Conseils saison seche et organisation des tours.",
        contentHtml: `
          <p>La saison seche va de decembre a avril. L'ete est plus humide mais moins cher.</p>
          <p>Reserve vos tours et transferts a l'avance.</p>
          <p>Options: <a href="/fr/tours">tours</a> et <a href="/fr/traslado">transferts</a>.</p>
        `
      }
    }
  },
  {
    id: "punta-cana-couples-itinerary-2026",
    slug: "punta-cana-couples-itinerary-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-09T12:00:00Z"),
    translations: {
      es: {
        title: "Itinerario romantico Punta Cana 2026: parejas",
        excerpt: "Planes de 4-5 dias con tours y playas tranquilas.",
        contentHtml: `
          <p>Un plan simple para parejas: traslado privado, isla, catamaran y una tarde libre.</p>
          <p>Recomendados: Isla Saona y catamaran sunset.</p>
          <p>Reserva directo: <a href="/tours">tours</a>.</p>
        `
      },
      en: {
        title: "Romantic Punta Cana itinerary 2026 for couples",
        excerpt: "4-5 day plan with beach tours and sunset catamaran.",
        contentHtml: `
          <p>Couples plan: private transfer, island tour, sunset catamaran, and free beach time.</p>
          <p>Book direct: <a href="/en/tours">tours</a>.</p>
        `
      },
      fr: {
        title: "Itineraire romantique Punta Cana 2026",
        excerpt: "Plan 4-5 jours avec plage et catamaran.",
        contentHtml: `
          <p>Plan couple: transfert prive, ile, catamaran sunset.</p>
          <p>Reservation directe: <a href="/fr/tours">tours</a>.</p>
        `
      }
    }
  },
  {
    id: "punta-cana-adventure-tours-2026",
    slug: "punta-cana-adventure-tours-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-10T12:00:00Z"),
    translations: {
      es: {
        title: "Tours de aventura en Punta Cana 2026",
        excerpt: "Buggy, ATV, zipline y actividades intensas.",
        contentHtml: `
          <p>Si buscas adrenalina, prioriza buggy/ATV, zipline y rutas combinadas.</p>
          <p>Explora tours de aventura: <a href="/tours">ver tours</a>.</p>
        `
      },
      en: {
        title: "Adventure tours in Punta Cana 2026",
        excerpt: "Buggy, ATV, zipline and high-energy tours.",
        contentHtml: `
          <p>For adrenaline, choose buggy/ATV, zipline and combo routes.</p>
          <p>See adventure tours: <a href="/en/tours">Punta Cana tours</a>.</p>
        `
      },
      fr: {
        title: "Tours aventure a Punta Cana 2026",
        excerpt: "Buggy, ATV, zipline et activites fortes.",
        contentHtml: `
          <p>Pour l'adrenaline: buggy/ATV, zipline et combos.</p>
          <p>Voir les tours: <a href="/fr/tours">excursions</a>.</p>
        `
      }
    }
  },
  {
    id: "punta-cana-budget-tips-2026",
    slug: "punta-cana-budget-tips-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-11T12:00:00Z"),
    translations: {
      es: {
        title: "Consejos de presupuesto Punta Cana 2026",
        excerpt: "Como ahorrar en tours y traslados sin perder calidad.",
        contentHtml: `
          <p>Reserva directo, compara opciones y evita intermediarios del hotel.</p>
          <p>Mejores precios: <a href="/traslado">traslados</a> y <a href="/tours">tours</a>.</p>
        `
      },
      en: {
        title: "Punta Cana budget tips 2026",
        excerpt: "How to save on tours and transfers without sacrificing quality.",
        contentHtml: `
          <p>Book direct, compare options, and avoid hotel desk commissions.</p>
          <p>See prices: <a href="/en/traslado">transfers</a> and <a href="/en/tours">tours</a>.</p>
        `
      },
      fr: {
        title: "Conseils budget Punta Cana 2026",
        excerpt: "Economiser sur tours et transferts.",
        contentHtml: `
          <p>Reserver direct et comparer les options.</p>
          <p>Prix: <a href="/fr/traslado">transferts</a> et <a href="/fr/tours">tours</a>.</p>
        `
      }
    }
  }
];

type BlogLocale = "es" | "en" | "fr";

const STATIC_POST_COVER_OVERRIDES: Record<string, string> = {
  "punta-cana-travel-guide-2026": "/fototours/fototour.jpeg",
  "top-attractions-punta-cana-2026": "/fototours/fototour.jpeg",
  "punta-cana-airport-transfer-guide-2026": "/transfer/sedan.png",
  "punta-cana-what-to-pack-2026": "/fototours/fotosimple.jpg",
  "punta-cana-best-beaches-2026": "/fototours/fototour.jpeg",
  "punta-cana-family-trips-2026": "/transfer/suv.png",
  "punta-cana-nightlife-guide-2026": "/fototours/fototour.jpeg",
  "punta-cana-weather-2026": "/fototours/fotosimple.jpg",
  "punta-cana-couples-itinerary-2026": "/fototours/fototour.jpeg",
  "punta-cana-adventure-tours-2026": "/fototours/fototour.jpeg",
  "punta-cana-budget-tips-2026": "/transfer/mini van.png"
};

type EditorialBlock = {
  intro: string;
  planningTitle: string;
  planningBody: string;
  checklistTitle: string;
  checklist: string[];
  mistakesTitle: string;
  mistakes: string[];
  ctaTitle: string;
  ctaBody: string;
  ctaHref: string;
  ctaLabel: string;
};

const EDITORIAL_DEFAULT: Record<BlogLocale, EditorialBlock> = {
  es: {
    intro:
      "Este articulo se actualizo para ofrecer contexto verificable de viaje, lectura de mercado y criterios operativos utiles.",
    planningTitle: "Como leer este mercado sin perder dinero",
    planningBody:
      "La forma mas clara de evaluar Punta Cana es ordenar la logistica por prioridad: llegada, experiencias principales y actividades opcionales.",
    checklistTitle: "Checklist recomendado",
    checklist: [
      "Define fechas, hotel y numero de viajeros antes de cotizar.",
      "Confirma horario de recogida y duracion real de cada actividad.",
      "Revisa solo opciones con precio total claro y politica de cancelacion visible.",
      "Guarda vouchers y soporte de contacto para cambios de ultima hora."
    ],
    mistakesTitle: "Errores comunes que debes evitar",
    mistakes: [
      "Dejar todas las decisiones para la llegada al hotel.",
      "Elegir solo por precio sin validar logistica de recogida.",
      "Saturar la agenda sin dias de descanso o margen entre tours."
    ],
    ctaTitle: "Recursos relacionados",
    ctaBody:
      "Estos enlaces internos sirven como contexto documental para comparar rutas, actividades y condiciones operativas antes de tomar una decision.",
    ctaHref: "/tours",
    ctaLabel: "Consultar guias de viaje"
  },
  en: {
    intro:
      "This article was expanded to provide verifiable travel context, market reading, and useful operational criteria.",
    planningTitle: "How to read this market without overspending",
    planningBody:
      "The clearest way to evaluate Punta Cana is to order logistics by priority: arrival, core experiences, and optional activities.",
    checklistTitle: "Recommended checklist",
    checklist: [
      "Confirm travel dates, resort, and traveler count first.",
      "Validate pickup windows and true activity duration.",
      "Review only options with clear total pricing and visible cancellation rules.",
      "Keep vouchers and support contact ready for last-minute adjustments."
    ],
    mistakesTitle: "Common mistakes to avoid",
    mistakes: [
      "Leaving every decision for hotel arrival.",
      "Choosing only by price without pickup logistics.",
      "Overloading your itinerary with no recovery time."
    ],
    ctaTitle: "Related resources",
    ctaBody:
      "These internal references are provided as planning context for comparing routes, activities, and operational conditions before making a decision.",
    ctaHref: "/en/tours",
    ctaLabel: "Review travel references"
  },
  fr: {
    intro:
      "Cet article a ete enrichi pour offrir un contexte de voyage verifiable, une lecture du marche et des criteres operationnels utiles.",
    planningTitle: "Comment lire ce marche sans depenser trop",
    planningBody:
      "La lecture la plus claire de Punta Cana consiste a classer la logistique par priorite: arrivee, experiences principales et activites optionnelles.",
    checklistTitle: "Checklist recommandee",
    checklist: [
      "Confirmez vos dates, hotel et nombre de voyageurs.",
      "Validez horaires de pickup et duree reelle des activites.",
      "Consultez seulement les options avec prix total clair et annulation transparente.",
      "Gardez vouchers et contact support pour les changements."
    ],
    mistakesTitle: "Erreurs frequentes a eviter",
    mistakes: [
      "Laisser toutes les decisions pour l arrivee a l hotel.",
      "Choisir par prix sans verifier la logistique pickup.",
      "Surcharger le planning sans temps libre."
    ],
    ctaTitle: "Ressources associees",
    ctaBody:
      "Ces references internes servent de contexte documentaire pour comparer routes, activites et conditions operationnelles avant une decision.",
    ctaHref: "/fr/tours",
    ctaLabel: "Consulter les references de voyage"
  }
};

const EDITORIAL_BY_SLUG: Record<string, Partial<Record<BlogLocale, Partial<EditorialBlock>>>> = {
  "punta-cana-airport-transfer-guide-2026": {
    es: {
      planningTitle: "Plan de llegada profesional en PUJ",
      planningBody:
        "Si aterrizas en horario pico, un transfer privado reduce la friccion de llegada: menos espera, ruta directa y soporte local para imprevistos.",
      checklist: [
        "Comparar tiempo de traslado segun zona (Bavaro, Cap Cana, Uvero Alto).",
        "Confirmar equipaje especial (coche de bebe, tablas, maletas extra).",
        "Compartir numero de vuelo para monitoreo de retrasos.",
        "Definir punto de salida de retorno al aeropuerto."
      ],
      ctaHref: "/traslado",
      ctaLabel: "Consultar guia de traslado privado"
    }
  },
  "punta-cana-best-beaches-2026": {
    es: {
      planningTitle: "Que playa elegir segun tu estilo",
      planningBody:
        "Bavaro funciona para todo, Macao para aventura y Cap Cana para ritmo premium. Elegir bien la playa te ahorra traslados innecesarios.",
      checklist: [
        "Macao para buggy y ambiente natural.",
        "Bavaro para combinar playa + actividades.",
        "Cap Cana para parejas y dias tranquilos.",
        "Reservar excursion con pickup segun hotel."
      ]
    }
  },
  "punta-cana-family-trips-2026": {
    es: {
      planningTitle: "Viaje familiar sin estres",
      planningBody:
        "En viajes con ninos, la clave no es hacer mas tours, sino escoger mejor horarios, distancias y actividades con menor desgaste.",
      checklist: [
        "Priorizar tours de medio dia para evitar cansancio.",
        "Llevar snacks, agua y protector solar de repuesto.",
        "Coordinar asientos infantiles en traslados.",
        "Dejar una tarde libre entre actividades fuertes."
      ]
    }
  },
  "punta-cana-nightlife-guide-2026": {
    es: {
      planningTitle: "Noches de Punta Cana con logistica segura",
      planningBody:
        "El mejor plan nocturno combina party boat o show con transporte previamente coordinado, evitando improvisaciones al salir.",
      checklist: [
        "Revisar codigo de vestimenta del lugar.",
        "Definir transporte de ida y vuelta antes de salir.",
        "Reservar con antelacion en fines de semana.",
        "Evitar compras de ultima hora en puerta sin referencia."
      ]
    }
  },
  "punta-cana-weather-2026": {
    es: {
      planningTitle: "Clima y agenda: como ajustar tu itinerario",
      planningBody:
        "No se trata solo de la temporada; tambien importa el horario. Muchas excursiones rinden mejor en la manana por mar mas calmado.",
      checklist: [
        "Excursiones acuaticas temprano.",
        "Actividades urbanas o compras en dias de lluvia.",
        "Buffer de tiempo entre tours consecutivos.",
        "Confirmar politica de reprogramacion por clima."
      ]
    }
  },
  "punta-cana-couples-itinerary-2026": {
    es: {
      planningTitle: "Itinerario romantico que si funciona",
      planningBody:
        "Para parejas, menos traslados y mas calidad de experiencia. Combina una excursion premium y una actividad relajada para equilibrar energia.",
      checklist: [
        "Sunset catamaran o dinner experience.",
        "Un tour de isla con tiempo libre real.",
        "Traslado privado para horarios flexibles.",
        "Un dia completo sin agenda para resort y spa."
      ]
    }
  },
  "punta-cana-adventure-tours-2026": {
    es: {
      planningTitle: "Aventura sin improvisacion",
      planningBody:
        "Buggy, ATV y zipline exigen coordinacion de ropa, horarios y energia. Si lo organizas bien, disfrutas mas y reduces tiempos muertos.",
      checklist: [
        "Ropa de cambio y calzado cerrado.",
        "Tour de aventura en dia separado de party boat.",
        "Hidratacion y snacks antes de salir.",
        "Confirmar nivel de dificultad por grupo."
      ]
    }
  },
  "punta-cana-budget-tips-2026": {
    es: {
      planningTitle: "Ahorro inteligente, no ahorro riesgoso",
      planningBody:
        "Recortar costo no significa bajar calidad. El ahorro real viene de reservar con estructura: paquetes logicos y tiempos bien organizados.",
      checklist: [
        "Combinar traslados + tours para mejor tarifa final.",
        "Evitar intermediarios sin soporte postventa.",
        "Pedir precio total con impuestos incluidos.",
        "Comparar valor por experiencia, no solo numero final."
      ]
    }
  }
};

const getCoverImageForStaticPost = (post: StaticBlogPost) =>
  STATIC_POST_COVER_OVERRIDES[post.slug] ?? post.coverImage ?? "/fototours/fotosimple.jpg";

const getExcerptForStaticPost = (post: StaticBlogPost, locale: BlogLocale) => {
  const base = post.translations[locale].excerpt?.trim() ?? "";
  if (base.length >= 95) return base;
  return `${base} ${getEditorialBlock(post.slug, locale).planningBody}`.trim().slice(0, 190);
};

const getEditorialBlock = (slug: string, locale: BlogLocale): EditorialBlock => {
  const base = EDITORIAL_DEFAULT[locale];
  const overrides = EDITORIAL_BY_SLUG[slug]?.[locale] ?? {};
  return {
    ...base,
    ...overrides,
    checklist: overrides.checklist ?? base.checklist,
    mistakes: overrides.mistakes ?? base.mistakes
  };
};

const buildEditorialAppendix = (slug: string, locale: BlogLocale) => {
  if (slug === "punta-cana-travel-guide-2026") return "";
  const block = getEditorialBlock(slug, locale);
  const checklistHtml = block.checklist.map((item) => `<li>${item}</li>`).join("");
  const mistakesHtml = block.mistakes.map((item) => `<li>${item}</li>`).join("");
  return `
    <section>
      <h2>${block.planningTitle}</h2>
      <p>${block.intro}</p>
      <p>${block.planningBody}</p>
      <h3>${block.checklistTitle}</h3>
      <ul>${checklistHtml}</ul>
      <h3>${block.mistakesTitle}</h3>
      <ul>${mistakesHtml}</ul>
      <h3>${block.ctaTitle}</h3>
      <p>${block.ctaBody}</p>
      <p><a href="${block.ctaHref}">${block.ctaLabel}</a></p>
    </section>
  `;
};

const getStaticPost = (slug: string) => STATIC_POSTS.find((post) => post.slug === slug);

const NEWS_EDITORIAL_REPLACEMENTS: Array<[RegExp, string]> = [
  [/Reserva directo, compara opciones y evita intermediarios del hotel\./gi, "Compara opciones, verifica condiciones y documenta cada costo antes de decidir."],
  [/Reserva directo para asegurar precio fijo y confirmacion inmediata:/gi, "Como referencia operativa, consulta tambien:"],
  [/Reserva privado para evitar esperas y cargos sorpresa\./gi, "Para comprender la logistica de llegada, revisa el analisis de traslados privados."],
  [/Reserva primero el traslado y luego 2-3 excursiones clave\./gi, "Ordena primero la logistica de llegada y luego selecciona 2-3 excursiones clave."],
  [/Â¿Listo para organizar tu viaje\? Mira las opciones de/gi, "Para ampliar la planificacion, consulta las paginas internas sobre"],
  [/¿Listo para organizar tu viaje\? Mira las opciones de/gi, "Para ampliar la planificacion, consulta las paginas internas sobre"],
  [/reserva tu/gi, "revisa la guia de"],
  [/Reserva experiencias cerca de cada playa:/gi, "Recursos de contexto por playa:"],
  [/Reserva el party boat con antelacion:/gi, "Revisa ventanas de demanda para party boat:"],
  [/Reserva directo:/gi, "Recurso interno:"],
  [/reservar con seguridad/gi, "decidir con claridad"],
  [/reservas seguras/gi, "planificacion segura"],
  [/reservar ahora/gi, "consultar disponibilidad"],
  [/compra ahora/gi, "consulta disponibilidad"],
  [/asegura tu lugar/gi, "valida disponibilidad"],
  [/Book direct, compare options, and avoid hotel desk commissions\./gi, "Compare options, review conditions, and document each cost before deciding."],
  [/Book direct for fixed rates:/gi, "For operational context, review:"],
  [/Book the party boat early:/gi, "Review demand windows for party boats:"],
  [/Book direct:/gi, "Internal reference:"],
  [/Book your transfer first and then/gi, "Organize arrival logistics first and then select"],
  [/or reserve a/gi, "or review the"],
  [/book now/gi, "review availability"],
  [/secure your spot/gi, "review availability"],
  [/Reservation directe:/gi, "Reference interne:"],
  [/Reservez prive:/gi, "Reference logistique:"],
  [/Reservez le party boat:/gi, "Consultez les fenetres de demande pour le party boat:"],
  [/Reservez d'abord votre transfert/gi, "Organisez d'abord votre logistique d'arrivee"],
  [/reserver un/gi, "consulter un"]
];

const normalizeNewsEditorialTone = (html: string) =>
  NEWS_EDITORIAL_REPLACEMENTS.reduce(
    (normalized, [pattern, replacement]) => normalized.replace(pattern, replacement),
    html
  );

const renderBlogContent = (html: string) => (
  <div
    className="rounded-3xl border border-slate-200 bg-white p-6 font-serif text-[18px] leading-8 text-slate-800 shadow-sm md:p-8"
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

const AUTHOR_BOX_COPY = {
  es: {
    label: "Responsable editorial",
    title: EDITORIAL_AUTHOR_NAME,
    body:
      "Unidad central de analisis y difusion tecnica de Proactivitis. El departamento transforma datos de logistica, mercado y tecnologia en informacion accionable para viajeros y agencias aliadas.",
    link: "Ver equipo editorial",
    verify: "Verificar datos",
    ethics: "Etica editorial",
    contact: "Contacto de prensa"
  },
  en: {
    label: "Editorial responsibility",
    title: EDITORIAL_AUTHOR_NAME,
    body:
      "Proactivitis central technical analysis and publishing unit. The department turns logistics, market and technology data into actionable information for travelers and allied agencies.",
    link: "View editorial team",
    verify: "Verify data",
    ethics: "Editorial ethics",
    contact: "Press contact"
  },
  fr: {
    label: "Responsabilite editoriale",
    title: EDITORIAL_AUTHOR_NAME,
    body:
      "Unite centrale d'analyse technique et de publication de Proactivitis. Le departement transforme les donnees de logistique, marche et technologie en informations utiles.",
    link: "Voir l'equipe editoriale",
    verify: "Verifier les donnees",
    ethics: "Ethique editoriale",
    contact: "Contact presse"
  }
};

const renderEditorialAuthorBox = (locale: BlogLocale) => {
  const copy = AUTHOR_BOX_COPY[locale];
  const href = locale === "es" ? "/es/equipo-editorial" : locale === "fr" ? "/fr/equipe-editoriale" : "/en/editorial-team";
  return (
    <aside id="editorial-author" className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-6 shadow-sm">
      <div className="flex gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
          <Image src="/logo.png" alt="Proactivitis" fill sizes="56px" className="object-contain p-2" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sky-700">{copy.label}</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{copy.title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{copy.body}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={href} className="rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-bold text-sky-800">
          {copy.link}
        </Link>
        <Link href={`${href}#transparency`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700">
          {copy.verify}
        </Link>
        <Link href={`${href}#approach`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700">
          {copy.ethics}
        </Link>
        <a href="mailto:prensa@proactivitis.com" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700">
          {copy.contact}
        </a>
      </div>
    </aside>
  );
};

const LABELS = {
  es: {
    listTitle: "Proactivitis News & Market Intelligence",
    listSubtitle: "Analisis de mercado, logistica turistica, precios y senales operativas para viajeros y agencias.",
    newsroomEyebrow: "Newsroom institucional",
    tickerLabel: "Ultima hora",
    tickerItems: [
      "Monitoreo activo de tarifas, rutas y disponibilidad turistica.",
      "Sitemap de noticias actualizado cada hora para acelerar descubrimiento.",
      "Analisis editorial con supervision tecnica y enfoque de datos."
    ],
    marketTrends: "Tendencias de mercado",
    logisticsAlerts: "Alertas de logistica turistica",
    dataDesk: "Mesa de datos",
    trustLine: "Fact-checking, monitoreo de rutas y actualizaciones editoriales.",
    listEmpty: "Todavia no hay publicaciones.",
    listCta: "Leer articulo",
    detailComments: "Comentarios",
    detailEmptyComments: "Aun no hay comentarios aprobados.",
    detailTours: "Tours recomendados",
    detailHotels: "Hoteles recomendados",
    detailHotelsBody: "Seleccionados de nuestro inventario real con fotos cargadas por nuestro equipo.",
    analyzedBy: "Analizado por el Departamento de Inteligencia Editorial de Proactivitis",
    published: "Publicado",
    updated: "Actualizado",
    minutesAgo: "hace 2 horas",
    print: "Imprimir / PDF",
    caption: "Imagen editorial usada como referencia visual para el analisis turistico y logistico de Proactivitis.",
    sidebarTitle: "Inteligencia operativa",
    sidebarItems: ["Precios y disponibilidad", "Rutas y traslados", "Senales de demanda"],
    contextualTitle: "Recursos editoriales relacionados",
    contextualBody:
      "El newsroom enlaza guias internas cuando aportan contexto operativo sobre rutas, precios o destinos. Estos recursos no sustituyen la verificacion editorial del articulo.",
    contextualCta: "Ver archivo de noticias",
    articleBriefTitle: "Resumen ejecutivo",
    evidenceTitle: "Evidencia editorial",
    editorialProtocol: "Revision de datos, contexto de mercado y autor institucional.",
    sourceVerified: "Fuente verificada",
    crawlerReady: "Indexacion preparada",
    newsStandard: "Estandar NewsArticle",
    reportSections: "Secciones del reporte",
    navBrief: "Resumen ejecutivo",
    navAnalysis: "Analisis completo",
    navAuthor: "Autoridad editorial",
    newsroomNote: "Este reporte fue preparado para lectores, agencias y sistemas de busqueda que necesitan informacion clara, verificable y accionable."
  },
  en: {
    listTitle: "Proactivitis News & Market Intelligence",
    listSubtitle: "Tourism market analysis, logistics signals, pricing intelligence, and operational updates for travelers and agencies.",
    newsroomEyebrow: "Institutional newsroom",
    tickerLabel: "Breaking",
    tickerItems: [
      "Active monitoring of travel prices, routes, and availability signals.",
      "News sitemap refreshes hourly to support faster discovery.",
      "Editorial analysis with technical supervision and a data-first standard."
    ],
    marketTrends: "Market trends",
    logisticsAlerts: "Tourism logistics alerts",
    dataDesk: "Data desk",
    trustLine: "Fact-checking, route monitoring, and editorial updates.",
    listEmpty: "No posts yet.",
    listCta: "Read article",
    detailComments: "Comments",
    detailEmptyComments: "No approved comments yet.",
    detailTours: "Recommended tours",
    detailHotels: "Recommended hotels",
    detailHotelsBody: "Selected from our live inventory with images uploaded by our team.",
    analyzedBy: "Analyzed by the Proactivitis Editorial Intelligence Department",
    published: "Published",
    updated: "Updated",
    minutesAgo: "2 hours ago",
    print: "Print / PDF",
    caption: "Editorial image used as visual reference for Proactivitis tourism and logistics analysis.",
    sidebarTitle: "Operational intelligence",
    sidebarItems: ["Pricing and availability", "Routes and transfers", "Demand signals"],
    contextualTitle: "Related editorial resources",
    contextualBody:
      "The newsroom links internal guides when they add operational context on routes, pricing, or destinations. These resources do not replace the article's editorial verification.",
    contextualCta: "View news archive",
    articleBriefTitle: "Executive brief",
    evidenceTitle: "Editorial evidence",
    editorialProtocol: "Data review, market context, and institutional authorship.",
    sourceVerified: "Verified source",
    crawlerReady: "Indexing ready",
    newsStandard: "NewsArticle standard",
    reportSections: "Report sections",
    navBrief: "Executive brief",
    navAnalysis: "Full analysis",
    navAuthor: "Editorial authority",
    newsroomNote: "This report is prepared for readers, agencies, and search systems that need clear, verifiable, and actionable information."
  },
  fr: {
    listTitle: "Proactivitis News & Market Intelligence",
    listSubtitle: "Analyse du marche touristique, signaux logistiques, intelligence tarifaire et mises a jour operationnelles.",
    newsroomEyebrow: "Newsroom institutionnelle",
    tickerLabel: "Derniere minute",
    tickerItems: [
      "Surveillance active des prix, routes et signaux de disponibilite.",
      "Sitemap d'actualites actualise toutes les heures pour accelerer la decouverte.",
      "Analyse editoriale avec supervision technique et standard data-first."
    ],
    marketTrends: "Tendances du marche",
    logisticsAlerts: "Alertes de logistique touristique",
    dataDesk: "Bureau des donnees",
    trustLine: "Fact-checking, suivi des routes et mises a jour editoriales.",
    listEmpty: "Aucune publication pour le moment.",
    listCta: "Lire l'article",
    detailComments: "Commentaires",
    detailEmptyComments: "Aucun commentaire approuve pour le moment.",
    detailTours: "Tours recommandes",
    detailHotels: "Hotels recommandes",
    detailHotelsBody: "Selectionnes depuis notre inventaire reel avec des photos telechargees par notre equipe.",
    analyzedBy: "Analyse par le Departement d'intelligence editoriale de Proactivitis",
    published: "Publie",
    updated: "Mis a jour",
    minutesAgo: "il y a 2 heures",
    print: "Imprimer / PDF",
    caption: "Image editoriale utilisee comme reference visuelle pour l'analyse touristique et logistique de Proactivitis.",
    sidebarTitle: "Intelligence operationnelle",
    sidebarItems: ["Prix et disponibilite", "Routes et transferts", "Signaux de demande"],
    contextualTitle: "Ressources editoriales associees",
    contextualBody:
      "Le newsroom relie des guides internes lorsqu'ils ajoutent un contexte operationnel sur les routes, les prix ou les destinations. Ces ressources ne remplacent pas la verification editoriale de l'article.",
    contextualCta: "Voir les archives news",
    articleBriefTitle: "Synthese executive",
    evidenceTitle: "Preuves editoriales",
    editorialProtocol: "Verification des donnees, contexte marche et auteur institutionnel.",
    sourceVerified: "Source verifiee",
    crawlerReady: "Indexation preparee",
    newsStandard: "Standard NewsArticle",
    reportSections: "Sections du rapport",
    navBrief: "Synthese executive",
    navAnalysis: "Analyse complete",
    navAuthor: "Autorite editoriale",
    newsroomNote: "Ce rapport est prepare pour les lecteurs, agences et systemes de recherche qui exigent une information claire, verifiable et actionnable."
  }
};

type NewsArticleLayoutProps = {
  locale: BlogLocale;
  schema: unknown;
  title: string;
  excerpt: string;
  shareUrl: string;
  coverImage: string;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  contentHtml: string;
  children?: ReactNode;
};

const editorialTeamHref = (locale: BlogLocale) =>
  locale === "es" ? "/es/equipo-editorial" : locale === "fr" ? "/fr/equipe-editoriale" : "/en/editorial-team";

const toDate = (value?: Date | string | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatNewsDate = (value: Date | string | null | undefined, locale: BlogLocale) => {
  const date = toDate(value);
  if (!date) return "Proactivitis";
  const localeCode = locale === "es" ? "es-DO" : locale === "fr" ? "fr-FR" : "en-US";
  return new Intl.DateTimeFormat(localeCode, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

const swgLanguage = (locale: BlogLocale) =>
  locale === "es" ? "es-419" : locale === "fr" ? "fr" : "en";

const renderNewsSwgBasic = (locale: BlogLocale) => (
  <>
    <Script
      id="google-swg-basic"
      src="https://news.google.com/swg/js/v1/swg-basic.js"
      strategy="afterInteractive"
    />
    <Script
      id={`google-swg-basic-init-${locale}`}
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (self.SWG_BASIC = self.SWG_BASIC || []).push(function (basicSubscriptions) {
            basicSubscriptions.init({
              type: "NewsArticle",
              isPartOfType: ["Product"],
              isPartOfProductId: "CAowsJbgCw:openaccess",
              clientOptions: { theme: "light", lang: "${swgLanguage(locale)}" }
            });
          });
        `
      }}
    />
  </>
);

const renderReaderRevenueInlineCta = () => (
  <div
    className="news-print-hide rounded-3xl border border-sky-200 bg-white p-4 shadow-sm"
    dangerouslySetInnerHTML={{ __html: '<div rrm-inline-cta="7ea2ebda-cedd-43f9-8df4-a50def20fb99"></div>' }}
  />
);

const contextualHref = (locale: BlogLocale) =>
  locale === "es" ? "/news" : locale === "fr" ? "/fr/news" : "/en/news";

const renderContextualCta = (locale: BlogLocale) => {
  const labels = LABELS[locale];
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{labels.dataDesk}</p>
      <h2 className="mt-3 font-serif text-2xl font-black text-slate-950">{labels.contextualTitle}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{labels.contextualBody}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[labels.sourceVerified, labels.editorialProtocol, labels.newsStandard].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold leading-5 text-slate-700">
            {item}
          </div>
        ))}
      </div>
      <Link
        href={contextualHref(locale)}
        className="mt-5 inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:border-slate-950"
      >
        {labels.contextualCta}
      </Link>
    </aside>
  );
};

const renderNewsSidebar = (locale: BlogLocale) => {
  const labels = LABELS[locale];
  const sectionLinks = [
    { href: "#executive-brief", label: labels.navBrief },
    { href: "#analysis", label: labels.navAnalysis },
    { href: "#editorial-author", label: labels.navAuthor }
  ];
  return (
    <aside className="news-print-hide space-y-4 lg:sticky lg:top-24">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{labels.reportSections}</p>
        <nav className="mt-4 space-y-2">
          {sectionLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{labels.sidebarTitle}</p>
        <div className="mt-4 space-y-3">
          {labels.sidebarItems.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">{item}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{labels.trustLine}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-700">{labels.marketTrends}</p>
        <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-800">
          {labels.tickerItems.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
};

const renderNewsArticleLayout = ({
  locale,
  schema,
  title,
  excerpt,
  shareUrl,
  coverImage,
  publishedAt,
  updatedAt,
  contentHtml,
  children
}: NewsArticleLayoutProps) => {
  const labels = LABELS[locale];
  const editorialHref = editorialTeamHref(locale);
  const editorialContentHtml = normalizeNewsEditorialTone(contentHtml);
  return (
    <div className="travel-surface min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {renderNewsSwgBasic(locale)}
      <BlogReadingProgress locale={locale} />
      <article className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-700">{labels.newsroomEyebrow}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[labels.sourceVerified, labels.newsStandard, labels.crawlerReady].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-700">
                  {item}
                </span>
              ))}
            </div>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{excerpt}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <span>{labels.published}: {formatNewsDate(publishedAt, locale)}</span>
              <span className="text-slate-300">|</span>
              <span>{labels.updated}: {updatedAt ? formatNewsDate(updatedAt, locale) : labels.minutesAgo}</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <BlogShareButtons url={shareUrl} title={title} />
              <BlogArticleTools locale={locale} />
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-white">
              <Image src="/logo.png" alt="Proactivitis" fill sizes="56px" className="object-contain p-2" />
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-sky-300">{labels.dataDesk}</p>
            <h2 className="mt-3 text-2xl font-black leading-tight">{labels.analyzedBy}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{labels.trustLine}</p>
            <Link
              href={editorialHref}
              className="mt-5 inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-slate-950"
            >
              {AUTHOR_BOX_COPY[locale].link}
            </Link>
          </aside>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="space-y-8">
            <figure className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="relative h-[260px] w-full bg-slate-100 md:h-[420px]">
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-500">
                {labels.caption}
              </figcaption>
            </figure>

            <section id="executive-brief" className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-700">{labels.articleBriefTitle}</p>
                <h2 className="mt-3 font-serif text-3xl font-black leading-tight text-slate-950">{title}</h2>
                <p className="mt-4 text-base leading-8 text-slate-600">{excerpt}</p>
                <p className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700">
                  {labels.newsroomNote}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{labels.evidenceTitle}</p>
                <div className="mt-4 space-y-3">
                  {[labels.sourceVerified, labels.editorialProtocol, labels.trustLine].map((item) => (
                    <div key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {renderReaderRevenueInlineCta()}

            <section id="analysis" className="blog-content">{renderBlogContent(editorialContentHtml)}</section>
            <div className="news-print-hide">{renderContextualCta(locale)}</div>
            {renderEditorialAuthorBox(locale)}
            {children}
          </main>
          {renderNewsSidebar(locale)}
        </div>
      </article>
    </div>
  );
};

export async function getBlogList(locale: "es" | "en" | "fr") {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      translations: {
        where: { locale },
        select: { title: true, excerpt: true }
      }
    }
  });

  const normalizedPosts = posts.map((post) => {
    const translation = post.translations[0];
    return {
      ...post,
      title: translation?.title ?? post.title,
      excerpt: translation?.excerpt ?? post.excerpt
    };
  });

  const staticPosts = STATIC_POSTS.map((post) => ({
    id: post.id,
    title: post.translations[locale].title,
    slug: post.slug,
    excerpt: getExcerptForStaticPost(post, locale),
    coverImage: getCoverImageForStaticPost(post),
    publishedAt: post.publishedAt
  }));

  return [...staticPosts, ...normalizedPosts].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });
}

export async function buildBlogMetadata(locale: "es" | "en" | "fr"): Promise<Metadata> {
  const titleMap = {
    es: "Proactivitis News & Market Intelligence",
    en: "Proactivitis News & Market Intelligence",
    fr: "Proactivitis News & Market Intelligence"
  } as const;
  const descriptionMap = {
    es: "Newsroom institucional de Proactivitis con analisis de mercado, logistica turistica y actualizaciones operativas.",
    en: "Institutional Proactivitis newsroom for tourism market analysis, logistics intelligence, and operational updates.",
    fr: "Newsroom institutionnelle Proactivitis pour analyse marche, logistique touristique et mises a jour operationnelles."
  } as const;

  return {
    title: titleMap[locale],
    description: descriptionMap[locale],
    alternates: {
      canonical: locale === "es" ? `${BASE_URL}/news` : `${BASE_URL}/${locale}/news`,
      languages: {
        es: "/news",
        en: "/en/news",
        fr: "/fr/news"
      }
    }
  };
}

export async function buildBlogPostMetadata(slug: string, locale: "es" | "en" | "fr"): Promise<Metadata> {
  const staticPost = getStaticPost(slug);
  if (staticPost) {
    const translation = staticPost.translations[locale];
    const canonical =
      locale === "es" ? `${BASE_URL}/news/${staticPost.slug}` : `${BASE_URL}/${locale}/news/${staticPost.slug}`;
    return {
      title: translation.title,
      description: getExcerptForStaticPost(staticPost, locale),
      alternates: {
        canonical,
        languages: {
          es: `/news/${staticPost.slug}`,
          en: `/en/news/${staticPost.slug}`,
          fr: `/fr/news/${staticPost.slug}`
        }
      },
      openGraph: {
        type: "article",
        title: translation.title,
        description: translation.excerpt,
        url: canonical,
        publishedTime: staticPost.publishedAt.toISOString(),
        authors: [EDITORIAL_AUTHOR_URL],
        images: [{ url: getCoverImageForStaticPost(staticPost) }]
      }
    };
  }

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale }, select: { title: true, excerpt: true } }
    }
  });

  if (!post) {
    return { title: "Blog | Proactivitis" };
  }

  const translation = post.translations[0];
  const title = translation?.title ?? post.title;
  const description = translation?.excerpt ?? post.excerpt ?? post.title;
  const canonical = locale === "es" ? `${BASE_URL}/news/${post.slug}` : `${BASE_URL}/${locale}/news/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        es: `/news/${post.slug}`,
        en: `/en/news/${post.slug}`,
        fr: `/fr/news/${post.slug}`
      }
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      authors: [EDITORIAL_AUTHOR_URL],
      images: post.coverImage ? [{ url: post.coverImage }] : undefined
    }
  };
}

export async function renderBlogList(locale: "es" | "en" | "fr") {
  const labels = LABELS[locale];
  const posts = await getBlogList(locale);
  const listUrl = locale === "es" ? `${BASE_URL}/news` : `${BASE_URL}/${locale}/news`;
  const serializedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? null,
    coverImage: post.coverImage ?? null,
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null
  }));
  const listSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${listUrl}#webpage`,
        url: listUrl,
        name: labels.listTitle,
        description: labels.listSubtitle
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${listUrl}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "es" ? "Inicio" : locale === "fr" ? "Accueil" : "Home",
            item: locale === "es" ? `${BASE_URL}/` : `${BASE_URL}/${locale}`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: locale === "es" ? "Noticias" : locale === "fr" ? "Actualites" : "News",
            item: listUrl
          }
        ]
      },
      {
        "@type": "ItemList",
        "@id": `${listUrl}#posts`,
        itemListElement: serializedPosts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: locale === "es" ? `${BASE_URL}/news/${post.slug}` : `${BASE_URL}/${locale}/news/${post.slug}`,
          name: post.title
        }))
      }
    ]
  };

  return (
    <div className="travel-surface min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />
      <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative border-b border-white/10 bg-sky-500/10">
          <div className="mx-auto flex max-w-7xl gap-4 overflow-hidden px-4 py-3 text-xs font-bold uppercase tracking-[0.18em]">
            <span className="shrink-0 text-sky-300">{labels.tickerLabel}</span>
            <div className="flex min-w-0 gap-6 text-slate-200">
              {labels.tickerItems.map((item) => (
                <span key={item} className="whitespace-nowrap">{item}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1fr,360px]">
          <div className="space-y-5">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-sky-300">{labels.newsroomEyebrow}</p>
            <h1 className="max-w-4xl font-serif text-4xl font-black leading-tight md:text-6xl">{labels.listTitle}</h1>
            <p className="max-w-3xl text-base leading-8 text-slate-300">{labels.listSubtitle}</p>
            <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
              {[labels.sourceVerified, labels.crawlerReady, labels.newsStandard].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-black text-white">{item}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{labels.editorialProtocol}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[labels.marketTrends, labels.logisticsAlerts, labels.dataDesk].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{item}</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{labels.trustLine}</p>
              </div>
            ))}
          </aside>
        </div>
      </section>
      {posts.length === 0 ? (
        <main className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            {labels.listEmpty}
          </div>
        </main>
      ) : (
        <BlogLibraryClient locale={locale} posts={serializedPosts} />
      )}
    </div>
  );
}

export async function renderBlogDetail(slug: string, locale: "es" | "en" | "fr") {
  const labels = LABELS[locale];
  const staticPost = getStaticPost(slug);
  if (staticPost) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | null)?.id ?? null;
    const preference = userId
      ? await prisma.customerPreference.findUnique({
          where: { userId },
          select: {
            preferredCountries: true,
            preferredDestinations: true,
            completedAt: true,
            discountEligible: true,
            discountRedeemedAt: true
          }
        })
      : null;
    const preferredCountries = (preference?.preferredCountries as string[] | undefined) ?? [];
    const preferredDestinations = (preference?.preferredDestinations as string[] | undefined) ?? [];
    const applyPreferences =
      preference?.completedAt && (preferredCountries.length || preferredDestinations.length);
    const discountPercent =
      preference?.discountEligible && !preference?.discountRedeemedAt ? 10 : 0;
    const translation = staticPost.translations[locale];
    const staticCoverImage = getCoverImageForStaticPost(staticPost);
    const enrichedContentHtml = `${translation.contentHtml}${buildEditorialAppendix(staticPost.slug, locale)}`;
    const shareUrl =
      locale === "es"
        ? `${BASE_URL}/news/${staticPost.slug}`
        : `${BASE_URL}/${locale}/news/${staticPost.slug}`;
    const staticBlogSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "NewsArticle",
          "@id": `${shareUrl}#article`,
          mainEntityOfPage: shareUrl,
          headline: translation.title,
          description: translation.excerpt,
          datePublished: staticPost.publishedAt.toISOString(),
          dateModified: staticPost.publishedAt.toISOString(),
          author: EDITORIAL_AUTHOR_SCHEMA,
          publisher: {
            "@type": "Organization",
            name: "Proactivitis",
            logo: {
              "@type": "ImageObject",
              url: `${BASE_URL}/logo.png`
            }
          },
          image: {
            "@type": "ImageObject",
            url: `${BASE_URL}${staticCoverImage.startsWith("/") ? staticCoverImage : `/${staticCoverImage}`}`
          },
          articleSection: "Travel intelligence",
          isAccessibleForFree: true,
          inLanguage: locale
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${shareUrl}#breadcrumbs`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: locale === "es" ? "Inicio" : locale === "fr" ? "Accueil" : "Home",
              item: locale === "es" ? `${BASE_URL}/` : `${BASE_URL}/${locale}`
            },
            {
              "@type": "ListItem",
              position: 2,
              name: locale === "es" ? "Noticias" : locale === "fr" ? "Actualites" : "News",
              item: locale === "es" ? `${BASE_URL}/news` : `${BASE_URL}/${locale}/news`
            },
            {
              "@type": "ListItem",
              position: 3,
              name: translation.title,
              item: shareUrl
            }
          ]
        }
      ]
    };
    const relatedTours = await prisma.tour.findMany({
      where: {
        status: "published",
        slug: { not: "transfer-privado-proactivitis" },
        ...(applyPreferences
          ? {
              departureDestination: {
                is: {
                  ...(preferredCountries.length ? { country: { slug: { in: preferredCountries } } } : {}),
                  ...(preferredDestinations.length ? { slug: { in: preferredDestinations } } : {})
                }
              }
            }
          : {})
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 4,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        heroImage: true,
        location: true
      }
    });

    return renderNewsArticleLayout({
      locale,
      schema: staticBlogSchema,
      title: translation.title,
      excerpt: translation.excerpt,
      shareUrl,
      coverImage: staticCoverImage,
      publishedAt: staticPost.publishedAt,
      updatedAt: staticPost.publishedAt,
      contentHtml: enrichedContentHtml,
      children: (
        <>
          {relatedTours.length ? (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">{labels.detailTours}</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {relatedTours.map((tour) => (
                  <TourCard
                    key={tour.id}
                    slug={tour.slug}
                    title={tour.title}
                    location={tour.location ?? "Punta Cana"}
                    price={tour.price}
                    discountPercent={discountPercent}
                    image={tour.heroImage ?? "/fototours/fotosimple.jpg"}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{labels.detailComments}</h2>
            <p className="text-sm text-slate-500">{labels.detailEmptyComments}</p>
          </section>
        </>
      )
    });
  }

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      translations: {
        where: { locale },
        select: { title: true, excerpt: true, contentHtml: true }
      },
      tours: {
        select: {
          tour: {
            select: {
              id: true,
              slug: true,
              status: true,
              title: true,
              price: true,
              heroImage: true,
              location: true,
              departureDestination: {
                select: {
                  slug: true,
                  country: { select: { slug: true } }
                }
              }
            }
          }
        }
      },
      comments: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!post || post.status !== "PUBLISHED") {
    return null;
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | null)?.id ?? null;
  const preference = userId
    ? await prisma.customerPreference.findUnique({
        where: { userId },
        select: {
          preferredCountries: true,
          preferredDestinations: true,
          completedAt: true,
          discountEligible: true,
          discountRedeemedAt: true
        }
      })
    : null;
  const preferredCountries = (preference?.preferredCountries as string[] | undefined) ?? [];
  const preferredDestinations = (preference?.preferredDestinations as string[] | undefined) ?? [];
  const applyPreferences =
    preference?.completedAt && (preferredCountries.length || preferredDestinations.length);
  const discountPercent =
    preference?.discountEligible && !preference?.discountRedeemedAt ? 10 : 0;

  const translation = post.translations[0];
  const title = translation?.title ?? post.title;
  const excerpt = translation?.excerpt ?? post.excerpt ?? "";
  const contentHtml = translation?.contentHtml ?? post.contentHtml;
  const shareUrl = locale === "es" ? `${BASE_URL}/news/${post.slug}` : `${BASE_URL}/${locale}/news/${post.slug}`;
  const coverImageUrl = post.coverImage
    ? `${BASE_URL}${post.coverImage.startsWith("/") ? post.coverImage : `/${post.coverImage}`}`
    : `${BASE_URL}/fototours/fotosimple.jpg`;
  const publishedIso = post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString();
  const modifiedIso = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedIso;
  const dynamicBlogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${shareUrl}#article`,
        mainEntityOfPage: shareUrl,
        headline: title,
        description: excerpt,
        datePublished: publishedIso,
        dateModified: modifiedIso,
        author: EDITORIAL_AUTHOR_SCHEMA,
        publisher: {
          "@type": "Organization",
          name: "Proactivitis",
          logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/logo.png`
          }
        },
        image: {
          "@type": "ImageObject",
          url: coverImageUrl
        },
        articleSection: "Travel intelligence",
        isAccessibleForFree: true,
        inLanguage: locale
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${shareUrl}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "es" ? "Inicio" : locale === "fr" ? "Accueil" : "Home",
            item: locale === "es" ? `${BASE_URL}/` : `${BASE_URL}/${locale}`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: locale === "es" ? "Noticias" : locale === "fr" ? "Actualites" : "News",
            item: locale === "es" ? `${BASE_URL}/news` : `${BASE_URL}/${locale}/news`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: shareUrl
          }
        ]
      }
    ]
  };
  const relatedTours = post.tours
    .map((entry) => entry.tour)
    .filter((tour) => tour.status === "published");
  const showHotelCards = post.slug.startsWith("seo-");
  const seoHotelCards = showHotelCards
    ? await prisma.transferLocation.findMany({
        where: {
          type: "HOTEL",
          active: true,
          heroImage: {
            startsWith: "/uploads/"
          }
        },
        select: {
          id: true,
          slug: true,
          name: true,
          heroImage: true,
          address: true
        },
        orderBy: { name: "asc" },
        take: 8
      })
    : [];
  const filteredTours = applyPreferences
    ? relatedTours.filter((tour) => {
        const destination = tour.departureDestination;
        if (!destination) return false;
        const matchesCountry = preferredCountries.length
          ? preferredCountries.includes(destination.country?.slug ?? "")
          : true;
        const matchesDestination = preferredDestinations.length
          ? preferredDestinations.includes(destination.slug)
          : true;
        return matchesCountry && matchesDestination;
      })
    : relatedTours;

  return renderNewsArticleLayout({
    locale,
    schema: dynamicBlogSchema,
    title,
    excerpt,
    shareUrl,
    coverImage: post.coverImage ?? "/fototours/fotosimple.jpg",
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    contentHtml,
    children: (
      <>
        {filteredTours.length ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{labels.detailTours}</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {filteredTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  slug={tour.slug}
                  title={tour.title}
                  location={tour.location}
                  price={tour.price}
                  discountPercent={discountPercent}
                  image={tour.heroImage ?? "/fototours/fotosimple.jpg"}
                />
              ))}
            </div>
          </section>
        ) : null}

        {seoHotelCards.length ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{labels.detailHotels}</h2>
            <p className="text-sm text-slate-600">{labels.detailHotelsBody}</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {seoHotelCards.map((hotel) => {
                const href = locale === "es" ? `/hoteles/${hotel.slug}` : `/${locale}/hotels/${hotel.slug}`;
                return (
                  <Link
                    key={hotel.id}
                    href={href}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-44 w-full bg-slate-100">
                      <Image
                        src={hotel.heroImage ?? "/fototours/fotosimple.jpg"}
                        alt={hotel.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{hotel.name}</h3>
                      <p className="line-clamp-2 text-sm text-slate-600">
                        {hotel.address?.trim() || "Punta Cana, Republica Dominicana"}
                      </p>
                      <span className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                        Ver hotel
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">{labels.detailComments}</h2>
          <BlogCommentForm blogPostId={post.id} />
          <div className="space-y-3">
            {post.comments.length === 0 ? (
              <p className="text-sm text-slate-500">{labels.detailEmptyComments}</p>
            ) : (
              post.comments.map((comment) => (
                <article key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{comment.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(comment.createdAt).toLocaleDateString("es-ES")}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{comment.body}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </>
    )
  });
}
