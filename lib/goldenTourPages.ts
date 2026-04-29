import type { Locale } from "@/lib/translations";

export type GoldenTourIntent = {
  id: string;
  slug: string;
  catalogLabel: string;
  headline: Record<Locale, string>;
  keyword: Record<Locale, string>;
  badge: Record<Locale, string>;
  promise: Record<Locale, string>;
  buyer: Record<Locale, string>;
  proof: Record<Locale, string>;
  cta: Record<Locale, string>;
};

export const GOLDEN_TOUR_INTENTS: GoldenTourIntent[] = [
  {
    id: "precio-2026",
    slug: "precio-2026",
    catalogLabel: "Precio 2026",
    headline: {
      es: "{tour} precio 2026 en Punta Cana",
      en: "{tour} 2026 price in Punta Cana",
      fr: "{tour} prix 2026 a Punta Cana"
    },
    keyword: {
      es: "{tour} precio 2026",
      en: "{tour} price 2026",
      fr: "{tour} prix 2026"
    },
    badge: { es: "Precio claro", en: "Clear price", fr: "Prix clair" },
    promise: {
      es: "Compara el precio desde, lo que incluye y como reservar sin sorpresas.",
      en: "Compare starting price, inclusions and how to book without surprises.",
      fr: "Comparez le prix de depart, les inclusions et la reservation sans surprise."
    },
    buyer: {
      es: "Para viajeros que ya tienen presupuesto y quieren confirmar si esta experiencia vale la pena.",
      en: "For travelers with a budget who want to know if this experience is worth it.",
      fr: "Pour les voyageurs avec budget qui veulent verifier si l experience vaut le coup."
    },
    proof: {
      es: "Mostramos precio desde, opciones de ninos/jovenes cuando aplica y enlace directo a disponibilidad.",
      en: "We show starting price, child/youth pricing when available and direct availability access.",
      fr: "Nous affichons prix de depart, tarifs enfants/jeunes si disponibles et disponibilite directe."
    },
    cta: { es: "Ver disponibilidad", en: "Check availability", fr: "Voir disponibilite" }
  },
  {
    id: "reserva-privada",
    slug: "reserva-privada",
    catalogLabel: "Privado",
    headline: {
      es: "{tour} privado en Punta Cana",
      en: "Private {tour} in Punta Cana",
      fr: "{tour} prive a Punta Cana"
    },
    keyword: {
      es: "{tour} privado punta cana",
      en: "private {tour} punta cana",
      fr: "{tour} prive punta cana"
    },
    badge: { es: "Privado / VIP", en: "Private / VIP", fr: "Prive / VIP" },
    promise: {
      es: "Una forma mas comoda de reservar si priorizas privacidad, ritmo propio y soporte humano.",
      en: "A smoother way to book if you value privacy, your own pace and human support.",
      fr: "Une option plus confortable si vous privilegiez intimite, rythme propre et support humain."
    },
    buyer: {
      es: "Ideal para parejas, familias o grupos que no quieren depender de un grupo grande.",
      en: "Ideal for couples, families or groups who do not want to depend on a large group.",
      fr: "Ideal pour couples, familles ou groupes qui veulent eviter les grands groupes."
    },
    proof: {
      es: "El equipo confirma disponibilidad, punto de recogida y detalles antes del pago.",
      en: "The team confirms availability, pickup point and details before payment.",
      fr: "L equipe confirme disponibilite, pickup et details avant paiement."
    },
    cta: { es: "Solicitar privado", en: "Request private option", fr: "Demander prive" }
  },
  {
    id: "familiar",
    slug: "familiar-con-ninos",
    catalogLabel: "Familias",
    headline: {
      es: "{tour} para familias con ninos",
      en: "{tour} for families with kids",
      fr: "{tour} pour familles avec enfants"
    },
    keyword: {
      es: "{tour} familiar punta cana",
      en: "{tour} family friendly punta cana",
      fr: "{tour} famille punta cana"
    },
    badge: { es: "Familias", en: "Families", fr: "Familles" },
    promise: {
      es: "Revisa si el ritmo, la duracion y la logistica encajan con una familia.",
      en: "Check whether timing, duration and logistics fit a family trip.",
      fr: "Verifiez si rythme, duree et logistique conviennent a une famille."
    },
    buyer: {
      es: "Pensado para padres que quieren reservar sin improvisar transporte, horarios ni punto de encuentro.",
      en: "Built for parents who want to book without guessing transport, timing or meeting point.",
      fr: "Concu pour parents qui veulent reserver sans improviser transport, horaires ou rendez-vous."
    },
    proof: {
      es: "Incluimos precio de ninos cuando existe y datos practicos antes de reservar.",
      en: "We include child pricing when available and practical details before booking.",
      fr: "Nous incluons les prix enfants quand disponibles et les infos pratiques."
    },
    cta: { es: "Reservar para familia", en: "Book for family", fr: "Reserver en famille" }
  },
  {
    id: "recogida-hotel",
    slug: "con-recogida-en-hotel",
    catalogLabel: "Pickup hotel",
    headline: {
      es: "{tour} con recogida en hotel",
      en: "{tour} with hotel pickup",
      fr: "{tour} avec pickup hotel"
    },
    keyword: {
      es: "{tour} con recogida hotel",
      en: "{tour} with hotel pickup",
      fr: "{tour} avec pickup hotel"
    },
    badge: { es: "Recogida", en: "Pickup", fr: "Pickup" },
    promise: {
      es: "Reserva con punto de recogida claro y soporte para confirmar tu hotel.",
      en: "Book with a clear pickup point and support to confirm your hotel.",
      fr: "Reserve avec point de pickup clair et support pour confirmer votre hotel."
    },
    buyer: {
      es: "Para quien ya esta hospedado en Punta Cana y quiere evitar dudas de transporte.",
      en: "For travelers already staying in Punta Cana who want to avoid transport confusion.",
      fr: "Pour voyageurs deja a Punta Cana qui veulent eviter les doutes de transport."
    },
    proof: {
      es: "Antes de pagar puedes revisar recogida, instrucciones y contacto de soporte.",
      en: "Before payment you can review pickup, instructions and support contact.",
      fr: "Avant paiement, vous pouvez verifier pickup, instructions et support."
    },
    cta: { es: "Confirmar recogida", en: "Confirm pickup", fr: "Confirmer pickup" }
  },
  {
    id: "desde-bavaro",
    slug: "desde-bavaro",
    catalogLabel: "Desde Bavaro",
    headline: {
      es: "{tour} desde Bavaro",
      en: "{tour} from Bavaro",
      fr: "{tour} depuis Bavaro"
    },
    keyword: {
      es: "{tour} desde bavaro",
      en: "{tour} from bavaro",
      fr: "{tour} depuis bavaro"
    },
    badge: { es: "Bavaro", en: "Bavaro", fr: "Bavaro" },
    promise: {
      es: "Una pagina enfocada en viajeros hospedados en Bavaro que quieren reservar rapido.",
      en: "A page for travelers staying in Bavaro who want to book quickly.",
      fr: "Une page pour voyageurs logeant a Bavaro qui veulent reserver vite."
    },
    buyer: {
      es: "Funciona si tu hotel esta en Bavaro, El Cortecito, Arena Gorda o zonas cercanas.",
      en: "Useful if your hotel is in Bavaro, El Cortecito, Arena Gorda or nearby areas.",
      fr: "Utile si votre hotel est a Bavaro, El Cortecito, Arena Gorda ou autour."
    },
    proof: {
      es: "El checkout permite indicar tu hotel o punto exacto de encuentro.",
      en: "Checkout lets you add your hotel or exact meeting point.",
      fr: "Le checkout permet d ajouter hotel ou point exact."
    },
    cta: { es: "Reservar desde Bavaro", en: "Book from Bavaro", fr: "Reserver depuis Bavaro" }
  },
  {
    id: "desde-cap-cana",
    slug: "desde-cap-cana",
    catalogLabel: "Desde Cap Cana",
    headline: {
      es: "{tour} desde Cap Cana",
      en: "{tour} from Cap Cana",
      fr: "{tour} depuis Cap Cana"
    },
    keyword: {
      es: "{tour} desde cap cana",
      en: "{tour} from cap cana",
      fr: "{tour} depuis cap cana"
    },
    badge: { es: "Cap Cana", en: "Cap Cana", fr: "Cap Cana" },
    promise: {
      es: "Pensado para clientes que se hospedan en Cap Cana y quieren una reserva clara.",
      en: "Designed for guests staying in Cap Cana who want a clear booking.",
      fr: "Pour clients logeant a Cap Cana qui veulent une reservation claire."
    },
    buyer: {
      es: "Ideal si buscas una experiencia con coordinacion cuidada y soporte directo.",
      en: "Ideal if you want a carefully coordinated experience with direct support.",
      fr: "Ideal si vous voulez coordination soignee et support direct."
    },
    proof: {
      es: "Puedes confirmar recogida, hora y detalles especiales antes de cerrar.",
      en: "You can confirm pickup, time and special details before booking.",
      fr: "Vous pouvez confirmer pickup, heure et details avant reservation."
    },
    cta: { es: "Reservar desde Cap Cana", en: "Book from Cap Cana", fr: "Reserver depuis Cap Cana" }
  },
  {
    id: "desde-uvero-alto",
    slug: "desde-uvero-alto",
    catalogLabel: "Desde Uvero Alto",
    headline: {
      es: "{tour} desde Uvero Alto",
      en: "{tour} from Uvero Alto",
      fr: "{tour} depuis Uvero Alto"
    },
    keyword: {
      es: "{tour} desde uvero alto",
      en: "{tour} from uvero alto",
      fr: "{tour} depuis uvero alto"
    },
    badge: { es: "Uvero Alto", en: "Uvero Alto", fr: "Uvero Alto" },
    promise: {
      es: "Para viajeros en Uvero Alto que quieren saber si la logistica funciona antes de reservar.",
      en: "For Uvero Alto travelers who want to know if logistics work before booking.",
      fr: "Pour voyageurs a Uvero Alto qui veulent verifier la logistique avant de reserver."
    },
    buyer: {
      es: "Especialmente util si estas en resorts alejados del centro de Bavaro.",
      en: "Especially useful if you stay in resorts away from central Bavaro.",
      fr: "Tres utile si votre resort est eloigne du centre de Bavaro."
    },
    proof: {
      es: "La reserva pide punto de recogida exacto para evitar confusiones.",
      en: "Booking asks for exact pickup point to avoid confusion.",
      fr: "La reservation demande le pickup exact pour eviter confusion."
    },
    cta: { es: "Ver salida desde Uvero Alto", en: "Check from Uvero Alto", fr: "Voir depuis Uvero Alto" }
  },
  {
    id: "mejor-valor",
    slug: "mejor-calidad-precio",
    catalogLabel: "Mejor valor",
    headline: {
      es: "{tour} mejor calidad precio",
      en: "Best value {tour}",
      fr: "{tour} meilleur rapport qualite prix"
    },
    keyword: {
      es: "{tour} calidad precio",
      en: "best value {tour}",
      fr: "{tour} qualite prix"
    },
    badge: { es: "Mejor valor", en: "Best value", fr: "Meilleur valeur" },
    promise: {
      es: "Enfocado en viajeros que quieren pagar bien sin perder seguridad ni soporte.",
      en: "For travelers who want a fair price without losing safety or support.",
      fr: "Pour voyageurs qui veulent bon prix sans perdre securite ou support."
    },
    buyer: {
      es: "Buena opcion si comparas varias actividades antes de decidir.",
      en: "Good if you compare several activities before deciding.",
      fr: "Bonne option si vous comparez plusieurs activites avant de choisir."
    },
    proof: {
      es: "Resumen claro de precio, duracion, incluye y condiciones principales.",
      en: "Clear summary of price, duration, inclusions and main conditions.",
      fr: "Resume clair du prix, duree, inclusions et conditions principales."
    },
    cta: { es: "Comparar y reservar", en: "Compare and book", fr: "Comparer et reserver" }
  },
  {
    id: "ultima-hora",
    slug: "reserva-ultima-hora",
    catalogLabel: "Ultima hora",
    headline: {
      es: "{tour} de ultima hora en Punta Cana",
      en: "Last-minute {tour} in Punta Cana",
      fr: "{tour} derniere minute a Punta Cana"
    },
    keyword: {
      es: "{tour} ultima hora punta cana",
      en: "last minute {tour} punta cana",
      fr: "{tour} derniere minute punta cana"
    },
    badge: { es: "Reserva rapida", en: "Fast booking", fr: "Reservation rapide" },
    promise: {
      es: "Para cerrar una actividad hoy o manana con confirmacion lo mas rapida posible.",
      en: "For booking an activity today or tomorrow with fast confirmation when possible.",
      fr: "Pour reserver aujourd hui ou demain avec confirmation rapide si possible."
    },
    buyer: {
      es: "Ideal si ya estas en destino y no quieres esperar respuestas lentas.",
      en: "Ideal if you are already in destination and do not want slow replies.",
      fr: "Ideal si vous etes deja sur place et voulez une reponse rapide."
    },
    proof: {
      es: "Boton directo a disponibilidad y soporte para confirmar por WhatsApp.",
      en: "Direct availability button and support to confirm on WhatsApp.",
      fr: "Bouton disponibilite et support pour confirmer par WhatsApp."
    },
    cta: { es: "Revisar hoy", en: "Check today", fr: "Verifier aujourd hui" }
  },
  {
    id: "parejas",
    slug: "para-parejas",
    catalogLabel: "Parejas",
    headline: {
      es: "{tour} para parejas",
      en: "{tour} for couples",
      fr: "{tour} pour couples"
    },
    keyword: {
      es: "{tour} parejas punta cana",
      en: "{tour} couples punta cana",
      fr: "{tour} couples punta cana"
    },
    badge: { es: "Parejas", en: "Couples", fr: "Couples" },
    promise: {
      es: "Una forma clara de decidir si la experiencia encaja con una escapada en pareja.",
      en: "A clear way to decide if the experience fits a couple getaway.",
      fr: "Une facon claire de voir si l experience convient a un couple."
    },
    buyer: {
      es: "Para aniversarios, viajes romanticos o parejas que quieren una actividad sin estres.",
      en: "For anniversaries, romantic trips or couples wanting a stress-free activity.",
      fr: "Pour anniversaires, voyages romantiques ou couples qui veulent eviter le stress."
    },
    proof: {
      es: "Te mostramos ritmo, precio, duracion y soporte antes de reservar.",
      en: "We show pace, price, duration and support before booking.",
      fr: "Nous montrons rythme, prix, duree et support avant reservation."
    },
    cta: { es: "Planear en pareja", en: "Plan as a couple", fr: "Planifier en couple" }
  },
  {
    id: "todo-incluido",
    slug: "todo-incluido",
    catalogLabel: "Todo incluido",
    headline: {
      es: "{tour} todo incluido",
      en: "All-inclusive {tour}",
      fr: "{tour} tout compris"
    },
    keyword: {
      es: "{tour} todo incluido",
      en: "all inclusive {tour}",
      fr: "{tour} tout compris"
    },
    badge: { es: "Incluye claro", en: "Clear inclusions", fr: "Inclus clair" },
    promise: {
      es: "Revisa que incluye y que no incluye para reservar con expectativa correcta.",
      en: "Review what is and is not included before booking.",
      fr: "Verifiez inclusions et exclusions avant de reserver."
    },
    buyer: {
      es: "Para quien quiere precio cerrado y menos decisiones durante el dia.",
      en: "For travelers wanting fixed pricing and fewer decisions during the day.",
      fr: "Pour voyageurs qui veulent prix ferme et moins de decisions."
    },
    proof: {
      es: "La pagina separa incluye, no incluido, requisitos y cancelacion.",
      en: "The page separates included items, exclusions, requirements and cancellation.",
      fr: "La page separe inclusions, exclusions, conditions et annulation."
    },
    cta: { es: "Ver que incluye", en: "See inclusions", fr: "Voir inclusions" }
  },
  {
    id: "manana",
    slug: "salida-en-la-manana",
    catalogLabel: "Manana",
    headline: {
      es: "{tour} por la manana",
      en: "Morning {tour}",
      fr: "{tour} le matin"
    },
    keyword: {
      es: "{tour} manana punta cana",
      en: "morning {tour} punta cana",
      fr: "{tour} matin punta cana"
    },
    badge: { es: "Salida temprano", en: "Morning plan", fr: "Depart matin" },
    promise: {
      es: "Para aprovechar el dia y regresar con tiempo al hotel.",
      en: "For making the most of the day and returning to the hotel with time.",
      fr: "Pour profiter de la journee et rentrer a l hotel avec du temps."
    },
    buyer: {
      es: "Ideal si prefieres actividades antes del calor fuerte o antes de otra reserva.",
      en: "Ideal if you prefer activities before peak heat or before another booking.",
      fr: "Ideal avant la chaleur forte ou avant une autre reservation."
    },
    proof: {
      es: "Mostramos horarios disponibles cuando el tour los tiene configurados.",
      en: "We show available times when configured for the tour.",
      fr: "Nous affichons les horaires quand ils sont configures."
    },
    cta: { es: "Ver horarios", en: "See times", fr: "Voir horaires" }
  },
  {
    id: "grupo-pequeno",
    slug: "grupo-pequeno",
    catalogLabel: "Grupo pequeno",
    headline: {
      es: "{tour} en grupo pequeno",
      en: "Small-group {tour}",
      fr: "{tour} en petit groupe"
    },
    keyword: {
      es: "{tour} grupo pequeno",
      en: "small group {tour}",
      fr: "{tour} petit groupe"
    },
    badge: { es: "Menos friccion", en: "Less friction", fr: "Moins de friction" },
    promise: {
      es: "Para viajeros que quieren una experiencia mas ordenada y mejor acompanada.",
      en: "For travelers who want a more organized and supported experience.",
      fr: "Pour voyageurs qui veulent une experience plus organisee."
    },
    buyer: {
      es: "Buena opcion si no te gustan grupos grandes ni esperas largas.",
      en: "Good if you dislike large groups or long waits.",
      fr: "Bonne option si vous n aimez pas grands groupes et longues attentes."
    },
    proof: {
      es: "Capacidad, disponibilidad y soporte ayudan a confirmar el mejor formato.",
      en: "Capacity, availability and support help confirm the best format.",
      fr: "Capacite, disponibilite et support aident a confirmer le format."
    },
    cta: { es: "Buscar grupo pequeno", en: "Find small group", fr: "Voir petit groupe" }
  },
  {
    id: "whatsapp",
    slug: "confirmacion-whatsapp",
    catalogLabel: "WhatsApp",
    headline: {
      es: "{tour} con confirmacion por WhatsApp",
      en: "{tour} with WhatsApp confirmation",
      fr: "{tour} avec confirmation WhatsApp"
    },
    keyword: {
      es: "{tour} whatsapp punta cana",
      en: "{tour} whatsapp punta cana",
      fr: "{tour} whatsapp punta cana"
    },
    badge: { es: "Soporte humano", en: "Human support", fr: "Support humain" },
    promise: {
      es: "Reserva con asistencia real para confirmar dudas antes y despues del pago.",
      en: "Book with real assistance before and after payment.",
      fr: "Reserve avec assistance reelle avant et apres paiement."
    },
    buyer: {
      es: "Ideal para viajeros que no quieren quedar solos despues de pagar.",
      en: "Ideal for travelers who do not want to be alone after payment.",
      fr: "Ideal pour voyageurs qui veulent du support apres paiement."
    },
    proof: {
      es: "Proactivitis confirma detalles, recogida y dudas operativas por WhatsApp.",
      en: "Proactivitis confirms details, pickup and operational questions on WhatsApp.",
      fr: "Proactivitis confirme details, pickup et questions par WhatsApp."
    },
    cta: { es: "Reservar con soporte", en: "Book with support", fr: "Reserver avec support" }
  }
];

export const buildGoldenTourPageSlug = (tourSlug: string, intentSlug: string) =>
  `${tourSlug}--${intentSlug}`;

export const parseGoldenTourPageSlug = (goldSlug: string) => {
  const intent = [...GOLDEN_TOUR_INTENTS]
    .sort((a, b) => b.slug.length - a.slug.length)
    .find((item) => goldSlug.endsWith(`--${item.slug}`));
  if (!intent) return null;
  const tourSlug = goldSlug.slice(0, -`--${intent.slug}`.length);
  if (!tourSlug) return null;
  return { tourSlug, intent };
};

export const fillGoldenTourText = (template: string, tourTitle: string) =>
  template.replaceAll("{tour}", tourTitle);
