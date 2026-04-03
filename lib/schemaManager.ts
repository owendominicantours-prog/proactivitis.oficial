import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Locale } from "@/lib/translations";

type SchemaNode = Record<string, unknown>;

export type TransferSchemaOverride = {
  serviceEnabled?: boolean;
  faqEnabled?: boolean;
  breadcrumbEnabled?: boolean;
  serviceName?: string;
  serviceType?: string;
  description?: string;
  providerType?: string;
  providerName?: string;
  providerImage?: string;
  areaServed?: string[];
  offerName?: string;
  price?: string;
  priceCurrency?: string;
  availability?: string;
  priceValidUntil?: string;
  aggregateRatingValue?: string;
  aggregateReviewCount?: string;
  faqItems?: Array<{ question: string; answer: string }>;
  breadcrumbItems?: Array<{ name: string; item: string }>;
  extraGraph?: SchemaNode[];
};

type SchemaManagerStore = {
  transfer?: Record<string, Partial<Record<Locale | "all", TransferSchemaOverride>>>;
};

const SCHEMA_MANAGER_KEY = "SCHEMA_MANAGER";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cloneNode = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const toJson = (value: unknown) => value as Prisma.InputJsonValue;

const toFiniteNumber = (value?: string | number | null) => {
  const parsed = typeof value === "number" ? value : Number(value ?? "");
  return Number.isFinite(parsed) ? parsed : null;
};

const stripContext = (node: SchemaNode): SchemaNode => {
  const cloned = cloneNode(node);
  delete cloned["@context"];
  return cloned;
};

export async function getSchemaManagerStore(): Promise<SchemaManagerStore> {
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: SCHEMA_MANAGER_KEY }
    });
    if (!record?.content || !isObject(record.content)) return {};
    return record.content as SchemaManagerStore;
  } catch {
    return {};
  }
}

export async function getTransferSchemaOverride(
  pageSlug: string,
  locale: Locale
): Promise<TransferSchemaOverride | null> {
  const store = await getSchemaManagerStore();
  const slugEntry = store.transfer?.[pageSlug];
  if (!slugEntry) return null;
  const globalOverride = slugEntry.all ?? {};
  const localeOverride = slugEntry[locale] ?? {};
  const merged: TransferSchemaOverride = {
    ...globalOverride,
    ...localeOverride,
    areaServed: localeOverride.areaServed ?? globalOverride.areaServed,
    faqItems: localeOverride.faqItems ?? globalOverride.faqItems,
    breadcrumbItems: localeOverride.breadcrumbItems ?? globalOverride.breadcrumbItems,
    extraGraph: localeOverride.extraGraph ?? globalOverride.extraGraph
  };
  return Object.keys(merged).length > 0 ? merged : null;
}

export async function saveTransferSchemaOverride(
  pageSlug: string,
  locale: Locale | "all",
  override: TransferSchemaOverride
) {
  const store = await getSchemaManagerStore();
  const nextStore: SchemaManagerStore = {
    ...store,
    transfer: {
      ...(store.transfer ?? {}),
      [pageSlug]: {
        ...(store.transfer?.[pageSlug] ?? {}),
        [locale]: override
      }
    }
  };

  await prisma.siteContentSetting.upsert({
    where: { key: SCHEMA_MANAGER_KEY },
    update: { content: toJson(nextStore) },
    create: { key: SCHEMA_MANAGER_KEY, content: toJson(nextStore) }
  });
}

export async function clearTransferSchemaOverride(pageSlug: string, locale: Locale | "all") {
  const store = await getSchemaManagerStore();
  if (!store.transfer?.[pageSlug]?.[locale]) return;

  const nextStore = cloneNode(store);
  if (nextStore.transfer?.[pageSlug]) {
    const slugEntry = nextStore.transfer[pageSlug];
    if (slugEntry) {
      delete slugEntry[locale];
    }
  }
  if (nextStore.transfer?.[pageSlug] && Object.keys(nextStore.transfer[pageSlug] ?? {}).length === 0) {
    delete nextStore.transfer[pageSlug];
  }

  await prisma.siteContentSetting.upsert({
    where: { key: SCHEMA_MANAGER_KEY },
    update: { content: toJson(nextStore) },
    create: { key: SCHEMA_MANAGER_KEY, content: toJson(nextStore) }
  });
}

export function parseTextareaList(value: string): string[] {
  return value
    .split(/\r?\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseFaqItems(value: string): Array<{ question: string; answer: string }> {
  return value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, ...rest] = line.split("|");
      return {
        question: (question ?? "").trim(),
        answer: rest.join("|").trim()
      };
    })
    .filter((item) => item.question && item.answer);
}

export function parseBreadcrumbItems(value: string): Array<{ name: string; item: string }> {
  return value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split("|");
      return {
        name: (name ?? "").trim(),
        item: rest.join("|").trim()
      };
    })
    .filter((item) => item.name && item.item);
}

export function parseExtraGraph(value: string): SchemaNode[] {
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter(isObject) as SchemaNode[];
    }
    return isObject(parsed) ? [parsed] : [];
  } catch {
    return [];
  }
}

export function stringifyFaqItems(items?: Array<{ question: string; answer: string }>) {
  return (items ?? []).map((item) => `${item.question} | ${item.answer}`).join("\n");
}

export function stringifyBreadcrumbItems(items?: Array<{ name: string; item: string }>) {
  return (items ?? []).map((item) => `${item.name} | ${item.item}`).join("\n");
}

export function applyTransferSchemaOverride({
  businessSchema,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
  override
}: {
  businessSchema: SchemaNode;
  serviceSchema: SchemaNode;
  faqSchema: SchemaNode;
  breadcrumbSchema: SchemaNode;
  override?: TransferSchemaOverride | null;
}) {
  const nodes: SchemaNode[] = [];
  const serviceNode = cloneNode(serviceSchema);
  const faqNode = cloneNode(faqSchema);
  const breadcrumbNode = cloneNode(breadcrumbSchema);

  if (override) {
    if (override.serviceName) serviceNode.name = override.serviceName;
    if (override.serviceType) serviceNode.serviceType = override.serviceType;
    if (override.description) serviceNode.description = override.description;

    if (override.providerType || override.providerName || override.providerImage) {
      const provider = isObject(serviceNode.provider) ? cloneNode(serviceNode.provider as SchemaNode) : {};
      if (override.providerType) provider["@type"] = override.providerType;
      if (override.providerName) provider.name = override.providerName;
      if (override.providerImage) provider.image = override.providerImage;
      serviceNode.provider = provider;
    }

    if (override.areaServed && override.areaServed.length > 0) {
      serviceNode.areaServed = override.areaServed.map((name) => ({
        "@type": "Place",
        name
      }));
    }

    if (isObject(serviceNode.hasOfferCatalog)) {
      const catalog = cloneNode(serviceNode.hasOfferCatalog as SchemaNode);
      const itemListElement = Array.isArray(catalog.itemListElement)
        ? cloneNode(catalog.itemListElement as SchemaNode[])
        : [];
      const firstOffer = itemListElement[0] && isObject(itemListElement[0]) ? cloneNode(itemListElement[0]) : null;
      if (firstOffer) {
        if (override.price) firstOffer.price = override.price;
        if (override.priceCurrency) firstOffer.priceCurrency = override.priceCurrency;
        if (override.availability) firstOffer.availability = override.availability;
        if (override.priceValidUntil) firstOffer.priceValidUntil = override.priceValidUntil;
        if (override.offerName && isObject(firstOffer.itemOffered)) {
          const itemOffered = cloneNode(firstOffer.itemOffered as SchemaNode);
          itemOffered.name = override.offerName;
          firstOffer.itemOffered = itemOffered;
        }
        itemListElement[0] = firstOffer;
        catalog.itemListElement = itemListElement;
        serviceNode.hasOfferCatalog = catalog;
      }
    }

    const ratingValue = toFiniteNumber(override.aggregateRatingValue);
    const reviewCount = toFiniteNumber(override.aggregateReviewCount);
    if (ratingValue && reviewCount) {
      serviceNode.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue,
        reviewCount,
        bestRating: 5,
        worstRating: 1
      };
    } else if (override.aggregateRatingValue !== undefined || override.aggregateReviewCount !== undefined) {
      delete serviceNode.aggregateRating;
    }

    if (override.faqItems && override.faqItems.length > 0) {
      faqNode.mainEntity = override.faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }));
    }

    if (override.breadcrumbItems && override.breadcrumbItems.length > 0) {
      breadcrumbNode.itemListElement = override.breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.item
      }));
    }
  }

  nodes.push(stripContext(businessSchema));
  if (override?.serviceEnabled !== false) nodes.push(stripContext(serviceNode));
  if (override?.faqEnabled !== false) nodes.push(stripContext(faqNode));
  if (override?.breadcrumbEnabled !== false) nodes.push(stripContext(breadcrumbNode));
  (override?.extraGraph ?? []).filter(isObject).forEach((node) => nodes.push(stripContext(node)));

  return {
    "@context": "https://schema.org",
    "@graph": nodes
  };
}
