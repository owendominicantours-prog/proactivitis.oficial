import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readUploadedFile } from "@/lib/storage";

export async function GET(request: NextRequest, context: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await context.params;
  if (!fileId) {
    return NextResponse.json({ error: "Archivo no especificado" }, { status: 400 });
  }
  try {
    const buffer = await readUploadedFile(fileId);
    const ext = path.extname(fileId).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".webp") {
      contentType = "image/webp";
    }
    const etag = `W/\"${fileId}-${buffer.length}\"`;

    if (request.headers.get("if-none-match") === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }

    return new NextResponse(buffer as unknown as ArrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        ETag: etag,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
