import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { getSessionUser, requireRole, type Role } from "@/lib/session";

export const runtime = "nodejs";

const ALLOWED_ROLES: Role[] = ["ADMIN"];

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    requireRole(user, ALLOWED_ROLES);

    const url = new URL(request.url);
    const prefix = url.searchParams.get("prefix") ?? "tours/";
    const limit = Number(url.searchParams.get("limit") ?? "200");
    const cursor = url.searchParams.get("cursor") ?? undefined;

    const result = await list({ prefix, limit, cursor });

    return NextResponse.json({
      items: result.blobs.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      })),
      cursor: result.cursor ?? null
    });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    console.error("blob list failed", error);
    return NextResponse.json({ error: "LIST_FAILED" }, { status: 500 });
  }
}
