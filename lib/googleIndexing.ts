import "server-only";

import jwt from "jsonwebtoken";

export type GoogleIndexingNotificationType = "URL_UPDATED" | "URL_DELETED";

export type GoogleIndexingConfigStatus = {
  ready: boolean;
  credentialSource: "indexing" | "search-console" | "merchant" | "none";
  clientEmail: string | null;
  allowedHosts: string[];
  missing: string[];
};

export type GoogleIndexingSubmission = {
  url: string;
  type: GoogleIndexingNotificationType;
  status: "submitted" | "failed";
  response?: Record<string, unknown>;
  error?: string;
};

export type GoogleIndexingBatchResult = {
  configured: boolean;
  requested: string[];
  submitted: GoogleIndexingSubmission[];
  failed: GoogleIndexingSubmission[];
  skipped: string[];
  missing: string[];
};

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing";
const INDEXING_API = "https://indexing.googleapis.com/v3/urlNotifications";
const PROACTIVITIS_BASE_URL = "https://proactivitis.com";
const DEFAULT_ALLOWED_HOSTS = ["proactivitis.com", "www.proactivitis.com"];
const MAX_MANUAL_URLS = 10;

function cleanEnv(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "";
}

function normalizePrivateKey(value: string | undefined) {
  return cleanEnv(value).replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

function getAllowedHosts() {
  const raw = cleanEnv(process.env.GOOGLE_INDEXING_ALLOWED_HOSTS);
  if (!raw) return DEFAULT_ALLOWED_HOSTS;
  return raw
    .split(/[,\s]+/)
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function getCredentials() {
  const indexingEmail = cleanEnv(process.env.GOOGLE_INDEXING_CLIENT_EMAIL);
  const indexingKey = normalizePrivateKey(process.env.GOOGLE_INDEXING_PRIVATE_KEY);
  if (indexingEmail && indexingKey) {
    return {
      source: "indexing" as const,
      clientEmail: indexingEmail,
      privateKey: indexingKey,
      missing: []
    };
  }

  const searchConsoleEmail = cleanEnv(process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL);
  const searchConsoleKey = normalizePrivateKey(process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY);
  if (searchConsoleEmail && searchConsoleKey) {
    return {
      source: "search-console" as const,
      clientEmail: searchConsoleEmail,
      privateKey: searchConsoleKey,
      missing: []
    };
  }

  const merchantEmail = cleanEnv(process.env.GOOGLE_MERCHANT_CLIENT_EMAIL);
  const merchantKey = normalizePrivateKey(process.env.GOOGLE_MERCHANT_PRIVATE_KEY);
  if (merchantEmail && merchantKey) {
    return {
      source: "merchant" as const,
      clientEmail: merchantEmail,
      privateKey: merchantKey,
      missing: []
    };
  }

  return {
    source: "none" as const,
    clientEmail: "",
    privateKey: "",
    missing: ["GOOGLE_INDEXING_CLIENT_EMAIL", "GOOGLE_INDEXING_PRIVATE_KEY"]
  };
}

export function getGoogleIndexingConfigStatus(): GoogleIndexingConfigStatus {
  const credentials = getCredentials();
  return {
    ready: Boolean(credentials.clientEmail && credentials.privateKey),
    credentialSource: credentials.source,
    clientEmail: credentials.clientEmail || null,
    allowedHosts: getAllowedHosts(),
    missing: credentials.missing
  };
}

export function normalizeGoogleIndexingUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) throw new Error("URL vacia.");

  const absoluteUrl = trimmed.startsWith("/") ? `${PROACTIVITIS_BASE_URL}${trimmed}` : trimmed;
  let parsed: URL;
  try {
    parsed = new URL(absoluteUrl);
  } catch {
    throw new Error(`URL invalida: ${rawUrl}`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(`Solo se permiten URLs https: ${rawUrl}`);
  }

  const hostname = parsed.hostname.toLowerCase();
  const allowedHosts = getAllowedHosts();
  if (!allowedHosts.includes(hostname)) {
    throw new Error(`Dominio no permitido para Indexing API: ${hostname}`);
  }

  parsed.hash = "";
  return parsed.toString();
}

async function getAccessToken() {
  const credentials = getCredentials();
  if (!credentials.clientEmail || !credentials.privateKey) {
    throw new Error("Faltan credenciales de Google Indexing API.");
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: credentials.clientEmail,
      scope: INDEXING_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600
    },
    credentials.privateKey,
    { algorithm: "RS256" }
  );

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Token Google Indexing rechazado: ${message}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Google no devolvio access_token para Indexing API.");
  }
  return data.access_token;
}

export async function publishGoogleIndexingUrl(url: string, type: GoogleIndexingNotificationType) {
  const normalizedUrl = normalizeGoogleIndexingUrl(url);
  const accessToken = await getAccessToken();
  const response = await fetch(`${INDEXING_API}:publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: normalizedUrl,
      type
    }),
    cache: "no-store"
  });

  const payloadText = await response.text();
  const payload = payloadText ? (JSON.parse(payloadText) as Record<string, unknown>) : {};

  if (!response.ok) {
    throw new Error(payloadText || `Google Indexing devolvio HTTP ${response.status}`);
  }

  return payload;
}

export async function getGoogleIndexingUrlMetadata(url: string) {
  const normalizedUrl = normalizeGoogleIndexingUrl(url);
  const accessToken = await getAccessToken();
  const response = await fetch(`${INDEXING_API}/metadata?url=${encodeURIComponent(normalizedUrl)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  const payloadText = await response.text();
  const payload = payloadText ? (JSON.parse(payloadText) as Record<string, unknown>) : {};

  if (!response.ok) {
    throw new Error(payloadText || `Google Indexing devolvio HTTP ${response.status}`);
  }

  return payload;
}

export async function publishGoogleIndexingBatch(
  rawUrls: string[],
  type: GoogleIndexingNotificationType
): Promise<GoogleIndexingBatchResult> {
  const config = getGoogleIndexingConfigStatus();
  const normalized = [...new Set(rawUrls.map((url) => url.trim()).filter(Boolean))].slice(0, MAX_MANUAL_URLS);
  const skipped = rawUrls.map((url) => url.trim()).filter(Boolean).slice(MAX_MANUAL_URLS);

  if (!config.ready) {
    return {
      configured: false,
      requested: normalized,
      submitted: [],
      failed: [],
      skipped,
      missing: config.missing
    };
  }

  const submitted: GoogleIndexingSubmission[] = [];
  const failed: GoogleIndexingSubmission[] = [];

  for (const rawUrl of normalized) {
    let normalizedUrl = rawUrl;
    try {
      normalizedUrl = normalizeGoogleIndexingUrl(rawUrl);
      const response = await publishGoogleIndexingUrl(normalizedUrl, type);
      submitted.push({
        url: normalizedUrl,
        type,
        status: "submitted",
        response
      });
    } catch (error) {
      failed.push({
        url: normalizedUrl,
        type,
        status: "failed",
        error: error instanceof Error ? error.message : "No se pudo enviar la URL."
      });
    }
  }

  return {
    configured: true,
    requested: normalized,
    submitted,
    failed,
    skipped,
    missing: []
  };
}
