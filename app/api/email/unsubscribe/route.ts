import { NextRequest, NextResponse } from "next/server";
import {
  APP_BASE_URL,
  UNSUBSCRIBE_SCOPE,
  suppressEmail,
  verifyUnsubscribeToken
} from "@/lib/emailUnsubscribe";

const invalidResponse = () =>
  NextResponse.json({ ok: false, error: "Invalid unsubscribe link." }, { status: 400 });

const processUnsubscribe = async (request: NextRequest) => {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";
  const scope = request.nextUrl.searchParams.get("scope")?.trim() || UNSUBSCRIBE_SCOPE;

  if (!email || !token || !verifyUnsubscribeToken(email, token, scope)) {
    return null;
  }

  await suppressEmail(email, scope, "one_click_header");
  return { email, scope };
};

export async function POST(request: NextRequest) {
  const result = await processUnsubscribe(request);
  if (!result) return invalidResponse();
  return NextResponse.json({ ok: true, email: result.email, scope: result.scope });
}

export async function GET(request: NextRequest) {
  const result = await processUnsubscribe(request);
  if (!result) {
    return NextResponse.redirect(new URL("/unsubscribe?status=invalid", APP_BASE_URL));
  }

  const url = new URL("/unsubscribe", APP_BASE_URL);
  url.searchParams.set("status", "success");
  url.searchParams.set("email", result.email);
  return NextResponse.redirect(url);
}
