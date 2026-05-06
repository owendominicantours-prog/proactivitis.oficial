import "server-only";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getGeminiSeoLanding, saveGeminiSeoLanding } from "@/lib/geminiSeoFactory";
import { submitSitemapsToSearchConsole } from "@/lib/googleSearchConsole";

const BASE_URL = "https://proactivitis.com";
const SEO_CLEANUP_STORE_KEY = "SEO_DAILY_CLEANUP_STORE";
const DEFAULT_LIMIT = 10;
const MAX_URLS_TO_CHECK = 140;

const SITEMAPS_TO_SCAN = [
  "/sitemap.xml",
  "/sitemap-seo-factory.xml",
  "/sitemap-transfers.xml",
  "/sitemap-rent-a-car.xml",
  "/sitemap-blog.xml",
  "/sitemap-prodiscovery.xml",
  "/sitemap-seo-only-tours.xml",
  "/sitemap-transfer-seo-only.xml",
  "/sitemap-golden-tour-pages.xml",
  "/sitemap-golden-transfer-pages.xml"
] as const;

export type SeoCleanupUrl = {
  url: string;
  path: string;
  status: number;
  reason: string;
  source: string;
  detectedAt: string;
  action: "marked_gone" | "managed_unpublished" | "already_gone";
};

export type SeoCleanupRun = {
  ranAt: string;
  checked: number;
  cleaned: number;
  skippedDailyLimit: boolean;
  errors: string[];
};

export type SeoCleanupStore = {
  cursor: number;
  cleanedUrls: SeoCleanupUrl[];
  runs: SeoCleanupRun[];
};

const DEFAULT_STORE: SeoCleanupStore = {
  cursor: 0,
  cleanedUrls: [],
  runs: []
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toJson = (value: unknown) => JSON.parse(JSON.stringify(value));

const todayKey = (date = new Date()) => date.toISOString().slice(0, 10);

const absoluteUrl = (pathOrUrl: string) =>
  /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${BASE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;

const normalizePath = (url: string) => {
  try {
    const parsed = new URL(url, BASE_URL);
    return parsed.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
};

const extractLocs = (xml: string) =>
  Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi))
    .map((match) => match[1]?.trim())
    .filter((url): url is string => Boolean(url));

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "AppProactivitis SEO Cleanup",
      Accept: "application/xml,text/xml,text/plain,*/*"
    },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function collectSitemapUrls(store: SeoCleanupStore) {
  const urls: string[] = [];
  const errors: string[] = [];

  for (const sitemapPath of SITEMAPS_TO_SCAN) {
    const sitemapUrl = absoluteUrl(sitemapPath);
    try {
      const xml = await fetchText(sitemapUrl);
      const locs = extractLocs(xml);
      urls.push(...locs.filter((loc) => !loc.endsWith(".xml")));
    } catch (error) {
      errors.push(`${sitemapPath}: ${error instanceof Error ? error.message : "no se pudo leer"}`);
    }
  }

  const unique = Array.from(new Set(urls.filter((url) => url.startsWith(BASE_URL))));
  if (unique.length <= MAX_URLS_TO_CHECK) return { urls: unique, errors };

  const start = store.cursor % unique.length;
  const selected = Array.from({ length: MAX_URLS_TO_CHECK }, (_, index) => unique[(start + index) % unique.length]);
  return { urls: selected, errors };
}

async function checkUrl(url: string) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "AppProactivitis SEO Cleanup",
        Accept: "text/html,*/*"
      },
      cache: "no-store"
    });
    return { status: response.status, error: null as string | null };
  } catch (error) {
    return { status: 0, error: error instanceof Error ? error.message : "fetch_failed" };
  }
}

const extractSeoFactorySlug = (path: string) => {
  const match = path.match(/^\/(?:(?:en|fr)\/)?(?:punta-cana|rent-a-car\/deals)\/([^/]+)$/);
  return match?.[1] ?? null;
};

async function applyManagedCleanup(path: string) {
  const slug = extractSeoFactorySlug(path);
  if (!slug) return "marked_gone" as const;

  const landing = await getGeminiSeoLanding(slug);
  if (!landing) return "marked_gone" as const;
  if (landing.status === "rejected") return "already_gone" as const;

  await saveGeminiSeoLanding({
    ...landing,
    status: "rejected",
    rejectedAt: new Date().toISOString()
  });
  revalidatePath("/sitemap-seo-factory.xml");
  revalidatePath(path);
  return "managed_unpublished" as const;
}

export async function getSeoCleanupStore(): Promise<SeoCleanupStore> {
  const row = await prisma.siteContentSetting.findUnique({ where: { key: SEO_CLEANUP_STORE_KEY } });
  if (!row?.content || !isObject(row.content)) return DEFAULT_STORE;
  return {
    ...DEFAULT_STORE,
    ...(row.content as Partial<SeoCleanupStore>),
    cleanedUrls: Array.isArray((row.content as Partial<SeoCleanupStore>).cleanedUrls)
      ? ((row.content as Partial<SeoCleanupStore>).cleanedUrls as SeoCleanupUrl[])
      : [],
    runs: Array.isArray((row.content as Partial<SeoCleanupStore>).runs)
      ? ((row.content as Partial<SeoCleanupStore>).runs as SeoCleanupRun[])
      : []
  };
}

async function saveSeoCleanupStore(store: SeoCleanupStore) {
  await prisma.siteContentSetting.upsert({
    where: { key: SEO_CLEANUP_STORE_KEY },
    update: { content: toJson(store) },
    create: { key: SEO_CLEANUP_STORE_KEY, content: toJson(store) }
  });
}

export async function runDailySeoCleanup(limit = DEFAULT_LIMIT) {
  const store = await getSeoCleanupStore();
  const key = todayKey();
  const cleanedToday = store.cleanedUrls.filter((item) => item.detectedAt.startsWith(key)).length;
  const remaining = Math.max(0, limit - cleanedToday);
  const run: SeoCleanupRun = {
    ranAt: new Date().toISOString(),
    checked: 0,
    cleaned: 0,
    skippedDailyLimit: remaining <= 0,
    errors: []
  };

  if (remaining <= 0) {
    const nextStore = { ...store, runs: [run, ...store.runs].slice(0, 30) };
    await saveSeoCleanupStore(nextStore);
    return { store: nextStore, run, searchConsole: null };
  }

  const cleanedPaths = new Set(store.cleanedUrls.map((item) => item.path));
  const { urls, errors } = await collectSitemapUrls(store);
  run.errors.push(...errors);

  const cleaned: SeoCleanupUrl[] = [];
  for (const url of urls) {
    if (cleaned.length >= remaining) break;
    const path = normalizePath(url);
    if (cleanedPaths.has(path)) continue;

    const result = await checkUrl(url);
    run.checked += 1;
    if (result.error) {
      run.errors.push(`${path}: ${result.error}`);
      continue;
    }
    if (result.status !== 404 && result.status !== 410) continue;

    const action = await applyManagedCleanup(path);
    cleaned.push({
      url,
      path,
      status: result.status,
      reason: result.status === 410 ? "La URL ya responde 410." : "La URL responde 404 y fue marcada para limpieza.",
      source: "sitemap-scan",
      detectedAt: new Date().toISOString(),
      action
    });
    cleanedPaths.add(path);
  }

  run.cleaned = cleaned.length;
  const nextStore: SeoCleanupStore = {
    cursor: store.cursor + run.checked,
    cleanedUrls: [...cleaned, ...store.cleanedUrls].slice(0, 1000),
    runs: [run, ...store.runs].slice(0, 30)
  };
  await saveSeoCleanupStore(nextStore);

  const searchConsole =
    cleaned.length > 0
      ? await submitSitemapsToSearchConsole(
          [
            "/sitemap-index.xml",
            "/sitemap.xml",
            "/sitemap-seo-factory.xml",
            "/sitemap-transfers.xml",
            "/sitemap-rent-a-car.xml",
            "/sitemap-blog.xml",
            "/sitemap-prodiscovery.xml"
          ],
          "daily-seo-cleanup"
        )
      : null;

  return { store: nextStore, run, searchConsole };
}
