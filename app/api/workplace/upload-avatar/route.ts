import { NextResponse } from "next/server";
import sharp from "sharp";

import { uploadToBlob } from "@/lib/blobStorage";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireRole } from "@/lib/session";

export const runtime = "nodejs";

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/jpg"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    requireRole(user, ["ADMIN", "EMPLOYEE"]);
    if (user.role === "EMPLOYEE") {
      const employee = await prisma.workplaceEmployee.findUnique({
        where: { userId: user.id },
        select: { status: true }
      });
      if (employee?.status !== "APPROVED") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!ALLOWED_MIMES.has(file.type)) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const optimized = await sharp(await file.arrayBuffer())
      .rotate()
      .resize({ width: 700, height: 700, fit: "cover" })
      .webp({ quality: 86 })
      .toBuffer();

    const arrayBuffer = optimized.buffer.slice(
      optimized.byteOffset,
      optimized.byteOffset + optimized.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: "image/webp" });
    const key = `workplace/avatars/${user.id}/avatar-${Date.now()}.webp`;
    const { url } = await uploadToBlob({ key, body: blob });
    return NextResponse.json({ url });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    console.error("workplace avatar upload failed", error);
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}
