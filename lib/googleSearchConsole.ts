import "server-only";

import jwt from "jsonwebtoken";

type SearchConsoleRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type SearchConsoleResponse = {
  rows?: SearchConsoleRow[];
  responseAggregationType?: string;
};

type SearchConsoleSummary = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchConsolePageRow = {
  page: string;
  path: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchConsoleQueryRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchConsoleSectionRow = {
  label: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchConsoleOverview = {
  configured: boolean;
  siteUrl: string | null;
  startDate: string;
  endDate: string;
  summary: SearchConsoleSummary | null;
  topPages: SearchConsolePageRow[];
  topQueries: SearchConsoleQueryRow[];
  opportunities: SearchConsolePageRow[];
  sections: SearchConsoleSectionRow[];
  error?: string;
};

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const SEARCH_CONSOLE_API = "https://www.googleapis.com/webmasters/v3/sites";

const SEARCH_CONSOLE_CLIENT_EMAIL = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL ?? "";
const SEARCH_CONSOLE_PRIVATE_KEY = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "";
const SEARCH_CONSOLE_SITE_URL = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? "";

function isConfigured() {
  return Boolean(SEARCH_CONSOLE_CLIENT_EMAIL && SEARCH_CONSOLE_PRIVATE_KEY && SEARCH_CONSOLE_SITE_URL);
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: SEARCH_CONSOLE_CLIENT_EMAIL,
      scope: SEARCH_CONSOLE_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600
    },
    SEARCH_CONSOLE_PRIVATE_KEY,
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
    throw new Error(`Token Search Console rechazado: ${message}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

async function querySearchConsole(
  accessToken: string,
  body: Record<string, unknown>
): Promise<SearchConsoleResponse> {
  const encodedSiteUrl = encodeURIComponent(SEARCH_CONSOLE_SITE_URL);
  const response = await fetch(`${SEARCH_CONSOLE_API}/${encodedSiteUrl}/searchAnalytics/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Search Console devolvió error: ${message}`);
  }

  return (await response.json()) as SearchConsoleResponse;
}

function toPath(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function groupPath(path: string) {
  if (path.startsWith("/prodiscovery")) return "ProDiscovery";
  if (path.startsWith("/transfer") || path.startsWith("/traslado")) return "Traslados";
  if (
    path.startsWith("/tours") ||
    path.startsWith("/excursiones") ||
    path.startsWith("/thingtodo") ||
    path.startsWith("/excursiones-con-recogida")
  ) {
    return "Tours y excursiones";
  }
  if (path.startsWith("/news") || path.startsWith("/blog")) return "Blog";
  if (path.startsWith("/hoteles") || path.startsWith("/things-to-do")) return "Hoteles y around";
  if (path.startsWith("/agency") || path.startsWith("/supplier")) return "B2B";
  return "Otros";
}

function safeCtr(value?: number) {
  return Number.isFinite(value) ? value ?? 0 : 0;
}

function mapPageRows(rows: SearchConsoleRow[] | undefined) {
  return (rows ?? [])
    .map((row) => {
      const page = row.keys?.[0] ?? "";
      return {
        page,
        path: toPath(page),
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: safeCtr(row.ctr),
        position: row.position ?? 0
      };
    })
    .filter((row) => row.page);
}

function mapQueryRows(rows: SearchConsoleRow[] | undefined) {
  return (rows ?? [])
    .map((row) => ({
      query: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: safeCtr(row.ctr),
      position: row.position ?? 0
    }))
    .filter((row) => row.query);
}

function buildSections(rows: SearchConsolePageRow[]): SearchConsoleSectionRow[] {
  const grouped = new Map<string, SearchConsoleSectionRow>();

  for (const row of rows) {
    const label = groupPath(row.path);
    const current = grouped.get(label) ?? { label, clicks: 0, impressions: 0, ctr: 0, position: 0 };
    current.clicks += row.clicks;
    current.impressions += row.impressions;
    current.position += row.position * row.impressions;
    grouped.set(label, current);
  }

  return [...grouped.values()]
    .map((row) => ({
      ...row,
      ctr: row.impressions > 0 ? row.clicks / row.impressions : 0,
      position: row.impressions > 0 ? row.position / row.impressions : 0
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

function buildOpportunities(rows: SearchConsolePageRow[]) {
  return rows
    .filter((row) => row.impressions >= 80 && row.ctr <= 0.035 && row.position >= 3.2 && row.position <= 15)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 12);
}

export async function getSearchConsoleOverview(days = 28): Promise<SearchConsoleOverview> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days + 1);

  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);

  if (!isConfigured()) {
    return {
      configured: false,
      siteUrl: SEARCH_CONSOLE_SITE_URL || null,
      startDate: start,
      endDate: end,
      summary: null,
      topPages: [],
      topQueries: [],
      opportunities: [],
      sections: []
    };
  }

  try {
    const accessToken = await getAccessToken();
    const [summaryResponse, topPagesResponse, topQueriesResponse, allPagesResponse] = await Promise.all([
      querySearchConsole(accessToken, {
        startDate: start,
        endDate: end,
        type: "web"
      }),
      querySearchConsole(accessToken, {
        startDate: start,
        endDate: end,
        dimensions: ["page"],
        rowLimit: 12,
        type: "web"
      }),
      querySearchConsole(accessToken, {
        startDate: start,
        endDate: end,
        dimensions: ["query"],
        rowLimit: 12,
        type: "web"
      }),
      querySearchConsole(accessToken, {
        startDate: start,
        endDate: end,
        dimensions: ["page"],
        rowLimit: 250,
        type: "web"
      })
    ]);

    const summaryRow = summaryResponse.rows?.[0];
    const allPageRows = mapPageRows(allPagesResponse.rows);

    return {
      configured: true,
      siteUrl: SEARCH_CONSOLE_SITE_URL,
      startDate: start,
      endDate: end,
      summary: summaryRow
        ? {
            clicks: summaryRow.clicks ?? 0,
            impressions: summaryRow.impressions ?? 0,
            ctr: safeCtr(summaryRow.ctr),
            position: summaryRow.position ?? 0
          }
        : { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      topPages: mapPageRows(topPagesResponse.rows),
      topQueries: mapQueryRows(topQueriesResponse.rows),
      opportunities: buildOpportunities(allPageRows),
      sections: buildSections(allPageRows)
    };
  } catch (error) {
    return {
      configured: true,
      siteUrl: SEARCH_CONSOLE_SITE_URL,
      startDate: start,
      endDate: end,
      summary: null,
      topPages: [],
      topQueries: [],
      opportunities: [],
      sections: [],
      error: error instanceof Error ? error.message : "No se pudo consultar Search Console."
    };
  }
}
