"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/lib/translations";
import { getGeminiSchemaReview, reviewTransferSchemaWithGemini } from "@/lib/geminiSchemaReview";
import { updateSchemaProcessingState } from "@/lib/schemaProcessingState";
import {
  clearTransferSchemaOverride,
  generateTransferFaqDraft,
  getTransferSchemaOverride,
  parseAdditionalProperties,
  parseBreadcrumbItems,
  parseExtraGraph,
  parseFaqItems,
  parseTextareaList,
  saveTransferSchemaOverride,
  type TransferSchemaOverride
} from "@/lib/schemaManager";

const readField = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const isRedirectError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "digest" in error &&
  typeof (error as { digest?: unknown }).digest === "string" &&
  (error as { digest: string }).digest.startsWith("NEXT_REDIRECT");

const readToggle = (formData: FormData, key: string): boolean | undefined => {
  const value = readField(formData, key);
  if (value === "enabled") return true;
  if (value === "disabled") return false;
  return undefined;
};

const revalidateTransferSchemaPaths = (slug: string) => {
  revalidatePath("/admin/seo");
  revalidatePath("/admin/seo/schema");
  revalidatePath(`/transfer/${slug}`);
  revalidatePath(`/en/transfer/${slug}`);
  revalidatePath(`/fr/transfer/${slug}`);
};

const buildOverrideFromForm = (formData: FormData): TransferSchemaOverride => ({
  serviceEnabled: readToggle(formData, "service_enabled"),
  faqEnabled: readToggle(formData, "faq_enabled"),
  breadcrumbEnabled: readToggle(formData, "breadcrumb_enabled"),
  identifier: readField(formData, "identifier") || undefined,
  serviceName: readField(formData, "service_name") || undefined,
  serviceType: readField(formData, "service_type") || undefined,
  description: readField(formData, "description") || undefined,
  mainEntityOfPage: readField(formData, "main_entity_of_page") || undefined,
  providerType: readField(formData, "provider_type") || undefined,
  providerName: readField(formData, "provider_name") || undefined,
  providerImage: readField(formData, "provider_image") || undefined,
  providerTelephone: readField(formData, "provider_telephone") || undefined,
  providerEmail: readField(formData, "provider_email") || undefined,
  contactType: readField(formData, "contact_type") || undefined,
  streetAddress: readField(formData, "street_address") || undefined,
  addressLocality: readField(formData, "address_locality") || undefined,
  addressRegion: readField(formData, "address_region") || undefined,
  postalCode: readField(formData, "postal_code") || undefined,
  addressCountry: readField(formData, "address_country") || undefined,
  areaServed: parseTextareaList(readField(formData, "area_served")),
  offerName: readField(formData, "offer_name") || undefined,
  price: readField(formData, "price") || undefined,
  priceCurrency: readField(formData, "price_currency") || undefined,
  availability: readField(formData, "availability") || undefined,
  priceValidUntil: readField(formData, "price_valid_until") || undefined,
  lastVerified: readField(formData, "last_verified") || undefined,
  priceRange: readField(formData, "price_range") || undefined,
  imageObjectUrl: readField(formData, "image_object_url") || undefined,
  imageObjectCaption: readField(formData, "image_object_caption") || undefined,
  aggregateRatingValue: readField(formData, "aggregate_rating_value") || undefined,
  aggregateReviewCount: readField(formData, "aggregate_review_count") || undefined,
  additionalProperties: parseAdditionalProperties(readField(formData, "additional_properties")),
  originName: readField(formData, "origin_name") || undefined,
  originPlaceId: readField(formData, "origin_place_id") || undefined,
  originLatitude: readField(formData, "origin_latitude") || undefined,
  originLongitude: readField(formData, "origin_longitude") || undefined,
  destinationName: readField(formData, "destination_name") || undefined,
  destinationPlaceId: readField(formData, "destination_place_id") || undefined,
  destinationLatitude: readField(formData, "destination_latitude") || undefined,
  destinationLongitude: readField(formData, "destination_longitude") || undefined,
  faqItems: parseFaqItems(readField(formData, "faq_items")),
  breadcrumbItems: parseBreadcrumbItems(readField(formData, "breadcrumb_items")),
  extraGraph: parseExtraGraph(readField(formData, "extra_graph"))
});

const hasMeaningfulValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
  return true;
};

const mergeSuggestedOverride = (
  existing: TransferSchemaOverride | null,
  suggestion: Partial<TransferSchemaOverride> | null | undefined
): TransferSchemaOverride => {
  const merged: TransferSchemaOverride = { ...(existing ?? {}) };
  Object.entries(suggestion ?? {}).forEach(([key, value]) => {
    if (hasMeaningfulValue(value)) {
      (merged as Record<string, unknown>)[key] = value;
    }
  });
  return merged;
};

export async function saveTransferSchemaOverrideAction(formData: FormData) {
  const slug = readField(formData, "slug");
  const locale = (readField(formData, "locale") || "es") as Locale;
  const scope = readField(formData, "scope") === "all" ? "all" : locale;

  if (!slug) {
    throw new Error("Selecciona una landing.");
  }

  await saveTransferSchemaOverride(slug, scope, buildOverrideFromForm(formData));
  if (scope !== "all") {
    await updateSchemaProcessingState(slug, scope, {
      overrideAppliedAt: new Date().toISOString(),
      overrideAppliedSource: "manual"
    });
  }
  revalidateTransferSchemaPaths(slug);
}

export async function clearTransferSchemaOverrideAction(formData: FormData) {
  const slug = readField(formData, "slug");
  const locale = (readField(formData, "locale") || "es") as Locale;
  const scope = readField(formData, "scope") === "all" ? "all" : locale;

  if (!slug) {
    throw new Error("Selecciona una landing.");
  }

  await clearTransferSchemaOverride(slug, scope);
  revalidateTransferSchemaPaths(slug);
}

export async function generateTransferFaqDraftAction(formData: FormData) {
  const slug = readField(formData, "slug");
  const locale = (readField(formData, "locale") || "es") as Locale;
  const serviceName = readField(formData, "service_name") || "Private transfer";
  const destinationName = readField(formData, "destination_name") || "the destination";
  const price = readField(formData, "price");
  const currency = readField(formData, "price_currency") || "USD";

  if (!slug) {
    throw new Error("Selecciona una landing.");
  }

  const draft = generateTransferFaqDraft({
    serviceName,
    destinationName,
    price,
    currency
  });

  const params = new URLSearchParams({
    slug,
    locale,
    faqDraft: draft.map((item) => [item.question, item.answer, item.image ?? "", item.video ?? ""].join(" | ")).join("\n")
  });

  redirect(`/admin/seo/schema?${params.toString()}`);
}

export async function reviewTransferSchemaWithGeminiAction(formData: FormData) {
  const slug = readField(formData, "slug");
  const locale = (readField(formData, "locale") || "es") as Locale;
  const pageUrl = readField(formData, "page_url");
  const pageTitle = readField(formData, "page_title");
  const pageDescription = readField(formData, "page_description");
  const schemaGraphRaw = readField(formData, "schema_graph");

  if (!slug) {
    throw new Error("Selecciona una landing.");
  }

  let schemaGraph: Record<string, unknown>;
  try {
    schemaGraph = JSON.parse(schemaGraphRaw) as Record<string, unknown>;
  } catch {
    throw new Error("El schemaGraph enviado al review no es JSON valido.");
  }

  try {
    const review = await reviewTransferSchemaWithGemini({
      slug,
      locale,
      pageUrl,
      pageTitle,
      pageDescription,
      schemaGraph
    });
    await updateSchemaProcessingState(slug, locale, {
      reviewGeneratedAt: review.generatedAt,
      reviewModel: review.model,
      reviewSource: "manual"
    });

    revalidateTransferSchemaPaths(slug);
    redirect(`/admin/seo/schema?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}&gemini=ok`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Gemini review failed.";
    redirect(
      `/admin/seo/schema?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}&gemini_error=${encodeURIComponent(message)}`
    );
  }
}

export async function applyGeminiOverrideSuggestionsAction(formData: FormData) {
  const slug = readField(formData, "slug");
  const locale = (readField(formData, "locale") || "es") as Locale;

  if (!slug) {
    throw new Error("Selecciona una landing.");
  }

  const review = await getGeminiSchemaReview(slug, locale);
  if (!review?.overrideSuggestions) {
    redirect(
      `/admin/seo/schema?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}&gemini_error=${encodeURIComponent("Gemini aun no tiene overrideSuggestions guardadas para esta landing.")}`
    );
  }

  const storeScope = locale;
  const current = await getTransferSchemaOverride(slug, locale);
  const merged = mergeSuggestedOverride(current, review.overrideSuggestions);
  await saveTransferSchemaOverride(slug, storeScope, merged);
  await updateSchemaProcessingState(slug, locale, {
    overrideAppliedAt: new Date().toISOString(),
    overrideAppliedSource: "manual"
  });
  revalidateTransferSchemaPaths(slug);
  redirect(`/admin/seo/schema?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}&gemini=applied`);
}
