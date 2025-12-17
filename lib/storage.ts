import { promises as fs } from "fs";
import os from "os";
import path from "path";

export type UploadPaths = {
  uploadDir: string;
  publicDir: string;
  exposureUrl: (filename: string) => string;
};

const baseUploadDirName = "proactivitis-uploads";

export async function getUploadPaths(): Promise<UploadPaths> {
  const useServerlessStorage =
    process.env.VERCEL === "1" || process.env.NEXT_RUNTIME === "edge" || process.env.NODE_ENV === "production";
  const uploadDir = useServerlessStorage
    ? path.join(os.tmpdir(), baseUploadDirName)
    : path.join(process.cwd(), "storage", "uploads");
  const publicDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true }).catch(() => undefined);
  await fs.mkdir(publicDir, { recursive: true }).catch(() => undefined);
  return {
    uploadDir,
    publicDir,
    exposureUrl: (filename: string) =>
      useServerlessStorage ? `/api/uploaded/${encodeURIComponent(filename)}` : `/uploads/${encodeURIComponent(filename)}`
  };
}

export async function readUploadedFile(filename: string) {
  const { uploadDir } = await getUploadPaths();
  const filePath = path.join(uploadDir, filename);
  return fs.readFile(filePath);
}
