import type { Locale } from "@/lib/translations";

export type GoldenTransferIntent = {
  id: string;
  slug: string;
  catalogLabel: string;
  direction: "arrival" | "return" | "roundtrip";
  headline: Record<Locale, string>;
  keyword: Record<Locale, string>;
  badge: Record<Locale, string>;
  promise: Record<Locale, string>;
  buyer: Record<Locale, string>;
  proof: Record<Locale, string>;
  cta: Record<Locale, string>;
};

export const GOLDEN_TRANSFER_INTENTS: GoldenTransferIntent[] = [
  {
    id: "private-transfer",
    slug: "private-transfer",
    catalogLabel: "Private",
    direction: "arrival",
    headline: {
      es: "Transfer privado PUJ a {hotel}",
      en: "Private PUJ transfer to {hotel}",
      fr: "Transfert prive PUJ vers {hotel}"
    },
    keyword: {
      es: "transfer privado aeropuerto punta cana {hotel}",
      en: "private airport transfer punta cana {hotel}",
      fr: "transfert prive aeroport punta cana {hotel}"
    },
    badge: { es: "Privado", en: "Private", fr: "Prive" },
    promise: {
      es: "Llegada directa, precio claro y conductor confirmado para tu hotel.",
      en: "Direct arrival, clear pricing and confirmed driver for your hotel.",
      fr: "Arrivee directe, prix clair et chauffeur confirme pour votre hotel."
    },
    buyer: {
      es: "Para viajeros que no quieren filas, taxis improvisados ni paradas innecesarias.",
      en: "For travelers who want no lines, no random taxis and no unnecessary stops.",
      fr: "Pour voyageurs qui veulent eviter files, taxis improvises et arrets inutiles."
    },
    proof: {
      es: "Incluye seguimiento de vuelo, espera de cortesia y soporte antes de aterrizar.",
      en: "Includes flight tracking, courtesy waiting time and support before landing.",
      fr: "Inclut suivi de vol, attente de courtoisie et support avant atterrissage."
    },
    cta: { es: "Reservar privado", en: "Book private", fr: "Reserver prive" }
  },
  {
    id: "round-trip",
    slug: "round-trip",
    catalogLabel: "Round trip",
    direction: "roundtrip",
    headline: {
      es: "Transfer ida y vuelta PUJ a {hotel}",
      en: "Round-trip PUJ transfer to {hotel}",
      fr: "Transfert aller-retour PUJ vers {hotel}"
    },
    keyword: {
      es: "transfer ida y vuelta punta cana {hotel}",
      en: "round trip transfer punta cana {hotel}",
      fr: "transfert aller retour punta cana {hotel}"
    },
    badge: { es: "Ida y vuelta", en: "Round trip", fr: "Aller-retour" },
    promise: {
      es: "Cierra llegada y salida en una sola reserva con soporte local.",
      en: "Lock arrival and departure in one booking with local support.",
      fr: "Confirmez arrivee et depart dans une seule reservation."
    },
    buyer: {
      es: "Ideal si quieres dejar resuelto el transporte completo antes de viajar.",
      en: "Ideal if you want the full transport plan solved before traveling.",
      fr: "Ideal si vous voulez regler tout le transport avant le voyage."
    },
    proof: {
      es: "Coordinamos hora de llegada, hora de salida y vehiculo segun pasajeros.",
      en: "We coordinate arrival time, departure time and vehicle by passengers.",
      fr: "Nous coordonnons arrivee, depart et vehicule selon passagers."
    },
    cta: { es: "Reservar ida y vuelta", en: "Book round trip", fr: "Reserver aller-retour" }
  },
  {
    id: "vip-suv",
    slug: "vip-suv",
    catalogLabel: "VIP SUV",
    direction: "arrival",
    headline: {
      es: "Transfer VIP SUV a {hotel}",
      en: "VIP SUV transfer to {hotel}",
      fr: "Transfert VIP SUV vers {hotel}"
    },
    keyword: {
      es: "transfer vip suv punta cana {hotel}",
      en: "vip suv transfer punta cana {hotel}",
      fr: "transfert vip suv punta cana {hotel}"
    },
    badge: { es: "VIP SUV", en: "VIP SUV", fr: "VIP SUV" },
    promise: {
      es: "Mas confort, privacidad y llegada premium desde el aeropuerto.",
      en: "More comfort, privacy and premium arrival from the airport.",
      fr: "Plus de confort, intimite et arrivee premium depuis l aeroport."
    },
    buyer: {
      es: "Para parejas, ejecutivos o clientes que quieren una primera impresion superior.",
      en: "For couples, executives or guests who want a better first impression.",
      fr: "Pour couples, executives ou clients qui veulent une arrivee superieure."
    },
    proof: {
      es: "Puedes confirmar vehiculo, equipaje y necesidades especiales antes del servicio.",
      en: "You can confirm vehicle, luggage and special needs before service.",
      fr: "Vous pouvez confirmer vehicule, bagages et besoins speciaux avant service."
    },
    cta: { es: "Ver SUV VIP", en: "See VIP SUV", fr: "Voir SUV VIP" }
  },
  {
    id: "family-transfer",
    slug: "family-transfer",
    catalogLabel: "Family",
    direction: "arrival",
    headline: {
      es: "Transfer familiar PUJ a {hotel}",
      en: "Family PUJ transfer to {hotel}",
      fr: "Transfert famille PUJ vers {hotel}"
    },
    keyword: {
      es: "transfer familiar punta cana {hotel}",
      en: "family transfer punta cana {hotel}",
      fr: "transfert famille punta cana {hotel}"
    },
    badge: { es: "Familias", en: "Families", fr: "Familles" },
    promise: {
      es: "Espacio para pasajeros, maletas y una llegada tranquila con ninos.",
      en: "Space for travelers, luggage and a smoother arrival with kids.",
      fr: "Espace pour passagers, bagages et arrivee tranquille avec enfants."
    },
    buyer: {
      es: "Pensado para padres que quieren evitar negociaciones al salir del aeropuerto.",
      en: "Built for parents who want to avoid negotiating after the airport.",
      fr: "Concu pour parents qui veulent eviter negociation a l aeroport."
    },
    proof: {
      es: "El formulario permite indicar pasajeros, equipaje y detalles de recogida.",
      en: "The form lets you add passengers, luggage and pickup details.",
      fr: "Le formulaire permet passagers, bagages et details de pickup."
    },
    cta: { es: "Reservar familia", en: "Book family transfer", fr: "Reserver famille" }
  },
  {
    id: "last-minute",
    slug: "last-minute",
    catalogLabel: "Last minute",
    direction: "arrival",
    headline: {
      es: "Transfer de ultima hora a {hotel}",
      en: "Last-minute transfer to {hotel}",
      fr: "Transfert derniere minute vers {hotel}"
    },
    keyword: {
      es: "transfer ultima hora punta cana {hotel}",
      en: "last minute transfer punta cana {hotel}",
      fr: "transfert derniere minute punta cana {hotel}"
    },
    badge: { es: "Urgente", en: "Last minute", fr: "Derniere minute" },
    promise: {
      es: "Confirmacion rapida segun disponibilidad para llegadas cercanas.",
      en: "Fast confirmation when available for upcoming arrivals.",
      fr: "Confirmation rapide selon disponibilite pour arrivees proches."
    },
    buyer: {
      es: "Ideal si viajas hoy, manana o acabas de cambiar tu plan.",
      en: "Ideal if you travel today, tomorrow or just changed your plan.",
      fr: "Ideal si vous voyagez aujourd hui, demain ou changez de plan."
    },
    proof: {
      es: "WhatsApp y checkout ayudan a confirmar detalles sin perder tiempo.",
      en: "WhatsApp and checkout help confirm details without wasting time.",
      fr: "WhatsApp et checkout aident a confirmer rapidement."
    },
    cta: { es: "Revisar disponibilidad", en: "Check availability", fr: "Verifier disponibilite" }
  },
  {
    id: "return-to-airport",
    slug: "return-to-airport",
    catalogLabel: "Return",
    direction: "return",
    headline: {
      es: "Transfer de {hotel} al aeropuerto PUJ",
      en: "Transfer from {hotel} to PUJ airport",
      fr: "Transfert de {hotel} vers aeroport PUJ"
    },
    keyword: {
      es: "transfer hotel aeropuerto punta cana {hotel}",
      en: "hotel to puj airport transfer {hotel}",
      fr: "transfert hotel aeroport puj {hotel}"
    },
    badge: { es: "Salida", en: "Departure", fr: "Depart" },
    promise: {
      es: "Salida coordinada para llegar al aeropuerto con tiempo y sin estres.",
      en: "Coordinated departure to reach the airport on time without stress.",
      fr: "Depart coordonne pour arriver a l aeroport a temps."
    },
    buyer: {
      es: "Para viajeros que quieren asegurar el regreso antes del check-out.",
      en: "For travelers who want their return handled before checkout.",
      fr: "Pour voyageurs qui veulent assurer le retour avant check-out."
    },
    proof: {
      es: "Confirmamos hora recomendada segun vuelo, hotel y pasajeros.",
      en: "We confirm recommended pickup time by flight, hotel and passengers.",
      fr: "Nous confirmons l heure conseillee selon vol, hotel et passagers."
    },
    cta: { es: "Reservar salida", en: "Book departure", fr: "Reserver depart" }
  },
  {
    id: "no-wait",
    slug: "no-wait",
    catalogLabel: "No wait",
    direction: "arrival",
    headline: {
      es: "Transfer sin espera a {hotel}",
      en: "No-wait transfer to {hotel}",
      fr: "Transfert sans attente vers {hotel}"
    },
    keyword: {
      es: "transfer sin espera punta cana {hotel}",
      en: "no wait airport transfer punta cana {hotel}",
      fr: "transfert sans attente punta cana {hotel}"
    },
    badge: { es: "Sin espera", en: "No wait", fr: "Sans attente" },
    promise: {
      es: "Tu conductor se coordina con tu vuelo para reducir friccion al llegar.",
      en: "Your driver coordinates with your flight to reduce arrival friction.",
      fr: "Votre chauffeur suit votre vol pour reduire l attente."
    },
    buyer: {
      es: "Para quien quiere salir del aeropuerto y llegar al hotel sin vueltas.",
      en: "For travelers who want to leave the airport and reach the hotel quickly.",
      fr: "Pour voyageurs qui veulent quitter l aeroport rapidement."
    },
    proof: {
      es: "Seguimiento de vuelo, punto de encuentro claro y soporte en vivo.",
      en: "Flight tracking, clear meeting point and live support.",
      fr: "Suivi de vol, point de rencontre clair et support live."
    },
    cta: { es: "Reservar sin espera", en: "Book no-wait", fr: "Reserver sans attente" }
  },
  {
    id: "group-transfer",
    slug: "group-transfer",
    catalogLabel: "Groups",
    direction: "arrival",
    headline: {
      es: "Transfer para grupos a {hotel}",
      en: "Group transfer to {hotel}",
      fr: "Transfert groupe vers {hotel}"
    },
    keyword: {
      es: "transfer grupo punta cana {hotel}",
      en: "group transfer punta cana {hotel}",
      fr: "transfert groupe punta cana {hotel}"
    },
    badge: { es: "Grupos", en: "Groups", fr: "Groupes" },
    promise: {
      es: "Coordinacion para varias personas, maletas y vehiculo adecuado.",
      en: "Coordination for several travelers, luggage and the right vehicle.",
      fr: "Coordination pour plusieurs passagers, bagages et vehicule adapte."
    },
    buyer: {
      es: "Bueno para bodas, familias grandes, amigos y viajes corporativos.",
      en: "Good for weddings, large families, friends and corporate trips.",
      fr: "Pour mariages, grandes familles, amis et voyages corporate."
    },
    proof: {
      es: "Puedes pedir minivan o grupo y confirmar detalles por WhatsApp.",
      en: "You can request minivan/group options and confirm by WhatsApp.",
      fr: "Vous pouvez demander minivan/groupe et confirmer par WhatsApp."
    },
    cta: { es: "Cotizar grupo", en: "Quote group", fr: "Devis groupe" }
  },
  {
    id: "whatsapp-confirmed",
    slug: "whatsapp-confirmed",
    catalogLabel: "WhatsApp",
    direction: "arrival",
    headline: {
      es: "Transfer confirmado por WhatsApp a {hotel}",
      en: "WhatsApp-confirmed transfer to {hotel}",
      fr: "Transfert confirme WhatsApp vers {hotel}"
    },
    keyword: {
      es: "transfer whatsapp punta cana {hotel}",
      en: "whatsapp transfer punta cana {hotel}",
      fr: "transfert whatsapp punta cana {hotel}"
    },
    badge: { es: "WhatsApp", en: "WhatsApp", fr: "WhatsApp" },
    promise: {
      es: "Reserva con soporte humano para confirmar dudas antes y despues.",
      en: "Book with human support before and after the ride.",
      fr: "Reserve avec support humain avant et apres le trajet."
    },
    buyer: {
      es: "Ideal si quieres tener a alguien real disponible durante la llegada.",
      en: "Ideal if you want a real person available during arrival.",
      fr: "Ideal si vous voulez une vraie personne disponible."
    },
    proof: {
      es: "Te damos resumen de reserva, punto de encuentro y asistencia.",
      en: "You receive booking summary, meeting point and assistance.",
      fr: "Vous recevez resume, point de rencontre et assistance."
    },
    cta: { es: "Confirmar por WhatsApp", en: "Confirm by WhatsApp", fr: "Confirmer WhatsApp" }
  },
  {
    id: "best-price-2026",
    slug: "best-price-2026",
    catalogLabel: "Precio 2026",
    direction: "arrival",
    headline: {
      es: "Precio transfer PUJ a {hotel} 2026",
      en: "PUJ transfer price to {hotel} 2026",
      fr: "Prix transfert PUJ vers {hotel} 2026"
    },
    keyword: {
      es: "precio transfer punta cana {hotel} 2026",
      en: "punta cana transfer price {hotel} 2026",
      fr: "prix transfert punta cana {hotel} 2026"
    },
    badge: { es: "Precio 2026", en: "2026 price", fr: "Prix 2026" },
    promise: {
      es: "Consulta precio desde y que incluye antes de reservar.",
      en: "Check starting price and inclusions before booking.",
      fr: "Consultez prix de depart et inclusions avant reservation."
    },
    buyer: {
      es: "Para viajeros que comparan presupuesto y quieren evitar cargos ocultos.",
      en: "For travelers comparing budget and avoiding hidden charges.",
      fr: "Pour voyageurs qui comparent budget et evitent frais caches."
    },
    proof: {
      es: "Precio desde, servicio privado y CTA directo al checkout.",
      en: "Starting price, private service and direct checkout CTA.",
      fr: "Prix de depart, service prive et CTA checkout direct."
    },
    cta: { es: "Ver precio ahora", en: "See price now", fr: "Voir prix" }
  }
];

export const buildGoldenTransferPageSlug = (landingSlug: string, intentSlug: string) =>
  `${landingSlug}--${intentSlug}`;

export const parseGoldenTransferPageSlug = (goldSlug: string) => {
  const intent = [...GOLDEN_TRANSFER_INTENTS]
    .sort((a, b) => b.slug.length - a.slug.length)
    .find((item) => goldSlug.endsWith(`--${item.slug}`));
  if (!intent) return null;
  const landingSlug = goldSlug.slice(0, -`--${intent.slug}`.length);
  if (!landingSlug) return null;
  return { landingSlug, intent };
};

export const fillGoldenTransferText = (template: string, hotelName: string) =>
  template.replaceAll("{hotel}", hotelName);
