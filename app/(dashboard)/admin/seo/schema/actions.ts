"use server";

import { revalidatePath } from "next/cache";
import type { Locale } from "@/lib/translations";
import {
  clearTransferSchemaOverride,
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

export async function saveTransferSchemaOverrideAction(formData: FormData) {
  const slug = readField(formData, "slug");
  const locale = (readField(formData, "locale") || "es") as Locale;
  const scope = readField(formData, "scope") === "all" ? "all" : locale;

  if (!slug) {
    throw new Error("Selecciona una landing.");
  }

  const override: TransferSchemaOverride = {
    serviceEnabled: readToggle(formData, "service_enabled"),
    faqEnabled: readToggle(formData, "faq_enabled"),
    breadcrumbEnabled: readToggle(formData, "breadcrumb_enabled"),
    serviceName: readField(formData, "service_name") || undefined,
    serviceType: readField(formData, "service_type") || undefined,
    description: readField(formData, "description") || undefined,
    providerType: readField(formData, "provider_type") || undefined,
    providerName: readField(formData, "provider_name") || undefined,
    providerImage: readField(formData, "provider_image") || undefined,
    areaServed: parseTextareaList(readField(formData, "area_served")),
    offerName: readField(formData, "offer_name") || undefined,
    price: readField(formData, "price") || undefined,
    priceCurrency: readField(formData, "price_currency") || undefined,
    availability: readField(formData, "availability") || undefined,
    priceValidUntil: readField(formData, "price_valid_until") || undefined,
    aggregateRatingValue: readField(formData, "aggregate_rating_value") || undefined,
    aggregateReviewCount: readField(formData, "aggregate_review_count") || undefined,
    faqItems: parseFaqItems(readField(formData, "faq_items")),
    breadcrumbItems: parseBreadcrumbItems(readField(formData, "breadcrumb_items")),
    extraGraph: parseExtraGraph(readField(formData, "extra_graph"))
  };

  await saveTransferSchemaOverride(slug, scope, override);

  revalidatePath("/admin/seo");
  revalidatePath("/admin/seo/schema");
  revalidatePath(`/transfer/${slug}`);
  revalidatePath(`/en/transfer/${slug}`);
  revalidatePath(`/fr/transfer/${slug}`);
}

export async function clearTransferSchemaOverrideAction(formData: FormData) {
  const slug = readField(formData, "slug");
  const locale = (readField(formData, "locale") || "es") as Locale;
  const scope = readField(formData, "scope") === "all" ? "all" : locale;

  if (!slug) {
    throw new Error("Selecciona una landing.");
  }

  await clearTransferSchemaOverride(slug, scope);

  revalidatePath("/admin/seo");
  revalidatePath("/admin/seo/schema");
  revalidatePath(`/transfer/${slug}`);
  revalidatePath(`/en/transfer/${slug}`);
  revalidatePath(`/fr/transfer/${slug}`);
}
