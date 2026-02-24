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

const FALLBACK_TONE: SharedClusterTone = {
  titlePrefix: "Guia completa",
  excerptLead: "Informacion practica para planificar mejor tu viaje.",
  intro:
    "Si estas investigando esta opcion en Punta Cana, lo importante es bajar la informacion a decisiones reales: tiempo, presupuesto y logistica.",
  planning:
    "Una buena planificacion evita costos ocultos y te permite disfrutar mas. Lo ideal es definir primero tu base de transporte, luego actividades principales y al final extras opcionales.",
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
    "Si organizas estos puntos con antelacion, la experiencia mejora y el viaje se siente mas fluido desde el primer dia."
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
  const excerpt = `${resolvedTone.excerptLead} Guia real sobre ${keyword} para decidir con claridad y reservar con seguridad.`;
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
<p>Si ya tienes fecha, te conviene dejar todo cerrado con anticipacion para evitar sobrecostos y cambios de disponibilidad en temporada alta.</p>

<p><a href="${cta.href}">${cta.label}</a> | <a href="${cta.supportHref}">${cta.supportLabel}</a></p>
`;
  return {
    title,
    excerpt,
    contentHtml: ensureMinTextLength(contentHtmlRaw, 600)
  };
};

