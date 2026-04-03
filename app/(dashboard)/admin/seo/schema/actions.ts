"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/lib/translations";
import { reviewTransferSchemaWithGemini } from "@/lib/geminiSchemaReview";
import {
  clearTransferSchemaOverride,
  generateTransferFaqDraft,
  parseAdditionalProperties,
  parseBreadcrumbItems,
  parseExtraGraph,
  parseFaqItems,
  parseTextareaList,
  saveTransferSchemaOverride,
  type TransferSchemaOverride
} from "@/lib/schemaManager";

const readField = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

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

export async function saveTransferSchemaOverrideAction(formData: FormData) {
  const slug = readField(formData, "slug");
  const locale = (readField(formData, "locale") || "es") as Locale;
  const scope = readField(formData, "scope") === "all" ? "all" : locale;

  if (!slug) {
    throw new Error("Selecciona una landing.");
  }

  await saveTransferSchemaOverride(slug, scope, buildOverrideFromForm(formData));
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

  await reviewTransferSchemaWithGemini({
    slug,
    locale,
    pageUrl,
    pageTitle,
    pageDescription,
    schemaGraph
  });

  revalidateTransferSchemaPaths(slug);
}
