import { createSign } from "node:crypto";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const MERCHANT_PRODUCTS_URL = "https://merchantapi.googleapis.com/products/v1";
const MERCHANT_SCOPE = "https://www.googleapis.com/auth/content";

const siteUrl = () =>
  (
    cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) ||
    cleanEnv(process.env.NEXTAUTH_URL) ||
    "https://proactivitis.com"
  ).replace(/\/+$/, "");

const brandName = () =>
  cleanEnv(process.env.GOOGLE_MERCHANT_BRAND) || cleanEnv(process.env.NEXT_PUBLIC_BRAND_NAME) || "Proactivitis";

const merchantTourSelect = {
  id: true,
  productId: true,
  title: true,
  slug: true,
  price: true,
  duration: true,
  description: true,
  subtitle: true,
  shortDescription: true,
  category: true,
  language: true,
  includes: true,
  location: true,
  status: true,
  createdAt: true,
  gallery: true,
  heroImage: true,
  SupplierProfile: {
    select: {
      company: true
    }
  }
} satisfies Prisma.TourSelect;

type MerchantTour = Prisma.TourGetPayload<{ select: typeof merchantTourSelect }>;

type MerchantAuthMode = "oauth_refresh_token" | "service_account" | "missing";

export type MerchantProductInput = {
  offerId: string;
  contentLanguage: string;
  feedLabel: string;
  productAttributes: {
    title: string;
    description: string;
    link: string;
    mobileLink: string;
    imageLink: string;
    availability: "IN_STOCK" | "OUT_OF_STOCK";
    condition: "NEW";
    price: {
      amountMicros: string;
      currencyCode: string;
    };
    brand: string;
    productTypes: string[];
    googleProductCategory?: string;
    identifierExists: boolean;
    customLabel0?: string;
    customLabel1?: string;
    customLabel2?: string;
  };
  customAttributes?: Array<{ name: string; value: string }>;
};

export type MerchantProductSummary = {
  id: string;
  offerId: string;
  title: string;
  description: string;
  status: string;
  price: number;
  currencyCode: string;
  link: string;
  imageLink: string;
  supplier: string;
  category: string;
  location: string;
  contentLanguage: string;
  feedLabel: string;
  eligible: boolean;
  warnings: string[];
  input: MerchantProductInput;
};

export type MerchantConfigStatus = {
  ready: boolean;
  authMode: MerchantAuthMode;
  accountIdConfigured: boolean;
  dataSourceConfigured: boolean;
  missing: string[];
  accountId?: string;
  dataSource?: string;
  contentLanguage: string;
  feedLabel: string;
  currencyCode: string;
};

type MerchantConfig = MerchantConfigStatus & {
  accountId: string;
  dataSource: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
  oauthRefreshToken?: string;
  serviceAccountEmail?: string;
  serviceAccountPrivateKey?: string;
};

export type MerchantSyncItemResult = {
  id: string;
  offerId: string;
  title: string;
  status: "synced" | "failed";
  httpStatus?: number;
  merchantInputName?: string;
  merchantProductName?: string;
  error?: string;
};

const cleanEnv = (value: string | undefined) => value?.trim();

const normalizePrivateKey = (value: string) => value.replace(/\\n/g, "\n");

const textReplacements: Array<[string, string]> = [
  ["Ã¡", "a"],
  ["Ã©", "e"],
  ["Ã­", "i"],
  ["Ã³", "o"],
  ["Ãº", "u"],
  ["Ã±", "n"],
  ["Â¿", ""],
  ["Â¡", ""],
  ["Â·", "-"]
];

const sanitizeText = (value?: string | null) => {
  if (!value) return "";
  const noTags = value.replace(/<[^>]*>/g, " ");
  const normalized = textReplacements.reduce((text, [from, to]) => text.replaceAll(from, to), noTags);
  return normalized.replace(/\s+/g, " ").trim();
};

const truncate = (value: string, max: number) => (value.length > max ? value.slice(0, max - 1).trim() : value);

const parseGallery = (value?: string | null) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // Plain comma-separated gallery fallback below.
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const absoluteUrl = (value?: string | null) => {
  const baseUrl = siteUrl();
  if (!value) return `${baseUrl}/fototours/fotosimple.jpg`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
};

const amountMicros = (price: number) => String(Math.round(price * 1_000_000));

const normalizeOfferId = (value: string) =>
  value
    .replace(/[~/%]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 80);

const firstLanguage = (value: string, fallback: string) => {
  const normalized = sanitizeText(value).toLowerCase();
  if (normalized.includes("en")) return "en";
  if (normalized.includes("fr")) return "fr";
  if (normalized.includes("es") || normalized.includes("spanish") || normalized.includes("espanol")) return "es";
  return fallback;
};

export function getMerchantConfigStatus(): MerchantConfigStatus {
  const accountId = cleanEnv(process.env.GOOGLE_MERCHANT_ACCOUNT_ID);
  const dataSource =
    cleanEnv(process.env.GOOGLE_MERCHANT_DATA_SOURCE) ||
    (accountId && cleanEnv(process.env.GOOGLE_MERCHANT_DATASOURCE_ID)
      ? `accounts/${accountId}/dataSources/${cleanEnv(process.env.GOOGLE_MERCHANT_DATASOURCE_ID)}`
      : undefined);
  const oauthClientId = cleanEnv(process.env.GOOGLE_MERCHANT_CLIENT_ID) || cleanEnv(process.env.GOOGLE_CLIENT_ID);
  const oauthClientSecret =
    cleanEnv(process.env.GOOGLE_MERCHANT_CLIENT_SECRET) || cleanEnv(process.env.GOOGLE_CLIENT_SECRET);
  const oauthRefreshToken = cleanEnv(process.env.GOOGLE_MERCHANT_REFRESH_TOKEN);
  const serviceAccountEmail = cleanEnv(process.env.GOOGLE_MERCHANT_CLIENT_EMAIL);
  const serviceAccountPrivateKey = cleanEnv(process.env.GOOGLE_MERCHANT_PRIVATE_KEY);
  const hasOauth = Boolean(oauthClientId && oauthClientSecret && oauthRefreshToken);
  const hasServiceAccount = Boolean(serviceAccountEmail && serviceAccountPrivateKey);
  const authMode: MerchantAuthMode = hasServiceAccount ? "service_account" : hasOauth ? "oauth_refresh_token" : "missing";
  const missing: string[] = [];

  if (!accountId) missing.push("GOOGLE_MERCHANT_ACCOUNT_ID");
  if (!dataSource) missing.push("GOOGLE_MERCHANT_DATA_SOURCE o GOOGLE_MERCHANT_DATASOURCE_ID");
  if (!hasOauth && !hasServiceAccount) {
    missing.push("GOOGLE_MERCHANT_REFRESH_TOKEN o GOOGLE_MERCHANT_CLIENT_EMAIL/GOOGLE_MERCHANT_PRIVATE_KEY");
  }

  return {
    ready: missing.length === 0,
    authMode,
    accountIdConfigured: Boolean(accountId),
    dataSourceConfigured: Boolean(dataSource),
    missing,
    accountId,
    dataSource,
    contentLanguage: cleanEnv(process.env.GOOGLE_MERCHANT_CONTENT_LANGUAGE) || "es",
    feedLabel: cleanEnv(process.env.GOOGLE_MERCHANT_FEED_LABEL) || "US",
    currencyCode: cleanEnv(process.env.GOOGLE_MERCHANT_CURRENCY) || "USD"
  };
}

const getMerchantConfig = (): MerchantConfig => {
  const status = getMerchantConfigStatus();
  if (!status.accountId || !status.dataSource) {
    throw new Error(`Configuracion incompleta: ${status.missing.join(", ")}`);
  }
  return {
    ...status,
    accountId: status.accountId,
    dataSource: status.dataSource,
    oauthClientId: cleanEnv(process.env.GOOGLE_MERCHANT_CLIENT_ID) || cleanEnv(process.env.GOOGLE_CLIENT_ID),
    oauthClientSecret: cleanEnv(process.env.GOOGLE_MERCHANT_CLIENT_SECRET) || cleanEnv(process.env.GOOGLE_CLIENT_SECRET),
    oauthRefreshToken: cleanEnv(process.env.GOOGLE_MERCHANT_REFRESH_TOKEN),
    serviceAccountEmail: cleanEnv(process.env.GOOGLE_MERCHANT_CLIENT_EMAIL),
    serviceAccountPrivateKey: cleanEnv(process.env.GOOGLE_MERCHANT_PRIVATE_KEY)
  };
};

export async function getMerchantProductSummaries({
  productIds,
  limit = 120
}: {
  productIds?: string[];
  limit?: number;
} = {}) {
  const config = getMerchantConfigStatus();
  const ids = productIds?.filter(Boolean);
  const tours = await prisma.tour.findMany({
    where: ids?.length ? { id: { in: ids } } : { status: "published" },
    select: merchantTourSelect,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: Math.min(Math.max(limit, 1), 200)
  });

  return tours.map((tour) => buildMerchantProductSummary(tour, config));
}

export async function getMerchantProductsPageData() {
  const [products, totalPublished, totalTours] = await Promise.all([
    getMerchantProductSummaries(),
    prisma.tour.count({ where: { status: "published" } }),
    prisma.tour.count()
  ]);

  return {
    config: getMerchantConfigStatus(),
    products,
    totalPublished,
    totalTours,
    eligibleCount: products.filter((product) => product.eligible).length
  };
}

function buildMerchantProductSummary(tour: MerchantTour, config: MerchantConfigStatus): MerchantProductSummary {
  const title = truncate(sanitizeText(tour.title), 150);
  const description = truncate(
    sanitizeText(tour.shortDescription || tour.subtitle || tour.description || tour.includes),
    5000
  );
  const category = truncate(sanitizeText(tour.category || "Tours & Activities"), 750);
  const location = truncate(sanitizeText(tour.location || "Dominican Republic"), 100);
  const offerId = normalizeOfferId(tour.productId || tour.id);
  const gallery = parseGallery(tour.gallery);
  const imageLink = absoluteUrl(tour.heroImage || gallery[0]);
  const link = absoluteUrl(`/tours/${tour.slug}`);
  const brand = brandName();
  const googleProductCategory = cleanEnv(process.env.GOOGLE_MERCHANT_PRODUCT_CATEGORY);
  const contentLanguage =
    cleanEnv(process.env.GOOGLE_MERCHANT_CONTENT_LANGUAGE) || firstLanguage(tour.language, config.contentLanguage);
  const warnings: string[] = [];

  if (tour.status !== "published") warnings.push("El tour no esta publicado.");
  if (!title) warnings.push("Falta titulo.");
  if (!description) warnings.push("Falta descripcion.");
  if (!Number.isFinite(tour.price) || tour.price <= 0) warnings.push("El precio debe ser mayor que 0.");
  if (!tour.heroImage && !gallery.length) warnings.push("Usa la imagen fallback.");
  if (!offerId) warnings.push("Falta offerId/productId.");

  const input: MerchantProductInput = {
    offerId,
    contentLanguage,
    feedLabel: config.feedLabel,
    productAttributes: {
      title,
      description,
      link,
      mobileLink: link,
      imageLink,
      availability: tour.status === "published" ? "IN_STOCK" : "OUT_OF_STOCK",
      condition: "NEW",
      price: {
        amountMicros: amountMicros(tour.price),
        currencyCode: config.currencyCode
      },
      brand,
      productTypes: [`Tours & Activities > ${category}`],
      ...(googleProductCategory ? { googleProductCategory } : {}),
      identifierExists: false,
      customLabel0: "tour",
      customLabel1: truncate(location, 100),
      customLabel2: truncate(category, 100)
    },
    customAttributes: [
      { name: "supplier", value: sanitizeText(tour.SupplierProfile?.company || brand) },
      { name: "duration", value: sanitizeText(tour.duration || "") },
      { name: "source", value: "proactivitis-web" }
    ].filter((attribute) => attribute.value.length > 0)
  };

  return {
    id: tour.id,
    offerId,
    title,
    description,
    status: tour.status,
    price: tour.price,
    currencyCode: config.currencyCode,
    link,
    imageLink,
    supplier: sanitizeText(tour.SupplierProfile?.company || brand),
    category,
    location,
    contentLanguage,
    feedLabel: config.feedLabel,
    eligible: warnings.filter((warning) => warning !== "Usa la imagen fallback.").length === 0,
    warnings,
    input
  };
}

const base64Url = (value: string | Buffer) => {
  const buffer = typeof value === "string" ? Buffer.from(value) : value;
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

async function getServiceAccountAccessToken(config: MerchantConfig) {
  if (!config.serviceAccountEmail || !config.serviceAccountPrivateKey) {
    throw new Error("Service account incompleto.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: config.serviceAccountEmail,
      scope: MERCHANT_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      exp: now + 3600,
      iat: now
    })
  );
  const unsignedJwt = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedJwt);
  signer.end();
  const signature = base64Url(signer.sign(normalizePrivateKey(config.serviceAccountPrivateKey)));
  const assertion = `${unsignedJwt}.${signature}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const data = await parseGoogleResponse(response);
  if (!response.ok || typeof data.access_token !== "string") {
    throw new Error(data.error_description || data.error || "No se pudo obtener access token de Google.");
  }

  return data.access_token;
}

async function getRefreshTokenAccessToken(config: MerchantConfig) {
  if (!config.oauthClientId || !config.oauthClientSecret || !config.oauthRefreshToken) {
    throw new Error("OAuth refresh token incompleto.");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.oauthClientId,
      client_secret: config.oauthClientSecret,
      refresh_token: config.oauthRefreshToken,
      grant_type: "refresh_token"
    })
  });
  const data = await parseGoogleResponse(response);
  if (!response.ok || typeof data.access_token !== "string") {
    throw new Error(data.error_description || data.error || "No se pudo obtener access token de Google.");
  }

  return data.access_token;
}

async function getMerchantAccessToken(config: MerchantConfig) {
  if (config.serviceAccountEmail && config.serviceAccountPrivateKey) {
    return getServiceAccountAccessToken(config);
  }
  return getRefreshTokenAccessToken(config);
}

async function parseGoogleResponse(response: Response): Promise<Record<string, any>> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function syncMerchantProducts(products: MerchantProductSummary[]): Promise<MerchantSyncItemResult[]> {
  const config = getMerchantConfig();
  if (!config.ready) {
    throw new Error(`Configuracion incompleta: ${config.missing.join(", ")}`);
  }

  const accessToken = await getMerchantAccessToken(config);
  const url = new URL(`${MERCHANT_PRODUCTS_URL}/accounts/${config.accountId}/productInputs:insert`);
  url.searchParams.set("dataSource", config.dataSource);
  const results: MerchantSyncItemResult[] = [];

  for (const product of products) {
    try {
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(product.input)
      });
      const data = await parseGoogleResponse(response);

      if (!response.ok) {
        results.push({
          id: product.id,
          offerId: product.offerId,
          title: product.title,
          status: "failed",
          httpStatus: response.status,
          error: data.error?.message || data.error_description || data.raw || "Google rechazo el producto."
        });
        continue;
      }

      results.push({
        id: product.id,
        offerId: product.offerId,
        title: product.title,
        status: "synced",
        httpStatus: response.status,
        merchantInputName: typeof data.name === "string" ? data.name : undefined,
        merchantProductName: typeof data.product === "string" ? data.product : undefined
      });
    } catch (error) {
      results.push({
        id: product.id,
        offerId: product.offerId,
        title: product.title,
        status: "failed",
        error: error instanceof Error ? error.message : "Error desconocido enviando a Google."
      });
    }
  }

  return results;
}
