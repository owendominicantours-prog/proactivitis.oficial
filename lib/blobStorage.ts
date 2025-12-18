import { put } from "@vercel/blob";

const token = process.env.BLOB_READ_WRITE_TOKEN;

export type UploadResult = { url: string; pathname: string };

export async function uploadToBlob(params: {
  key: string;
  body: File | Blob;
}): Promise<UploadResult> {
  if (!token) {
    throw new Error("Blob storage token is not configured");
  }
  const blob = await put(params.key, params.body, {
    access: "public",
    addRandomSuffix: true
  });

  return { url: blob.url, pathname: blob.pathname };
}
