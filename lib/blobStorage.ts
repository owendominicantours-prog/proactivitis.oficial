import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.BLOB_BUCKET;
const region = process.env.BLOB_REGION;
const accessKeyId = process.env.BLOB_ACCESS_KEY_ID;
const secretAccessKey = process.env.BLOB_SECRET_ACCESS_KEY;
const endpoint = process.env.BLOB_ENDPOINT;

function createS3Client() {
  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }
  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

const client = createS3Client();

export async function uploadToBlob(key: string, body: Buffer, contentType: string) {
  if (!client || !bucket) return null;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: "public-read"
    })
  );
  if (endpoint) {
    const url = `${endpoint.replace(/\/$/, "")}/${encodeURIComponent(key)}`;
    return url;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;
}

