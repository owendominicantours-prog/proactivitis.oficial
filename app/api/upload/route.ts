import { NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToBlob } from "@/lib/blobStorage";
import { getSessionUser, requireRole, type Role } from "@/lib/session";

export const runtime = "nodejs";

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_ROLES: Role[] = ["ADMIN", "SUPPLIER"];

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    requireRole(user, ALLOWED_ROLES);

    const form = await request.formData();
    const file = form.get("file");
    const tourId = String(form.get("tourId") ?? "");
    const supplierId = String(form.get("supplierId") ?? user.id);
    const kind = String(form.get("kind") ?? "cover");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!ALLOWED_MIMES.has(file.type)) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }
    if (!tourId) {
      return NextResponse.json({ error: "Missing tourId" }, { status: 400 });
    }

    const optimized = await sharp(await file.arrayBuffer())
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const arrayBuffer = optimized.buffer.slice(
      optimized.byteOffset,
      optimized.byteOffset + optimized.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: "image/webp" });
    const safeName = file.name.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9.-]/g, "");
    const key = `tours/${supplierId}/${tourId}/${kind}-${Date.now()}-${safeName}`;

    const { url } = await uploadToBlob({ key, body: blob });

    return NextResponse.json({ url });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    console.error("upload failed", error);
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}
