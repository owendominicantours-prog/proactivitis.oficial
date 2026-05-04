type SharedClusterTone = {
  titlePrefix: string;
  excerptLead: string;
  intro: string;
  planning: string;
  practicalBlockTitle: string;
  practicalTips: string[];
  mistakesTitle: string;
  mistakes: string[];
  close: string;
};

export const NEWS_EDITORIAL_SYSTEM_PROMPT = `
Actua como el Departamento de Inteligencia Editorial Proactivitis.
Voz: institucional, tecnica, clara y orientada a datos.
No uses primera persona singular: evita "yo", "mi", "me parece".
Usa expresiones como "nuestro equipo", "la plataforma", "el departamento" o "el analisis editorial".
El contenido debe explicar logistica, mercado, precios, rutas o tecnologia con tono verificable.
Cuando haya incertidumbre, expresa el dato como tendencia, rango o recomendacion operativa.
`;

const FALLBACK_TONE: SharedClusterTone = {
  titlePrefix: "Guia completa",
  excerptLead: "Analisis editorial para planificar mejor el viaje.",
  intro:
    "El Departamento de Inteligencia Editorial Proactivitis analiza esta busqueda desde tres variables operativas: tiempo, presupuesto y logistica real del viajero.",
  planning:
    "Una planificacion ordenada reduce costos ocultos y mejora la experiencia. Nuestro equipo recomienda definir primero la base de transporte, luego las actividades principales y al final los extras opcionales.",
  practicalBlockTitle: "Puntos clave para organizarlo bien",
  practicalTips: [
    "Define fecha exacta y zona donde te vas a hospedar.",
    "Confirma horarios reales de traslado y duracion de la actividad.",
    "Revisa lo que incluye y lo que se paga aparte.",
    "Guarda un contacto de soporte para cambios de ultima hora."
  ],
  mistakesTitle: "Errores comunes que conviene evitar",
  mistakes: [
    "Elegir solo por precio sin validar ubicacion y tiempos.",
    "Reservar todo en el ultimo momento con disponibilidad limitada.",
    "No confirmar la logistica de ida y regreso."
  ],
  close:
    "Cuando estos puntos se organizan con antelacion, la experiencia mejora y el viaje se vuelve mas fluido desde el primer dia."
};

const mergeTone = (
  base: SharedClusterTone,
  override: Partial<SharedClusterTone>
): SharedClusterTone => ({
  ...base,
  ...override,
  practicalTips: override.practicalTips ?? base.practicalTips,
  mistakes: override.mistakes ?? base.mistakes
});

const htmlList = (items: string[]) => items.map((item) => `<li>${item}</li>`).join("");

const ensureMinTextLength = (html: string, minChars = 600) => {
  const textOnly = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (textOnly.length >= minChars) return html;
  return `${html}
<p>Consejo final: cuando tengas tu fecha de viaje definida, revisa la disponibilidad de servicios con tiempo y confirma cada detalle por escrito para evitar cambios de ultimo momento.</p>
<p>En Punta Cana, una agenda bien coordinada entre hotel, traslado y actividades te ahorra dinero, reduce estres y te da mas tiempo para disfrutar.</p>`;
};

export const buildSeoBlogDraft = (
  keyword: string,
  tone: Partial<SharedClusterTone>,
  cta: { label: string; href: string; supportLabel: string; supportHref: string }
) => {
  const resolvedTone = mergeTone(FALLBACK_TONE, tone);
  const title = `${resolvedTone.titlePrefix}: ${keyword}`;
  const excerpt = `${resolvedTone.excerptLead} Guia tecnica sobre ${keyword} para decidir con claridad y reservar con seguridad.`;
  const contentHtmlRaw = `
<h1>${keyword}</h1>
<p>${resolvedTone.intro}</p>
<p>${resolvedTone.planning}</p>

<h2>${resolvedTone.practicalBlockTitle}</h2>
<ul>
  ${htmlList(resolvedTone.practicalTips)}
</ul>

<h2>${resolvedTone.mistakesTitle}</h2>
<ul>
  ${htmlList(resolvedTone.mistakes)}
</ul>

<h2>Recomendacion practica</h2>
<p>${resolvedTone.close}</p>
<p>Cuando la fecha ya esta definida, la recomendacion operativa es cerrar disponibilidad con anticipacion para evitar sobrecostos y cambios en temporada alta.</p>

<p><a href="${cta.href}">${cta.label}</a> | <a href="${cta.supportHref}">${cta.supportLabel}</a></p>
`;
  return {
    title,
    excerpt,
    contentHtml: ensureMinTextLength(contentHtmlRaw, 600)
  };
};

