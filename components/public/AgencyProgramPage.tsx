import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarRange,
  ClipboardList,
  Link2,
  MonitorSmartphone,
  Route,
  ShieldCheck
} from "lucide-react";
import { getAgencyTutorialContentOverrides } from "@/lib/siteContent";

type Locale = "es" | "en" | "fr";

const copyByLocale = {
  es: {
    metadataTitle: "AgencyPro para agencias | Proactivitis",
    metadataDescription:
      "Descubre como funciona Proactivitis para agencias: reservas directas, AgencyPro, traslados, control operativo y herramientas para vender mejor.",
    badge: "AgencyPro by Proactivitis",
    heroTitle: "AgencyPro: la plataforma comercial para agencias que venden tours y traslados con mas control",
    heroBody:
      "AgencyPro combina reservas directas, enlaces con tu propio precio, cotizacion de traslados, control operativo y trazabilidad comercial en un solo workspace para agencias serias.",
    applyNow: "Aplicar ahora",
    seeHow: "Ver como funciona",
    moreControl: "Mas control comercial",
    seriousWay: "Una forma mas seria de vender tours y traslados",
    ctaApply: "Aplicar como agencia",
    ctaSales: "Hablar con ventas",
    screenshotsEyebrow: "Capturas del sistema",
    screenshotsTitle: "Asi trabaja una agencia dentro de AgencyPro",
    screenshotsBody:
      "Esta landing puede mostrar tus propias capturas del panel. Desde admin podras subirlas para ensenar el catalogo, la venta con AgencyPro y el control de reservas sin depender de disenos estaticos.",
    model1: "Modelo 1",
    model2: "Modelo 2",
    directTitle: "Reserva directa de agencia",
    directBody:
      "Tu equipo entra al panel, busca el tour o traslado, completa la reserva para el cliente y trabaja con la tarifa neta de agencia. Es el modelo ideal cuando la agencia opera la venta de principio a fin.",
    agencyProBody:
      "Crea un enlace comercial con tu propio precio final para tours o traslados. El cliente entra, reserva online y tu agencia conserva el margen definido entre el precio base y el precio de venta.",
    activationEyebrow: "Como se activa",
    activationTitle: "Onboarding comercial y puesta en marcha",
    faqEyebrow: "Preguntas clave",
    faqTitle: "Lo que una agencia necesita entender antes de entrar",
    nextStep: "Siguiente paso",
    finalTitle: "Si tu agencia vende Caribe, AgencyPro te da una estructura mas seria para crecer",
    finalBody:
      "Aplica, valida tu cuenta y activa un workspace con reservas directas, AgencyPro, traslados, control comercial y seguimiento operativo dentro de una sola plataforma.",
    metrics: [
      { value: "2 modelos", label: "Reserva directa y AgencyPro" },
      { value: "Tours + traslados", label: "Inventario listo para vender" },
      { value: "Workspace operativo", label: "Clientes, reservas y seguimiento" },
      { value: "Senales enterprise", label: "Trazabilidad, control y orden comercial" }
    ],
    pillars: [
      {
        title: "Reserva directa de agencia",
        body: "Tu equipo entra al panel, busca el producto, crea la reserva y trabaja con la tarifa neta que le corresponde a la agencia.",
        icon: ClipboardList
      },
      {
        title: "AgencyPro para vender con tu precio",
        body: "Genera enlaces comerciales para tours y traslados con tu precio final. El cliente reserva online y tu agencia conserva el margen definido.",
        icon: Link2
      },
      {
        title: "Operacion mas ordenada",
        body: "Reservas, clientes, fechas, rutas, estados y seguimiento comercial en un mismo panel, sin depender de procesos sueltos.",
        icon: CalendarRange
      },
      {
        title: "Herramienta para crecer",
        body: "Pensado para agencias que quieren responder mas rapido, presentar mejor sus productos y operar con una estructura profesional.",
        icon: MonitorSmartphone
      }
    ],
    heroPoints: [
      "Reserva directa con tarifa neta de agencia y comision ya aplicada en el flujo correcto.",
      "AgencyPro para compartir enlaces con tu propio precio final en tours y traslados.",
      "Panel operativo para reservas, clientes, estados, fechas y seguimiento comercial."
    ],
    screenshotCards: [
      {
        key: "primary" as const,
        title: "Catalogo comercial",
        copy: "Busca tours, revisa netos y crea reservas directas o enlaces AgencyPro desde el mismo flujo."
      },
      {
        key: "secondary" as const,
        title: "Cotizador de traslados",
        copy: "Consulta rutas, vehiculos, ida y vuelta y tarifa neta de agencia sin mezclar precios publicos."
      },
      {
        key: "tertiary" as const,
        title: "Control de reservas",
        copy: "Monitorea clientes, estados, fechas de servicio y detalle operativo desde una vista central."
      }
    ],
    directPoints: [
      "La agencia paga el neto correcto y el sistema reconoce su cuenta.",
      "La reserva queda identificada como venta de agencia y no como cliente web directo."
    ],
    agencyProPoints: [
      "Comparte enlaces por WhatsApp, correo, redes o campañas propias.",
      "Funciona tambien para traslados con ruta, vehiculo y tipo de viaje definidos."
    ],
    workflows: [
      {
        step: "01",
        title: "Solicita acceso y activa tu cuenta",
        body: "Aplicas como agencia, validamos tu perfil comercial y habilitamos tu panel para trabajar con el programa de Proactivitis."
      },
      {
        step: "02",
        title: "Elige como vas a vender",
        body: "Puedes reservar directamente para tus clientes o usar AgencyPro para compartir enlaces con tu precio final."
      },
      {
        step: "03",
        title: "Opera y da seguimiento",
        body: "Controla reservas, traslados, proximas salidas, clientes, estados, margen y actividad comercial desde una sola herramienta."
      }
    ],
    faqs: [
      {
        question: "Como gana dinero una agencia dentro de Proactivitis?",
        answer: "Hay dos modelos. En la reserva directa trabajas con tarifa neta de agencia. En AgencyPro fijas tu precio final y conservas el margen que agregaste."
      },
      {
        question: "AgencyPro funciona tambien para traslados?",
        answer: "Si. La agencia puede generar enlaces comerciales tanto para tours como para traslados y compartirlos directamente con el cliente."
      },
      {
        question: "La plataforma sirve solo en computadora?",
        answer: "No. El panel fue ajustado para trabajo movil, de modo que una agencia pueda cotizar, revisar reservas y operar desde el telefono."
      },
      {
        question: "Que obtiene una agencia despues de ser aprobada?",
        answer: "Acceso a AgencyPro Workspace, catalogo de tours, modulo de traslados, reservas, calendario, reportes, links comerciales y control comercial."
      }
    ],
    enterpriseEyebrow: "Senales de producto serio",
    enterpriseTitle: "Por que AgencyPro se siente como una plataforma y no como un proceso improvisado",
    enterpriseCards: [
      {
        title: "Control por canal",
        body: "Distingue reserva directa de agencia y venta por AgencyPro para que sepas de donde viene cada ingreso."
      },
      {
        title: "Trazabilidad operativa",
        body: "Reservas, links, estados, fechas y actividad quedan conectados en el mismo entorno."
      },
      {
        title: "Cotizacion estructurada",
        body: "Traslados con ruta, vehiculo, ida y vuelta y precio comercial sin depender de cotizaciones manuales."
      },
      {
        title: "Escalabilidad comercial",
        body: "Tu equipo puede vender, operar y dar seguimiento desde una base mucho mas ordenada."
      }
    ]
  },
  en: {
    metadataTitle: "AgencyPro for agencies | Proactivitis",
    metadataDescription:
      "Learn how Proactivitis works for travel agencies: direct bookings, AgencyPro, transfers, operational control, and sales tools.",
    badge: "AgencyPro by Proactivitis",
    heroTitle: "AgencyPro: the commercial workspace for agencies selling tours and transfers with more control",
    heroBody:
      "AgencyPro combines direct bookings, links with your own selling price, transfer quoting, operational control, and commercial traceability in one serious workspace.",
    applyNow: "Apply now",
    seeHow: "See how it works",
    moreControl: "More commercial control",
    seriousWay: "A more professional way to sell tours and transfers",
    ctaApply: "Apply as an agency",
    ctaSales: "Talk to sales",
    screenshotsEyebrow: "Platform screenshots",
    screenshotsTitle: "How an agency works inside AgencyPro",
    screenshotsBody:
      "This landing can display your own panel screenshots. From admin, you can upload them to show the catalog, AgencyPro sales flow, and reservation control without relying on static mockups.",
    model1: "Model 1",
    model2: "Model 2",
    directTitle: "Direct agency booking",
    directBody:
      "Your team enters the panel, finds the tour or transfer, completes the booking for the traveler, and works with the agency net rate. This is ideal when the agency manages the sale end to end.",
    agencyProBody:
      "Create a sales link with your own final price for tours or transfers. The client books online and your agency keeps the margin between the base rate and the final selling price.",
    activationEyebrow: "How it starts",
    activationTitle: "Commercial onboarding and go-live flow",
    faqEyebrow: "Key questions",
    faqTitle: "What an agency should understand before joining",
    nextStep: "Next step",
    finalTitle: "If your agency sells the Caribbean, AgencyPro gives you a stronger structure to grow",
    finalBody:
      "Apply, validate your account, and launch a workspace with direct bookings, AgencyPro links, transfers, commercial control, and operational follow-up inside one platform.",
    metrics: [
      { value: "2 models", label: "Direct booking and AgencyPro" },
      { value: "Tours + transfers", label: "Inventory ready to sell" },
      { value: "Operational workspace", label: "Clients, bookings, and follow-up" },
      { value: "Enterprise signals", label: "Traceability, control, and commercial order" }
    ],
    pillars: [
      {
        title: "Direct agency booking",
        body: "Your team enters the panel, finds the product, creates the booking, and works with the agency net rate.",
        icon: ClipboardList
      },
      {
        title: "AgencyPro for custom pricing",
        body: "Generate sales links for tours and transfers with your own final price. The client books online and your agency keeps the defined margin.",
        icon: Link2
      },
      {
        title: "Better operational control",
        body: "Bookings, clients, dates, routes, statuses, and commercial follow-up in one panel instead of scattered processes.",
        icon: CalendarRange
      },
      {
        title: "Built to help you grow",
        body: "Designed for agencies that want faster responses, better presentation, and a more professional operating structure.",
        icon: MonitorSmartphone
      }
    ],
    heroPoints: [
      "Direct booking with agency net rate and commission logic applied in the correct workflow.",
      "AgencyPro links with your own final selling price for tours and transfers.",
      "Operational panel for bookings, clients, statuses, dates, and commercial follow-up."
    ],
    screenshotCards: [
      {
        key: "primary" as const,
        title: "Commercial catalog",
        copy: "Search tours, review net rates, and create direct bookings or AgencyPro links from the same workflow."
      },
      {
        key: "secondary" as const,
        title: "Transfer quoting",
        copy: "Check routes, vehicles, round trips, and agency net rates without mixing public pricing."
      },
      {
        key: "tertiary" as const,
        title: "Reservation control",
        copy: "Monitor clients, statuses, service dates, and operational detail from one central view."
      }
    ],
    directPoints: [
      "The agency pays the correct net rate and the system recognizes the account properly.",
      "The booking stays marked as an agency sale instead of a direct web customer booking."
    ],
    agencyProPoints: [
      "Share links via WhatsApp, email, social media, or your own campaigns.",
      "Also works for transfers with route, vehicle, and trip type already defined."
    ],
    workflows: [
      {
        step: "01",
        title: "Apply and activate your account",
        body: "You apply as an agency, we validate your business profile, and then unlock your panel."
      },
      {
        step: "02",
        title: "Choose how you want to sell",
        body: "Use direct booking for managed reservations or AgencyPro when you want to share your own selling price."
      },
      {
        step: "03",
        title: "Operate and follow up",
        body: "Control bookings, transfers, upcoming services, clients, statuses, margin, and sales activity from one tool."
      }
    ],
    faqs: [
      {
        question: "How does an agency earn money inside Proactivitis?",
        answer: "There are two models. With direct booking you work with the agency net rate. With AgencyPro you define the final price and keep the added margin."
      },
      {
        question: "Does AgencyPro also work for transfers?",
        answer: "Yes. Agencies can generate commercial links for both tours and transfers and share them directly with clients."
      },
      {
        question: "Is the platform only for desktop use?",
        answer: "No. The agency panel was adapted for mobile work so your team can quote, review bookings, and operate from a phone."
      },
      {
        question: "What does an agency get once approved?",
        answer: "Access to the AgencyPro workspace, tour catalog, transfer workspace, bookings, calendar, reports, commercial links, and commercial control."
      }
    ],
    enterpriseEyebrow: "Signals of a serious product",
    enterpriseTitle: "Why AgencyPro feels like a platform instead of a messy manual workflow",
    enterpriseCards: [
      {
        title: "Channel control",
        body: "Separate direct agency booking from AgencyPro link sales so every revenue source is visible."
      },
      {
        title: "Operational traceability",
        body: "Bookings, links, statuses, dates, and activity stay connected inside the same environment."
      },
      {
        title: "Structured quoting",
        body: "Transfers with route, vehicle, round trip logic, and commercial pricing without manual quoting chaos."
      },
      {
        title: "Commercial scalability",
        body: "Your team can sell, operate, and follow up from a more organized base."
      }
    ]
  },
  fr: {
    metadataTitle: "AgencyPro pour agences | Proactivitis",
    metadataDescription:
      "Decouvrez comment Proactivitis fonctionne pour les agences: reservations directes, AgencyPro, transferts, controle operationnel et outils commerciaux.",
    badge: "AgencyPro by Proactivitis",
    heroTitle: "AgencyPro : l espace commercial pour les agences qui vendent tours et transferts avec plus de controle",
    heroBody:
      "AgencyPro combine reservations directes, liens avec votre propre prix, devis transferts, controle operationnel et tracabilite commerciale dans un seul espace de travail.",
    applyNow: "Postuler",
    seeHow: "Voir le fonctionnement",
    moreControl: "Plus de controle commercial",
    seriousWay: "Une facon plus professionnelle de vendre excursions et transferts",
    ctaApply: "Postuler comme agence",
    ctaSales: "Parler aux ventes",
    screenshotsEyebrow: "Captures de la plateforme",
    screenshotsTitle: "Comment une agence travaille dans AgencyPro",
    screenshotsBody:
      "Cette landing peut afficher vos propres captures d ecran du panneau. Depuis l admin, vous pouvez les televerser pour montrer le catalogue, la vente AgencyPro et le controle des reservations sans maquettes fixes.",
    model1: "Modele 1",
    model2: "Modele 2",
    directTitle: "Reservation directe agence",
    directBody:
      "Votre equipe entre dans le panneau, trouve le tour ou le transfert, complete la reservation pour le client et travaille avec le tarif net agence. Ideal quand l agence gere la vente de bout en bout.",
    agencyProBody:
      "Creez un lien commercial avec votre prix final pour tours ou transferts. Le client reserve en ligne et votre agence conserve la marge entre le prix de base et le prix final.",
    activationEyebrow: "Mise en route",
    activationTitle: "Onboarding commercial et mise en route",
    faqEyebrow: "Questions cles",
    faqTitle: "Ce qu une agence doit comprendre avant d entrer",
    nextStep: "Etape suivante",
    finalTitle: "Si votre agence vend les Caraibes, AgencyPro vous donne une structure plus solide pour grandir",
    finalBody:
      "Postulez, validez votre compte et activez un workspace avec reservations directes, AgencyPro, transferts, controle commercial et suivi operationnel dans une seule plateforme.",
    metrics: [
      { value: "2 modeles", label: "Reservation directe et AgencyPro" },
      { value: "Tours + transferts", label: "Inventaire pret a vendre" },
      { value: "Workspace operationnel", label: "Clients, reservations et suivi" },
      { value: "Signaux enterprise", label: "Tracabilite, controle et ordre commercial" }
    ],
    pillars: [
      {
        title: "Reservation directe agence",
        body: "Votre equipe entre dans le panneau, trouve le produit, cree la reservation et travaille avec le tarif net agence.",
        icon: ClipboardList
      },
      {
        title: "AgencyPro pour votre propre prix",
        body: "Generez des liens commerciaux pour tours et transferts avec votre prix final. Le client reserve en ligne et votre agence conserve la marge definie.",
        icon: Link2
      },
      {
        title: "Meilleur controle operationnel",
        body: "Reservations, clients, dates, routes, statuts et suivi commercial dans un meme panneau au lieu de processus disperses.",
        icon: CalendarRange
      },
      {
        title: "Concu pour grandir",
        body: "Pense pour les agences qui veulent repondre plus vite, mieux presenter leurs produits et operer de facon plus professionnelle.",
        icon: MonitorSmartphone
      }
    ],
    heroPoints: [
      "Reservation directe avec tarif net agence et logique de commission dans le bon flux.",
      "Liens AgencyPro avec votre propre prix final pour tours et transferts.",
      "Panneau operationnel pour reservations, clients, statuts, dates et suivi commercial."
    ],
    screenshotCards: [
      {
        key: "primary" as const,
        title: "Catalogue commercial",
        copy: "Recherchez des tours, verifiez les tarifs nets et creez des reservations directes ou des liens AgencyPro depuis le meme flux."
      },
      {
        key: "secondary" as const,
        title: "Devis transferts",
        copy: "Consultez routes, vehicules, aller-retour et tarifs nets agence sans melanger les prix publics."
      },
      {
        key: "tertiary" as const,
        title: "Controle des reservations",
        copy: "Suivez clients, statuts, dates de service et detail operationnel depuis une vue centrale."
      }
    ],
    directPoints: [
      "L agence paie le bon tarif net et le systeme reconnait correctement son compte.",
      "La reservation reste identifiee comme vente agence et non comme client web direct."
    ],
    agencyProPoints: [
      "Partagez les liens via WhatsApp, email, reseaux sociaux ou vos campagnes.",
      "Fonctionne aussi pour les transferts avec route, vehicule et type de trajet deja definis."
    ],
    workflows: [
      {
        step: "01",
        title: "Postulez et activez votre compte",
        body: "Vous postulez comme agence, nous validons votre profil commercial puis ouvrons votre panneau."
      },
      {
        step: "02",
        title: "Choisissez votre mode de vente",
        body: "Utilisez la reservation directe pour les ventes gerees par votre equipe ou AgencyPro pour partager votre propre prix."
      },
      {
        step: "03",
        title: "Operez et suivez",
        body: "Controlez reservations, transferts, prochaines sorties, clients, statuts, marge et activite commerciale depuis un seul outil."
      }
    ],
    faqs: [
      {
        question: "Comment une agence gagne-t-elle de l argent avec Proactivitis?",
        answer: "Il y a deux modeles. Avec la reservation directe vous travaillez au tarif net agence. Avec AgencyPro vous fixez le prix final et gardez la marge ajoutee."
      },
      {
        question: "AgencyPro fonctionne-t-il aussi pour les transferts?",
        answer: "Oui. Les agences peuvent creer des liens commerciaux pour les tours et les transferts et les partager directement au client."
      },
      {
        question: "La plateforme est-elle seulement pour ordinateur?",
        answer: "Non. Le panneau agence a ete adapte au mobile pour permettre de coter, suivre les reservations et operer depuis un telephone."
      },
      {
        question: "Que recoit une agence une fois approuvee?",
        answer: "Acces au workspace AgencyPro, catalogue de tours, module transferts, reservations, calendrier, rapports, liens commerciaux et controle commercial."
      }
    ],
    enterpriseEyebrow: "Signaux de produit serieux",
    enterpriseTitle: "Pourquoi AgencyPro ressemble a une plateforme et non a un flux manuel desordonne",
    enterpriseCards: [
      {
        title: "Controle par canal",
        body: "Separer reservation directe et ventes par lien AgencyPro pour voir clairement chaque source de revenu."
      },
      {
        title: "Tracabilite operationnelle",
        body: "Reservations, liens, statuts, dates et activite restent relies dans le meme environnement."
      },
      {
        title: "Devis structures",
        body: "Transferts avec route, vehicule, aller-retour et prix commercial sans chaos de devis manuels."
      },
      {
        title: "Scalabilite commerciale",
        body: "Votre equipe peut vendre, operer et suivre depuis une base beaucoup plus organisee."
      }
    ]
  }
} as const;

function ScreenshotCard({
  src,
  title,
  copy
}: {
  src?: string;
  title: string;
  copy: string;
}) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-[linear-gradient(135deg,#e2e8f0,#f8fafc)]">
        {src ? (
          <Image src={src} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <div className="w-full max-w-sm rounded-[24px] border border-slate-200 bg-white p-4 shadow-md">
              <div className="h-3 w-28 rounded-full bg-slate-200" />
              <div className="mt-4 grid gap-3">
                <div className="h-16 rounded-2xl bg-slate-100" />
                <div className="h-16 rounded-2xl bg-slate-100" />
                <div className="h-16 rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2 p-6">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{copy}</p>
      </div>
    </article>
  );
}

export function getAgencyProgramMetadata(locale: Locale) {
  const copy = copyByLocale[locale];
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription
  };
}

export async function AgencyProgramPage({ locale }: { locale: Locale }) {
  const copy = copyByLocale[locale];
  const content = await getAgencyTutorialContentOverrides();
  const basePrefix = locale === "es" ? "" : `/${locale}`;

  const screenshots = {
    primary: content.screenshotPrimary,
    secondary: content.screenshotSecondary,
    tertiary: content.screenshotTertiary
  };

  return (
    <div className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        <section className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              {copy.badge}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
                {copy.heroTitle}
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-slate-600">{copy.heroBody}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`${basePrefix}/agency-partners`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800"
              >
                {copy.applyNow}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#capturas"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-700 transition hover:border-slate-400"
              >
                {copy.seeHow}
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {copy.metrics.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <p className="text-base font-semibold text-slate-950">{item.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-xl">
            <div className="rounded-[28px] bg-[radial-gradient(circle_at_top_left,#1e293b,#0f172a_65%)] p-6 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
                {copy.moreControl}
              </p>
              <h2 className="mt-3 text-3xl font-semibold">{copy.seriousWay}</h2>
              <div className="mt-6 grid gap-4">
                {[BadgeDollarSign, Link2, ShieldCheck].map((Icon, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Icon className="mt-0.5 h-5 w-5 text-emerald-300" />
                    <p className="text-sm text-slate-100">{copy.heroPoints[index]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {copy.pillars.map((item) => (
            <article key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </article>
          ))}
        </section>

        <section id="capturas" className="mt-16 space-y-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{copy.screenshotsEyebrow}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{copy.screenshotsTitle}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{copy.screenshotsBody}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {copy.screenshotCards.map((item) => (
              <ScreenshotCard key={item.key} src={screenshots[item.key]} title={item.title} copy={item.copy} />
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{copy.model1}</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">{copy.directTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{copy.directBody}</p>
            <div className="mt-5 grid gap-3">
              {copy.directPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {index === 0 ? (
                    <BadgeDollarSign className="mt-0.5 h-5 w-5 text-slate-700" />
                  ) : (
                    <ClipboardList className="mt-0.5 h-5 w-5 text-slate-700" />
                  )}
                  <p className="text-sm text-slate-700">{point}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-slate-200 bg-slate-950 p-7 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">{copy.model2}</p>
            <h2 className="mt-3 text-3xl font-semibold">AgencyPro</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">{copy.agencyProBody}</p>
            <div className="mt-5 grid gap-3">
              {copy.agencyProPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  {index === 0 ? (
                    <Link2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                  ) : (
                    <Route className="mt-0.5 h-5 w-5 text-emerald-300" />
                  )}
                  <p className="text-sm text-slate-100">{point}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
          <article className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{copy.activationEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">{copy.activationTitle}</h2>
            <div className="mt-6 space-y-4">
              {copy.workflows.map((item) => (
                <div key={item.step} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">Paso {item.step}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{copy.faqEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">{copy.faqTitle}</h2>
            <div className="mt-6 space-y-4">
              {copy.faqs.map((item) => (
                <div key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-950">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{copy.enterpriseEyebrow}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{copy.enterpriseTitle}</h2>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {copy.enterpriseCards.map((item) => (
              <article key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">AgencyPro</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#111827_65%,#14532d)] px-8 py-10 text-white shadow-xl">
          <div className="grid gap-6 lg:grid-cols-[1fr,auto] lg:items-center">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">{copy.nextStep}</p>
              <h2 className="text-3xl font-semibold md:text-4xl">{copy.finalTitle}</h2>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-200">{copy.finalBody}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href={`${basePrefix}/agency-partners`}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:bg-slate-100"
              >
                {copy.ctaApply}
              </Link>
              <Link
                href={`${basePrefix}/contact`}
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-white/10"
              >
                {copy.ctaSales}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
