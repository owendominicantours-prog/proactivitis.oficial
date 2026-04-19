import { PROACTIVITIS_URL } from "@/lib/seo";
import type { BayahibeBuggyLandingContent } from "@/lib/bayahibeBuggyLanding";

export const bayahibeBuggyLandingAlternates = {
  languages: {
    es: "/tour-buggy-bayahibe-la-romana",
    en: "/en/tour-buggy-bayahibe-la-romana",
    fr: "/fr/tour-buggy-bayahibe-la-romana"
  }
} as const;

export const bayahibeBuggyLandingContent: Record<"es" | "en" | "fr", BayahibeBuggyLandingContent> = {
  es: {
    locale: "es",
    pageUrl: `${PROACTIVITIS_URL}/tour-buggy-bayahibe-la-romana`,
    title: "Tour Buggy desde Bayahibe La Romana | Rio, Bateyes y Aventura Off Road",
    description:
      "Reserva tu tour buggy desde Bayahibe o La Romana. Recorre caminos off road, visita bateyes locales, banate en el rio Chavon y vive una experiencia dominicana autentica.",
    ogLocale: "es_DO",
    pageName: "Tour Buggy desde Bayahibe La Romana: Aventura Off Road, Rio y Cultura Local",
    subheadline: "Conduce entre canaverales, explora comunidades locales y banate en el famoso rio Chavon.",
    intro:
      "Esta experiencia en buggy desde Bayahibe y La Romana esta pensada para viajeros que buscan algo mas real que una excursion generica de resort. Mezcla aventura, paisaje rural, bateyes y naturaleza en una sola salida.",
    heroBadge: "Aventura off road en La Romana",
    navAvailability: "Ver disponibilidad",
    primaryCta: "Reservar ahora",
    secondaryCta: "Ver disponibilidad",
    whatsappCta: "Consultar por WhatsApp",
    microBenefits: ["Incluye recogida en hotel", "No necesitas experiencia", "Grupos pequenos"],
    quickFacts: "Datos rapidos",
    priceFrom: "Precio desde",
    durationLabel: "Duracion",
    areaLabel: "Zona",
    areaValue: "Bayahibe / La Romana",
    seoEyebrow: "Intro SEO",
    seoHeading: "Un tour en buggy en Bayahibe y La Romana que se siente real, no armado para turistas",
    seoParagraphs: [
      "Muchos viajeros que buscan buggy tour Bayahibe, buggy La Romana o cosas que hacer en Bayahibe no quieren una actividad artificial. Quieren una excursion conectada con el destino, con caminos de tierra, paisaje rural y una sensacion autentica de Republica Dominicana.",
      "Esta ruta destaca porque sale de la burbuja hotelera y te lleva por terreno off road, canaverales, bateyes y el entorno del rio Chavon. Eso la hace especialmente atractiva para quienes se alojan en Bayahibe o La Romana y quieren una experiencia distinta a Punta Cana.",
      "Desde el punto de vista comercial, esta landing responde a las preguntas clave detras de busquedas como Bayahibe excursions, La Romana buggy tour, off road Dominican Republic o Chavon River tour: que incluye, cuanto dura, si hay transporte y por que vale la pena reservarla."
    ],
    seoCards: [
      "Ruta dominicana autentica y no solo una actividad para turistas.",
      "Terreno off road con canaverales, vistas rurales y parada en rio.",
      "Muy buena opcion para viajeros alojados en Bayahibe o La Romana.",
      "Aventura, cultura y naturaleza en una sola excursion."
    ],
    seoCardEyebrow: "Por que importa",
    experienceHeading: "Esto es mucho mas que un paseo en buggy",
    experienceParagraphs: [
      "Lo mejor de esta excursion es que no depende solo de la velocidad. Si, tienes buggy, barro y caminos de tierra, pero la ruta tambien aporta contexto local real. Pasas por plantaciones de cana, ves paisajes propios del sureste dominicano y haces una parada en bateyes que anade una capa cultural al recorrido.",
      "Ese lado cultural cambia el tono de la experiencia. En lugar de sentirse como un circuito cerrado con fotos preparadas, el tour te muestra tierra trabajada, caminos rurales y comunidades ligadas a la historia agricola de la zona.",
      "La parada en el rio Chavon es otro diferenciador fuerte. Equilibra la conduccion con un momento natural y refrescante, y hace que la excursion se sienta mas completa que un producto de buggy sin mas."
    ],
    experienceCards: [
      "Conduccion off road por caminos de tierra y barro",
      "Paisajes de canaverales y una ruta menos saturada que Punta Cana",
      "Bateyes y cultura local con una atmosfera mas real",
      "Rio, degustacion local y una aventura completa de medio dia"
    ],
    itineraryHeading: "Itinerario real desde la recogida hasta el regreso",
    itinerary: [
      { title: "1. Recogida en hotel", copy: "La experiencia empieza con la recogida desde hoteles seleccionados de Bayahibe o La Romana." },
      { title: "2. Llegada al rancho", copy: "En el rancho haces check-in, conoces al equipo y te preparas para la parte off road." },
      { title: "3. Instrucciones de manejo", copy: "Los guias explican el buggy, la ruta, el ritmo y los puntos basicos de seguridad." },
      { title: "4. Inicio del recorrido", copy: "Empieza la ruta por caminos de tierra, terreno irregular y paisaje rural dominicano." },
      { title: "5. Bateyes y cultura local", copy: "Una de las paradas clave acerca al viajero a bateyes y al contexto local de la region." },
      { title: "6. Bano en el rio Chavon", copy: "La parada en el rio aporta frescura, paisaje y un contraste muy bueno con la parte polvorienta del buggy." },
      { title: "7. Degustacion local", copy: "Segun la operacion, puedes encontrar cafe, cacao, frutas u otros sabores dominicanos." },
      { title: "8. Regreso", copy: "Despues de la ruta y las paradas vuelves al rancho y regresas a tu hotel." }
    ],
    includesHeading: "Que incluye",
    includesItems: [
      "Recogida en hotel",
      "Buggy compartido o privado segun opcion",
      "Equipo de seguridad",
      "Guia profesional",
      "Agua embotellada",
      "Frutas o degustacion local"
    ],
    keyInfoHeading: "Informacion clave antes de reservar",
    keyInfoItems: [
      { label: "Duracion", value: "3-4 horas" },
      { label: "Ubicacion", value: "Bayahibe / La Romana" },
      { label: "Idiomas", value: "Ingles / Espanol" },
      { label: "Dificultad", value: "Facil" },
      { label: "Edad", value: "Desde aprox. 5+" },
      { label: "Tipo de tour", value: "Aventura + cultura + naturaleza" }
    ],
    whyHeading: "Por que este tour destaca frente a otras excursiones en Bayahibe",
    whyItems: [
      "Experiencia dominicana autentica con contexto cultural",
      "Sensacion menos saturada que muchos tours de buggy en Punta Cana",
      "Terreno off road real y no un simple traslado panoramico",
      "Paisajes naturales marcados por canaverales y entorno de rio",
      "Plan equilibrado de medio dia con accion, agua e inmersion local"
    ],
    galleryEyebrow: "Galeria",
    galleryHeading: "Asi se ve y se siente esta ruta en buggy",
    galleryCaptions: ["Barro y accion", "Canaverales", "Parada en rio", "Caminos locales", "Viajeros disfrutando"],
    travelerHeading: "Lo que hace que los viajeros elijan esta ruta",
    travelerCards: [
      {
        title: "Mas autentica que otros polos de buggy",
        copy: "Quienes buscan una ruta con mas identidad local suelen preferir Bayahibe y La Romana frente a circuitos mas saturados."
      },
      {
        title: "La parada en el rio cambia la experiencia",
        copy: "El Chavon anade paisaje, frescura y una capa natural mucho mas fuerte que un recorrido de solo conduccion."
      },
      {
        title: "Muy buena opcion para viajeros internacionales",
        copy: "Si buscas terreno off road, contexto local real y una excursion de medio dia manejable, esta es una de las mejores opciones para comparar."
      }
    ],
    faqHeading: "Preguntas frecuentes",
    faqItems: [
      { q: "Necesito experiencia para conducir el buggy?", a: "No. El tour es apto para principiantes y recibes instrucciones antes de salir." },
      { q: "Voy a ensuciarme?", a: "Lo mas probable es que si. El barro, el polvo y el terreno irregular forman parte de la experiencia." },
      { q: "Incluye transporte desde Bayahibe o La Romana?", a: "Si. La recogida suele estar incluida desde hoteles seleccionados de Bayahibe y La Romana." },
      { q: "Es seguro el tour en buggy?", a: "Si. La ruta opera con guias, briefing previo y equipo basico de seguridad segun la operacion." },
      { q: "Que ropa debo llevar?", a: "Ropa ligera que pueda ensuciarse, calzado comodo, protector solar, gafas y cambio de ropa." },
      { q: "Pueden ir ninos?", a: "Si. Los ninos suelen poder participar como pasajeros, mientras que los conductores deben cumplir las reglas del operador." }
    ],
    finalHeading: "Reserva hoy tu aventura en buggy desde Bayahibe",
    finalEyebrow: "Disponibilidad limitada en temporada alta",
    finalBody:
      "Si quieres un tour en buggy desde Bayahibe o La Romana que se sienta mas autentico, menos masivo y mas conectado con el paisaje, esta es una opcion muy solida para reservar directamente con Proactivitis.",
    trustEyebrow: "Proactivitis",
    trustHeading: "Informacion de viaje con claridad de reserva",
    trustParagraphs: [
      "Esta pagina esta publicada por Proactivitis y pensada para ayudar a viajeros internacionales a comparar excursiones en Bayahibe con informacion clara, contenido estructurado y acceso directo a la reserva.",
      "El schema de reviews no se ha incluido porque esta pagina no muestra un conjunto publico y verificable de resenas reales."
    ],
    visibleDataHeading: "Datos visibles del negocio",
    brandLabel: "Marca",
    emailLabel: "Email",
    phoneLabel: "Telefono",
    whatsappLabel: "WhatsApp",
    usefulLinksLabel: "Enlaces utiles",
    directContactLabel: "Contacto directo",
    allToursLabel: "Todos los tours",
    contactLabel: "Contacto",
    footer: "Copyright 2026 Proactivitis. Todos los derechos reservados.",
    organizationDescription:
      "Proactivitis selecciona tours y experiencias en Republica Dominicana con informacion clara, rutas de reserva directas y contenido practico para viajeros internacionales.",
    breadcrumbHome: "Inicio",
    breadcrumbTours: "Tours",
    breadcrumbCurrent: "Tour Buggy Bayahibe La Romana",
    serviceName: "Tour Buggy desde Bayahibe La Romana",
    serviceType: "Tour buggy off road en Bayahibe y La Romana",
    availableLanguages: ["Spanish", "English"],
    tripDescription:
      "Una aventura en buggy por canaverales, bateyes y el rio Chavon cerca de Bayahibe y La Romana.",
    itinerarySchema: [
      "Recogida en hotel",
      "Llegada al rancho",
      "Instrucciones de manejo",
      "Recorrido buggy off road",
      "Parada en bateyes y cultura local",
      "Bano en el rio Chavon",
      "Degustacion local",
      "Regreso"
    ],
    audienceTypes: ["Parejas", "Familias", "Viajeros de aventura", "Grupos pequenos"],
    localeLinks: {
      home: "/",
      tours: "/tours",
      contact: "/contact"
    }
  },
  en: {
    locale: "en",
    pageUrl: `${PROACTIVITIS_URL}/en/tour-buggy-bayahibe-la-romana`,
    title: "Buggy Tour from Bayahibe La Romana | River, Bateyes & Off Road Adventure",
    description:
      "Book your buggy tour from Bayahibe or La Romana. Drive through off-road trails, visit local bateyes, swim in Chavon River and enjoy an authentic Dominican experience.",
    ogLocale: "en_US",
    pageName: "Buggy Tour from Bayahibe La Romana: Off Road Adventure, River & Local Culture",
    subheadline: "Drive through sugarcane fields, explore local villages and swim in the famous Chavon River.",
    intro:
      "This buggy experience from Bayahibe and La Romana is built for travelers who want more than a generic resort excursion. It mixes off-road action, sugarcane landscapes, local bateyes, river time and a slower, more authentic look at the Dominican countryside.",
    heroBadge: "Off road Dominican Republic",
    navAvailability: "Check Availability",
    primaryCta: "Book Now",
    secondaryCta: "Check Availability",
    whatsappCta: "Ask on WhatsApp",
    microBenefits: ["Hotel pickup included", "No experience required", "Small groups"],
    quickFacts: "Quick facts",
    priceFrom: "Price from",
    durationLabel: "Duration",
    areaLabel: "Area",
    areaValue: "Bayahibe / La Romana",
    seoEyebrow: "SEO intro",
    seoHeading: "A buggy tour in Bayahibe and La Romana that feels real, not staged",
    seoParagraphs: [
      "Many travelers searching for buggy tour Bayahibe, buggy La Romana or things to do in Bayahibe are not looking for a polished resort-style attraction. They want an excursion that actually feels tied to the destination.",
      "This route stands out because it leaves behind the polished hotel bubble and takes you into off-road terrain, sugarcane areas, rural communities and the Chavon River environment.",
      "From an SEO and conversion perspective, this page answers the buying questions behind searches such as Bayahibe excursions, La Romana buggy tour, off road Dominican Republic and Chavon River tour."
    ],
    seoCards: [
      "Authentic Dominican route instead of a purely tourist setup",
      "Off-road terrain with rural views, sugarcane fields and river stop",
      "A strong option for travelers staying closer to Bayahibe or La Romana",
      "Adventure, culture and nature in one experience"
    ],
    seoCardEyebrow: "Why it matters",
    experienceHeading: "This is more than a buggy ride",
    experienceParagraphs: [
      "The best part of this excursion is that it does not rely on speed alone. Yes, you get the buggy, the dirt roads and the splashes of mud that make an off-road tour memorable, but the route also brings in the kind of local context that many travelers hope to find and rarely do.",
      "That cultural side changes the tone of the tour. Instead of feeling like a closed circuit with staged photo spots, the experience gives you a view of working land, rural roads and communities tied to the region's agricultural history.",
      "The Chavon River stop is another key differentiator. It balances the ride with a refreshing natural pause and makes the excursion feel broader than a buggy-only product."
    ],
    experienceCards: [
      "Off-road buggy driving through dirt and muddy tracks",
      "Sugarcane landscapes and a route that feels less crowded than Punta Cana",
      "Bateyes and local culture with a more grounded Dominican atmosphere",
      "River stop, local tasting and a full half-day adventure"
    ],
    itineraryHeading: "Real tour itinerary from pickup to return",
    itinerary: [
      { title: "1. Hotel pickup", copy: "Your experience starts with pickup from selected Bayahibe or La Romana hotels." },
      { title: "2. Arrival at the ranch", copy: "At the ranch you check in, meet the team and get ready for the off-road portion." },
      { title: "3. Driving instructions", copy: "Guides explain the buggy, the route, the pace and the main safety points." },
      { title: "4. Start of the buggy ride", copy: "The route begins with dirt roads, uneven terrain and a true countryside feel." },
      { title: "5. Bateyes and local culture", copy: "One of the key stops introduces travelers to bateyes and the local social setting." },
      { title: "6. Chavon River swim", copy: "The river stop adds freshness, scenery and contrast to the dusty buggy ride." },
      { title: "7. Local tasting", copy: "Depending on operations, you may enjoy coffee, cacao, fruits or other Dominican tasting elements." },
      { title: "8. Return transfer", copy: "After the route and stops, you return to the ranch and then to your hotel." }
    ],
    includesHeading: "What's included",
    includesItems: [
      "Hotel pickup",
      "Buggy shared or private depending on option",
      "Safety equipment",
      "Professional guide",
      "Bottled water",
      "Fruits or local tasting"
    ],
    keyInfoHeading: "Key info before you book",
    keyInfoItems: [
      { label: "Duration", value: "3-4 hours" },
      { label: "Location", value: "Bayahibe / La Romana" },
      { label: "Languages", value: "English / Spanish" },
      { label: "Difficulty", value: "Easy" },
      { label: "Age", value: "From around 5+" },
      { label: "Tour style", value: "Adventure + culture + nature" }
    ],
    whyHeading: "Why this tour stands out from other Bayahibe excursions",
    whyItems: [
      "Authentic Dominican experience with cultural context",
      "Less crowded feeling than many Punta Cana buggy tours",
      "Real off-road terrain instead of a flat scenic transfer",
      "Natural landscapes shaped by sugarcane fields and river scenery",
      "A balanced half-day plan with action, water and local immersion"
    ],
    galleryEyebrow: "Gallery",
    galleryHeading: "What this buggy route looks and feels like",
    galleryCaptions: ["Mud and buggy action", "Sugarcane landscapes", "River stop", "Local road sections", "Travelers enjoying the ride"],
    travelerHeading: "What makes travelers choose this route",
    travelerCards: [
      {
        title: "More authentic than bigger buggy hubs",
        copy: "Travelers looking for a route with more local character often prefer Bayahibe and La Romana over more saturated buggy circuits."
      },
      {
        title: "The river stop changes the experience",
        copy: "The Chavon River break adds scenery, freshness and a stronger nature component than a ride-only format."
      },
      {
        title: "A strong fit for international visitors",
        copy: "If you want off-road terrain, real local context and a manageable half-day excursion, this is one of the best tours to compare."
      }
    ],
    faqHeading: "Frequently asked questions",
    faqItems: [
      { q: "Do I need experience to drive the buggy?", a: "No. This tour is beginner-friendly and includes instructions before departure." },
      { q: "Will I get dirty during the tour?", a: "Most likely yes. Mud, dust and uneven terrain are part of the off-road fun." },
      { q: "Is transport included from Bayahibe or La Romana?", a: "Yes. Hotel pickup is usually included from selected properties in Bayahibe and La Romana." },
      { q: "Is the buggy tour safe?", a: "Yes. The route operates with guides, a briefing before departure and basic safety gear where applicable." },
      { q: "What should I wear?", a: "Wear light clothes that can get dirty, comfortable footwear, sunscreen, sunglasses and a change of clothes." },
      { q: "Can kids join this excursion?", a: "Yes. Children can usually join as passengers, while drivers must follow the operator's rules." }
    ],
    finalHeading: "Book your buggy adventure from Bayahibe today",
    finalEyebrow: "Limited availability during high season",
    finalBody:
      "If you want a buggy tour from Bayahibe or La Romana that feels more authentic, less crowded and more connected to the landscape, this is a strong option to book directly with Proactivitis.",
    trustEyebrow: "Proactivitis",
    trustHeading: "Travel information with booking clarity",
    trustParagraphs: [
      "This page is published by Proactivitis and built to help international travelers compare Bayahibe excursions with clear information, structured content and direct booking access.",
      "Review schema has intentionally been omitted because no real public review dataset is displayed on this page."
    ],
    visibleDataHeading: "Visible business data",
    brandLabel: "Brand",
    emailLabel: "Email",
    phoneLabel: "Phone",
    whatsappLabel: "WhatsApp",
    usefulLinksLabel: "Useful links",
    directContactLabel: "Direct contact",
    allToursLabel: "All tours",
    contactLabel: "Contact",
    footer: "Copyright 2026 Proactivitis. All rights reserved.",
    organizationDescription:
      "Proactivitis curates tours and travel experiences across the Dominican Republic with clear booking paths and practical information for international travelers.",
    breadcrumbHome: "Home",
    breadcrumbTours: "Tours",
    breadcrumbCurrent: "Buggy Tour Bayahibe La Romana",
    serviceName: "Buggy Tour from Bayahibe La Romana",
    serviceType: "Off-road buggy tour in Bayahibe and La Romana",
    availableLanguages: ["English", "Spanish"],
    tripDescription:
      "An off-road buggy adventure through sugarcane fields, local bateyes and Chavon River near Bayahibe and La Romana.",
    itinerarySchema: [
      "Hotel pickup",
      "Arrival at the ranch",
      "Driving instructions",
      "Off-road buggy route",
      "Bateyes and local culture stop",
      "Chavon River swim stop",
      "Local tasting",
      "Return transfer"
    ],
    audienceTypes: ["Couples", "Families", "Adventure travelers", "Small groups"],
    localeLinks: {
      home: "/en",
      tours: "/en/tours",
      contact: "/en/contact"
    }
  },
  fr: {
    locale: "fr",
    pageUrl: `${PROACTIVITIS_URL}/fr/tour-buggy-bayahibe-la-romana`,
    title: "Tour Buggy depuis Bayahibe La Romana | Riviere, Bateyes et Aventure Off Road",
    description:
      "Reservez votre tour buggy depuis Bayahibe ou La Romana. Parcourez des pistes off road, visitez des bateyes locaux, nagez dans le rio Chavon et vivez une experience dominicaine authentique.",
    ogLocale: "fr_FR",
    pageName: "Tour Buggy depuis Bayahibe La Romana: Aventure Off Road, Riviere et Culture Locale",
    subheadline: "Roulez entre les champs de canne, explorez des villages locaux et baignez-vous dans le celebre rio Chavon.",
    intro:
      "Cette experience en buggy depuis Bayahibe et La Romana est pensee pour les voyageurs qui veulent plus qu'une excursion generique de resort. Elle melange aventure, paysages ruraux, bateyes et nature en une seule sortie.",
    heroBadge: "Aventure off road en Republique dominicaine",
    navAvailability: "Voir disponibilite",
    primaryCta: "Reserver maintenant",
    secondaryCta: "Voir disponibilite",
    whatsappCta: "Consulter sur WhatsApp",
    microBenefits: ["Pickup hotel inclus", "Aucune experience necessaire", "Petits groupes"],
    quickFacts: "Infos rapides",
    priceFrom: "Prix a partir de",
    durationLabel: "Duree",
    areaLabel: "Zone",
    areaValue: "Bayahibe / La Romana",
    seoEyebrow: "Intro SEO",
    seoHeading: "Un tour buggy a Bayahibe et La Romana qui semble reel, pas mis en scene",
    seoParagraphs: [
      "De nombreux voyageurs qui cherchent buggy tour Bayahibe, buggy La Romana ou activites a faire a Bayahibe ne veulent pas une attraction touristique artificielle. Ils veulent une excursion connectee au lieu.",
      "Cet itineraire se distingue parce qu'il sort de la bulle hoteliere et vous mene sur du terrain off road, des zones de canne a sucre, des communautes rurales et l'environnement du rio Chavon.",
      "D'un point de vue SEO et conversion, cette page repond aux questions derriere les recherches comme Bayahibe excursions, La Romana buggy tour, off road Dominican Republic ou Chavon River tour."
    ],
    seoCards: [
      "Itineraire dominicain authentique au lieu d'une activite purement touristique",
      "Terrain off road avec vues rurales, canaverales et arret riviere",
      "Tres bonne option pour les voyageurs logeant a Bayahibe ou La Romana",
      "Aventure, culture et nature dans une seule excursion"
    ],
    seoCardEyebrow: "Pourquoi c'est important",
    experienceHeading: "C'est bien plus qu'un simple tour en buggy",
    experienceParagraphs: [
      "Le meilleur de cette excursion est qu'elle ne repose pas seulement sur la vitesse. Oui, il y a le buggy, les pistes de terre et les eclaboussures de boue, mais l'itineraire apporte aussi un vrai contexte local.",
      "Ce cote culturel change le ton du tour. Au lieu d'un circuit ferme avec des photos mises en scene, l'experience vous montre des terres travaillees, des routes rurales et des communautes liees a l'histoire agricole de la region.",
      "L'arret au rio Chavon est un autre vrai point fort. Il equilibre la conduite avec une pause naturelle et rafraichissante et rend l'excursion plus complete qu'un produit de buggy sans plus."
    ],
    experienceCards: [
      "Conduite buggy off road sur pistes de terre et de boue",
      "Paysages de canne a sucre et itineraire moins charge que Punta Cana",
      "Bateyes et culture locale avec une ambiance plus authentique",
      "Riviere, degustation locale et vraie aventure de demi-journee"
    ],
    itineraryHeading: "Itineraire reel du pickup au retour",
    itinerary: [
      { title: "1. Pickup hotel", copy: "L'experience commence par la prise en charge depuis des hotels selectionnes de Bayahibe ou La Romana." },
      { title: "2. Arrivee au ranch", copy: "Au ranch, vous faites le check-in, rencontrez l'equipe et vous preparez la partie off road." },
      { title: "3. Instructions de conduite", copy: "Les guides expliquent le buggy, l'itineraire, le rythme et les points essentiels de securite." },
      { title: "4. Debut du parcours", copy: "La route commence sur des pistes de terre, un terrain irregulier et un vrai decor de campagne dominicaine." },
      { title: "5. Bateyes et culture locale", copy: "L'un des arrets cles fait decouvrir les bateyes et le contexte social local de la region." },
      { title: "6. Baignade dans le rio Chavon", copy: "L'arret riviere apporte fraicheur, paysage et un contraste tres agreable avec la partie poussiereuse du buggy." },
      { title: "7. Degustation locale", copy: "Selon l'operation, vous pouvez trouver cafe, cacao, fruits ou autres saveurs dominicaines." },
      { title: "8. Retour", copy: "Apres le parcours et les arrets, vous revenez au ranch puis a votre hotel." }
    ],
    includesHeading: "Ce qui est inclus",
    includesItems: [
      "Pickup hotel",
      "Buggy partage ou prive selon l'option",
      "Equipement de securite",
      "Guide professionnel",
      "Eau en bouteille",
      "Fruits ou degustation locale"
    ],
    keyInfoHeading: "Informations cles avant de reserver",
    keyInfoItems: [
      { label: "Duree", value: "3-4 heures" },
      { label: "Lieu", value: "Bayahibe / La Romana" },
      { label: "Langues", value: "Anglais / Espagnol" },
      { label: "Difficulte", value: "Facile" },
      { label: "Age", value: "A partir d'environ 5+" },
      { label: "Style de tour", value: "Aventure + culture + nature" }
    ],
    whyHeading: "Pourquoi ce tour se distingue parmi les excursions a Bayahibe",
    whyItems: [
      "Experience dominicaine authentique avec contexte culturel",
      "Sensation moins chargee que beaucoup de tours buggy a Punta Cana",
      "Vrai terrain off road et non simple transfert panoramique",
      "Paysages naturels marques par les canaverales et la riviere",
      "Plan de demi-journee equilibre avec action, eau et immersion locale"
    ],
    galleryEyebrow: "Galerie",
    galleryHeading: "Ce que cette route buggy donne vraiment",
    galleryCaptions: ["Boue et action", "Canaverales", "Arret riviere", "Routes locales", "Voyageurs en plein plaisir"],
    travelerHeading: "Pourquoi les voyageurs choisissent cette route",
    travelerCards: [
      {
        title: "Plus authentique que les grands hubs buggy",
        copy: "Les voyageurs qui cherchent une route avec plus de caractere local preferent souvent Bayahibe et La Romana a des circuits plus satures."
      },
      {
        title: "L'arret riviere change l'experience",
        copy: "Le Chavon ajoute paysage, fraicheur et une composante nature plus forte qu'un simple parcours de conduite."
      },
      {
        title: "Tres bonne option pour les visiteurs internationaux",
        copy: "Si vous voulez du terrain off road, un vrai contexte local et une excursion de demi-journee gerable, c'est l'une des meilleures options a comparer."
      }
    ],
    faqHeading: "Questions frequentes",
    faqItems: [
      { q: "Faut-il de l'experience pour conduire le buggy ?", a: "Non. Le tour convient aux debutants et comprend des instructions avant le depart." },
      { q: "Vais-je me salir ?", a: "Tres probablement oui. Boue, poussiere et terrain irregulier font partie du plaisir off road." },
      { q: "Le transport depuis Bayahibe ou La Romana est-il inclus ?", a: "Oui. Le pickup est generalement inclus depuis des hotels selectionnes de Bayahibe et La Romana." },
      { q: "Le tour en buggy est-il sur ?", a: "Oui. L'itineraire fonctionne avec des guides, un briefing avant depart et un equipement de securite de base si applicable." },
      { q: "Que dois-je porter ?", a: "Des vetements legers qui peuvent se salir, des chaussures confortables, de la creme solaire, des lunettes et des vetements de rechange." },
      { q: "Les enfants peuvent-ils participer ?", a: "Oui. Les enfants peuvent generalement participer comme passagers, tandis que les conducteurs doivent respecter les regles de l'operateur." }
    ],
    finalHeading: "Reservez aujourd'hui votre aventure buggy depuis Bayahibe",
    finalEyebrow: "Disponibilite limitee en haute saison",
    finalBody:
      "Si vous voulez un tour buggy depuis Bayahibe ou La Romana plus authentique, moins charge et plus connecte au paysage, c'est une option tres solide a reserver directement avec Proactivitis.",
    trustEyebrow: "Proactivitis",
    trustHeading: "Information de voyage avec clarte de reservation",
    trustParagraphs: [
      "Cette page est publiee par Proactivitis et concue pour aider les voyageurs internationaux a comparer les excursions a Bayahibe avec une information claire, structuree et un acces direct a la reservation.",
      "Le schema de reviews n'a pas ete ajoute car cette page n'affiche pas un ensemble public et verifiable d'avis reels."
    ],
    visibleDataHeading: "Donnees visibles du business",
    brandLabel: "Marque",
    emailLabel: "Email",
    phoneLabel: "Telephone",
    whatsappLabel: "WhatsApp",
    usefulLinksLabel: "Liens utiles",
    directContactLabel: "Contact direct",
    allToursLabel: "Tous les tours",
    contactLabel: "Contact",
    footer: "Copyright 2026 Proactivitis. Tous droits reserves.",
    organizationDescription:
      "Proactivitis selectionne des tours et experiences en Republique dominicaine avec des informations claires, des chemins de reservation directs et un contenu utile pour les voyageurs internationaux.",
    breadcrumbHome: "Accueil",
    breadcrumbTours: "Tours",
    breadcrumbCurrent: "Tour Buggy Bayahibe La Romana",
    serviceName: "Tour Buggy depuis Bayahibe La Romana",
    serviceType: "Tour buggy off road a Bayahibe et La Romana",
    availableLanguages: ["French", "English", "Spanish"],
    tripDescription:
      "Une aventure en buggy a travers les canaverales, les bateyes et le rio Chavon pres de Bayahibe et La Romana.",
    itinerarySchema: [
      "Pickup hotel",
      "Arrivee au ranch",
      "Instructions de conduite",
      "Parcours buggy off road",
      "Arret bateyes et culture locale",
      "Baignade au rio Chavon",
      "Degustation locale",
      "Retour"
    ],
    audienceTypes: ["Couples", "Familles", "Voyageurs aventure", "Petits groupes"],
    localeLinks: {
      home: "/fr",
      tours: "/fr/tours",
      contact: "/fr/contact"
    }
  }
};
