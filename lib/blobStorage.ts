import { put } from "@vercel/blob";

const token = process.env.BLOB_READ_WRITE_TOKEN;

export async function uploadToBlob(key: string, body: BufferSource, contentType: string) {
  if (!token) return null;
  const { url } = await put(key, body, {
    access: "public",
    addRandomSuffix: true,
  });
  return url;
}
