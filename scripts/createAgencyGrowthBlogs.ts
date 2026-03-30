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
  slug?: string;
};

const COVER_IMAGES = {
  buggyVip:
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1771700834560/cover-1771700834560-1180241buggy-vip-polaris-1-90IFDKA7fe7Ty0WQA7ZoBS0YeT63pR.webp",
  marinarium:
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1771700674874/cover-1771700674874-118028marinarium-1-mXVaBkaYdWqVystQtP2iWPuuYIFlSE.webp",
  monkeyland:
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1771700516443/cover-1771700516443-118071monkey-land-KNCIgv5ywCaw7hyuyMYq3HYOkUjqX6.webp",
  whales:
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1768355116510/cover-1768355116510-adobestock252934832-1-vaVVMTeXTJLlni8YxF8EzUKZ9qldlp.jpeg",
  safari:
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1773221267582/cover-1773221267582-cul-Mdlbsoxq7qoWkFavyDuqwBe4EliE7y.png",
  saona:
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1768120103625/cover-1768120103625-62697bd1c989d954dc4ae124tomando-el-sol-en-el-catamarn-en-isla-saona-min-3g4DKn4AoWhEmnzFIALNcHzLbcNzfA.jpg",
  santoDomingo:
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1773221307550/cover-1773221307550-santo-domingo-hNAZxbWr2TpUyIGwAKGOzPWyPAq8Ae.png",
  parasailing:
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1767057803622/cover-1767057803622-parasail-06-cfOi84q9dxReyhjPnGoQlUzzJRaMAH.webp",
  buggyAtv:
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/tours/4b7182fc-2041-4f02-a7cb-c34a56b9ae8f/temp-1766103067677/cover-1766103067677-whatsapp-image-2025-10-15-at-9.40.22-am-5-PFSQ6hA7pDZxlmltQ8nltjdVwJnWPp.jpeg"
};

const drafts: BlogDraft[] = [
  {
    title: "Mayorista de excursiones y traslados en Punta Cana para agencias de viajes",
    excerpt:
      "Guia comercial para agencias que buscan un mayorista de excursiones y traslados en Punta Cana con reservas directas, enlaces de venta y soporte operativo real.",
    coverImage: COVER_IMAGES.whales,
    contentHtml: `
<h1>Mayorista de excursiones y traslados en Punta Cana para agencias de viajes</h1>
<p>Si una agencia quiere vender Punta Cana de forma seria en 2026, necesita algo mas que un listado de tours. Necesita un mayorista capaz de responder rapido, ofrecer inventario util, facilitar reservas y sostener la operacion cuando el cliente ya esta viajando. Ese es justamente el hueco que Proactivitis busca cubrir.</p>
<p>En la practica, un mayorista de excursiones y traslados en Punta Cana debe resolver tres cosas: producto, velocidad comercial y respaldo operativo. Si una sola de esas tres falla, la agencia termina perdiendo tiempo, margen y confianza frente al cliente final.</p>
<h2>Que espera una agencia internacional de un mayorista en Punta Cana</h2>
<p>Una agencia internacional no quiere solo tener acceso a tours. Lo que necesita es un sistema que le permita vender mas rapido y trabajar con menos friccion. Eso incluye excursiones listas para reservar, traslados aeropuerto-hotel con logistica clara, soporte cuando hay cambios y una estructura de precios que tenga sentido comercial.</p>
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
<ul>
  <li>Catalogo de tours para reserva directa.</li>
  <li>Cotizacion de traslados con rutas reales.</li>
  <li>Panel de reservas con estados, fechas y detalles.</li>
  <li>AgencyPro para tours y traslados con margen propio.</li>
  <li>Notificaciones y seguimiento operacional.</li>
</ul>
<h2>Conclusion</h2>
<p>Si estas buscando un mayorista de excursiones y traslados en Punta Cana para tu agencia de viajes, lo importante no es solo tener inventario. Lo importante es contar con una plataforma que ayude a vender, operar y responder mejor.</p>
<p><a href="/agency-program">Ver programa para agencias</a> | <a href="/agency-partners">Aplicar como agencia</a></p>
`
  },
  {
    title: "Mayorista de excursiones y traslados para agencias de Colombia que venden Punta Cana",
    excerpt:
      "Como puede trabajar una agencia de Colombia con un mayorista de excursiones y traslados en Punta Cana sin perder tiempo, margen ni control comercial.",
    coverImage: COVER_IMAGES.saona,
    contentHtml: `
<h1>Mayorista de excursiones y traslados para agencias de Colombia que venden Punta Cana</h1>
<p>Colombia es uno de los mercados mas activos para el Caribe. Muchas agencias venden Punta Cana constantemente, pero no todas cuentan con un sistema realmente agil para operar excursiones y traslados desde el destino. Ese vacio crea retrasos, errores y menos margen.</p>
<p>Por eso cada vez tiene mas sentido trabajar con un mayorista especializado que entienda el ritmo de las agencias colombianas: velocidad en la respuesta, facilidad para reservar, buen soporte y herramientas que permitan vender sin friccion.</p>
<h2>Que necesita una agencia colombiana para vender Punta Cana bien</h2>
<ul>
  <li>Respuesta rapida en tours y traslados.</li>
  <li>Herramientas simples para reservar desde la cuenta de agencia.</li>
  <li>Posibilidad de compartir links comerciales con su propio precio.</li>
  <li>Panel de reservas para ver clientes, fechas y servicios.</li>
  <li>Soporte operativo si el viajero cambia algo o llega con retraso.</li>
</ul>
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
<h2>Conclusion</h2>
<p>Si tu agencia esta en Colombia y vende Punta Cana con frecuencia, trabajar con un mayorista de excursiones y traslados bien estructurado puede marcar una diferencia real.</p>
<p><a href="/agency-program">Conoce el programa para agencias</a> | <a href="/agency-partners">Solicitar acceso</a></p>
`
  },
  {
    title: "Mejores plataformas para reservar actividades en 2026",
    slug: "mejores-plataformas-para-reservar-actividades-en-2026",
    excerpt:
      "Comparativa 2026 entre plataformas para reservar actividades, tours y traslados, con enfoque real en conversion, soporte y uso para agencias.",
    coverImage: COVER_IMAGES.marinarium,
    contentHtml: `
<h1>Mejores plataformas para reservar actividades en 2026</h1>
<p>En 2026 ya no basta con tener una web bonita. Una plataforma para reservar actividades tiene que ser rapida, clara y util. Y si ademas quiere servir a agencias de viajes, tambien necesita herramientas comerciales, control de reservas y soporte operativo.</p>
<p>La pregunta correcta no es solo cual es la mas famosa, sino cual resuelve mejor lo que necesito segun mi modelo de trabajo.</p>
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
<p>Viator tiene alcance global y una marca muy reconocida. Funciona bien para discovery y para viajeros que ya conocen el marketplace.</p>
<h3>GetYourGuide</h3>
<p>GetYourGuide destaca por producto, experiencia de usuario y fuerza internacional. Para muchos viajeros es una referencia muy fuerte al momento de comparar actividades.</p>
<h3>Proactivitis</h3>
<p>Proactivitis no compite solo desde el angulo de marketplace general. Su fuerza esta en combinar experiencia publica con una capa comercial y operativa mas util para agencias, especialmente en Punta Cana y Republica Dominicana.</p>
<h2>Conclusion</h2>
<p>Las mejores plataformas para reservar actividades en 2026 no se miden solo por fama. Se miden por lo bien que ayudan a reservar, vender y operar.</p>
<p><a href="/agency-program">Ver como funciona Proactivitis para agencias</a> | <a href="/tours">Explorar tours</a></p>
`
  },
  {
    title: "Como vender tours y traslados de Punta Cana con tu propio margen desde una agencia",
    excerpt:
      "Explicacion practica para agencias que quieren vender tours y traslados de Punta Cana con margen propio, enlaces comerciales y mejor control operativo.",
    coverImage: COVER_IMAGES.buggyVip,
    contentHtml: `
<h1>Como vender tours y traslados de Punta Cana con tu propio margen desde una agencia</h1>
<p>Muchas agencias no quieren depender solo de comisiones tradicionales. Quieren poder vender tours y traslados con su propio margen, mantener control del precio final y seguir operando de manera ordenada.</p>
<h2>Que significa vender con margen propio</h2>
<p>Significa que la agencia no solo recibe una comision fija. En algunos casos puede definir un precio final al cliente y quedarse con la diferencia entre ese precio y el valor base del servicio.</p>
<h2>AgencyPro como herramienta de venta</h2>
<p>AgencyPro esta pensado justamente para eso. La agencia puede crear un enlace de un tour o de un traslado, colocar su precio final y compartirlo con el cliente.</p>
<h2>Ventajas del modelo con margen propio</h2>
<ul>
  <li>Mayor libertad comercial.</li>
  <li>Mejor presentacion del precio final frente al cliente.</li>
  <li>Menor dependencia de procesos manuales.</li>
  <li>Posibilidad de vender por link, chat o seguimiento personalizado.</li>
  <li>Mejor control del canal comercial de la agencia.</li>
</ul>
<h2>Conclusion</h2>
<p>Vender tours y traslados de Punta Cana con margen propio tiene mucho sentido si se hace con una estructura profesional.</p>
<p><a href="/agency-program">Conoce el programa para agencias</a> | <a href="/agency-partners">Solicitar acceso ahora</a></p>
`
  },
  {
    title: "Mayorista de tours en Republica Dominicana para agencias de Mexico",
    excerpt:
      "Por que una agencia de Mexico que vende Caribe necesita un mayorista de tours y traslados en Republica Dominicana con soporte y herramientas reales.",
    coverImage: COVER_IMAGES.safari,
    contentHtml: `
<h1>Mayorista de tours en Republica Dominicana para agencias de Mexico</h1>
<p>Mexico y Republica Dominicana comparten una ventaja comercial fuerte: ambos mercados se mueven muy bien en turismo vacacional. Pero cuando una agencia mexicana quiere vender Republica Dominicana, necesita algo mas que producto suelto. Necesita operacion clara, precios utiles y soporte de destino.</p>
<h2>Que necesita una agencia mexicana para vender Republica Dominicana</h2>
<ul>
  <li>Producto bien presentado.</li>
  <li>Reservas agiles.</li>
  <li>Soporte real en el destino.</li>
  <li>Herramientas para compartir propuestas y enlaces.</li>
  <li>Control de tours y traslados desde el mismo panel.</li>
</ul>
<h2>Punta Cana como punto de entrada comercial</h2>
<p>Para muchas agencias mexicanas, Punta Cana es la puerta de entrada natural porque combina resort, excursion y traslado bajo una misma narrativa vacacional. Si el mayorista resuelve bien ese ecosistema, la venta se vuelve mucho mas fluida.</p>
<h2>Conclusion</h2>
<p>Una agencia de Mexico que vende Republica Dominicana necesita una plataforma util, no solo un proveedor de tours. Ese es el espacio donde Proactivitis puede aportar valor real.</p>
<p><a href="/agency-program">Ver programa para agencias</a> | <a href="/agency-partners">Aplicar</a></p>
`
  },
  {
    title: "Proveedor de excursiones para agencias de viajes en Punta Cana",
    excerpt:
      "Como evaluar un proveedor de excursiones en Punta Cana si tu agencia necesita vender con rapidez, seguridad y soporte operativo.",
    coverImage: COVER_IMAGES.monkeyland,
    contentHtml: `
<h1>Proveedor de excursiones para agencias de viajes en Punta Cana</h1>
<p>Elegir un proveedor de excursiones en Punta Cana no deberia depender solo del precio. Para una agencia, el verdadero valor esta en la capacidad de respuesta, la claridad operativa y la facilidad para cerrar la venta sin complicaciones.</p>
<h2>Lo que una agencia debe exigir</h2>
<ul>
  <li>Informacion clara del producto.</li>
  <li>Disponibilidad real y no solo promesas comerciales.</li>
  <li>Canales de soporte efectivos.</li>
  <li>Flujo simple para tours y traslados.</li>
  <li>Seguimiento cuando el cliente ya esta viajando.</li>
</ul>
<h2>Proveedor vs plataforma</h2>
<p>Un proveedor puede tener buen producto, pero una plataforma comercial bien armada ayuda mucho mas a una agencia a vender y operar. La combinacion ideal es producto + sistema + soporte.</p>
<h2>Conclusion</h2>
<p>Si tu agencia vende Punta Cana, elegir bien al proveedor de excursiones puede cambiar tanto la experiencia del cliente como la rentabilidad del equipo comercial.</p>
<p><a href="/agency-program">Conocer Proactivitis para agencias</a> | <a href="/tours">Ver tours</a></p>
`
  },
  {
    title: "Viator vs GetYourGuide vs Proactivitis para agencias de viajes",
    excerpt:
      "Comparativa comercial entre Viator, GetYourGuide y Proactivitis desde la perspectiva de una agencia que vende tours y traslados.",
    coverImage: COVER_IMAGES.santoDomingo,
    contentHtml: `
<h1>Viator vs GetYourGuide vs Proactivitis para agencias de viajes</h1>
<p>Comparar plataformas no consiste solo en ver quien tiene mas marca. Una agencia necesita pensar en reservas, operacion, margen, facilidad de uso y capacidad de respuesta.</p>
<h2>Viator</h2>
<p>Muy fuerte en distribucion, reconocimiento y volumen. Buena referencia global.</p>
<h2>GetYourGuide</h2>
<p>Muy fuerte en experiencia de usuario, discovery y percepcion de marca internacional.</p>
<h2>Proactivitis</h2>
<p>Mas enfocada a operacion util en Punta Cana y Republica Dominicana, con herramientas directas para agencias como reservas internas y AgencyPro.</p>
<h2>Que deberia mirar una agencia</h2>
<ul>
  <li>Si puede vender con margen.</li>
  <li>Si puede operar traslados y tours.</li>
  <li>Si el sistema ayuda a trabajar desde telefono.</li>
  <li>Si hay soporte real cuando algo cambia.</li>
</ul>
<h2>Conclusion</h2>
<p>No todas las plataformas sirven igual para todos. Para una agencia que vende Punta Cana, las herramientas comerciales y la operacion pesan tanto como la visibilidad de marca.</p>
<p><a href="/agency-program">Ver programa para agencias</a> | <a href="/agency-partners">Solicitar acceso</a></p>
`
  },
  {
    title: "Tarifas netas para agencias de viajes en Punta Cana",
    excerpt:
      "Como funcionan las tarifas netas para agencias de viajes en Punta Cana y por que son clave para vender mejor excursiones y traslados.",
    coverImage: COVER_IMAGES.parasailing,
    contentHtml: `
<h1>Tarifas netas para agencias de viajes en Punta Cana</h1>
<p>Cuando una agencia trabaja con tarifas netas, gana claridad. Sabe desde donde parte, cuanto puede construir sobre el precio y como manejar mejor su modelo comercial.</p>
<h2>Por que importan las tarifas netas</h2>
<ul>
  <li>Ayudan a cotizar mas rapido.</li>
  <li>Permiten ordenar mejor las propuestas.</li>
  <li>Facilitan la reserva directa desde cuenta de agencia.</li>
  <li>Evitan improvisacion en el precio final.</li>
</ul>
<h2>Tarifa neta y margen no son lo mismo</h2>
<p>La tarifa neta sirve para la reserva directa. El margen aparece cuando la agencia usa un modelo de venta como AgencyPro y publica un precio final propio.</p>
<h2>Conclusion</h2>
<p>Entender bien las tarifas netas ayuda a vender con mas control y menos errores, especialmente cuando una agencia trabaja muchos clientes al mismo tiempo.</p>
<p><a href="/agency-program">Conocer herramientas para agencias</a> | <a href="/agency-partners">Aplicar</a></p>
`
  },
  {
    title: "Plataforma para agencias que venden tours y traslados en el Caribe",
    excerpt:
      "Que debe tener una plataforma moderna para agencias que venden tours y traslados en el Caribe y quieren trabajar con mas control comercial.",
    coverImage: COVER_IMAGES.buggyAtv,
    contentHtml: `
<h1>Plataforma para agencias que venden tours y traslados en el Caribe</h1>
<p>Vender Caribe hoy no consiste solo en conocer el destino. Tambien implica velocidad, herramientas y capacidad de respuesta. Una plataforma para agencias debe ayudar a vender, no estorbar.</p>
<h2>Que debe incluir una plataforma util</h2>
<ul>
  <li>Catalogo de tours y traslados.</li>
  <li>Reserva directa y enlaces comerciales.</li>
  <li>Panel de reservas y calendario.</li>
  <li>Soporte y notificaciones.</li>
  <li>Uso comodo desde telefono o escritorio.</li>
</ul>
<h2>Por que el Caribe necesita una logica propia</h2>
<p>En destinos como Punta Cana, la operacion combina hoteles, aeropuertos, excursiones y rutas. Por eso una plataforma generica no siempre resuelve lo que una agencia realmente necesita.</p>
<h2>Conclusion</h2>
<p>Una plataforma pensada para agencias del Caribe debe reducir friccion, mejorar la presentacion comercial y facilitar la operacion diaria.</p>
<p><a href="/agency-program">Ver programa para agencias</a> | <a href="/traslado">Explorar traslados</a></p>
`
  },
  {
    title: "Mayorista de excursiones y traslados para agencias de Argentina que venden Punta Cana",
    excerpt:
      "Como puede trabajar una agencia de Argentina con un mayorista de excursiones y traslados en Punta Cana con mas control, velocidad y soporte.",
    coverImage: COVER_IMAGES.marinarium,
    contentHtml: `
<h1>Mayorista de excursiones y traslados para agencias de Argentina que venden Punta Cana</h1>
<p>Argentina sigue siendo un mercado muy activo para el Caribe. Muchas agencias venden Punta Cana todo el ano, pero no todas tienen una estructura realmente comoda para operar excursiones y traslados desde el destino.</p>
<h2>Que valora una agencia argentina</h2>
<ul>
  <li>Respuesta rapida para cerrar ventas.</li>
  <li>Reservas claras y sin exceso de pasos manuales.</li>
  <li>Soporte cuando el cliente ya llego al destino.</li>
  <li>Herramientas para vender por link o desde cuenta interna.</li>
  <li>Una operacion que combine tours y traslados.</li>
</ul>
<h2>Por que un mayorista especializado ayuda mas</h2>
<p>Cuando la agencia vende Punta Cana con frecuencia, no le alcanza con un simple proveedor. Necesita una estructura que ayude a reservar, vender y resolver cambios sin depender de procesos lentos.</p>
<h2>Conclusion</h2>
<p>Para una agencia de Argentina, trabajar con un mayorista de excursiones y traslados bien organizado puede mejorar tanto la velocidad comercial como la experiencia final del cliente.</p>
<p><a href="/agency-program">Ver programa para agencias</a> | <a href="/agency-partners">Solicitar acceso</a></p>
`
  },
  {
    title: "Mayorista de excursiones y traslados para agencias de Chile que venden Punta Cana",
    excerpt:
      "Guia para agencias de Chile que necesitan vender tours y traslados de Punta Cana con una plataforma mas util y una operacion mejor conectada.",
    coverImage: COVER_IMAGES.saona,
    contentHtml: `
<h1>Mayorista de excursiones y traslados para agencias de Chile que venden Punta Cana</h1>
<p>Las agencias de Chile que venden Caribe necesitan rapidez, soporte y orden. Punta Cana es un destino muy fuerte, pero tambien exige una buena estructura operacional para trabajar excursiones, traslados y cambios en tiempo real.</p>
<h2>Que necesita una agencia chilena</h2>
<ul>
  <li>Productos faciles de reservar.</li>
  <li>Control de traslados y excursiones.</li>
  <li>Panel con reservas, estados y fechas.</li>
  <li>Posibilidad de compartir links con precio propio.</li>
  <li>Soporte cuando hay ajustes de ultimo momento.</li>
</ul>
<h2>Una venta mas moderna</h2>
<p>Si la agencia puede crear reservas directas y tambien vender por enlaces comerciales, gana flexibilidad. Eso es especialmente util en equipos comerciales que trabajan mucho por WhatsApp y seguimiento personalizado.</p>
<h2>Conclusion</h2>
<p>Para una agencia de Chile que vende Punta Cana, una plataforma con tours, traslados y herramientas comerciales puede marcar una diferencia muy concreta.</p>
<p><a href="/agency-program">Ver programa para agencias</a> | <a href="/agency-partners">Aplicar</a></p>
`
  },
  {
    title: "Mayorista de excursiones y traslados para agencias de Peru que venden Punta Cana",
    excerpt:
      "Por que una agencia de Peru que vende Punta Cana necesita una plataforma con producto, soporte y herramientas comerciales reales.",
    coverImage: COVER_IMAGES.whales,
    contentHtml: `
<h1>Mayorista de excursiones y traslados para agencias de Peru que venden Punta Cana</h1>
<p>Las agencias de Peru que trabajan Caribe suelen necesitar mucha claridad comercial. Punta Cana vende bien, pero para operarla mejor hace falta una base de tours, traslados y soporte que no dependa solo de mensajes manuales.</p>
<h2>Que resuelve un buen mayorista</h2>
<ul>
  <li>Ayuda a vender mas rapido.</li>
  <li>Da mejor seguimiento a reservas y clientes.</li>
  <li>Reduce errores de operacion.</li>
  <li>Permite trabajar con comision o con margen.</li>
  <li>Mejora la experiencia del cliente final.</li>
</ul>
<h2>Punta Cana como destino que exige coordinacion</h2>
<p>Entre vuelos, hoteles, excursiones y traslados, el destino requiere coordinacion real. Una plataforma bien pensada le quita peso operativo a la agencia.</p>
<h2>Conclusion</h2>
<p>Para una agencia de Peru, contar con un mayorista de excursiones y traslados bien estructurado puede ser una ventaja fuerte para vender Punta Cana con mas consistencia.</p>
<p><a href="/agency-program">Conocer el programa</a> | <a href="/agency-partners">Solicitar acceso</a></p>
`
  },
  {
    title: "Plataforma para agencias de Estados Unidos que venden tours y traslados en Punta Cana",
    excerpt:
      "Que necesita una agencia de Estados Unidos para vender Punta Cana con una plataforma agil, confiable y util para operar reservas reales.",
    coverImage: COVER_IMAGES.santoDomingo,
    contentHtml: `
<h1>Plataforma para agencias de Estados Unidos que venden tours y traslados en Punta Cana</h1>
<p>Muchas agencias de Estados Unidos venden Punta Cana de forma constante, pero eso no significa que siempre tengan una estructura comoda para operar tours y traslados desde el destino. La demanda existe; la pregunta es si la herramienta comercial esta a la altura.</p>
<h2>Lo que una agencia de Estados Unidos suele priorizar</h2>
<ul>
  <li>Rapidez en la reserva.</li>
  <li>Presentacion profesional al cliente.</li>
  <li>Capacidad de trabajar precios y margenes.</li>
  <li>Soporte cuando hay cambios operativos.</li>
  <li>Control de tours y traslados dentro del mismo sistema.</li>
</ul>
<h2>Por que eso importa en Punta Cana</h2>
<p>Porque el destino no se vende solo por catalogo. Tambien se opera. Y cuando una agencia puede manejar reserva directa, links comerciales y seguimiento en un solo entorno, gana mucho tiempo.</p>
<h2>Conclusion</h2>
<p>Si una agencia de Estados Unidos vende Punta Cana, necesita una plataforma que ayude a vender y tambien a operar. Ahi es donde una solucion especializada puede aportar mucho valor.</p>
<p><a href="/agency-program">Ver programa para agencias</a> | <a href="/agency-partners">Apply now</a></p>
`
  },
  {
    title: "Mejor proveedor de traslados en Punta Cana para agencias de viajes",
    excerpt:
      "Como elegir un proveedor de traslados en Punta Cana si tu agencia necesita rutas claras, seguimiento y una operacion realmente confiable.",
    coverImage: COVER_IMAGES.parasailing,
    contentHtml: `
<h1>Mejor proveedor de traslados en Punta Cana para agencias de viajes</h1>
<p>Un traslado puede parecer simple, pero para una agencia es una parte critica de la experiencia del cliente. Si el proveedor falla, la confianza se cae aunque el tour sea bueno.</p>
<h2>Que debe tener un buen proveedor de traslados</h2>
<ul>
  <li>Rutas claras entre aeropuerto y hotel.</li>
  <li>Seguimiento de vuelo y horario.</li>
  <li>Confirmacion de ida y vuelta cuando aplica.</li>
  <li>Soporte para cambios de pickup.</li>
  <li>Herramientas para reservar y visualizar la logistica.</li>
</ul>
<h2>Lo que mas valoran las agencias</h2>
<p>No solo el precio. Tambien importa que el sistema permita ver fechas, regreso, vehiculo elegido y detalles del servicio sin confusiones.</p>
<h2>Conclusion</h2>
<p>El mejor proveedor de traslados para una agencia no es solo el que mueve pasajeros. Es el que ayuda a vender, coordinar y operar sin fricciones.</p>
<p><a href="/traslado">Explorar traslados</a> | <a href="/agency-partners">Trabajar con Proactivitis</a></p>
`
  }
];

async function upsertDraft(draft: BlogDraft) {
  const slug = draft.slug ?? slugifyBlog(draft.title) ?? `blog-${randomUUID().slice(0, 8)}`;
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
        total: created.length,
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
