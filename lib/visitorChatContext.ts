import { NextRequest } from "next/server";

export const VISITOR_CONTEXT_PREFIX = "[[VISITOR_CONTEXT]]";

type VisitorContextPayload = {
  country: string | null;
  city: string | null;
  region: string | null;
  ip: string | null;
  pagePath: string | null;
  pageTitle: string | null;
  pageUrl: string | null;
  at: string;
};

const clean = (value?: string | null) => {
  if (!value) return null;
  const decoded = (() => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  })();
  const trimmed = decoded.trim();
  return trimmed ? trimmed : null;
};

export const buildVisitorContextFromRequest = (
  request: NextRequest,
  input?: { pagePath?: string; pageTitle?: string; pageUrl?: string }
): VisitorContextPayload => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipFromHeader = forwardedFor ? forwardedFor.split(",")[0]?.trim() : null;

  return {
    country: clean(request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry")),
    city: clean(request.headers.get("x-vercel-ip-city")),
    region: clean(request.headers.get("x-vercel-ip-country-region")),
    ip: clean(ipFromHeader),
    pagePath: clean(input?.pagePath),
    pageTitle: clean(input?.pageTitle),
    pageUrl: clean(input?.pageUrl),
    at: new Date().toISOString()
  };
};

export const encodeVisitorContext = (payload: VisitorContextPayload) =>
  `${VISITOR_CONTEXT_PREFIX}${JSON.stringify(payload)}`;

export const parseVisitorContext = (content: string): VisitorContextPayload | null => {
  if (!content.startsWith(VISITOR_CONTEXT_PREFIX)) return null;
  try {
    return JSON.parse(content.slice(VISITOR_CONTEXT_PREFIX.length)) as VisitorContextPayload;
  } catch {
    return null;
  }
};
