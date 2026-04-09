import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const UNSUBSCRIBE_SCOPE = "optional";

const getSecret = () => process.env.EMAIL_UNSUBSCRIBE_SECRET ?? process.env.NEXTAUTH_SECRET ?? "proactivitis-email";

export const normalizeEmailAddress = (email: string) => email.trim().toLowerCase();

const signPayload = (email: string, scope: string) =>
  createHmac("sha256", getSecret()).update(`${normalizeEmailAddress(email)}:${scope}`).digest("hex");

export const createUnsubscribeToken = (email: string, scope = UNSUBSCRIBE_SCOPE) =>
  signPayload(email, scope);

export const verifyUnsubscribeToken = (email: string, token: string, scope = UNSUBSCRIBE_SCOPE) => {
  const expected = signPayload(email, scope);
  const provided = token.trim().toLowerCase();
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(Uint8Array.from(Buffer.from(expected)), Uint8Array.from(Buffer.from(provided)));
};

export const buildUnsubscribeUrl = (email: string, scope = UNSUBSCRIBE_SCOPE) => {
  const normalizedEmail = normalizeEmailAddress(email);
  const token = createUnsubscribeToken(normalizedEmail, scope);
  return `${APP_BASE_URL}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}&scope=${encodeURIComponent(scope)}&token=${encodeURIComponent(token)}`;
};

export const buildUnsubscribeApiUrl = (email: string, scope = UNSUBSCRIBE_SCOPE) => {
  const normalizedEmail = normalizeEmailAddress(email);
  const token = createUnsubscribeToken(normalizedEmail, scope);
  return `${APP_BASE_URL}/api/email/unsubscribe?email=${encodeURIComponent(normalizedEmail)}&scope=${encodeURIComponent(scope)}&token=${encodeURIComponent(token)}`;
};

export async function suppressEmail(email: string, scope = UNSUBSCRIBE_SCOPE, source = "email_link") {
  const normalizedEmail = normalizeEmailAddress(email);
  return prisma.emailSuppression.upsert({
    where: {
      email_scope: {
        email: normalizedEmail,
        scope
      }
    },
    create: {
      email: normalizedEmail,
      scope,
      source
    },
    update: {
      source
    }
  });
}

export async function isEmailSuppressed(email: string, scope = UNSUBSCRIBE_SCOPE) {
  const normalizedEmail = normalizeEmailAddress(email);
  const existing = await prisma.emailSuppression.findUnique({
    where: {
      email_scope: {
        email: normalizedEmail,
        scope
      }
    }
  });
  return Boolean(existing);
}

export { APP_BASE_URL, UNSUBSCRIBE_SCOPE };
