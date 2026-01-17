export type ZoneHero = {
  title: string;
  subtitle: string;
  image?: string;
};

export type ZoneHighlight = string;

export type ZonePractical = {
  bestSeason: string;
  transport: string;
  localTip: string;
};

export type ZoneInfo = {
  country: string;
  countrySlug: string;
  zone: string;
  zoneSlug: string;
  hero: ZoneHero;
  summary: string;
  highlights: ZoneHighlight[];
  practical: ZonePractical;
};

export const zoneData: ZoneInfo[] = [
  {
    country: "Republica Dominicana",
    countrySlug: "dominican-republic",
    zone: "Punta Cana",
    zoneSlug: "punta-cana",
    hero: {
      title: "Sol, palmeras y cultura",
      subtitle:
        "Descubre el paraiso caribeno: playas de arena blanca, resorts y actividades para toda la familia.",
      image: "/fototours/puntacana-hero.jpg"
    },
    summary:
      "Punta Cana es un destino iconico del Caribe. Sus playas de arena blanca, aguas turquesa y ambiente de resort la convierten en la base ideal para descansar y explorar. Entre deportes acuaticos, vida nocturna y excursiones culturales, ofrece opciones para viajeros de todos los estilos.",
    highlights: [
      "Playas de arena blanca y agua color turquesa.",
      "Vida nocturna activa y centros comerciales frente al mar.",
      "Tours de aventura por el campo dominicano."
    ],
    practical: {
      bestSeason: "Noviembre a abril (temporada seca).",
      transport: "Aeropuerto de Punta Cana (PUJ) con conexion a hoteles y resorts.",
      localTip: "Pide guias locales para conocer plantaciones de cacao y cafe."
    }
  },
  {
    country: "Republica Dominicana",
    countrySlug: "dominican-republic",
    zone: "Bayahibe",
    zoneSlug: "bayahibe",
    hero: {
      title: "Costa autentica y acceso a Saona",
      subtitle:
        "Un puerto tranquilo y pintoresco, puerta de entrada a la Isla Saona y arrecifes de coral espectaculares.",
      image: "/fototours/bayahibe-hero.jpg"
    },
    summary:
      "Bayahibe ofrece una experiencia dominicana mas relajada y autentica. Este antiguo pueblo de pescadores es el punto de salida hacia Isla Saona e Isla Catalina, y es ideal para snorkel y buceo gracias a sus aguas tranquilas. Es perfecto para quienes buscan playas virgenes y cultura local.",
    highlights: [
      "Catamaranes diarios a la isla Saona.",
      "Buceo y snorkel en arrecifes cercanos.",
      "Ambiente relajado frente al mar."
    ],
    practical: {
      bestSeason: "Todo el ano; ideal de diciembre a marzo.",
      transport: "Transfer desde Punta Cana o La Romana; taxis y motoconchos locales.",
      localTip: "Visita el pueblo antes del tour para probar pescado fresco."
    }
  },
  {
    country: "Republica Dominicana",
    countrySlug: "dominican-republic",
    zone: "Samana",
    zoneSlug: "samana",
    hero: {
      title: "Bahia de ballenas y naturaleza exuberante",
      subtitle:
        "Santuario natural de la RD: ballenas jorobadas, cascadas escondidas y playas virgenes.",
      image: "/fototours/samana-hero.jpg"
    },
    summary:
      "La Peninsula de Samana es ideal para amantes de la naturaleza. Es famosa por la temporada de ballenas jorobadas y por paisajes que combinan montana, rios y playas. Explora la Cascada El Limon y relaja en Cayo Levantado con un ambiente mas tranquilo que los grandes resorts.",
    highlights: [
      "Avistamiento de ballenas (enero a marzo).",
      "Excursiones a El Limon y Cayo Levantado.",
      "Cultura local en comunidades costeras."
    ],
    practical: {
      bestSeason: "Enero a marzo para ballenas; abril a julio para clima calido.",
      transport: "Vuelos o transfer desde Santo Domingo; carretera costera panoramica.",
      localTip: "Contrata guias certificados para tours de ballenas y cascadas."
    }
  },
  {
    country: "Republica Dominicana",
    countrySlug: "dominican-republic",
    zone: "Macao",
    zoneSlug: "macao",
    hero: {
      title: "Playas doradas y aventuras en buggy",
      subtitle:
        "La costa salvaje de Punta Cana con tours de buggy y una de las playas publicas mas famosas.",
      image: "/fototours/macao-hero.jpg"
    },
    summary:
      "Macao es el lado aventurero de Punta Cana. Sus playas abiertas y caminos rurales son el escenario favorito para tours en buggy y ATV. Es una zona autentica, ideal para viajeros que quieren combinar mar, adrenalina y paisajes naturales.",
    highlights: [
      "Tours de buggy y ATV por caminos rurales.",
      "Playa publica con olas suaves para surf.",
      "Ambiente local y menos masivo."
    ],
    practical: {
      bestSeason: "Diciembre a abril para clima seco.",
      transport: "Pickup desde Punta Cana, Bavaro y hoteles cercanos.",
      localTip: "Haz el tour de buggy temprano para evitar el calor."
    }
  }
];

export function getZoneInfo(countrySlug: string, zoneSlug: string): ZoneInfo | undefined {
  return zoneData.find((zone) => zone.countrySlug === countrySlug && zone.zoneSlug === zoneSlug);
}
