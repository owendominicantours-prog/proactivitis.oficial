import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { slugifyBlog } from "../lib/blog";
import { buildSeoBlogDraft } from "./seoBlogWriter";

const prisma = new PrismaClient();

type Cluster =
  | "comparativas"
  | "luxury"
  | "deportes"
  | "golf"
  | "foto"
  | "movilidad"
  | "compras"
  | "salud"
  | "inversion"
  | "nightlife"
  | "familiar"
  | "global"
  | "conversion";

type KeywordEntry = {
  keyword: string;
  cluster: Cluster;
};

const KEYWORDS: KeywordEntry[] = [
  { keyword: "Punta Cana o Puerto Plata para familias", cluster: "comparativas" },
  { keyword: "Diferencia entre Bavaro y Cap Cana", cluster: "comparativas" },
  { keyword: "Es mejor Riu o Iberostar en Punta Cana", cluster: "comparativas" },
  { keyword: "Consejos para viajar a Punta Cana con bebes", cluster: "comparativas" },
  { keyword: "Que ropa llevar a Punta Cana en diciembre", cluster: "comparativas" },
  { keyword: "Presupuesto diario para comer en Punta Cana", cluster: "comparativas" },
  { keyword: "Se puede beber agua del grifo en Punta Cana", cluster: "comparativas" },
  { keyword: "Evitar estafas en excursiones Punta Cana", cluster: "comparativas" },
  { keyword: "Como regatear en los mercados de artesania", cluster: "comparativas" },
  { keyword: "Mejores meses para evitar el sargazo", cluster: "comparativas" },
  { keyword: "Cuantos dias se necesitan para ver Punta Cana", cluster: "comparativas" },
  { keyword: "Opiniones sobre paquetes de viaje Expedia Punta Cana", cluster: "comparativas" },
  { keyword: "Mejores tarjetas de credito para viajar al Caribe", cluster: "comparativas" },
  { keyword: "Punta Cana vs Cancun vs Tulum 2026", cluster: "comparativas" },
  { keyword: "Vale la pena el Club VIP de los hoteles", cluster: "comparativas" },
  { keyword: "Como reservar cenas en los hoteles todo incluido", cluster: "comparativas" },
  { keyword: "Dress code en restaurantes de lujo Punta Cana", cluster: "comparativas" },
  { keyword: "Alquilar coche o usar Uber en Punta Cana", cluster: "comparativas" },
  { keyword: "Excursiones recomendadas para mayores de 60", cluster: "comparativas" },
  { keyword: "Bodas de destino en Punta Cana costos", cluster: "comparativas" },
  { keyword: "Alquiler de villas privadas en Casa de Campo cerca de PC", cluster: "luxury" },
  { keyword: "Inversion inmobiliaria en Punta Cana 2026", cluster: "luxury" },
  { keyword: "Proyectos de apartamentos en preventa Punta Cana", cluster: "luxury" },
  { keyword: "Campos de golf de clase mundial Corales y Punta Espada", cluster: "luxury" },
  { keyword: "Torneo de Golf PGA Tour Corales Puntacana", cluster: "luxury" },
  { keyword: "Spa de lujo Six Senses Punta Cana", cluster: "luxury" },
  { keyword: "Retiros de yoga en Punta Cana", cluster: "luxury" },
  { keyword: "Eventos corporativos y convenciones Punta Cana", cluster: "luxury" },
  { keyword: "Alquiler de jets privados Punta Cana", cluster: "luxury" },
  { keyword: "Helipuertos en hoteles de Punta Cana", cluster: "luxury" },
  { keyword: "Kitesurf en Playa Blanca Punta Cana cursos", cluster: "deportes" },
  { keyword: "Mejores puntos de buceo en Bavaro 2026", cluster: "deportes" },
  { keyword: "Alquiler de equipos de Snorkel en Cabeza de Toro", cluster: "deportes" },
  { keyword: "Deep Sea Fishing Punta Cana charters privados", cluster: "deportes" },
  { keyword: "Torneo de pesca Marlin Azul Cap Cana", cluster: "deportes" },
  { keyword: "Clases de Surf en Playa Macao precios", cluster: "deportes" },
  { keyword: "Windsurf en los hoteles de Uvero Alto", cluster: "deportes" },
  { keyword: "Alquiler de Hobie Cat en resorts Riu", cluster: "deportes" },
  { keyword: "Kayak transparente Punta Cana fotos", cluster: "deportes" },
  { keyword: "Excursion de buceo al barco hundido Astron", cluster: "deportes" },
  { keyword: "Certificacion PADI en Punta Cana escuelas", cluster: "deportes" },
  { keyword: "Flyboard Punta Cana experiencia", cluster: "deportes" },
  { keyword: "Wakeboarding en el lago de Downtown", cluster: "deportes" },
  { keyword: "Paddle Board yoga en la laguna", cluster: "deportes" },
  { keyword: "Encuentro con mantarrayas y tiburones Stingray Bay", cluster: "deportes" },
  { keyword: "Green fees Punta Espada Golf Club", cluster: "golf" },
  { keyword: "Corales Golf Course tarifas 2026", cluster: "golf" },
  { keyword: "La Cana Golf Club 27 hoyos", cluster: "golf" },
  { keyword: "Cocotal Golf & Country Club membresias", cluster: "golf" },
  { keyword: "Hard Rock Golf Club at Cana Bay", cluster: "golf" },
  { keyword: "Iberostar Bavaro Golf Club campo", cluster: "golf" },
  { keyword: "Dye Fore Golf Course Casa de Campo", cluster: "golf" },
  { keyword: "Teeth of the Dog excursion desde Punta Cana", cluster: "golf" },
  { keyword: "Academias de golf en Punta Cana para ninos", cluster: "golf" },
  { keyword: "Torneos de tenis en los hoteles de Cap Cana", cluster: "golf" },
  { keyword: "Fotografos de bodas en Punta Cana precios", cluster: "foto" },
  { keyword: "Sesion de fotos Trash the Dress en la playa", cluster: "foto" },
  { keyword: "Mejores lugares para fotos de Instagram en Punta Cana", cluster: "foto" },
  { keyword: "Paquetes de renovacion de votos matrimoniales", cluster: "foto" },
  { keyword: "Bodas civiles en Republica Dominicana requisitos", cluster: "foto" },
  { keyword: "Alquiler de vestidos para fotos en la playa", cluster: "foto" },
  { keyword: "Maquillistas profesionales para novias en Bavaro", cluster: "foto" },
  { keyword: "Decoracion de eventos corporativos Punta Cana", cluster: "foto" },
  { keyword: "Alquiler de drones para eventos en el Caribe", cluster: "foto" },
  { keyword: "Video de boda con tomas aereas Punta Cana", cluster: "foto" },
  { keyword: "Como ir de Punta Cana a Samana en bus", cluster: "movilidad" },
  { keyword: "Transporte Espinal de Punta Cana a Santiago", cluster: "movilidad" },
  { keyword: "Expreso Bavaro horarios 2026", cluster: "movilidad" },
  { keyword: "Parada de guaguas en Veron", cluster: "movilidad" },
  { keyword: "Alquiler de scooters en El Cortecito", cluster: "movilidad" },
  { keyword: "Motoconcho en Bavaro precios y seguridad", cluster: "movilidad" },
  { keyword: "Taxis de Cap Cana tarifas fijas", cluster: "movilidad" },
  { keyword: "Estaciones de carga electrica en Punta Cana Tesla Evergo", cluster: "movilidad" },
  { keyword: "Gasolineras Sunix y Shell en el Boulevard Turistico", cluster: "movilidad" },
  { keyword: "Tiempo de conduccion Punta Cana a Bayahibe", cluster: "movilidad" },
  { keyword: "Tiendas de lujo en BlueMall Puntacana", cluster: "compras" },
  { keyword: "Supermercado Nacional Punta Cana productos", cluster: "compras" },
  { keyword: "Farmacia Los Hidalgos Bavaro", cluster: "compras" },
  { keyword: "Comprar puros dominicanos autenticos Arturo Fuente", cluster: "compras" },
  { keyword: "Tiendas de souvenirs en Bibijagua precios", cluster: "compras" },
  { keyword: "Comprar Larimar y Ambar en Punta Cana consejos", cluster: "compras" },
  { keyword: "Ron Dominicano Brugal Barcelo Bermudez donde comprar", cluster: "compras" },
  { keyword: "Ropa de playa y trajes de bano en tiendas locales", cluster: "compras" },
  { keyword: "Opticas y servicios dentales en Punta Cana", cluster: "compras" },
  { keyword: "Salones de belleza y peluquerias en Bavaro", cluster: "compras" },
  { keyword: "Centro Medico Punta Cana emergencias", cluster: "salud" },
  { keyword: "Hospital IMG Boulevard Turistico", cluster: "salud" },
  { keyword: "Seguro de salud internacional aceptado en RD", cluster: "salud" },
  { keyword: "Clinicas dentales para turismo medico en Punta Cana", cluster: "salud" },
  { keyword: "Laboratorios para pruebas COVID o gripe en el hotel", cluster: "salud" },
  { keyword: "Hay mosquitos en Punta Cana en verano", cluster: "salud" },
  { keyword: "Mejores repelentes para el Caribe", cluster: "salud" },
  { keyword: "Proteccion solar recomendada biodegradable", cluster: "salud" },
  { keyword: "Numeros de emergencia Republica Dominicana 911", cluster: "salud" },
  { keyword: "Policia Turistica CESTUR Punta Cana oficinas", cluster: "salud" },
  { keyword: "Apartamentos en venta en Punta Cana 2026", cluster: "inversion" },
  { keyword: "Invertir en Cana Bay Hard Rock Golf", cluster: "inversion" },
  { keyword: "Proyectos inmobiliarios en Vista Cana", cluster: "inversion" },
  { keyword: "Ley de Confotur beneficios fiscales RD", cluster: "inversion" },
  { keyword: "Administradores de propiedades en Bavaro Property Management", cluster: "inversion" },
  { keyword: "Rentabilidad de alquiler corto plazo Airbnb Punta Cana", cluster: "inversion" },
  { keyword: "Comprar terrenos en Playa Macao", cluster: "inversion" },
  { keyword: "Notarios y abogados inmobiliarios en Punta Cana", cluster: "inversion" },
  { keyword: "Prestamos hipotecarios para extranjeros en RD", cluster: "inversion" },
  { keyword: "Condominios con acceso a club de playa", cluster: "inversion" },
  { keyword: "Discoteca Pacha Punta Cana Riu", cluster: "nightlife" },
  { keyword: "Drink Point Friusa ambiente local", cluster: "nightlife" },
  { keyword: "Onno’s Eat & Drink Bavaro happy hour", cluster: "nightlife" },
  { keyword: "Soles Chill Out Bar Los Corales", cluster: "nightlife" },
  { keyword: "Restaurantes con musica en vivo Punta Cana", cluster: "nightlife" },
  { keyword: "Shows de noche en hoteles Iberostar", cluster: "nightlife" },
  { keyword: "Casinos abiertos 24 horas en Punta Cana", cluster: "nightlife" },
  { keyword: "Torneos de Poker en Hard Rock Casino", cluster: "nightlife" },
  { keyword: "Eventos de musica electronica Punta Cana 2026", cluster: "nightlife" },
  { keyword: "Conciertos en el Anfiteatro de BlueMall", cluster: "nightlife" },
  { keyword: "Viajar a Punta Cana con ninos de 2 anos", cluster: "familiar" },
  { keyword: "Hoteles con cunas y servicio de ninera", cluster: "familiar" },
  { keyword: "Mejores parques acuaticos dentro de hoteles", cluster: "familiar" },
  { keyword: "Actividades para adolescentes en Punta Cana", cluster: "familiar" },
  { keyword: "Resorts accesibles para personas en silla de ruedas", cluster: "familiar" },
  { keyword: "Menus para celiacos en hoteles todo incluido", cluster: "familiar" },
  { keyword: "Hoteles con opciones veganas y vegetarianas", cluster: "familiar" },
  { keyword: "Clubes de ninos Kids Club con mejores actividades", cluster: "familiar" },
  { keyword: "Viajes de graduacion a Punta Cana paquetes", cluster: "familiar" },
  { keyword: "Resorts tranquilos para personas mayores", cluster: "familiar" },
  { keyword: "Punta Cana vs Cancun cual es mas barato", cluster: "global" },
  { keyword: "Es mejor la playa de Aruba o Punta Cana", cluster: "global" },
  { keyword: "Punta Cana vs Riviera Maya para luna de miel", cluster: "global" },
  { keyword: "Comparativa Hoteles Riu vs Iberostar vs Bahia Principe", cluster: "global" },
  { keyword: "Diferencia entre Uvero Alto y Playa Bavaro", cluster: "global" },
  { keyword: "Vale la pena pagar Cap Cana o quedarse en Bavaro", cluster: "global" },
  { keyword: "Punta Cana vs Jamaica seguridad 2026", cluster: "global" },
  { keyword: "Mejores destinos del Caribe para 2026", cluster: "global" },
  { keyword: "Codigo promocional hoteles Punta Cana", cluster: "conversion" },
  { keyword: "Ofertas Flash viaje Punta Cana todo incluido", cluster: "conversion" },
  { keyword: "Paquetes vuelo hotel Republica Dominicana", cluster: "conversion" },
  { keyword: "Reserva ahora paga despues Punta Cana", cluster: "conversion" },
  { keyword: "Descuentos para residentes dominicanos en hoteles", cluster: "conversion" },
  { keyword: "Grupos de Facebook para viajeros a Punta Cana", cluster: "conversion" },
  { keyword: "Black Friday ofertas Punta Cana 2026", cluster: "conversion" },
  { keyword: "Cyber Monday viajes al Caribe", cluster: "conversion" },
  { keyword: "Errores de precio vuelos Punta Cana", cluster: "conversion" },
  { keyword: "Ultimo minuto resorts Punta Cana hoy", cluster: "conversion" }
];

const CLUSTER_CONFIG: Record<
  Cluster,
  {
    titlePrefix: string;
    excerptLead: string;
    intro: string;
    planning: string;
    practicalBlockTitle: string;
    practicalTips: string[];
    mistakesTitle: string;
    mistakes: string[];
    close: string;
    ctaLabel: string;
    ctaHref: string;
    ctaSupportHref: string;
  }
> = {
  comparativas: {
    titlePrefix: "Comparativa de viaje",
    excerptLead: "Comparativa clara para elegir mejor y viajar con mas seguridad.",
    intro:
      "Cuando comparas opciones de viaje, necesitas informacion concreta para decidir sin dudas y sin perder presupuesto.",
    planning:
      "La comparacion correcta no es solo precio: tambien influyen distancias, tiempos de traslado y tipo de experiencia que buscas.",
    practicalBlockTitle: "Como comparar destinos o servicios de forma util",
    practicalTips: [
      "Compara costo total y no solo precio base.",
      "Revisa logistica de transporte y tiempos reales.",
      "Define prioridad: playa, descanso, aventura o vida nocturna.",
      "Elige segun perfil del grupo y edad de viajeros."
    ],
    mistakesTitle: "Errores comunes al comparar opciones",
    mistakes: [
      "Decidir por precio sin revisar ubicacion.",
      "No validar condiciones de cancelacion.",
      "Ignorar gastos extra de transporte o accesos."
    ],
    close:
      "Una comparacion bien hecha reduce sorpresas y te permite reservar con confianza desde el inicio.",
    ctaLabel: "Ver tours recomendados",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  luxury: {
    titlePrefix: "Guia premium",
    excerptLead: "Experiencias premium en Punta Cana con enfoque real de servicio y confort.",
    intro:
      "Si buscas opciones de lujo, lo importante es asegurar servicio consistente, privacidad y una logistica impecable.",
    planning:
      "En viajes premium, cada detalle cuenta: desde el traslado hasta la seleccion del hotel o experiencia privada.",
    practicalBlockTitle: "Claves para una experiencia premium real",
    practicalTips: [
      "Prioriza proveedores con soporte directo y rapido.",
      "Confirma privacidad, capacidad y horarios.",
      "Solicita detalle de todo lo incluido antes de pagar.",
      "Coordina movilidad VIP para evitar esperas."
    ],
    mistakesTitle: "Errores frecuentes en reservas premium",
    mistakes: [
      "Pagar sobreprecio sin validar valor real del servicio.",
      "No revisar condiciones de cambios o reprogramacion.",
      "Dejar traslados para ultimo momento."
    ],
    close:
      "Una experiencia premium bien cerrada se nota en comodidad, tiempos y atencion personalizada durante todo el viaje.",
    ctaLabel: "Explorar experiencias premium",
    ctaHref: "/punta-cana/premium-transfer-services",
    ctaSupportHref: "/hoteles"
  },
  deportes: {
    titlePrefix: "Guia de actividad",
    excerptLead: "Guia practica para deportes y actividades acuaticas en Punta Cana.",
    intro:
      "Las actividades deportivas requieren mas planificacion que un tour tradicional. Elegir bien evita cancelaciones y mejora la experiencia.",
    planning:
      "Antes de reservar, conviene revisar nivel fisico, condiciones del mar y requisitos tecnicos de cada actividad.",
    practicalBlockTitle: "Checklist para actividades deportivas",
    practicalTips: [
      "Valida experiencia previa si la actividad lo requiere.",
      "Revisa condiciones de clima y mar por temporada.",
      "Confirma equipamiento incluido.",
      "Coordina traslado con margen de tiempo."
    ],
    mistakesTitle: "Errores frecuentes en deportes de aventura",
    mistakes: [
      "Reservar sin leer requisitos fisicos.",
      "No llevar ropa/equipo adecuado.",
      "Programar la actividad sin margen de movilidad."
    ],
    close:
      "Con buena preparacion, las actividades deportivas en Punta Cana son mas seguras y mucho mas disfrutables.",
    ctaLabel: "Reservar actividades",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  golf: {
    titlePrefix: "Guia de golf",
    excerptLead: "Campos, tarifas y recomendaciones de golf para viajeros exigentes.",
    intro:
      "El golf en Punta Cana combina escenarios top y servicios premium. Para disfrutarlo, la planificacion marca diferencia.",
    planning:
      "Reserva tee times con antelacion, confirma green fees actualizados y organiza movilidad privada para cumplir horarios.",
    practicalBlockTitle: "Como planear una jornada de golf sin fricciones",
    practicalTips: [
      "Confirma horarios y disponibilidad del campo.",
      "Revisa codigo de vestimenta y reglas locales.",
      "Valida costo final de carrito, caddie o equipos.",
      "Coordina traslados de ida y vuelta con tiempo."
    ],
    mistakesTitle: "Errores frecuentes en viajes de golf",
    mistakes: [
      "No reservar con anticipacion en temporada alta.",
      "Asumir tarifas sin confirmar cargos adicionales.",
      "Subestimar distancias entre hotel y campo."
    ],
    close:
      "Con un plan bien armado, el golf en Punta Cana se convierte en una experiencia de alto nivel desde el primer hoyo.",
    ctaLabel: "Ver experiencias y traslados",
    ctaHref: "/tours",
    ctaSupportHref: "/punta-cana/premium-transfer-services"
  },
  foto: {
    titlePrefix: "Guia visual y eventos",
    excerptLead: "Bodas, fotografia y eventos con recomendaciones reales de planificacion.",
    intro:
      "Los eventos visuales en Punta Cana requieren coordinacion fina: clima, ubicacion, horarios y movilidad del equipo.",
    planning:
      "Con un cronograma claro y buenas locaciones, los resultados mejoran y se reducen retrasos durante el dia del evento.",
    practicalBlockTitle: "Puntos clave para sesiones y eventos",
    practicalTips: [
      "Define locacion y horario segun luz natural.",
      "Confirma permisos o accesos en zonas privadas.",
      "Ten plan B por lluvia o cambios de clima.",
      "Coordina transporte para equipo y participantes."
    ],
    mistakesTitle: "Errores frecuentes en producciones de foto y video",
    mistakes: [
      "Improvisar locacion sin visita previa.",
      "No reservar transporte para todo el equipo.",
      "No considerar tiempos de montaje y desplazamiento."
    ],
    close:
      "La diferencia entre una sesion regular y una excelente suele estar en la planificacion previa.",
    ctaLabel: "Planificar experiencia",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  movilidad: {
    titlePrefix: "Movilidad y rutas",
    excerptLead: "Transporte interno y rutas regionales explicadas de forma simple y util.",
    intro:
      "Moverse bien en Punta Cana cambia por completo la experiencia. Con una ruta clara, aprovechas mas tiempo y evitas estres.",
    planning:
      "Antes de salir, define como te moveras entre aeropuerto, hotel, playas y actividades para evitar gastos imprevistos.",
    practicalBlockTitle: "Como organizar tu movilidad en Punta Cana",
    practicalTips: [
      "Confirma tarifa estimada antes de iniciar el traslado.",
      "Prioriza transporte formal para trayectos largos.",
      "Guarda opciones de respaldo para horas pico.",
      "Ten ubicaciones clave guardadas en el movil."
    ],
    mistakesTitle: "Errores comunes de movilidad",
    mistakes: [
      "Subir sin acordar tarifa o ruta.",
      "No validar seguridad en transporte informal.",
      "Programar salidas sin margen de tiempo."
    ],
    close:
      "Una movilidad bien planificada te da mas libertad para disfrutar el destino sin depender de improvisaciones.",
    ctaLabel: "Cotizar traslado",
    ctaHref: "/traslado",
    ctaSupportHref: "/tours"
  },
  compras: {
    titlePrefix: "Guia de compras y servicios",
    excerptLead: "Recomendaciones utiles para compras y servicios diarios en Punta Cana.",
    intro:
      "Saber donde comprar y resolver servicios basicos te permite viajar mas comodo y evitar precios inflados para turistas.",
    planning:
      "Una buena referencia de supermercados, farmacias y zonas de compra te ayuda a controlar mejor el presupuesto.",
    practicalBlockTitle: "Checklist para compras inteligentes en destino",
    practicalTips: [
      "Compara precios en mas de un punto antes de comprar.",
      "Pregunta por horarios reales de apertura.",
      "Evita cargar efectivo excesivo en salidas largas.",
      "Compra souvenirs en zonas con referencias claras."
    ],
    mistakesTitle: "Errores comunes al comprar en viaje",
    mistakes: [
      "Comprar en el primer lugar sin comparar.",
      "No revisar autenticidad en productos tipicos.",
      "No considerar transporte de regreso con compras."
    ],
    close:
      "Con informacion local correcta, compras mejor, gastas menos y aprovechas el viaje con mas tranquilidad.",
    ctaLabel: "Ver actividades cercanas",
    ctaHref: "/tours",
    ctaSupportHref: "/hoteles"
  },
  salud: {
    titlePrefix: "Guia de salud y seguridad",
    excerptLead: "Informacion de salud y seguridad para viajar con confianza.",
    intro:
      "Resolver dudas de salud antes de viajar reduce ansiedad y permite disfrutar mas cada actividad en destino.",
    planning:
      "Conocer hospitales, farmacias y recomendaciones basicas te da un plan claro ante cualquier imprevisto.",
    practicalBlockTitle: "Puntos de salud y seguridad que conviene tener listos",
    practicalTips: [
      "Guarda numeros de emergencia y ubicaciones medicas.",
      "Lleva seguro con cobertura internacional activa.",
      "Usa protector solar y repelente adecuado al clima.",
      "Prioriza transporte seguro en horarios nocturnos."
    ],
    mistakesTitle: "Errores comunes en temas de salud de viaje",
    mistakes: [
      "Viajar sin seguro o sin revisar cobertura.",
      "No llevar medicamentos personales esenciales.",
      "No hidratarse correctamente en jornadas largas."
    ],
    close:
      "Con medidas basicas y buena informacion, tu viaje a Punta Cana se vuelve mas seguro y predecible.",
    ctaLabel: "Plan de viaje seguro",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  inversion: {
    titlePrefix: "Guia inmobiliaria",
    excerptLead: "Panorama real de inversion y bienes raices para compradores internacionales.",
    intro:
      "Invertir en Punta Cana puede ser una gran oportunidad si conoces bien zonas, regulaciones y modelo de rentabilidad.",
    planning:
      "Antes de tomar una decision, compara proyecto, ubicacion, costos de mantenimiento y proyeccion de ocupacion.",
    practicalBlockTitle: "Checklist para evaluar inversion inmobiliaria",
    practicalTips: [
      "Revisa historial del desarrollador.",
      "Valida aspectos legales con profesional local.",
      "Calcula rentabilidad con escenarios realistas.",
      "Confirma costos fijos anuales y administracion."
    ],
    mistakesTitle: "Errores comunes al invertir",
    mistakes: [
      "Comprar sin asesoria legal independiente.",
      "Subestimar costos de operacion y mantenimiento.",
      "Basarse solo en promesas comerciales."
    ],
    close:
      "Una inversion bien analizada protege tu capital y mejora las probabilidades de retorno sostenible.",
    ctaLabel: "Conocer zonas y servicios",
    ctaHref: "/hoteles",
    ctaSupportHref: "/traslado"
  },
  nightlife: {
    titlePrefix: "Guia nightlife",
    excerptLead: "Vida nocturna en Punta Cana con recomendaciones reales para salir mejor.",
    intro:
      "Punta Cana tiene opciones nocturnas para todos los estilos: bares, clubs y eventos con musica en vivo.",
    planning:
      "Planear bien la noche significa elegir zona, reservar donde aplique y tener transporte de regreso confirmado.",
    practicalBlockTitle: "Checklist para una salida nocturna sin estres",
    practicalTips: [
      "Define presupuesto de la noche antes de salir.",
      "Confirma ubicacion y horario de cierre del lugar.",
      "Coordina regreso al hotel con antelacion.",
      "Evita cambiar de zona sin plan de movilidad."
    ],
    mistakesTitle: "Errores comunes en nightlife",
    mistakes: [
      "Salir sin transporte de vuelta.",
      "No revisar dress code o edad minima.",
      "Improvisar rutas largas de madrugada."
    ],
    close:
      "Con una buena organizacion, la vida nocturna se disfruta mas y se mantiene segura de principio a fin.",
    ctaLabel: "Reservar experiencias",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  },
  familiar: {
    titlePrefix: "Guia familiar",
    excerptLead: "Consejos para familias que viajan a Punta Cana con ninos o adultos mayores.",
    intro:
      "Los viajes familiares requieren mas organizacion, pero con un buen plan se vuelven mucho mas comodos y disfrutable para todos.",
    planning:
      "La clave esta en equilibrar descanso, actividades y movilidad para que nadie termine agotado en mitad del viaje.",
    practicalBlockTitle: "Como organizar un viaje familiar funcional",
    practicalTips: [
      "Escoge actividades segun edades y energia del grupo.",
      "Prioriza traslados comodos y horarios realistas.",
      "Deja espacios libres entre excursiones.",
      "Confirma servicios especiales del hotel si los necesitas."
    ],
    mistakesTitle: "Errores comunes en viajes familiares",
    mistakes: [
      "Saturar agenda todos los dias.",
      "No considerar tiempos de descanso para ninos.",
      "Elegir tours sin revisar requisitos de edad."
    ],
    close:
      "Cuando la agenda familiar esta bien equilibrada, el viaje se disfruta mas y con menos contratiempos.",
    ctaLabel: "Ver opciones familiares",
    ctaHref: "/hoteles",
    ctaSupportHref: "/tours"
  },
  global: {
    titlePrefix: "Comparativa global",
    excerptLead: "Comparativas del Caribe para elegir destino con datos utiles y realistas.",
    intro:
      "Comparar destinos del Caribe ayuda a decidir mejor, especialmente cuando el presupuesto y los dias de viaje son limitados.",
    planning:
      "No hay destino perfecto para todos; la mejor eleccion depende de lo que priorizas: playa, precio, ambiente o actividades.",
    practicalBlockTitle: "Que comparar entre destinos del Caribe",
    practicalTips: [
      "Costo total de vuelo + hotel + movilidad.",
      "Tiempo de traslado desde aeropuerto.",
      "Variedad de actividades disponibles.",
      "Estilo de viaje: familiar, pareja o grupos."
    ],
    mistakesTitle: "Errores comunes al elegir destino",
    mistakes: [
      "Comparar solo por precio de hotel.",
      "No revisar estacionalidad de clima y sargazo.",
      "Ignorar conectividad y tiempos de viaje."
    ],
    close:
      "Una comparativa realista te ayuda a elegir el destino correcto para tu tipo de viaje y evitar decepciones.",
    ctaLabel: "Descubrir Punta Cana",
    ctaHref: "/tours",
    ctaSupportHref: "/hoteles"
  },
  conversion: {
    titlePrefix: "Oferta y conversion",
    excerptLead: "Ofertas y promociones con enfoque practico para reservar sin complicarte.",
    intro:
      "Si estas buscando descuentos o tarifas de ultimo minuto, necesitas informacion clara para cerrar la reserva sin errores.",
    planning:
      "Las mejores ofertas se aprovechan cuando ya tienes definida fecha, zona y tipo de servicio que realmente necesitas.",
    practicalBlockTitle: "Como aprovechar ofertas sin equivocarte",
    practicalTips: [
      "Confirma condiciones de la promocion antes de pagar.",
      "Revisa fechas bloqueadas o restricciones.",
      "Verifica politica de cambios y cancelacion.",
      "Compara precio final, no solo porcentaje de descuento."
    ],
    mistakesTitle: "Errores comunes con ofertas y promociones",
    mistakes: [
      "Reservar por urgencia sin revisar terminos.",
      "No validar disponibilidad real de la oferta.",
      "Confundir precio base con precio final."
    ],
    close:
      "Una oferta bien elegida te ayuda a ahorrar de verdad sin sacrificar calidad ni tranquilidad durante el viaje.",
    ctaLabel: "Reservar ahora",
    ctaHref: "/tours",
    ctaSupportHref: "/traslado"
  }
};

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

async function main() {
  const tourImages = await prisma.tour.findMany({
    where: {
      status: { equals: "PUBLISHED", mode: "insensitive" },
      heroImage: { not: null }
    },
    select: { heroImage: true },
    orderBy: { title: "asc" }
  });
  const images = tourImages.map((item) => (item.heroImage ?? "").trim()).filter(Boolean);
  const fallbackImage = "/tours/default.jpg";

  let created = 0;
  let updated = 0;
  const now = new Date();

  for (let i = 0; i < KEYWORDS.length; i += 1) {
    const entry = KEYWORDS[i];
    const keyword = normalize(entry.keyword);
    const slug = `seo-${slugifyBlog(keyword)}`;
    const cfg = CLUSTER_CONFIG[entry.cluster];
    const { title, excerpt, contentHtml } = buildSeoBlogDraft(keyword, cfg, {
      label: cfg.ctaLabel,
      href: cfg.ctaHref,
      supportLabel: "Ver soporte complementario",
      supportHref: cfg.ctaSupportHref
    });
    const coverImage = images.length ? images[i % images.length] : fallbackImage;
    const exists = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (exists) {
      await prisma.blogPost.update({
        where: { id: exists.id },
        data: {
          title,
          excerpt,
          coverImage,
          contentHtml,
          status: "PUBLISHED"
        }
      });
      updated += 1;
    } else {
      await prisma.blogPost.create({
        data: {
          id: randomUUID(),
          title,
          slug,
          excerpt,
          coverImage,
          contentHtml,
          status: "PUBLISHED",
          publishedAt: now
        }
      });
      created += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        totalKeywords: KEYWORDS.length,
        created,
        updated
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
