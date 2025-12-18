import { put } from "@vercel/blob";

const token = process.env.BLOB_READ_WRITE_TOKEN;

type BlobBody = File | Blob | Buffer | ArrayBuffer | ArrayBufferView;

function toBuffer(body: BlobBody) {
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (body instanceof ArrayBuffer) {
    return Buffer.from(body);
  }
  if (ArrayBuffer.isView(body)) {
    return Buffer.from(body.buffer, body.byteOffset, body.byteLength);
  }
  return Buffer.from(body.arrayBuffer());
}

export async function uploadToBlob(key: string, body: BlobBody) {
  if (!token) return null;
  const buffer = await toBuffer(body);
  const { url } = await put(key, buffer, {
    access: "public",
    addRandomSuffix: true,
  });
  return url;
}
