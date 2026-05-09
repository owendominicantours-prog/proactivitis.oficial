import { Prisma } from "@prisma/client";
import { buildEmailShell } from "@/lib/emailTemplates";
import {
  ADDITIONAL_SERVICE_LABELS,
  ASSISTANCE_LABELS,
  BUDGET_TIER_LABELS,
  GROUP_TYPE_LABELS,
  HOLIDAY_STYLE_LABELS,
  INTEREST_LABELS,
  LANGUAGE_LABELS,
  type ProDiscoveryItineraryDraft
} from "@/lib/prodiscoveryGroupPlannerShared";

export {
  ADDITIONAL_SERVICE_LABELS,
  ASSISTANCE_LABELS,
  BUDGET_TIER_LABELS,
  GROUP_TYPE_LABELS,
  HOLIDAY_STYLE_LABELS,
  INTEREST_LABELS,
  LANGUAGE_LABELS,
  type ProDiscoveryItineraryDraft
} from "@/lib/prodiscoveryGroupPlannerShared";

export type ProDiscoveryGroupPayload = {
  locale?: string;
  city?: string;
  country?: string;
  arrivalDate?: string;
  departureDate?: string;
  groupType?: string;
  groupSize?: number | string;
  budgetTier?: string;
  interests?: string[] | string;
  languages?: string[] | string;
  assistance?: string[] | string;
  holidayStyles?: string[] | string;
  additionalServices?: string[] | string;
  flexibleTiming?: boolean | string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  dream?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  companyName?: string;
};

export type NormalizedProDiscoveryGroupPayload = {
  locale: "es" | "en" | "fr";
  city: string;
  country?: string | null;
  arrivalDate?: Date | null;
  departureDate?: Date | null;
  groupType: string;
  groupSize: number;
  budgetTier: string;
  budgetMin: number;
  budgetMax: number;
  interests: string[];
  languages: string[];
  assistance: string[];
  holidayStyles: string[];
  additionalServices: string[];
  flexibleTiming: boolean;
  preferredStartTime?: string | null;
  preferredEndTime?: string | null;
  leadPriority: "NORMAL" | "PRIORIDAD_VIP";
  dream: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  companyName?: string | null;
  estimatedBudget: number;
  depositPercent: number;
  depositAmount: number;
};

type ValidationResult =
  | { ok: true; data: NormalizedProDiscoveryGroupPayload }
  | { ok: false; errors: string[] };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT_LENGTH = 2400;

const budgetPerPerson: Record<string, { min: number; max: number }> = {
  low: { min: 65, max: 120 },
  mid: { min: 130, max: 240 },
  premium: { min: 260, max: 520 },
  vip: { min: 550, max: 1200 }
};

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const sanitizeText = (value: unknown, maxLength = MAX_TEXT_LENGTH) =>
  asString(value).replace(/\s+/g, " ").slice(0, maxLength).trim();

const normalizeLocale = (value: unknown): "es" | "en" | "fr" => {
  const locale = asString(value).toLowerCase();
  return locale === "en" || locale === "fr" ? locale : "es";
};

const normalizeDate = (value: unknown) => {
  const text = asString(value);
  if (!text) return null;
  const date = new Date(`${text}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeInterests = (value: unknown) => {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return Array.from(
    new Set(
      raw
        .map((item) => asString(item).toLowerCase())
        .filter((item) => item in INTEREST_LABELS)
    )
  ).slice(0, 8);
};

const normalizeList = (value: unknown, allowed: Record<string, string>, maxItems = 8) => {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return Array.from(
    new Set(
      raw
        .map((item) => asString(item).toLowerCase())
        .filter((item) => item in allowed)
    )
  ).slice(0, maxItems);
};

const normalizeBoolean = (value: unknown) => value === true || asString(value).toLowerCase() === "true";

export const detectProDiscoveryLeadPriority = (dream: string, groupType?: string, additionalServices: string[] = []) => {
  const text = `${dream} ${groupType ?? ""} ${additionalServices.join(" ")}`.toLowerCase();
  const vipSignals = [
    "boda",
    "wedding",
    "mariage",
    "honeymoon",
    "luna de miel",
    "vip",
    "incentivo",
    "incentive",
    "empresa",
    "corporate",
    "ceo",
    "executive",
    "ejecutivo",
    "hermana",
    "hermano",
    "celebracion",
    "celebration",
    "photographer",
    "fotografo",
    "private-dinner"
  ];
  return vipSignals.some((signal) => text.includes(signal)) ? "PRIORIDAD_VIP" : "NORMAL";
};

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export const calculateGroupOpportunityAccounting = ({
  groupSize,
  budgetTier,
  acceptedBudget,
  depositPercent = 20,
  leaderCommissionPercent = 10
}: {
  groupSize: number;
  budgetTier: string;
  acceptedBudget?: number | null;
  depositPercent?: number;
  leaderCommissionPercent?: number | null;
}) => {
  const tier = budgetPerPerson[budgetTier] ?? budgetPerPerson.mid;
  const budgetMin = groupSize * tier.min;
  const budgetMax = groupSize * tier.max;
  const estimatedBudget = roundMoney((budgetMin + budgetMax) / 2);
  const base = acceptedBudget && acceptedBudget > 0 ? acceptedBudget : estimatedBudget;
  const depositAmount = roundMoney(base * (depositPercent / 100));
  const leaderCommissionAmount =
    leaderCommissionPercent && leaderCommissionPercent > 0
      ? roundMoney(base * (leaderCommissionPercent / 100))
      : null;

  return {
    budgetMin: roundMoney(budgetMin),
    budgetMax: roundMoney(budgetMax),
    estimatedBudget,
    depositAmount,
    leaderCommissionAmount
  };
};

export function normalizeProDiscoveryGroupPayload(input: ProDiscoveryGroupPayload): ValidationResult {
  const locale = normalizeLocale(input.locale);
  const city = sanitizeText(input.city, 90);
  const country = sanitizeText(input.country, 90) || null;
  const groupType = asString(input.groupType).toLowerCase();
  const budgetTier = asString(input.budgetTier).toLowerCase();
  const groupSize = Number(input.groupSize);
  const interests = normalizeInterests(input.interests);
  const languages = normalizeList(input.languages, LANGUAGE_LABELS, 6);
  const assistance = normalizeList(input.assistance, ASSISTANCE_LABELS, 8);
  const holidayStyles = normalizeList(input.holidayStyles, HOLIDAY_STYLE_LABELS, 8);
  const additionalServices = normalizeList(input.additionalServices, ADDITIONAL_SERVICE_LABELS, 8);
  const flexibleTiming = normalizeBoolean(input.flexibleTiming);
  const preferredStartTime = sanitizeText(input.preferredStartTime, 20) || null;
  const preferredEndTime = sanitizeText(input.preferredEndTime, 20) || null;
  const dream = sanitizeText(input.dream);
  const contactName = sanitizeText(input.contactName, 120);
  const contactEmail = asString(input.contactEmail).toLowerCase();
  const contactPhone = sanitizeText(input.contactPhone, 60) || null;
  const companyName = sanitizeText(input.companyName, 120) || null;
  const arrivalDate = normalizeDate(input.arrivalDate);
  const departureDate = normalizeDate(input.departureDate);
  const errors: string[] = [];

  if (!city) errors.push("Indica la ciudad o destino.");
  if (!(groupType in GROUP_TYPE_LABELS)) errors.push("Selecciona el tipo de grupo.");
  if (!Number.isInteger(groupSize) || groupSize < 2 || groupSize > 1000) {
    errors.push("El tamano del grupo debe estar entre 2 y 1000 personas.");
  }
  if (!(budgetTier in BUDGET_TIER_LABELS)) errors.push("Selecciona un presupuesto.");
  if (!languages.length) errors.push("Selecciona al menos un idioma.");
  if (!assistance.length) errors.push("Selecciona al menos una asistencia.");
  if (!holidayStyles.length && !interests.length) errors.push("Selecciona al menos un estilo de viaje.");
  if (dream.length < 20) errors.push("Describe el viaje ideal con un poco mas de detalle.");
  if (!contactName) errors.push("Indica el nombre de contacto.");
  if (!EMAIL_PATTERN.test(contactEmail)) errors.push("Indica un email valido.");
  if (arrivalDate && departureDate && departureDate < arrivalDate) {
    errors.push("La fecha de salida debe ser posterior a la llegada.");
  }

  if (errors.length) return { ok: false, errors };

  const accounting = calculateGroupOpportunityAccounting({ groupSize, budgetTier });
  const combinedInterests = Array.from(new Set([...interests, ...holidayStyles, ...assistance, ...additionalServices]));
  const leadPriority = detectProDiscoveryLeadPriority(dream, groupType, additionalServices);

  return {
    ok: true,
    data: {
      locale,
      city,
      country,
      arrivalDate,
      departureDate,
      groupType,
      groupSize,
      budgetTier,
      budgetMin: accounting.budgetMin,
      budgetMax: accounting.budgetMax,
      interests: combinedInterests,
      languages,
      assistance,
      holidayStyles,
      additionalServices,
      flexibleTiming,
      preferredStartTime,
      preferredEndTime,
      leadPriority,
      dream,
      contactName,
      contactEmail,
      contactPhone,
      companyName,
      estimatedBudget: accounting.estimatedBudget,
      depositPercent: 20,
      depositAmount: accounting.depositAmount
    }
  };
}

export function createProDiscoveryRequestCode(now = new Date()) {
  const dateKey = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(
    now.getUTCDate()
  ).padStart(2, "0")}`;
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PD-${dateKey}-${suffix}`;
}

const labelList = (values: string[], labels: Record<string, string>) =>
  values.map((value) => labels[value] ?? value).join(", ");

export function buildFallbackItineraryDraft(
  data: NormalizedProDiscoveryGroupPayload,
  requestCode: string
): ProDiscoveryItineraryDraft {
  const interests = labelList(data.interests, INTEREST_LABELS);
  const groupType = GROUP_TYPE_LABELS[data.groupType] ?? data.groupType;
  const assistance = labelList(data.assistance, ASSISTANCE_LABELS);

  return {
    summary: `Solicitud ${requestCode} para ${data.groupSize} viajeros en ${data.city}. La propuesta puede combinar ${interests.toLowerCase()} con asistencia en ${assistance.toLowerCase()} para un grupo de tipo ${groupType.toLowerCase()}.`,
    days: [
      {
        title: `Llegada y bienvenida en ${data.city}`,
        morning: "Bienvenida del grupo, revision sencilla del plan y traslado privado hacia la primera experiencia.",
        afternoon: "Actividad suave de bienvenida segun intereses principales y distancia real desde el alojamiento.",
        evening: "Cena o experiencia privada de apertura con control de tiempos y traslados."
      },
      {
        title: "Dia fuerte de experiencia privada",
        morning: "Ruta principal con guia lider, punto de encuentro claro y ventanas de traslado realistas.",
        afternoon: "Bloque de actividad central adaptado al presupuesto y al tamano del grupo.",
        evening: "Cierre flexible: relax, gastronomia o vida nocturna segun perfil del grupo."
      }
    ].map((day) => ({
      ...day,
      logistics: "Se afinan alojamiento, accesos, tiempos de espera, vehiculos y alternativas por clima o trafico."
    })),
    supplierNeeds: [
      "Guia privado o anfitrion principal para el grupo",
      "Transporte privado ajustado al tamano del grupo",
      "Accesos o reservas pensadas para evitar esperas innecesarias",
      "Contacto local para cambios de ultimo minuto",
      ...data.additionalServices.map((item) => ADDITIONAL_SERVICE_LABELS[item] ?? item)
    ],
    riskNotes: [
      "Confirmar fechas y ciudad antes de reservar espacios.",
      "El deposito recomendado es del 20% para apartar la experiencia.",
      "El precio final depende de disponibilidad, rutas y nivel de privacidad."
    ],
    nextQuestions: [
      "Cual es el hotel o zona exacta del grupo?",
      "Hay personas con movilidad reducida o requisitos especiales?",
      "Prefieren una experiencia privada completa o algunas actividades compartidas?"
    ]
  };
}

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_URL = (model: string, apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw) as Partial<ProDiscoveryItineraryDraft>;
  } catch {
    return null;
  }
}

function normalizeDraftShape(value: Partial<ProDiscoveryItineraryDraft> | null, fallback: ProDiscoveryItineraryDraft) {
  if (!value) return fallback;
  const days = Array.isArray(value.days)
    ? value.days
        .map((day) => ({
          title: sanitizeText(day?.title, 120) || "Bloque de viaje",
          morning: sanitizeText(day?.morning, 280) || "Actividad por definir.",
          afternoon: sanitizeText(day?.afternoon, 280) || "Actividad por definir.",
          evening: sanitizeText(day?.evening, 280) || "Cierre flexible.",
          logistics: sanitizeText(day?.logistics, 280) || "Detalles pendientes de confirmacion."
        }))
        .slice(0, 5)
    : fallback.days;

  const stringArray = (items: unknown, fallbackItems: string[]) =>
    Array.isArray(items)
      ? items.map((item) => sanitizeText(item, 180)).filter(Boolean).slice(0, 8)
      : fallbackItems;

  return {
    summary: sanitizeText(value.summary, 700) || fallback.summary,
    days: days.length ? days : fallback.days,
    supplierNeeds: stringArray(value.supplierNeeds, fallback.supplierNeeds),
    riskNotes: stringArray(value.riskNotes, fallback.riskNotes),
    nextQuestions: stringArray(value.nextQuestions, fallback.nextQuestions)
  };
}

export async function generateProDiscoveryItineraryDraft(
  data: NormalizedProDiscoveryGroupPayload,
  requestCode: string
): Promise<{ draft: ProDiscoveryItineraryDraft; status: "GENERATED" | "FALLBACK"; error?: string | null }> {
  const fallback = buildFallbackItineraryDraft(data, requestCode);
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return { draft: fallback, status: "FALLBACK", error: "GEMINI_API_KEY missing" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8500);
  const prompt = `
Eres un planner senior de viajes privados y grupos. Crea una propuesta de trabajo para el equipo de ProDiscovery.
No vendas tickets estandar. Enfocate en experiencia privada, guia, transporte, tiempos claros y momentos memorables.

Solicitud:
- Codigo: ${requestCode}
- Ciudad: ${data.city}
- Pais: ${data.country ?? "por confirmar"}
- Grupo: ${GROUP_TYPE_LABELS[data.groupType]} (${data.groupSize} personas)
- Presupuesto: ${BUDGET_TIER_LABELS[data.budgetTier]} USD ${data.budgetMin}-${data.budgetMax}
- Idiomas guia: ${labelList(data.languages, LANGUAGE_LABELS)}
- Horarios: ${data.flexibleTiming ? "flexibles / por confirmar" : `${data.preferredStartTime ?? "inicio por confirmar"} a ${data.preferredEndTime ?? "fin por confirmar"}`}
- Asistencia solicitada: ${labelList(data.assistance, ASSISTANCE_LABELS)}
- Estilo de viaje: ${labelList(data.holidayStyles, HOLIDAY_STYLE_LABELS)}
- Servicios adicionales: ${data.additionalServices.length ? labelList(data.additionalServices, ADDITIONAL_SERVICE_LABELS) : "ninguno indicado"}
- Prioridad interna: ${data.leadPriority}
- Intereses: ${labelList(data.interests, INTEREST_LABELS)}
- Sueno del cliente: ${data.dream}

Devuelve solo JSON valido con esta forma:
{
  "summary": "maximo 90 palabras",
  "days": [
    {"title":"", "morning":"", "afternoon":"", "evening":"", "logistics":""}
  ],
  "supplierNeeds": [],
  "riskNotes": [],
  "nextQuestions": []
}
`.trim();

  try {
    const response = await fetch(GEMINI_API_URL(GEMINI_MODEL, apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.45,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      return { draft: fallback, status: "FALLBACK", error: `Gemini HTTP ${response.status}` };
    }

    const payload = (await response.json()) as GeminiApiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n").trim() ?? "";
    const generated = normalizeDraftShape(extractJson(text), fallback);
    return { draft: generated, status: "GENERATED", error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed";
    return { draft: fallback, status: "FALLBACK", error: message };
  } finally {
    clearTimeout(timeout);
  }
}

const escapeHtml = (value: string | number | null | undefined) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildList = (items: string[]) =>
  items.map((item) => `<li style="margin-bottom:8px;">${escapeHtml(item)}</li>`).join("");

export function buildProDiscoveryOpportunityEmail({
  data,
  draft,
  requestCode,
  baseUrl
}: {
  data: NormalizedProDiscoveryGroupPayload;
  draft: ProDiscoveryItineraryDraft;
  requestCode: string;
  baseUrl: string;
}) {
  const dayCards = draft.days
    .map(
      (day) => `
        <div style="padding:18px;border-radius:18px;background:#ffffff;border:1px solid rgba(15,23,42,0.08);margin-bottom:12px;">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.24em;color:#10b981;font-weight:700;">${escapeHtml(day.title)}</p>
          <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:#475569;"><strong>Manana:</strong> ${escapeHtml(day.morning)}</p>
          <p style="margin:6px 0 0;font-size:14px;line-height:1.7;color:#475569;"><strong>Tarde:</strong> ${escapeHtml(day.afternoon)}</p>
          <p style="margin:6px 0 0;font-size:14px;line-height:1.7;color:#475569;"><strong>Noche:</strong> ${escapeHtml(day.evening)}</p>
          <p style="margin:10px 0 0;font-size:13px;line-height:1.7;color:#64748b;"><strong>Detalles a coordinar:</strong> ${escapeHtml(day.logistics)}</p>
        </div>
      `
    )
    .join("");

  return buildEmailShell({
    eyebrow: "ProDiscovery Concierge",
    title: `Solicitud ProDiscovery #${requestCode}`,
    intro: `Hola ${data.contactName}, recibimos tu solicitud para ${data.city}. Nuestro equipo ya tiene los detalles para revisar disponibilidad, tiempos y servicios.`,
    baseUrl,
    tone: "success",
    footerNote: "El equipo ProDiscovery revisara disponibilidad, horarios y detalles antes de enviarte la propuesta.",
    disclaimer:
      "Este correo confirma una solicitud de viaje a medida. No es una reserva confirmada ni un cargo de pago.",
    reasonWhyReceived: "Recibes este correo porque completaste el planificador de ProDiscovery.",
    contentHtml: `
      <div style="padding:18px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
        <p style="margin:0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#94a3b8;">Resumen del viaje</p>
        <p style="margin:10px 0 0;font-size:15px;line-height:1.75;color:#334155;">${escapeHtml(draft.summary)}</p>
        <p style="margin:12px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
          Grupo: ${escapeHtml(GROUP_TYPE_LABELS[data.groupType])} - ${data.groupSize} personas - Presupuesto ${escapeHtml(
            BUDGET_TIER_LABELS[data.budgetTier]
          )}. Deposito recomendado para bloquear agenda: ${data.depositPercent}%.
        </p>
        <p style="margin:8px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
          Idiomas: ${escapeHtml(labelList(data.languages, LANGUAGE_LABELS))}. Horarios: ${escapeHtml(
            data.flexibleTiming
              ? "flexibles / por confirmar"
              : `${data.preferredStartTime ?? "inicio por confirmar"} a ${data.preferredEndTime ?? "fin por confirmar"}`
          )}.
        </p>
        <p style="margin:8px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
          Asistencia: ${escapeHtml(labelList(data.assistance, ASSISTANCE_LABELS))}. Extras: ${escapeHtml(
            data.additionalServices.length ? labelList(data.additionalServices, ADDITIONAL_SERVICE_LABELS) : "por definir"
          )}.
        </p>
      </div>
      <div style="margin-top:18px;">${dayCards}</div>
      <div style="display:grid;gap:12px;margin-top:18px;">
        <div style="padding:18px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
          <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#94a3b8;">Lo que podemos incluir</p>
          <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.7;color:#475569;">${buildList(draft.supplierNeeds)}</ul>
        </div>
        <div style="padding:18px;border-radius:18px;background:#fff7ed;border:1px solid rgba(251,146,60,0.28);">
          <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#c2410c;">Para cerrar la propuesta</p>
          <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.7;color:#7c2d12;">${buildList(draft.nextQuestions)}</ul>
        </div>
      </div>
    `
  });
}

export const toJsonValue = (value: unknown) => value as Prisma.InputJsonValue;
