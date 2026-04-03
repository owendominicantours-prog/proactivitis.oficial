import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Locale } from "@/lib/translations";
import type { TransferSchemaOverride } from "@/lib/schemaManager";

type GeminiReviewIssue = {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
};

export type GeminiSchemaReview = {
  generatedAt: string;
  model: string;
  summary: string;
  issues: GeminiReviewIssue[];
  recommendedChanges: string[];
  overrideSuggestions?: Partial<TransferSchemaOverride> | null;
  correctedGraph?: Record<string, unknown> | null;
  rawText?: string;
};

type GeminiReviewStore = {
  transfer?: Record<string, Partial<Record<Locale, GeminiSchemaReview>>>;
};

const GEMINI_REVIEW_KEY = "SCHEMA_MANAGER_GEMINI_REVIEWS";
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_URL = (model: string, apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const toJson = (value: unknown) => value as Prisma.InputJsonValue;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export async function getGeminiSchemaReview(slug: string, locale: Locale): Promise<GeminiSchemaReview | null> {
  try {
    const record = await prisma.siteContentSetting.findUnique({ where: { key: GEMINI_REVIEW_KEY } });
    if (!record?.content || !isObject(record.content)) return null;
    const content = record.content as GeminiReviewStore;
    return content.transfer?.[slug]?.[locale] ?? null;
  } catch {
    return null;
  }
}

export async function saveGeminiSchemaReview(slug: string, locale: Locale, review: GeminiSchemaReview) {
  const record = await prisma.siteContentSetting.findUnique({ where: { key: GEMINI_REVIEW_KEY } });
  const content = (record?.content as GeminiReviewStore | null) ?? {};
  const nextContent: GeminiReviewStore = {
    ...content,
    transfer: {
      ...(content.transfer ?? {}),
      [slug]: {
        ...(content.transfer?.[slug] ?? {}),
        [locale]: review
      }
    }
  };

  await prisma.siteContentSetting.upsert({
    where: { key: GEMINI_REVIEW_KEY },
    update: { content: toJson(nextContent) },
    create: { key: GEMINI_REVIEW_KEY, content: toJson(nextContent) }
  });
}

const extractText = (data: unknown): string => {
  if (!isObject(data)) return "";
  const candidates = Array.isArray(data.candidates) ? data.candidates : [];
  const first = candidates[0];
  if (!isObject(first)) return "";
  const content = first.content;
  if (!isObject(content) || !Array.isArray(content.parts)) return "";
  return content.parts
    .map((part) => (isObject(part) && typeof part.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
};

const parseJsonFromText = (text: string) => {
  const direct = text.trim();
  const fenced = direct.match(/```json\s*([\s\S]+?)```/i)?.[1] ?? direct.match(/```\s*([\s\S]+?)```/i)?.[1];
  const payload = (fenced ?? direct).trim();
  return JSON.parse(payload) as Record<string, unknown>;
};

export async function reviewTransferSchemaWithGemini({
  slug,
  locale,
  pageUrl,
  pageTitle,
  pageDescription,
  schemaGraph
}: {
  slug: string;
  locale: Locale;
  pageUrl: string;
  pageTitle: string;
  pageDescription: string;
  schemaGraph: Record<string, unknown>;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta GEMINI_API_KEY en el entorno.");
  }

  const prompt = `
You are a structured data auditor for SEO.
Review the provided JSON-LD for a travel transfer landing page.

Goals:
1. Find factual mismatches between page context and schema.
2. Find missing high-value structured data fields.
3. Keep recommendations realistic and conservative.
4. Return strict JSON only.

Return this exact shape:
{
  "summary": "short summary",
  "issues": [
    { "severity": "high|medium|low", "title": "short title", "detail": "specific explanation" }
  ],
  "recommendedChanges": ["change 1", "change 2"],
  "overrideSuggestions": {
    "identifier": "",
    "serviceName": "",
    "serviceType": "",
    "description": "",
    "mainEntityOfPage": "",
    "providerType": "",
    "providerName": "",
    "providerImage": "",
    "providerTelephone": "",
    "providerEmail": "",
    "contactType": "",
    "streetAddress": "",
    "addressLocality": "",
    "addressRegion": "",
    "postalCode": "",
    "addressCountry": "",
    "offerName": "",
    "price": "",
    "priceCurrency": "",
    "availability": "",
    "priceValidUntil": "",
    "lastVerified": "",
    "priceRange": "",
    "imageObjectUrl": "",
    "imageObjectCaption": "",
    "aggregateRatingValue": "",
    "aggregateReviewCount": "",
    "originName": "",
    "originPlaceId": "",
    "originLatitude": "",
    "originLongitude": "",
    "destinationName": "",
    "destinationPlaceId": "",
    "destinationLatitude": "",
    "destinationLongitude": "",
    "areaServed": [],
    "additionalProperties": [],
    "faqItems": [],
    "breadcrumbItems": []
  },
  "correctedGraph": { ...full corrected JSON-LD graph... }
}

Rules:
- Do not invent ratings, counts, prices, or coordinates unless already present in the input context.
- Fill ALL keys in overrideSuggestions. Never omit keys. If a value cannot be safely inferred, use an empty string, empty array, or null-equivalent empty structure.
- Prefer filling overrideSuggestions exhaustively from page context, schemaGraph, business defaults, and safe SEO conventions.
- If a value is missing, keep it empty in overrideSuggestions and mention it in issues/recommendations.
- Keep correctedGraph valid JSON-LD using schema.org.
- The overrideSuggestions object is intended to populate a CMS form, so completeness matters more than brevity.

Context:
- slug: ${slug}
- locale: ${locale}
- pageUrl: ${pageUrl}
- pageTitle: ${pageTitle}
- pageDescription: ${pageDescription}

Current schemaGraph:
${JSON.stringify(schemaGraph, null, 2)}
`.trim();

  const response = await fetch(GEMINI_API_URL(DEFAULT_GEMINI_MODEL, apiKey), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Gemini error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as unknown;
  const text = extractText(data);
  if (!text) {
    throw new Error("Gemini no devolvio texto util.");
  }

  const parsed = parseJsonFromText(text);
  const review: GeminiSchemaReview = {
    generatedAt: new Date().toISOString(),
    model: DEFAULT_GEMINI_MODEL,
    summary: typeof parsed.summary === "string" ? parsed.summary : "Gemini reviewed the schema.",
    issues: Array.isArray(parsed.issues)
      ? parsed.issues
          .filter((item) => isObject(item))
          .map((item) => ({
            severity:
              item.severity === "high" || item.severity === "medium" || item.severity === "low"
                ? item.severity
                : "low",
            title: typeof item.title === "string" ? item.title : "Issue",
            detail: typeof item.detail === "string" ? item.detail : ""
          }))
      : [],
    recommendedChanges: Array.isArray(parsed.recommendedChanges)
      ? parsed.recommendedChanges.filter((item) => typeof item === "string")
      : [],
    overrideSuggestions:
      parsed.overrideSuggestions && isObject(parsed.overrideSuggestions)
        ? (parsed.overrideSuggestions as Partial<TransferSchemaOverride>)
        : null,
    correctedGraph:
      parsed.correctedGraph && isObject(parsed.correctedGraph)
        ? (parsed.correctedGraph as Record<string, unknown>)
        : null,
    rawText: text
  };

  await saveGeminiSchemaReview(slug, locale, review);
  return review;
}
