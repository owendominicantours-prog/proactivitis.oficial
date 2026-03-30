import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { slugifyBlog } from "../lib/blog";
import { translateBlogPostAllLocales } from "../lib/blogTranslationService";

const prisma = new PrismaClient();

type BlogDraft = {
  title: string;
  excerpt: string;
  coverImage: string;
  contentHtml: string;
};

const COVER_IMAGE =
  "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/Carrusel/CARRU1.jpg";

const drafts: BlogDraft[] = [
  {
    title: "Mayorista de excursiones y traslados en Punta Cana para agencias de viajes",
    excerpt:
      "Guia comercial para agencias que buscan un mayorista de excursiones y traslados en Punta Cana con reservas directas, enlaces de venta y soporte operativo real.",
    coverImage: COVER_IMAGE,
    contentHtml: `
<h1>Mayorista de excursiones y traslados en Punta Cana para agencias de viajes</h1>
<p>Si una agencia quiere vender Punta Cana de forma seria en 2026, necesita algo mas que un listado de tours. Necesita un mayorista capaz de responder rapido, ofrecer inventario util, facilitar reservas y sostener la operacion cuando el cliente ya esta viajando. Ese es justamente el hueco que Proactivitis busca cubrir.</p>
<p>En la practica, un mayorista de excursiones y traslados en Punta Cana debe resolver tres cosas: producto, velocidad comercial y respaldo operativo. Si una sola de esas tres falla, la agencia termina perdiendo tiempo, margen y confianza frente al cliente final.</p>

<h2>Que espera una agencia internacional de un mayorista en Punta Cana</h2>
<p>Una agencia internacional no quiere solo “tener acceso” a tours. Lo que necesita es un sistema que le permita vender mas rapido y trabajar con menos friccion. Eso incluye excursiones listas para reservar, traslados aeropuerto-hotel con logistica clara, soporte cuando hay cambios y una estructura de precios que tenga sentido comercial.</p>
<ul>
  <li>Reservas directas para clientes finales sin procesos manuales eternos.</li>
  <li>Tarifas netas o margen controlado segun el modelo de venta.</li>
  <li>Soporte real antes, durante y despues de la reserva.</li>
  <li>Panel para operar reservas, fechas, pasajeros y servicios.</li>
  <li>Capacidad de vender tanto tours como traslados desde un mismo entorno.</li>
</ul>

<h2>Como funciona Proactivitis para agencias</h2>
<p>Proactivitis combina dos formas de trabajo. La primera es la reserva directa de agencia: la agencia entra a su cuenta, busca el tour o el traslado, crea la reserva y trabaja con su logica comercial interna. La segunda es AgencyPro: un sistema de enlaces de venta personalizados donde la agencia puede publicar su propio precio final y compartirlo con el cliente.</p>
<p>Esto cambia bastante el juego comercial. En lugar de depender solo de cotizaciones manuales o mensajes sueltos, la agencia puede tener una estructura mas moderna para vender Punta Cana de forma diaria.</p>

<h2>Excursiones, traslados y operacion en un mismo panel</h2>
<p>Uno de los problemas mas comunes cuando una agencia vende Republica Dominicana es que termina fragmentando la operacion. Una cosa se vende por un lado, los traslados se coordinan por otro y las confirmaciones quedan en otro canal distinto. Eso genera errores y retrabajo.</p>
<p>Con Proactivitis la idea es centralizar:</p>
<ul>
  <li>Catalogo de tours para reserva directa.</li>
  <li>Cotizacion de traslados con rutas reales.</li>
  <li>Panel de reservas con estados, fechas y detalles.</li>
  <li>AgencyPro para tours y traslados con margen propio.</li>
  <li>Notificaciones y seguimiento operacional.</li>
</ul>

<h2>Por que esto importa para una agencia</h2>
<p>Porque Punta Cana no se vende solo con fotos bonitas. Se vende con velocidad, claridad y confianza. Cuando un cliente pregunta por un traslado desde el aeropuerto o por una excursion popular, la agencia necesita responder rapido y cerrar sin friccion. Si ademas puede operar la reserva desde un mismo panel, el negocio se vuelve mas escalable.</p>

<h2>Beneficios concretos para agencias que venden Punta Cana</h2>
<ul>
  <li>Mas control sobre reservas y fechas de servicio.</li>
  <li>Menos dependencia de procesos manuales.</li>
  <li>Posibilidad de compartir enlaces con precio propio.</li>
  <li>Mejor seguimiento de clientes, reservas y canales.</li>
  <li>Herramientas utiles tanto para tours como para traslados.</li>
  <li>Una experiencia comercial mas profesional frente al cliente final.</li>
</ul>

<h2>Preguntas frecuentes</h2>
<h3>Un mayorista en Punta Cana debe trabajar solo con excursiones?</h3>
<p>No. Si una agencia vende Punta Cana de verdad, tambien necesita traslados. Tener ambos productos en la misma plataforma mejora la operacion y acelera la venta.</p>

<h3>Que modelo comercial puede usar una agencia?</h3>
<p>Puede trabajar con reserva directa o con enlaces AgencyPro. Eso le permite vender de forma interna o compartir un link listo para reservar con el cliente.</p>

<h3>Es util para agencias fuera de Republica Dominicana?</h3>
<p>Si. De hecho, el enfoque esta pensado precisamente para agencias internacionales que venden Punta Cana desde otros mercados.</p>

<h2>Conclusion</h2>
<p>Si estas buscando un mayorista de excursiones y traslados en Punta Cana para tu agencia de viajes, lo importante no es solo tener inventario. Lo importante es contar con una plataforma que ayude a vender, operar y responder mejor. Ahí es donde Proactivitis puede convertirse en una herramienta comercial realmente util.</p>
<p><a href="/agency-program">Ver programa para agencias</a> | <a href="/agency-partners">Aplicar como agencia</a></p>
`
  },
  {
    title: "Mayorista de excursiones y traslados para agencias de Colombia que venden Punta Cana",
    excerpt:
      "Como puede trabajar una agencia de Colombia con un mayorista de excursiones y traslados en Punta Cana sin perder tiempo, margen ni control comercial.",
    coverImage: COVER_IMAGE,
    contentHtml: `
<h1>Mayorista de excursiones y traslados para agencias de Colombia que venden Punta Cana</h1>
<p>Colombia es uno de los mercados mas activos para el Caribe. Muchas agencias venden Punta Cana constantemente, pero no todas cuentan con un sistema realmente agil para operar excursiones y traslados desde el destino. Ese vacio crea retrasos, errores y menos margen.</p>
<p>Por eso cada vez tiene mas sentido trabajar con un mayorista especializado que entienda el ritmo de las agencias colombianas: velocidad en la respuesta, facilidad para reservar, buen soporte y herramientas que permitan vender sin friccion.</p>

<h2>Que necesita una agencia colombiana para vender Punta Cana bien</h2>
<p>No basta con tener una lista de excursiones. La agencia necesita una estructura comercial clara para cotizar, reservar, compartir propuestas y controlar lo que pasa despues de la venta. Si el sistema es lento o demasiado manual, la agencia termina perdiendo oportunidades.</p>
<ul>
  <li>Respuesta rapida en tours y traslados.</li>
  <li>Herramientas simples para reservar desde la cuenta de agencia.</li>
  <li>Posibilidad de compartir links comerciales con su propio precio.</li>
  <li>Panel de reservas para ver clientes, fechas y servicios.</li>
  <li>Soporte operativo si el viajero cambia algo o llega con retraso.</li>
</ul>

<h2>Por que Punta Cana requiere una operacion especial</h2>
<p>Punta Cana no es solo una excursion de isla o un buggy. Tambien implica aeropuerto, hoteles, horarios, regreso, traslados privados, recogidas y soporte. Si esos elementos no se coordinan bien, una reserva que parecia sencilla se convierte en un problema operativo.</p>

<h2>Como ayuda Proactivitis a una agencia de Colombia</h2>
<p>Proactivitis permite trabajar Punta Cana desde un enfoque mas moderno. La agencia puede hacer reservas directas desde su panel o usar AgencyPro para crear enlaces con precio propio. Eso sirve mucho para cerrar ventas por WhatsApp, correo o seguimiento comercial sin exponer siempre el precio general del marketplace.</p>

<h2>Ventajas reales para agencias colombianas</h2>
<ul>
  <li>Proceso mas rapido de reserva para clientes que viajan al Caribe.</li>
  <li>Traslados y excursiones centralizados en una misma plataforma.</li>
  <li>Mejor control operativo cuando el cliente ya esta en destino.</li>
  <li>Mayor facilidad para vender desde celular o escritorio.</li>
  <li>Posibilidad de trabajar con comision o con margen propio.</li>
</ul>

<h2>AgencyPro como herramienta comercial</h2>
<p>Para muchas agencias de Colombia, la venta ocurre por recomendacion directa, chat o seguimiento comercial. AgencyPro encaja muy bien ahi porque permite generar enlaces listos para vender tours y traslados con el precio definido por la propia agencia.</p>
<p>Eso da mas libertad comercial y una presentacion mas ordenada frente al cliente, sin perder el soporte operativo del sistema.</p>

<h2>Preguntas frecuentes</h2>
<h3>Una agencia colombiana puede usar la plataforma sin estar en Republica Dominicana?</h3>
<p>Si. El modelo esta pensado justamente para agencias internacionales que comercializan Punta Cana desde su propio pais.</p>

<h3>Se pueden vender tambien traslados, no solo tours?</h3>
<p>Si. Ese es uno de los puntos fuertes del sistema: tours y traslados trabajan bajo una misma logica operativa.</p>

<h3>Sirve para equipos comerciales pequenos?</h3>
<p>Si. Tanto una agencia boutique como un equipo con varias personas puede usar la plataforma para trabajar mejor.</p>

<h2>Conclusion</h2>
<p>Si tu agencia esta en Colombia y vende Punta Cana con frecuencia, trabajar con un mayorista de excursiones y traslados bien estructurado puede marcar una diferencia real. Menos friccion, mejor seguimiento y mas herramientas para vender de forma consistente.</p>
<p><a href="/agency-program">Conoce el programa para agencias</a> | <a href="/agency-partners">Solicitar acceso</a></p>
`
  },
  {
    title: "Mejores plataformas para reservar actividades en 2026: comparativa real para agencias y viajeros",
    excerpt:
      "Comparativa 2026 entre plataformas para reservar actividades, tours y traslados, con enfoque real en conversion, soporte y uso para agencias.",
    coverImage: COVER_IMAGE,
    contentHtml: `
<h1>Mejores plataformas para reservar actividades en 2026: comparativa real para agencias y viajeros</h1>
<p>En 2026 ya no basta con tener una web bonita. Una plataforma para reservar actividades tiene que ser rapida, clara y util. Y si ademas quiere servir a agencias de viajes, tambien necesita herramientas comerciales, control de reservas y soporte operativo.</p>
<p>La pregunta correcta no es solo “cual es la mas famosa”, sino “cual resuelve mejor lo que necesito segun mi modelo de trabajo”.</p>

<h2>Que se debe comparar de verdad</h2>
<ul>
  <li>Facilidad para reservar.</li>
  <li>Calidad del catalogo y estructura de producto.</li>
  <li>Soporte al cliente y soporte al partner.</li>
  <li>Posibilidad de trabajar con margen o comision.</li>
  <li>Herramientas para agencias, suppliers o revendedores.</li>
  <li>Claridad operativa en tours y traslados.</li>
</ul>

<h2>Plataformas mas conocidas en el mercado</h2>
<h3>Viator</h3>
<p>Viator tiene alcance global y una marca muy reconocida. Funciona bien para descubrimiento y para viajeros que ya conocen el marketplace. Su fortaleza esta en volumen y confianza de marca.</p>

<h3>GetYourGuide</h3>
<p>GetYourGuide destaca por producto, experiencia de usuario y fuerza internacional. Para muchos viajeros es una referencia muy fuerte al momento de comparar actividades.</p>

<h3>Proactivitis</h3>
<p>Proactivitis no compite solo desde el angulo de “marketplace general”. Su fuerza esta en combinar experiencia publica con una capa comercial y operativa mas util para agencias, especialmente en Punta Cana y Republica Dominicana.</p>

<h2>Cuando conviene una plataforma mas especializada</h2>
<p>Si tu negocio se concentra en un destino especifico, o si trabajas como agencia y necesitas reservar ademas de vender, una plataforma especializada puede darte mas control que un marketplace gigantesco donde todo se mezcla.</p>
<p>En ese punto, factores como traslados, reservas directas, enlaces comerciales y seguimiento operativo pesan mucho mas que el puro volumen.</p>

<h2>Que puede diferenciar a Proactivitis</h2>
<ul>
  <li>Reserva directa para agencias.</li>
  <li>AgencyPro para vender con precio propio.</li>
  <li>Modulo de traslados y tours dentro del mismo ecosistema.</li>
  <li>Panel para reservas, notificaciones y operacion.</li>
  <li>Flujo mas enfocado en necesidades reales de Punta Cana.</li>
</ul>

<h2>Para viajeros y para agencias no siempre gana la misma</h2>
<p>Un viajero individual puede priorizar discovery y comparacion masiva. Una agencia, en cambio, necesita vender, operar y mantener control. Por eso una plataforma puede ser fuerte para un perfil y no necesariamente para el otro.</p>

<h2>Preguntas frecuentes</h2>
<h3>La mejor plataforma en 2026 sera siempre la mas grande?</h3>
<p>No. La mas grande no siempre es la mas util para tu modelo comercial o para el destino que vendes.</p>

<h3>Que deberia priorizar una agencia?</h3>
<p>Velocidad de reserva, margen comercial, control operativo y soporte. Sin eso, la venta se vuelve mas pesada.</p>

<h3>Que deberia priorizar un viajero?</h3>
<p>Claridad de precio, reputacion, facilidad de reserva y confianza en la operacion real del servicio.</p>

<h2>Conclusion</h2>
<p>Las mejores plataformas para reservar actividades en 2026 no se miden solo por fama. Se miden por lo bien que ayudan a reservar, vender y operar. Para agencias que trabajan Punta Cana, la diferenciacion real esta en las herramientas y el soporte, no solo en el catalogo.</p>
<p><a href="/agency-program">Ver como funciona Proactivitis para agencias</a> | <a href="/tours">Explorar tours</a></p>
`
  },
  {
    title: "Como vender tours y traslados de Punta Cana con tu propio margen desde una agencia",
    excerpt:
      "Explicacion practica para agencias que quieren vender tours y traslados de Punta Cana con margen propio, enlaces comerciales y mejor control operativo.",
    coverImage: COVER_IMAGE,
    contentHtml: `
<h1>Como vender tours y traslados de Punta Cana con tu propio margen desde una agencia</h1>
<p>Muchas agencias no quieren depender solo de comisiones tradicionales. Quieren poder vender tours y traslados con su propio margen, mantener control del precio final y seguir operando de manera ordenada. Ese modelo es cada vez mas importante, sobre todo cuando la venta se mueve por WhatsApp, recomendacion y seguimiento directo.</p>

<h2>Que significa vender con margen propio</h2>
<p>Significa que la agencia no solo recibe una comision fija. En algunos casos puede definir un precio final al cliente y quedarse con la diferencia entre ese precio y el valor base del servicio. Esto le da mas control comercial y una mayor flexibilidad para trabajar distintos perfiles de cliente.</p>

<h2>Por que este modelo funciona bien en Punta Cana</h2>
<p>Punta Cana tiene una oferta alta de excursiones, traslados y experiencias. En ese contexto, la agencia necesita diferenciarse no solo por el producto, sino por la forma en que lo vende. Un enlace propio, un precio bien presentado y una reserva clara pueden ayudar mucho a cerrar ventas mas rapido.</p>

<h2>AgencyPro como herramienta de venta</h2>
<p>AgencyPro esta pensado justamente para eso. La agencia puede crear un enlace de un tour o de un traslado, colocar su precio final y compartirlo con el cliente. El cliente reserva desde ese enlace y la agencia mantiene su margen sobre el valor base del servicio.</p>

<h2>Ventajas del modelo con margen propio</h2>
<ul>
  <li>Mayor libertad comercial.</li>
  <li>Mejor presentacion del precio final frente al cliente.</li>
  <li>Menor dependencia de procesos manuales.</li>
  <li>Posibilidad de vender por link, chat o seguimiento personalizado.</li>
  <li>Mejor control del canal comercial de la agencia.</li>
</ul>

<h2>Y cuando conviene la reserva directa?</h2>
<p>Cuando la agencia misma quiere operar la reserva dentro del panel y trabajar con su comision configurada. Ese modelo sigue siendo util, especialmente para equipos que prefieren llevar cada reserva internamente. Lo importante es que ambos modelos no se contradicen: se complementan.</p>

<h2>El error mas comun</h2>
<p>El error mas comun es intentar vender con margen sin una herramienta ordenada. Eso lleva a links dispersos, precios mal recordados, poca trazabilidad y problemas cuando el cliente ya quiere pagar o modificar algo.</p>

<h2>Lo que una buena plataforma debe permitir</h2>
<ul>
  <li>Crear enlaces comerciales en pocos pasos.</li>
  <li>Controlar el precio base y el precio final.</li>
  <li>Separar reserva directa de venta por margen.</li>
  <li>Mostrar reservas, canales y resultados dentro del panel.</li>
  <li>Operar tours y traslados bajo la misma logica.</li>
</ul>

<h2>Preguntas frecuentes</h2>
<h3>Esto sirve solo para tours?</h3>
<p>No. Tambien sirve para traslados, especialmente si la agencia quiere vender rutas concretas con su propio precio final.</p>

<h3>Una agencia pequena puede usar este modelo?</h3>
<p>Si. De hecho, una agencia pequena puede beneficiarse mucho porque gana velocidad y orden comercial.</p>

<h3>Es mejor que la comision tradicional?</h3>
<p>No necesariamente siempre. Depende de como vende la agencia. Lo importante es tener ambos modelos disponibles y usar el que mejor encaja en cada caso.</p>

<h2>Conclusion</h2>
<p>Vender tours y traslados de Punta Cana con margen propio tiene mucho sentido si se hace con una estructura profesional. No se trata solo de subir un precio, sino de tener control, orden y una forma clara de operar la venta. Ahí es donde una herramienta como AgencyPro puede marcar diferencia.</p>
<p><a href="/agency-program">Conoce el programa para agencias</a> | <a href="/agency-partners">Solicitar acceso ahora</a></p>
`
  }
];

async function upsertDraft(draft: BlogDraft) {
  const slug = slugifyBlog(draft.title) || `blog-${randomUUID().slice(0, 8)}`;
  const now = new Date();
  const existing = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true }
  });

  let postId: string;

  if (existing) {
    postId = existing.id;
    await prisma.blogPost.update({
      where: { id: existing.id },
      data: {
        title: draft.title,
        excerpt: draft.excerpt,
        coverImage: draft.coverImage,
        contentHtml: draft.contentHtml,
        status: "PUBLISHED",
        publishedAt: now
      }
    });
  } else {
    const created = await prisma.blogPost.create({
      data: {
        id: randomUUID(),
        title: draft.title,
        slug,
        excerpt: draft.excerpt,
        coverImage: draft.coverImage,
        contentHtml: draft.contentHtml,
        status: "PUBLISHED",
        publishedAt: now
      }
    });
    postId = created.id;
  }

  await translateBlogPostAllLocales(postId);
  return { postId, slug };
}

async function main() {
  const created: { slug: string; postId: string }[] = [];

  for (const draft of drafts) {
    const result = await upsertDraft(draft);
    created.push(result);
  }

  console.log(
    JSON.stringify(
      {
        created: created.length,
        posts: created
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
