import "server-only";

import { prisma } from "@/lib/prisma";
import {
  getGoogleIndexingConfigStatus,
  publishGoogleIndexingUrl,
  type GoogleIndexingNotificationType
} from "@/lib/googleIndexing";

const BASE_URL = "https://proactivitis.com";
const STORE_KEY = "GOOGLE_INDEXING_AUTOMATION_STORE";
const DEFAULT_DAILY_LIMIT = 50;
const MAX_DAILY_LIMIT = 200;
const MAX_CANDIDATES_TO_CHECK = 700;

const SITEMAPS_TO_SCAN = [
  "/sitemap-core-clean.xml",
  "/sitemap-tours-clean.xml",
  "/sitemap-transfers-clean.xml",
  "/sitemap-hotels-clean.xml",
  "/sitemap-blog.xml",
  "/sitemap-rent-a-car.xml"
] as const;

type IndexingSubmittedUrl = {
  url: string;
  submittedAt: string;
  type: GoogleIndexingNotificationType;
  status: "submitted" | "failed" | "skipped";
  source: string;
  error?: string;
};

export type GoogleIndexingAutomationRun = {
  ranAt: string;
  configured: boolean;
  limit: number;
  checked: number;
  submitted: number;
  failed: number;
  skipped: number;
  cursorBefore: number;
  cursorAfter: number;
  errors: string[];
};

export type GoogleIndexingAutomationStore = {
  cursor: number;
  submittedUrls: IndexingSubmittedUrl[];
  runs: GoogleIndexingAutomationRun[];
};

const DEFAULT_STORE: GoogleIndexingAutomationStore = {
  cursor: 0,
  submittedUrls: [],
  runs: []
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toJson = (value: unknown) => JSON.parse(JSON.stringify(value));

function readDailyLimit() {
  const raw = Number(process.env.GOOGLE_INDEXING_DAILY_LIMIT ?? DEFAULT_DAILY_LIMIT);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_DAILY_LIMIT;
  return Math.min(Math.floor(raw), MAX_DAILY_LIMIT);
}

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${BASE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function extractLocs(xml: string) {
  return Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi))
    .map((match) => match[1]?.trim())
    .filter((url): url is string => Boolean(url));
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Proactivitis Google Indexing Automation",
      Accept: "application/xml,text/xml,text/plain,*/*"
    },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function isIndexableUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== BASE_URL) return false;
    if (parsed.search) return false;
    if (parsed.pathname.startsWith("/admin")) return false;
    if (parsed.pathname.startsWith("/api")) return false;
    if (parsed.pathname.includes("/auth/")) return false;
    return !parsed.pathname.endsWith(".xml");
  } catch {
    return false;
  }
}

function priorityScore(url: string) {
  try {
    const { pathname } = new URL(url);
    if (pathname.includes("/tours/") || pathname.includes("/excursiones")) return 100;
    if (pathname.includes("/transfer") || pathname.includes("/traslado")) return 90;
    if (pathname.includes("/en/")) return 80;
    if (pathname.includes("/fr/")) return 75;
    if (pathname.includes("/blog") || pathname.includes("/news")) return 65;
    return 50;
  } catch {
    return 0;
  }
}

async function collectSitemapUrls() {
  const urls: string[] = [];
  const errors: string[] = [];

  for (const sitemapPath of SITEMAPS_TO_SCAN) {
    try {
      const xml = await fetchText(absoluteUrl(sitemapPath));
      urls.push(...extractLocs(xml));
    } catch (error) {
      errors.push(`${sitemapPath}: ${error instanceof Error ? error.message : "no se pudo leer"}`);
    }
  }

  const unique = [...new Set(urls.filter(isIndexableUrl))];
  unique.sort((a, b) => priorityScore(b) - priorityScore(a) || a.localeCompare(b));
  return { urls: unique, errors };
}

async function checkUrl(url: string) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "Proactivitis Google Indexing Automation",
        Accept: "text/html,*/*"
      },
      cache: "no-store"
    });
    return { ok: response.status === 200, status: response.status, error: null as string | null };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "fetch_failed"
    };
  }
}

export async function getGoogleIndexingAutomationStore(): Promise<GoogleIndexingAutomationStore> {
  const row = await prisma.siteContentSetting.findUnique({ where: { key: STORE_KEY } });
  if (!row?.content || !isObject(row.content)) return DEFAULT_STORE;
  return {
    ...DEFAULT_STORE,
    ...(row.content as Partial<GoogleIndexingAutomationStore>),
    submittedUrls: Array.isArray((row.content as Partial<GoogleIndexingAutomationStore>).submittedUrls)
      ? ((row.content as Partial<GoogleIndexingAutomationStore>).submittedUrls as IndexingSubmittedUrl[])
      : [],
    runs: Array.isArray((row.content as Partial<GoogleIndexingAutomationStore>).runs)
      ? ((row.content as Partial<GoogleIndexingAutomationStore>).runs as GoogleIndexingAutomationRun[])
      : []
  };
}

async function saveGoogleIndexingAutomationStore(store: GoogleIndexingAutomationStore) {
  await prisma.siteContentSetting.upsert({
    where: { key: STORE_KEY },
    update: { content: toJson(store) },
    create: { key: STORE_KEY, content: toJson(store) }
  });
}

function rotateUrls(urls: string[], cursor: number) {
  if (!urls.length) return [];
  const start = cursor % urls.length;
  return Array.from({ length: urls.length }, (_, index) => urls[(start + index) % urls.length]);
}

export async function runAutomaticGoogleIndexing() {
  const config = getGoogleIndexingConfigStatus();
  const store = await getGoogleIndexingAutomationStore();
  const limit = readDailyLimit();
  const run: GoogleIndexingAutomationRun = {
    ranAt: new Date().toISOString(),
    configured: config.ready,
    limit,
    checked: 0,
    submitted: 0,
    failed: 0,
    skipped: 0,
    cursorBefore: store.cursor,
    cursorAfter: store.cursor,
    errors: []
  };

  if (!config.ready) {
    run.errors.push(`Faltan credenciales: ${config.missing.join(", ") || "Google Indexing API"}`);
    const nextStore = { ...store, runs: [run, ...store.runs].slice(0, 30) };
    await saveGoogleIndexingAutomationStore(nextStore);
    return { store: nextStore, run, processed: [] as IndexingSubmittedUrl[] };
  }

  const { urls, errors } = await collectSitemapUrls();
  run.errors.push(...errors);

  const processed: IndexingSubmittedUrl[] = [];
  const candidates = rotateUrls(urls, store.cursor).slice(0, MAX_CANDIDATES_TO_CHECK);

  for (const url of candidates) {
    if (run.submitted >= limit) break;
    run.checked += 1;

    const live = await checkUrl(url);
    if (!live.ok) {
      run.skipped += 1;
      if (live.error || live.status >= 400) {
        processed.push({
          url,
          submittedAt: run.ranAt,
          type: "URL_UPDATED",
          status: "skipped",
          source: "sitemap-automation",
          error: live.error ?? `HTTP ${live.status}`
        });
      }
      continue;
    }

    try {
      await publishGoogleIndexingUrl(url, "URL_UPDATED");
      run.submitted += 1;
      processed.push({
        url,
        submittedAt: run.ranAt,
        type: "URL_UPDATED",
        status: "submitted",
        source: "sitemap-automation"
      });
    } catch (error) {
      run.failed += 1;
      processed.push({
        url,
        submittedAt: run.ranAt,
        type: "URL_UPDATED",
        status: "failed",
        source: "sitemap-automation",
        error: error instanceof Error ? error.message : "No se pudo enviar a Google."
      });
    }
  }

  run.cursorAfter = urls.length ? (store.cursor + run.checked) % urls.length : store.cursor;
  const nextStore: GoogleIndexingAutomationStore = {
    cursor: run.cursorAfter,
    submittedUrls: [...processed, ...store.submittedUrls].slice(0, 1000),
    runs: [run, ...store.runs].slice(0, 30)
  };
  await saveGoogleIndexingAutomationStore(nextStore);

  return { store: nextStore, run, processed };
}
