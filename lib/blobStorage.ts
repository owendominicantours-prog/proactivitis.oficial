const projectId = process.env.BLOB_PROJECT_ID;
const token = process.env.BLOB_READ_WRITE_TOKEN;

export async function uploadToBlob(key: string, body: BufferSource, contentType: string) {
  if (!projectId || !token) return null;
  const url = `https://blob.vercel-storage.com/${projectId}/${encodeURIComponent(key)}`;
  await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
      "x-vercel-blob-cache-control": "public, max-age=31536000"
    },
    body
  });
  return url;
}
