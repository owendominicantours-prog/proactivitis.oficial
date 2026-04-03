import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Locale } from "@/lib/translations";

type SchemaNode = Record<string, unknown>;

export type SchemaAdditionalProperty = {
  name: string;
  value: string;
};

export type SchemaFaqItem = {
  question: string;
  answer: string;
  image?: string;
  video?: string;
};

export type SchemaBreadcrumbItem = {
  name: string;
  item: string;
};

export type TransferSchemaOverride = {
  serviceEnabled?: boolean;
  faqEnabled?: boolean;
  breadcrumbEnabled?: boolean;
  identifier?: string;
  serviceName?: string;
  serviceType?: string;
  description?: string;
  mainEntityOfPage?: string;
  providerType?: string;
  providerName?: string;
  providerImage?: string;
  areaServed?: string[];
  offerName?: string;
  price?: string;
  priceCurrency?: string;
  availability?: string;
  priceValidUntil?: string;
  lastVerified?: string;
  priceRange?: string;
  imageObjectUrl?: string;
  imageObjectCaption?: string;
  aggregateRatingValue?: string;
  aggregateReviewCount?: string;
  additionalProperties?: SchemaAdditionalProperty[];
  originName?: string;
  originPlaceId?: string;
  originLatitude?: string;
  originLongitude?: string;
  destinationName?: string;
  destinationPlaceId?: string;
  destinationLatitude?: string;
  destinationLongitude?: string;
  faqItems?: SchemaFaqItem[];
  breadcrumbItems?: SchemaBreadcrumbItem[];
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

const buildPlaceNode = ({
  name,
  placeId,
  latitude,
  longitude
}: {
  name?: string;
  placeId?: string;
  latitude?: string;
  longitude?: string;
}) => {
  if (!name && !placeId && !latitude && !longitude) return null;
  const node: SchemaNode = {
    "@type": "Place"
  };
  if (name) node.name = name;
  if (placeId) node.identifier = placeId;
  const lat = toFiniteNumber(latitude);
  const lng = toFiniteNumber(longitude);
  if (lat !== null && lng !== null) {
    node.geo = {
      "@type": "GeoCoordinates",
      latitude: lat,
      longitude: lng
    };
  }
  return node;
};

const getGraphNodes = (graph?: Record<string, unknown> | null): SchemaNode[] => {
  if (!graph) return [];
  const nodes = graph["@graph"];
  return Array.isArray(nodes) ? nodes.filter(isObject) as SchemaNode[] : [graph].filter(isObject) as SchemaNode[];
};

const findNodeByType = (graph: Record<string, unknown> | null | undefined, type: string) =>
  getGraphNodes(graph).find((node) => {
    const nodeType = node["@type"];
    if (typeof nodeType === "string") return nodeType === type;
    if (Array.isArray(nodeType)) return nodeType.includes(type);
    return false;
  });

export function getSchemaHealthScore(
  override?: TransferSchemaOverride | null,
  graph?: Record<string, unknown> | null
) {
  const serviceNode = findNodeByType(graph, "Service");
  const businessNode = findNodeByType(graph, "TravelAgency") ?? findNodeByType(graph, "LocalBusiness");
  const checks = [
    Boolean(override?.identifier || serviceNode?.identifier),
    Boolean(override?.serviceName || serviceNode?.name),
    Boolean(
      override?.price ||
        (isObject(serviceNode?.offers as unknown) && (serviceNode?.offers as SchemaNode).price) ||
        (isObject(serviceNode?.hasOfferCatalog as unknown) &&
          Array.isArray((serviceNode?.hasOfferCatalog as SchemaNode).itemListElement) &&
          isObject(((serviceNode?.hasOfferCatalog as SchemaNode).itemListElement as unknown[])[0]) &&
          (((serviceNode?.hasOfferCatalog as SchemaNode).itemListElement as SchemaNode[])[0].price as unknown))
    ),
    Boolean(
      override?.priceCurrency ||
        (isObject(serviceNode?.offers as unknown) && (serviceNode?.offers as SchemaNode).priceCurrency) ||
        (isObject(serviceNode?.hasOfferCatalog as unknown) &&
          Array.isArray((serviceNode?.hasOfferCatalog as SchemaNode).itemListElement) &&
          isObject(((serviceNode?.hasOfferCatalog as SchemaNode).itemListElement as unknown[])[0]) &&
          (((serviceNode?.hasOfferCatalog as SchemaNode).itemListElement as SchemaNode[])[0].priceCurrency as unknown))
    ),
    Boolean(
      (override?.aggregateRatingValue && override?.aggregateReviewCount) ||
        (isObject(serviceNode?.aggregateRating as unknown) &&
          (serviceNode?.aggregateRating as SchemaNode).ratingValue &&
          (serviceNode?.aggregateRating as SchemaNode).reviewCount)
    ),
    Boolean(
      override?.destinationPlaceId ||
        (override?.destinationLatitude && override?.destinationLongitude) ||
        (Array.isArray(serviceNode?.areaServed) && serviceNode!.areaServed.length > 1)
    ),
    Boolean(
      (override?.additionalProperties && override.additionalProperties.length > 0) || Array.isArray(serviceNode?.additionalProperty)
    ),
    Boolean(override?.lastVerified || serviceNode?.dateModified || businessNode?.priceRange)
  ];
  const completed = checks.filter(Boolean).length;
  return {
    completed,
    total: checks.length,
    percentage: Math.round((completed / checks.length) * 100)
  };
}

export function getSchemaWarnings(
  override?: TransferSchemaOverride | null,
  graph?: Record<string, unknown> | null
) {
  const serviceNode = findNodeByType(graph, "Service");
  const businessNode = findNodeByType(graph, "TravelAgency") ?? findNodeByType(graph, "LocalBusiness");
  const warnings: string[] = [];
  if (!override?.identifier && !serviceNode?.identifier) warnings.push("Falta identifier estable.");
  if (!override?.price && !serviceNode?.offers && !serviceNode?.hasOfferCatalog) warnings.push("Falta estructura de precio.");
  if (
    !override?.priceCurrency &&
    !(
      isObject(serviceNode?.offers as unknown) && (serviceNode?.offers as SchemaNode).priceCurrency
    ) &&
    !(
      isObject(serviceNode?.hasOfferCatalog as unknown) &&
      Array.isArray((serviceNode?.hasOfferCatalog as SchemaNode).itemListElement)
    )
  ) {
    warnings.push("Falta priceCurrency ISO.");
  }
  if (!override?.mainEntityOfPage && !serviceNode?.mainEntityOfPage) warnings.push("Falta mainEntityOfPage/canonical explicita.");
  if (
    !(
      (override?.aggregateRatingValue && override?.aggregateReviewCount) ||
      (isObject(serviceNode?.aggregateRating as unknown) &&
        (serviceNode?.aggregateRating as SchemaNode).ratingValue &&
        (serviceNode?.aggregateRating as SchemaNode).reviewCount)
    )
  ) {
    warnings.push("No hay aggregateRating disponible.");
  }
  if (
    !(
      override?.destinationPlaceId ||
      (override?.destinationLatitude && override?.destinationLongitude) ||
      (Array.isArray(serviceNode?.areaServed) && serviceNode!.areaServed.length > 1)
    )
  ) {
    warnings.push("Falta destino con Place ID o coordenadas.");
  }
  if (!businessNode?.telephone) warnings.push('Falta el campo "telephone" (opcional).');
  if (!businessNode?.address) warnings.push('Falta el campo "address" (opcional).');
  if (!businessNode?.priceRange) warnings.push('Falta el campo "priceRange" (opcional).');
  return warnings;
}

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
    additionalProperties: localeOverride.additionalProperties ?? globalOverride.additionalProperties,
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

export function parseFaqItems(value: string): SchemaFaqItem[] {
  return value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, answer, image, video] = line.split("|").map((item) => item.trim());
      return {
        question: question ?? "",
        answer: answer ?? "",
        image: image || undefined,
        video: video || undefined
      };
    })
    .filter((item) => item.question && item.answer);
}

export function parseBreadcrumbItems(value: string): SchemaBreadcrumbItem[] {
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

export function parseAdditionalProperties(value: string): SchemaAdditionalProperty[] {
  return value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split("|");
      return {
        name: (name ?? "").trim(),
        value: rest.join("|").trim()
      };
    })
    .filter((item) => item.name && item.value);
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

export function stringifyFaqItems(items?: SchemaFaqItem[]) {
  return (items ?? [])
    .map((item) => [item.question, item.answer, item.image ?? "", item.video ?? ""].join(" | "))
    .join("\n");
}

export function stringifyBreadcrumbItems(items?: SchemaBreadcrumbItem[]) {
  return (items ?? []).map((item) => `${item.name} | ${item.item}`).join("\n");
}

export function stringifyAdditionalProperties(items?: SchemaAdditionalProperty[]) {
  return (items ?? []).map((item) => `${item.name} | ${item.value}`).join("\n");
}

export function generateTransferFaqDraft({
  serviceName,
  destinationName,
  price,
  currency
}: {
  serviceName: string;
  destinationName: string;
  price?: string | number | null;
  currency?: string | null;
}): SchemaFaqItem[] {
  const amount = String(price ?? "").trim();
  const money = String(currency ?? "USD").trim() || "USD";
  return [
    {
      question: `How much is ${serviceName}?`,
      answer: amount ? `The current direct booking rate is ${amount} ${money}.` : `Request a live quote for the latest ${money} rate.`
    },
    {
      question: `Where do I meet my driver for ${destinationName}?`,
      answer: "Your driver waits at arrivals with a name sign and tracks your flight in real time."
    },
    {
      question: "What is included in the private transfer?",
      answer: "Private vehicle, luggage assistance, air conditioning, and direct service to the destination."
    }
  ];
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
  const businessNode = cloneNode(businessSchema);
  const serviceNode = cloneNode(serviceSchema);
  const faqNode = cloneNode(faqSchema);
  const breadcrumbNode = cloneNode(breadcrumbSchema);

  if (override) {
    if (override.identifier) {
      serviceNode.identifier = override.identifier;
      serviceNode["@id"] = String(serviceNode["@id"] ?? override.identifier);
    }
    if (override.serviceName) serviceNode.name = override.serviceName;
    if (override.serviceType) serviceNode.serviceType = override.serviceType;
    if (override.description) serviceNode.description = override.description;
    if (override.mainEntityOfPage) serviceNode.mainEntityOfPage = override.mainEntityOfPage;
    if (override.lastVerified) {
      serviceNode.dateModified = override.lastVerified;
      serviceNode.sdDatePublished = override.lastVerified;
    }

    if (override.providerType || override.providerName || override.providerImage || override.priceRange) {
      const provider = isObject(serviceNode.provider) ? cloneNode(serviceNode.provider as SchemaNode) : {};
      if (override.providerType) provider["@type"] = override.providerType;
      if (override.providerName) provider.name = override.providerName;
      if (override.providerImage) {
        provider.image = override.providerImage;
        provider.logo = provider.logo ?? override.providerImage;
      }
      if (override.priceRange) provider.priceRange = override.priceRange;
      serviceNode.provider = provider;
      Object.assign(businessNode, provider);
    }

    const originPlace = buildPlaceNode({
      name: override.originName,
      placeId: override.originPlaceId,
      latitude: override.originLatitude,
      longitude: override.originLongitude
    });
    const destinationPlace = buildPlaceNode({
      name: override.destinationName,
      placeId: override.destinationPlaceId,
      latitude: override.destinationLatitude,
      longitude: override.destinationLongitude
    });

    if (originPlace || destinationPlace || (override.areaServed && override.areaServed.length > 0)) {
      const areaServed = [
        ...(originPlace ? [originPlace] : []),
        ...(destinationPlace ? [destinationPlace] : []),
        ...((override.areaServed ?? []).map((name) => ({ "@type": "Place", name }) as SchemaNode))
      ];
      if (areaServed.length > 0) {
        serviceNode.areaServed = areaServed;
      }
      if (destinationPlace) {
        serviceNode.serviceLocation = destinationPlace;
      }
    }

    if (override.imageObjectUrl) {
      serviceNode.image = [
        {
          "@type": "ImageObject",
          url: override.imageObjectUrl,
          ...(override.imageObjectCaption ? { caption: override.imageObjectCaption } : {})
        }
      ];
    }

    if (override.additionalProperties && override.additionalProperties.length > 0) {
      serviceNode.additionalProperty = override.additionalProperties.map((item) => ({
        "@type": "PropertyValue",
        name: item.name,
        value: item.value
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
        if (override.lastVerified) firstOffer.validFrom = override.lastVerified;
        if (override.offerName && isObject(firstOffer.itemOffered)) {
          const itemOffered = cloneNode(firstOffer.itemOffered as SchemaNode);
          itemOffered.name = override.offerName;
          if (override.identifier) itemOffered.identifier = override.identifier;
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
          text: item.answer,
          ...(item.image ? { image: item.image } : {}),
          ...(item.video ? { subjectOf: item.video } : {})
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

  nodes.push(stripContext(businessNode));
  if (override?.serviceEnabled !== false) nodes.push(stripContext(serviceNode));
  if (override?.faqEnabled !== false) nodes.push(stripContext(faqNode));
  if (override?.breadcrumbEnabled !== false) nodes.push(stripContext(breadcrumbNode));
  (override?.extraGraph ?? []).filter(isObject).forEach((node) => nodes.push(stripContext(node)));

  return {
    "@context": "https://schema.org",
    "@graph": nodes
  };
}
