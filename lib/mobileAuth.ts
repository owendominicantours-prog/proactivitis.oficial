import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const withMobileCors = (response: NextResponse, methods = "GET, POST, OPTIONS") => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", methods);
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
};

export const readMobileUserId = (request: Request) => {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "proactivitis-default";
    const decoded = jwt.verify(token, secret) as { userId?: string };
    return decoded.userId ?? null;
  } catch {
    return null;
  }
};
