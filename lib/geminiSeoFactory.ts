import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import type { Locale } from "@/lib/translations";

export type GeminiSeoLandingType = "tour" | "transfer";
export type GeminiSeoLandingStatus = "draft" | "published" | "rejected";

export type GeminiSeoSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type GeminiSeoFaq = {
  question: string;
  answer: string;
};

export type GeminiSeoLocaleContent = {
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  h1: string;
  intro: string;
  sections: GeminiSeoSection[];
  faqs: GeminiSeoFaq[];
  ctaLabel: string;
  image: string;
  imageAlt: string;
  keywords: string[];
  schema: Record<string, unknown>;
};

export type GeminiSeoLandingRecord = {
  kind: "gemini-seo-landing";
  version: 1;
  slug: string;
  type: GeminiSeoLandingType;
  status: GeminiSeoLandingStatus;
  generatedAt: string;
  publishedAt?: string | null;
  rejectedAt?: string | null;
  model: string;
  product: {
    id: string;
    slug: string;
    title: string;
    type: GeminiSeoLandingType;
    url: string;
    image: string;
    price?: number | null;
    currency?: string;
    duration?: string | null;
    location?: string | null;
    originName?: string | null;
    destinationName?: string | null;
  };
  intent: {
    id: string;
    label: string;
    searchQuery: string;
    angle: string;
  };
  sources: Array<{ title: string; uri: string }>;
  validation: {
    score: number;
    issues: string[];
  };
  autoPublished: boolean;
  locales: Record<Locale, GeminiSeoLocaleContent>;
  rawGeminiText?: string;
};

export type GeminiSeoFactoryConfig = {
  enabled: boolean;
  autoPublish: boolean;
  dailyLimit: number;
  tourDailyLimit: number;
  transferDailyLimit: number;
  cursor: number;
  pausedSchemaAutopilot: boolean;
  lastRunAt?: string | null;
  lastResult?: {
    generated: number;
    published: number;
    drafted: number;
    rejected: number;
    errors: string[];
  } | null;
};

type GeminiSeoFactoryCandidate = {
  type: GeminiSeoLandingType;
  product: GeminiSeoLandingRecord["product"];
  intent: GeminiSeoLandingRecord["intent"];
};

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: {
          uri?: string;
          title?: string;
        };
      }>;
    };
  }>;
};

const BASE_URL = "https://proactivitis.com";
const FACTORY_CONFIG_KEY = "GEMINI_SEO_FACTORY_CONFIG";
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_URL = (model: string, apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
const LOCALES: Locale[] = ["es", "en", "fr"];

const DEFAULT_CONFIG: GeminiSeoFactoryConfig = {
  enabled: false,
  autoPublish: false,
  dailyLimit: 20,
  tourDailyLimit: 8,
  transferDailyLimit: 12,
  cursor: 0,
  pausedSchemaAutopilot: true,
  lastRunAt: null,
  lastResult: null
};

const TOUR_INTENTS = [
  {
    id: "price-2026",
    label: "Precio 2026",
    angle: "clear price, inclusions, pickup, best booking moment"
  },
  {
    id: "hotel-pickup",
    label: "Con recogida en hotel",
    angle: "hotel pickup, meeting points, smooth booking flow"
  },
  {
    id: "families",
    label: "Ideal familias",
    angle: "family-friendly, safety, logistics, age expectations"
  },
  {
    id: "private-vip",
    label: "Privado/VIP",
    angle: "private experience, better comfort, premium coordination"
  },
  {
    id: "groups",
    label: "Grupos",
    angle: "groups, birthdays, friends, easy coordination"
  },
  {
    id: "best-time",
    label: "Mejor horario",
    angle: "best time to book, weather, pickup timing, crowd control"
  },
  {
    id: "rainy-day",
    label: "Dia lluvioso",
    angle: "what happens if weather changes, flexible support"
  },
  {
    id: "first-time",
    label: "Primera vez",
    angle: "first-time traveler confidence, what to expect"
  }
];

const TRANSFER_INTENTS = [
  {
    id: "private-transfer",
    label: "Private transfer",
    angle: "private transfer, direct route, trusted arrival"
  },
  {
    id: "round-trip",
    label: "Ida y vuelta",
    angle: "round trip, return flight, secure price"
  },
  {
    id: "family-van",
    label: "Van familiar",
    angle: "families, luggage, van comfort"
  },
  {
    id: "price-2026",
    label: "Precio 2026",
    angle: "fixed price, clear booking, no surprises"
  },
  {
    id: "late-flight",
    label: "Vuelo tarde",
    angle: "late arrivals, flight tracking, WhatsApp support"
  },
  {
    id: "luxury-suv",
    label: "SUV premium",
    angle: "premium arrival, SUV option, comfort"
  },
  {
    id: "groups",
    label: "Grupos",
    angle: "group transfer, luggage, avoid split taxis"
  },
  {
    id: "airport-pickup",
    label: "Airport pickup",
    angle: "airport pickup, name sign, driver coordination"
  }
];

const toJson = (value: unknown) => value as Prisma.InputJsonValue;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const absoluteUrl = (value?: string | null) => {
  if (!value) return `${BASE_URL}/transfer/sedan.png`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

const parseJsonArray = (value?: string | null): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const extractText = (data: GeminiApiResponse) =>
  data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n").trim() ?? "";

const extractSources = (data: GeminiApiResponse) => {
  const chunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  return chunks
    .map((chunk) => chunk.web)
    .filter((web): web is { uri: string; title?: string } => Boolean(web?.uri))
    .filter((web) => {
      if (seen.has(web.uri)) return false;
      seen.add(web.uri);
      return true;
    })
    .slice(0, 8)
    .map((web) => ({ uri: web.uri, title: web.title || web.uri }));
};

const parseJsonFromText = (text: string) => {
  const direct = text.trim();
  const fenced = direct.match(/```json\s*([\s\S]+?)```/i)?.[1] ?? direct.match(/```\s*([\s\S]+?)```/i)?.[1];
  const payload = (fenced ?? direct).trim();
  try {
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    const start = payload.indexOf("{");
    const end = payload.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(payload.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error("Gemini no devolvio JSON valido para la landing.");
  }
};

const safeString = (value: unknown, fallback = "") => (typeof value === "string" ? value.trim() : fallback);

const safeStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => safeString(item)).filter(Boolean).slice(0, 16) : [];

const safeSections = (value: unknown): GeminiSeoSection[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isObject)
    .map((item) => ({
      heading: safeString(item.heading),
      body: safeString(item.body),
      bullets: safeStringArray(item.bullets).slice(0, 6)
    }))
    .filter((item) => item.heading && item.body)
    .slice(0, 8);
};

const safeFaqs = (value: unknown): GeminiSeoFaq[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isObject)
    .map((item) => ({
      question: safeString(item.question),
      answer: safeString(item.answer)
    }))
    .filter((item) => item.question && item.answer)
    .slice(0, 8);
};

export async function getGeminiSeoFactoryConfig(): Promise<GeminiSeoFactoryConfig> {
  const record = await prisma.siteContentSetting.findUnique({ where: { key: FACTORY_CONFIG_KEY } });
  if (!record?.content || !isObject(record.content)) return DEFAULT_CONFIG;
  return {
    ...DEFAULT_CONFIG,
    ...(record.content as Partial<GeminiSeoFactoryConfig>)
  };
}

export async function saveGeminiSeoFactoryConfig(config: Partial<GeminiSeoFactoryConfig>) {
  const current = await getGeminiSeoFactoryConfig();
  const next = { ...current, ...config };
  await prisma.siteContentSetting.upsert({
    where: { key: FACTORY_CONFIG_KEY },
    update: { content: toJson(next) },
    create: { key: FACTORY_CONFIG_KEY, content: toJson(next) }
  });
  return next;
}

const parseLandingRecord = (body: string): GeminiSeoLandingRecord | null => {
  try {
    const parsed = JSON.parse(body) as unknown;
    if (!isObject(parsed) || parsed.kind !== "gemini-seo-landing") return null;
    return parsed as GeminiSeoLandingRecord;
  } catch {
    return null;
  }
};

export async function getGeminiSeoLanding(slug: string) {
  const row = await prisma.landingPage.findUnique({ where: { slug } });
  if (!row) return null;
  const parsed = parseLandingRecord(row.body);
  return parsed;
}

export async function listGeminiSeoLandings() {
  const rows = await prisma.landingPage.findMany({
    orderBy: { updatedAt: "desc" },
    take: 300
  });
  return rows
    .map((row) => parseLandingRecord(row.body))
    .filter((item): item is GeminiSeoLandingRecord => Boolean(item));
}

export async function listPublishedGeminiSeoLandings() {
  const rows = await prisma.landingPage.findMany({
    orderBy: { updatedAt: "desc" }
  });
  return rows
    .map((row) => parseLandingRecord(row.body))
    .filter((item): item is GeminiSeoLandingRecord => Boolean(item && item.status === "published"));
}

const buildTourCandidates = async (limit: number, offset: number): Promise<GeminiSeoFactoryCandidate[]> => {
  const tours = await prisma.tour.findMany({
    where: { status: { in: ["published", "seo_only"] } },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      duration: true,
      location: true,
      category: true,
      shortDescription: true,
      description: true,
      heroImage: true,
      gallery: true
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: Math.max(1, limit + offset + 16)
  });

  return tours.slice(offset, offset + limit).map((tour, index) => {
    const intent = TOUR_INTENTS[(offset + index) % TOUR_INTENTS.length];
    const image = tour.heroImage || parseJsonArray(tour.gallery)[0] || "/transfer/sedan.png";
    return {
      type: "tour",
      product: {
        id: tour.id,
        slug: tour.slug,
        title: tour.title,
        type: "tour",
        url: `${BASE_URL}/tours/${tour.slug}`,
        image: absoluteUrl(image),
        price: tour.price,
        currency: "USD",
        duration: tour.duration,
        location: tour.location
      },
      intent: {
        ...intent,
        searchQuery: `${tour.title} Punta Cana ${intent.label} tour`
      }
    };
  });
};

const buildTransferCandidates = async (limit: number, offset: number): Promise<GeminiSeoFactoryCandidate[]> => {
  const manual = allLandings().map((landing) => ({
    landingSlug: landing.landingSlug,
    originName: "Punta Cana International Airport (PUJ)",
    destinationName: landing.hotelName,
    destinationSlug: landing.hotelSlug,
    image: landing.heroImage || "/transfer/sedan.png",
    price: landing.priceFrom
  }));
  const dynamic = (await getDynamicTransferLandingCombos()).slice(0, 500).map((combo) => ({
    landingSlug: combo.landingSlug,
    originName: combo.originName,
    destinationName: combo.destinationName,
    destinationSlug: combo.destinationSlug,
    image: "/transfer/sedan.png",
    price: null
  }));
  const transfers = [...manual, ...dynamic];

  return transfers.slice(offset, offset + limit).map((transfer, index) => {
    const intent = TRANSFER_INTENTS[(offset + index) % TRANSFER_INTENTS.length];
    const title = `${transfer.originName} to ${transfer.destinationName}`;
    return {
      type: "transfer",
      product: {
        id: transfer.landingSlug,
        slug: transfer.landingSlug,
        title,
        type: "transfer",
        url: `${BASE_URL}/transfer/${transfer.landingSlug}`,
        image: absoluteUrl(transfer.image),
        price: transfer.price,
        currency: "USD",
        originName: transfer.originName,
        destinationName: transfer.destinationName,
        location: "Punta Cana, Dominican Republic"
      },
      intent: {
        ...intent,
        searchQuery: `${title} ${intent.label} Punta Cana transfer`
      }
    };
  });
};

const buildPrompt = (candidate: GeminiSeoFactoryCandidate) => `
You are Proactivitis SEO Factory, a senior travel SEO strategist and conversion copywriter.
Use Google Search grounding to understand current search intent, language, competitor angles, and traveler questions.

Create one high-converting landing page for the real Proactivitis product below.
Return strict JSON only. Do not wrap in markdown.

Product:
${JSON.stringify(candidate.product, null, 2)}

Search intent:
${JSON.stringify(candidate.intent, null, 2)}

Rules:
- Produce content in Spanish, English, and French.
- Do not invent prices, ratings, availability, discounts, or guarantees that are not in Product.
- You may compare market expectations, but the page must sell Proactivitis.
- Every locale must be unique and natural, not a literal translation.
- Write professional commercial copy, not admin language.
- The page must answer: what this is, why trust it, what happens next.
- Include schema JSON-LD per locale.
- Schema must include image and thumbnailUrl using the product image.
- Include WebPage, FAQPage, BreadcrumbList, and either TouristTrip for tours or Service for transfers.
- Avoid fake aggregateRating or review if not provided.
- Keep schema safe for Google.
- Use short sections and strong CTAs.

Return this exact JSON shape:
{
  "slug": "lowercase-seo-slug-without-locale",
  "primaryKeyword": "main keyword",
  "secondaryKeywords": ["keyword"],
  "locales": {
    "es": {
      "title": "SEO title under 62 chars",
      "metaDescription": "SEO description under 155 chars",
      "ogTitle": "OpenGraph title",
      "ogDescription": "OpenGraph description",
      "h1": "main headline",
      "intro": "short persuasive intro",
      "sections": [
        { "heading": "section heading", "body": "section body", "bullets": ["bullet"] }
      ],
      "faqs": [
        { "question": "question", "answer": "answer" }
      ],
      "ctaLabel": "CTA",
      "imageAlt": "image alt",
      "keywords": ["keyword"],
      "schema": {}
    },
    "en": { "...": "same keys" },
    "fr": { "...": "same keys" }
  }
}
`.trim();

const callGemini = async (candidate: GeminiSeoFactoryCandidate) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Falta GEMINI_API_KEY en el entorno.");

  const response = await fetch(GEMINI_API_URL(DEFAULT_MODEL, apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(candidate) }]
        }
      ],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.35
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Gemini error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as GeminiApiResponse;
  const text = extractText(data);
  if (!text) throw new Error("Gemini no devolvio texto util.");
  return {
    parsed: parseJsonFromText(text),
    rawText: text,
    sources: extractSources(data)
  };
};

const buildFallbackLocale = (
  candidate: GeminiSeoFactoryCandidate,
  locale: Locale,
  parsedLocale?: Record<string, unknown>
): GeminiSeoLocaleContent => {
  const typeLabel =
    candidate.type === "transfer"
      ? locale === "fr"
        ? "transfert prive"
        : locale === "en"
          ? "private transfer"
          : "traslado privado"
      : locale === "fr"
        ? "experience"
        : locale === "en"
          ? "tour"
          : "tour";
  const baseTitle = `${candidate.product.title} ${typeLabel}`;
  const title = safeString(parsedLocale?.title, baseTitle).slice(0, 78);
  const metaDescription = safeString(
    parsedLocale?.metaDescription,
    `${candidate.product.title} with Proactivitis. Clear details, local support, and secure booking.`
  ).slice(0, 170);
  const sections = safeSections(parsedLocale?.sections);
  const faqs = safeFaqs(parsedLocale?.faqs);
  return {
    title,
    metaDescription,
    ogTitle: safeString(parsedLocale?.ogTitle, title),
    ogDescription: safeString(parsedLocale?.ogDescription, metaDescription),
    h1: safeString(parsedLocale?.h1, title),
    intro: safeString(
      parsedLocale?.intro,
      `${candidate.product.title} coordinated by Proactivitis with clear information before booking.`
    ),
    sections:
      sections.length > 0
        ? sections
        : [
            {
              heading: locale === "es" ? "Por que reservar aqui" : locale === "fr" ? "Pourquoi reserver ici" : "Why book here",
              body: `${candidate.product.title} keeps the booking focused on confirmed details, local support, and a simple next step.`,
              bullets: ["Local support", "Clear booking", "Secure checkout"]
            }
          ],
    faqs:
      faqs.length > 0
        ? faqs
        : [
            {
              question: locale === "es" ? "Como reservo?" : locale === "fr" ? "Comment reserver?" : "How do I book?",
              answer:
                locale === "es"
                  ? "Elige la opcion disponible y continua al checkout seguro de Proactivitis."
                  : locale === "fr"
                    ? "Choisissez l option disponible et continuez vers le checkout securise de Proactivitis."
                    : "Choose the available option and continue to Proactivitis secure checkout."
            }
          ],
    ctaLabel: safeString(
      parsedLocale?.ctaLabel,
      locale === "es" ? "Ver disponibilidad" : locale === "fr" ? "Voir disponibilite" : "Check availability"
    ),
    image: candidate.product.image,
    imageAlt: safeString(parsedLocale?.imageAlt, candidate.product.title),
    keywords: safeStringArray(parsedLocale?.keywords),
    schema: isObject(parsedLocale?.schema) ? (parsedLocale?.schema as Record<string, unknown>) : {}
  };
};

const buildSafeSchema = ({
  landing,
  locale,
  content
}: {
  landing: GeminiSeoLandingRecord;
  locale: Locale;
  content: GeminiSeoLocaleContent;
}) => {
  const prefix = locale === "es" ? "" : `/${locale}`;
  const pageUrl = `${BASE_URL}${prefix}/punta-cana/${landing.slug}`;
  const imageUrl = absoluteUrl(content.image || landing.product.image);
  const productNode =
    landing.type === "transfer"
      ? {
          "@type": "Service",
          "@id": `${pageUrl}#service`,
          name: content.h1,
          serviceType: "Private airport transfer",
          description: content.metaDescription,
          provider: { "@id": `${BASE_URL}#organization` },
          image: imageUrl,
          thumbnailUrl: imageUrl,
          areaServed: landing.product.location || "Punta Cana, Dominican Republic",
          offers: {
            "@type": "Offer",
            url: landing.product.url,
            priceCurrency: landing.product.currency || "USD",
            price: landing.product.price ?? undefined,
            availability: "https://schema.org/InStock"
          }
        }
      : {
          "@type": "TouristTrip",
          "@id": `${pageUrl}#tour`,
          name: content.h1,
          description: content.metaDescription,
          image: imageUrl,
          thumbnailUrl: imageUrl,
          touristType: "Travelers visiting Punta Cana",
          provider: { "@id": `${BASE_URL}#organization` },
          offers: {
            "@type": "Offer",
            url: landing.product.url,
            priceCurrency: landing.product.currency || "USD",
            price: landing.product.price ?? undefined,
            availability: "https://schema.org/InStock"
          }
        };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}#organization`,
        name: "Proactivitis",
        url: BASE_URL,
        logo: `${BASE_URL}/icon.png`
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: content.title,
        description: content.metaDescription,
        inLanguage: locale,
        isPartOf: { "@id": `${BASE_URL}#website` },
        primaryImageOfPage: { "@id": `${pageUrl}#image` },
        mainEntity: { "@id": productNode["@id"] }
      },
      {
        "@type": "ImageObject",
        "@id": `${pageUrl}#image`,
        url: imageUrl,
        contentUrl: imageUrl,
        thumbnailUrl: imageUrl,
        caption: content.imageAlt
      },
      productNode,
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: content.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Proactivitis",
            item: BASE_URL
          },
          {
            "@type": "ListItem",
            position: 2,
            name: landing.type === "transfer" ? "Transfers" : "Tours",
            item: landing.type === "transfer" ? `${BASE_URL}/traslado` : `${BASE_URL}/tours`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: content.h1,
            item: pageUrl
          }
        ]
      }
    ]
  };
};

const validateLanding = (landing: GeminiSeoLandingRecord) => {
  const issues: string[] = [];
  if (!landing.slug || landing.slug.length < 8) issues.push("Slug muy corto o ausente.");
  if (!landing.product.url || !landing.product.title) issues.push("Producto real incompleto.");
  for (const locale of LOCALES) {
    const content = landing.locales[locale];
    if (!content?.title || content.title.length < 20) issues.push(`${locale}: titulo debil.`);
    if (!content?.metaDescription || content.metaDescription.length < 70) issues.push(`${locale}: meta description debil.`);
    if (!content?.h1 || content.h1.length < 12) issues.push(`${locale}: H1 debil.`);
    if (!content?.sections || content.sections.length < 3) issues.push(`${locale}: faltan secciones.`);
    if (!content?.faqs || content.faqs.length < 3) issues.push(`${locale}: faltan FAQs.`);
    if (!content?.image || !content.schema) issues.push(`${locale}: falta imagen o schema.`);
  }
  const score = Math.max(0, 100 - issues.length * 12);
  return { score, issues };
};

const normalizeGeneratedLanding = async (
  candidate: GeminiSeoFactoryCandidate,
  parsed: Record<string, unknown>,
  rawText: string,
  sources: Array<{ title: string; uri: string }>,
  autoPublish: boolean
): Promise<GeminiSeoLandingRecord> => {
  const rawSlug = safeString(parsed.slug, `${candidate.product.slug}-${candidate.intent.id}`);
  const slugBase = slugify(rawSlug || `${candidate.product.slug}-${candidate.intent.id}`);
  let slug = slugBase;
  let suffix = 2;
  while (await prisma.landingPage.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${suffix}`;
    suffix += 1;
  }

  const parsedLocales = isObject(parsed.locales) ? parsed.locales : {};
  const locales = LOCALES.reduce(
    (acc, locale) => {
      const parsedLocale = isObject(parsedLocales[locale]) ? (parsedLocales[locale] as Record<string, unknown>) : undefined;
      acc[locale] = buildFallbackLocale(candidate, locale, parsedLocale);
      return acc;
    },
    {} as Record<Locale, GeminiSeoLocaleContent>
  );

  let landing: GeminiSeoLandingRecord = {
    kind: "gemini-seo-landing",
    version: 1,
    slug,
    type: candidate.type,
    status: "draft",
    generatedAt: new Date().toISOString(),
    publishedAt: null,
    rejectedAt: null,
    model: DEFAULT_MODEL,
    product: candidate.product,
    intent: candidate.intent,
    sources,
    validation: { score: 0, issues: [] },
    autoPublished: false,
    locales,
    rawGeminiText: rawText
  };

  for (const locale of LOCALES) {
    landing.locales[locale] = {
      ...landing.locales[locale],
      image: candidate.product.image,
      schema: buildSafeSchema({ landing, locale, content: landing.locales[locale] })
    };
  }

  const validation = validateLanding(landing);
  landing = {
    ...landing,
    validation,
    status: autoPublish && validation.score >= 76 ? "published" : "draft",
    publishedAt: autoPublish && validation.score >= 76 ? new Date().toISOString() : null,
    autoPublished: autoPublish && validation.score >= 76
  };
  return landing;
};

export async function saveGeminiSeoLanding(landing: GeminiSeoLandingRecord) {
  await prisma.landingPage.upsert({
    where: { slug: landing.slug },
    update: {
      title: landing.locales.es.title,
      body: JSON.stringify(landing)
    },
    create: {
      slug: landing.slug,
      title: landing.locales.es.title,
      body: JSON.stringify(landing)
    }
  });
}

export async function updateGeminiSeoLandingStatus(slug: string, status: GeminiSeoLandingStatus) {
  const landing = await getGeminiSeoLanding(slug);
  if (!landing) throw new Error("Landing no encontrada.");
  const next: GeminiSeoLandingRecord = {
    ...landing,
    status,
    publishedAt: status === "published" ? new Date().toISOString() : landing.publishedAt ?? null,
    rejectedAt: status === "rejected" ? new Date().toISOString() : null
  };
  await saveGeminiSeoLanding(next);
  return next;
}

export async function generateGeminiSeoLanding(candidate: GeminiSeoFactoryCandidate, autoPublish: boolean) {
  const result = await callGemini(candidate);
  const landing = await normalizeGeneratedLanding(
    candidate,
    result.parsed,
    result.rawText,
    result.sources,
    autoPublish
  );
  await saveGeminiSeoLanding(landing);
  return landing;
}

export async function runGeminiSeoFactoryBatch({ manualLimit }: { manualLimit?: number } = {}) {
  const config = await getGeminiSeoFactoryConfig();
  const limit = Math.max(1, Math.min(manualLimit ?? config.dailyLimit, config.dailyLimit, 50));
  const transferLimit = Math.min(config.transferDailyLimit, limit);
  const tourLimit = Math.min(config.tourDailyLimit, Math.max(0, limit - transferLimit));
  const cursor = Math.max(0, config.cursor);

  if (!config.enabled && !manualLimit) {
    return {
      generated: 0,
      published: 0,
      drafted: 0,
      rejected: 0,
      errors: ["SEO Factory esta pausado."]
    };
  }

  const [transferCandidates, tourCandidates] = await Promise.all([
    buildTransferCandidates(transferLimit, cursor),
    buildTourCandidates(tourLimit, cursor)
  ]);
  const candidates: GeminiSeoFactoryCandidate[] = [];
  const maxCandidateLength = Math.max(transferCandidates.length, tourCandidates.length);
  for (let index = 0; index < maxCandidateLength; index += 1) {
    if (transferCandidates[index]) candidates.push(transferCandidates[index]);
    if (tourCandidates[index]) candidates.push(tourCandidates[index]);
  }
  const selectedCandidates = candidates.slice(0, limit);
  const result = {
    generated: 0,
    published: 0,
    drafted: 0,
    rejected: 0,
    errors: [] as string[]
  };

  const persistProgress = async () => {
    await saveGeminiSeoFactoryConfig({
      cursor: cursor + result.generated,
      lastRunAt: new Date().toISOString(),
      lastResult: result
    });
  };

  await persistProgress();

  for (const candidate of selectedCandidates) {
    try {
      const landing = await generateGeminiSeoLanding(candidate, config.autoPublish);
      result.generated += 1;
      if (landing.status === "published") result.published += 1;
      if (landing.status === "draft") result.drafted += 1;
      if (landing.status === "rejected") result.rejected += 1;
      await persistProgress();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown_error";
      result.errors.push(`${candidate.type}:${candidate.product.slug}:${detail}`);
      await persistProgress();
      if (
        detail.includes("RESOURCE_EXHAUSTED") ||
        detail.includes("Quota exceeded") ||
        detail.includes("exceeded your current quota")
      ) {
        break;
      }
    }
  }

  await persistProgress();
  return result;
}
